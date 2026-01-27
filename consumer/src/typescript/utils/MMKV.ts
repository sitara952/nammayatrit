import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { createMMKV } from '@/utils/mmkvUtils';

export enum MMKVKey {
    RECENT_SEARCHES = 'RECENT_SEARCHES',
    OTA_VERSION = 'OTA_VERSION',
    SUGGESTED_LOCATIONS = 'SUGGESTED_LOCATIONS',
    CIRCULAR_PROGRESS_START_TIME = 'CIRCULAR_PROGRESS_START_TIME',
    PROGRESS_START_TIME = 'PROGRESS_START_TIME',
    RIDE_CHECKS = 'RIDE_CHECKS',
    POST_RIDE_CHECKS = 'POST_RIDE_CHECKS',
    ALL_LOCAL_ASSETS = 'ALL_LOCAL_ASSETS',
    REGISTRATION_TOKEN = 'REGISTRATION_TOKEN',
    SESSION_KEY = 'user_session',
    FCM_TOKEN = 'fcm_token',
    OPERATING_CITY = 'OPERATING_CITY',
    MOBILE_NUMBER = 'MOBILE_NUMBER',
    USER_NAME = 'USER_NAME',
    SUGGESTIONS_MAP = 'SUGGESTIONS_MAP',
    CUSTOMER_FIRST_RIDE = 'CUSTOMER_FIRST_RIDE',
    LAST_KNOWN_LAT = 'LAST_KNOWN_LAT',
    LAST_KNOWN_LON = 'LAST_KNOWN_LON',
    REFERRAL_STATUS = 'REFERRAL_STATUS',
    CURRENT_TEXT_INDEX = 'CURRENT_TEXT_INDEX',
    TAKE_RIDE_MODAL_LAST_SEEN_DATE = 'TAKE_RIDE_MODAL_LAST_SEEN_DATE',
    APP_NAME = 'APP_NAME',
    USER_ID = 'USER_ID',
    SIGN_AUTH_REQ = 'SIGN_AUTH_REQ',
    FIRST_RIDE_COMPLETE = 'FIRST_RIDE_COMPLETE',
    RECENT_MULTIMODAL_TRIPS = 'RECENT_MULTIMODAL_TRIPS_V4',
    DISMISSED_LIVE_JOURNEY_POPUP_IDS = 'DISMISSED_LIVE_JOURNEY_POPUP_IDS',
    PAYMENT_PAGE_PAYLOAD = 'PAYMENT_PAGE_PAYLOAD',
    MOCK_JOURNEY_LOCATION = 'MOCK_JOURNEY_LOCATION',
    UTM_DATA_SEND = 'UTM_DATA_SEND',
    CUSTOMER_NAMMA_TAGS = 'CUSTOMER_NAMMA_TAGS',
    LOCAL_CUG_ENABLED = 'LOCAL_CUG_ENABLED',
    UTS_DEVICE_ID = 'UTS_DEVICE_ID',
    RECENT_SINGLE_MODE_TRIPS = 'RECENT_SINGLE_MODE_TRIPS',
    CAPTURED_PASS_PHOTO = 'CAPTURED_PASS_PHOTO',
    PURCHASED_PASSES_CACHE = 'PURCHASED_PASSES_CACHE',
    IS_GESTURE_ENABLE = 'IS_GESTURE_ENABLE',
    VIDEO_POPUP_LAST_SHOWN = 'VIDEO_POPUP_LAST_SHOWN',
    BUSINESS_RIDES_INFO_DISMISSED = 'BUSINESS_RIDES_INFO_DISMISSED',
    BUSINESS_PROFILE_MODAL_LAST_SHOWN = 'BUSINESS_PROFILE_MODAL_LAST_SHOWN',
    BUSINESS_EMAIL_VERIFICATION_START_TIME = 'BUSINESS_EMAIL_VERIFICATION_START_TIME',
    IS_INSTALL_RECORDED = 'IS_INSTALL_RECORDED',
    IS_SIGNUP_RECORDED = 'IS_SIGNUP_RECORDED',
    IS_LOGIN_RECORDED = 'IS_LOGIN_RECORDED',
}

const storage = createMMKV();

export const setStringItem = (key: MMKVKey, item: string) => {
    storage.set(key, item);
};
export const setBoolItem = (key: MMKVKey, item: boolean) => {
    storage.set(key, item);
};
export const setNumberItem = (key: MMKVKey, item: number) => {
    storage.set(key, item);
};

export const getStringItem = (key: MMKVKey) => {
    return storage.getString(key);
};
export const getBoolItem = (key: MMKVKey) => {
    return storage.getBoolean(key);
};
export const getNumberItem = (key: MMKVKey) => {
    return storage.getNumber(key);
};
export const setArrayItem = (key: MMKVKey, item: string[]) => {
    storage.set(key, JSON.stringify(item));
};

export const getArrayItem = (key: MMKVKey): string[] | undefined => {
    const item = storage.getString(key);
    if (item) {
        try {
            return safeJsonParse(item, [], 'MMKV');
        } catch (error) {
            console.error(`Error parsing array for key ${key}:`, error);
            return undefined;
        }
    }
    return undefined;
};

export const deleteItem = (key: MMKVKey) => {
    return storage.delete(key);
};
