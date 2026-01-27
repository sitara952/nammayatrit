import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTrackVehiclesGetQuery } from '@/api/integrations/rtk/TrackVehiclesGet';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import BottomSheet, { BottomSheetFlatListMethods, BottomSheetModal } from '@gorhom/bottom-sheet';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { capitalize, isUndefined } from 'lodash';
import useLiveTracking from '../../../../src/typescript/hooks/useLiveTracking';
import { TrackedEntity, PathConfig, StaticMarker } from '@/typescript/tracking/trackingTypes';
import { SingleModeTicketBookingAction } from '../SingleModeTicketBooking/Types';
import { useFrfsRouteData } from '../SingleModeTicketBooking/hooks/useFrfsRouteData';
import { BusTrackingAction, BusTrackingRouteProps, BusConfirmInfo } from './Types';
import BusTrackingScreen from './UI';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { selectToken } from '@/typescript/state/client/auth.ts';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';
import { useMultimodalRouteAvailabilityPostMutation } from '@/api/integrations/rtk/MultimodalRouteAvailabilityPost';

import { sortRoutes } from '@/typescript/utils/MultiModal';
import { LatLng } from 'react-native-maps';
import { selectMapIsMoved } from '@/typescript/state/client/maps';
import { selectAppName } from '@/typescript/state/client/session';
import {
    getBusesEtaInfo,
    getNearestBusCoordinates,
    EnhancedBusEtaInfo,
    getBusVariantonServiceTierCaption,
    getBusVariantonServiceTier,
    getBusDestinationTime,
} from '../../utils/busTrackingUtils';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';
import { BusStopCalloutCard } from './components/BusStopCalloutCard';
import { ArrivingVehicle, buildStopToVehiclesMap } from './utils';

