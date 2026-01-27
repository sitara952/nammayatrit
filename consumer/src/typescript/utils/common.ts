import { routeInfo } from '../../readOnly/api/types/RouteInfo.gen.tsx';
import SplashScreen from 'react-native-splash-screen';
import { BackHandler, Dimensions, NativeModules, Platform, Linking, ImageSourcePropType, Image } from 'react-native';
import { LatLng } from 'react-native-maps';
import { City } from 'config-types';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { setCab, setAuto, setBike, Client, getClientVariant } from '@/typescript/state/client/clientVariant';
import { AppDispatch, persistor, RootState } from '@/typescript/state/store';
const { MainAppUtils } = NativeModules;
import {
    City_city,
    MultimodalTravelMode_multimodalTravelMode,
    ServiceTierType_serviceTierType,
} from '@/readOnly/api/types/Enums.gen.tsx';
import { strings } from 'config-types';
import DeviceInfo from 'react-native-device-info';
import { Language_language } from '@/readOnly/api/types/Enums.gen.tsx';
import { bookingListRes } from '@/readOnly/api/types/BookingListRes.gen.js';
import { events } from '@/src-v2/systems/events/events.ts';
import { AppDispatchType } from '../state/hooks';
import { deleteItem, MMKVKey, setBoolItem } from './MMKV.ts';
import { OriginAndDestinationLatLng } from './placeUtils.ts';
import { APP_CONFIG, clearAllUserData, selectAppConfig } from '../state/client/session.ts';
import { logOut } from '../state/client/auth.ts';
import { FlowStatusContextType } from '../context/FlowStatusContext.tsx';
import { ptRestrictedHours } from '@/api/apiTypes/ServiceabilityApi.gen';
import { isTimeBetweenUsingSecond, timeStringToSeconds } from './time.ts';
import { Transit } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types.ts';
import { TransitMode } from '@/src-v2/multimodal/types/journeyTracking.ts';
import * as MoEngage from '@/typescript/utils/moengage';

type SafeResult<T> = { result: T | null; error: Error | null };

export async function safe<T>(promise: Promise<T>): Promise<SafeResult<T>> {
    try {
        const result = await promise;
        return { result, error: null };
    } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        return { result: null, error: err };
    }
}

const transformLanguage = (language: Language_language): string => {
    switch (language) {
        case 'ENGLISH':
            return 'en';
        case 'HINDI':
            return 'hi';
        case 'KANNADA':
            return 'kn';
        case 'TAMIL':
            return 'ta';
        case 'MALAYALAM':
            return 'ml';
        case 'BENGALI':
            return 'bn';
        case 'FRENCH':
            return 'fr';
        case 'TELUGU':
            return 'te';
        case 'ODIA':
            return 'or';
        default:
            return 'en';
    }
};

const getInitials = (name: string | undefined): string => {
    if (!name) return '';

    const nameParts = name.trim().split(/\s+/);

    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || '';
    const lastInitial = nameParts[1]?.charAt(0).toUpperCase() || '';

    return `${firstInitial}${lastInitial}`;
};

const getDistanceWithUnit = (distance: number) => {
    return distance < 1000 ? distance.toString() + ' meter' : (distance / 1000).toFixed(1)?.toString() + ' km';
};

const isACRide = (serviceTierName: string, vehicleServiceTierType: ServiceTierType_serviceTierType) => {
    return (
        serviceTierName.includes('Non-AC') &&
        !['Auto', 'Taxi', 'AUTO_RICKSHAW', 'Eco', 'Bike Taxi'].includes(vehicleServiceTierType)
    );
};

