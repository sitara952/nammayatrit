import { useContext, useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../state/hooks.ts';
import {
    selectSearchId,
    setActiveBookingIds,
    setBookingId,
    createBookingId,
    createJourneyId,
    JourneyId,
    selectActiveBookingIds,
} from '../state/client/user.ts';
import { selectToken } from '../state/client/auth.ts';
import {
    BottomSheetStage,
    setBottomSheetStage,
    setToastProps,
    setFlowStatusValidated,
    selectNewFeatureFlags,
    resetToastProps,
    setLiveJourneyId,
    setFareProductType,
    selectNetworkState,
    setNetworkState,
} from '../state/client/session.ts';
import { resetIds, setBookingAndRideDetails, setLookingForDriversDataInBooking } from '../state/sharedReducer.ts';
import { useLazySearchResultsQuery } from '../state/server/searchApi.ts';
import { useGetBookingDetailsMutation } from '../state/server/bookingApi.ts';
import { useLazyFlowStatusQuery, useSkipFeedbackMutation } from '../state/server/flowStatusApi.ts';
import { MainNavigationParamList } from '../navigation/globalParamList.tsx';
import { FlowStatusContext } from '../context/FlowStatusContext.tsx';
import { useConfigContext } from '../context/ConfigContext.tsx';
import { events, EventType } from '@/src-v2/systems/events/events.ts';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { isUpcomingBooking } from '@/src-v2/utils/Booking.ts';
import { assignPendingSpecialAssistance, getOtpCode, selectAllBooking } from '../state/client/booking';
import { isNull } from 'lodash';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { logger } from '@/src-v2/systems/logger';
import { hideSplash } from '../utils/common.ts';
import Danger from '../components/svg/Danger.tsx';
import { getPersonFlowStatusRes } from '@/readOnly/api/types/GetPersonFlowStatusRes.gen.tsx';
import { flowStatusWaitingForDriverOffers } from '@/readOnly/api/types/FlowStatusWaitingForDriverOffers.gen.tsx';

import { flowStatusACTIVEBookings } from '@/readOnly/api/types/FlowStatusACTIVEBookings.gen.tsx';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { flowStatusWaitingForDriverAssignment } from '@/readOnly/api/types/FlowStatusWaitingForDriverAssignment.gen.tsx';
import { useEstimateEstimateIdCancelPostMutation } from '@/api/integrations/rtk/EstimateEstimateIdCancelPost.ts';
import { notifyEventReq } from '@/readOnly/api/types/NotifyEventReq.gen.tsx';
import { useFrontendNotifyEventPostMutation } from '@/api/integrations/rtk/FrontendNotifyEventPost';
import { selectAppConfig } from '@/typescript/state/client/session';
import { SHOW_RIDE_ASSIGNED_TIME_IN_MIN } from '../constants/common.ts';
import { clearAllJourneyState, setJourneyRefreshFlag } from '../state/client/journey.ts';

const enableFlowStatusDebugLogs = false;
const FLOW_STATUS_LOG_TAG = 'FlowStatus';

const flowStatusDebugLog = (...args: (string | object | number | boolean)[]) => {
    if (enableFlowStatusDebugLogs) {
        console.info(FLOW_STATUS_LOG_TAG, ...args);
    }
};

type UseFlowStatusHandlerParams = {
    autoTrigger: boolean | undefined;
};

export const useFlowStatusHandler = ({ autoTrigger = true }: UseFlowStatusHandlerParams) => {
    const flowStatusRef = useContext(FlowStatusContext);
    const dispatch = useAppDispatch();
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const userToken = useAppSelector(selectToken);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const [trigger] = useLazySearchResultsQuery();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const [triggerFlowStatus, flowStatusResp] = useLazyFlowStatusQuery();
    const { existsInOfflineRequests } = useOfflineSync();
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const [cancelEstimate] = useEstimateEstimateIdCancelPostMutation();
    const [updateFrontendNotifyEvent] = useFrontendNotifyEventPostMutation();
    const appSystemConfig = useAppSelector(selectAppConfig);
    const networkState = useAppSelector(selectNetworkState);
    const navigated = useRef<boolean>(networkState === 'slow');
    const [skipFeedback] = useSkipFeedbackMutation();
    const appConfig = useAppSelector(selectAppConfig);
    const slowNetworkToastThreshHold = appConfig.uiConfig.slowInternetConfig.slowNetworkToastThreshHold;
    const activeBookingIds = useAppSelector(selectActiveBookingIds);
    const allBookings = useAppSelector(selectAllBooking);

    const navigateToHome = () => {
        if (!autoTrigger) {
            navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });
        } else {
            navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
        }
    };

    const resetSearchAndActiveBookings = () => {
        dispatch(setActiveBookingIds({ id: userToken, payload: [] }));
        resetIds(userToken, null, dispatch);
    };

    const handleFlowStatusError = () => {
        flowStatusDebugLog('Error Fallback dekho');
        if (!navigated.current) {
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'flowStatusError' }));
            navigateToHome();
        }
        dispatch(
            setToastProps({
                message: userLanguageStrings.UnableToFetchLatestRideInfo,
                backgroundColor: `${themeColors.Fill_negativeHigh}`,
                visible: true,
                logo: <Danger />,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                autoDismissAfter: 2000,
                margin: undefined,
                customToast: undefined,
            }),
        );
    };

    const clearJourneyState = () => {
        dispatch(clearAllJourneyState());
        dispatch(setLiveJourneyId(null));
    };

    const handleIdleStatus = () => {
        flowStatusDebugLog('Handling IDLE status');
        logEvent(EventName.NY_ACTIVE_RIDE_WITH_IDLE_STATE);
        resetSearchAndActiveBookings();
        clearJourneyState();
        if (!navigated.current) {
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'flowStatusIdle' }));
            navigateToHome();
        }
    };

    const handleWaitingForDriverAssignment = (currentStatusData: flowStatusWaitingForDriverAssignment) => {
        flowStatusDebugLog('Handling WAITING_FOR_DRIVER_ASSIGNMENT', currentStatusData);
        const flowBookingId = createBookingId(currentStatusData.bookingId);
        if (!isNull(flowBookingId)) {
            fetchBookingDetails(flowBookingId)
                .unwrap()
                .then(data => {
                    if (data) {
                        flowStatusDebugLog('Fetched booking details successfully');
                        setLookingForDriversDataInBooking(data._0, dispatch);
                        dispatch(setBookingId({ id: userToken, payload: flowBookingId }));
                        dispatch(
                            setBottomSheetStage({ stage: BottomSheetStage.LookingForRides, src: 'waitDriverAssign' }),
                        );
                        navigateToHome();
                    }
                });
        }
    };

    const handleWaitingForDriverOffers = (currentStatusData: flowStatusWaitingForDriverOffers) => {
        flowStatusDebugLog('Handling WAITING_FOR_DRIVER_OFFERS', currentStatusData);
        // Handle new phone use case by sending searchId from the backend and all other details.
        if (currentStatusData.tripCategory?.TAG === 'Delivery') {
            flowStatusDebugLog('Navigating to continueBooking for delivery trip');
            !navigated.current && navigation.popTo('continueBooking');
        } else if (!isNull(searchId)) {
            flowStatusDebugLog('Triggering search with searchId', searchId);
            trigger({ searchId }).finally(() => {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.LookingForRides, src: 'waitDriverOffers' }));
                navigateToHome();
            });
        } else {
            flowStatusDebugLog('Cancelling the estimate', currentStatusData.estimateId);
            cancelEstimate({ estimateId: currentStatusData.estimateId });
            if (!navigated.current) {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'fs_searchId_null' }));
                navigateToHome();
            }
        }
    };

    const handleFeedbackPending = (currentStatusData: bookingAPIEntity) => {
        flowStatusDebugLog('Handling FEEDBACK_PENDING', currentStatusData);
        if (existsInOfflineRequests('rateRide') || existsInOfflineRequests('submitFeedback')) {
            flowStatusDebugLog('Feedback Sync in Progress in background...');
            resetSearchAndActiveBookings();
            if (!navigated.current) {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'feedbackPending' }));
                navigateToHome();
            }
            return;
        }
        // Check if feedback has been pending for more than 2 days
        const feedbackPendingTime = new Date(currentStatusData.updatedAt).getTime();
        const currentTime = new Date().getTime();
        const twoDaysInMs = featureFlags.feedbackPendingExpiryTimeInMs;

        if (currentTime - feedbackPendingTime > twoDaysInMs) {
            logger.logDebug(`[PostRideFlow] Feedback pending expired`, 'PostRideFlow');
            const ratingSkipEventReq: { body: notifyEventReq } = {
                body: { event: 'RATE_DRIVER_SKIPPED' },
            };
            updateFrontendNotifyEvent(ratingSkipEventReq)
                .unwrap()
                .catch((err: Error) => {
                    logger.logError(
                        `[PostRideFlow] Error updating frontend notify event: ${err.message}`,
                        'PostRideFlow',
                    );
                });
            resetSearchAndActiveBookings();
            if (!navigated.current) {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'feedbackPendingExpired' }));
                navigateToHome();
            }
            return;
        }

        const bookingDetails = currentStatusData;
        const bookingId = createBookingId(bookingDetails.id);
        dispatch(setBookingId({ id: userToken, payload: bookingId }));
        dispatch(assignPendingSpecialAssistance({ id: bookingId, payload: null }));
        setBookingAndRideDetails(bookingDetails, dispatch);
        !navigated.current &&
            navigation.popTo('HomeTab', {
                screen: 'reviewAndFeedback',
                params: {
                    bookingId: bookingDetails.id,
                    multimodalProps: undefined,
                },
            });
    };

    const isAmbulanceBooking = (booking: bookingAPIEntity) => {
        switch (booking.vehicleServiceTierType) {
            case 'AMBULANCE_TAXI':
            case 'AMBULANCE_TAXI_OXY':
            case 'AMBULANCE_AC':
            case 'AMBULANCE_AC_OXY':
            case 'AMBULANCE_VENTILATOR':
                return true;
            default:
                return false;
        }
    };

    const handleActiveBooking = (currentStatusData: flowStatusACTIVEBookings) => {
        flowStatusDebugLog('Handling ACTIVE_BOOKINGS', currentStatusData);
        const bookingList = currentStatusData.list;
        if (bookingList && bookingList.length > 0) {
            flowStatusDebugLog(`Processing ${bookingList.length} active bookings`);
            dispatch(
                setActiveBookingIds({
                    id: userToken,
                    payload: bookingList.map(i => createBookingId(i.id)),
                }),
            );
            bookingList.forEach(booking => {
                const bookingId = createBookingId(booking.id);
                dispatch(assignPendingSpecialAssistance({ id: bookingId, payload: null }));
                setBookingAndRideDetails(booking, dispatch);
            });
            // Only select rides which has driver assinged and starts in 15 mins or otp rides.
            const activeBookingWithDrivers = bookingList.filter(booking => {
                const isUpcoming = isUpcomingBooking(booking, SHOW_RIDE_ASSIGNED_TIME_IN_MIN);
                return (
                    (booking.rideList && booking.rideList.length > 0 && !isUpcoming) ||
                    !isNull(getOtpCode(booking.bookingDetails))
                );
            });
            flowStatusDebugLog(`Found ${activeBookingWithDrivers.length} active bookings with drivers`);
            const firstActiveBookingDetails = activeBookingWithDrivers.at(0);
            if (activeBookingWithDrivers.length == 1 && firstActiveBookingDetails) {
                flowStatusDebugLog('Processing single active booking with driver');
                const bookingId = createBookingId(firstActiveBookingDetails.id);
                // Only one such booking is there directly show booking tracking for it
                dispatch(
                    setBookingId({
                        id: userToken,
                        payload: bookingId,
                    }),
                    setLookingForDriversDataInBooking(firstActiveBookingDetails, dispatch),
                );
                if (isAmbulanceBooking(firstActiveBookingDetails)) {
                    dispatch(setFareProductType('AMBULANCE'));
                }
                switch (firstActiveBookingDetails.bookingDetails.TAG) {
                    case 'DELIVERY':
                        flowStatusDebugLog('Navigating to delivery screen');
                        events.markFirstScreenRender(EventType.ON_CREATE_TO_DELIVERY_SCREEN);
                        !navigated.current && navigation.popTo('deliveryScreen');
                        break;
                    default:
                        flowStatusDebugLog('Navigating to ride tracking screen');
                        !navigated.current &&
                            navigation.popTo('LiveTab', {
                                screen: 'taxiRideTracking',
                                params: {
                                    bookingId: bookingId,
                                    multimodalProps: undefined,
                                },
                            });
                        break;
                }
            } else if (bookingList.length > 1) {
                flowStatusDebugLog('Multiple bookings found, resetting and going to home');
                resetIds(userToken, null, dispatch); // remove default selected bookingIds
                if (!navigated.current) {
                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'mbf_goHome' }));
                    navigateToHome();
                }
            } else {
                flowStatusDebugLog('Checking for bookings that could be looking for drivers');
                const firstBookingWhichCouldBeLookingForDrivers = bookingList.find(
                    booking => !isUpcomingBooking(booking, 2),
                );
                if (firstBookingWhichCouldBeLookingForDrivers) {
                    flowStatusDebugLog('Found booking looking for drivers');
                    const bookingId = createBookingId(firstBookingWhichCouldBeLookingForDrivers.id);
                    setLookingForDriversDataInBooking(firstBookingWhichCouldBeLookingForDrivers, dispatch);
                    dispatch(
                        setBookingId({
                            id: userToken,
                            payload: bookingId,
                        }),
                    );
                    dispatch(
                        setBottomSheetStage({
                            stage: BottomSheetStage.LookingForRides,
                            src: 'found_booking_looking_for_driver',
                        }),
                    );
                    navigateToHome();
                } else {
                    flowStatusDebugLog('No bookings looking for drivers, going to home');
                    resetIds(userToken, null, dispatch); // remove default selected bookingIds
                    if (!navigated.current) {
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'mbf_goHome_else' }));
                        navigateToHome();
                    }
                }
            }
        } else {
            flowStatusDebugLog('No active bookings found, resetting and going to home');
            resetIds(userToken, null, dispatch); // remove default selected bookingIds
            if (!navigated.current) {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'mbf_noActiveBookings' }));
                navigateToHome();
            }
        }
    };

    const handleUnknownStatus = (flowStatus: getPersonFlowStatusRes) => {
        flowStatusDebugLog('Unhandled flow status', flowStatus);
        console.error('Unhandled flow status', flowStatus);
        dispatch(setActiveBookingIds({ id: userToken, payload: [] }));
        if (!navigated.current) {
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'mbf_unknown' }));
            navigateToHome();
        }
    };

    const handleFlowStatusSuccess = (flowStatus: getPersonFlowStatusRes) => {
        flowStatusDebugLog('Processing flow status success', flowStatus);
        // Set flow status validated flag to true whenever flow status is successfully processed
        dispatch(setFlowStatusValidated(true));
        switch (typeof flowStatus.currentStatus) {
            case 'string':
                if (flowStatus.currentStatus === 'IDLE') {
                    handleIdleStatus();
                }
                break;
            case 'object':
                switch (flowStatus.currentStatus.TAG) {
                    case 'WAITING_FOR_DRIVER_ASSIGNMENT': {
                        handleWaitingForDriverAssignment(flowStatus.currentStatus._0);
                        break;
                    }
                    case 'WAITING_FOR_DRIVER_OFFERS':
                        handleWaitingForDriverOffers(flowStatus.currentStatus._0);
                        break;
                    case 'FEEDBACK_PENDING': {
                        handleFeedbackPending(flowStatus.currentStatus._0);
                        break;
                    }
                    case 'ACTIVE_BOOKINGS': {
                        handleActiveBooking(flowStatus.currentStatus._0);
                        break;
                    }
                    case 'ACTIVE_JOURNEYS': {
                        const journeys = flowStatus.currentStatus._0.journeys?.filter(
                            journey =>
                                journey.status !== 'EXPIRED' &&
                                (journey.status !== 'CONFIRMED' ||
                                    (journey.status === 'CONFIRMED' && journey.isPaymentSuccess)),
                        );
                        if (journeys && journeys.length > 0) {
                            const latestJourney = journeys.reduce((latest, current) => {
                                if (!latest) return current;
                                if (!current) return latest;
                                return new Date(current.createdAt) > new Date(latest.createdAt) ? current : latest;
                            });

                            if (latestJourney) {
                                // Set the live journey ID in the session store
                                dispatch(setLiveJourneyId(latestJourney.id));

                                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                                dispatch(setJourneyRefreshFlag({ id: latestJourney.id as JourneyId, payload: true }));

                                const journeyCreatedTime = new Date(latestJourney.createdAt).getTime();
                                const currentTime = new Date().getTime();
                                const oneHourInMs = 60 * 60 * 1000;

                                if (currentTime - journeyCreatedTime > oneHourInMs) {
                                    if (!navigated.current) {
                                        navigateToHome();
                                    }
                                } else {
                                    if (latestJourney.status === 'FEEDBACK_PENDING') {
                                        skipFeedback(undefined);
                                        if (!navigated.current) {
                                            navigateToHome();
                                        }
                                    } else {
                                        const isPublicTransitJourney =
                                            latestJourney.modes?.includes('Bus') ||
                                            latestJourney.modes?.includes('Metro') ||
                                            latestJourney.modes?.includes('Subway');

                                        if (!navigated.current) {
                                            if (isPublicTransitJourney) {
                                                navigation.popTo('mainTabNavigation', {
                                                    screen: 'ticketsTab_homeScreen',
                                                });
                                            } else if (appSystemConfig.flowConfig.enableLiveTracking) {
                                                navigation.popTo('mainTabNavigation', {
                                                    screen: 'liveTab_homeScreen',
                                                    params: {
                                                        multimodalProps: undefined,
                                                        journeyId: createJourneyId(latestJourney.id),
                                                    },
                                                });
                                            } else {
                                                navigateToHome();
                                            }
                                        }
                                    }
                                }
                            } else {
                                dispatch(setLiveJourneyId(null));
                                resetIds(userToken, null, dispatch); // remove default selected bookingIds
                                clearJourneyState();
                                if (!navigated.current) {
                                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'mbf_unknown' }));
                                    navigateToHome();
                                }
                            }
                        } else {
                            dispatch(setLiveJourneyId(null));
                            resetIds(userToken, null, dispatch); // remove default selected bookingIds
                            clearJourneyState();
                            if (!navigated.current) {
                                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'mbf_unknown' }));
                                navigateToHome();
                            }
                        }
                        break;
                    }
                    default: {
                        handleUnknownStatus(flowStatus);
                    }
                }
        }
    };

    const clearTimeoutAndToast = () => {
        if (timeoutId.current) {
            flowStatusDebugLog('Clearing timeout and toast');
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
            dispatch(resetToastProps());
        }
    };

    const checkFlowStatus = (forceFetch: boolean = false) => {
        flowStatusDebugLog('Checking flow status');
        if (
            !forceFetch &&
            flowStatusRef?.data?.current &&
            flowStatusRef?.data?.current?.TAG === 'Ok' &&
            flowStatusRef?.data?.current?._0
        ) {
            flowStatusDebugLog('Using cached flow status data');
            handleFlowStatusSuccess(flowStatusRef?.data?.current._0);
            hideSplash();
        } else {
            flowStatusDebugLog('Triggering flow status API call');
            triggerFlowStatus({ isPolling: false, checkForActiveBooking: true });
            if (networkState === 'none') {
                const timeout = setTimeout(() => {
                    dispatch(setNetworkState('slow'));
                    slowNetworkNavigateFallback();
                    navigated.current = true;
                    hideSplash();
                }, slowNetworkToastThreshHold);
                timeoutId.current = timeout;
            }
        }
    };

    const slowNetworkNavigateFallback = () => {
        const allBookingDetails = allBookings
            ? activeBookingIds.map(id => (allBookings[id] ? allBookings[id] : null)).filter(booking => !isNull(booking))
            : [];

        if (allBookingDetails.length === 0) {
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'slowNetworkTimeout' }));
            navigateToHome();
        } else {
            handleActiveBooking({
                list: allBookingDetails.map(booking => booking.bookingDetails).filter(booking => !isNull(booking)),
            });
        }
    };

    useEffect(() => {
        if (autoTrigger) {
            flowStatusDebugLog('Auto-triggering flow status check');
            checkFlowStatus();
        }
        return () => {
            clearTimeoutAndToast();
        };
    }, [autoTrigger]);

    useEffect(() => {
        console.info('[PublicTransportData]: Data loaded, proceeding with flow status handling');
        if (flowStatusResp.error || flowStatusResp.data?.TAG === 'Error') {
            flowStatusDebugLog('Flow status API returned error', flowStatusResp.error || 'Unknown error');
            handleFlowStatusError();
            clearTimeoutAndToast();
            hideSplash();
            return;
        }

        if (flowStatusResp.data && flowStatusResp.data?.TAG === 'Ok' && flowStatusResp.data?._0) {
            flowStatusDebugLog('Flow status API returned success');
            handleFlowStatusSuccess(flowStatusResp.data?._0);
            clearTimeoutAndToast();
            hideSplash();
        }
    }, [flowStatusResp.data, flowStatusResp.error]);

    return { checkFlowStatus };
};
