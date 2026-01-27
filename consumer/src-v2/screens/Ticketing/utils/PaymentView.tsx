import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import HyperSdkReact from 'hyper-sdk-react';
import { useTicketPlacesPlaceIdBookPostMutation } from '@/api/integrations/rtk/TicketPlacesPlaceIdBookPost';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { createSdkPayload } from '@/typescript/hybrid/hybridSDK';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import {
    selectAppConfig,
    selectAppReadableName,
    selectHideLoader,
    setHideLoader,
} from '@/typescript/state/client/session';
import { selectToken } from '@/typescript/state/client/auth';
import {
    setTicketBookingOrderId,
    setPaymentInfo,
    selectUserId,
    selectPaymentInfo,
} from '@/typescript/state/client/user';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { useSelector } from 'react-redux';
import { RootState } from '@/typescript/state/store';

export const PaymentView = () => {
    const { apiData, placeId, useOldPayload } = useRoute<RouteProp<MainNavigationParamList, 'PaymentView'>>().params;
    const [bookTicket, { isLoading, data: orderResp }] = useTicketPlacesPlaceIdBookPostMutation();
    const [isSdkInitialized, setIsSdkInitialized] = useState(false);
    const userPaymentInfo = useSelector((state: RootState) => selectPaymentInfo(state));
    const appConfig = useAppSelector(selectAppConfig);
    const appReadableName = useAppSelector(selectAppReadableName);
    const userToken = useAppSelector(selectToken);
    const userId = useAppSelector(selectUserId);
    const dispatch = useAppDispatch();
    const { setEnabled } = useKeyboardController();
    const hideLoader = useAppSelector(selectHideLoader);

    useEffect(() => {
        setEnabled(false); // Removes conflicting hook issue in hyper-sdk-react while opening keyboard
        const initializePayment = async () => {
            try {
                HyperSdkReact.terminate('paymentPage');
                HyperSdkReact.createHyperServices('paymentPage');

                const sdkPayloadInit = createSdkPayload({
                    environment: 'production',
                    purpose: 'initiate',
                    readableAppName: appReadableName,
                    service: 'in.juspay.hyperpay',
                    viewParam: undefined,
                    appToken: undefined,
                    customerId: userId || '',
                });

                HyperSdkReact.initiate(JSON.stringify(sdkPayloadInit), 'paymentPage');
                setIsSdkInitialized(true);

                if (!useOldPayload) {
                    await bookTicket({
                        placeId: placeId,
                        body: apiData,
                    })
                        .unwrap()
                        .then(res => {
                            dispatch(
                                setTicketBookingOrderId({
                                    id: userToken,
                                    payload: res?.id,
                                }),
                            );
                            dispatch(
                                setPaymentInfo({
                                    id: userToken,
                                    payload: {
                                        placeId: placeId,
                                        paymentOrderId: res.order_id,
                                        paymentSource: appConfig.merchantData.paymentSource,
                                        bookingReqData: apiData,
                                        sdkPayload: res.sdk_payload,
                                    },
                                }),
                            );
                        });
                }
            } catch (error) {
                console.error('Failed to initialize payment:', error);
            }
        };
        initializePayment();
    }, [placeId, userToken]);

    const sdkPayload = useOldPayload ? userPaymentInfo?.sdkPayload : orderResp?.sdk_payload;

    const processPayload = {
        ...sdkPayload,
        payload: {
            ...sdkPayload?.payload,
            gatewayReferenceId: appConfig.merchantData.paymentGatewayReferenceId,
        },
    };

    useEffect(() => {
        if (sdkPayload && isSdkInitialized) {
            dispatch(setHideLoader(true));
            HyperSdkReact.process(JSON.stringify(processPayload), 'paymentPage');
        }
    }, [sdkPayload, isSdkInitialized, dispatch]);

    if (isLoading || !isSdkInitialized || hideLoader) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }
    return null;
};
