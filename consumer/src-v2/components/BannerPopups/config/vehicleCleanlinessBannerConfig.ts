import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import { createBannerConfig } from '../../../utils/BannerPopup';
import mtIcVehicleCleanlinessIcon from '@/typescript/assets/ny-service/mt_ic_vehicle_cleanliness.webp';

import type { strings } from 'config-types';

export const vehicleCleanlinessBannerConfig = (userLanguageStrings: strings): BannerConfig =>
    createBannerConfig({
        bannerId: 'vehicleCleanlinessBanner',

        title: userLanguageStrings.IsYourVehicleClean,
        imageUrl: mtIcVehicleCleanlinessIcon,

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
            nextBannerId: 'sorryActionBanner',
        },

        displayTiming: {
            showUntil: null,
        },

        accessibility: {
            importanceLevel: 'normal',
            accessibilityLabel: 'Vehicle cleanliness confirmation banner',
            accessibilityHint: 'Confirm if the vehicle is clean or report an issue',
        },
    });
