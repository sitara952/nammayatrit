import { getImageUri } from '@/typescript/utils/common';
import { AppConfigCityType, AppConfigSystemType } from '../../types';
import mtIcKsLogo from '@/typescript/assets/mt_ic_ks_logo.webp';
import mt_ic_ks_ride_completed from '@/typescript/assets/mt_ic_ks_ride_completed_bg.webp';
import mtIcKsRedbus from '@/typescript/assets/mt_ic_ks_redbus.webp';
import { keralaSavaari } from '@/typescript/utils/appLogob64';

export const kerelaSavaariDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        websiteLink: 'https://www.keralasavaari.kerala.gov.in/',
        termsAndConditionLink: 'https://docs.google.com/document/d/1vls7HMp1pnmJA6OT6zQa_SV9BzLW_Sps/edit',
        privacyPolicyLink: 'https://docs.google.com/document/d/128VU80K5E1iz-x6QnP1R127m_lwmDO3F',
        openDataDashboardLink: 'https://www.keralasavaari.kerala.gov.in/open?cc=TRV',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 9.9312,
            longitude: 76.2673,
        },
        merchantAndClientConfig: {
            sdkMid: 'nammayatriBAP',
            mobilityMid: 'NAMMA_YATRI',
            clientId: 'nammayatriBAP',
        },
    },

    textConfig: {
        appReadableName: 'Kerela Savaari',
        appId: 'in.mobility.keralasavaariconsumer',
    },

    assets: {
        appLogoUri: getImageUri(mtIcKsLogo),
        redBusBannerUri: getImageUri(mtIcKsRedbus),
        appLogoB64: keralaSavaari,
    },

    screenConfig: {
        reviewAndFeedbackScreenConfig: {
            rideCompleteBgUri: getImageUri(mt_ic_ks_ride_completed),
        },
    },
};

export const kerelaSavaariConfig: AppConfigSystemType = {
    default: kerelaSavaariDefaultConfig,
};
