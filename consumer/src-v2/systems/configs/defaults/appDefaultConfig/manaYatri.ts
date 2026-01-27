import { EventName } from '@/typescript/utils/logger';
import { AppConfigCityType, AppConfigSystemType } from '../../types';
import mtIcMyLogo from '@/typescript/assets/mt_ic_my_logo.webp';
import { getImageUri } from '@/typescript/utils/common';
import mtIcMyRedbus from '@/typescript/assets/mt_ic_my_redbus.webp';
import { manaYatri } from '@/typescript/utils/appLogob64';

export const manaYatriDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        websiteLink: 'https://www.manayatri.in/',
        termsAndConditionLink: 'https://docs.google.com/document/d/1-oRR_oI8ncZRPZvFZEJZeCVQjTmXTmHA',
        privacyPolicyLink: 'https://docs.google.com/document/d/128VU80K5E1iz-x6QnP1R127m_lwmDO3F',
        openDataDashboardLink: 'https://www.manayatri.in/open?cc=HYD',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 17.4065,
            longitude: 78.4772,
        },
        firstRideCompletedEvents: {
            firstRideComplete: [
                EventName.MY_USER_FIRST_RIDE_COMPLETED,
                EventName.MY_USER_FIRST_RIDE_COMPLETED_7D,
                EventName.MY_USER_FIRST_RIDE_COMPLETED_30D,
            ],
            firstCabRideComplete: EventName.MY_CAB_FIRSTRIDE,
            firstAutoRideComplete: EventName.MY_AUTO_FIRSTRIDE,
            firstBikeRideComplete: EventName.MY_BIKE_FIRSTRIDE,
        },
    },

    textConfig: {
        appReadableName: 'Mana Yatri',
        appId: 'in.mobility.manayatri',
    },

    assets: {
        appLogoUri: getImageUri(mtIcMyLogo),
        redBusBannerUri: getImageUri(mtIcMyRedbus),
        appLogoB64: manaYatri,
    },
};

export const manaYatriConfig: AppConfigSystemType = {
    default: manaYatriDefaultConfig,
};
