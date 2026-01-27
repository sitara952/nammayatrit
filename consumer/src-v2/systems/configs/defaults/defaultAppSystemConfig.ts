import { appName } from 'config-types';
import { AppConfigSystemType, AppConfigType } from '../types';
import { nammaYatriConfig } from './appDefaultConfig/nammaYatri';
import { manaYatriConfig } from './appDefaultConfig/manaYatri';
import { yatriSathiConfig } from './appDefaultConfig/yatriSathi';
import { yatriConfig } from './appDefaultConfig/yatri';
import { annaConfig } from './appDefaultConfig/anna';
import { bharatTaxiConfig } from './appDefaultConfig/bharatTaxi';
import { bridgeConfig } from './appDefaultConfig/bridge';
import { kerelaSavaariConfig } from './appDefaultConfig/kerelaSavaari';
import { odishaYatriConfig } from './appDefaultConfig/odishaYatri';
import { EventName } from '@/typescript/utils/logger';
import mtIcNyLogo from '@/typescript/assets/mt_ic_ny_logo.webp';
import { getImageUri } from '@/typescript/utils/common';
import mt_ic_ride_completed_bg from '@/typescript/assets/mt_ic_ride_completed_bg.webp';
import mtIcNammaMetro from '@/src-v2/assets/mt_ic_namma_metro.png';
import rentalPolicy from '@/typescript/assets/rental_policy.webp';
import page1 from '@/typescript/assets/page1.webp';
import page2 from '@/typescript/assets/page2.webp';
import page3 from '@/typescript/assets/page3.webp';
import bengaluruPolice from '@/typescript/assets/bengaluru_police.webp';
import { PaymentSources } from '@/typescript/state/client/user';
import mtIcNammaYatriGold from '@/src-v2/assets/3D-assets/mtIcNammaYatriGold.webp';
import startJourneyImageKannada from '@/src-v2/assets/3D-assets/live-journey/start-journey-ticket-kannada.png';
import fallbackBangaloreMapImage from '@/src-v2/assets/journey_map_fallback.webp';
import mtIcNyRedbus from '@/typescript/assets/mt_ic_ny_redbus.webp';
import ic_driver_default_profile from '@/typescript/assets/base64/ic_driver_default_profile';
import { nammayatri } from '@/typescript/utils/appLogob64';

//overrides config for each app
export const defaultAppSystemConfig: Record<appName, AppConfigSystemType> = {
    anna: annaConfig,
    bharatTaxi: bharatTaxiConfig,
    bridge: bridgeConfig,
    keralaSavaari: kerelaSavaariConfig,
    manaYatri: manaYatriConfig,
    nammaYatri: nammaYatriConfig,
    odishaYatri: odishaYatriConfig,
    yatri: yatriConfig,
    yatriSathi: yatriSathiConfig,
};

const defaultCarouselItems = [
    {
        image: { uri: getImageUri(page1) },
        title: 'The fastest ride booking app is here!',
        description: 'Our speedy booking process means you get a ride quickly and easily.',
    },
    {
        image: { uri: getImageUri(page2) },
        title: 'Inclusive and accessible, for everyone!',
        description: 'We strive to provide all our users an even & equal experience.',
    },
    {
        image: { uri: getImageUri(page3) },
        title: 'Be a part of the Open Mobility Revolution!',
        description: 'Our data and product roadmap are transparent for all.',
    },
];

