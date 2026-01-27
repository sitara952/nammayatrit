import {
    acPreferenceBannerConfig,
    acPreferenceConfirmationBannerConfig,
    thankyouRideBannerConfig,
    thankyouRideBannerConfigExtraFare,
    sorryActionBannerConfig,
    sorryActionBannerConfigExtraFare,
    tollAndParkingBannerConfig,
    tollIncludedBannerConfig,
    parkingBannerConfig,
    driverDemandExtraBannerConfig,
    driverDemandExtraConfirmationBannerConfig,
    vehicleCleanlinessBannerConfig,
} from './index';
import type { strings } from 'config-types';
import type { BannerConfig } from './types';

export type ValidBannerId =
    | 'acPreferenceBanner'
    | 'acPreferenceConfirmationBanner'
    | 'thankyouRideBanner'
    | 'thankyouRideBannerExtraFare'
    | 'sorryActionBanner'
    | 'sorryActionBannerExtraFare'
    | 'tollAndParkingIncludedBanner'
    | 'tollIncludedBanner'
    | 'parkingBanner'
    | 'driverDemandExtraBanner'
    | 'driverDemandExtraConfirmationBanner'
    | 'vehicleCleanlinessBanner';

export const createBannerRegistry = (
    userLanguageStrings: strings,
    appName: string,
): Record<ValidBannerId, BannerConfig> => ({
    acPreferenceBanner: acPreferenceBannerConfig(userLanguageStrings),
    acPreferenceConfirmationBanner: acPreferenceConfirmationBannerConfig(userLanguageStrings),
    thankyouRideBanner: thankyouRideBannerConfig(userLanguageStrings, appName),
    thankyouRideBannerExtraFare: thankyouRideBannerConfigExtraFare(userLanguageStrings, appName),
    sorryActionBanner: sorryActionBannerConfig(userLanguageStrings),
    sorryActionBannerExtraFare: sorryActionBannerConfigExtraFare(userLanguageStrings),
    tollAndParkingIncludedBanner: tollAndParkingBannerConfig,
    tollIncludedBanner: tollIncludedBannerConfig,
    parkingBanner: parkingBannerConfig,
    driverDemandExtraBanner: driverDemandExtraBannerConfig(userLanguageStrings),
    driverDemandExtraConfirmationBanner: driverDemandExtraConfirmationBannerConfig(userLanguageStrings),
    vehicleCleanlinessBanner: vehicleCleanlinessBannerConfig(userLanguageStrings),
});
