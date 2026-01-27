// TODO: Remove this lint rule once we have a better way to handle the types
/* eslint-disable myCustomPlugin/no-as-in-modified-files */
// import { useAppDispatch } from '@/typescript/state/hooks';
import {
    multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPostWithParams,
    useMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPostMutation,
} from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPost';
import { JourneyId } from '@/typescript/state/client/user';
import { useCallback, useMemo } from 'react';
import {
    TrackingStatus_trackingStatus,
    MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';
import { latLong, ProcessedLegInfo, VehicleState } from '../types/journeyTracking';
import { getOrder, getSubOrder } from '../utils/journeyTrackingUtils';
import { getTrackingStatusForLeg } from '@/typescript/utils/LegStatusUtils';
import { useMultimodalJourneyIdCompletePostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdCompletePost';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    updateJourneyLegStatus,
    selectJourneyLegs,
    clearAllJourneyState,
    setLegIsLoading,
    clearLegIsLoading,
    setJourneyResp,
    setJourneyRefreshFlag,
    clearAllLegLoading,
} from '@/typescript/state/client/journey';
import { useApiWithOfflineFallback } from '@/typescript/hooks/useApiWithOfflineFallback.ts';
import { isEqual, isNull } from 'lodash';
import { useMultimodalJourneyIdSwitchPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdSwitchPost';

import {
    getAddressByLatLon,
    transformLocationAddressTypeToFormatedLocation,
    transformLocationToAPIEntity,
} from '@/typescript/utils/placeUtils';
import { switchLegReq } from '@/readOnly/api/types/SwitchLegReq.gen';
import { useMultimodalJourneyJourneyIdLegLegOrderAddSkippedLegPostMutation } from '@/api/integrations/rtk/MultimodalJourneyJourneyIdLegLegOrderAddSkippedLegPost';
import { useMultimodalJourneyJourneyIdLegLegOrderSkipPostMutation } from '@/api/integrations/rtk/MultimodalJourneyJourneyIdLegLegOrderSkipPost';
import { clearAllMapSnapshots } from '../utils/mapSnapshotUtils';
import { usePostSelect2Mutation } from '@/typescript/state/server/estimateApi';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { taxiLegExtraInfo } from '@/readOnly/api/types/TaxiLegExtraInfo.gen';
import { walkLegExtraInfo } from '@/readOnly/api/types/WalkLegExtraInfo.gen';
import { extendLegStartPoint } from '@/readOnly/api/types/ExtendLegStartPoint.gen';
import { getDestinationLatLon } from '@/typescript/utils/MultiModal';
import { metroLegExtraInfo } from '@/readOnly/api/types/MetroLegExtraInfo.gen';
import { getPlaceIdByLatLon } from '@/typescript/utils/location';
import { busLegExtraInfo } from '@/readOnly/api/types/BusLegExtraInfo.gen';
import { setToastProps } from '@/typescript/state/client/session';
import { journeyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.gen';
import { checkTaxiLeg } from '@/typescript/utils/common';

export type JourneyActions = {
    checkIn: (legOrder: string) => Promise<void>;
    reachedStation: (legOrder: string) => Promise<void>;
    markLegComplete: (legOrder: string) => Promise<void>;
    updateLegStatus: (legOrder: string, status: VehicleState) => Promise<void>;
    skipCurrentVehicle: (legOrder: string) => Promise<void>;
    completeJourney: () => Promise<journeyStatusResp>;
    switchBetweenAutoAndWalk: (
        legOrder: number,
        newMode: MultimodalTravelMode_multimodalTravelMode,
        riderLatLng: latLong | undefined,
    ) => Promise<void>;
    rebookSkippedLeg: (legOrder: string, journeyId: JourneyId) => Promise<boolean>;
    skipJourneyLeg: (legOrder: string, journeyId: JourneyId) => Promise<boolean>;
    selectPricingId: (legOrder: string, pricingId: string) => Promise<void>;
};

// Selector to get current status of a specific leg
const getCurrentLegStatus = (
    legs: ReturnType<typeof selectJourneyLegs>,
    legOrder: string,
): TrackingStatus_trackingStatus | null => {
    const legOrderNumber = getOrder(legOrder);
    const subLegOrder = getSubOrder(legOrder);

    const leg = legs.find(leg => leg.order === legOrderNumber);
    if (!leg) return null;

    // Use the new utility function to get tracking status
    return getTrackingStatusForLeg(leg, subLegOrder);
};

export const handleEditDestinationFunc = async (
    legOrder: number | null,
    onGoingLeg: legInfo | ProcessedLegInfo | null,
    rideOptionsLeg: legInfo | ProcessedLegInfo | null,
    journeyId: JourneyId | null,
    journeyLegs: legInfo[] | ProcessedLegInfo[],
    currentLocation: location | latLong | null,
    navigation: NativeStackNavigationProp<MainNavigationParamList>,
    rideOptionsModalRef: React.RefObject<BottomSheetModal | null> | null,
    journeyOptionsModalRef: React.RefObject<BottomSheetModal | null> | null,
    skipEditLocation: boolean = false,
) => {
    // Helper function to check if it's ProcessedLegInfo
    const isProcessedLegInfo = (leg: legInfo | ProcessedLegInfo): leg is ProcessedLegInfo => {
        return 'staticInfo' in leg && 'transitMode' in leg;
    };

    // For ProcessedLegInfo case (direct booking)
    if (skipEditLocation && onGoingLeg && isProcessedLegInfo(onGoingLeg)) {
        const targetLeg = onGoingLeg || (rideOptionsLeg && isProcessedLegInfo(rideOptionsLeg) ? rideOptionsLeg : null);

        if (!targetLeg) {
            console.error('Unable to Edit Destination - No leg available');
            return false;
        }

        const isCurrentLeg = onGoingLeg !== null;

        const source = (() => {
            switch (targetLeg.transitMode) {
                case 'BUS': {
                    return targetLeg.staticInfo.origin.latLong.lat && targetLeg.staticInfo.origin.latLong.lon
                        ? {
                              area: '',
                              address: targetLeg.staticInfo.origin.stationName ?? '',
                              lat: targetLeg.staticInfo.origin.latLong.lat,
                              lng: targetLeg.staticInfo.origin.latLong.lon,
                          }
                        : undefined;
                }
                case 'METRO':
                case 'SUBWAY': {
                    return targetLeg.staticInfo.origin.latLong.lat && targetLeg.staticInfo.origin.latLong.lon
                        ? {
                              area: '',
                              address: targetLeg.staticInfo.origin.stationName ?? '',
                              lat: targetLeg.staticInfo.origin.latLong.lat,
                              lng: targetLeg.staticInfo.origin.latLong.lon,
                          }
                        : undefined;
                }
                case 'AUTO':
                case 'BIKE':
                case 'WALK': {
                    return targetLeg.staticInfo.origin.latLong.lat && targetLeg.staticInfo.origin.latLong.lon
                        ? {
                              area: '',
                              address: targetLeg.staticInfo.origin.stationName ?? '',
                              lat: targetLeg.staticInfo.origin.latLong.lat,
                              lng: targetLeg.staticInfo.origin.latLong.lon,
                          }
                        : undefined;
                }
                default:
                    return undefined;
            }
        })();

        // Function to process and return current location
        const processCurrentLocation = async (): Promise<location | null> => {
            if (currentLocation && 'lat' in currentLocation && 'lon' in currentLocation) {
                const result = await getPlaceIdByLatLon(currentLocation.lat, currentLocation.lon, undefined);
                if (result.result) {
                    return result.result;
                }
            }
            return null;
        };

        const currentLoc =
            currentLocation && 'title' in currentLocation ? currentLocation : await processCurrentLocation();

        // Calculate current route info using ProcessedLegInfo data from targetLeg onwards
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const currentRouteInfo = (journeyLegs as ProcessedLegInfo[]).reduce<{ distance: number; fare: number }>(
            (acc, item) => {
                if (item.currentLeg >= targetLeg.currentLeg)
                    return {
                        distance: acc.distance + (item.distanceValue ?? 0),
                        fare: acc.fare + 0, // ProcessedLegInfo doesn't have fare info
                    };
                else return acc;
            },
            { distance: 0, fare: 0 },
        );

        /**
         * Determines whether to send the current location based on the current leg's mode and vehicle state.
         * Returns true if the current leg is an auto or taxi and the vehicle is either  arriving or arrived.
         */
        const sendCurrentLocation =
            isCurrentLeg && checkTaxiLeg(targetLeg.transitMode)
                ? !['NODRIVERFOUND', 'SEARCHINGFORVEHICLE', 'VEHICLEBOOKINGPENDING', 'RIDESKIPPED'].includes(
                      targetLeg?.vehicleState,
                  )
                : false;
        const startLocation: extendLegStartPoint =
            sendCurrentLocation && currentLocation
                ? {
                      TAG: 'StartLocation',
                      _0: {
                          legOrder: getOrder(targetLeg.currentLeg),
                          // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                          location: transformLocationToAPIEntity(currentLoc ?? (currentLocation as location)),
                      },
                  }
                : { TAG: 'StartLegOrder', _0: { contents: getOrder(targetLeg.currentLeg) } };

        // Get destination from last leg (final destination of the journey)
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const finalDestinationLeg = (journeyLegs as ProcessedLegInfo[])[journeyLegs.length - 1];
        const destinationLat = finalDestinationLeg?.staticInfo?.destination?.latLong?.lat ?? 0;
        const destinationLon = finalDestinationLeg?.staticInfo?.destination?.latLong?.lon ?? 0;

        if (source) {
            navigation.navigate('editDestination', {
                rideId: null,
                lat: source?.lat,
                lon: source?.lng,
                source: source,
                currentDriverLat: undefined,
                currentDriverLon: undefined,
                setIsUpdateRequired: () => {},
                skipEditLocation: true,
                multimodalExtendLegProps: journeyId
                    ? {
                          journeyId: journeyId,
                          extendTillEnd: true,
                          previousDistance: currentRouteInfo.distance,
                          previousFare: currentRouteInfo.fare,
                          startLocation: startLocation,
                          getFare: isNull(targetLeg.currentLeg),
                          currentLegIsTaxi: targetLeg.transitMode === 'AUTO' || targetLeg.transitMode === 'BIKE',
                          destinationLat,
                          destinationLon,
                      }
                    : undefined,
            });

            return true;
        } else {
            console.error('Unable to Edit Destination - Empty Source');
            return false;
        }
    } else {
        // Original legInfo case (existing functionality)
        const legOrder_ = legOrder || (onGoingLeg && 'order' in onGoingLeg ? onGoingLeg.order : undefined);
        const isCurrentLeg =
            (onGoingLeg && 'order' in onGoingLeg ? onGoingLeg.order : undefined) ===
                (rideOptionsLeg && 'order' in rideOptionsLeg ? rideOptionsLeg.order : -1) || isNull(rideOptionsLeg);

        const legInfo =
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            rideOptionsLeg || (journeyLegs as legInfo[]).find(leg => 'order' in leg && leg.order === legOrder_);

        if (!legInfo || !('legExtraInfo' in legInfo)) return false;

        const source = (() => {
            // const legInfo = legInfo as legInfo;
            switch (legInfo.legExtraInfo.TAG) {
                case 'Bus': {
                    const legExtraInfo: busLegExtraInfo = legInfo.legExtraInfo._0;
                    return legExtraInfo.originStop.lat && legExtraInfo.originStop.lon
                        ? {
                              area: '',
                              address: legExtraInfo.originStop.name ?? '',
                              lat: legExtraInfo.originStop.lat,
                              lng: legExtraInfo.originStop.lon,
                          }
                        : undefined;
                }
                case 'Metro':
                case 'Subway': {
                    const legExtraInfo: metroLegExtraInfo = legInfo.legExtraInfo._0;
                    const route = legExtraInfo.routeInfo[0];
                    return route?.originStop.lat && route?.originStop.lon
                        ? {
                              area: '',
                              address: route?.originStop.name ?? '',
                              lat: route?.originStop.lat,
                              lng: route?.originStop.lon,
                          }
                        : undefined;
                }
                case 'Taxi':
                case 'Walk': {
                    const legExtraInfo: taxiLegExtraInfo | walkLegExtraInfo = legInfo.legExtraInfo._0;
                    return legExtraInfo.origin.lat && legExtraInfo.origin.lon
                        ? transformLocationAddressTypeToFormatedLocation(
                              legExtraInfo.origin.address,
                              legExtraInfo.origin.lat,
                              legExtraInfo.origin.lon,
                          )
                        : undefined;
                }
                default:
                    return undefined;
            }
        })();

        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const currentRouteInfo = (journeyLegs as legInfo[]).reduce<{ distance: number; fare: number }>(
            (acc, item) => {
                if (legInfo && 'order' in legInfo && 'order' in item && item.order >= legInfo.order)
                    return {
                        distance: acc.distance + (item.estimatedDistance?.value ?? 0),
                        fare: acc.fare + (item.estimatedMinFare?.amount ?? 0),
                    };
                else return acc;
            },
            { distance: 0, fare: 0 },
        );

        const taxiTrackingStatus = getTrackingStatusForLeg(legInfo, 1);

        const sendCurrentLocation =
            isCurrentLeg && taxiTrackingStatus && 'travelMode' in legInfo && legInfo?.travelMode === 'Taxi'
                ? !['InPlan'].includes(taxiTrackingStatus)
                : isCurrentLeg;

        const startLocation: extendLegStartPoint =
            sendCurrentLocation && currentLocation
                ? {
                      TAG: 'StartLocation',
                      _0: {
                          legOrder: 'order' in legInfo ? legInfo.order : 0,
                          // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                          location: transformLocationToAPIEntity(currentLocation as location),
                      },
                  }
                : { TAG: 'StartLegOrder', _0: { contents: 'order' in legInfo ? legInfo.order : 0 } };

        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        const { destinationLat, destinationLon } = getDestinationLatLon(journeyLegs as legInfo[]);

        if (source) {
            navigation.navigate('editDestination', {
                rideId: null,
                lat: source?.lat,
                lon: source?.lng,
                source: source,
                currentDriverLat: undefined,
                currentDriverLon: undefined,
                setIsUpdateRequired: () => {},
                skipEditLocation: skipEditLocation,
                multimodalExtendLegProps:
                    journeyId && destinationLat && destinationLon
                        ? {
                              journeyId: journeyId,
                              extendTillEnd: true,
                              previousDistance: currentRouteInfo.distance,
                              previousFare: currentRouteInfo.fare,
                              startLocation: startLocation,
                              getFare: isNull(legOrder),
                              currentLegIsTaxi: 'travelMode' in legInfo && legInfo?.travelMode === 'Taxi',
                              destinationLat,
                              destinationLon,
                          }
                        : undefined,
            });

            rideOptionsModalRef && rideOptionsModalRef.current?.dismiss();
            journeyOptionsModalRef && journeyOptionsModalRef.current?.dismiss();
            return true;
        } else {
            console.error('Unable to Edit Destination - Empty Source');
            return false;
        }
    }
};

export const useJourneyActions = (journeyId: JourneyId | null): JourneyActions => {
    const dispatch = useAppDispatch();
    const [setStatus] = useMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPostMutation();
    const [callCompleteJourney] = useMultimodalJourneyIdCompletePostMutation();
    const { handleApiCallWithOfflineFallback } = useApiWithOfflineFallback();
    const legs = useAppSelector(state => selectJourneyLegs(state, journeyId), isEqual);

    const [switchModeApiCall] = useMultimodalJourneyIdSwitchPostMutation();
    const [skipLegApiCall] = useMultimodalJourneyJourneyIdLegLegOrderSkipPostMutation();
    const [addSkippedApiCall] = useMultimodalJourneyJourneyIdLegLegOrderAddSkippedLegPostMutation();
    const [postSelect2] = usePostSelect2Mutation();

    const updateLegStatusUtil = useCallback(
        async (legOrder: string, status: TrackingStatus_trackingStatus) => {
            if (!journeyId) return;
            try {
                // Get current status from Redux state
                const currentStatus = getCurrentLegStatus(legs, legOrder);

                // Only proceed if status has changed
                if (currentStatus === status) {
                    console.info('Status unchanged, skipping update:', legOrder, status);
                    return;
                }

                const legOrderNumber = getOrder(legOrder);
                const subLegOrder = getSubOrder(legOrder) ?? 1;
                console.info('Handle update leg status', legOrder, status);
                dispatch(
                    updateJourneyLegStatus({
                        id: journeyId,
                        payload: {
                            legOrder: legOrderNumber,
                            mbSubLegOrder: subLegOrder,
                            trackingStatus: status,
                            trackingStatusLastUpdatedAt: new Date().toISOString(),
                        },
                    }),
                );
                // Create mutation config for the new setStatusV2 API
                const setStatus_mutationConfig: multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPostWithParams =
                    {
                        journeyId,
                        legOrder: legOrderNumber,
                        subLegOrder: subLegOrder,
                        trackingStatus: status,
                        trackingStatusLastUpdatedAt: new Date().toISOString(),
                    };

                await handleApiCallWithOfflineFallback({
                    endpoint: 'multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusStatusPost',
                    mutationFn: (cfg: { [k: string]: unknown }) =>
                        setStatus(
                            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                            cfg as {
                                journeyId: string;
                                legOrder: number;
                                subLegOrder: number;
                                trackingStatus: TrackingStatus_trackingStatus;
                                trackingStatusLastUpdatedAt: string;
                            },
                        ).unwrap(),
                    mutationConfig: setStatus_mutationConfig,
                    onlyNoInternet: true,
                });
            } catch (error) {
                console.error('Failed to update leg status:', error);
            }
        },
        [journeyId, legs],
    );
    const switchBetweenAutoAndWalk = useCallback(
        async (legOrder: number, newMode: MultimodalTravelMode_multimodalTravelMode, latLong: latLong | undefined) => {
            if (!journeyId) return;
            dispatch(
                setLegIsLoading({ id: journeyId, payload: { legOrder: legOrder.toString(), journeyRefresh: false } }),
            );
            const { location, locationAddress } = latLong
                ? {
                      location: { latitude: latLong.lat, longitude: latLong.lon },
                      locationAddress: await getAddressByLatLon(latLong.lat, latLong.lon),
                  }
                : { location: undefined, locationAddress: undefined };

            try {
                const switchModeReqBody: switchLegReq = {
                    legOrder,
                    startLocation: location,
                    originAddress: locationAddress,
                    newMode,
                };
                const response = await switchModeApiCall({
                    journeyId,
                    body: switchModeReqBody,
                });
                if (response.error) {
                    console.error('Error while switching mode', response.error);
                    return;
                }
                console.info('Switched to auto mode successfully:', response.data);
                if (response.data) {
                    dispatch(setJourneyResp({ id: journeyId, payload: response.data }));
                    dispatch(clearLegIsLoading({ id: journeyId, payload: { legOrder: legOrder.toString() } }));
                }
            } catch (error) {
                console.error('Error switching to auto mode:', error);
            }
            // Invalidate the cache after switching modes
        },
        [switchModeApiCall, journeyId],
    );

    const completeJourney = useCallback(async () => {
        if (!journeyId) throw new Error('Journey Id Missing');

        const resp = await callCompleteJourney({ journeyId }).unwrap();
        dispatch(setJourneyRefreshFlag({ id: journeyId, payload: true }));
        clearAllMapSnapshots();
        dispatch(clearAllJourneyState());

        return resp;
    }, [journeyId]);

    const checkIn = useCallback(
        async (legOrder: string) => {
            await updateLegStatusUtil(legOrder, 'Ongoing');
        },
        [updateLegStatusUtil],
    );

    const reachedStation = useCallback(
        async (legOrder: string) => {
            await updateLegStatusUtil(legOrder, 'ExitingStation');
        },
        [updateLegStatusUtil],
    );

    const markLegComplete = useCallback(
        async (legOrder: string) => {
            await updateLegStatusUtil(legOrder, 'Finished');
        },
        [updateLegStatusUtil],
    );

    const updateLegStatus = useCallback(
        async (legOrder: string, status: VehicleState) => {
            // Map VehicleState to TrackingStatus directly
            const trackingStatus: TrackingStatus_trackingStatus = (() => {
                switch (status) {
                    case 'VEHICLEALMOSTARRIVED':
                        return 'AlmostArrived';
                    case 'VEHICLEISARRIVING':
                        return 'Arriving';
                    case 'VEHICLEARRIVED':
                        return 'Arrived';
                    case 'RIDESTARTED':
                        return 'Ongoing';
                    case 'ARRIVEDATSTATIONPLATFORM':
                        return 'ExitingStation';
                    case 'RIDECLOSETODESTINATION':
                        return 'Finishing';
                    case 'RIDEREACHEDDESTINATION':
                        return 'Finished';
                    default:
                        return 'InPlan';
                }
            })();
            await updateLegStatusUtil(legOrder, trackingStatus);
        },
        [updateLegStatusUtil],
    );

    const skipCurrentVehicle = useCallback(
        async (legOrder: string) => {
            console.error('Handle skip current vehicle', legOrder);
            // const legOrderNumber = getOrder(legOrder);
            // await updateLegStatusUtil(legOrderNumber, 'Arriving');
        },
        [updateLegStatusUtil],
    );

    const skipJourneyLeg = useCallback(
        async (legOrder: string, journeyId: JourneyId) => {
            if (!journeyId) return false;
            dispatch(setLegIsLoading({ id: journeyId, payload: { legOrder, journeyRefresh: false } }));
            try {
                const result = await skipLegApiCall({
                    journeyId: journeyId,
                    legOrder: getOrder(legOrder),
                });

                if (result.error) {
                    console.error('Error while skipping leg', result.error);
                    dispatch(clearAllLegLoading({ id: journeyId, payload: undefined }));
                    dispatch(
                        setToastProps({
                            message: 'Unable to skip leg. Please try again.',
                            bottomSpanDescription: undefined,
                            useSpannedToast: false,
                            visible: true,
                            spannerType: 'top',
                            backgroundColor: '#EA4848',
                            buttons: [],
                            logo: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            autoDismissAfter: 2000,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                    return false;
                }
                dispatch(setJourneyRefreshFlag({ id: journeyId, payload: true }));
                return true;
            } catch (error) {
                console.error('Error while skipping leg11', error);
                dispatch(clearLegIsLoading({ id: journeyId, payload: { legOrder } }));
                return false;
            }
        },
        [skipLegApiCall, updateLegStatusUtil, dispatch, journeyId],
    );

    const selectPricingId = useCallback(
        async (legOrder: string, pricingId: string) => {
            if (!journeyId) return;
            const body = {
                autoAssignEnabled: true,
                autoAssignEnabledV2: true,
                paymentMethodId: '',
                deliveryDetails: undefined,
                isAdvancedBookingEnabled: undefined,
                customerExtraFeeWithCurrency: undefined,
                customerExtraFee: undefined,
                otherSelectedEstimates: [pricingId],
                disabilityDisable: false,
                billingCategory: undefined,
                isPetRide: false,
            };
            dispatch(setLegIsLoading({ id: journeyId, payload: { legOrder, journeyRefresh: false } }));
            await postSelect2({ estimateId: pricingId, body });
            dispatch(setJourneyRefreshFlag({ id: journeyId, payload: true }));
        },
        [postSelect2, journeyId, dispatch],
    );

    const rebookSkippedLeg = useCallback(
        async (legOrder: string, journeyId: JourneyId) => {
            if (!journeyId) return false;
            dispatch(setLegIsLoading({ id: journeyId, payload: { legOrder, journeyRefresh: false } }));
            try {
                const result = await addSkippedApiCall({
                    journeyId: journeyId,
                    legOrder: getOrder(legOrder),
                });

                if ('error' in result) {
                    console.error('Error while re-booking leg', result.error);
                    return false;
                }

                await updateLegStatusUtil(legOrder, 'InPlan');
                dispatch(setJourneyRefreshFlag({ id: journeyId, payload: true }));
                return true;
            } catch (error) {
                console.error('Error while re-booking leg', error);
                dispatch(clearLegIsLoading({ id: journeyId, payload: { legOrder } }));
                return false;
            }
        },
        [addSkippedApiCall, updateLegStatusUtil, dispatch, journeyId],
    );

    const finalActions = useMemo(() => {
        return {
            checkIn,
            reachedStation,
            markLegComplete,
            updateLegStatus,
            skipCurrentVehicle,
            completeJourney,
            switchBetweenAutoAndWalk,
            skipJourneyLeg,
            rebookSkippedLeg,
            selectPricingId,
        };
    }, [
        checkIn,
        reachedStation,
        markLegComplete,
        updateLegStatus,
        completeJourney,
        switchBetweenAutoAndWalk,
        skipJourneyLeg,
        rebookSkippedLeg,
        selectPricingId,
    ]);

    return finalActions;
};
