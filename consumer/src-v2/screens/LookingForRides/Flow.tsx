import React, { useEffect, useContext, useRef, useMemo } from 'react';
import { runOnJS, SharedValue, withTiming, withSequence, cancelAnimation } from 'react-native-reanimated';
import {
    selectCustomerTip,
    selectIsSearchBoosted,
    selectIsSearchCancelled,
    selectTripDistance,
    selectSelectedPricingItems,
    TripMode,
    setEscalatedTime,
    selectEscalatedTime,
    TripCategory,
    selectJourneyRoute,
    selectSelectedJourney,
} from '@/typescript/state/client/search.ts';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { LookingForRidesAction } from './Types.ts';
import { selectRouteInfo } from '@/typescript/state/client/search';
import { useEstimateResultsQuery } from '@/typescript/state/server/estimateApi.ts';
import { isNull } from 'lodash';
import { useBookingStatus } from '@/typescript/hooks/useBookingDetailsOnStatusChange.ts';
import { useRefsContext } from '@/typescript/context/RefsContext';
import {
    BottomSheetStage,
    setBottomSheetStage,
    SearchWarningType,
    setSearchWarning,
    selectSearchedSource,
    selectSearchedStops,
    selectDestination,
    selectCurrentLocation,
    selectNewFeatureFlags,
    selectAppState,
    setFindAnotherDriverContext,
} from '@/typescript/state/client/session.ts';
import { RIDE_SEARCH_TIME, SHOW_RIDE_ASSIGNED_TIME_IN_MIN } from '@/typescript/constants/common.ts';
import useMapRoute from '@/typescript/Maps/UseMapRouteTS.tsx';
import { getNumberItem, MMKVKey, setNumberItem } from '@/typescript/utils/MMKV.ts';
import {
    addActiveBookingIds,
    BookingId,
    selectBookingId,
    selectSearchId,
    setActiveSearchId,
    setBookingId,
    setSearchId,
} from '@/typescript/state/client/user';
import LookingForRides from './UI.tsx';
import { NotificationContext } from '@/typescript/context/NotificationContext.tsx';
import { selectToken } from '@/typescript/state/client/auth.ts';
import { MapContext } from '@/typescript/Maps/MapContext.tsx';
import { batchConfig } from '@/readOnly/api/types/BatchConfig.gen.tsx';
import { createDispatcher, Resolver } from '@/typescript/utils/common.ts';
import { useBoostCard } from './BoostCard/useBoostCard.tsx';
import { latLong } from '@/readOnly/api/types/LatLong.gen.tsx';
import { useEstimateEstimateIdCancelPostMutation } from '@/api/integrations/rtk/EstimateEstimateIdCancelPost.ts';
import { getTitle } from '@/src-v2/utils/common.ts';
import { selectNearbyDrivers } from '@/typescript/state/client/maps.ts';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { getTipChangeCount, resetTipChangeCount } from '@/typescript/screens/lookingForRides/BoostSearchTipsModal';
import {
    getVariantChangeCount,
    resetVariantChangeCount,
} from '@/typescript/screens/lookingForRides/BoostSearchChangeVehicleModal';
import {
    logEvent as logEventLogger,
    logPrefixEvent,
    EventPrefix,
    LogInterface,
    EventName,
} from '@/typescript/utils/logger.ts';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { convertLatLongToLatLng } from '@/typescript/utils/MultiModal.ts';
import { LatLng } from 'react-native-maps';
import { useRideFareCalculation } from '@/src-v2/hooks/useRideFareCalculation.tsx';
import { captureMapSnapshotSafely } from '@/src-v2/multimodal/utils/mapSnapshotUtils.ts';
import { getTimeDifferenceInSecondsBwTwoDates } from '@/typescript/utils/time.ts';

