import { EventName } from '@/typescript/utils/logger';
import { AppConfigSystemType, AppConfigCityType } from '../../types';
import mtIcYsLogo from '@/typescript/assets/mt_ic_ys_logo.webp';
import { getImageUri } from '@/typescript/utils/common';
import rentalPolicyYs from '@/typescript/assets/rental_policy_ys.webp';
import yatriSathiTransparentLogo from '@/typescript/assets/ticketing/ys_yatriSathi_logo.webp';
import mtIcYsRedbus from '@/typescript/assets/mt_ic_ys_redbus.webp';
import { PaymentSources } from '@/typescript/state/client/user';
import { yatriSathi } from '@/typescript/utils/appLogob64';

export const yatriSathiDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        websiteLink: 'https://www.yatrisathi.in/',
        termsAndConditionLink: 'https://docs.google.com/document/d/19pQUgTWXBqcM7bjy4SU1-z33r-iXsdPMfZggBTXbdR4',
        privacyPolicyLink: 'https://docs.google.com/document/d/1-bcjLOZ_gR0Rda2BNmkKnqVds8Pm23v1e7JbSDdM70E',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 22.5744,
            longitude: 88.3629,
        },
        merchantAndClientConfig: {
            sdkMid: 'yatrisathizoo',
            mobilityMid: 'JATRI_SAATHI',
            clientId: 'yatrisathizoo',
        },
        firstRideCompletedEvents: {
            firstRideComplete: [
                EventName.YATRIUSER_FIRST_RIDE_COMPLETED,
                EventName.YATRI_USER_FIRST_RIDE_COMPLETED_7D,
                EventName.YATRI_USER_FIRST_RIDE_COMPLETED_30D,
            ],
            firstCabRideComplete: EventName.YS_CAB_FIRSTRIDE,
            firstAutoRideComplete: EventName.YS_AUTO_FIRSTRIDE,
            firstBikeRideComplete: EventName.YS_BIKE_FIRSTRIDE,
        },
        paymentSource: PaymentSources.YatriSathiTicketing,
    },

    textConfig: {
        appReadableName: 'Yatri Sathi',
        appId: 'in.juspay.jatrisaathi',
    },

    languageTextConfig: {
        changeToModeText: 'ChangeMode',
    },

    flowConfig: {
        metroBookingEnable: false,
    },

    assets: {
        appLogoUri: getImageUri(mtIcYsLogo),
        rentalPolicyImageUri: getImageUri(rentalPolicyYs),
        redBusBannerUri: getImageUri(mtIcYsRedbus),
        appLogoB64: yatriSathi,
    },

    screenConfig: {
        eventScreenConfig: {
            transparentBgLogo: getImageUri(yatriSathiTransparentLogo),
        },
    },
};

export const yatriSathiConfig: AppConfigSystemType = {
    default: yatriSathiDefaultConfig,
};
