import { useContext, useEffect, useRef, useState } from 'react';
import { NativeModules, Platform, useWindowDimensions, AccessibilityInfo } from 'react-native';
import { latLong } from '../../readOnly/api/types/LatLong.gen.tsx';
import { RideId, selectBookingDetailsWithId, selectBookedSourceWithId } from '@/typescript/state/client/booking';
import { useAppDispatch, useAppSelector } from '../state/hooks.ts';
import {
    selectRideDetailsWithId,
    selectStopInfoWithId,
    setDistanceMoved,
    setDriverETA,
    setPickupDistance,
} from '../state/client/ride.ts';
import { FormatedLocation } from '@/typescript/utils/placeUtils.ts';
import useMapRoute from '../Maps/UseMapRouteTS.tsx';
import { selectFeatureFlags } from '@/typescript/state/client/session';
import { LatLng } from 'react-native-maps';
import { dedupCoords } from '../utils/common.ts';
import { COORD_ON_PATH_THRESHOLD_IN_M, GET_EXT_PATH_MIN_DISTANCE_IN_M } from '../constants/common.ts';
import { routeInfo } from '@/readOnly/api/types/RouteInfo.gen.tsx';
import { useFetchRoute, useObserve } from './useRideTracking/utils.tsx';
import { calculateDisplayDistance } from '../components/CustomCallout.tsx';
import { BookingId } from '../state/client/user.ts';
import { useRideRideIdDriverLocationPostMutation } from '@/api/integrations/rtk/RideRideIdDriverLocationPost.ts';
import { getDriverLocResp } from '@/readOnly/api/types/GetDriverLocResp.gen.tsx';
import { VehicleVariant_vehicleVariant } from '@/readOnly/api/types/Enums.gen.tsx';
import { MapContext } from '../Maps/MapContext.tsx';
import { usePolling } from './usePolling';
import { SharedValue } from 'react-native-reanimated';
import useOnAnimationEnd from './useOnAnimationEnd.tsx';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen.tsx';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { truncateArea } from '@/src-v2/utils/common.ts';
import { selectNewFeatureFlags } from '../state/client/session.ts';
import { clearCalloutTextCache } from '../components/AnimatedMapPin.tsx';

const { MapUtils } = NativeModules;

export type NativeLatLng = { latitude: number; longitude: number };

const enableAnimationDebugLogs = false;

// Animation Strategy Thresholds (in route points)
const ANIMATION_DIRECT_JUMP_THRESHOLD = 2; // 0-4 points: Direct jump (no animation)
const ANIMATION_SMOOTH_TRAVERSAL_THRESHOLD = 15; // 5-15 points: Smooth animation, 16+: Direct jump

const animDebugLog = (...args: (string | object | number | boolean)[]) => {
    if (enableAnimationDebugLogs) {
        console.info('routeAnimation', ...args);
    }
};

// A hook for RideTracking
// Simply call this and it will handle ride tracking
// Needs to pass - Source, Destination and RideId of the tracking ride
// All logic related to RideTracking should be handled here

