import { AppConfigCityType, AppConfigSystemType } from '../../types';

export const bridgeDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        termsAndConditionLink:
            'https://docs.google.com/document/d/1medhA2Ifm0NdzC3gpK8VbxjAWOXAv7c4yhOAlPewbG0/edit?tab=t.0',
        privacyPolicyLink:
            'https://docs.google.com/document/d/1Og5v01daE32OHhGr3IptRPqdEURgtu8-DTfLhp0mZJA/edit?tab=t.0',
    },

    merchantData: {
        merchantAndClientConfig: {
            sdkMid: 'nammayatri',
            mobilityMid: 'BRIDGE_CABS',
            clientId: 'nammayatriconsumer',
        },
    },

    textConfig: {
        appReadableName: 'Bridge',
        currencySymbol: '€',
    },
};

export const bridgeConfig: AppConfigSystemType = {
    default: bridgeDefaultConfig,
};
