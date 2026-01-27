import HyperSdkReact from 'hyper-sdk-react';
import { createSdkPayload } from '@/typescript/hybrid/hybridSDK';
import { logger } from '@/src-v2/systems/logger';
import { logEvent, EventName } from '@/typescript/utils/logger';

/**
 * Common payment initialization function
 * Checks if HyperSDK is initialized and initializes it if needed
 */
export const checkAndInitiatePayment = async (appReadableName: string, personId: string): Promise<void> => {
    console.info('Checking and initiating payment');
    const sdkPayload = createSdkPayload({
        environment: 'production',
        purpose: 'initiate',
        readableAppName: appReadableName,
        service: 'in.juspay.hyperpay',
        viewParam: undefined,
        appToken: undefined,
        customerId: personId || '',
    });
    const isInitialised = await HyperSdkReact.isInitialised('paymentPage');
    logger.logDebug(`Payment isInitialised: ${isInitialised}`, 'PaymentSDKFlow');
    logEvent(EventName.NY_USER_PAYMENT_IS_INITIALISED, { isInitialised: isInitialised });
    console.info('Payment isInitialised: ', isInitialised);
    if (!isInitialised) {
        console.info('Payment not initialised, creating hyper services and initiating payment', isInitialised);
        logEvent(EventName.NY_USER_NOT_INITIALISED, { isInitialised: isInitialised });
        logger.logDebug(`Payment re-initiate isInitialised: ${isInitialised}`, 'PaymentSDKFlow');
        logEvent(EventName.NY_USER_PAYMENT_RE_INITIALISED, { isInitialised: isInitialised });
        HyperSdkReact.createHyperServices('paymentPage');
        HyperSdkReact.initiate(JSON.stringify(sdkPayload), 'paymentPage');
    }
};