const LookingForRidesFlow = (props: {
    progressRef: SharedValue<number>;
    searchPollingInterval: number;
    stopSearch: () => void;
    showErrorStatesModal: (bookingId: BookingId | null) => void;
    resetSearch: () => void;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
    setHeight: React.Dispatch<React.SetStateAction<number>>;
    setIsTryBoostedSearchModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { mapRef } = useContext(MapContext);
    const progress = props.progressRef;
    const hasNavigated = useRef(false);
    const isSearchBoosted = useAppSelector(state => selectIsSearchBoosted(state, null));
    const bookingId = useAppSelector(selectBookingId);
    const userToken = useAppSelector(selectToken);
    const { drawEstimateRoute } = useMapRoute(null, undefined);
    const customerTip = useAppSelector(state => selectCustomerTip(state, null));
    const searchedSource = useAppSelector(selectSearchedSource);
    const searchedStops = useAppSelector(selectSearchedStops);
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const notification = useContext(NotificationContext);
    const isSearchCancelled = useAppSelector(state => selectIsSearchCancelled(state, null));
    const dispatch = useAppDispatch();
    const routeInfo = useAppSelector(state => selectRouteInfo(state, null));
    const tripDistance = useAppSelector(state => selectTripDistance(state, null));
    const destination = useAppSelector(selectDestination);
    const rideSearchTimerID = useRef<ReturnType<typeof setTimeout> | null>(null);
    const { tripDetailsBottomSheetModalRef, retryBoostedSearchModalRef, newBookingFlowSheetRef } = useRefsContext();
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const escalatedTime = useAppSelector(state => selectEscalatedTime(state, null));
    const currentLocation = useAppSelector(selectCurrentLocation);
    const searchCentre: latLong = {
        lat: routeInfo?.at(0)?.latitude ?? searchedSource?.lat ?? currentLocation?.lat ?? 0,
        lon: routeInfo?.at(0)?.longitude ?? searchedSource?.lng ?? currentLocation?.lng ?? 0,
    };
    const isScreenFocused = useIsFocused();

    const appState = useAppSelector(selectAppState);

    const mapId = mapRef.current?.mapId ?? 'MapBeforeRide';
    const nearbyDrivers = useAppSelector(state => selectNearbyDrivers(state, mapId));
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const boostedSearchOpeningTime = featureFlags.boostedSearchModalOpenTime;
    const journeyRouteInfo = useAppSelector(state => selectJourneyRoute(state, searchId));

    const resetRideSearchTimer = () => {
        if (rideSearchTimerID.current) {
            clearTimeout(rideSearchTimerID.current);
            rideSearchTimerID.current = null;
        }
    };

    useEffect(() => {
        if (!nearbyDrivers || !nearbyDrivers.nearbyDrivers || nearbyDrivers.nearbyDrivers.buckets.length === 0) {
            mapRef.current?.removeNearbyMarkers();
        } else {
            try {
                const selectedCard = selectedPricingItems?.[0];
                const selectedServiceTierType = selectedCard?.serviceTierType ?? '';
                const vehicleVariant =
                    nearbyDrivers.nearbyDrivers.serviceTierTypeToVehicleVariant[selectedServiceTierType];
                const finalVehicleVariant = selectedServiceTierType === 'TAXI' ? 'SEDAN' : vehicleVariant;
                if (vehicleVariant) {
                    mapRef.current?.updateNearbyMarkers(nearbyDrivers.nearbyDrivers, finalVehicleVariant, true);
                }
            } catch (error) {
                console.error('Error parsing serviceTierTypeToVehicleVariant', error);
            }
        }
    }, [
        nearbyDrivers?.nearbyDrivers?.serviceTierTypeToVehicleVariant,
        nearbyDrivers?.nearbyDrivers?.buckets,
        selectedPricingItems?.length, // Use length instead of the whole array to avoid undefined issues
    ]);

    /* It will set the bookingDetails, otpCode, ridedetails data, once response comes */
    const { bookingStatus } = useBookingStatus(
        bookingId,
        !isSearchCancelled && props.searchPollingInterval !== 0 && isScreenFocused ? 1000 : 0,
    );

    /* It will set the bookingId value, once response comes */
    const estimateResultResp = useEstimateResultsQuery(selectedPricingItems?.[0]?.id, {
        skip: selectedPricingItems?.[0]?.tripMode !== TripMode.DynamicOffer,
        pollingInterval: isNull(bookingId) && !isSearchCancelled && props.searchPollingInterval !== 0 ? 1000 : 0,
    });
    const [cancelEstimate] = useEstimateEstimateIdCancelPostMutation();

    useEffect(() => {
        // Keeping it for a intermittent issue, please don't remove
        console.info('Useful: isSearchCancelled: ', isSearchCancelled);
        console.info('Useful: props.searchPollingInterval: ', props.searchPollingInterval);
    }, [props.searchPollingInterval, isSearchCancelled]);

    useEffect(() => {
        if (
            bookingId &&
            !hasNavigated.current &&
            (bookingStatus === 'TRIP_ASSIGNED' ||
                (bookingStatus === 'CONFIRMED' && selectedPricingItems?.[0]?.tripMode === TripMode.RideOtp))
        ) {
            hasNavigated.current = true;
            dispatch(addActiveBookingIds({ id: userToken, payload: bookingId }));
            resetRideSearchTimer();
            dispatch(setActiveSearchId({ payload: searchId, id: userToken }));
            dispatch(setSearchId({ payload: null, id: userToken }));
            dispatch(setFindAnotherDriverContext(null)); // Clear findAnotherDriverContext when a new driver is assigned
            navigation.popTo('LiveTab', {
                screen: 'taxiRideTracking',
                params: {
                    bookingId: bookingId,
                    multimodalProps: props.multimodalProps,
                },
            });
            setTimeout(() => dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: '' })), 200);
        }
    }, [bookingId, bookingStatus]);

    useEffect(() => {
        if (notification[0]?.notification_type === 'DRIVER_ASSIGNMENT' && !hasNavigated.current) {
            try {
                const notificationBookingData = safeJsonParse<{
                    bookingId: BookingId | undefined;
                    rideTime: string | undefined;
                    isScheduledBooking: boolean | undefined;
                }>(
                    notification[0].entity_data,
                    { bookingId: undefined, rideTime: undefined, isScheduledBooking: undefined },
                    'driverAssignmentNotification',
                );

                // Only perform time validation for scheduled bookings to prevent ride bug
                if (notificationBookingData.isScheduledBooking) {
                    const diffInTime = getTimeDifferenceInSecondsBwTwoDates(
                        Date(),
                        notificationBookingData.rideTime ?? '',
                    );
                    if (isNaN(diffInTime) || diffInTime > SHOW_RIDE_ASSIGNED_TIME_IN_MIN * 60) return;
                }

                if (notificationBookingData && notificationBookingData.bookingId) {
                    hasNavigated.current = true;
                    logEventLogger(EventName.NY_USER_RIDE_ASSIGNED);
                    dispatch(
                        setBookingId({
                            id: userToken,
                            payload: notificationBookingData.bookingId,
                        }),
                    );
                    dispatch(
                        addActiveBookingIds({
                            id: userToken,
                            payload: notificationBookingData.bookingId,
                        }),
                    );
                    dispatch(setActiveSearchId({ payload: searchId, id: userToken }));
                    dispatch(setSearchId({ payload: null, id: userToken }));
                    resetRideSearchTimer();
                    navigation.popTo('LiveTab', {
                        screen: 'taxiRideTracking',
                        params: {
                            bookingId: notificationBookingData.bookingId,
                            multimodalProps: props.multimodalProps,
                        },
                    });
                }
            } catch (err) {
                console.error('Error parsing notification data:', err);
            }
        }
    }, [notification]);

    const SearchProgressExpired = () => {
        console.info('Useful: SearchProgressExpired: ');
        props.setIsTryBoostedSearchModalOpen(false);
        tripDetailsBottomSheetModalRef?.current?.dismiss();
        if (isNull(bookingId) && selectedPricingItems?.[0]?.tripMode === TripMode.DynamicOffer) {
            retryBoostedSearchModalRef?.current?.present();
            dispatch(
                setBottomSheetStage({ stage: BottomSheetStage.RetryBoostedSearch, src: 'searchProgressExpired_lfr' }),
            );
        } else if (isScreenFocused) {
            dispatch(setSearchWarning(SearchWarningType.DriversNotAvailable));
            props.showErrorStatesModal(bookingId);
            dispatch(
                setBottomSheetStage({
                    stage: BottomSheetStage.SearchErrorStates,
                    src: 'searchProgressExpired_lfr_err',
                }),
            );
        }
        props.stopSearch();
        if (selectedPricingItems?.[0]) cancelEstimate({ estimateId: selectedPricingItems[0].id });
    };

    useEffect(() => {
        props.resetSearch();
        newBookingFlowSheetRef.current?.snapToIndex(0);
        return () => {
            cancelAnimation(progress);
            progress.value = 0;
        };
    }, [isSearchBoosted]);

    useEffect(() => {
        const time = boostedSearchOpeningTime - (escalatedTime ?? 0) * 1000;
        if (time > 0) {
            const timerId = setTimeout(() => {
                if (
                    !isSearchBoosted &&
                    customerTip === undefined &&
                    selectedPricingItems?.[0]?.tripMode === TripMode.DynamicOffer &&
                    selectedPricingItems?.[0]?.tripCategory === TripCategory.OneWay
                ) {
                    props.setIsTryBoostedSearchModalOpen(false);
                    tripDetailsBottomSheetModalRef?.current?.dismiss();
                    newBookingFlowSheetRef.current?.snapToIndex(1);
                }
            }, time);
            return () => {
                clearTimeout(timerId);
            };
        }
        return () => {};
    }, [customerTip, isSearchBoosted, escalatedTime]);

    const drawRouteEstimate = () => {
        if ((routeInfo && tripDistance) || journeyRouteInfo?.filteredRouteWaypoints) {
            const multimodalRoute = journeyRouteInfo?.filteredRouteWaypoints
                ? journeyRouteInfo.filteredRouteWaypoints.map(convertLatLongToLatLng)
                : [];
            drawEstimateRoute({
                coordinates: routeInfo ?? multimodalRoute,
                sourceAddress: routeInfo
                    ? searchedSource
                        ? getTitle(searchedSource)
                        : undefined
                    : journeyRouteInfo?.origin.stationName,
                destAddress: routeInfo
                    ? destination
                        ? getTitle(destination)
                        : undefined
                    : journeyRouteInfo?.destination.stationName,
                destinationPoints: routeInfo
                    ? searchedStops
                          .filter(stop => stop !== null)
                          .map(stop => {
                              const latLng: LatLng = {
                                  latitude: stop.lat ?? 0,
                                  longitude: stop.lng ?? 0,
                              };
                              return latLng;
                          })
                    : [multimodalRoute[multimodalRoute.length - 1]].filter(
                          (point): point is LatLng => point !== undefined,
                      ),
                destinationTitles: searchedStops.filter(stop => stop !== null).map(stop => stop.title ?? ''),
                onSourceClick: undefined,
                onDestClick: undefined,
                showEditIcon: undefined,
            })
                .then()
                .catch(error => {
                    console.error('Error drawing route:', error);
                });
        }
    };
    const selectedJourney = useAppSelector(state => selectSelectedJourney(state, null));
    const storeJourneyId = selectedJourney?.journeyId;
    useEffect(() => {
        drawRouteEstimate();
        const journeyId = props.multimodalProps?.journeyId ?? storeJourneyId;
        if (journeyId && mapRef.current) {
            captureMapSnapshotSafely(mapRef, journeyId, appState, 1000);
        }
    }, [mapRef.current]);

    useEffect(() => {
        return () => {
            props.setIsTryBoostedSearchModalOpen(false);
            tripDetailsBottomSheetModalRef.current?.dismiss();
            retryBoostedSearchModalRef.current?.dismiss();
        };
    }, []);

    const animateRideSearch = async (batchConfig: undefined | batchConfig) => {
        const batchStartTimeString = batchConfig?.batchingStartedAt;

        const currentTime = Date.now();
        const batchStartTimeNumber =
            batchStartTimeString !== undefined
                ? new Date(batchStartTimeString).getTime()
                : (getNumberItem(MMKVKey.PROGRESS_START_TIME) ?? currentTime);

        // Add 30 seconds buffer to the end time to make the LookingForRides screen stay longer
        const BUFFER_TIME_MS = 30000; // 30 seconds in milliseconds
        const batchingDuration =
            (batchConfig === undefined ? RIDE_SEARCH_TIME : batchConfig.batchTime * batchConfig.totalBatches * 1000) +
            BUFFER_TIME_MS;

        if (batchStartTimeString !== undefined) {
            setNumberItem(MMKVKey.PROGRESS_START_TIME, batchStartTimeNumber);
        }

        const startTime = batchStartTimeNumber;

        const endTime =
            batchConfig?.batchingExpireAt !== undefined
                ? new Date(batchConfig?.batchingExpireAt).getTime() + BUFFER_TIME_MS
                : startTime + batchingDuration + BUFFER_TIME_MS;

        const remainingTime = endTime - currentTime;
        const escalatedTime = batchingDuration - remainingTime;
        dispatch(setEscalatedTime({ id: searchId, payload: escalatedTime / 1000 }));

        const firstPhaseConst = batchingDuration * 0.15;
        const secondPhaseConst = batchingDuration * 0.35;
        const thirdPhaseConst = batchingDuration * 0.5;
        const splitPercent = 33.3;

        const phases = [
            { const: firstPhaseConst, key: 'firstPhase' },
            { const: secondPhaseConst, key: 'secondPhase' },
            { const: thirdPhaseConst, key: 'thirdPhase' },
        ];

        const initialAccumulator = {
            completedProgress: 0,
            completedTime: currentTime - startTime,
            firstPhase: firstPhaseConst,
            secondPhase: secondPhaseConst,
            thirdPhase: thirdPhaseConst,
        };

        const { completedProgress, firstPhase, secondPhase, thirdPhase } = phases.reduce((acc, phase) => {
            if (acc.completedTime >= phase.const) {
                return {
                    ...acc,
                    completedProgress: acc.completedProgress + splitPercent,
                    completedTime: acc.completedTime - phase.const,
                    [phase.key]: 0,
                };
            }

            const currentPhaseCompleted = (acc.completedTime / phase.const) * splitPercent;
            return {
                completedProgress: acc.completedProgress + currentPhaseCompleted,
                completedTime: 0,
                firstPhase:
                    phase.key === 'firstPhase'
                        ? acc.firstPhase * ((splitPercent - currentPhaseCompleted) / splitPercent)
                        : acc.firstPhase,
                secondPhase:
                    phase.key === 'secondPhase'
                        ? acc.secondPhase * ((splitPercent - currentPhaseCompleted) / splitPercent)
                        : acc.secondPhase,
                thirdPhase:
                    phase.key === 'thirdPhase'
                        ? acc.thirdPhase * ((splitPercent - currentPhaseCompleted) / splitPercent)
                        : acc.thirdPhase,
            };
        }, initialAccumulator);
        if (remainingTime >= 0) {
            rideSearchTimerID.current = setTimeout(() => {
                runOnJS(SearchProgressExpired)();
            }, remainingTime);
        }
        if (remainingTime > 0 && completedProgress < 100) {
            if (progress.value != 0 && progress.value < completedProgress) {
                progress.value = withTiming(Math.max(0, completedProgress), { duration: 5 });
            } else {
                progress.value = Math.max(0, completedProgress);
            }
            progress.value = withSequence(
                withTiming(firstPhase ? splitPercent : completedProgress, { duration: firstPhase }),
                withTiming(secondPhase ? splitPercent * 2 : completedProgress, { duration: secondPhase }),
                withTiming(100, { duration: thirdPhase }),
            );
        }
    };

    useEffect(() => {
        cancelAnimation(progress);
        progress.value = 0.001;
    }, [customerTip, selectedPricingItems, isSearchBoosted]);

    useEffect(() => {
        const defaultBatchTime = selectedPricingItems?.[0]?.tripCategory === TripCategory.OneWay ? 27 : 60;
        const defaultBatches = selectedPricingItems?.[0]?.tripCategory === TripCategory.OneWay ? 6 : 3;
        const starttime = new Date(Date.now());
        const endTime = new Date(Date.now() + defaultBatchTime * defaultBatches * 1000);
        const defaultConfig: batchConfig = {
            batchTime: defaultBatchTime,
            batchingStartedAt: starttime.toISOString(),
            batchingExpireAt: endTime.toISOString(),
            totalBatches: defaultBatches,
        };
        if (estimateResultResp.data?._0.batchConfig) {
            animateRideSearch(estimateResultResp.data?._0.batchConfig);
        } else {
            animateRideSearch(defaultConfig);
        }
        return () => {
            resetRideSearchTimer();
        };
    }, [estimateResultResp.data?._0.batchConfig, customerTip, selectedPricingItems, isSearchBoosted]);

    const {
        onPress,
        isDisabled,
        additionalFare,
        setAdditionalFare,
        selectedExpandedData,
        setSelectedExpandedData,
        updateInitialSelectedVehicles,
        buttonText,
    } = useBoostCard(props.resetSearch, bookingId, false, true);

    const { fareDisplay: reduxFareDisplay } = useRideFareCalculation(selectedPricingItems, customerTip);
    const fareDisplay = reduxFareDisplay;

    const resolver: Resolver<LookingForRidesAction> = async action => {
        const tipChanges = getTipChangeCount();
        const variantChanges = getVariantChangeCount();
        const eventSuffix = `${tipChanges}_tip_${variantChanges}_variant`;
        switch (action.type) {
            case 'BUTTON_CLICKED':
                logPrefixEvent(EventPrefix.NY_BOOST_SEARCH, eventSuffix, {}, [LogInterface.Firebase]);
                resetTipChangeCount();
                resetVariantChangeCount();
                onPress();
                break;
            default:
                break;
        }
    };

    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const displayTitle = useMemo(() => {
        // For multimodal journey
        if (journeyRouteInfo) {
            const destination = journeyRouteInfo.destination;
            return destination.stationName;
        }

        const lastStop = searchedStops.length > 0 ? searchedStops[searchedStops.length - 1] : null;
        const title = lastStop?.title;
        const subTitle = lastStop?.subtitle;
        const descriptionSplitArray = subTitle?.split(', ').map(item => item.trim());
        if (title != undefined && title?.length < 10) {
            if (descriptionSplitArray != undefined && descriptionSplitArray.length >= 2) {
                return `${title}, ${descriptionSplitArray[0]}`;
            }
        }
        return title;
    }, [journeyRouteInfo, searchedStops]);

    const localState = {
        displayTitle,
        isSearchBoosted: isSearchBoosted,
        bookingId,
        progressRef: progress,
        resetSearch: props.resetSearch,
        rcsDispatch,
        buttonText,
        isDisabled,
        additionalFare,
        setAdditionalFare,
        selectedExpandedData,
        setSelectedExpandedData,
        searchCentre,
        showBoostInfo: selectedPricingItems?.[0]?.tripCategory === TripCategory.OneWay,
        setHeight: props.setHeight,
        updateInitialSelectedVehicles,
        fareDisplay,
    };

    useEffect(() => {
        // Reset counters when LookingForRides component mounts
        resetTipChangeCount();
        resetVariantChangeCount();
    }, []);

    return <LookingForRides {...localState} />;
};

export default LookingForRidesFlow;
