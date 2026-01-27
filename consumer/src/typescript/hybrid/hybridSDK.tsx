import uuid from 'react-native-uuid';
import { MERCHANT_CLIENT_CONFIG } from '@/typescript/constants/common';

type SdkPayloadOptions = {
    environment: string | undefined;
    purpose: 'init' | 'process' | 'initiate' | 'paymentPage';
    viewParam: string | undefined; // Optional for "process"
    appToken: string | undefined; // Optional for "process" event
    readableAppName: string;
    service: string;
    customerId: string;
};

export function createSdkPayload(options: SdkPayloadOptions) {
    const { environment, purpose, viewParam, appToken = {}, readableAppName, service, customerId } = options;
    const configs = MERCHANT_CLIENT_CONFIG.value;
    return {
        requestId: uuid.v4(),
        service: service,
        betaAssets: false,
        payload: {
            clientId: configs.clientId,
            merchantId: configs.sdkMid,
            appName: readableAppName,
            action: purpose,
            appToken: appToken || '',
            deeplinkOptions: {
                parent_view: true,
                show_title: true,
            },
            logLevel: 1,
            isBootable: true,
            show_splash: false,
            environment: environment || 'production', // By default keeping it
            bundleTimeOut: 1000,
            loadDynamicModule: false,
            onCreateTimeStamp: 1728637766764,
            initiateTimeStamp: 1728637766778,
            initiateStartedTime: 1728637767475,
            currentActivityId: '6a898da9-767e-4e5b-bc28-8c506b8666b7',
            viewParam: viewParam || '',
            view_param: viewParam || '',
            deepLinkJSON: '',
            currentLocation: {},
            merchant_root_view: '16908290',
            merchant_keyboard_mode: 16,
            processStartedTime: 1728637773651,
            lifecycleId: 'sdk:1463f135-aff4-4ab4-96b0-ba9d33bbe696/os:f97bfdef-6578-419f-874d-c5dc3503e5c4',
            issuingPsp: 'YES_BIZ',
            customerId: customerId,
            // clientAuthToken:"tkn_c870954fd7884a93afe136dfba32ad7a",
            // customerId : "cth_sjDMHVRSk1s3RhLD"
        },
        service_based: true,
        use_local_assets: false,
        sdkName: 'godel',
        sdkVersion: '2.1.25',
        lifecycleId: 'sdk:1463f135-aff4-4ab4-96b0-ba9d33bbe696/os:f97bfdef-6578-419f-874d-c5dc3503e5c4',
    };
}
