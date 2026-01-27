import React, { useCallback, useMemo, useState } from 'react';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import EventTicketUI from './UI';
import { EventTicketingScreenProps, EventTicketUIProps, PaymentStatusAction } from './Types';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import PaymentSuccessView from './components/PaymentSucessView';
import { usePolling } from '@/typescript/hooks/usePolling';
import { useTicketBookingsTicketBookingShortIdStatusGetMutation } from '@/api/integrations/rtk/TicketBookingsTicketBookingShortIdStatusGet';
import { TicketBookingStatus_ticketBookingStatus } from '@/readOnly/api/types/Enums.gen';
import PaymentPendingView from './components/PaymentPendingView';
import PaymentFailedView from './components/PaymentFailedView';
import { useTicketBookingsTicketBookingShortIdDetailsGetMutation } from '@/api/integrations/rtk/TicketBookingsTicketBookingShortIdDetailsGet';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createDispatcher } from '@/typescript/utils/common';
import { selectPaymentInfo } from '@/typescript/state/client/user';
import { RootState } from '@/typescript/state/store';
import { useSelector } from 'react-redux';

const PaymentStatusScreenFlow: React.FC<EventTicketingScreenProps> = React.memo(
    ({ orderId, sdkStatus }: EventTicketingScreenProps) => {
        const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
        const [paymentStatus, setPaymentStatus] = useState(sdkStatus);
        const [fetchTicketStatus, { data: ticketStatus }] = useTicketBookingsTicketBookingShortIdStatusGetMutation();
        const [fetchTicketDetails, { data: ticketDetails }] = useTicketBookingsTicketBookingShortIdDetailsGetMutation();
        const userPaymentInfo = useSelector((state: RootState) => selectPaymentInfo(state));

        const goToPaymentScreen = () => {
            const payloadExpireTime = userPaymentInfo?.sdkPayload.payload.clientAuthTokenExpiry;
            const expireDate = new Date(payloadExpireTime || '');
            const currentUtc = new Date();

            if (userPaymentInfo?.bookingReqData && userPaymentInfo?.placeId) {
                navigation.popTo('PaymentView', {
                    apiData: userPaymentInfo?.bookingReqData,
                    placeId: userPaymentInfo.placeId || '',
                    useOldPayload: currentUtc <= expireDate ? true : false,
                });
            }
        };

        const handleTicketStatus = useCallback(
            async (response: TicketBookingStatus_ticketBookingStatus) => {
                setPaymentStatus(response);
                fetchTicketDetails({ ticketBookingShortId: orderId });
            },
            [orderId],
        );

        const resolver = useCallback(
            async (action: PaymentStatusAction) => {
                switch (action.type) {
                    case 'PRESSED_BACK':
                        navigation.goBack();
                        break;
                }
            },
            [navigation],
        );
        const mpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

        usePolling({
            callApiFn: fetchTicketStatus,
            params: { ticketBookingShortId: orderId },
            pollingInterval: 3000,
            conditionToCall: () => {
                return (
                    (paymentStatus === 'charged' || paymentStatus === 'pending_vbv') &&
                    !(ticketStatus && ['Booked', 'Failed'].includes(ticketStatus))
                );
            },
            postApiCall: handleTicketStatus,
            postApiCallError: async () => {},
            cause: 'Fetching Ticketing Status',
            forceRefetchDeps: [],
            enable: true,
        });

        const viewState: EventTicketUIProps = {
            ticketDetails,
            mpDispatch,
        };

        if (paymentStatus === 'charged') {
            return <PaymentSuccessView />;
        } else if (paymentStatus === 'Booked') {
            return <EventTicketUI {...viewState} />;
        } else if (paymentStatus === 'Pending') {
            return (
                <PaymentPendingView
                    onGoHome={() => {
                        navigation.popTo('mainTabNavigation', {
                            screen: 'homeTab_homeScreen',
                        });
                    }}
                />
            );
        } else {
            return (
                <PaymentFailedView
                    onTryAgain={() => goToPaymentScreen()}
                    onGoHome={() => {
                        navigation.popTo('mainTabNavigation', {
                            screen: 'homeTab_homeScreen',
                        });
                    }}
                />
            );
        }
    },
);

export const PaymentStatusScreen: React.FC = React.memo(() => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'YatriSathiPaymentStatusScreen'>>();
    const { orderId = '', sdkStatus = 'pending' } = route.params || {};

    return <PaymentStatusScreenFlow orderId={orderId} sdkStatus={sdkStatus} />;
});
