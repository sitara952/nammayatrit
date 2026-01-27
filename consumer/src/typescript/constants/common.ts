import colors from '../designSystem/colorPalette';
import Config from 'react-native-config';
import { FormatedLocation } from '../utils/placeUtils';
import { APP_CONFIG } from '../state/client/session';

export const GOOGLE_ANDROID_CLIENT_ID = '135011811672-559gtbcv314hi4s0b9to39hblgkcerjp.apps.googleusercontent.com';
export const SENTRY_DNS = 'https://90dd343ea295fdcebc55711308f34829@sentry.internal.integ.movingtech.net/1';
export const GOOGLE_WEB_CLIENT_ID = '876430001318-etqtrq6glm7tfehfrt4a24eh0mlajg05.apps.googleusercontent.com';
export const GOOGLE_IOS_CLIENT_ID = '135011811672-2h2p2gc9pf3nkopnq5od9n372o04iope.apps.googleusercontent.com';
// export const HOST_URL = 'https://api.sandbox.moving.tech/dev/app/v2'
export const LOGIN_ENDPOINT = '/social/login';
export const UPDATE_US_PROFILE = '/social/update/profile';
export const AUTH_ENDPOINT = '/auth';
export const AUTH_VERIFY_ENDPOINT = '/auth/:authId/verify';
export const PROFILE = '/profile';
// export const MERCHANT_ID = 'favorit0-0000-0000-0000-00000favorit'

export const SESSION_KEY = 'user_session';
export const DELETE_MY_ACCOUNT = 'delete_request';
export const REGISTRATION_TOKEN = 'REGISTRATION_TOKEN';

export const APP_BG = `${colors?.recovered?.neutralMin}`;
export const WHITE_COLOR = `${colors?.recovered?.neutralMin}`;

export const TICKETING_PLATFORM_FEES = 1.0195;

export const BRIGE_WEB_LINK = 'https://www.odishayatri.in/';

// --------------- constants for Bridge PROD -------------------------
// export const HOST_URL = 'https://api.moving.tech/pilot/app/v2'
// export const MERCHANT_ID = 'e39cb491-03a3-4341-831b-b256ef3c95c9'
// export const MERCHANT_OPERATING_CITY = 'Minneapolis'
// export const MERCHANT_SHORT_ID = 'BRIDGE_CABS'

// ---------------  constants for NammaYatri SANDBOX --------------------
export const HOST_URL = Config['BASE_URL'];
export const MERCHANT_ID = 'NAMMA_YATRI';
export const MERCHANT_OPERATING_CITY = 'Bangalore';
export const MERCHANT_SHORT_ID = 'NAMMA_YATRI';

// app project names
export const BRIDGE_APP = 'bridge';
export const NAMMA_YATRI_APP = 'namma_yatri';
export const MULTIMODAL_APP = 'multimodal';
export const CURRENT_PROJECT = NAMMA_YATRI_APP;
export const SUPPORT_EMAIL = 'support@nammayatri.in';

export const getGoogleMapsURL = (
    location: FormatedLocation | undefined | null,
    waypoints: string | undefined,
    travelMode: 'driving' | 'walking' | undefined,
) => {
    const travelModeTemp = travelMode ?? 'walking';
    return waypoints
        ? `https://www.google.com/maps/dir/?api=1&destination=${location?.lat},${location?.lng}&travelmode=driving&waypoints=${waypoints}`
        : `https://www.google.com/maps/dir/?api=1&destination=${location?.lat},${location?.lng}&travelmode=${travelModeTemp}`;
};

export const PUJA_PANDALS_URL = (lat: number, lon: number) => {
    return `https://nammayatri.in/open?source=ticketing&lat=${lat}&lon=${lon}&vt=pujaPandal`;
};

export const DEFAULT_CAMERA_ZOOM_HOME_SCREEN = 15.88;
export const DEFAULT_CAMERA_ZOOM = 18.0;
export const DEFAULT_CAMERA_ZOOM_CONFIRM_PICKUP = 19.0;

export const RIDE_SEARCH_TIME = 180000;

export const PRIVACY_POLICY_URL = '';
export const GET_EXTENEDED_PATH_THRESHOLD_IN_M = 99990000;
export const GET_EXTENEDED_PATH_THRESHOLD_IN_M_INTERCITY = 75000;

export const COORD_ON_PATH_THRESHOLD_IN_M = 23;
export const GET_EXT_PATH_MIN_DISTANCE_IN_M = 3;
export const TERMS_AND_CODITIONS_URL =
    'https://docs.google.com/document/d/1Gu53a4hfTkI_-S7-RNCTpoBOMD2XwJ91/edit?usp=sharing&ouid=105995759402877307588&rtpof=true&sd=true';

export const ENABLE_ACTION_LOGGING = true;
export const SHOW_PRIMARY_CTA = true;
export const PICKUP_DISTANCE_THRESHOLD_IN_M = 500;
export const DRIVER_NAME_LENGTH_THRESHOLD = 15;

export const Z_INDEX_DEFAULT_MARKER = 100000;
export const ENABLE_DELAY = 100;

export const HOTSPOT_MAX_RADIUS = 150; // meters
export const HOTSPOT_AUTO_SNAP_DISTANCE = 12; // meters
export const HOTSPOT_DISPLAY_LIMIT = 3;

export const SOURCE_METRO_STATION_TOTAL_ITEM_HEIGHT = 67;
export const DESTINATION_METRO_STATION_TOTAL_ITEM_HEIGHT = 68;

export const SHOW_RIDE_ASSIGNED_TIME_IN_MIN = 30; //minutes

export const FETCH_TICKET_POLLING_INTERVAL = 10000;

export const CURRENCY_SYMBOL: { value: string } = {
    get value() {
        return APP_CONFIG.value.textConfig.currencySymbol;
    },
};

export const MERCHANT_CLIENT_CONFIG: { value: { sdkMid: string; mobilityMid: string; clientId: string } } = {
    get value() {
        return APP_CONFIG.value.merchantData.merchantAndClientConfig;
    },
};
