import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import { createBannerConfig } from '../../../utils/BannerPopup';
import mtIcReportIcon from '@/src-v2/assets/mt_ic_report_icon.webp';
import type { strings } from 'config-types';

export const acPreferenceConfirmationBannerConfig = (userLanguageStrings: strings): BannerConfig =>
    createBannerConfig({
        bannerId: 'acPreferenceConfirmationBanner',

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
            apiEndpoint: APIEndpoint.ReportAcIssue,
            inheritParentApi: false,
            callbackFunction: undefined,
            disabled: false,
            nextBannerId: 'sorryActionBanner',
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
            importanceLevel: 'high',
            accessibilityLabel: 'AC issue confirmation',
            accessibilityHint: 'Confirms if you want to report the AC issue',
        },
    });