//common default config for all apps
export const defaultAppConfigs: AppConfigType = {
    appType: 'ride-hailing',

    constants: {
        termsAndConditionLink: 'https://nammayatri.in/terms_of_use/',
        privacyPolicyLink: 'https://nammayatri.in/privacy-policy/',
        refundPolicyLink: undefined,
        openDataDashboardLink: undefined,
        websiteLink: 'https://www.nammayatri.in/',
        touristBusPdfLink: 'https://drive.google.com/file/d/1gYgNQ0YfKT-qZFMA3ajvQXwnd7zOnTK-/view?usp=sharing',
    },

    merchantData: {
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
            firstCabRideComplete: undefined,
            firstAutoRideComplete: undefined,
            firstBikeRideComplete: undefined,
        },
        paymentSource: PaymentSources.NammaYatriTicketing,
        paymentGatewayReferenceId: '',
        initialCoordinate: {
            latitude: 12.971844569387844,
            longitude: 77.59449449293095,
        },
    },

    textConfig: {
        appReadableName: 'App',
        appId: 'in.mobility.nammayatri',
        publicTransitText: 'Public Transit',
        currencySymbol: '₹',
        rideOtpText: 'OTP',
        callPoliceText: 'Bengaluru City Police',
    },

    languageTextConfig: {
        changeToModeText: 'SwitchtoAutoOrCab',
    },

    flowConfig: {
        multimodalTrackWithoutBooking: false,
        enableMapSnapshot: true,
        busTicketActivationFlow: false,
        enableLiveTracking: true,
        showFirstNearestStopInServiceTab: false,
        enableTicketActivationFlowPartially: false,
        shareReferralLink: true,
        ticketCancelFlowConfig: {
            metroCancelEnable: false,
            busCancelEnable: false,
            subwayCancelEnable: false,
        },
        showAutoTripStartedLottie: false,
        skipProfileOnboarding: false,
        metroBookingEnable: true,
        enableFemaleRotatingText: false,
        businessProfileConfig: {
            pollingTime: 5000,
            maxPollTimeout: 30 * 60 * 1000, // 30 minutes in milliseconds
            showNewTag: true,
            enableBusinessProfile: false,
            businessEstimatedOrder: ['COMFY', 'ECO', 'TAXI', 'AUTO_PLUS', 'AUTO_RICKSHAW', 'SUV', 'SUV_PLUS'],
        },
        nearByBusConfig: {
            showNearbyBus: false,
            maxNearbyBuses: 5,
            nearbyBusPollingInterval: 5000,
            nearbyBusCircleRadius: 500,
        },
        enable_ride_hailing: true,
    },

    uiConfig: {
        thankYouMsgRideEnd: false,
        enableLegacyIntercityCheck: true,
        showOtpBusButton: false,
        showNamasteCallout: false,
        showMapFallback: true,
        homeScreenSnapPoints: ['54%', '95%'],
        homeScreenMapPaddingBottom: 380,
        passTabEnabled: false,
        extraFareDetail: [],
        includeAutoFareInTransitFare: false,
        showTicketLabelInTransitInfoCard: false,
        hideAddressShimmer: false,
        hideMaskedAnimatingIcon: false,
        hideVehicleNextArrivalAndValidityDetails: false,
        hideNextAvailableBusesInfo: false,
        hideRepeatBookings: false,
        showOtpCardAndSaintImage: true,
        otpKeypadCharacters: 'JKIS',
        shareRideCardConfig: {
            shareRideGoldIconUri: getImageUri(mtIcNammaYatriGold),
            shareLinks: {
                android: 'https://play.google.com/store/apps/details?id=in.juspay.nammayatri',
                ios: 'https://apps.apple.com/in/app/namma-yatri-ride-booking-app/id1637429831',
            },
        },
        useNameOnlyOnboarding: false,
        busOtpTicketModalType: 'Type1',
        showSafetyBannerOnCarousel: true,
        hideNoTicketRequiredForChildrenBelow5Text: false,
        showDistanceFromCurrentLocationInSearchResults: true,
        slowInternetConfig: {
            slowNetworkToastThreshHold: 5000,
            showSlowInternetSnackbar: true,
        },
        currentLocationMarkerColor: '#0265CE',
        rateCardConfig: {
            rateCardTitle: 'normal',
            rateCardVisibleKeys: [],
        },
    },

    assets: {
        maskedIconUri: getImageUri(mtIcNammaMetro),
        screenShotGuardImageUri: undefined,
        fallbackQrImageUri: undefined,
        appLogoUri: getImageUri(mtIcNyLogo),
        driverDefaultProfileUri: ic_driver_default_profile,
        rentalPolicyImageUri: getImageUri(rentalPolicy),
        callPoliceLogoUri: getImageUri(bengaluruPolice),
        journeyStartTicketImageUri: getImageUri(startJourneyImageKannada),
        fallbackJourneyImageUri: getImageUri(fallbackBangaloreMapImage),
        activatedTicketLayoutLogo: undefined,
        redBusBannerUri: getImageUri(mtIcNyRedbus),
        appLogoB64: nammayatri,
    },

    screenConfig: {
        gettingStartedCarouselScreenConfig: {
            gettingStartedCarousalConfig: defaultCarouselItems,
            showCenteredGetStartedButton: false,
        },
        eventScreenConfig: {
            showAllTicketButton: false,
            transparentBgLogo: getImageUri(mtIcNyLogo),
        },
        ticketScreenConfig: {
            metroTicketText: {
                headerTitle: 'METRO TICKET',
                regionalTitle: undefined,
            },
            busTicketText: {
                headerTitle: 'BUS TICKET',
                regionalTitle: undefined,
            },
            subwayTicketText: {
                headerTitle: 'TRAIN TICKET',
                regionalTitle: undefined,
            },
            comboTicket: {
                headerTitle: 'COMBO TICKET',
                regionalTitle: undefined,
            },
            footerRegionalText: undefined,
            busQrPosition: 'top',
            showTicketHeader: true,
        },
        reviewAndFeedbackScreenConfig: {
            showRideEndThankYouScreen: false,
            feedbackScreenType: 'default',
            rideCompleteBgUri: getImageUri(mt_ic_ride_completed_bg),
            showLogoAtThankYouScreen: false,
        },
        singleModeSearchScreenConfig: {
            showEditPencil: false,
            showInputGroupDirection: false,
        },
        profileTab: {
            primaryOptions: ['businessProfile', 'favourites'],
            secondaryOptions: ['myRides', 'helpAndSupport', 'safety'],
            tertiaryOptions: ['referAndInvite', 'about', 'language', 'logout'],
            languageIconType: 'ENGLISH',
        },
        helpAndSupport: {
            MTCSupportNumber: '9445030516',
            helpAndSupportTopicList: [
                'appRelated',
                'businessProfileRelated',
                'rideRelated',
                'metroRelated',
                'deleteAccount',
            ],
        },
    },
};
