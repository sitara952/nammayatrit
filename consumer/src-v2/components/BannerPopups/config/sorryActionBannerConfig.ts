import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import mtIcThumbsUpIcon from '@/src-v2/assets/mt_ic_thumbs_up_icon.webp';
import { createBannerConfig } from '../../../utils/BannerPopup';
import type { strings } from 'config-types';

export const sorryActionBannerConfig = (userLanguageStrings: strings): BannerConfig =>
    createBannerConfig({
        bannerId: 'sorryActionBanner',

        title: userLanguageStrings.SorryWellReviewThisAndTakeNecessaryAction,
        imageUrl: mtIcThumbsUpIcon,

        backgroundColor: '#3E4048',
        textColor: '#FFFFFF',
        imagePosition: 'center',

        autoDismiss: true,
        autoDismissDuration: 5000,

        primaryButton: {
            text: userLanguageStrings.Okay,
            backgroundColor: '#FFFFFF',
            textColor: '#3E4048',
        },

        secondaryButton: {
            text: userLanguageStrings.Undo,
            actionType: BannerActionType.Undo,
            visible: true,
            textColor: '#FFFFFF',
            backgroundColor: 'transparent',
            apiEndpoint: APIEndpoint.None,
            inheritParentApi: true,
            callbackFunction: undefined,
            disabled: false,
            nextBannerId: undefined,
        },
        accessibility: {
            importanceLevel: 'high',
            accessibilityLabel: 'Action confirmation message',
            accessibilityHint: 'Confirms your report has been received with options to undo',
        },
    });

export const sorryActionBannerConfigExtraFare = (userLanguageStrings: strings): BannerConfig => {
    const baseConfig = sorryActionBannerConfig(userLanguageStrings);
    return {
        ...baseConfig,
        bannerId: 'sorryActionBannerExtraFare',
        primaryButton: {
            ...baseConfig.primaryButton,
            nextBannerId: undefined,
        },
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
