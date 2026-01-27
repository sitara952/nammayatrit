import HyperSdkReact from 'hyper-sdk-react';
import * as React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { selectUserId } from '@/typescript/state/client/user.ts';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { selectNewFeatureFlags } from '../state/client/session';
import { useLazyPaymentCustomerGetQuery } from '@/api/integrations/rtk/PaymentCustomerGet.ts';
import { useEffect } from 'react';
import { MERCHANT_CLIENT_CONFIG } from '@/typescript/constants/common';
import Config from 'react-native-config';
import { useKeyboardController } from 'react-native-keyboard-controller';

export const PaymentManagement = () => {
    const personId = useAppSelector(selectUserId);
    const [triggerPaymentCustomerGet, { data: paymentCustomerDetails, isLoading, error }] =
        useLazyPaymentCustomerGetQuery();
    const configs = MERCHANT_CLIENT_CONFIG.value;
    const { setEnabled } = useKeyboardController();
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);

    // Common function to fetch payment customer data
    const fetchPaymentCustomerData = async () => {
        try {
            await triggerPaymentCustomerGet({}).unwrap();
        } catch (error) {
            console.error('Error fetching payment customer details:', error);
        }
    };

    useEffect(() => {
        // Call API on component mount
        fetchPaymentCustomerData();
        setEnabled(false);
    }, []); // Empty dependency array - only run on mount

    // Show loader while API is loading
    if (isLoading || !paymentCustomerDetails) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    // Show error state if API failed
    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorTitle}>Something went wrong</Text>
                <Text style={styles.errorMessage}>
                    Unable to load payment management. Please check your connection and try again.
                </Text>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="retry-button"
                    style={styles.retryButton}
                    onPress={fetchPaymentCustomerData}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const sdkPayload = {
        payload: {
            action: 'paymentManagement',
            clientAuthToken: paymentCustomerDetails?.clientAuthToken,
            clientAuthTokenExpiry: paymentCustomerDetails?.clientAuthTokenExpiry,
            clientId: configs.clientId,
            customerId: personId,
            environment: Config['SDK_ENV'],
            merchantId: configs.sdkMid,
            udf1: newFeatureFlags.enableHyperUPI ? 'hyperupi' : '',
        },
        requestId: 'f035c148b511434aa67684390dbb41rd',
        service: 'in.juspay.hyperpay',
    };

    HyperSdkReact.process(JSON.stringify(sdkPayload), 'paymentPage');

    // Return null as this component handles payment processing via SDK
    return null;
};

const styles = StyleSheet.create({
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
        textAlign: 'center',
    },
    errorMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
        lineHeight: 22,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});
