import { Stop, type ProcessedLegInfo } from '@/src-v2/multimodal/types/journeyTracking';
import { useJourney } from '@/src-v2/multimodal/hooks/useJourney';
import { LiveJourneyDetailFlowProps, LiveJourneyDetailViewData } from './Types';
import React, { useCallback, useState, useMemo, memo, useRef, useEffect } from 'react';
import { LiveJourneyDetailUI } from './UI';
import { createJourneyId, createBookingId } from '@/typescript/state/client/user.ts';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import {
    MarkerConfig,
    useCoreVehicleTracking,
    VehicleMarkerConfig,
} from '@/typescript/hooks/useCoreVehicleTracking.tsx';
import { calculateDistance } from '@/src-v2/multimodal/utils/PublicTransportUtils';
import { journeyRules } from '@/src-v2/multimodal/rules/JourneyRules';
import { type RuleHandlerParams } from '@/src-v2/multimodal/rules/JourneyRulesTypes';
import { buildTrackLostJourneyProps, buildTransitCheckInProps } from '@/src-v2/multimodal/rules/JourneyRuleHelpers';
import * as JourneyActionHandlers from '@/src-v2/multimodal/rules/JourneyActionHandlers';
import { findIndexForLatLng, findNearestPointOnRoute } from '@/src-v2/multimodal/utils/locationUtils';
import { IconType } from '@/typescript/components/AnimatedMapPin';

import {
    buildDetailedTransitTrackingComponentProps,
    formatDistance,
    getVehicleStopMarker,
    LOADING_VIEW_DATA,
} from './FlowHelpers';

import MapProvider from '@/typescript/Maps/MapProvider';
import { selectAppConfig, selectLastKnownLocation } from '@/typescript/state/client/session';
import { LatLng } from 'react-native-maps';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectToken } from '@/typescript/state/client/auth';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { isEqual } from 'lodash';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { getNextLegOrder } from '../../utils/journeyTrackingUtils';
import { useTicketUIProps } from '../Ticket/Hooks/useTicketUIProps';
import { NativeModules } from 'react-native';
import { COORD_ON_PATH_THRESHOLD_IN_M, GET_EXT_PATH_MIN_DISTANCE_IN_M } from '@/typescript/constants/common';
import { convertLatLongToLatLngStopInfo } from '@/typescript/utils/MultiModal';
import { setJourneyRoute } from '@/typescript/state/client/search';
import { getClosestPointOnPath } from '@/typescript/Maps/helpers/mapUtils';
import { useLazySearchResultsQuery } from '@/typescript/state/server/searchApi';
import { LegUpdateType } from '../NewLiveJourney/components/UpdateJourney/JourneyListBottomSheet';
import { NewTimeTableUIProps } from '../NewTimeTable/types';
import { useSkipFeedbackMutation } from '@/typescript/state/server/flowStatusApi';
import { usePickupRoutePostMutation, pickupRoutePostWithParams } from '@/api/integrations/rtk/PickupRoutePost.ts';
import { setPickupDistance } from '@/typescript/state/client/ride.ts';
import { createRideId } from '@/typescript/state/client/booking';
import { selectPickupDistanceWithid } from '@/typescript/state/client/ride';
import { clearAllJourneyState, selectJourneyStatus } from '@/typescript/state/client/journey';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { strings } from 'config-types';
import { checkTaxiLeg } from '@/typescript/utils/common';

/**
 * Bus tracking hook with three distinct journey states:
 */
