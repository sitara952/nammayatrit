import PaymentStatus from './UI';
import { MultimodalPaymentStatusAction, MultimodalPaymentStatusProps } from './types.ts';
import { createDispatcher, Resolver } from '@/typescript/utils/common.ts';
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { usePaymentOrderIdStatusGetQuery } from '@/api/integrations/rtk/PaymentOrderIdStatusGet';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import {
    BottomSheetStage,
    setBottomSheetStage,
    selectPaymentRetryAfterFailureCounter,
    setPaymentRetryAfterFailureCounter,
    setLiveJourneyId,
    clearSession,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { useAppDispatch } from '@/typescript/state/hooks.ts';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { createJourneyId } from '@/typescript/state/client/user';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { logger } from '@/src-v2/systems/logger/index.ts';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useMultimodalJourneyIdBookingInfoGetMutation } from '@/api/integrations/rtk/MultimodalJourneyIdBookingInfoGet.ts';
import { setJourneyResp } from '@/typescript/state/client/journey.ts';
import { addJourneyToMMKV } from '../../hooks/useOfflineTickets.ts';
import { useCachedPurchasedPasses } from '@/src-v2/hooks/useCachedPurchasedPasses.ts';
import { logPrefixEvent, EventPrefix } from '@/typescript/utils/logger';
import type { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';

export const MultimodalPaymentStatus = () => {
    const route: RouteProp<MainNavigationParamList, 'multimodalPaymentStatus'> = useRoute();
    const dispatch = useAppDispatch();
    const [isPolling, setIsPolling] = useState(true);
    const payment_status_api_interval = 1000;

    const [getJourneyInfoApiCall] = useMultimodalJourneyIdBookingInfoGetMutation();
    const { data: paymentStatusResp } = usePaymentOrderIdStatusGetQuery(
        { orderId: route?.params?.paymentOrderId || '' },
        {
            pollingInterval: isPolling ? payment_status_api_interval : 0,
            skip: !route?.params?.paymentOrderId,
            skipPollingIfUnfocused: false, // Optional: stops polling if the window loses focus
            refetchOnMountOrArgChange: true,
        },
    );
    const getLegsAsString = (journey: journeyInfoResp | undefined): string => {
        return journey?.legs?.map(leg => leg.travelMode).join(',') ?? '';
    };
    const { refetch: refetchPassData, setData: setPassData } = useCachedPurchasedPasses(true);

    const { fulfillmentStatus, amount, domainType, domainEntityId } = useMemo(() => {
        console.error('paymentStatusResp: ', paymentStatusResp);
        switch (paymentStatusResp?.TAG) {
            case 'PaymentStatus':
                return {
                    fulfillmentStatus: paymentStatusResp?._0.paymentFulfillmentStatus,
                    amount: paymentStatusResp?._0.amount,
                    domainType: paymentStatusResp?._0.paymentServiceType,
                    domainEntityId: paymentStatusResp?._0.domainEntityId,
                };
            default:
                return {
                    fulfillmentStatus: undefined,
                    amount: undefined,
                    domainType: undefined,
                    domainEntityId: undefined,
                };
        }
    }, [paymentStatusResp]);

    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const paymentRetryAfterFailureCounter = useAppSelector(selectPaymentRetryAfterFailureCounter);
    const navigatedToJourneyScreen = useRef<boolean>(false);
    const hasNavigatedOnTicketScreen = useRef<boolean>(false);
    const [isTicketBookingFailedModalVisible, setIsTicketBookingFailedModalVisible] = useState(false);
    const appSystemConfig = useAppSelector(selectAppConfig);

    const handlePaymentStatusAfterSuccess = useCallback(() => {
        switch (domainType) {
            case 'FRFSPassPurchase':
                refetchPassData()
                    .unwrap()
                    .then(data => {
                        setPassData(data);
                        logEvent(EventName.PAYMENT_SUCCESS_BUS_PASS);
                        navigation.popTo('mainTabNavigation', { screen: 'passesTab_homeScreen' });
                    });
                return;
            default: {
                if (domainEntityId) {
                    getJourneyInfoApiCall({ journeyId: domainEntityId })
                        .unwrap()
                        .then(journeyResp => {
                            dispatch(setJourneyResp({ id: createJourneyId(domainEntityId), payload: journeyResp }));
                            addJourneyToMMKV(journeyResp);
                            dispatch(setLiveJourneyId(domainEntityId));
                            const vehicles = getLegsAsString(journeyResp);
                            logPrefixEvent(
                                EventPrefix.MULTIMODAL_PAYMENT_SUCCESSFUL,
                                vehicles + '_' + fulfillmentStatus + '_' + amount?.toString(),
                            );

                            const hasPublicTransitLeg = journeyResp?.legs?.some(
                                leg =>
                                    leg.travelMode === 'Bus' ||
                                    leg.travelMode === 'Metro' ||
                                    leg.travelMode === 'Subway',
                            );

                            if (hasPublicTransitLeg || !appSystemConfig.flowConfig.enableLiveTracking) {
                                navigateToViewTicket();
                            } else {
                                navigateToJourneyTracking(domainEntityId);
                            }
                        })
                        .catch(err => {
                            logger.logError('Error getting journey info: ', err);
                            navigateToViewTicket();
                        });
                    break;
                } else {
                    navigateToViewTicket();
                }
            }
        }
    }, [appSystemConfig, domainType, domainEntityId]);

    const navigateToJourneyTracking = useCallback(
        (journeyId: string) => {
            if (!navigatedToJourneyScreen.current && !hasNavigatedOnTicketScreen.current) {
                logEvent(EventName.NAMMA_TRANSIT_BOOK_JOURNEY);
                dispatch(setLiveJourneyId(journeyId));
                navigation.popTo('mainTabNavigation', {
                    screen: 'liveTab_homeScreen',
                    params: {
                        journeyId: null,
                        multimodalProps: journeyId
                            ? {
                                  journeyId: createJourneyId(journeyId),
                                  isLastMile: false,
                                  currentLegOrder: '0',
                                  previousLegOrderTravelMode: undefined,
                                  previousLegOrderTravelModeStatusConfirmed: undefined,
                              }
                            : undefined,
                    },
                });
                navigatedToJourneyScreen.current = true;
            }
        },
        [navigation],
    );

    const navigateToViewTicket = useCallback(() => {
        if (!hasNavigatedOnTicketScreen.current) {
            // Clear ticket cache to get fresh data fetch, it will fix the issue of not showing the latest ticket after payment success
            navigation.popTo('mainTabNavigation', { screen: 'ticketsTab_homeScreen' });
            hasNavigatedOnTicketScreen.current = true;
        }
    }, [navigation]);

    const handleGoToHome = useCallback(() => {
        setIsTicketBookingFailedModalVisible(false);
        dispatch(clearSession());
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'handleGoToHome' }));
        navigation.popTo('mainTabNavigation', {
            screen: 'homeTab_homeScreen',
        });
    }, [navigation]);

    useEffect(() => {
        if (fulfillmentStatus && isPolling) {
            logger.logDebug(`Fulfillment Status: ${fulfillmentStatus}`, 'PaymentSDKFlow');
            switch (fulfillmentStatus) {
                case 'FulfillmentSucceeded':
                    setIsPolling(false);
                    logEvent(EventName.METRO_TICKET_PAYMENT_SUCCESSFUL);
                    handlePaymentStatusAfterSuccess();
                    break;
                case 'FulfillmentFailed':
                case 'FulfillmentRefundFailed':
                    setIsPolling(false);
                    logEvent(EventName.METRO_TICKET_PAYMENT_FAILED);
                    console.info('PAYMENT_PAGE status other', fulfillmentStatus);
                    setIsTicketBookingFailedModalVisible(true);
                    break;
                case 'FulfillmentRefundPending':
                case 'FulfillmentRefundInitiated':
                    setIsTicketBookingFailedModalVisible(true);
                    logPrefixEvent(EventPrefix.PAYMENT_REFUND_PENDING, fulfillmentStatus + '_' + amount?.toString());
                    break;
                case 'FulfillmentPending':
                case 'FulfillmentRefunded':
                    logPrefixEvent(EventPrefix.PAYMENT_REFUNDED, fulfillmentStatus + '_' + amount?.toString());
                    break;
            }
        }
        if (
            route?.params?.processResultStatus === 'pending_vbv' ||
            (fulfillmentStatus &&
                ['FulfillmentPending', 'FulfillmentRefundInitiated', 'FulfillmentRefundPending'].includes(
                    fulfillmentStatus,
                ))
        ) {
            setIsPolling(true);
        }
    }, [isPolling, fulfillmentStatus, route?.params?.processResultStatus]);

    const resolver: Resolver<MultimodalPaymentStatusAction> = async action => {
        switch (action.type) {
            case 'PAYMENT_SUCCESSFUL':
                handlePaymentStatusAfterSuccess();
                break;
            case 'RETRY_PAYMENT':
                dispatch(setPaymentRetryAfterFailureCounter(paymentRetryAfterFailureCounter + 1));
                break;
            default:
                throw new Error(`Unhandled action type: ${action}`);
        }
    };
    const mpDispatch = createDispatcher(resolver);

    const viewState: MultimodalPaymentStatusProps = {
        mpDispatch,
        fulfillmentStatus: fulfillmentStatus ?? 'FulfillmentPending',
        paymentRetryAfterFailureCounter,
        amount: amount,
        isTicketBookingFailedModalVisible,
        setIsTicketBookingFailedModalVisible,
        domainType,
        handleGoToHome,
    };

    return <PaymentStatus {...viewState} />;
};
