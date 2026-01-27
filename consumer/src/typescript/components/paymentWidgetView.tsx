import * as HyperSDK from 'hyper-sdk-react';
import * as React from 'react';
import type { paymentOrder } from '@/readOnly/api/types/PaymentOrder.gen.tsx';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { Platform } from 'react-native';
import HyperSdkReact from 'hyper-sdk-react';
import { useEffect } from 'react';
import { Text } from 'react-native';

export type PaymentViewWidgetProps = {
    sdkpayload: paymentOrder;
    productSummary: string | undefined;
    updatedTotalFare: number | undefined;
};

export const PaymentViewWidget = (props: PaymentViewWidgetProps) => {
    console.info('Called PaymentViewWidget', props);
    const { setEnabled } = useKeyboardController();

    const [payload, setPayload] = React.useState(
        props.sdkpayload?.sdkPayload?.sdk_payload
            ? {
                  ...props.sdkpayload.sdkPayload.sdk_payload,
                  payload: {
                      ...props.sdkpayload.sdkPayload.sdk_payload.payload,
                      lastName: 'test' + Date.now(),
                      features: { paymentWidget: { enable: true } },
                      product_summary: props.productSummary ?? '',
                      action: 'paymentPage',
                  },
              }
            : undefined,
    );

    const [isProcessCalled, setIsProcessCalled] = React.useState(false);

    useEffect(() => {
        const sdkPayload = props.sdkpayload?.sdkPayload?.sdk_payload;
        if (sdkPayload && props.updatedTotalFare !== undefined) {
            const payload = {
                ...sdkPayload,
                payload: {
                    ...sdkPayload.payload,
                    lastName: 'test' + Date.now(),
                    features: { paymentWidget: { enable: true } },
                    product_summary: props.productSummary ?? '',
                    ...(props.updatedTotalFare !== undefined && {
                        amount: props.updatedTotalFare.toString(),
                        action: 'updateOrder',
                    }),
                },
            };
            HyperSdkReact.process(JSON.stringify(payload), 'paymentPage');
        }
    }, [props.updatedTotalFare]);

    useEffect(() => {
        const sdkPayload = props.sdkpayload?.sdkPayload?.sdk_payload;
        if (sdkPayload && !isProcessCalled) {
            setIsProcessCalled(true);
            const payload = {
                ...sdkPayload,
                payload: {
                    ...sdkPayload.payload,
                    lastName: 'test' + Date.now(),
                    features: { paymentWidget: { enable: true } },
                    product_summary: props.productSummary ?? '',
                    action: 'paymentPage',
                },
            };
            setPayload(payload);
        } else if (sdkPayload) {
            const newPayload = {
                ...sdkPayload,
                payload: {
                    ...sdkPayload.payload,
                    lastName: 'test' + Date.now(),
                    features: { paymentWidget: { enable: true } },
                    product_summary: props.productSummary ?? '',
                    action: 'paymentPage',
                },
            };
            if (JSON.stringify(newPayload) !== JSON.stringify(payload)) {
                console.info('Payload state differs from props:', {
                    props: sdkPayload,
                    currentState: payload,
                    newState: newPayload,
                });
                setPayload(newPayload);
            }
        }
    }, [props.sdkpayload.sdkPayload?.sdk_payload, isProcessCalled]);

    if (Platform.OS === 'ios' && payload?.payload.action === 'paymentPage') {
        setEnabled(false);
    }

    if (payload === undefined) return <Text>Loading...</Text>;
    return (
        <HyperSDK.HyperFragmentView
            height={85}
            namespace={'paymentWidget'}
            payload={JSON.stringify(payload)}
            triggerProcess={true}
            hyperKey={'paymentPage'}
        />
    );
};