type UseRideTrackingProps = {
    source: FormatedLocation | null;
    destination: FormatedLocation | undefined;
    stops: FormatedLocation[];
    bookingId: BookingId | null;
    rideId: RideId | null;
    animatedPosition: SharedValue<number>;
    showEditIcon: boolean | undefined;
    onDestClick: (() => void) | undefined;
    showChatBar: boolean;
    isScreenFocused: boolean | undefined;
    isAutoRecenterEnabled: boolean | undefined;
};
export const useRideTracking = ({
    source,
    destination,
    stops,
    bookingId,
    rideId,
    animatedPosition,
    showEditIcon,
    onDestClick,
    showChatBar,
    isScreenFocused,
    isAutoRecenterEnabled = true,
}: UseRideTrackingProps) => {
    // API call helpers
    const fetchRoute = useFetchRoute();

    // Local states
    const currRoute = useRef<NativeLatLng[]>([]);
    const currRouteIndex = useRef(0);
    const isAnimationPending = useRef(false);
    const currAnimIndex = useRef(0);
    const isRouteInitialized = useRef(false);
    const rideDetailsRef = useRef<rideAPIEntity | null>(null);
    const etaArrivedLoggedRef = useRef(false);
    const lastAnnouncedMilestoneRef = useRef<number>(Number.MAX_SAFE_INTEGER);
    const bottomPadOffset = Platform.OS == 'ios' ? 60 : -12;
    const [topPadOffset, setTopPadOffset] = useState(Platform.OS == 'ios' ? 130 : 80);
    useEffect(() => {
        setTopPadOffset(showChatBar ? (Platform.OS == 'ios' ? 185 : 150) : Platform.OS == 'ios' ? 130 : 80);
    }, [showChatBar]);
    // const topPadOffset = Platform.OS == 'ios' ? 160 : 150;
    const { height: ScreenHeight } = useWindowDimensions();

    // References
    const cancelCurrentAnimation = useRef<boolean>(false);
    const concurrentThreads = useRef(0);
    const isAutoRecenterEnabledRef = useRef(isAutoRecenterEnabled);
    useEffect(() => {
        isAutoRecenterEnabledRef.current = isAutoRecenterEnabled;
    }, [isAutoRecenterEnabled]);

    // Redux state data
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId ?? null));
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId ?? null));
    const featureFlags = useAppSelector(selectFeatureFlags);
    const { maxDriverPickupETA } = useAppSelector(selectNewFeatureFlags);
    const stopInfo = useAppSelector(state => selectStopInfoWithId(state, rideId));
    const dispatch = useAppDispatch();
    // Map Context
    const bookedSource = useAppSelector(state => selectBookedSourceWithId(state, bookingId));

    const updateMapPadding = (currPosition: number) => {
        const bottomPad = ScreenHeight - currPosition + bottomPadOffset;
        mapRef.current?.addMapPadding({
            left: undefined,
            top: topPadOffset,
            right: undefined,
            bottom: bottomPad,
        });
    };

    useOnAnimationEnd(animatedPosition, useRef(true), updateMapPadding);

    // Maps functions
    const {
        drawTrackingRoute,
        updateTrackingRoute,
        cancelTrackingAnimation,
        redrawRouteWOTrackingMarker,
        moveTrackingMarker,
    } = useMapRoute(rideId ?? null, bookingDetails?.rideList.at(0)?.vehicleVariant);

    // Map Context
    const { mapRef } = useContext(MapContext);

    // Forward Dispatch case
    const driverPrevRideDest: latLong | undefined =
        bookingDetails && bookingDetails.driversPreviousRideDropLocLat && bookingDetails.driversPreviousRideDropLocLon
            ? {
                  lat: bookingDetails.driversPreviousRideDropLocLat,
                  lon: bookingDetails.driversPreviousRideDropLocLon,
              }
            : undefined;

    // todo - move to typescript ConfigManager
    const driver_location_api_interval = rideDetails?.status === 'INPROGRESS' ? 4000 : 2000;

    // UseEffect for rideDetails status
    useObserve([rideDetails?.status], () => {
        if (rideDetails?.status == 'INPROGRESS') {
            clearCalloutTextCache('routeStart');
            currRoute.current = [];
            currRouteIndex.current = 0;
            if (isAutoRecenterEnabledRef.current) {
                mapRef.current?.fitToMapElements({ duration: 500 });
            }
        }
    });

    const [getDriverLocation, { data: currentLocation, isLoading }] = useRideRideIdDriverLocationPostMutation();
    const driverLocation = useRef<getDriverLocResp | undefined>(currentLocation);

    useEffect(() => {
        if (!isLoading) driverLocation.current = currentLocation;
    }, [currentLocation]);

    useEffect(() => {
        return () => {
            // Clear map on unmount
            cancelCurrentAnimation.current = true;
            mapRef.current?.removeRoute('defaultRoute');
            clearCalloutTextCache('routeStart');
        };
    }, []);

    useEffect(() => {
        rideDetailsRef.current = rideDetails;
    }, [rideDetails?.status]);

    useEffect(() => {
        currRoute.current = [];
        isRouteInitialized.current = false;
    }, [bookedSource, source, destination, stopInfo?.stop, stopInfo?.status]);

    const checkForDeviationAndUpdateStates = async (currDriverLocation: getDriverLocResp) => {
        'worklet';

        animDebugLog('checkForDeviationAndUpdateStates called');
        if (!currDriverLocation?.lat || !currDriverLocation?.lon) {
            animDebugLog('Invalid driver location', currDriverLocation);
            return;
        }

        const etaInMinutes = currDriverLocation.pickupEtaInMinutes;
        if (etaInMinutes !== undefined) {
            const eta = Math.round(Math.min(etaInMinutes, maxDriverPickupETA));
            dispatch(setDriverETA({ id: rideId, payload: eta }));

            // Log only the first time we receive a valid pickup ETA from driver location API
            if (!etaArrivedLoggedRef.current && rideId) {
                logEvent(EventName.NY_USER_INITIAL_DRIVER_PICKUP_ETA, {
                    RideId: rideId,
                    VehicleVariant: rideDetails?.vehicleVariant,
                    PickupETA: etaInMinutes,
                });
                etaArrivedLoggedRef.current = true;
            }
        }

        try {
            const driverLoc: NativeLatLng = {
                latitude: currDriverLocation.lat,
                longitude: currDriverLocation.lon,
            };

            // Determine the route segment to search for snapping
            // For multi-stop rides, only search within the current segment (driver -> first stop)
            // This prevents incorrect snapping to future segments when paths overlap (e.g., U-turns)
            /* eslint-disable functional/no-let */
            let routeForSnapping = currRoute.current;

            if (rideDetailsRef.current?.status === 'INPROGRESS' && stops.length > 0 && currRoute.current.length > 0) {
                const firstStop = stops[0];
                if (firstStop?.lat && firstStop?.lng) {
                    const firstStopLatLng: NativeLatLng = {
                        latitude: firstStop.lat,
                        longitude: firstStop.lng,
                    };
                    const stopPointResult = await MapUtils.getClosestPointOnPath(firstStopLatLng, currRoute.current);
                    if (stopPointResult && stopPointResult.segmentIndex >= 0) {
                        const segmentEndIndex = Math.min(stopPointResult.segmentIndex + 3, currRoute.current.length);
                        routeForSnapping = currRoute.current.slice(0, segmentEndIndex);
                        animDebugLog(
                            'Limited route for snapping:',
                            'originalLength:',
                            currRoute.current.length,
                            'segmentEndIndex:',
                            segmentEndIndex,
                            'firstStop:',
                            firstStop.lat,
                            firstStop.lng,
                        );
                    }
                }
            }

            const res = await MapUtils.getClosestPointOnPath(driverLoc, routeForSnapping);
            const onPathIndex = res.distance > COORD_ON_PATH_THRESHOLD_IN_M ? -1 : res.segmentIndex;

            animDebugLog(
                'LocUpdate onPathIndex',
                onPathIndex,
                currDriverLocation.lat,
                currDriverLocation.lon,
                routeForSnapping.length,
                `${new Date().getSeconds()}:${new Date().getMilliseconds()}`,
            );

            if (onPathIndex === -1) {
                const routeResp = await fetchRoute(
                    currDriverLocation,
                    source,
                    destination,
                    stops,
                    rideDetailsRef.current,
                    driverPrevRideDest,
                    rideId,
                );
                animDebugLog('currRoute.length:', currRoute.current.length, 'onPathIndex:', onPathIndex);
                await handleRouteChange(routeResp);
            } else {
                // Update route index and animation state
                currRouteIndex.current = onPathIndex;
                if (currAnimIndex.current > onPathIndex) {
                    currAnimIndex.current = onPathIndex;
                }
                isAnimationPending.current = true;
                await animateVehicle(onPathIndex);
            }
        } catch (error) {
            console.error('Error in deviation check:', error, currDriverLocation);
        }
    };

    const announceDriverDistance = (rawDistanceInMeters: number) => {
        if (rideDetailsRef.current?.status === 'NEW') {
            AccessibilityInfo.isScreenReaderEnabled().then(isEnabled => {
                if (isEnabled) {
                    if (rawDistanceInMeters < 0) {
                        return;
                    }

                    const currentMilestone = Math.floor(rawDistanceInMeters / 100);

                    if (rawDistanceInMeters === 0) {
                        if (lastAnnouncedMilestoneRef.current !== -1) {
                            lastAnnouncedMilestoneRef.current = -1;
                        }
                    } else if (currentMilestone >= 1 && currentMilestone < lastAnnouncedMilestoneRef.current) {
                        const announcementVal = currentMilestone * 100;
                        AccessibilityInfo.announceForAccessibility(`Driver is ${announcementVal} meters away from you`);
                        lastAnnouncedMilestoneRef.current = currentMilestone;
                    } else if (
                        currentMilestone === 0 &&
                        lastAnnouncedMilestoneRef.current > 0 &&
                        lastAnnouncedMilestoneRef.current !== Number.MAX_SAFE_INTEGER
                    ) {
                        lastAnnouncedMilestoneRef.current = 0;
                    }
                }
            });
        }
    };

    const animateVehicle = async (onPathIndex: number) => {
        animDebugLog(
            'useEffect ==> isAnimationPending',
            isAnimationPending,
            'cancelCurrentAnimation.current',
            cancelCurrentAnimation.current,
            'concurrentThreads',
            concurrentThreads.current,
        );

        // When useEffect is invoked multiple times, we need to ensure that only one animation loop is running at a time
        if (++concurrentThreads.current > 1) {
            animDebugLog('CustomDebug Concurrent thread detected, skipping animation', concurrentThreads.current);
            concurrentThreads.current--;
            return;
        }

        const pollingInterval = 1800;
        const indexDiff = Math.max(onPathIndex - currAnimIndex.current, 1);

        animDebugLog('Animation indexDiff:', indexDiff, 'from', currAnimIndex.current, 'to', onPathIndex);

        try {
            // 3-Stage Smart Animation Strategy:
            // Stage 1: 0-ANIMATION_DIRECT_JUMP_THRESHOLD points -> Direct jump (too close for animation)
            // Stage 2: (ANIMATION_DIRECT_JUMP_THRESHOLD+1)-ANIMATION_SMOOTH_TRAVERSAL_THRESHOLD points -> Traverse every 2nd or 3rd point (smooth animation)
            // Stage 3: (ANIMATION_SMOOTH_TRAVERSAL_THRESHOLD+1)+ points -> Direct jump (too far, instant update)

            if (indexDiff <= ANIMATION_DIRECT_JUMP_THRESHOLD) {
                // Stage 1: Direct jump for very close distances
                animDebugLog('Stage 1: Direct jump (≤' + ANIMATION_DIRECT_JUMP_THRESHOLD + ' points)', indexDiff);
                currAnimIndex.current = onPathIndex;
                await updateTrackingRoute(
                    rideDetailsRef.current?.status == 'NEW',
                    currRoute.current,
                    onPathIndex,
                    dispatch,
                    pollingInterval,
                );
            } else if (indexDiff <= ANIMATION_SMOOTH_TRAVERSAL_THRESHOLD) {
                // Stage 2: Smooth traversal for medium distances
                // Traverse every 2nd or 3rd point based on distance
                const skipInterval = indexDiff <= 8 ? 2 : 3;
                const numSteps = Math.ceil(indexDiff / skipInterval);
                const animateDuration = pollingInterval / numSteps;

                animDebugLog(
                    'Stage 2: Smooth traversal (5-' + ANIMATION_SMOOTH_TRAVERSAL_THRESHOLD + ' points)',
                    'indexDiff:',
                    indexDiff,
                    'skipInterval:',
                    skipInterval,
                    'numSteps:',
                    numSteps,
                );

                let mutableI = currAnimIndex.current;
                for (; mutableI <= onPathIndex; mutableI += skipInterval) {
                    if (cancelCurrentAnimation.current) {
                        cancelTrackingAnimation();
                        setTimeout(() => {
                            animDebugLog('Reset cancelCurrentAnimation.current');
                            cancelCurrentAnimation.current = false;
                        });
                        break;
                    }
                    animDebugLog('Animate to point', mutableI, 'duration', animateDuration);
                    currAnimIndex.current = mutableI;
                    await updateTrackingRoute(
                        rideDetailsRef.current?.status == 'NEW',
                        currRoute.current,
                        mutableI,
                        dispatch,
                        animateDuration,
                    );
                }

                // Ensure we reach the exact target point
                if (mutableI > onPathIndex && currAnimIndex.current !== onPathIndex) {
                    animDebugLog('Final adjustment to exact target', onPathIndex);
                    currAnimIndex.current = onPathIndex;
                    await updateTrackingRoute(
                        rideDetailsRef.current?.status == 'NEW',
                        currRoute.current,
                        onPathIndex,
                        dispatch,
                        animateDuration,
                    );
                }

                if (rideDetailsRef.current?.status === 'NEW') {
                    const distanceTrav = await MapUtils.computeLength(currRoute.current.slice(onPathIndex));
                    announceDriverDistance(distanceTrav);
                }
            } else {
                // Stage 3: Direct jump for far distances
                animDebugLog('Stage 3: Direct jump (>' + ANIMATION_SMOOTH_TRAVERSAL_THRESHOLD + ' points)', indexDiff);
                currAnimIndex.current = onPathIndex;
                await updateTrackingRoute(
                    rideDetailsRef.current?.status == 'NEW',
                    currRoute.current,
                    onPathIndex,
                    dispatch,
                    pollingInterval,
                );
            }
        } catch (error) {
            console.error('Error while animating route: ', error);
        }

        animDebugLog('setIsAnimationPending = false =>> animation done', currAnimIndex, onPathIndex);
        isAnimationPending.current = false;

        if (isAutoRecenterEnabledRef.current) {
            setTimeout(() => {
                if (isAutoRecenterEnabledRef.current) {
                    mapRef.current?.fitToCoordinates({
                        coordinates: currRoute.current.slice(onPathIndex),
                        duration: 1000,
                    });
                }
            }, 100);
        }

        concurrentThreads.current--;
    };

    const handleRouteChange = async (routeInfo: routeInfo | undefined) => {
        if (!routeInfo) {
            animDebugLog('handleRouteChange: routeInfo is undefined');
            return;
        }

        const initialRoute = (routeInfo.points || []).map(point => ({
            latitude: point.lat,
            longitude: point.lon,
        }));

        const distanceLeft = await MapUtils.computeLength(initialRoute);

        // Fixed threshold calculation
        const threshold = 25000;

        const extendedRoute =
            initialRoute.length > 0 && distanceLeft < threshold
                ? await MapUtils.getExtendedPath(initialRoute, GET_EXT_PATH_MIN_DISTANCE_IN_M)
                : initialRoute;

        const dedupedRoute = dedupCoords(extendedRoute);

        // Ref updates
        currRoute.current = dedupedRoute;
        [currRouteIndex, currAnimIndex].forEach(ref => (ref.current = 0));

        // State updates
        isAnimationPending.current = false;
        const distanceTrav = await MapUtils.computeLength(dedupedRoute);

        await drawRoute(
            dedupedRoute,
            0,
            distanceTrav,
            bookingDetails?.rideList.at(0)?.vehicleVariant,
            onDestClick,
            showEditIcon,
        );

        updateMapPadding(animatedPosition.get());

        dispatch(
            rideDetailsRef.current?.status === 'NEW'
                ? setPickupDistance({ id: rideId, payload: distanceTrav })
                : setDistanceMoved({ id: rideId, payload: distanceTrav }),
        );
    };

    const drawRoute = async (
        currRoute: LatLng[],
        onPathIndex: number,
        distanceTrav: number,
        vehicleVariant: VehicleVariant_vehicleVariant | undefined,
        onDestClick: (() => void) | undefined,
        showEditIcon: boolean | undefined,
    ) => {
        if (!currRoute) {
            animDebugLog('drawRoute: currRoute is undefined');
            return;
        }
        // dispatch(setDistanceMoved({ id: rideId ?? null, payload: distanceTrav }));
        const { displayDistance, displayUnit } = calculateDisplayDistance(distanceTrav);
        const destinationPoints =
            rideDetailsRef.current?.status === 'NEW'
                ? // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                  ([currRoute.at(currRoute.length - 1)] as LatLng[])
                : stops
                      .filter(stop => stop !== null)
                      .map(stop => ({
                          latitude: stop.lat,
                          longitude: stop.lng,
                      }));
        const destinationTitles = stops.filter(stop => stop !== null).map(stop => stop.area);
        if (isRouteInitialized.current) {
            // Redraw route only and animate marker
            await redrawRouteWOTrackingMarker({
                coordinates: currRoute,
                destinationPoints,
                destinationTitles,
                driverPrevRideDest: driverPrevRideDest && {
                    latitude: driverPrevRideDest.lat,
                    longitude: driverPrevRideDest.lon,
                },
                stopInfo: stopInfo,
            });
            await moveTrackingMarker({
                route: currRoute,
                currIdx: 0,
                calloutText: `${displayDistance}${displayUnit} away`,
                duration: 500,
            });
        } else {
            clearCalloutTextCache('routeStart');
            await drawTrackingRoute({
                coordinates: currRoute.slice(onPathIndex),
                isPickup: rideDetailsRef.current?.status === 'NEW',
                srcText: `${displayDistance}${displayUnit} away`,
                destinationPoints,
                destinationTitles,
                driverPrevRideDest: driverPrevRideDest && {
                    latitude: driverPrevRideDest.lat,
                    longitude: driverPrevRideDest.lon,
                },
                vehicleVariant: vehicleVariant,
                destAddress:
                    bookedSource && rideDetailsRef.current?.status === 'NEW'
                        ? truncateArea(bookedSource.area)
                        : undefined,
                onDestClick: onDestClick,
                showEditIcon,
                stopInfo,
            });
            isRouteInitialized.current = true;
        }
        if (currRoute.length > 0 && isAutoRecenterEnabledRef.current) {
            setTimeout(() => {
                if (isAutoRecenterEnabledRef.current) {
                    mapRef.current?.fitToCoordinates({
                        coordinates: currRoute,
                        duration: 500,
                    });
                }
            }, 100);
        }
    };

    usePolling({
        callApiFn: getDriverLocation,
        cause: 'Driver Location',
        params: { rideId },
        pollingInterval: driver_location_api_interval,
        conditionToCall: () => {
            // Stop polling if screen is not focused (regardless of booking status)
            if (!isScreenFocused) {
                return false;
            }
            if (
                bookingDetails?.status === 'COMPLETED' ||
                bookingDetails?.status === 'CANCELLED' ||
                bookingDetails?.status === 'REALLOCATED'
            ) {
                return false;
            }
            const shouldPoll =
                rideId !== null &&
                ((rideDetailsRef.current &&
                    rideDetailsRef.current.status &&
                    (rideDetailsRef.current.status === 'NEW' || rideDetailsRef.current.status === 'INPROGRESS')) ||
                    (rideDetailsRef.current?.status !== 'NEW' && featureFlags.postRideStartFragment));
            return shouldPoll;
        },
        postApiCall: checkForDeviationAndUpdateStates,
        forceRefetchDeps: [
            source,
            destination,
            rideId,
            JSON.stringify(stopInfo?.stop),
            rideDetails,
            bookingDetails?.status,
            isScreenFocused,
        ],
        postApiCallError: async () => {},
        enable: true,
    });

    return driverLocation.current;
};
