import { EventName } from '@/typescript/utils/logger';
import { AppConfigSystemType, AppConfigCityType } from '../../types';
import mtIcYatriLogo from '@/typescript/assets/mt_ic_yatri_logo.webp';
import { getImageUri } from '@/typescript/utils/common';
import mtIcYaRedbus from '@/typescript/assets/mt_ic_ya_redbus.webp';
import { yatri } from '@/typescript/utils/appLogob64';

export const yatriDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        websiteLink: 'https://www.getyatri.com/',
        termsAndConditionLink: 'https://docs.google.com/document/d/1zmQWO_L4EjyCXC3xSlp1f3DS2wI4HfbHxg42tXelWe0',
        privacyPolicyLink: 'https://docs.google.com/document/d/1gI_P4oZnVwE0O71rI4Mi8rpZbL9rsIRkyewbql85Np8',
        openDataDashboardLink: 'https://www.getyatri.com/open?cc=DEL',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 28.7041,
            longitude: 77.1025,
        },
        merchantAndClientConfig: {
            sdkMid: 'yatri',
            mobilityMid: 'NAMMA_YATRI',
            clientId: 'yatriconsumer',
        },
        firstRideCompletedEvents: {
            firstRideComplete: [
                EventName.Y_USER_FIRST_RIDE_COMPLETED,
                EventName.Y_USER_FIRST_RIDE_COMPLETED_7D,
                EventName.Y_USER_FIRST_RIDE_COMPLETED_30D,
            ],
            firstCabRideComplete: EventName.Y_CAB_FIRSTRIDE,
            firstAutoRideComplete: EventName.Y_AUTO_FIRSTRIDE,
            firstBikeRideComplete: EventName.Y_BIKE_FIRSTRIDE,
        },
    },

    textConfig: {
        appReadableName: 'Yatri',
        appId: 'net.openkochi.yatri',
    },

    assets: {
        appLogoUri: getImageUri(mtIcYatriLogo),
        redBusBannerUri: getImageUri(mtIcYaRedbus),
        appLogoB64: yatri,
    },
};

export const yatriConfig: AppConfigSystemType = {
    default: yatriDefaultConfig,
};
