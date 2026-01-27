import { getImageUri } from '@/typescript/utils/common';
import { AppConfigCityType, AppConfigSystemType } from '../../types';
import mtIcBtLogo from '@/typescript/assets/bharat_taxi_about_app.webp';
import mtIcBtDriverDefaultProfile from '@/typescript/assets/mt_ic_driver_mascot_bt.webp';
import { Config } from 'react-native-config';
import mtIcDelhiMetro from '@/src-v2/assets/mt_ic_delhi_metro.png';
import bharatPage1 from '@/typescript/assets/mt_bht_page1.webp';
import bharatPage2 from '@/typescript/assets/mt_bht_page2.webp';
import bharatPage3 from '@/typescript/assets/mt_bht_page3.webp';
import bharatPage4 from '@/typescript/assets/mt_bht_page4.webp';
import { bharatTaxi } from '@/typescript/utils/appLogob64';

const bharatTaxiCarouselItems = [
    {
        image: { uri: getImageUri(bharatPage1) },
        title: 'Swadeshi',
        description: 'An app ‘by the Indians, for the Indians’. Driving ‘Aatmanirbhar Bharat’ Forward.',
    },
    {
        image: { uri: getImageUri(bharatPage2) },
        title: 'Sahakar',
        description: 'India’s First Cooperative Ride-Hailing Service. Fair, transparent, and community-powered.',
    },
    {
        image: { uri: getImageUri(bharatPage3) },
        title: 'Suraksha',
        description: 'Police verified drivers and women focused Mahila Sarathi support.',
    },
    {
        image: { uri: getImageUri(bharatPage4) },
        title: 'Seva',
        description: 'Every mile served with care! Service built on mutual respect and dignity.',
    },
];

export const bharatTaxiDefaultConfig: AppConfigCityType = {
    appType: 'ride-hailing',

    constants: {
        websiteLink: 'https://www.bharattaxiapp.com/',
        termsAndConditionLink: 'https://docs.google.com/document/d/1jqMHs5LS_7rKUFjsOLi6sCAXdevknRrfsim9PO_tT8Y',
        privacyPolicyLink: 'https://www.bharattaxiapp.com/privacy',
    },

    merchantData: {
        initialCoordinate: {
            latitude: 28.7041,
            longitude: 77.1025,
        },
        merchantAndClientConfig: {
            sdkMid: 'bharattaxi',
            mobilityMid: Config['SDK_ENV'] != 'production' ? 'NAMMA_YATRI' : 'BHARAT_TAXI',
            clientId: 'nammayatriBAP',
        },
    },

    textConfig: {
        appReadableName: 'Bharat Taxi',
        appId: 'in.mobility.bharatTaxi',
        publicTransitText: 'Bharat Transit',
        rideOtpText: 'PIN',
        callPoliceText: 'Call 112',
    },

    languageTextConfig: {
        changeToModeText: 'ChangeMode',
    },

    uiConfig: {
        showNamasteCallout: true,
        homeScreenSnapPoints: ['40%', '95%'],
        homeScreenMapPaddingBottom: 310,
        extraFareDetail: [
            {
                title: '',
                key: '',
                amountText: '',
                extraDetail: 'Luggage charges are extra',
                extraOrder: undefined,
            },
        ],
        useNameOnlyOnboarding: true,
        thankYouMsgRideEnd: true,
        enableLegacyIntercityCheck: false,
        showDistanceFromCurrentLocationInSearchResults: false,
        slowInternetConfig: {
            showSlowInternetSnackbar: false,
        },
        currentLocationMarkerColor: '#FF7B20',
        rateCardConfig: {
            rateCardTitle: 'inclusion',
            rateCardVisibleKeys: [
                'PARKING_CHARGE',
                'PER_STOP_CHARGES',
                'TOLL_CHARGES',
                'WAITING_CHARGE_RATE_PER_MIN',
                'NIGHT_SHIFT_CHARGE',
                'WAITING_CHARGES',
            ],
        },
    },

    flowConfig: {
        enableFemaleRotatingText: true,
    },

    assets: {
        maskedIconUri: getImageUri(mtIcDelhiMetro),
        appLogoUri: getImageUri(mtIcBtLogo),
        callPoliceLogoUri: undefined,
        driverDefaultProfileUri: getImageUri(mtIcBtDriverDefaultProfile),
        appLogoB64: bharatTaxi,
    },

    screenConfig: {
        ticketScreenConfig: {
            metroTicketText: {
                regionalTitle: 'मेट्रो टिकट',
            },
            footerRegionalText: 'सार्वजनिक यात्रा करने के लिए धन्यवाद',
        },
        gettingStartedCarouselScreenConfig: {
            gettingStartedCarousalConfig: bharatTaxiCarouselItems,
            showCenteredGetStartedButton: true,
        },
        profileTab: {
            languageIconType: 'HINDI',
        },
    },
};

export const bharatTaxiConfig: AppConfigSystemType = {
    default: bharatTaxiDefaultConfig,
};
