import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import { createBannerConfig } from '../../../utils/BannerPopup';
import mtIcAcPopup from '@/typescript/assets/ny-service/mt_ic_ac_preference.webp';
import type { strings } from 'config-types';

export const acPreferenceBannerConfig = (userLanguageStrings: strings): BannerConfig =>
    createBannerConfig({
        bannerId: 'acPreferenceBanner',

        title: userLanguageStrings.HasYourDriverSetTheACAsPerYourPreference,
        imageUrl: mtIcAcPopup,

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
            nextBannerId: 'thankyouRideBanner',
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
            nextBannerId: 'acPreferenceConfirmationBanner',
        },

        displayTiming: {
            showUntil: null,
        },

        accessibility: {
            importanceLevel: 'normal',
            accessibilityLabel: 'AC preference confirmation banner',
            accessibilityHint: 'Confirm if AC is set according to your preference or report an issue',
        },
    });
