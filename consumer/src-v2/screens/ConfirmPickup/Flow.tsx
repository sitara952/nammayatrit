import React, { useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { location as LocationType } from '@/helpers/utils/Location/LocationTypes.gen';
import { transformSpecialLocationToLocation } from '@/helpers/utils/Location/LocationUtils.bs';
import { haversineDistance, mapWithUnit } from '@/helpers/utils/Utils.gen';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { getPlaceNameByEnum } from '@/api/apiTypes/GetPlaceNameApi.gen';
import AnimatedPickupMarker from '@/typescript/components/AnimatedPickupMarker';
import {
    DEFAULT_CAMERA_ZOOM,
    DEFAULT_CAMERA_ZOOM_CONFIRM_PICKUP,
    PICKUP_DISTANCE_THRESHOLD_IN_M,
} from '@/typescript/constants/common';

import {
    SearchInput,
    selectActiveInput,
    selectCurrentLocation,
    selectIsPickup,
    BottomSheetStage,
    setActiveInput,
    setBottomSheetStage,
    setStartLocationFromTextInput,
    updateSelectedStopLocationTextInput,
    updateSelectedSearchedStop,
    selectSelectedSearchedStop,
    selectSelectedStopIndex,
    selectDestinationIndex,
    setSearchedSource,
    selectSearchedSource,
    setOnRecenter,
    selectOnRecenter,
} from '@/typescript/state/client/session';
import { useRefsContext } from '@/typescript/context/RefsContext';

import { gatesInfoFull, hotSpotInfo } from '@/api/apiTypes/ServiceabilityApi.gen';
import { handleSpecialLocationOnMap, handleHotspotLocationsOnMap } from '@/typescript/utils/ConfirmPickupUtils';
import { ConfirmPickupView } from './UI';
import { createDispatcher, Resolver, calculateStraightLineDistance } from '@/typescript/utils/common';
import { ConfirmPickupScreenAction, PolylineCoordinates, DEFAULT_POLYLINE_COORDINATES } from './Types';
import { isLocValidCustomLocation } from '../../../src/typescript/utils/ConfirmPickupUtils';
import { CUSTOM_SPECIAL_ZONE_MARKER_ID, SPECIAL_ZONE_ID } from './Constants';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { ScrollView } from 'react-native-gesture-handler';
import { MapContext } from '@/typescript/Maps/MapContext.tsx';
import { selectCurrentRegion, selectMapIsMoved } from '@/typescript/state/client/maps';
import { EdgePadding } from 'react-native-maps';
import { Platform } from 'react-native';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';

// Pickup Instructions imports
import {
    usePickupInstructionsClosestGetQuery,
    usePickupInstructionsPostMutation,
} from '@/typescript/state/server/pickupInstructionsApi';
import {
    selectNewFeatureFlags,
    selectPickupInstructions,
    setPickupInstructions,
} from '@/typescript/state/client/session';

type ConfirmPickupProps = {
    addStaticMapPadding: ((params: Partial<EdgePadding>) => void) | undefined;
    isMultimodal: boolean;
};

const ConfirmPickup = (props: ConfirmPickupProps) => {
    const { mapRef } = useContext(MapContext);
    const configManager = useConfigContext();
    const reduxIsMapMoved = useAppSelector(state => {
        return selectMapIsMoved(state, mapRef.current?.mapId ?? null);
    });
    const reduxCurrentRegion = useAppSelector(state => {
        return selectCurrentRegion(state, mapRef.current?.mapId ?? null);
    });
    const themeColors = configManager.get('themeColors');
    const { stopLocationsTextInputRef, startLocationTextInputRef } = useRefsContext();
    const { addStaticMapPadding } = props;
    const scrollViewRef = useRef<ScrollView>(null);
    const source = useAppSelector(selectSearchedSource);
    const selectedStop = useAppSelector(selectSelectedSearchedStop);
    const selectedStopIndex = useAppSelector(selectSelectedStopIndex);
    const destinationIndex = useAppSelector(selectDestinationIndex);
    const activeInput = useAppSelector(selectActiveInput);
    const isPickup = useAppSelector(selectIsPickup);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const dispatch = useAppDispatch();
    const [selectedGateId, setSelectedGateId] = React.useState<undefined | string>(source?.placeId);
    const [selectedPickupLocation] = useState<undefined | Map<string, LocationType>>(new Map<string, LocationType>());
    const [flag, setFlag] = useState(false);
    const [regionLocation, setRegionLocation] = useState<LocationType | undefined>(undefined);
    const [currZoom, setCurrZoom] = useState(DEFAULT_CAMERA_ZOOM_CONFIRM_PICKUP);
    const { bottomSheetTopBannerRef } = useRefsContext();
    const [currentToMapCenterPolylineId] = useState('currentToMapCenterPolyline');
    const [lastDrawnPolylineCoordinates, setLastDrawnPolylineCoordinates] =
        useState<PolylineCoordinates>(DEFAULT_POLYLINE_COORDINATES);
    const [isPickupTooFar, setIsPickupTooFar] = useState(false);

    const { setAutoClearTimeout } = useAutoClearTimeout();

    // Pickup Instructions state and logic
    const [modalVisible, setModalVisible] = useState(false);
    const [displayedNote, setDisplayedNote] = useState('');
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

    // Get saved pickup instructions from session state
    const savedPickupInstructions = useAppSelector(selectPickupInstructions);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);

    // Fetch closest pickup instruction from backend
    const {
        data: closestInstructionData,
        error: fetchError,
        refetch,
    } = usePickupInstructionsClosestGetQuery(
        userLocation ? { lat: userLocation.lat, lon: userLocation.lon } : { lat: 0, lon: 0 },
        {
            skip: !userLocation || !isPickup || !newFeatureFlags.enablePickupInstructions,
        },
    );

    // Post pickup instructions to backend
    const [postPickupInstructions] = usePickupInstructionsPostMutation();

    // ALWAYS KEEP THIS AT TOP !!!!
    useLayoutEffect(() => {
        if (addStaticMapPadding) {
            addStaticMapPadding({
                left: 0,
                top: 0,
                right: 0,
                bottom: 200,
            });
        }
    }, []);

    useEffect(() => {
        if (isPickup && source && currentLocation) {
            const { lat: sourceLat, lng: sourceLng } = source;
            const { lat: currentLat, lng: currentLng } = currentLocation;

            if (
                sourceLat !== undefined &&
                sourceLng !== undefined &&
                currentLat !== undefined &&
                currentLng !== undefined
            ) {
                const isDistanceTooFar =
                    haversineDistance(sourceLat, sourceLng, currentLat, currentLng) * 1000 >
                    PICKUP_DISTANCE_THRESHOLD_IN_M;
                setIsPickupTooFar(isDistanceTooFar);
            }
        }
    }, [isPickup, source, currentLocation]);

    const handleMarkerClick = (gateInfo: gatesInfoFull | undefined) => {
        if (gateInfo) {
            handleSpecialLocClick(gateInfo.id);
            setSelectedGateId(gateInfo.id);
        }
    };

    const handleHotspotMarkerClick = (hotspotInfo: hotSpotInfo | undefined) => {
        if (hotspotInfo) {
            getAsyncSourceLocation(
                SearchInput.Source,
                hotspotInfo.centroidLatLong?.lat,
                hotspotInfo.centroidLatLong?.lon,
            );

            setAutoClearTimeout(() => {
                mapRef.current?.animateCamera({
                    lat: hotspotInfo.centroidLatLong?.lat,
                    lon: hotspotInfo.centroidLatLong?.lon,
                    zoom: DEFAULT_CAMERA_ZOOM,
                    duration: 0,
                });
            }, 200);
        }
    };

    const [customPickupZoneGate, setCustomPickupZoneGate] = useState<LocationType | undefined>(undefined);
    useEffect(() => {
        requestAnimationFrame(() => {
            animateCameraToLocateOnMap();
        });

        return () => {
            if (mapRef.current) {
                mapRef.current.removeAllMarkers();
                mapRef.current.removeAllZone();
                mapRef.current.removeMarker(CUSTOM_SPECIAL_ZONE_MARKER_ID);
            }
        };
    }, [isPickup]);

    useEffect(() => {
        // if (addStaticMapPadding) addStaticMapPadding({ left: 0, top: 0, right: 0, bottom: 1 });

        return () => {
            if (mapRef.current) {
                mapRef.current.removeAllZone();
                mapRef.current.removeMarker(CUSTOM_SPECIAL_ZONE_MARKER_ID);
                mapRef.current.removeAllMarkers();
                mapRef.current?.addStaticMapPadding({ left: 0, top: 0, right: 0, bottom: 0 });
            }
        };
    }, [addStaticMapPadding]);

    useEffect(() => {
        mapRef.current?.setCurrentLocationMarkerVisibility(true);
        mapRef.current?.removeNearbyMarkers();
    }, []);

    const extractAndTransformLocations = useCallback((): [boolean, LocationType[]] => {
        const locationSource = isPickup ? source : selectedStop;
        const fallbackLocation = currentLocation;

        if (locationSource?.specialLocation && !props.isMultimodal) {
            return [
                true,
                transformSpecialLocationToLocation(locationSource.specialLocation, locationSource.serviceabilityCity),
            ];
        }

        if (locationSource) {
            return [false, [locationSource]];
        }

        if (fallbackLocation?.specialLocation && !props.isMultimodal) {
            return [
                true,
                transformSpecialLocationToLocation(
                    fallbackLocation.specialLocation,
                    fallbackLocation.serviceabilityCity,
                ),
            ];
        }

        if (fallbackLocation) {
            return [false, [fallbackLocation]];
        }

        return [false, []];
    }, [isPickup, source, selectedStop, currentLocation]);

    const [isSpecialLocation, locationList] = useMemo(() => {
        return extractAndTransformLocations();
    }, [extractAndTransformLocations]);

    // Pickup Instructions useEffect hooks and callbacks - defined after locationList is available

    // Reset displayedNote when component mounts
    useEffect(() => {
        console.info('SAM_DEBUG: ConfirmPickup - Resetting displayedNote on mount');
        setDisplayedNote('');
    }, []);

    // Get current location for API calls
    useEffect(() => {
        if (isPickup && locationList.length > 0 && locationList[0]) {
            const location = locationList[0];
            if (location.lat !== undefined && location.lng !== undefined) {
                const newLocation = { lat: location.lat, lon: location.lng };

                // Only update if coordinates have changed significantly (>5 meters) to avoid GPS drift
                if (!userLocation) {
                    console.info('🚗 ConfirmPickup: Setting initial userLocation:', newLocation);
                    setUserLocation(newLocation);
                } else {
                    const distance =
                        haversineDistance(userLocation.lat, userLocation.lon, newLocation.lat, newLocation.lon) * 1000; // Convert to meters

                    if (distance > 5) {
                        // Only update if moved more than 5 meters
                        console.info('🚗 ConfirmPickup: Significant location change, updating userLocation:', {
                            oldLocation: userLocation,
                            newLocation,
                            distanceMeters: distance.toFixed(2),
                        });
                        setUserLocation(newLocation);
                    } else {
                        console.info('🚗 ConfirmPickup: Ignoring small GPS drift:', {
                            currentLocation: userLocation,
                            newLocation,
                            distanceMeters: distance.toFixed(2),
                        });
                    }
                }
            }
        }
    }, [isPickup, locationList, userLocation]);

    // Log any fetch errors
    useEffect(() => {
        if (fetchError) {
            console.error('🚗 ConfirmPickup: Error fetching pickup instructions:', fetchError);
        }
    }, [fetchError]);

    // Set displayedNote when backend instructions are fetched
    useEffect(() => {
        if (closestInstructionData?.instruction) {
            console.info('SAM_DEBUG: Setting displayedNote from backend:', closestInstructionData.instruction);
            setDisplayedNote(closestInstructionData.instruction);
        } else {
            console.info('SAM_DEBUG: No backend instructions found, clearing displayedNote');
            setDisplayedNote('');
        }
    }, [closestInstructionData]);

    // Track changes to displayedNote
    useEffect(() => {
        console.info('SAM_DEBUG: ConfirmPickup state updated:', {
            displayedNote,
            canEdit: true,
        });
    }, [displayedNote]);

    // Pickup Instructions business logic functions
    const handleSaveToBackend = useCallback(
        async (instruction: string) => {
            try {
                if (!userLocation) return;

                console.info('🚗 ConfirmPickup: Saving pickup instruction to backend:', {
                    instruction,
                    lat: userLocation.lat,
                    lon: userLocation.lon,
                    isPickup,
                });

                const result = await postPickupInstructions({
                    lat: userLocation.lat,
                    lon: userLocation.lon,
                    instruction: instruction.trim(),
                    file: undefined,
                }).unwrap();

                console.info('🚗 ConfirmPickup: Successfully saved pickup instruction to backend:', result);
            } catch (error) {
                console.error('🚗 ConfirmPickup: Error saving pickup instruction to backend:', error);
            }
        },
        [userLocation, postPickupInstructions, isPickup],
    );

    const handleAddNote = useCallback(
        (note: string) => {
            if (note.trim()) {
                console.info('SAM_DEBUG: ConfirmPickup setting displayedNote to:', note.trim());
                setDisplayedNote(note);
                // Save pickup instructions to user session if this is pickup
                if (isPickup) {
                    console.info('SAM_DEBUG: ConfirmPickup saving note:', {
                        note: note.trim(),
                        isPickup,
                        savedPickupInstructions,
                    });
                    dispatch(setPickupInstructions(note.trim()));
                } else {
                    // For drop location, just display the note
                    console.info('🚗 ConfirmPickup: Saving drop instructions locally:', {
                        note: note.trim(),
                        isPickup,
                    });
                }
            }
        },
        [isPickup, savedPickupInstructions, dispatch],
    );

    const handleModalVisibilityChange = useCallback(
        (visible: boolean) => {
            setModalVisible(visible);
            if (visible && userLocation) {
                console.info('SAM_DEBUG: Modal opened, refetching instructions');
                setTimeout(() => {
                    refetch();
                }, 100);
            }
        },
        [userLocation, refetch],
    );

    const handleAudioRecordingComplete = useCallback(
        async (filePath: string) => {
            console.info('SAM_DEBUG: ConfirmPickup - Audio recording completed:', filePath);

            try {
                setModalVisible(false);

                // Update displayedNote to show location-specific text
                const locationName =
                    locationList.length > 0 && locationList[0]?.title ? locationList[0].title : 'Audio Note';
                handleAddNote(locationName);

                // Force refetch to get fresh data including the new audio
                console.info('SAM_DEBUG: ConfirmPickup - Forcing refetch after audio upload');
                await refetch();

                console.info('SAM_DEBUG: ConfirmPickup - Refetch completed, fresh data should be available');
            } catch (error) {
                console.error('SAM_DEBUG: ConfirmPickup - Error during post-audio refetch:', error);
            }
        },
        [locationList, handleAddNote, refetch],
    );

    // Add custom marker/mapPin on map
    useEffect(() => {
        if (reduxIsMapMoved) {
            mapRef.current?.removeAllPolylines();
        }
        if (mapRef.current) {
            mapRef.current.changeAutoAnimationToCurrentLocation(false);
            mapRef.current.setCenterView(() => (
                <AnimatedPickupMarker
                    isMoved={reduxIsMapMoved}
                    markerRingColor={isSpecialLocation ? '#14A255' : themeColors.APP_THEME_COLOR}
                />
            ));
        }
        return () => {
            if (mapRef.current) {
                mapRef.current?.changeAutoAnimationToCurrentLocation(true);
                mapRef.current?.setCenterView(() => <></>);
            }
        };
    }, [reduxIsMapMoved, isSpecialLocation]);

    useEffect(() => {
        const locationValue = regionLocation
            ? regionLocation
            : isPickup
              ? (source ?? currentLocation ?? undefined)
              : (selectedStop ?? currentLocation ?? source ?? undefined);

        // Map over location value if it exists
        mapWithUnit(locationValue, src => {
            const { lat, lng, specialLocation, hotSpotInfo } = src;
            if (lat !== undefined && lng !== undefined) {
                const isLocValidForCustomLocation =
                    specialLocation?.locationType === 'Open' && isLocValidCustomLocation(specialLocation, lat, lng);
                const enableAutoMapping =
                    specialLocation?.locationType === 'Closed' || specialLocation?.locationType === undefined
                        ? true
                        : !isLocValidForCustomLocation;

                if (specialLocation && !props.isMultimodal) {
                    if (isLocValidForCustomLocation) {
                        setCustomPickupZoneGate({ ...src, placeId: SPECIAL_ZONE_ID });
                        setSelectedGateId(SPECIAL_ZONE_ID);
                        handleSpecialLocationOnMap(
                            specialLocation,
                            lat,
                            lng,
                            mapRef,
                            setSelectedGateId,
                            selectedGateId,
                            setFlag,
                            bottomSheetTopBannerRef,
                            enableAutoMapping,
                            handleMarkerClick,
                            setCurrZoom,
                        );
                    } else {
                        setCustomPickupZoneGate(undefined);
                        handleSpecialLocationOnMap(
                            specialLocation,
                            lat,
                            lng,
                            mapRef,
                            setSelectedGateId,
                            selectedGateId,
                            setFlag,
                            bottomSheetTopBannerRef,
                            enableAutoMapping,
                            handleMarkerClick,
                            setCurrZoom,
                        );
                    }
                } else if (hotSpotInfo && hotSpotInfo.length > 0 && isPickup) {
                    handleHotspotLocationsOnMap(hotSpotInfo, lat, lng, mapRef, handleHotspotMarkerClick);
                } else {
                    bottomSheetTopBannerRef.current = false;
                    setCustomPickupZoneGate(undefined);
                }
            }
            // Update ride search context with the new location
            if (isPickup) {
                dispatch(setSearchedSource(src));
            } else {
                dispatch(updateSelectedSearchedStop(src));
            }
        });
        return () => {};
    }, [regionLocation]);
    const latestFetchSrcDestRef = useRef(-10000000);

    const fetchLocationObject = async (
        lat: number,
        lon: number,
        mode: 'source' | 'destination',
    ): Promise<LocationType> => {
        const placeNameRequest: getPlaceNameByEnum = {
            TAG: 'PlaceByLatLon',
            _0: {
                contents: { lat, lon },
                tag: '',
            },
        };
        const result = await GetLocationAndServiceability.getLocationObjectAndServiceability(
            placeNameRequest,
            undefined,
            undefined,
            undefined,
            mode,
        );
        return result.location;
    };
    const onRecenter = useAppSelector(selectOnRecenter);

    const getAsyncSourceLocation = async (
        activeInputElement: SearchInput,
        lat: number | undefined,
        lng: number | undefined,
    ) => {
        if (lat === undefined || lng === undefined) return;
        const curId = latestFetchSrcDestRef.current;
        const currentRegionLocation = await fetchLocationObject(
            lat,
            lng,
            activeInputElement === SearchInput.Source ? 'source' : 'destination',
        );
        if (curId === latestFetchSrcDestRef.current) setRegionLocation(currentRegionLocation);
    };

    useEffect(() => {
        if (onRecenter) {
            setCustomPickupZoneGate(undefined);
            if (currentLocation) setRegionLocation(currentLocation);
            dispatch(setOnRecenter(false));
        }
    }, [onRecenter, currentLocation]);

    const isFirstRender = useRef(true);

    useEffect(() => {
        const condition = isFirstRender.current ? reduxIsMapMoved : mapRef.current?.currentRegion.current.isGesture;

        dispatch(setOnRecenter(false));

        if (condition) {
            isFirstRender.current = false;
            const currentRegionlat = mapRef.current?.currentRegion.current.region.latitude;
            const currentRegionlng = mapRef.current?.currentRegion.current.region.longitude;

            // Draw a dotted polyline from current location to map center
            const sourceLocation = currentLocation;
            if (
                sourceLocation &&
                sourceLocation.lat !== undefined &&
                sourceLocation.lng !== undefined &&
                currentRegionlat !== undefined &&
                currentRegionlng !== undefined
            ) {
                // Calculate the distance between source and destination using the utility function
                const distance = calculateStraightLineDistance(
                    sourceLocation.lat,
                    sourceLocation.lng,
                    currentRegionlat,
                    currentRegionlng,
                );

                // Only draw the polyline if the distance is less than 200 meters
                if (distance <= 200 && Platform.OS === 'android') {
                    // Check if we need to redraw the polyline (coordinates changed)
                    const startChanged =
                        lastDrawnPolylineCoordinates.start?.lat !== sourceLocation.lat ||
                        lastDrawnPolylineCoordinates.start?.lng !== sourceLocation.lng;
                    const endChanged =
                        lastDrawnPolylineCoordinates.end?.lat !== currentRegionlat ||
                        lastDrawnPolylineCoordinates.end?.lng !== currentRegionlng;

                    if (startChanged || endChanged) {
                        // Save the current coordinates
                        setLastDrawnPolylineCoordinates({
                            start: { lat: sourceLocation.lat, lng: sourceLocation.lng },
                            end: { lat: currentRegionlat, lng: currentRegionlng },
                        });

                        // Draw the polyline
                        mapRef.current?.addPolyline({
                            coordinates: [
                                { latitude: sourceLocation.lat, longitude: sourceLocation.lng },
                                { latitude: currentRegionlat, longitude: currentRegionlng },
                            ],
                            id: currentToMapCenterPolylineId,
                            visible: true,
                            strokeColor: themeColors.APP_THEME_COLOR,
                            strokeColors: undefined,
                            strokeWidth: 6,
                            lineDashPattern: [5, 2, 3, 2],
                            extendPath: false,
                        });
                    }
                } else {
                    // Distance is more than 200 meters, remove any existing polyline
                    mapRef.current?.removeAllPolylines();
                    setLastDrawnPolylineCoordinates(DEFAULT_POLYLINE_COORDINATES);
                }
            }
            ++latestFetchSrcDestRef.current;
            getAsyncSourceLocation(activeInput, currentRegionlat, currentRegionlng);
        } else {
            mapRef.current?.removeAllPolylines();
            setLastDrawnPolylineCoordinates(DEFAULT_POLYLINE_COORDINATES);
        }
    }, [reduxCurrentRegion.region, reduxCurrentRegion.isGesture, reduxIsMapMoved]);

    // Clean up the polyline when component unmounts or when dependencies change
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current?.removeAllPolylines();
            }
        };
    }, [currentToMapCenterPolylineId]);

    const currentLocationData = async (selectedGateId: string, selectedGate: gatesInfoFull) => {
        if (selectedPickupLocation?.has(selectedGateId)) {
            return selectedPickupLocation.get(selectedGateId);
        } else {
            const data = await fetchLocationObject(
                selectedGate.point.lat,
                selectedGate.point.lon,
                isPickup === true ? 'source' : 'destination',
            );
            const currentSelectedPickupLocation =
                selectedPickupLocation === undefined ? new Map<string, LocationType>() : selectedPickupLocation;
            // eslint-disable-next-line functional/immutable-data
            currentSelectedPickupLocation.set(selectedGateId, data);
            return data;
        }
    };

    const transformGatesInfoFullToLocation = (
        selectedGate: gatesInfoFull,
        currentLoc: LocationType | undefined,
        locationObj: LocationType,
    ): LocationType => {
        return {
            title: selectedGate.name ? selectedGate.name : undefined,
            subtitle: selectedGate.address ? selectedGate.address : '',
            lat: selectedGate.point.lat ? selectedGate.point.lat : undefined,
            lng: selectedGate.point.lon ? selectedGate.point.lon : undefined,
            specialLocation: isPickup
                ? (source?.specialLocation ?? undefined)
                : (selectedStop?.specialLocation ?? undefined),
            placeId: undefined,
            tag: 'AUTOCOMPLETE',
            addressComponents: currentLoc?.addressComponents,
            serviceable: true,
            serviceabilityCity: locationObj.serviceabilityCity,
            formattedAddress: selectedGate.address ? selectedGate.address : currentLoc?.formattedAddress,
            locationType: isPickup ? (source?.locationType ?? undefined) : (selectedStop?.locationType ?? undefined),
            distanceFromCurrentLocation: isPickup
                ? (source?.distanceFromCurrentLocation ?? undefined)
                : (selectedStop?.distanceFromCurrentLocation ?? undefined),
            hotSpotInfo: locationObj.hotSpotInfo ?? [],
        };
    };
    //Auto traceability to special locations gates
    React.useEffect(() => {
        const locationObj = isPickup ? source : selectedStop;
        if (selectedGateId && locationObj) {
            const specialLocation = locationObj.specialLocation;
            if (specialLocation) {
                if (selectedGateId === SPECIAL_ZONE_ID && customPickupZoneGate?.lat && customPickupZoneGate?.lng) {
                    mapRef.current?.animateCamera({
                        lat: customPickupZoneGate?.lat,
                        lon: customPickupZoneGate?.lng,
                        zoom: currZoom,
                        duration: 0,
                    });
                    if (customPickupZoneGate) {
                        if (isPickup) {
                            dispatch(setSearchedSource(customPickupZoneGate));
                        } else {
                            dispatch(updateSelectedSearchedStop(customPickupZoneGate));
                        }
                    }
                } else {
                    const selectedGate = specialLocation.gatesInfo.find(gate => gate.id === selectedGateId);
                    const updateLocation = async () => {
                        if (selectedGate) {
                            setAutoClearTimeout(() => {
                                mapRef.current?.animateCamera({
                                    lat: selectedGate.point.lat,
                                    lon: selectedGate.point.lon,
                                    zoom: currZoom,
                                    duration: 0,
                                });
                            }, 0);
                            const currentLoc = await currentLocationData(selectedGateId, selectedGate);
                            const newLocation: LocationType = transformGatesInfoFullToLocation(
                                selectedGate,
                                currentLoc,
                                locationObj,
                            );
                            if (isPickup) {
                                dispatch(setSearchedSource(newLocation));
                            } else {
                                dispatch(updateSelectedSearchedStop(newLocation));
                            }
                        }
                    };
                    updateLocation();
                }
            }
        }
        // return () => {
        //     console.log('cleanup');
        //     mapRef.current?.addStaticMapPadding({
        //         left: undefined,
        //         top: undefined,
        //         right: undefined,
        //         bottom: 0,
        //     });
        // };
    }, [selectedGateId, flag]);

    const animateCameraToLocateOnMap = () => {
        if (isPickup) {
            dispatch(setActiveInput(SearchInput.Source));
            if (source) {
                const { lat, lng } = source;
                if (source.specialLocation && !props.isMultimodal && lat && lng) {
                    const enableAutoMapping = true;
                    handleSpecialLocationOnMap(
                        source.specialLocation,
                        lat,
                        lng,
                        mapRef,
                        setSelectedGateId,
                        selectedGateId,
                        setFlag,
                        bottomSheetTopBannerRef,
                        enableAutoMapping,
                        handleMarkerClick,
                        setCurrZoom,
                    );
                }
                setAutoClearTimeout(() => {
                    setRegionLocation(source);
                }, 100);
                if (lat !== undefined && lng !== undefined && !source.specialLocation) {
                    setAutoClearTimeout(() => {
                        mapRef.current?.animateCamera({
                            lat,
                            lon: lng,
                            zoom: DEFAULT_CAMERA_ZOOM,
                            duration: 100,
                        });
                    }, 200);
                }
            } else {
                if (currentLocation) {
                    const { lat, lng } = currentLocation;
                    setAutoClearTimeout(() => {
                        setRegionLocation(currentLocation);
                    }, 100);
                    if (lat !== undefined && lng !== undefined && !currentLocation.specialLocation) {
                        setAutoClearTimeout(() => {
                            mapRef.current?.animateCamera({
                                lat,
                                lon: lng,
                                zoom: DEFAULT_CAMERA_ZOOM,
                                duration: 0,
                            });
                        }, 200);
                    }
                }
            }
        } else {
            dispatch(setActiveInput(SearchInput.Destination));
            if (selectedStop) {
                const { lat, lng } = selectedStop;
                if (!props.isMultimodal && selectedStop.specialLocation && lat && lng) {
                    const enableAutoMapping = true;
                    handleSpecialLocationOnMap(
                        selectedStop.specialLocation,
                        lat,
                        lng,
                        mapRef,
                        setSelectedGateId,
                        selectedGateId,
                        setFlag,
                        bottomSheetTopBannerRef,
                        enableAutoMapping,
                        handleMarkerClick,
                        setCurrZoom,
                    );
                }
                setAutoClearTimeout(() => {
                    setRegionLocation(selectedStop);
                }, 100);
                setAutoClearTimeout(() => {
                    mapRef.current?.animateCamera({
                        lat,
                        lon: lng,
                        zoom: DEFAULT_CAMERA_ZOOM,
                        duration: 100,
                    });
                }, 400);
            } else if (currentLocation) {
                const { lat, lng } = currentLocation;
                setAutoClearTimeout(() => {
                    setRegionLocation(currentLocation);
                }, 100);
                if (lat && lng && !currentLocation.specialLocation) {
                    setAutoClearTimeout(() => {
                        mapRef.current?.animateCamera({
                            lat,
                            lon: lng,
                            zoom: DEFAULT_CAMERA_ZOOM,
                            duration: 100,
                        });
                    }, 400);
                }
            }
        }
    };

    const handleSpecialLocClick = (selectedGateId: string | undefined) => {
        if (selectedGateId !== SPECIAL_ZONE_ID) setCustomPickupZoneGate(undefined);

        const locationValue = isPickup
            ? (source ?? currentLocation ?? undefined)
            : (selectedStop ?? currentLocation ?? source ?? undefined);

        if (locationValue !== undefined) {
            const { lat, lng, specialLocation } = locationValue;
            if (specialLocation && !props.isMultimodal && lat && lng) {
                handleSpecialLocationOnMap(
                    specialLocation,
                    lat,
                    lng,
                    mapRef,
                    setSelectedGateId,
                    selectedGateId,
                    setFlag,
                    bottomSheetTopBannerRef,
                    true,
                    handleMarkerClick,
                    setCurrZoom,
                );
            }
        }
    };

    const updateSourceAndDestination = useCallback(() => {
        dispatch(setSearchedSource(source));
        if (selectedStop) {
            dispatch(updateSelectedSearchedStop(selectedStop));
        } else {
            dispatch(updateSelectedSearchedStop(null));
        }
        dispatch(setStartLocationFromTextInput((source?.title ?? '') + (source?.subtitle ?? '')));
        dispatch(updateSelectedStopLocationTextInput((selectedStop?.title ?? '') + (selectedStop?.subtitle ?? '')));
    }, [selectedStop, source]);

    const onClickSource = useCallback(() => {
        mapRef.current?.removeRoute('defaultRoute');
        updateSourceAndDestination();
        dispatch(setActiveInput(SearchInput.Source));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'cfrmPckup_onClickSource' }));
        startLocationTextInputRef.current?.setSelection(
            0,
            ((source?.title ?? '') + (source?.subtitle ?? '')).length + 1,
        );
        startLocationTextInputRef.current?.focus();
    }, [updateSourceAndDestination, source?.title, source?.subtitle]);

    const onClickDestination = useCallback(() => {
        mapRef.current?.removeRoute('defaultRoute');
        updateSourceAndDestination();
        dispatch(setActiveInput(SearchInput.Destination));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'cfrmPckup_onClickDestination' }));
        stopLocationsTextInputRef.current?.[selectedStopIndex]?.setSelection(
            0,
            ((selectedStop?.title ?? '') + (selectedStop?.subtitle ?? '')).length + 1,
        );
        startLocationTextInputRef.current?.focus();
    }, [updateSourceAndDestination, selectedStop?.title, selectedStop?.subtitle, selectedStopIndex]);

    const handleLocationClick = useCallback(() => {
        if (isPickup) {
            onClickSource();
        } else {
            onClickDestination();
        }
    }, [onClickSource, onClickDestination, isPickup]);

    useEffect(() => {
        const index = locationList.findIndex(item => item.placeId === selectedGateId);

        if (index !== -1) {
            scrollViewRef.current?.scrollTo({ y: index * 74, animated: true });
        }
        // Custom special Zone Case
        if (selectedGateId === SPECIAL_ZONE_ID) {
            setAutoClearTimeout(() => {
                scrollViewRef.current?.scrollToEnd();
            }, 1000);
        }
    }, [selectedGateId]);

    const resolver: Resolver<ConfirmPickupScreenAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'LOCATION_CARD_CLICKED': {
                    const placeId = action.payload?.placeId;
                    if (isSpecialLocation) {
                        handleSpecialLocClick(placeId);
                        setSelectedGateId(placeId);
                    } else {
                        handleLocationClick();
                        setSelectedGateId(undefined);
                    }
                    break;
                }
                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [handleLocationClick, handleSpecialLocClick, isSpecialLocation],
    );

    const cpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const localState = useMemo(
        () => ({
            isPickup,
            selectedStopIndex,
            destinationIndex,
            scrollViewRef,
            locationList,
            isSpecialLocation,
            selectedGateId,
            setCustomPickupZoneGate,
            customPickupZoneGate,
            cpDispatch,
            isPickupTooFar,
            reduxDispatch: dispatch,
            // Pickup Instructions props
            displayedNote,
            modalVisible,
            userLocation,
            closestInstructionData,
            canEdit: true, // Always true for ConfirmPickup flow
            enablePickupInstructions: newFeatureFlags.enablePickupInstructions,
            pickupInstructionsCharLimit: newFeatureFlags.pickupInstructionsCharLimit,
            onModalVisibilityChange: handleModalVisibilityChange,
            onAddNote: handleAddNote,
            onSaveToBackend: handleSaveToBackend,
            onAudioRecordingComplete: handleAudioRecordingComplete,
        }),
        [
            isPickup,
            selectedStopIndex,
            destinationIndex,
            locationList,
            isSpecialLocation,
            selectedGateId,
            setCustomPickupZoneGate,
            customPickupZoneGate,
            cpDispatch,
            isPickupTooFar,
            // Pickup Instructions dependencies
            displayedNote,
            modalVisible,
            userLocation,
            closestInstructionData,
            newFeatureFlags.enablePickupInstructions,
            newFeatureFlags.pickupInstructionsCharLimit,
            handleModalVisibilityChange,
            handleAddNote,
            handleSaveToBackend,
            handleAudioRecordingComplete,
        ],
    );

    return <ConfirmPickupView {...localState} />;
};

export default React.memo(ConfirmPickup);