const getWelcomeText = (city: string, appName: string, userLanguageStrings: strings) => {
    switch (city) {
        // Karnataka
        case 'bangalore':
        case 'mysore':
        case 'tumakuru':
        case 'davanagere':
        case 'shivamogga':
        case 'hubli':
        case 'mangalore':
        case 'gulbarga':
        case 'udupi':
        case 'ballari':
            return userLanguageStrings.Namaskara;

        // Tamil Nadu
        case 'chennai':
        case 'vellore':
        case 'hosur':
        case 'madurai':
        case 'thanjavur':
        case 'tirunelveli':
        case 'salem':
        case 'trichy':
        case 'pudukkottai':
            return userLanguageStrings.Vanakkam;

        // Telangana & Andhra Pradesh
        case 'hyderabad':
        case 'vijayawada':
        case 'vishakapatnam':
        case 'guntur':
        case 'tirupati':
        case 'kurnool':
        case 'khammam':
        case 'karimnagar':
        case 'nizamabad':
        case 'mahbubnagar':
        case 'suryapet':
        case 'nalgonda':
        case 'siddipet':
        case 'warangal':
            return userLanguageStrings.Namaskaram;

        // Kerala
        case 'kochi':
        case 'trivandrum':
        case 'thrissur':
        case 'kozhikode':
        case 'alapuzha':
        case 'idukki':
        case 'kasarkode':
        case 'wayanad':
        case 'kannur':
        case 'kottayam':
        case 'palakkad':
        case 'kolam':
        case 'pathanamthitta':
            return userLanguageStrings.Namaskaram;

        // Odisha
        case 'bhubaneswar':
        case 'cuttack':
        case 'puri':
        case 'rourkela':
        case 'sambalpur':
        case 'berhampur':
            return userLanguageStrings.Namaskar;

        // West Bengal
        case 'siliguri':
        case 'kolkata':
        case 'asansol':
        case 'durgapur':
        case 'petrapole':
        case 'bardhaman':
        case 'digha':
        case 'birbhum':
            return userLanguageStrings.Nomoskar;

        // Maharashtra
        case 'goa':
        case 'pune':
        case 'mumbai':
            return userLanguageStrings.Namaste;

        // Delhi NCR
        case 'delhi':
        case 'noida':
        case 'gurugram':
            return userLanguageStrings.Namaste;

        // Pondicherry
        case 'pondicherry':
            return userLanguageStrings.Namaskaram;

        // Jammu & Kashmir
        case 'srinagar':
        case 'jammu':
        case 'anantnag':
        case 'pulwama':
            return userLanguageStrings.Namaste;

        // Meghalaya
        case 'shillong':
        case 'cherrapunji':
            return userLanguageStrings.Namaste;

        // Sikkim
        case 'gangtok':
            return userLanguageStrings.Namaste;

        // West Bengal Hills
        case 'darjeeling':
            return userLanguageStrings.Nomoskar;

        // Punjab
        case 'chandigarh':
            return userLanguageStrings.Namaste;

        // Rajasthan
        case 'jaipur':
            return userLanguageStrings.Namaste;

        // International
        case 'paris':
        case 'amsterdam':
        case 'minneapolis':
            return userLanguageStrings.Hiya;

        default:
            if (appName.includes('Odisha Yatri')) return userLanguageStrings.Namaskar;
            else if (appName.includes('Yatri Sathi')) return userLanguageStrings.Nomoskar;
            else if (appName.includes('Namma Yatri')) return userLanguageStrings.Namaskara;
            else if (appName.includes('Mana Yatri')) return userLanguageStrings.Namaskara;
            else if (appName.includes('Yatri')) return userLanguageStrings.Namaskaram;
            else if (appName.includes('keralaSavaari')) return userLanguageStrings.Namaskaram;
            else return userLanguageStrings.Hiya;
    }
};