export const BusTrackingFlow = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<{ params: BusTrackingRouteProps }, 'params'>>();
    const {
        routeCode,
        vehicleType,
        fromJourneyInfoScreen,
        fromSingleModeSearch,
        destinationStop,
        sourceStop,
        onBusRouteSwitch,
        journeyId,
        legOrder,
    } = route.params;

    const bottomSheetFlatListRef = useRef<BottomSheetFlatListMethods>(null);
    const vehiclePositionsRef = useRef<Record<string, Record<string, number>>>({});
    const [availableRoutesApi, { data: availableRoutesData }] = useMultimodalRouteAvailabilityPostMutation();

    const [currentSelectedRoute, setCurrentSelectedRoute] = useState<string | undefined>(routeCode);
    const [showBusConfirmPopup, setShowBusConfirmPopup] = useState(false);
    const detailedTrackingModalRef = useRef<BottomSheetModal>(null);
    const mainSheetRef = useRef<BottomSheet>(null);
    const confirmModalRef = useRef<BottomSheetModal>(null);
    const [busConfirmInfo, setBusConfirmInfo] = useState<BusConfirmInfo | null>(null);
    const [selectedBusVehicleId, setSelectedBusVehicleId] = useState<string | undefined>(undefined);

    const [isDetailedTrackingOpen, setIsDetailedTrackingOpen] = useState(false);
    const sortedRoutes = useMemo(() => {
        const transformedRoutes = availableRoutesData?.availableRoutes?.map(route => ({
            ...route,
            serviceTierName:
                route.serviceTierName ?? capitalize(route.serviceTierType?.split('_').join(' ')).replace('Ac', 'AC'),
        }));

        if (!transformedRoutes) return undefined;

        // Filter for distinct routes based on routeCode using functional approach
        const distinctRoutes = transformedRoutes.filter(
            (route, index, array) => array.findIndex(r => r.routeCode === route.routeCode) === index,
        );

        return sortRoutes({ availableRoutes: distinctRoutes });
    }, [availableRoutesData]);
    // Fetch route data
    const isMapDragged = useAppSelector(state => selectMapIsMoved(state, 'BusTrackingMap'));
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const appName = useAppSelector(selectAppName);

    // Dummy data hook
    // Fetch route data (only when not using dummy data)
    const {
        routeStops: fetchedRouteStops,
        waypoints: fetchedWaypoints,
        sourceCode: fetchedSourceCode,
        routeShortName: fetchedRouteShortName,
    } = useFrfsRouteData({
        routeCode: currentSelectedRoute || '',
        vehicleType,
        city: appName === 'odishaYatri' ? 'Bhubaneshwar' : 'Chennai', //change to city from route
        skip: false,
    });

    // Use provided route stops or fetched ones
    const routeStops = useMemo(() => {
        const stops = fetchedRouteStops || [];
        // eslint-disable-next-line functional/immutable-data
        return stops.sort((a, b) => a.sequenceNum - b.sequenceNum);
    }, [fetchedRouteStops]);

    const sourceCode = useMemo(() => {
        return fromSingleModeSearch ? fetchedSourceCode : sourceStop?.code;
    }, [fromSingleModeSearch, fetchedSourceCode, sourceStop]);

    // Make enhancedSourceStop available before using in other hooks
    const enhancedSourceStop = useMemo(() => {
        if (!routeStops || !Array.isArray(routeStops) || !sourceCode) return undefined;
        return routeStops.find(stop => stop.stopCode === sourceCode);
    }, [routeStops, sourceCode]);

    // Use provided waypoints or fetched ones
    const waypoints = useMemo(() => {
        return fetchedWaypoints;
    }, [fetchedWaypoints]);

    const stops = useMemo(() => {
        if (!routeStops || !Array.isArray(routeStops)) return [];
        return routeStops.map(stop => ({
            id: stop.stopCode || `stop_${Date.now()}`,
            name: stop.stopName || 'Unknown Stop',
            coordinate: {
                latitude: stop.lat || 0,
                longitude: stop.lon || 0,
            },
        }));
    }, [routeStops]);

    const waypointsWithFallback = useMemo(() => {
        return waypoints && waypoints.length > 1
            ? waypoints.map(wp => ({
                  latitude: wp.lat || 0,
                  longitude: wp.lon || 0,
              }))
            : stops.map(stop => ({
                  latitude: stop.coordinate.latitude,
                  longitude: stop.coordinate.longitude,
              }));
    }, [waypoints, stops]);

    const { data: trackVehiclesData } = useTrackVehiclesGetQuery(
        {
            routeCode: currentSelectedRoute || '',
            vehicleType: vehicleType,
            platformType: 'MULTIMODAL',
            currentLat: currentLocationCoords?.coords?.latitude,
            currentLon: currentLocationCoords?.coords?.longitude,
            selectedSourceStopCode: enhancedSourceStop ? enhancedSourceStop.stopCode : undefined,
            selectedDestinationStopCode: stops[stops.length - 1]?.id,
        },
        {
            pollingInterval: 5000,
            skip: !currentSelectedRoute || !enhancedSourceStop || !stops[stops.length - 1]?.id, // Skip if no route code or source stop or destination stop
        },
    );

    const stopVehicleMap: Map<string, ArrivingVehicle[]> = useMemo(() => {
        if (!trackVehiclesData) return new Map();
        return buildStopToVehiclesMap(trackVehiclesData);
    }, [trackVehiclesData]);

    const onVehicleClick = useCallback((markerId: string) => {
        setSelectedBusVehicleId(markerId);
    }, []);

    // State for managing map readiness
    // const [isMapReady, setIsMapReady] = useState(false);

    // Create stable route ID to avoid path/entity ID mismatches
    const stableRouteId = useMemo(() => routeCode || 'default-route', [routeCode]);

    // Transform bus route data to useLiveTracking format
    const paths: PathConfig[] = useMemo(
        () => [
            {
                id: stableRouteId,
                coordinates: waypointsWithFallback,
                style: {
                    strokeColor: '#F8CD4D',
                    strokeWidth: 8,
                },
                highlightUntil:
                    enhancedSourceStop && !isUndefined(enhancedSourceStop.lat) && !isUndefined(enhancedSourceStop.lon)
                        ? { latitude: enhancedSourceStop.lat, longitude: enhancedSourceStop.lon }
                        : undefined,
            },
        ],
        [stableRouteId, waypointsWithFallback, enhancedSourceStop],
    );

    // Transform stops to static markers - including all stops, plus special markers for start, end, and source stops
    const staticMarkers: StaticMarker[] = useMemo(() => {
        // Create source stop marker if available
        const sourceStopMarker =
            enhancedSourceStop && !isUndefined(enhancedSourceStop.lat) && !isUndefined(enhancedSourceStop.lon)
                ? [
                      {
                          id: `source-stop-${enhancedSourceStop.stopCode}`,
                          location: {
                              latitude: enhancedSourceStop.lat,
                              longitude: enhancedSourceStop.lon,
                          },
                          style: {
                              iconType: 'multimodal' as const,
                              multimodalVariant: 'BusStop',
                          },
                          title: enhancedSourceStop.stopName,
                          stopName: enhancedSourceStop.stopName,
                          stopCode: enhancedSourceStop.stopCode,
                          showCallout: undefined,
                          displayCalloutOnPress: undefined,
                          busStopEtaCallout: undefined,
                          primaryEtaMinutes: undefined,
                          secondaryEtaMinutes: undefined,
                      },
                  ]
                : [];

        // Create start stop marker (first stop in route)
        const startStopMarker =
            routeStops && routeStops.length > 0 && enhancedSourceStop?.stopCode !== routeStops[0]?.stopCode
                ? (() => {
                      const startStop = routeStops[0];
                      return startStop && !isUndefined(startStop.lat) && !isUndefined(startStop.lon)
                          ? [
                                {
                                    id: `start-stop-${startStop.stopCode}`,
                                    location: {
                                        latitude: startStop.lat,
                                        longitude: startStop.lon,
                                    },
                                    style: {
                                        iconType: 'multimodal' as const,
                                        multimodalVariant: 'BusDepot',
                                    },
                                    title: startStop.stopName,
                                    stopName: startStop.stopName,
                                    stopCode: startStop.stopCode,
                                    showCallout: undefined,
                                    displayCalloutOnPress: undefined,
                                    busStopEtaCallout: undefined,
                                    primaryEtaMinutes: undefined,
                                    secondaryEtaMinutes: undefined,
                                },
                            ]
                          : [];
                  })()
                : [];

        // Create end stop marker (last stop in route)
        const endStopMarker =
            routeStops && routeStops.length > 1
                ? (() => {
                      const endStop = routeStops[routeStops.length - 1];
                      return endStop && !isUndefined(endStop.lat) && !isUndefined(endStop.lon)
                          ? [
                                {
                                    id: `end-stop-${endStop.stopCode}`,
                                    location: {
                                        latitude: endStop.lat,
                                        longitude: endStop.lon,
                                    },
                                    style: {
                                        iconType: 'multimodal' as const,
                                        multimodalVariant: 'BusDepot',
                                    },
                                    title: endStop.stopName,
                                    stopName: endStop.stopName,
                                    stopCode: endStop.stopCode,
                                    showCallout: undefined,
                                    displayCalloutOnPress: undefined,
                                    busStopEtaCallout: undefined,
                                    primaryEtaMinutes: undefined,
                                    secondaryEtaMinutes: undefined,
                                },
                            ]
                          : [];
                  })()
                : [];

        // Build a set of stopCodes already covered by special markers to avoid duplicates
        const specialStopCodes: string[] = [
            ...sourceStopMarker.map(marker => marker.id.replace('source-stop-', '')),
            ...startStopMarker.map(marker => marker.id.replace('start-stop-', '')),
            ...endStopMarker.map(marker => marker.id.replace('end-stop-', '')),
        ];

        // Create markers for all intermediate stops (and any stops not already covered)
        const allStopsMarkers: StaticMarker[] =
            routeStops?.flatMap((stop, index) => {
                if (isUndefined(stop.lat) || isUndefined(stop.lon)) {
                    return [];
                }

                // Skip if this stop is already represented by a special marker
                if (stop.stopCode && specialStopCodes.includes(stop.stopCode)) {
                    return [];
                }

                return [
                    {
                        id: `stop-${stop.stopCode ?? index}`,
                        location: {
                            latitude: stop.lat,
                            longitude: stop.lon,
                        },
                        style: {
                            iconType: 'stops' as const,
                            multimodalVariant: 'BusStop',
                        },
                        title: undefined,
                        stopName: stop.stopName,
                        stopCode: stop.stopCode,
                        showCallout: undefined,
                        displayCalloutOnPress: undefined,
                        busStopEtaCallout: undefined,
                        primaryEtaMinutes: undefined,
                        secondaryEtaMinutes: undefined,
                    },
                ];
            }) ?? [];

        return [...sourceStopMarker, ...startStopMarker, ...endStopMarker, ...allStopsMarkers];
    }, [enhancedSourceStop, routeStops]);

    // Transform API vehicle data to the format we need
    const vehicleData = useMemo(() => {
        if (!trackVehiclesData?.vehicleTrackingInfo) {
            return [];
        }
        return trackVehiclesData.vehicleTrackingInfo.map(bus => ({
            id: bus.vehicleId,
            routeShortName: bus.routeShortName,
            serviceTierType: bus.serviceTierType,
            coordinate: {
                latitude: Number(bus.vehicleInfo.latitude || 0), // Force conversion to number
                longitude: Number(bus.vehicleInfo.longitude || 0), // Force conversion to number
            },
            timestamp: Number(bus.vehicleInfo.timestamp),
            routeState: bus.vehicleInfo.routeState,
        }));
    }, [trackVehiclesData?.vehicleTrackingInfo]);

    // const vehicleData = vehicleDataT.slice(0, 10);

    // Transform vehicles to tracked entities
    const trackedEntities: TrackedEntity[] = useMemo(
        () =>
            vehicleData.map(vehicle => {
                const isConfirmed = vehicle.routeState === 'ConfirmedHigh' || vehicle.routeState === 'ConfirmedMed';
                return {
                    id: vehicle.id,
                    captionText: getBusVariantonServiceTierCaption(
                        vehicle.serviceTierType,
                        vehicle.routeShortName,
                        vehicle.id,
                    ),
                    pathId: stableRouteId,
                    location: vehicle.coordinate,
                    style: {
                        iconType: 'multimodal' as const,
                        blur: !isConfirmed,
                        multimodalVariant: isConfirmed
                            ? getBusVariantonServiceTier(vehicle.serviceTierType)
                            : 'GhostBus',
                        anchor: { x: 0.5, y: 0.5 },
                        rotation: 0, // Will be calculated by useLiveTracking
                    },
                    onClick: () => onVehicleClick(vehicle.id),
                    showCallout: undefined,
                    displayCalloutOnPress: undefined,
                    busStopEtaCallout: undefined,
                    primaryEtaMinutes: undefined,
                    secondaryEtaMinutes: undefined,
                };
            }),
        [vehicleData, stableRouteId, onVehicleClick],
    );

    const trackFromUserToValue = useMemo(() => {
        if (!fromSingleModeSearch && enhancedSourceStop?.lat && enhancedSourceStop?.lon) {
            return {
                latitude: enhancedSourceStop.lat,
                longitude: enhancedSourceStop.lon,
                updateInterval: 10,
                routingMode: 'straight-line',
                enableUpdate: false,
            };
        }
        return undefined;
    }, [enhancedSourceStop, fromSingleModeSearch]);

    // Get bus ETA info using utility function
    const allBusesEtaInfo: EnhancedBusEtaInfo[] | undefined = useMemo(() => {
        return getBusesEtaInfo(trackVehiclesData, enhancedSourceStop?.stopName);
    }, [trackVehiclesData, enhancedSourceStop?.stopName]);

    // Get selected bus info
    const selectedBusInfo = useMemo(() => {
        if (selectedBusVehicleId) {
            const selectedBus = (allBusesEtaInfo ?? []).find(bus => bus.vehicleId === selectedBusVehicleId);
            if (selectedBus) {
                return selectedBus;
            }
        }
        return allBusesEtaInfo?.at(0);
    }, [selectedBusVehicleId, allBusesEtaInfo]);

    // Get nearest bus coordinates
    const nearestBusCoordinates = useMemo(() => {
        return selectedBusInfo?.coordinates || getNearestBusCoordinates(allBusesEtaInfo ?? []);
    }, [selectedBusInfo, allBusesEtaInfo]);

    const stopVehicleMapHash = useMemo(() => {
        return Array.from(stopVehicleMap.entries())
            .map(([k, v]) => `${k}:${v.map(av => `${av.vehicleId}-${av.etaMinutes}`).join(',')}`)
            .join('|');
    }, [stopVehicleMap]);

    const enhancedStaticMarkers: StaticMarker[] = useMemo(() => {
        return staticMarkers.map(marker => {
            const isBusStop =
                marker.style.multimodalVariant == 'BusStop' ||
                marker.style.multimodalVariant == 'BusDepot' ||
                marker.id.startsWith('source-stop-') ||
                marker.id.startsWith('stop-');
            if (!isBusStop) return marker;
            const vehiclesAtStop = marker.stopCode ? stopVehicleMap.get(marker.stopCode) : undefined;
            const sorted = vehiclesAtStop
                ? vehiclesAtStop
                      .filter((v): v is typeof v & { etaMinutes: number } => v.etaMinutes != null)
                      .sort((a, b) => a.etaMinutes - b.etaMinutes)
                      .slice(0, 2)
                : [];
            const primaryEtaMinutes = sorted[0]?.etaMinutes;
            const secondaryEtaMinutes = sorted[1]?.etaMinutes;
            return {
                ...marker,
                primaryEtaMinutes: primaryEtaMinutes,
                secondaryEtaMinutes: secondaryEtaMinutes,
                displayCalloutOnPress: () => {
                    mapRef.current?.toggleMarkerCalloutVisibility(marker.id);
                },
                busStopEtaCallout: ({ primaryEtaMinutes, secondaryEtaMinutes }) => (
                    <BusStopCalloutCard
                        stopName={marker.stopName || ''}
                        primaryEtaMinutes={primaryEtaMinutes}
                        secondaryEtaMinutes={secondaryEtaMinutes}
                    />
                ),
            };
        });
    }, [staticMarkers, stopVehicleMapHash, sourceStop]);

    const autoFocusConfig = useMemo(() => {
        const coordinates: LatLng[] = [
            // Add source stop coordinates if available
            ...(enhancedSourceStop?.lat && enhancedSourceStop?.lon
                ? [{ latitude: enhancedSourceStop.lat, longitude: enhancedSourceStop.lon }]
                : []),
            // Add nearest bus coordinates if available
            ...(nearestBusCoordinates ? [nearestBusCoordinates] : []),
        ];

        return { coordinates };
    }, [enhancedSourceStop, nearestBusCoordinates]);

    // Use the useLiveTracking hook
    const {
        performAutoFocus: _performAutoFocus,
        setIsAutoFocusPaused,
        mapRef,
    } = useLiveTracking({
        paths,
        staticMarkers: enhancedStaticMarkers,
        trackedEntities,
        animationDuration: 1000,
        trackFromUserTo: trackFromUserToValue,
        autoFocus: autoFocusConfig,
        isMapDragged,
        trackingType: 'live',
        performAutoFocusOnlyOnInit: true,
    });

    const recenter = useCallback(() => {
        setIsAutoFocusPaused(false);
        _performAutoFocus(true);
    }, [_performAutoFocus]);

    const handleGoBack = () => {
        navigation.goBack();
    };
    const { getStationByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    const userToken = useAppSelector(selectToken);
    const dispatch = useAppDispatch();
    const handleBookTicket = useCallback(() => {
        if (currentSelectedRoute && vehicleType) {
            navigation.navigate('ServicesTab', {
                screen: 'singleModeBookingNavigator',
                params: {
                    screen: 'singleModeTicketBooking',
                    params: {
                        routeCode: currentSelectedRoute,
                        vehicleType,
                        selectedSourceStopCode: undefined,
                    },
                },
            });
        }
    }, [navigation, currentSelectedRoute, route, userToken, dispatch, getStationByCode, vehicleType]);

    // Find closest stop object using sourceCode from useFrfsRouteData
    const closestStopObject = useMemo(() => {
        if (!routeStops || !Array.isArray(routeStops) || !sourceCode) return undefined;
        return routeStops.find(stop => stop.stopCode === sourceCode);
    }, [routeStops, sourceCode]);

    const destinationTime = useMemo(() => {
        return getBusDestinationTime(trackVehiclesData, selectedBusInfo?.vehicleId, closestStopObject?.stopName);
    }, [trackVehiclesData, selectedBusInfo?.vehicleId, closestStopObject?.stopName]);

    // Calculate number of stops from closest bus to user
    const noOfStops = useMemo(() => {
        if (!routeStops || !Array.isArray(routeStops) || !selectedBusInfo?.stopName || !sourceCode) return undefined;
        const startIdx = routeStops.findIndex(stop => stop.stopName === selectedBusInfo?.stopName);
        const endIdx = routeStops.findIndex(stop => stop.stopCode === sourceCode);
        if (startIdx === -1 || endIdx === -1) return undefined;
        return Math.abs(endIdx - startIdx);
    }, [routeStops, selectedBusInfo?.stopName, sourceCode]);

    useEffect(() => {
        const destCode = destinationStop?.code ?? routeStops.at(-1)?.stopCode;
        if (sourceCode && routeCode && destCode && isUndefined(availableRoutesData)) {
            availableRoutesApi({
                body: {
                    endStopCode: destCode,
                    startStopCode: sourceCode,
                    onlyLive: false,
                    journeyId: journeyId,
                    legOrder: legOrder,
                },
            });
        }
    }, [sourceCode, routeCode, journeyId, legOrder]);

    const handleViewDetails = (show: boolean) => {
        if (show) {
            detailedTrackingModalRef.current?.present?.();
            mainSheetRef.current?.snapToIndex?.(0);
        } else {
            setIsDetailedTrackingOpen(false);
            detailedTrackingModalRef.current?.close?.();
        }
    };

    const currentSelectedRouteInfo: availableRoute | undefined = useMemo(() => {
        const route = sortedRoutes?.find(route => route.routeCode === currentSelectedRoute);
        if ((allBusesEtaInfo ?? []).length > 0) {
            return route;
        } else return route ? { ...route, source: 'GTFS' } : undefined;
    }, [sortedRoutes, currentSelectedRoute, allBusesEtaInfo]);

    const resolver: Resolver<BusTrackingAction | SingleModeTicketBookingAction> = async action => {
        switch (action.type) {
            case 'GO_BACK':
                if (fromJourneyInfoScreen && onBusRouteSwitch && currentSelectedRoute) {
                    try {
                        const selectedRoute = sortedRoutes?.find(route => route.routeCode === currentSelectedRoute);

                        if (selectedRoute) {
                            console.info(
                                '[BusTracking] Switching journey to bus on GO_BACK:',
                                selectedRoute.routeShortName,
                            );
                            // Call the callback to update journey
                            await onBusRouteSwitch(selectedRoute, legOrder);
                        }
                    } catch (error) {
                        console.error('[BusTracking] Failed to switch bus route on GO_BACK:', error);
                    }
                }
                handleGoBack();
                break;
            case 'RECENTER':
                recenter();
                break;
            case 'BOOK_TICKET':
                handleBookTicket();
                break;
            case 'SHOW_SWITCH_BUS_ROUTE_MODAL':
                if (!isUndefined(action.payload?.routeIndex) && sortedRoutes) {
                    const selectedRoute = sortedRoutes[action.payload.routeIndex];
                    const selectedIdx = action.payload.routeIndex;

                    if (selectedRoute) {
                        setCurrentSelectedRoute(selectedRoute.routeCode);
                        setBusConfirmInfo({
                            busNumber: selectedRoute.routeShortName,
                            routeCode: selectedRoute.routeCode,
                            stopsAway: noOfStops,
                            etaMins: selectedRoute.routeTimings?.[0]
                                ? Math.round(Number(selectedRoute.routeTimings[0]) / 60)
                                : 0,
                            selectedIndex: selectedIdx,
                        });
                        mainSheetRef.current?.close();
                        confirmModalRef.current?.present?.();
                        setShowBusConfirmPopup(true);
                    }
                }
                break;
            case 'VIEW_DETAILS':
                handleViewDetails(action.payload?.show ?? false);
                break;

            default:
                break;
        }
    };

    const mpDispatch = createDispatcher(resolver);

    // Prepare Google Maps button props
    const googleMapsButtonProps = useMemo(() => {
        if (
            enhancedSourceStop &&
            !isUndefined(enhancedSourceStop.lat) &&
            !isUndefined(enhancedSourceStop.lon) &&
            currentLocationCoords
        ) {
            return {
                userLocation: {
                    lat: currentLocationCoords.coords.latitude,
                    lon: currentLocationCoords.coords.longitude,
                },
                nearestBusStop: {
                    lat: enhancedSourceStop.lat,
                    lon: enhancedSourceStop.lon,
                },
            };
        }
        return undefined;
    }, [enhancedSourceStop, currentLocationCoords]);

    return (
        <BusTrackingScreen
            onBackPress={handleGoBack}
            currentSelectedRoute={currentSelectedRouteInfo}
            sourceStopCode={sourceCode}
            vehicleType={vehicleType}
            allBusesEtaInfo={allBusesEtaInfo}
            destinationTime={destinationTime}
            vehiclePositions={
                trackVehiclesData?.vehicleTrackingInfo
                    ? { vehicleTrackingInfo: trackVehiclesData.vehicleTrackingInfo }
                    : vehiclePositionsRef.current
            }
            mpDispatch={mpDispatch}
            bottomSheetFlatListRef={bottomSheetFlatListRef}
            fromJourneyInfoScreen={fromJourneyInfoScreen}
            minUpcomingStops={undefined}
            routeShortName={fetchedRouteShortName || currentSelectedRouteInfo?.routeShortName}
            destinationStopName={closestStopObject?.stopName || closestStopObject?.stopCode || ''}
            closestBusStopName={selectedBusInfo?.stopName}
            noOfStops={noOfStops}
            availableRoutes={sortedRoutes}
            routeStops={routeStops}
            showBusConfirmPopup={showBusConfirmPopup}
            setShowBusConfirmPopup={setShowBusConfirmPopup}
            setCurrentSelectedRoute={setCurrentSelectedRoute}
            detailedTrackingModalRef={detailedTrackingModalRef}
            mainSheetRef={mainSheetRef}
            confirmModalRef={confirmModalRef}
            busConfirmInfo={busConfirmInfo}
            setBusConfirmInfo={setBusConfirmInfo}
            isDetailedTrackingOpen={isDetailedTrackingOpen}
            setIsDetailedTrackingOpen={setIsDetailedTrackingOpen}
            googleMapsButtonProps={googleMapsButtonProps}
            isPreBooking={true}
            appName={appName}
            fromSingleModeSearch={fromSingleModeSearch}
        />
    );
};

export default BusTrackingFlow;
