import Config from 'react-native-config';
import { AppConfigCityType, AppConfigSystemType } from '../../types';
import mtIcChennaiOneLogo from '@/typescript/assets/mt_ic_chennai_one_logo.webp';
import { getImageUri } from '@/typescript/utils/common';
import mt_ic_anna_ride_completed_bg from '@/typescript/assets/mt_ic_anna_ride_completed_bg.webp';
import mtIcTicketStamp from '@/src-v2/assets/ticket-stamp.webp';
import screenshotnotallowed from '@/typescript/assets/screenshotnotallowed.png';
import mtIcAnnaAppLogoBW from '@/src-v2/assets/mt_ic_annaapp_logo.webp';
import mtIcChennaiOneGold from '@/src-v2/assets/3D-assets/mt_ic_chennai_one_gold.webp';
import startJourneyImage from '@/src-v2/assets/3D-assets/live-journey/start-journey-ticket.webp';
import fallbackChennaiMapImage from '@/src-v2/assets/anna_chennai_map.webp';
import { chennaione } from '@/typescript/utils/appLogob64';

const annaCarouselItems = [
    {
        title: 'Travelling intracity has never been this easy.',
        description: 'Find the fastest, most convenient ways to travel with all your options in one place.',
    },
    {
        title: 'Stay informed with up-to-the-minute schedules',
        description: 'Never miss a connection with live updates keeping your journey on track.',
    },
    {
        title: 'Enter you destination and get moving with Multimodal.',
        description:
            'With a single QR for all the travel modes you can quickly swift through the queues at all stations.',
    },
];

export const annaDefaultConfig: AppConfigCityType = {
    appType: 'multimodal',

    constants: {
        websiteLink: 'http://chennaione.in/',
        termsAndConditionLink: 'https://docs.google.com/document/d/10nKuwwPt_eLTM7NKib1cIF5QtUEQivas/edit',
        privacyPolicyLink: 'https://docs.google.com/document/d/1USKqUpIJH1wYOu16dZQ3SpAptOSOxoO-/edit',
        openDataDashboardLink: 'https://nammayatri.in/open?cc=',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 13.0827,
            longitude: 80.2707,
        },
        merchantAndClientConfig: {
            sdkMid: 'CUMTA',
            mobilityMid: Config['SDK_ENV'] != 'production' ? 'NAMMA_YATRI' : 'ANNA_APP',
            clientId: 'CUMTA',
        },
    },

    textConfig: {
        appReadableName: 'Chennai One',
        publicTransitText: 'Chennai-One Transit',
    },

    flowConfig: {
        enableMapSnapshot: false,
        skipProfileOnboarding: true,
        busTicketActivationFlow: true,
        shareReferralLink: true,
        nearByBusConfig: {
            showNearbyBus: true,
            maxNearbyBuses: 30,
            nearbyBusPollingInterval: 5000,
            nearbyBusCircleRadius: 500,
        },
    },

    uiConfig: {
        showOtpBusButton: true,
        showMapFallback: true,
        passTabEnabled: true,
        shareRideCardConfig: {
            shareRideGoldIconUri: getImageUri(mtIcChennaiOneGold),
            shareLinks: {
                android: 'https://chennaione.in/install',
                ios: 'https://chennaione.in/install',
            },
        },
        showTicketLabelInTransitInfoCard: true,
        busOtpTicketModalType: 'Type1',
    },

    assets: {
        appLogoUri: getImageUri(mtIcChennaiOneLogo),
        maskedIconUri: getImageUri(mtIcTicketStamp),
        screenShotGuardImageUri: getImageUri(screenshotnotallowed),
        fallbackQrImageUri: getImageUri(mtIcAnnaAppLogoBW),
        journeyStartTicketImageUri: getImageUri(startJourneyImage),
        fallbackJourneyImageUri: getImageUri(fallbackChennaiMapImage),
        appLogoB64: chennaione,
    },

    screenConfig: {
        reviewAndFeedbackScreenConfig: {
            feedbackScreenType: 'share-type',
            rideCompleteBgUri: getImageUri(mt_ic_anna_ride_completed_bg),
        },
        gettingStartedCarouselScreenConfig: {
            gettingStartedCarousalConfig: annaCarouselItems,
        },
        ticketScreenConfig: {
            metroTicketText: {
                regionalTitle: 'மெட்ரோ இரயில் பயண சீட்டு',
            },
            busTicketText: {
                headerTitle: 'MTC CHENNAI',
                regionalTitle: 'மா. போ. க. (சென்னை)',
            },
            subwayTicketText: {
                regionalTitle: 'புறநகர் இரயில் பயண சீட்டு',
            },
            comboTicket: {
                regionalTitle: 'ஒருங்கிணைந்த பயண சீட்டு',
            },
            footerRegionalText: 'பயணம் செய்தமைக்கு நன்றி',

            busQrPosition: 'bottom',
            showTicketHeader: false,
        },
        profileTab: {
            primaryOptions: ['favourites', 'transitPreference', 'paymentManagement'],
            secondaryOptions: ['share', 'myRides', 'helpAndSupport', 'safety'],
            tertiaryOptions: ['about', 'language', 'logout'],
            languageIconType: 'TAMIL',
        },
        helpAndSupport: {
            MTCSupportNumber: '9445030516',
            helpAndSupportTopicList: [
                'aboutApp',
                'appRegistration',
                'appFeature',
                'ticketBooking',
                'busPass',
                'journeyRelated',
                'paymentRelated',
                'qrCodeValidation',
                'security',
                'deleteAccount',
            ],
        },
    },
};

export const annaConfig: AppConfigSystemType = {
    default: annaDefaultConfig,
};
