import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import { createBannerConfig } from '../../../utils/BannerPopup';
import mtIcReportIcon from '@/src-v2/assets/mt_ic_report_icon.webp';
import type { strings } from 'config-types';

export const driverDemandExtraConfirmationBannerConfig = (userLanguageStrings: strings): BannerConfig =>
    createBannerConfig({
        bannerId: 'driverDemandExtraConfirmationBanner',

        title: userLanguageStrings.DoYouWantToReportThisIssue,
        imageUrl: mtIcReportIcon,

        backgroundColor: '#FFFFFF',
        imagePosition: 'center',

        primaryButton: {
            text: userLanguageStrings.Yes,
            visible: true,
            textColor: '#FFFFFF',
            backgroundColor: '#363439',
            actionType: BannerActionType.Chain,
            apiEndpoint: APIEndpoint.ReportExtraFare,
            inheritParentApi: false,
            callbackFunction: undefined,
            disabled: false,
            nextBannerId: 'sorryActionBannerExtraFare',
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
            nextBannerId: 'thankyouRideBannerExtraFare',
        },

        displayTiming: {
            showUntil: null,
        },

        accessibility: {
            importanceLevel: 'high',
            accessibilityLabel: 'Extra fare confirmation',
            accessibilityHint: 'Confirms if you want to report the extra fare issue',
        },

        priority: 'high',
        visibility: true,
        swipeToDismiss: false,
        autoDismiss: false,
        autoDismissDuration: undefined,
        dismissible: true,
        textColor: '#313131',
        description: undefined,
        parentBannerId: undefined,
    });