const useBusTracking = (
    legForDetailedTracking: ProcessedLegInfo | undefined,
    currentLeg: ProcessedLegInfo | undefined,
    userLanguageStrings: strings,
): { recenterMap: () => void } => {
    // Determine if this is a public transport leg
    const publicLeg = !checkTaxiLeg(legForDetailedTracking?.transitMode, true);
    const { MapUtils } = NativeModules;
    const [pickupRoutePost] = usePickupRoutePostMutation();
    const [taxiRouteDistance, setTaxiRouteDistance] = useState<number | null>(null);

    const isCurrentModeTaxi = checkTaxiLeg(currentLeg?.transitMode);
    // Define journey states with clear logic
    const journeyState = useMemo(() => {
        const vehicleState = legForDetailedTracking?.vehicleState;

        // Priority 1: Special zone state - when inside special zone coordinates
        if (legForDetailedTracking?.insideSpecialZone) {
            return 'IN_SPECIAL_ZONE';
        }
        if (isCurrentModeTaxi) {
            return 'PRE_PICKUP';
        }
        // Priority 2: Post-pickup state - when ride has started or for non-public transport
        if (
            !publicLeg ||
            (vehicleState && ['RIDESTARTED', 'RIDECLOSETODESTINATION', 'RIDEREACHEDDESTINATION'].includes(vehicleState))
        ) {
            return 'POST_PICKUP';
        }
        return 'PRE_PICKUP';
        // Priority 3: Pre-pickup state - default for public transport before pickup
    }, [legForDetailedTracking?.vehicleState, legForDetailedTracking?.insideSpecialZone, publicLeg]);

    // Memoize vehicle location data calculation

    const liveVehicleLocationDataOriginal = useMemo(() => {
        const vehiclePos = legForDetailedTracking?.realTimeInfo?.currentLiveVehicle;
        const loc = vehiclePos?.loc;
        const bearing: number | undefined = undefined;

        // For post-pickup state, if no vehicle location, use user location
        if (journeyState === 'POST_PICKUP' && !loc && legForDetailedTracking?.riderLocation) {
            return {
                location: {
                    latitude: legForDetailedTracking.riderLocation.lat,
                    longitude: legForDetailedTracking.riderLocation.lon,
                    bearing: bearing,
                },
                id: 'user-location-as-vehicle-location',
            };
        }

        return {
            location: loc?.lat && loc?.lon ? { latitude: loc.lat, longitude: loc.lon, bearing: bearing } : null,
            id: vehiclePos?.id,
        };
    }, [legForDetailedTracking?.realTimeInfo?.liveVehicleData, legForDetailedTracking?.riderLocation, journeyState]);

    // Memoize route coordinates
    const allRouteCoordinates = useMemo((): LatLng[] => {
        return (legForDetailedTracking?.staticInfo?.routeWaypoints || []).map(waypoint => ({
            latitude: waypoint.lat,
            longitude: waypoint.lon,
        }));
    }, [legForDetailedTracking?.staticInfo?.routeWaypoints]);

    // Memoize user location
    const userMapLocation = useMemo((): LatLng | null => {
        return legForDetailedTracking?.riderLocation?.lat && legForDetailedTracking?.riderLocation?.lon
            ? {
                  latitude: legForDetailedTracking.riderLocation.lat,
                  longitude: legForDetailedTracking.riderLocation.lon,
              }
            : null;
    }, [legForDetailedTracking?.riderLocation]);

    // Memoize destination location
    const destinationMapLocationOriginal = useMemo((): LatLng | null => {
        return legForDetailedTracking?.staticInfo?.destination?.latLong?.lat &&
            legForDetailedTracking?.staticInfo?.destination?.latLong?.lon
            ? {
                  latitude: legForDetailedTracking.staticInfo.destination.latLong.lat,
                  longitude: legForDetailedTracking.staticInfo.destination.latLong.lon,
              }
            : null;
    }, [legForDetailedTracking?.staticInfo?.destination]);

    // Memoize source location
    const sourceMapLocationOriginal = useMemo((): LatLng | null => {
        return legForDetailedTracking?.staticInfo?.origin?.latLong?.lat &&
            legForDetailedTracking?.staticInfo?.origin?.latLong?.lon
            ? {
                  latitude: legForDetailedTracking.staticInfo.origin.latLong.lat,
                  longitude: legForDetailedTracking.staticInfo.origin.latLong.lon,
              }
            : null;
    }, [legForDetailedTracking?.staticInfo?.origin]);

    const sourcelocationForAuto = useMemo((): LatLng | null => {
        return currentLeg?.staticInfo?.origin?.latLong?.lat && currentLeg?.staticInfo?.origin?.latLong?.lon
            ? {
                  latitude: currentLeg.staticInfo.origin.latLong.lat,
                  longitude: currentLeg.staticInfo.origin.latLong.lon,
              }
            : null;
    }, [currentLeg?.staticInfo?.origin]);

    const destinationlocationForAuto = useMemo((): LatLng | null => {
        return currentLeg?.staticInfo?.destination?.latLong?.lat && currentLeg?.staticInfo?.destination?.latLong?.lon
            ? {
                  latitude: currentLeg.staticInfo.destination.latLong.lat,
                  longitude: currentLeg.staticInfo.destination.latLong.lon,
              }
            : null;
    }, [currentLeg?.staticInfo?.destination]);

    const MAX_SNAP_DISTANCE_METERS = 200;

    // Memoize snapped locations
    const sourceMapLocation = useMemo(() => {
        if (legForDetailedTracking?.transitMode !== 'BUS') {
            return sourceMapLocationOriginal;
        }
        return findNearestPointOnRoute(sourceMapLocationOriginal, allRouteCoordinates, MAX_SNAP_DISTANCE_METERS);
    }, [sourceMapLocationOriginal, allRouteCoordinates]);

    const destinationMapLocation = useMemo(
        () => findNearestPointOnRoute(destinationMapLocationOriginal, allRouteCoordinates, MAX_SNAP_DISTANCE_METERS),
        [destinationMapLocationOriginal, allRouteCoordinates],
    );

    const liveVehicleLocationData = useMemo(() => {
        if (!publicLeg) {
            return liveVehicleLocationDataOriginal;
        }
        const snappedLocation = findNearestPointOnRoute(
            liveVehicleLocationDataOriginal.location,
            allRouteCoordinates,
            MAX_SNAP_DISTANCE_METERS,
        );
        return {
            ...liveVehicleLocationDataOriginal,
            location: snappedLocation,
        };
    }, [liveVehicleLocationDataOriginal, allRouteCoordinates]);

    // State for async route calculation
    const [routeCalculationData, setRouteCalculationData] = useState<{
        routeCoordinatesForMap: LatLng[];
        effectiveSourceLocation: LatLng | null;
        effectiveDestinationLocation: LatLng | null;
    }>({
        routeCoordinatesForMap: allRouteCoordinates,
        effectiveSourceLocation: sourceMapLocation,
        effectiveDestinationLocation: destinationMapLocation,
    });
    const dispatch = useAppDispatch();

    const getTaxiRouteOnUserDeviation = async (
        isPositionOnPath: boolean,
        isCurrentModeTaxi: boolean,
        dedupCoords: LatLng[],
        currentLeg: ProcessedLegInfo | undefined,
        userMapLocation: LatLng | null,
    ): Promise<LatLng[]> => {
        if (!isPositionOnPath && isCurrentModeTaxi && dedupCoords.length > 0 && dedupCoords) {
            try {
                const reqBody: pickupRoutePostWithParams = {
                    body: {
                        calcPoints: true,
                        mode: checkTaxiLeg(currentLeg?.transitMode) ? 'CAR' : undefined,
                        waypoints: [
                            { lat: userMapLocation?.latitude || 0, lon: userMapLocation?.longitude || 0 },
                            {
                                lat: currentLeg?.staticInfo?.destination?.latLong?.lat || 0,
                                lon: currentLeg?.staticInfo?.destination?.latLong?.lon || 0,
                            },
                        ],
                        rideId: undefined,
                    },
                };
                const payload = await pickupRoutePost(reqBody).unwrap();

                if (payload[0]?.points && payload[0].points.length > 0) {
                    return payload[0].points.map(point => ({
                        latitude: point.lat,
                        longitude: point.lon,
                    }));
                }
            } catch (error) {
                console.info('Error fetching pickup route, using fallback:', error);
            }
        } else {
            console.info('Skipping API call - condition not met');
        }
        return [];
    };

    const getPrePickupRouteCoords = async ({
        currentLeg,
        userMapLocation,
        allRouteCoordinates,
        vehicleIdx,
        sourceIdx,
        isCurrentModeTaxi,
        dispatch,
    }: {
        currentLeg: ProcessedLegInfo | undefined;
        userMapLocation: LatLng | null;
        allRouteCoordinates: LatLng[];
        vehicleIdx: number;
        sourceIdx: number;
        isCurrentModeTaxi: boolean;
        dispatch: ReturnType<typeof useAppDispatch>;
    }) => {
        const dedupCoords: LatLng[] =
            currentLeg?.staticInfo.filteredRouteWaypoints && currentLeg.staticInfo.filteredRouteWaypoints.length > 0
                ? await MapUtils.getExtendedPath(
                      currentLeg.staticInfo.filteredRouteWaypoints.map(convertLatLongToLatLngStopInfo),
                      GET_EXT_PATH_MIN_DISTANCE_IN_M,
                  )
                : currentLeg?.staticInfo.filteredRouteWaypoints;

        // Find closest point on path for current position
        const closestPointResult =
            dedupCoords && userMapLocation
                ? await MapUtils.getClosestPointOnPath(userMapLocation, dedupCoords)
                : { distance: Infinity, segmentIndex: -1 };

        const isPositionOnPath = closestPointResult.distance <= COORD_ON_PATH_THRESHOLD_IN_M;
        const currentPositionIdx = isPositionOnPath ? closestPointResult.segmentIndex : -1;

        // Calculate taxi live route
        const baseTaxiRoute = currentPositionIdx !== -1 ? dedupCoords.slice(currentPositionIdx) : dedupCoords;
        const taxiLiveRoute = await getTaxiRouteOnUserDeviation(
            isPositionOnPath,
            isCurrentModeTaxi,
            dedupCoords,
            currentLeg,
            userMapLocation,
        );
        const finalTaxiRoute = taxiLiveRoute.length > 0 ? taxiLiveRoute : baseTaxiRoute;
        const distance =
            finalTaxiRoute && finalTaxiRoute.length > 0 ? await MapUtils.computeLength(finalTaxiRoute) : null;
        setTaxiRouteDistance(distance);
        if (isCurrentModeTaxi && currentLeg?.taxiBookingId && distance != null) {
            dispatch(setPickupDistance({ id: createRideId(currentLeg.taxiBookingId), payload: distance }));
        }

        // Dispatch journey route for taxi mode
        if (isCurrentModeTaxi && currentLeg?.staticInfo.searchId && currentLeg?.staticInfo) {
            dispatch(
                setJourneyRoute({
                    id: currentLeg.staticInfo.searchId,
                    payload: currentLeg.staticInfo,
                }),
            );
        }

        // Determine route coordinates based on mode and indices
        const routeCoords: LatLng[] = (() => {
            const hasValidIndices = vehicleIdx !== -1 && sourceIdx !== -1 && vehicleIdx <= sourceIdx;

            if (hasValidIndices) {
                return allRouteCoordinates.slice(vehicleIdx, sourceIdx + 1);
            } else if (isCurrentModeTaxi) {
                return finalTaxiRoute || [];
            } else {
                return [];
            }
        })();

        return routeCoords;
    };

    const getPostPickupRouteCoords = async ({
        allRouteCoordinates,
        currentPositionIdx,
        destIdx,
        publicLeg: _publicLeg,
        sourceIdx,
    }: {
        currentLeg: ProcessedLegInfo | undefined;
        userMapLocation: LatLng | null;
        allRouteCoordinates: LatLng[];
        currentPositionIdx: number;
        destIdx: number;
        isCurrentModeTaxi: boolean;
        publicLeg: boolean;
        dispatch: ReturnType<typeof useAppDispatch>;
        sourceIdx: number;
    }) => {
        // Determine route coordinates based on mode and indices
        const routeCoords: LatLng[] = (() => {
            const hasValidIndices = currentPositionIdx !== -1 && destIdx !== -1 && currentPositionIdx <= destIdx;

            if (hasValidIndices) {
                return allRouteCoordinates.slice(currentPositionIdx, destIdx + 1);
            } else if (sourceIdx !== -1 && sourceIdx <= destIdx) {
                return allRouteCoordinates.slice(sourceIdx);
            } else {
                return [];
            }
        })();

        return routeCoords;
    };

    // Effect to handle async route calculation
    useEffect(() => {
        const calculateRoutes = async () => {
            const vehicleIdx = findIndexForLatLng(liveVehicleLocationData.location, allRouteCoordinates);
            const extendedAllCordinates =
                allRouteCoordinates && allRouteCoordinates.length > 0
                    ? await MapUtils.getExtendedPath(allRouteCoordinates, GET_EXT_PATH_MIN_DISTANCE_IN_M)
                    : allRouteCoordinates;
            const liveVehicleLocation = liveVehicleLocationData.location
                ? await getClosestPointOnPath(liveVehicleLocationData.location, extendedAllCordinates)
                : { distance: Infinity, segmentIndex: -1 };
            const isPositionOnPath1 =
                liveVehicleLocation.distance !== Infinity && liveVehicleLocation.segmentIndex !== -1;
            const currentVehicleIdx = isPositionOnPath1 ? liveVehicleLocation.segmentIndex : -1;
            switch (journeyState) {
                case 'PRE_PICKUP': {
                    // Pre-pickup: Show route from vehicle to source
                    const sourceIdx = findIndexForLatLng(sourceMapLocation, extendedAllCordinates);
                    try {
                        const routeCoords = await getPrePickupRouteCoords({
                            currentLeg,
                            userMapLocation,
                            allRouteCoordinates: extendedAllCordinates,
                            vehicleIdx: currentVehicleIdx,
                            sourceIdx,
                            isCurrentModeTaxi,
                            dispatch,
                        });
                        // Update route calculation data
                        setRouteCalculationData({
                            routeCoordinatesForMap: routeCoords,
                            effectiveSourceLocation: sourceMapLocation,
                            effectiveDestinationLocation: isCurrentModeTaxi
                                ? destinationlocationForAuto
                                : currentLeg?.isLastLeg
                                  ? destinationMapLocation
                                  : null,
                        });
                    } catch (error) {
                        console.error(
                            'Error calculating closest point on path, falling back to synchronous calculation:',
                            error,
                        );

                        // Fallback to basic route calculation
                        const fallbackRouteCoords =
                            vehicleIdx !== -1 && sourceIdx !== -1 && vehicleIdx <= sourceIdx
                                ? allRouteCoordinates.slice(vehicleIdx, sourceIdx + 1)
                                : [];

                        setRouteCalculationData({
                            routeCoordinatesForMap: fallbackRouteCoords,
                            effectiveSourceLocation:
                                isCurrentModeTaxi && currentLeg?.staticInfo.bookingId !== undefined
                                    ? null
                                    : sourceMapLocation,
                            effectiveDestinationLocation: isCurrentModeTaxi
                                ? destinationlocationForAuto
                                : currentLeg?.isLastLeg
                                  ? destinationMapLocation
                                  : null,
                        });
                    }
                    break;
                }
                case 'POST_PICKUP': {
                    // Post-pickup: Show route from current position (vehicle or user) to destination
                    const destIdx = findIndexForLatLng(destinationMapLocation, extendedAllCordinates);
                    const sourceIdx = findIndexForLatLng(sourceMapLocation, extendedAllCordinates);

                    try {
                        const routeCoords = await getPostPickupRouteCoords({
                            currentLeg,
                            userMapLocation,
                            allRouteCoordinates: extendedAllCordinates,
                            currentPositionIdx: currentVehicleIdx,
                            destIdx,
                            isCurrentModeTaxi,
                            publicLeg,
                            dispatch,
                            sourceIdx: sourceIdx,
                        });
                        // Update route calculation data
                        setRouteCalculationData({
                            routeCoordinatesForMap: routeCoords,
                            effectiveSourceLocation: liveVehicleLocationData.location,
                            effectiveDestinationLocation: destinationMapLocation,
                        });
                    } catch {
                        console.error(
                            'Error calculating closest point on path, falling back to synchronous calculation',
                        );
                    }
                    break;
                }
                case 'IN_SPECIAL_ZONE': {
                    // In special zone: Show full route from source to destination
                    const sourceIdx = findIndexForLatLng(sourceMapLocation, allRouteCoordinates);
                    const destIdx = findIndexForLatLng(destinationMapLocation, allRouteCoordinates);
                    // const isUserOnPath =
                    //     userMapLocation && findIndexForLatLng(userMapLocation, allRouteCoordinates) !== -1;
                    const res = await MapUtils.getClosestPointOnPath(userMapLocation, allRouteCoordinates);
                    const isUserOnPath = res.distance > COORD_ON_PATH_THRESHOLD_IN_M ? -1 : res.segmentIndex;
                    const routeCoords: LatLng[] =
                        sourceIdx !== -1 && destIdx !== -1 && sourceIdx <= destIdx && isUserOnPath !== -1
                            ? allRouteCoordinates.slice(isUserOnPath, destIdx + 1)
                            : [];

                    setRouteCalculationData({
                        routeCoordinatesForMap: routeCoords,
                        effectiveSourceLocation: sourceMapLocation,
                        effectiveDestinationLocation: destinationMapLocation,
                    });
                    break;
                }

                default:
                    setRouteCalculationData({
                        routeCoordinatesForMap: allRouteCoordinates,
                        effectiveSourceLocation: sourceMapLocation,
                        effectiveDestinationLocation: destinationMapLocation,
                    });
            }
        };

        calculateRoutes();
    }, [
        journeyState,
        sourceMapLocation,
        destinationMapLocation,
        allRouteCoordinates,
        liveVehicleLocationData.location,
        userMapLocation,
        publicLeg,
        currentLeg?.staticInfo.filteredRouteWaypoints,
        MapUtils,
    ]);
    // Extract values from state
    const { routeCoordinatesForMap, effectiveSourceLocation, effectiveDestinationLocation } = routeCalculationData;

    // Memoize distance calculation
    const distanceUserToSource = useMemo(() => {
        if (journeyState === 'PRE_PICKUP' && userMapLocation && sourceMapLocation) {
            return calculateDistance(
                userMapLocation.latitude,
                userMapLocation.longitude,
                sourceMapLocation.latitude,
                sourceMapLocation.longitude,
            );
        }
        return Infinity;
    }, [journeyState, userMapLocation, sourceMapLocation]);

    // State-based marker configurations
    const sourceMarkerConfigValue = useMemo(() => {
        // Show source marker for PRE_PICKUP and IN_SPECIAL_ZONE states
        if (journeyState !== 'PRE_PICKUP' && journeyState !== 'IN_SPECIAL_ZONE') {
            return undefined;
        }
        if (!effectiveSourceLocation) {
            return undefined;
        }

        const shouldUseCombinedIcon = journeyState === 'PRE_PICKUP' && distanceUserToSource <= 50;
        const iconType: IconType =
            legForDetailedTracking?.staticInfo?.origin?.geoJson?.coordinates?.length &&
            legForDetailedTracking?.staticInfo?.origin?.geoJson?.coordinates?.length > 0
                ? 'specialZone'
                : 'multimodal';

        const getStopVariant = () => {
            if (shouldUseCombinedIcon) return 'BusAndUser';
            return getVehicleStopMarker(legForDetailedTracking?.transitMode);
        };
        const multimodalVariant = getStopVariant();

        const config: MarkerConfig = {
            id: 'source-marker',
            iconType: isCurrentModeTaxi ? 'pickup' : iconType,
            multimodalVariant: multimodalVariant,
            title: !isCurrentModeTaxi
                ? legForDetailedTracking?.staticInfo?.origin?.entryGate
                : currentLeg?.staticInfo?.origin?.exitGate,
            onClick: undefined,
            zIndex: 3,
            rotation: undefined,
        };
        return config;
    }, [
        journeyState,
        effectiveSourceLocation,
        distanceUserToSource,
        legForDetailedTracking?.staticInfo?.origin,
        legForDetailedTracking?.transitMode,
    ]);

    const destinationMarkerConfigValue = useMemo(() => {
        // For AUTO/TAXI mode, use currentLeg destination
        if (isCurrentModeTaxi && journeyState === 'PRE_PICKUP') {
            const autoDestination = currentLeg?.staticInfo?.destination;
            if (!autoDestination?.latLong?.lat || !autoDestination?.latLong?.lon) {
                return undefined;
            }
            const config: MarkerConfig = {
                id: 'destination-marker',
                iconType: 'dropoff',
                multimodalVariant: undefined,
                title: autoDestination.entryGate ?? undefined,
                onClick: undefined,
                zIndex: 3,
                rotation: undefined,
            };
            return config;
        }

        // Show destination marker for POST_PICKUP and IN_SPECIAL_ZONE states
        if (journeyState !== 'POST_PICKUP' && journeyState !== 'IN_SPECIAL_ZONE') {
            return undefined;
        }
        if (!effectiveDestinationLocation) {
            return undefined;
        }
        const iconType: IconType =
            legForDetailedTracking?.staticInfo?.destination?.geoJson?.coordinates?.length &&
            legForDetailedTracking?.staticInfo?.destination?.geoJson?.coordinates?.length > 0
                ? 'specialZone'
                : !publicLeg
                  ? 'dropoff'
                  : 'multimodal';
        const transitMode = legForDetailedTracking?.transitMode;
        const stopVariant = (() => {
            return getVehicleStopMarker(transitMode);
        })();

        return {
            id: 'destination-marker',
            iconType,
            multimodalVariant: stopVariant,
            title: legForDetailedTracking?.staticInfo?.destination?.exitGate ?? undefined,
            onClick: undefined,
            zIndex: 3,
            rotation: undefined,
        };
    }, [
        journeyState,
        effectiveDestinationLocation,
        legForDetailedTracking?.staticInfo?.destination,
        publicLeg,
        isCurrentModeTaxi,
        currentLeg,
        legForDetailedTracking?.transitMode,
    ]);

    const userLocationMarkerConfigValue = useMemo(() => {
        // Show user marker for all states, but hide when too close to source in PRE_PICKUP
        const hideUserMarker = journeyState === 'PRE_PICKUP' && distanceUserToSource <= 50 && !userMapLocation;
        if (hideUserMarker || isCurrentModeTaxi) {
            return undefined;
        }
        const config: MarkerConfig = {
            id: 'user-location',
            iconType: 'multimodal',
            multimodalVariant: 'TrackingWalk',
            title: undefined,
            onClick: undefined,
            zIndex: 3,
            rotation: undefined,
        };
        return config;
    }, [userMapLocation, journeyState, distanceUserToSource]);

    const vehicleMarkerConfigValue = useMemo(() => {
        // Show vehicle marker for PRE_PICKUP and POST_PICKUP states, hide for IN_SPECIAL_ZONE
        const currentVehicleLoc = isCurrentModeTaxi ? userMapLocation : liveVehicleLocationData.location;
        if (journeyState === 'IN_SPECIAL_ZONE' || !currentVehicleLoc) {
            return undefined;
        }

        const remainingStops = legForDetailedTracking?.realTimeInfo?.remainingStops;
        const config: VehicleMarkerConfig = {
            id: liveVehicleLocationData.id ?? 'vehicle-marker',
            iconType: 'multimodal',
            multimodalVariant: isCurrentModeTaxi ? 'TrackingWalk' : 'TrackingDirectedBus',
            title:
                remainingStops != null && publicLeg
                    ? `${remainingStops} ${userLanguageStrings.stopsaway}`
                    : isCurrentModeTaxi && taxiRouteDistance
                      ? formatDistance(taxiRouteDistance, userLanguageStrings)
                      : undefined,
            onClick: undefined,
            zIndex: 4,
            rotation: !publicLeg ? 0 : undefined,
            getCalloutText: () => {
                const remainingStops = legForDetailedTracking?.realTimeInfo?.remainingStops;
                return remainingStops != null && publicLeg ? `${remainingStops} ${userLanguageStrings.stopsaway}` : '';
            },
        };
        return config;
    }, [
        journeyState,
        liveVehicleLocationData,
        legForDetailedTracking?.realTimeInfo?.remainingStops,
        publicLeg,
        taxiRouteDistance,
        userLanguageStrings,
        legForDetailedTracking?.transitMode,
    ]);

    const polylineConfig = useMemo(() => {
        if (isCurrentModeTaxi) {
            return {
                color: '#016ACD',
                strokeWidth: 4,
                lineDashPattern: undefined,
            };
        }
        if (!publicLeg) {
            return {
                color: '#007AFF',
                strokeWidth: 3,
                lineDashPattern: [8, 8],
            };
        }
        return {
            color: '#FFAA00',
            strokeWidth: 4,
            lineDashPattern: undefined,
        };
    }, [legForDetailedTracking?.transitMode]);

    // Centralized state-driven configuration for vehicle tracking
    const trackingConfig = useMemo(() => {
        const config = {
            // Base configuration (always included)
            trackingId: 'bus-tracking',
            routeCoordinates: routeCoordinatesForMap,
            polylineConfig,
            userLocation: userMapLocation,
            vehicleMarkerConfig: vehicleMarkerConfigValue,
            sourceMarkerConfig: sourceMarkerConfigValue,
            destinationMarkerConfig: destinationMarkerConfigValue,
            userLocationMarkerConfig: userLocationMarkerConfigValue,
            waypointMarkersConfig: undefined,
            fitMapToRouteOnLoad: true,
            autoFitMapToVehicle: false,
            animationPollingInterval: 2000,
            onAnimatedVehiclePositionUpdate: () => {},
            bottomPadding: legForDetailedTracking?.transitMode === 'BUS' ? 380 : undefined,
        };

        // State-specific configuration
        switch (journeyState) {
            case 'PRE_PICKUP': {
                return {
                    ...config,
                    liveVehicleLocation: isCurrentModeTaxi ? userMapLocation : liveVehicleLocationData.location,
                    sourceLocation: isCurrentModeTaxi ? sourcelocationForAuto : effectiveSourceLocation,
                    sourceArea: legForDetailedTracking?.staticInfo?.origin?.geoJson,
                    destinationLocation: currentLeg?.isLastLeg
                        ? effectiveDestinationLocation
                        : isCurrentModeTaxi
                          ? effectiveSourceLocation
                          : null,
                    destinationArea: undefined,
                };
            }
            case 'POST_PICKUP':
                return {
                    ...config,
                    liveVehicleLocation: publicLeg ? liveVehicleLocationData.location : null,
                    sourceLocation: null,
                    sourceArea: undefined,
                    destinationLocation: effectiveDestinationLocation,
                    destinationArea: legForDetailedTracking?.staticInfo?.destination?.geoJson,
                    userLocationMarkerConfig:
                        currentLeg?.transitMode === 'BUS' ? undefined : userLocationMarkerConfigValue,
                };

            case 'IN_SPECIAL_ZONE':
                return {
                    ...config,
                    liveVehicleLocation: null, // Hide vehicle in special zones
                    sourceLocation: effectiveSourceLocation,
                    sourceArea: legForDetailedTracking?.staticInfo?.origin?.geoJson,
                    destinationLocation: effectiveDestinationLocation,
                    destinationArea: legForDetailedTracking?.staticInfo?.destination?.geoJson,
                };

            default:
                return {
                    ...config,
                    liveVehicleLocation: liveVehicleLocationData.location,
                    sourceLocation: effectiveSourceLocation,
                    sourceArea: legForDetailedTracking?.staticInfo?.origin?.geoJson,
                    destinationLocation: effectiveDestinationLocation,
                    destinationArea: legForDetailedTracking?.staticInfo?.destination?.geoJson,
                };
        }
    }, [
        journeyState,
        routeCoordinatesForMap,
        polylineConfig,
        userMapLocation,
        liveVehicleLocationData.location,
        effectiveSourceLocation,
        effectiveDestinationLocation,
        vehicleMarkerConfigValue,
        sourceMarkerConfigValue,
        destinationMarkerConfigValue,
        userLocationMarkerConfigValue,
        legForDetailedTracking?.staticInfo?.origin?.geoJson,
        legForDetailedTracking?.staticInfo?.destination?.geoJson,
    ]);

    // Use the core vehicle tracking hook with clean, centralized configuration
    const { recenterMap } = useCoreVehicleTracking(trackingConfig);

    // Stable recenter map reference
    const stableRecenterMapRef = useRef<() => void>(() => {});
    useEffect(() => {
        stableRecenterMapRef.current = recenterMap;
    });
    const stableRecenterMap = useCallback(() => stableRecenterMapRef.current(), []);

    return useMemo(() => ({ recenterMap: stableRecenterMap }), [stableRecenterMap]);
};

