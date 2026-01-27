import { EventName } from '@/typescript/utils/logger';
import { AppConfigSystemType, AppConfigCityType } from '../../types';
import mtIcOdhisaYatriLogo from '@/typescript/assets/mt_ic_odhisa_yatri_logo.webp';
import { getImageUri } from '@/typescript/utils/common';
import { PaymentSources } from '@/typescript/state/client/user';
import odishaYatriTransparentLogo from '@/typescript/assets/ticketing/os_odishaYatri_logo.webp';
import mtIcOyRedbus from '@/typescript/assets/mt_ic_oy_redbus.webp';
import { odishaYatri } from '@/typescript/utils/appLogob64';

export const odishaYatriDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        websiteLink: 'https://www.odishayatri.in/',
        termsAndConditionLink: 'https://www.odishayatri.in/terms_of_use/',
        privacyPolicyLink: 'https://www.odishayatri.in/privacy-policy/',
        refundPolicyLink: 'https://www.odishayatri.in/refund-policy/',
        openDataDashboardLink: 'https://www.odishayatri.in/open?cc=BBI',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 20.296,
            longitude: 85.8246,
        },
        merchantAndClientConfig: {
            sdkMid: 'odishayatri',
            mobilityMid: 'NAMMA_YATRI',
            clientId: 'odishayatri',
        },
        firstRideCompletedEvents: {
            firstRideComplete: [
                EventName.ODISHAUSER_FIRST_RIDE_COMPLETED,
                EventName.ODISHA_USER_FIRST_RIDE_COMPLETED_7D,
                EventName.ODISHA_USER_FIRST_RIDE_COMPLETED_30D,
            ],
        },
        paymentSource: PaymentSources.OdishaYatriTicketing,
        paymentGatewayReferenceId: 'oy_bus',
    },

    textConfig: {
        appReadableName: 'Odisha Yatri',
        appId: 'in.mobility.odishayatri',
        publicTransitText: 'Odisha Transit',
    },

    flowConfig: {
        enableLiveTracking: true,
        showFirstNearestStopInServiceTab: true,
        enableTicketActivationFlowPartially: true,
        metroBookingEnable: false,
    },

    uiConfig: {
        showOtpBusButton: true,
        includeAutoFareInTransitFare: true,
        hideAddressShimmer: false,
        hideMaskedAnimatingIcon: true,
        hideVehicleNextArrivalAndValidityDetails: true,
        hideNextAvailableBusesInfo: false,
        hideRepeatBookings: true,
        showOtpCardAndSaintImage: false,
        otpKeypadCharacters: 'ODIS',
        busOtpTicketModalType: 'Type2',
        hideNoTicketRequiredForChildrenBelow5Text: true,
    },

    assets: {
        appLogoUri: getImageUri(mtIcOdhisaYatriLogo),
        activatedTicketLayoutLogo: getImageUri(mtIcOdhisaYatriLogo), //After getting the correct asset will replace this
        redBusBannerUri: getImageUri(mtIcOyRedbus),
        appLogoB64: odishaYatri,
    },

    screenConfig: {
        ticketScreenConfig: {
            busTicketText: {
                regionalTitle: 'ବସ୍ ଟିକେଟ୍',
            },
        },
        reviewAndFeedbackScreenConfig: {
            showRideEndThankYouScreen: true,
            showLogoAtThankYouScreen: true,
        },
        eventScreenConfig: {
            showAllTicketButton: true,
            transparentBgLogo: getImageUri(odishaYatriTransparentLogo),
        },
        singleModeSearchScreenConfig: {
            showEditPencil: true,
            showInputGroupDirection: true,
        },
    },
};

export const odishaYatriConfig: AppConfigSystemType = {
    default: odishaYatriDefaultConfig,
    sambalpur: {
        flowConfig: {
            enable_ride_hailing: false,
        },
    },
};