const getCityFromCode = (citycode: string): City => {
    switch (citycode) {
        case 'std:080':
            return 'bangalore';
        case 'std:022':
            return 'mumbai';
        case 'std:011':
            return 'delhi';
        case 'std:044':
            return 'chennai';
        case 'std:033':
            return 'kolkata';
        case 'std:001':
            return 'paris';
        case 'std:484':
        case 'std:0484':
            return 'kochi';
        case 'std:040':
            return 'hyderabad';
        case 'std:0422':
            return 'coimbatore';
        case 'std:0413':
            return 'pondicherry';
        case 'std:08342':
            return 'goa';
        case 'std:020':
            return 'pune';
        case 'std:0821':
            return 'mysore';
        case 'std:0816':
            return 'tumakuru';
        case 'std:01189':
            return 'noida';
        case 'std:0124':
            return 'gurugram';
        case 'std:0353':
            return 'siliguri';
        case 'std:0341':
            return 'asansol';
        case 'std:0342':
            return 'durgapur';
        case 'std:03215':
            return 'petrapole';
        case 'std:0471':
            return 'trivandrum';
        case 'std:0487':
            return 'thrissur';
        case 'std:0495':
            return 'kozhikode';
        case 'std:0416':
            return 'vellore';
        case 'std:04344':
            return 'hosur';
        case 'std:0452':
            return 'madurai';
        case 'std:04362':
            return 'thanjavur';
        case 'std:0462':
            return 'tirunelveli';
        case 'std:0427':
            return 'salem';
        case 'std:0431':
            return 'trichy';
        case 'std:08192':
            return 'davanagere';
        case 'std:08182':
            return 'shivamogga';
        case 'std:0836':
            return 'hubli';
        case 'std:0824':
            return 'mangalore';
        case 'std:08472':
            return 'gulbarga';
        case 'std:08200':
            return 'udupi';
        case 'std:0674':
            return 'bhubaneswar';
        case 'std:0671':
            return 'cuttack';
        case 'std:06752':
            return 'puri';
        case 'nld:020':
            return 'amsterdam';
        case 'std:0820':
            return 'minneapolis';
        case 'std:0172':
            return 'chandigarh';
        case 'std:0141':
            return 'jaipur';
        case 'std:03592':
            return 'gangtok';
        case 'std:0354':
            return 'darjeeling';
        case 'std:0866':
            return 'vijayawada';
        case 'std:0891':
            return 'vishakapatnam';
        case 'std:0863':
            return 'guntur';
        case 'std:0877':
            return 'tirupati';
        case 'std:08518':
            return 'kurnool';
        case 'std:08742':
            return 'khammam';
        case 'std:08722':
            return 'karimnagar';
        case 'std:08463':
            return 'nizamabad';
        case 'std:08542':
            return 'mahbubnagar';
        case 'std:08684':
            return 'suryapet';
        case 'std:08682':
            return 'nalgonda';
        case 'std:08457':
            return 'siddipet';
        case 'std:0661':
            return 'rourkela';
        case 'std:0663':
            return 'sambalpur';
        case 'std:0870':
            return 'warangal';
        case 'std:04322':
            return 'pudukkottai';
        case 'std:8482':
            return 'bidar';
        case 'std:0194':
            return 'srinagar';
        case 'std:0477':
            return 'alapuzha';
        case 'std:04863':
            return 'idukki';
        case 'std:4994':
            return 'kasarkode';
        case 'std:4936':
            return 'wayanad';
        case 'std:497':
            return 'kannur';
        case 'std:0481':
            return 'kottayam';
        case 'std:0491':
            return 'palakkad';
        case 'std:474':
            return 'kolam';
        case 'std:468':
            return 'pathanamthitta';
        case 'std:0364':
            return 'shillong';
        case 'std:03637':
            return 'cherrapunji';
        case 'std:01933':
            return 'pulwama';
        case 'std:0191':
            return 'jammu';
        case 'std:01932':
            return 'anantnag';
        case 'std:0680':
            return 'berhampur';
        case 'std:0343':
            return 'bardhaman';
        case 'std:08392':
            return 'ballari';
        case 'std:03216':
            return 'digha';
        case 'std:0281':
            return 'rajkot';
        case 'std:02871':
            return 'somnath';
        case 'std:02892':
            return 'dwarka';
        case 'std:079':
            return 'ahmedabad';
        case 'std:0261':
            return 'surat';
        case 'std:0265':
            return 'vadodara';
        case 'std:0288':
            return 'jamnagar';
        case 'std:03462':
            return 'birbhum';
        case '*':
            return 'default';
        default:
            return 'default';
    }
};

