import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import { createBannerConfig } from '../../../utils/BannerPopup';
import mtIcExtraFareIcon from '@/src-v2/assets/mt_ic_extra_fare_icon.webp';
import type { strings } from 'config-types';

export const driverDemandExtraBannerConfig = (userLanguageStrings: strings): BannerConfig =>
    createBannerConfig({
        bannerId: 'driverDemandExtraBanner',

        title: userLanguageStrings.DidTheDriverAskForExtraFare,
        imageUrl: mtIcExtraFareIcon,

        backgroundColor: '#FFFFFF',
        imagePosition: 'center',

        primaryButton: {
            text: userLanguageStrings.Yes,
            visible: true,
            textColor: '#FFFFFF',
            backgroundColor: '#363439',
            actionType: BannerActionType.Chain,
            apiEndpoint: APIEndpoint.None,
            inheritParentApi: false,
            callbackFunction: undefined,
            disabled: false,
            nextBannerId: 'driverDemandExtraConfirmationBanner',
        },

        secondaryButton: {
            text: userLanguageStrings.No,
            visible: true,
            textColor: '#FFFFFF',
            backgroundColor: '#363439',
            actionType: BannerActionType.Chain,
            apiEndpoint: APIEndpoint.None,
            inheritParentApi: false,
            callbackFunction: undefined,
            disabled: false,
            nextBannerId: 'thankyouRideBanner',
        },

        displayTiming: {
            showUntil: null,
        },

        accessibility: {
            importanceLevel: 'normal',
            accessibilityLabel: 'Driver extra fare confirmation banner',
            accessibilityHint: 'Ask if the driver requested more fare than shown',
        },
    });
