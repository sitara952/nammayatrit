import { EventName } from '@/typescript/utils/logger';
import { AppConfigCityType, AppConfigSystemType } from '../../types';
import { getImageUri } from '@/typescript/utils/common';
import mtIcNyLogo from '@/typescript/assets/mt_ic_ny_logo.webp';
import { nammayatri } from '@/typescript/utils/appLogob64';

export const nammaYatriDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        openDataDashboardLink: 'https://nammayatri.in/open?cc=',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 12.971844569387844,
            longitude: 77.59449449293095,
        },
        merchantAndClientConfig: {
            sdkMid: 'nammayatriBAP',
            mobilityMid: 'NAMMA_YATRI',
            clientId: 'nammayatriBAP',
        },
        firstRideCompletedEvents: {
            firstRideComplete: [
                EventName.NY_USER_FIRST_RIDE_COMPLETED,
                EventName.NY_USER_FIRST_RIDE_COMPLETED_7D,
                EventName.NY_USER_FIRST_RIDE_COMPLETED_30D,
            ],
            firstCabRideComplete: EventName.NY_CAB_FIRSTRIDE,
            firstAutoRideComplete: EventName.NY_AUTO_FIRSTRIDE,
            firstBikeRideComplete: EventName.NY_BIKE_FIRSTRIDE,
        },
    },

    textConfig: {
        appReadableName: 'Namma Yatri',
        appId: 'in.mobility.nammayatri',
        publicTransitText: 'Namma Transit',
    },

    flowConfig: {
        showAutoTripStartedLottie: true,
        ticketCancelFlowConfig: {
            metroCancelEnable: true,
        },
        multimodalTrackWithoutBooking: true,
        businessProfileConfig: {
            pollingTime: 5000,
            maxPollTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
            showNewTag: true,
            enableBusinessProfile: true,
            businessEstimatedOrder: ['COMFY', 'ECO', 'TAXI', 'AUTO_PLUS', 'AUTO_RICKSHAW', 'SUV', 'SUV_PLUS'],
        },
    },

    uiConfig: {
        includeAutoFareInTransitFare: true,
    },

    assets: {
        appLogoUri: getImageUri(mtIcNyLogo),
        appLogoB64: nammayatri,
    },

    screenConfig: {
        reviewAndFeedbackScreenConfig: {
            feedbackScreenType: 'share-type',
        },
        ticketScreenConfig: {
            metroTicketText: {
                headerTitle: 'Namma Metro',
                regionalTitle: 'ಮೆಟ್ರೋ ಟಿಕೆಟ್',
            },
            footerRegionalText: 'ಸಾರ್ವಜನಿಕ ಸಾರಿಗೆ \n ಬಳಸಿದ್ದಕ್ಕಾಗಿ ಧನ್ಯವಾದಗಳು.',
        },
        profileTab: {
            primaryOptions: ['businessProfile', 'favourites', 'paymentManagement'],
        },
    },
};

export const nammaYatriConfig: AppConfigSystemType = {
    default: nammaYatriDefaultConfig,
};
