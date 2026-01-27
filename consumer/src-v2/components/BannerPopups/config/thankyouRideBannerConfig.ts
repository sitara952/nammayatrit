import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import mtIcSmileThankyouIcon from '@/src-v2/assets/mt_ic_smile_thankyou_icon.webp';
import { createBannerConfig } from '../../../utils/BannerPopup';
import type { strings } from 'config-types';

export const thankyouRideBannerConfig = (userLanguageStrings: strings, appName: string): BannerConfig =>
    createBannerConfig({
        bannerId: 'thankyouRideBanner',

        title: userLanguageStrings.ThankYouForRidingWith(appName),
        imageUrl: mtIcSmileThankyouIcon,

        backgroundColor: '#FFCE4B',
        textColor: '#313131',
        imagePosition: 'center',

        autoDismiss: true,
        autoDismissDuration: 5000,

        primaryButton: {
            text: userLanguageStrings.Okay,
        },

        secondaryButton: {
            text: userLanguageStrings.Undo,
            visible: true,
            textColor: '#000000',
            backgroundColor: 'transparent',
            actionType: BannerActionType.Undo,
            apiEndpoint: APIEndpoint.None,
            inheritParentApi: false,
            callbackFunction: undefined,
            disabled: false,
            nextBannerId: undefined,
        },

        accessibility: {
            importanceLevel: 'normal',
            accessibilityLabel: 'Ride completion thank you message',
            accessibilityHint: 'Shows a thank you message after completing your ride',
        },
    });

export const thankyouRideBannerConfigExtraFare = (userLanguageStrings: strings, appName: string): BannerConfig => {
    const baseConfig = thankyouRideBannerConfig(userLanguageStrings, appName);
    return {
        ...baseConfig,
        bannerId: 'thankyouRideBannerExtraFare',
        secondaryButton: {
            ...baseConfig.secondaryButton,
            visible: false,
            text: '',
            textColor: '',
            backgroundColor: '',
            actionType: BannerActionType.Undo,
            apiEndpoint: APIEndpoint.None,
            inheritParentApi: false,
            callbackFunction: undefined,
            disabled: false,
            nextBannerId: undefined,
        },
    };
};