const formatSecondsToTime = (seconds: number | undefined): string => {
    if (!seconds || seconds < 0) {
        return '--';
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const hoursText = hours > 0 ? `${hours}hr` : '';
    const minutesText = minutes > 0 ? `${minutes}min` : '';

    return `${hoursText} ${minutesText}`.trim();
};

const isValidUrl = (url: string): boolean => {
    const urlRegex = /^(https?):\/\/[^\s$.?#].[^\s]*$/i;
    return urlRegex.test(url);
};

const transformSnappedToRouteLatLon = (routeInfo: routeInfo | undefined) => {
    if (!routeInfo) {
        return undefined;
    }
    if (!routeInfo.points || !Array.isArray(routeInfo.points)) {
        return undefined;
    }
    return routeInfo.points.map(({ lat, lon }) => ({
        latitude: lat,
        longitude: lon,
    }));
};

type CheckType = 'phoneNumber' | 'email' | 'username';

interface CountryRule {
    code: string; // Country code (e.g., +91)
    pattern: RegExp; // Pattern specific to the country
}

const countryRules: Record<string, CountryRule> = {
    india: {
        code: '+91',
        pattern: /^[6789]\d*$/, // India: 10-digit numbers starting with 6, 7, 8, or 9
    },
    usa: {
        code: '+1',
        pattern: /^[2-9]\d*$/, // USA: 10-digit numbers not starting with 0 or 1
    },
};

const validateInput = (
    checkType: CheckType,
    input: string,
    country: keyof typeof countryRules | undefined,
): boolean => {
    if (checkType === 'email' && input.trim() === '') {
        return true; // Allow empty email
    }

    if (checkType === 'email') {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(input.trim());
    }

    if (checkType === 'phoneNumber' && country) {
        const rule = countryRules[country.toLowerCase()];

        if (rule) {
            return rule.pattern.test(input.trim());
        }
    }

    return false; // Default to invalid if no specific rule matches
};

let mutableHideSplashTimeOut: NodeJS.Timeout | null = null;

const hideSplash = () => {
    logEvent(EventName.NY_HIDE_SPLASH);
    if (mutableHideSplashTimeOut === null) {
        mutableHideSplashTimeOut = setTimeout(() => {
            SplashScreen.hide();
            MainAppUtils.hideSplash();
            mutableHideSplashTimeOut = null;
            events.markHideSplash();
        }, 0);
    }
};

function getDeviceId() {
    return DeviceInfo.getDeviceId();
}

const generateReferralLink = (
    source: string,
    medium: string,
    term: string,
    content: string,
    campaign: string,
): string => {
    const path = '/refer';

    return (
        `${APP_CONFIG.value.constants.websiteLink}${path}?referrer=` +
        `utm_source%3D${encodeURIComponent(source)}` +
        `%26utm_medium%3D${encodeURIComponent(medium)}` +
        `%26utm_term%3D${encodeURIComponent(term)}` +
        `%26utm_content%3D${encodeURIComponent(content)}` +
        `%26utm_campaign%3D${encodeURIComponent(campaign)}` +
        `%26anid%3Dadmob&id=${encodeURIComponent(APP_CONFIG.value.textConfig.appId)}`
    );
};

const getWaitingTime = (timestamp: string) => {
    const givenTime = new Date(timestamp);
    const currentTimeInIST = new Date();

    const timeDifferenceInSeconds = Math.floor((currentTimeInIST.getTime() - givenTime.getTime()) / 1000);

    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    const remainingSeconds = timeDifferenceInSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const getExpiryTime = (timestamp: string, expiresAfterInSecs: number) => {
    const givenFutureTime = new Date(timestamp).getTime() + expiresAfterInSecs * 1000;
    const currentTimeInIST = new Date();

    const timeDifferenceInSeconds = Math.floor((givenFutureTime - currentTimeInIST.getTime()) / 1000);

    const minutes = Math.floor(timeDifferenceInSeconds / 60);
    const remainingSeconds = timeDifferenceInSeconds % 60;

    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const delay = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

const dedupCoords = (route: LatLng[]): LatLng[] => {
    const fR = route.map(coord => ({
        latitude: parseFloat(coord.latitude.toFixed(6)),
        longitude: parseFloat(coord.longitude.toFixed(6)),
    }));

    if (fR.length === 0) return [];

    const initial = fR[0] ? [fR[0]] : [];

    const { dedupArr, dedupCount } = fR.slice(1).reduce(
        (acc, curr) => {
            const prev = acc.dedupArr[acc.dedupArr.length - 1];
            if (!prev) return acc;

            const latDiff = Math.abs(curr.latitude - prev.latitude);
            const lonDiff = Math.abs(curr.longitude - prev.longitude);

            if (latDiff > 0.000001 && lonDiff > 0.000001) {
                return {
                    dedupArr: [...acc.dedupArr, curr],
                    dedupCount: acc.dedupCount,
                };
            }
            return {
                dedupArr: acc.dedupArr,
                dedupCount: acc.dedupCount + 1,
            };
        },
        { dedupArr: initial, dedupCount: 0 },
    );

    console.info('dedupCoords', dedupCount, dedupArr.length);
    return dedupArr;
};

function computeHeading(latLng1: LatLng, latLng2: LatLng): number {
    const pi = Math.PI;

    // Convert latitude and longitude from degrees to radians
    const lat1 = (latLng1.latitude * pi) / 180.0;
    const long1 = (latLng1.longitude * pi) / 180.0;
    const lat2 = (latLng2.latitude * pi) / 180.0;
    const long2 = (latLng2.longitude * pi) / 180.0;

    // Calculate the difference in longitude
    const dLon = long2 - long1;

    // Calculate y and x
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

    // Calculate and normalize bearing
    const brng = (Math.atan2(y, x) * 180.0) / pi; // Convert to degrees
    return (brng + 360) % 360; // Normalize to [0, 360)
}

/**
 * Calculates the straight-line distance between two coordinate points using the Haversine formula
 * @param lat1 - Latitude of the first point in degrees
 * @param lng1 - Longitude of the first point in degrees
 * @param lat2 - Latitude of the second point in degrees
 * @param lng2 - Longitude of the second point in degrees
 * @returns Distance in meters
 */
function calculateStraightLineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Convert degrees to radians
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);

    const R = 6371000; // Earth's radius in meters
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in meters

    return distance;
}

function getDiffBetweenTimes(start: string, end: string): number {
    const startTime = new Date(start);
    const endTime = new Date(end);

    const timeDifferenceInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    return timeDifferenceInSeconds;
}

export type Action<T extends string, P = undefined> = {
    type: T;
    payload: P | undefined;
};

const createAction = <T extends string, P>(type: T, payload: P | undefined): Action<T, P> => ({
    type,
    payload,
});

export type Resolver<A extends Action<string, unknown>> = (action: A) => Promise<void>;

function createDispatcher<A extends Action<string, unknown>>(resolver: Resolver<A>): Resolver<A> {
    return async (action: A) => {
        if (__DEV__) {
            console.info(`Custom Action Dispatched: ${action.type}`, action.payload);
        }

        await resolver(action);
    };
}

export function areCoordsEqual(coordinate: LatLng | undefined, coords: LatLng): boolean {
    const lat = coordinate?.latitude ?? 0.0;
    const lng = coordinate?.longitude ?? 0.0;
    return lat !== coords.latitude && lng !== coords.longitude;
}

function metersToKilometers(meters: number): string {
    if (meters < 0) {
        throw new Error('Distance cannot be negative.');
    }

    // If the distance is less than 1000 meters, show it in meters.
    if (meters < 1000) {
        return `${meters} m`;
    }

    const kilometers = meters / 1000;

    // If the kilometer value is a whole number, show it without decimals.
    if (Number.isInteger(kilometers)) {
        return `${kilometers} km`;
    }

    // Otherwise, format with two decimal places.
    return `${kilometers.toFixed(2)} km`;
}

function secToHrMin(seconds: number): string {
    if (seconds < 0) {
        seconds = 0;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    // return `${hours}h ${minutes}m`;
    return `${hours}:${minutes.toString().padStart(2, '0')} hr`;
}

const getDashLenCount = (dashLen: number) => {
    const width = Dimensions.get('window').width;
    const viewWidth = width - 72;
    return Math.floor(viewWidth / dashLen);
};

const getUserClientId = (appName: string) => {
    switch (appName) {
        case 'Mana Yatri':
            return 'a791920b-8271-4536-bd6c-14bd4e329812';
        case 'Yatri':
            return 'c3784e1b-c092-4e97-8175-0e5fffaefc44';
        case 'Namma Yatri':
            return '995ff758-4efa-4d18-8f8f-f779521eb743';
        default:
            return 'cab98477-f759-4467-b936-f6759453bc0b';
    }
};

const firstRideCompletedEvent = (data: bookingListRes) => {
    const arraySize = data.list.length;
    if (arraySize == 1) {
        const [event1, event2, event3] = APP_CONFIG.value.merchantData.firstRideCompletedEvents.firstRideComplete;
        logEvent(event1);
        logEvent(event2);
        logEvent(event3);
        setBoolItem(MMKVKey.FIRST_RIDE_COMPLETE, true);
    } else if (arraySize > 1) {
        setBoolItem(MMKVKey.FIRST_RIDE_COMPLETE, true);
    } else {
        setBoolItem(MMKVKey.FIRST_RIDE_COMPLETE, false);
    }
};

type GetProfileRes = {
    firstName: string | undefined;
    middleName: string | undefined;
    lastName: string | undefined;
    hasTakenValidCabRide: boolean | undefined;
    hasTakenValidAutoRide: boolean | undefined;
    hasTakenValidBikeRide: boolean | undefined;
};

type LogEventNames = {
    cab: string;
    auto: string;
    bike: string;
};

const Variant = {
    cab: 'cab_firstride',
    auto: 'auto_firstride',
    bike: 'bike_firstride',
};

async function updateCTEventData(response: GetProfileRes, dispatch: AppDispatchType, state: RootState): Promise<void> {
    const logFirstRideEvent = async (toLogEvent: boolean, event: EventName | undefined) => {
        if (toLogEvent && event) {
            logEvent(event);
        }
    };
    const appConfig = selectAppConfig(state);
    handleLogEvents(response, Variant, getClientVariant(state), dispatch);

    async function handleLogEvents(
        response: GetProfileRes,
        eventNames: LogEventNames,
        variantState: Client,
        dispatch: AppDispatchType,
    ) {
        const cab = variantState.cab_firstride;
        const auto = variantState.auto_firstride;
        const bike = variantState.bike_firstride;

        const logCabEvent = !!response.hasTakenValidCabRide && cab !== eventNames.cab;
        await logFirstRideEvent(logCabEvent, appConfig.merchantData.firstRideCompletedEvents.firstCabRideComplete);
        dispatch(setCab({ variant: eventNames.cab }));

        const logAutoEvent = !!response.hasTakenValidAutoRide && auto !== eventNames.auto;
        await logFirstRideEvent(logAutoEvent, appConfig.merchantData.firstRideCompletedEvents.firstAutoRideComplete);
        dispatch(setAuto({ variant: eventNames.auto }));

        const logBikeEvent = !!response.hasTakenValidBikeRide && bike !== eventNames.bike;
        await logFirstRideEvent(logBikeEvent, appConfig.merchantData.firstRideCompletedEvents.firstBikeRideComplete);
        dispatch(setBike({ variant: eventNames.bike }));
    }
}

/**
 * this function will round-up the decimal upto places(provided as a prop)
 * and will return simple number if no decimal is present
 *
 * @param value - number you want to round-off
 * @param places - upto decimal places
 * @returns - string upto places decimal otherwise if no decimal then simple number
 *
 * e.g. getFormattedNumberInString(12.23343,2) - 12.23
 *      getFormattedNumberInString(123,2) - 123
 */
const getFormattedNumberInString = (value: number, places: number): string => {
    if (value % 1 === 0) {
        return value.toString();
    } else {
        return value.toFixed(places);
    }
};
const getMmStrokeColor = (LegMode: MultimodalTravelMode_multimodalTravelMode | undefined): string => {
    switch (LegMode) {
        case 'Walk':
            return '#758298';
        case 'Metro':
            return '#077CC8';
        case 'Subway':
            return '#7BBB5D';
        case 'Taxi':
            return '#7840DA';
        case 'Bus':
            return '#F5A623';
        default:
            return '#000000';
    }
};

const openGoogleMapsWalking = async (src: OriginAndDestinationLatLng | undefined) => {
    if (src && src.originLat && src.originLng && src.destinationLat && src.destinationLng) {
        const url = `https://www.google.com/maps/dir/?api=1&origin=${src.originLat},${src.originLng}&destination=${src.destinationLat},${src.destinationLng}&travelmode=walking`;
        Linking.openURL(url);
    } else {
        console.error('Missing locations');
    }
};

const showFirstWordIfLengthIsGreatherThan = (length: number, text: string) => {
    if (text.length > length) {
        return text.split(' ')[0];
    }
    return text;
};

function minimizeApp() {
    if (Platform.OS === 'android') {
        MainAppUtils.minimizeApp();
    } else {
        BackHandler.exitApp();
    }
}

const buildKaptureUrl = (
    kaptureUrl: string,
    encryptedIv: string,
    encryptedCc: string,
    merchantId: string,
    operatingCity: string,
    customerId: string | undefined,
    rideId: string | undefined = undefined,
    ticketId: string | undefined = undefined,
): string => {
    const url =
        `${kaptureUrl}&customer_code=${encryptedCc}&iv=${encryptedIv}&merchantId=${merchantId}&customerId=${customerId}&city=${operatingCity}` +
        (rideId ? `&rideId=${rideId}` : '') +
        (ticketId ? `&incomingTicketId=${ticketId}` : '');
    console.info('Final Kapture URL: ', url);
    return url;
};

const loggingOutUser = (dispatch: AppDispatch, flowStatusContext: FlowStatusContextType | undefined) => {
    dispatch(clearAllUserData());
    dispatch(logOut());
    persistor.purge();
    flowStatusContext && flowStatusContext.resetData();
    MoEngage.logout(); // Reset MoEngage user identity
    deleteItem(MMKVKey.RECENT_SEARCHES);
    deleteItem(MMKVKey.TAKE_RIDE_MODAL_LAST_SEEN_DATE);
    deleteItem(MMKVKey.CUSTOMER_FIRST_RIDE);
    deleteItem(MMKVKey.FIRST_RIDE_COMPLETE);
    deleteItem(MMKVKey.USER_ID);
    deleteItem(MMKVKey.RECENT_MULTIMODAL_TRIPS);
    deleteItem(MMKVKey.RECENT_SINGLE_MODE_TRIPS);
    deleteItem(MMKVKey.CUSTOMER_NAMMA_TAGS);
    deleteItem(MMKVKey.MOBILE_NUMBER);
    deleteItem(MMKVKey.USER_NAME);
    deleteItem(MMKVKey.FIRST_RIDE_COMPLETE);
};

export const cityToCityEnum = (city: City): City_city => {
    switch (city) {
        case 'asansol':
            return 'Asansol';
        case 'bangalore':
            return 'Bangalore';
        case 'bhubaneswar':
            return 'Bhubaneshwar';
        case 'chandigarh':
            return 'Chandigarh';
        case 'chennai':
            return 'Chennai';
        case 'cuttack':
            return 'Cuttack';
        case 'mumbai':
            return 'Mumbai';
        case 'delhi':
            return 'Delhi';
        case 'kolkata':
            return 'Kolkata';
        case 'paris':
            return 'Paris';
        case 'kochi':
            return 'Kochi';
        case 'hyderabad':
            return 'Hyderabad';
        case 'pondicherry':
            return 'Pondicherry';
        case 'pune':
            return 'Pune';
        case 'mysore':
            return 'Mysore';
        case 'tumakuru':
            return 'Tumakuru';
        case 'noida':
            return 'Noida';
        case 'gurugram':
            return 'Gurugram';
        case 'siliguri':
            return 'Siliguri';
        case 'durgapur':
            return 'Durgapur';
        case 'petrapole':
            return 'Petrapole';
        case 'trivandrum':
            return 'Trivandrum';
        case 'thrissur':
            return 'Thrissur';
        case 'kozhikode':
            return 'Kozhikode';
        case 'vellore':
            return 'Vellore';
        case 'hosur':
            return 'Hosur';
        case 'madurai':
            return 'Madurai';
        case 'thanjavur':
            return 'Thanjavur';
        case 'tirunelveli':
            return 'Tirunelveli';
        case 'salem':
            return 'Salem';
        case 'trichy':
            return 'Trichy';
        case 'davanagere':
            return 'Davanagere';
        case 'shivamogga':
            return 'Shivamogga';
        case 'hubli':
            return 'Hubli';
        case 'mangalore':
            return 'Mangalore';
        case 'gulbarga':
            return 'Gulbarga';
        case 'udupi':
            return 'Udupi';
        case 'puri':
            return 'Puri';
        case 'minneapolis':
            return 'Minneapolis';
        case 'jaipur':
            return 'Jaipur';
        case 'gangtok':
            return 'Gangtok';
        case 'darjeeling':
            return 'Darjeeling';
        case 'vijayawada':
            return 'Vijayawada';
        case 'vishakapatnam':
            return 'Vishakapatnam';
        case 'guntur':
            return 'Guntur';
        case 'tirupati':
            return 'Tirupati';
        case 'kurnool':
            return 'Kurnool';
        case 'khammam':
            return 'Khammam';
        case 'karimnagar':
            return 'Karimnagar';
        case 'nizamabad':
            return 'Nizamabad';
        case 'mahbubnagar':
            return 'Mahbubnagar';
        case 'suryapet':
            return 'Suryapet';
        case 'nalgonda':
            return 'Nalgonda';
        case 'siddipet':
            return 'Siddipet';
        case 'rourkela':
            return 'Rourkela';
        case 'sambalpur':
            return 'Sambalpur';
        case 'warangal':
            return 'Warangal';
        case 'birbhum':
            return 'Birbhum';
        case 'ahmedabad':
            return 'Ahmedabad';
        case 'surat':
            return 'Surat';
        case 'vadodara':
            return 'Vadodara';
        case 'jamnagar':
            return 'Jamnagar';
        default:
            return 'AnyCity';
    }
};

export const getImageUri = (source: ImageSourcePropType): string => {
    return Image.resolveAssetSource(source).uri;
};

export const checkPtServiceable = (ptRestrictedHours: ptRestrictedHours | undefined) => {
    if (!ptRestrictedHours) return undefined;
    const isServiceable = (startTime: string | undefined, endTime: string | undefined) => {
        if (!startTime || !endTime) return undefined;
        const startTimeInSec = timeStringToSeconds(startTime);
        const endTimeInSec = timeStringToSeconds(endTime);
        if (startTimeInSec === undefined || endTimeInSec === undefined) return undefined;
        return !isTimeBetweenUsingSecond(startTimeInSec, endTimeInSec || 24 * 60 * 60);
    };
    return {
        isMetroServiceable: isServiceable(ptRestrictedHours.metro.startTime, ptRestrictedHours.metro.endTime),
        isSubwayServiceable: isServiceable(ptRestrictedHours.subway.startTime, ptRestrictedHours.subway.endTime),
    };
};

export const checkTaxiLeg = (mode: Transit | TransitMode | string | undefined, includeWalkLeg: boolean = false) => {
    if (!mode) return false;
    if (includeWalkLeg) return ['AUTO', 'BIKE', 'TAXI', 'WALK'].includes(mode);
    return ['AUTO', 'BIKE', 'TAXI'].includes(mode);
};

export {
    transformSnappedToRouteLatLon,
    isValidUrl,
    hideSplash,
    generateReferralLink,
    getDistanceWithUnit,
    formatSecondsToTime,
    getWaitingTime,
    getExpiryTime,
    validateInput,
    getCityFromCode,
    getInitials,
    delay,
    isACRide,
    getWelcomeText,
    dedupCoords,
    computeHeading,
    getDiffBetweenTimes,
    createAction,
    createDispatcher,
    transformLanguage,
    metersToKilometers,
    secToHrMin,
    firstRideCompletedEvent,
    getUserClientId,
    updateCTEventData,
    getDashLenCount,
    getDeviceId,
    getFormattedNumberInString,
    showFirstWordIfLengthIsGreatherThan,
    calculateStraightLineDistance,
    minimizeApp,
    getMmStrokeColor,
    openGoogleMapsWalking,
    buildKaptureUrl,
    loggingOutUser,
};