// --- Main Hook ---
export const useLiveJourneyDetailFlow = (
    props: LiveJourneyDetailFlowProps,
    isFocused: boolean,
): LiveJourneyDetailViewData => {
    const { journeyId } = props;
    const {
        data: journeyData,
        isLoading,
        error,
        actions,
        updateLocationManually,
    } = useJourney(createJourneyId(journeyId), isFocused);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const userId = useAppSelector(selectToken);
    const dispatch = useAppDispatch();
    const hasNavigatedToFeedback = useRef(false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const {
        callDriverBottomsheetModalRef,
        liveJourneyTransitCheckInModalRef,
        ticketUIRef,
        timeTableBottomSheetModalRef,
        liveJourneyListBottomSheetRef,
        liveJourneyListDetailBottomSheetRef,
        switchToAutoConfirmationModalRef,
        liveJourneyUpdateTransitBottomSheetRef,
        liveJourneyMetroConfirmLocationBottomSheetRef,
        otpModalRef,
    } = useRefsContext();
    const ticketUIProps = useTicketUIProps(journeyId, 'bottomSheetModal');
    const [predictedLeg, setPredictedLeg] = useState<ProcessedLegInfo | undefined>(undefined);
    const [shouldAutoOpenUpdateTransit, setShouldAutoOpenUpdateTransit] = useState<boolean>(false);
    const journeyStatus = useAppSelector(state => selectJourneyStatus(state, createJourneyId(journeyId)));

    // handle journey completion
    const isJourneyCompleted = useMemo(() => {
        return journeyData?.length > 0 && journeyData?.every(leg => leg.vehicleState === 'RIDEREACHEDDESTINATION');
    }, [journeyData]);

    const [skipFeedback] = useSkipFeedbackMutation();

    // Handle navigation to feedback screen when journey is completed or expired
    useEffect(() => {
        if (!hasNavigatedToFeedback.current && (isJourneyCompleted || journeyStatus === 'EXPIRED')) {
            const isPublicTransportOnly = journeyData?.every(
                leg =>
                    leg.transitMode === 'BUS' ||
                    leg.transitMode === 'METRO' ||
                    leg.transitMode === 'SUBWAY' ||
                    leg.transitMode === 'WALK',
            );

            dispatch(clearAllJourneyState());
            hasNavigatedToFeedback.current = true;

            if (isPublicTransportOnly) {
                skipFeedback(undefined);
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
            } else {
                navigation.popTo('LiveTab', {
                    screen: 'multiTransitFeedback',
                    params: { journeyId: journeyId, multimodalProps: undefined },
                });
            }
        }
    }, [isJourneyCompleted, journeyStatus, navigation, journeyId, journeyData]);

    // console.error(
    //     'trackedData',
    //     JSON.stringify(
    //         journeyData.map(t => ({
    //             currentLeg: t.currentLeg,
    //             legOrder: t.staticInfo.legOrder,
    //             transitMode: t.transitMode,
    //             vehicleState: t.vehicleState,
    //             userState: t.userState,
    //             originStopETAInMinutes: t.realTimeInfo.originStopETAInMinutes,
    //             currentStop: t.realTimeInfo.currentStop,
    //         })),
    //         null,
    //         2,
    //     ),
    // );

    const [showDetailedTransitTracking, setShowDetailedTransitTracking] = useState(false);
    const [overrideDetailedLeg, setOverrideDetailedLeg] = useState<ProcessedLegInfo | undefined>(undefined);
    const [overrideTimetableLeg, setOverrideTimetableLeg] = useState<ProcessedLegInfo | undefined>(undefined);

    const handleShowDetailedTransitTracking = useCallback(() => {
        setShowDetailedTransitTracking(true);
    }, []);

    const handleHideDetailedTransitTracking = useCallback(() => {
        setShowDetailedTransitTracking(false);
        setOverrideDetailedLeg(undefined);
    }, []);

    const currentLeg = useMemo(() => {
        if (journeyData && journeyData.length > 0) {
            const activeLegOrder = journeyData[0]?.currentLeg;
            return journeyData.find(leg => leg.staticInfo.legOrder === activeLegOrder);
        }
        return undefined;
    }, [journeyData]);

    useEffect(() => {
        if (
            showDetailedTransitTracking &&
            currentLeg?.userState === 'EXITSTATION' &&
            !overrideDetailedLeg /* only auto-close in exit station case, if trying to show tracking for current leg */
        ) {
            setShowDetailedTransitTracking(false);
        }
    }, [currentLeg?.userState, showDetailedTransitTracking, overrideDetailedLeg]);

    const rideId = currentLeg?.taxiBookingId ? createRideId(currentLeg.taxiBookingId) : null;
    const rideDistance = useAppSelector(state => (rideId ? selectPickupDistanceWithid(state, rideId) : undefined));
    const legForDetailedTracking = useMemo((): ProcessedLegInfo | undefined => {
        if (!currentLeg) return undefined;
        if (['BUS', 'METRO', 'SUBWAY'].includes(currentLeg.transitMode)) {
            return currentLeg;
        }
        const nextLeg = getNextLegOrder(journeyData, currentLeg.staticInfo.legOrder);
        if (nextLeg && ['BUS', 'METRO', 'SUBWAY'].includes(nextLeg.transitMode)) {
            return nextLeg;
        }
        return undefined;
    }, [currentLeg, journeyData]);

    // Effective legs for details and timetable
    const effectiveLegForDetailedTracking = useMemo(
        () => overrideDetailedLeg ?? legForDetailedTracking,
        [overrideDetailedLeg, legForDetailedTracking],
    );
    const effectiveLegForTimetable = useMemo(
        () => overrideTimetableLeg ?? legForDetailedTracking,
        [overrideTimetableLeg, legForDetailedTracking],
    );

    // Per-leg callbacks for next-leg CTAs
    const showDetailedTransitTrackingForLeg = useCallback((leg: ProcessedLegInfo) => {
        setOverrideDetailedLeg(leg);
        setShowDetailedTransitTracking(true);
    }, []);

    const showTimeTableForLeg = useCallback(
        (leg: ProcessedLegInfo) => {
            setOverrideTimetableLeg(leg);
            timeTableBottomSheetModalRef.current?.present();
        },
        [timeTableBottomSheetModalRef],
    );

    const isTrackModeAvailable = useMemo(() => {
        return (
            effectiveLegForDetailedTracking?.vehicleState !== 'NOLIVEDATA' &&
            effectiveLegForDetailedTracking?.vehicleState !== 'VEHICLEWASMISSED' &&
            effectiveLegForDetailedTracking?.vehicleState !== 'VEHICLEWILLBEMISSED'
        );
    }, [effectiveLegForDetailedTracking]);

    const { recenterMap } = useBusTracking(legForDetailedTracking ?? currentLeg, currentLeg, userLanguageStrings);
    const [triggerSearchResultsQuery] = useLazySearchResultsQuery();

    const trackLostJourneyProps = useMemo(() => {
        return buildTrackLostJourneyProps(journeyData ?? []);
    }, [journeyData]);

    const handlerContext: JourneyActionHandlers.HandlerContext = useMemo(
        () => ({
            navigation,
            dispatch,
            journeyId: createJourneyId(journeyId),
            userId: userId ?? null,
            liveJourneyTransitCheckInModalRef: liveJourneyTransitCheckInModalRef,
            liveJourneyListBottomSheetRef: liveJourneyListBottomSheetRef,
            liveJourneyListDetailBottomSheetRef: liveJourneyListDetailBottomSheetRef,
            liveJourneyUpdateTransitBottomSheetRef: liveJourneyUpdateTransitBottomSheetRef,
            switchToAutoConfirmationModalRef: switchToAutoConfirmationModalRef.current,
            callDriverBottomsheetModalRef,
            triggerSearchResultsQuery,
            currentLeg: currentLeg,
            actions,
            ticketUIRef: ticketUIRef.current,
            timeTableRef: timeTableBottomSheetModalRef,
            dismissPopup: undefined,
            liveJourneyMetroConfirmLocationBottomSheetRef: liveJourneyMetroConfirmLocationBottomSheetRef,
            rideDistance: rideDistance,
            otpModalRef: otpModalRef,
            userLanguageStrings: userLanguageStrings,
            showDetailedTransitTrackingForLeg,
            showTimeTableForLeg,
            allLegs: journeyData,
        }),
        [
            navigation,
            dispatch,
            journeyId,
            userId,
            currentLeg?.isLastLeg,
            actions,
            triggerSearchResultsQuery,
            liveJourneyTransitCheckInModalRef.current,
            ticketUIRef.current,
            timeTableBottomSheetModalRef.current,
            liveJourneyListBottomSheetRef.current,
            liveJourneyListDetailBottomSheetRef.current,
            liveJourneyUpdateTransitBottomSheetRef.current,
            switchToAutoConfirmationModalRef.current,
            rideDistance,
            otpModalRef,
            userLanguageStrings,
            showDetailedTransitTrackingForLeg,
            showTimeTableForLeg,
        ],
    );

    const goBackToOverviewScreen = useCallback(() => {
        JourneyActionHandlers.navigateToOverviewScreen(handlerContext);
    }, [handlerContext]);

    const onCompleteJourney = useCallback(async () => {
        logEvent(EventName.NAMMA_TRANSIT_RIDE_COMPLETED);
        await JourneyActionHandlers.completeJourney(handlerContext);
    }, [handlerContext]);

    const onMarkLegComplete = useCallback(async () => {
        if (!currentLeg) return;
        await JourneyActionHandlers.markLegComplete(handlerContext, currentLeg.staticInfo.legOrder);
    }, [handlerContext, currentLeg]);

    const timeTableProps: NewTimeTableUIProps | undefined = useMemo(() => {
        if (!effectiveLegForTimetable?.staticInfo.timetable || !effectiveLegForTimetable.staticInfo.origin.stationName)
            return undefined;
        return {
            times: effectiveLegForTimetable?.staticInfo.timetable,
            source: effectiveLegForTimetable?.staticInfo.origin.stationName,
            sheetRef: timeTableBottomSheetModalRef,
            mode: effectiveLegForTimetable?.staticInfo.travelMode,
            towardsStation: effectiveLegForTimetable?.staticInfo.towardsStation,
            allTowardsStation: undefined,
            onDismiss: () => setOverrideTimetableLeg(undefined),
        };
    }, [effectiveLegForTimetable?.staticInfo.timetable, effectiveLegForTimetable?.staticInfo.origin.stationName]);

    const detailedTransitTrackingComponentProps = useMemo(
        () =>
            buildDetailedTransitTrackingComponentProps(
                showDetailedTransitTracking,
                effectiveLegForDetailedTracking,
                journeyData,
                handleHideDetailedTransitTracking,
                isTrackModeAvailable,
                rideDistance,
                userLanguageStrings,
            ),
        [
            showDetailedTransitTracking,
            effectiveLegForDetailedTracking,
            isTrackModeAvailable,
            journeyData,
            handleHideDetailedTransitTracking,
            rideDistance,
            userLanguageStrings,
        ],
    );

    const transitCheckInProps = useMemo(() => {
        if (!legForDetailedTracking) return null;
        return buildTransitCheckInProps(legForDetailedTracking, handlerContext);
    }, [legForDetailedTracking, handlerContext]);

    const metroConfirmProps = useMemo(() => {
        if (!journeyData || journeyData.length === 0) return null;

        return {
            allLegs: journeyData,
            onMetroStationConfirm: (legOrder: string, station: Stop) => {
                JourneyActionHandlers.handleMetroStationConfirm(
                    legOrder,
                    station,
                    journeyData,
                    updateLocationManually,
                    handlerContext,
                );
            },
        };
    }, [journeyData, updateLocationManually, handlerContext]);

    const callDriverProps = useMemo(() => {
        const nextLeg = getNextLegOrder(journeyData, currentLeg?.staticInfo.legOrder ?? '');
        if (nextLeg && nextLeg.staticInfo.driverNumber && nextLeg.staticInfo.exoNumber && nextLeg.taxiBookingId) {
            return {
                driverNumber: nextLeg.staticInfo.driverNumber,
                exoNumber: nextLeg.staticInfo.exoNumber,
                bookingId: createBookingId(nextLeg.taxiBookingId ?? ''),
            };
        }
        return null;
    }, [currentLeg, journeyData]);

    const baseReturnShape = useMemo(
        () => ({
            showDetailedTransitTracking,
            onShowDetailedTransitTracking: handleShowDetailedTransitTracking,
            onHideDetailedTransitTracking: handleHideDetailedTransitTracking,
            isLastMile: currentLeg?.isLastLeg ?? false,
            detailedTransitTrackingComponentProps,
            transitCheckInProps,
            recenterMap,
            googleMapsButtonProps: {
                riderLocation: currentLeg?.riderLocation,
                destination: currentLeg?.staticInfo?.destination,
            },
            callDriverProps,
            callDriverBottomsheetModalRef,
        }),
        [
            showDetailedTransitTracking,
            handleShowDetailedTransitTracking,
            handleHideDetailedTransitTracking,
            currentLeg?.isLastLeg,
            detailedTransitTrackingComponentProps,
            recenterMap,
            currentLeg?.riderLocation,
            currentLeg?.staticInfo?.destination,
            callDriverProps,
            callDriverBottomsheetModalRef,
        ],
    );

    const onPressTicket = useCallback(() => {
        JourneyActionHandlers.showTicket(handlerContext);
    }, [handlerContext]);

    if (isLoading || error || !currentLeg || !journeyData || journeyData.length === 0) {
        return LOADING_VIEW_DATA; // Cast for loading state
    }

    const currentUserState = currentLeg.userState;
    const currentVehicleState = currentLeg.vehicleState;
    const currentLegTransitMode = currentLeg.transitMode;

    const activeRule = journeyRules.find(
        rule =>
            rule.screenType === 'LiveJourneyDetail' && // Match screenType
            rule.userStates.includes(currentUserState) &&
            (!rule.vehicleStates || rule.vehicleStates.includes(currentVehicleState)) &&
            rule.transitModes.includes(currentLegTransitMode) &&
            (!rule.condition || rule.condition(currentLeg, journeyData ?? [])),
    );

    console.info('[Journey Detail] Active Rule:', activeRule);

    if (activeRule) {
        const ruleHandlerParams: RuleHandlerParams = {
            currentLeg,
            allLegs: journeyData,
            onPressTicket,
            onPressTrackMode: handleShowDetailedTransitTracking,
            handlerContext,
        };

        const ruleResult = activeRule.handler(ruleHandlerParams);

        /* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */
        return {
            ...baseReturnShape,
            ...ruleResult,
            transitMode: currentLegTransitMode,
            userState: currentUserState,
            vehicleState: currentVehicleState,
            ticketUIProps,
            goBackToOverviewScreen: undefined,
            timeTableProps,
            riderLocationHistory: currentLeg.riderLocationHistory,
            onCompleteJourney,
            onMarkLegComplete,
            locationRefreshViewData: {
                trackLostJourneyProps: trackLostJourneyProps,
                onLegUpdate: (props: LegUpdateType) => {
                    const legToUpdate = journeyData.find(leg => leg.staticInfo.legOrder === props.legOrder);
                    JourneyActionHandlers.handleLegUpdate(
                        props,
                        legToUpdate,
                        journeyData,
                        updateLocationManually,
                        handlerContext,
                    );
                },
            },
            metroConfirmProps,
            onPressStatusBadge: () => {
                JourneyActionHandlers.onPressStatusBadge(
                    handlerContext,
                    journeyData,
                    setPredictedLeg,
                    setShouldAutoOpenUpdateTransit,
                    liveJourneyListDetailBottomSheetRef,
                );
            },
            predictedLeg,
            shouldAutoOpenUpdateTransit,
            setShouldAutoOpenUpdateTransit,
            currentLeg,
        } as LiveJourneyDetailViewData; // Ensure full object matches type
    } else {
        return { ...LOADING_VIEW_DATA, goBackToOverviewScreen };
    }
};

const LiveJourneyDetailFlowInternalComponent: React.FC<LiveJourneyDetailFlowProps> = ({ journeyId }) => {
    const isFocused = useIsFocused();
    const rawViewData = useLiveJourneyDetailFlow({ journeyId }, isFocused);

    useEffect(() => {
        if (rawViewData.goBackToOverviewScreen) {
            rawViewData.goBackToOverviewScreen();
        }
    }, [rawViewData.goBackToOverviewScreen]);

    // Preserve the same reference when the calculated viewData did not change deeply.
    const previousRef = useRef<LiveJourneyDetailViewData | undefined>(undefined);
    const stableViewData = useMemo(() => {
        if (previousRef.current && isEqual(previousRef.current, rawViewData)) {
            return previousRef.current;
        }
        previousRef.current = rawViewData;
        return rawViewData;
    }, [rawViewData]);

    return <LiveJourneyDetailUI viewData={stableViewData} journeyId={journeyId} />;
};

// Memo-wrap to avoid parent re-renders when journeyId is unchanged.
export const LiveJourneyDetailFlowInternal = memo(
    LiveJourneyDetailFlowInternalComponent,
    (prev, next) => prev.journeyId === next.journeyId,
);

export const LiveJourneyDetailFlow: React.FC<LiveJourneyDetailFlowProps> = ({ journeyId }) => {
    const lastKnownLocation = useAppSelector(selectLastKnownLocation);
    const appConfig = useAppSelector(selectAppConfig);

    const initialCoordinate = useMemo(() => {
        if (lastKnownLocation?.lat !== undefined && lastKnownLocation?.lng !== undefined) {
            return {
                latitude: lastKnownLocation.lat,
                longitude: lastKnownLocation.lng,
            };
        }
        return appConfig.merchantData.initialCoordinate;
    }, [lastKnownLocation, appConfig]);

    return (
        <MapProvider initialCoordinate={initialCoordinate} mapId={'MapAfterRide'} fitToMapElementFlag={true}>
            <LiveJourneyDetailFlowInternal journeyId={journeyId} />
        </MapProvider>
    );
};
