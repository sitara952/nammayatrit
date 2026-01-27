import { AppConfigCityType, AppConfigSystemType } from '../../types';

export const lynxDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    textConfig: {
        appReadableName: 'Lynx',
        currencySymbol: '€',
    },
};

export const lynxConfig: AppConfigSystemType = {
    default: lynxDefaultConfig,
};
