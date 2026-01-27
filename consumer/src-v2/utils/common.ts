import mtIcCarCorolla from '@/typescript/assets/ny-service/mt_ic_car_corolla.webp';
import BookanyMiniXL from '@/typescript/assets/ny-service/Bookany_MiniXL.webp';
import BookanyMiniSedan from '@/typescript/assets/ny-service/Bookany_MiniSedan.webp';
import BookanyBikeSedan from '@/typescript/assets/ny-service/Bookany_BikeSedan.webp';
import mtBookAny from '@/typescript/assets/ny-service/mt_book_any.webp';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { language, strings } from 'config-types';
import { PricingItemType, TripMode, TripCategory } from '@/typescript/state/client/search';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { setCustomerTip, setIsAddTipSelected } from '../../src/typescript/state/client/search';
import { Alert, Linking, Platform, Share, ToastAndroid } from 'react-native';
import { generateReferralLink, safe } from '@/typescript/utils/common';
import { AppDispatch } from '@/typescript/state/store';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { DRIVER_NAME_LENGTH_THRESHOLD, getGoogleMapsURL } from '@/typescript/constants/common';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import Clipboard from '@react-native-clipboard/clipboard';
import dayjs from 'dayjs';
import { PickupInstructionsConfig, PickupInstructionsType } from './types';
import { convertToTargetType, JSONObject } from '@/typescript/utils/decode';
import { shortLanguage } from 'config-types/dist/domain/factors/language';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { getRemoteConfig, getString } from '@react-native-firebase/remote-config';
import {
    DistanceUnit_distanceUnit,
    FrfsConfigCity_frfsConfigCity,
    FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    Gender_gender,
    Language_language,
    MultimodalTravelMode_multimodalTravelMode,
    VehicleCategory_vehicleCategory,
} from '@/readOnly/api/types/Enums.gen';
import { TranscitLegRatingProp, JourneySummary } from '../multimodal/screens/MultiTransitFeedback/types';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { getJourneyLegDestination } from '@/typescript/utils/MultiModal';
import { mapModeToTransitType } from '../multimodal/components/PublicTransportCard/types';
import { distance } from '@/readOnly/api/types/Distance.gen';
import { NativeModules, ImageSourcePropType } from 'react-native';
import { getPlaceArea } from '@/typescript/utils/placeUtils';
import { getLocationForFrfs } from '@/typescript/utils/MultiModal';
import { legExtraInfo } from '@/readOnly/api/types/LegExtraInfo.gen';
import { TransitMode } from '../multimodal/types/journeyTracking';
import { isBookingStatusConfirmed, isFRFSBookingAndCancelled } from '@/typescript/utils/LegStatusUtils';
import {
    BottomSheetStage,
    selectHasRequestedForeGps,
    selectHasRequestedLocationPermission,
    setHasRequestedLocationPermission,
} from '@/typescript/state/client/session';
import { ScreenRoute } from '@/typescript/utils/logger';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useAppSelector } from '@/typescript/state/hooks';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import RNFS from 'react-native-fs';

const { AppInfoModule } = NativeModules;

export const getFormattedLocalDate = (dateString: string | undefined) => {
    try {
        const d = new Date(dateString || '');
        const date = d.toLocaleDateString(undefined, { dateStyle: 'medium' });
        const time = d.toLocaleTimeString(undefined, { timeStyle: 'short' });
        return [date, time];
    } catch {
        return [undefined, dateString];
    }
};

export function onRender(id: string, phase: string, actualDuration: number) {
    if (actualDuration > 50) {
        console.warn(`[Profiler: ${id}] Render phase "${phase}" took too long: ${actualDuration.toFixed(2)}ms`);
        // console.log(`[Profiler: ${id}] Phase: ${phase}`);
        // console.log(`[Profiler: ${id}] Actual Duration: ${actualDuration.toFixed(2)}ms`);
        // console.log(`[Profiler: ${id}] Base Duration: ${baseDuration.toFixed(2)}ms`);
        // console.log(`[Profiler: ${id}] Start Time: ${startTime.toFixed(2)}ms`);
        // console.log(`[Profiler: ${id}] Commit Time: ${commitTime.toFixed(2)}ms`);
    }
}

export const getTripCategory = (userLanguageStrings: strings, booking: bookingAPIEntity | null): string => {
    switch (booking?.bookingDetails.TAG) {
        case 'INTER_CITY':
            return userLanguageStrings.Intercity;
        case 'RENTAL':
            return userLanguageStrings.rental;
        default:
            return booking?.serviceTierName ?? '';
    }
};

export const getAvailableTipOptions = (
    shouldShowDefaultTips: boolean,
    selectedPricingItems: PricingItemType[],
): number[] => {
    const defaultTips = [0, 10, 20, 30];
    const calculateHalfRounded = (val: number) => {
        const half = val / 2;
        if (half % 10 === 0) {
            return half;
        } else {
            return Math.ceil(half / 10) * 10;
        }
    };

    if (selectedPricingItems.length > 0) {
        const selectPricingItem = selectedPricingItems[0];
        if (selectPricingItem?.tripMode !== TripMode.DynamicOffer) {
            return [];
        }
        const smartTipValue = selectPricingItem?.smartTipSuggestion?.value;
        if (smartTipValue && smartTipValue > 10) {
            return [
                0,
                calculateHalfRounded(smartTipValue),
                smartTipValue,
                smartTipValue + calculateHalfRounded(smartTipValue),
            ];
        } else {
            return selectPricingItem?.tipOptions
                ? selectPricingItem?.tipOptions
                : shouldShowDefaultTips
                  ? defaultTips
                  : [];
        }
    }

    return shouldShowDefaultTips ? defaultTips : [];
};

export const getAvailableTipOptionsForBoostModal = (
    currentlySelectedIds: string[],
    allPricingItems: PricingItemType[],
    shouldShowDefaultTips: boolean = false,
): number[] => {
    if (currentlySelectedIds.length === 0) {
        return shouldShowDefaultTips ? [0, 10, 20, 30] : [];
    }

    for (const selectedId of currentlySelectedIds) {
        const variant = allPricingItems.find((item: PricingItemType) => item.id === selectedId);

        if (
            variant &&
            variant.tripMode === TripMode.DynamicOffer &&
            ((variant.tipOptions && variant.tipOptions.length > 0) || variant.smartTipSuggestion?.value)
        ) {
            return getAvailableTipOptions(shouldShowDefaultTips, [variant]);
        }
    }

    return [];
};

export const handleSmartTipSuggestion = (
    dispatch: AppDispatch,
    searchId: string | null,
    pricingItem: PricingItemType | undefined,
    shouldAdd: boolean,
) => {
    const smartTipValue = pricingItem?.smartTipSuggestion?.value;
    if (smartTipValue && smartTipValue > 0) {
        if (shouldAdd) {
            dispatch(
                setCustomerTip({
                    id: searchId,
                    payload: smartTipValue,
                }),
            );
        }
        dispatch(setIsAddTipSelected({ id: searchId, payload: false }));
    } else {
        dispatch(setIsAddTipSelected({ id: searchId, payload: false }));
        dispatch(
            setCustomerTip({
                id: searchId,
                payload: undefined,
            }),
        );
    }
};

export const getPersistedTipOptions = (
    persistedTipOptions: number[] | null,
    currentlySelectedIds: string[],
    allPricingItems: PricingItemType[],
    shouldShowDefaultTips: boolean,
): number[] => {
    if (persistedTipOptions && persistedTipOptions.length > 0) {
        return persistedTipOptions;
    }

    return getAvailableTipOptionsForBoostModal(currentlySelectedIds, allPricingItems, shouldShowDefaultTips);
};

export const calculateTipOptionsToPersist = (
    selectedPricingItems: PricingItemType[],
    shouldShowDefaultTips: boolean,
): number[] => {
    return getAvailableTipOptions(shouldShowDefaultTips, selectedPricingItems);
};

export const formatSnakeCaseToString = (disability: string | undefined): string => {
    if (!disability) return '';
    return disability
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

export const toScreamingSnakeCase = (str: string): string => {
    return str
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[\s-]+/g, '_')
        .toUpperCase();
};

export const decodeGender = (gender: string): Gender_gender => {
    switch (gender) {
        case 'MALE':
            return 'MALE';
        case 'FEMALE':
            return 'FEMALE';
        case 'OTHER':
            return 'OTHER';
        case 'PREFER_NOT_TO_SAY':
            return 'PREFER_NOT_TO_SAY';
        default:
            return 'PREFER_NOT_TO_SAY';
    }
};

export const shareApp = (
    currentCity: string,
    referralCode: string,
    appName: string,
    userLanguageStrings: strings,
    shareReferralLink: boolean,
) => {
    const referralLink = generateReferralLink(currentCity, 'share', 'referral', 'refer', referralCode);
    const shareContent = async (message: string) => {
        const content = {
            title: 'Share App',
            message,
            // url,
        };

        const options = {
            dialogTitle: 'Share & Refer',
            subject: 'Share & Refer',
        };

        try {
            await Share.share(content, options);
        } catch (error) {
            console.error('Failed to share content:', error);
        }
    };

    const messageText = userLanguageStrings.ShareAppMessage(appName);

    const message = messageText + '\nReferral Code : *' + referralCode + '*\n\n' + referralLink;
    shareContent(shareReferralLink && referralCode.trim() !== '' && referralLink.trim() !== '' ? message : messageText);
};

export const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const openGoogleMapsNavigation = (
    location: FormatedLocation | undefined | null,
    waypoints: string | undefined,
    travelMode: 'walking' | 'driving' | undefined,
) => {
    if (location && location.lat && location.lng) {
        const url = waypoints
            ? getGoogleMapsURL(location, waypoints, travelMode)
            : getGoogleMapsURL(location, undefined, travelMode);
        try {
            Linking.openURL(url);
        } catch (error) {
            console.error('Unable to open Google Maps', error);
        }
    } else {
        console.error('Missing locations');
    }
};

export const getInstructionsList = (
    specialLocationName: string,
    specialGateName: string,
    language: string,
): PickupInstructionsType[] => {
    const remoteConfigInstance = getRemoteConfig();
    const config = getString(remoteConfigInstance, 'pickup_instructions_' + language);
    try {
        if (!config || config === '') return [];
        const jsonConfig: JSONObject = safeJsonParse<JSONObject>(config, {}, 'pickupInstructions');

        const specialLocOb = convertToTargetType<PickupInstructionsConfig>(jsonConfig, {
            locations: [],
        });
        const locationName = specialLocOb?.locations.find(
            (item: { name: string }) => item.name === specialLocationName,
        );
        const gateName = locationName?.gates.find((item: { gateName: string }) => item.gateName === specialGateName);
        return gateName ? gateName.images : [];
    } catch (e) {
        console.error('Error parsing pickup instructions config:', e);
        return [];
    }
};

export const getPickupInstructions = (
    location: FormatedLocation | null,
    specialLocationName: string | undefined,
    gateName: string | undefined,
) => {
    if (location) {
        const instructions = getInstructionsList(
            specialLocationName ? specialLocationName : '',
            gateName ? gateName : '',
            'en',
        );
        return instructions;
    }
    return [];
};

export function getTitle(source: location | undefined): string | undefined {
    if (!source?.title) return undefined;

    const title = source.title.trim();
    const isNumeric = /^\d+$/.test(title);
    const isShort = title.length <= 4;

    if ((isShort || isNumeric) && source.subtitle) {
        const subtitleFirstPart = source.subtitle.split(',')[0]?.trim();
        return `${title}, ${subtitleFirstPart}`;
    }

    return title;
}

export const convertUTCtoIST = (utcTime: string, format: string) => {
    const utcDateTime = dayjs(utcTime);
    return utcDateTime.format(format);
};

export const handleCopyToClipBoard = (content: string) => {
    Clipboard.setString(content);
    if (Platform.OS == 'android') {
        ToastAndroid.show('Copied', ToastAndroid.SHORT);
    } else {
        Alert.alert('Copied');
    }
};

export function truncateArea(area: string): string {
    const parts = area?.split(',') || [];
    const truncatedArea = [parts[0], parts[1]]
        .filter(Boolean)
        .map(s => s?.trim())
        .join(', ');
    return truncatedArea;
}

export const getShortLanguage = (language: language): shortLanguage => {
    switch (language) {
        case 'HINDI':
            return 'hi';
        case 'ENGLISH':
            return 'en';
        case 'KANNADA':
            return 'kn';
        case 'TAMIL':
            return 'ta';
        case 'TELUGU':
            return 'te';
        case 'BENGALI':
            return 'bn';
        case 'ODIA':
            return 'od';
        case 'MALAYALAM':
            return 'ml';
        default:
            return 'en';
    }
};

export const truncateDriverName = (driverName: string | undefined): string => {
    if (driverName && driverName.length > DRIVER_NAME_LENGTH_THRESHOLD) {
        return driverName.substring(0, DRIVER_NAME_LENGTH_THRESHOLD) + '...';
    }
    return driverName || 'Driver';
};

export const getErrorMessageByCode = (errorCode: string, defaultMessage: string): string => {
    if (!errorCode) {
        return defaultMessage || 'Something went wrong, please try again';
    }

    switch (errorCode) {
        case 'INVALID_AUTH_DATA':
            return 'The entered OTP is incorrect';
        case 'INCORRECT_OTP':
            return 'The entered OTP is incorrect';
        case 'TOKEN_EXPIRED':
            return 'The entered OTP has expired';
        case 'AUTH_BLOCKED':
            return 'The entered OTP has already been verified';
        case 'HITS_LIMIT_EXCEED':
            return 'OTP generation attempts have exceeded the limit';
        case 'UNAUTHORIZED':
            return 'Something went wrong - 101';
        case 'TOKEN_IS_NOT_VERIFIED':
            return 'Something went wrong - 102';
        case 'ACCESS_DENIED':
            return 'Something went wrong - 103';
        case 'TOKEN_NOT_FOUND':
            return 'Something went wrong - 104';
        default:
            return 'Something went wrong, please try again';
    }
};

export const FEEDBACK_EMOJI_MAP: Record<string, string> = {
    'Expert Driving': '🚗',
    'Clean Vehicle': '✨',
    'Polite Driver': '👍',
    'On Time': '⏰',
    'Skilled Navigator': '🧭',
    'Safe Rides': '🚦',
    'Right Fare': '💰',
};

export const isToday = (dateString: string | undefined): boolean => {
    if (!dateString) return false;
    const inputDate = dayjs(dateString);
    return inputDate.isSame(dayjs(), 'day');
};

/**
 * Adjusts price for pet rides by adding a fixed surcharge
 * @param price The base price to adjust
 * @param isPetRide Whether this is a pet ride
 * @returns The adjusted price, or undefined if the input price was undefined
 */
export const adjustPriceForPetRide = (
    price: number | undefined,
    isPetRide: boolean,
    petCharges: number | undefined,
): number | undefined => {
    if (price === undefined) return undefined;
    return isPetRide ? price + (petCharges || 0) : price;
};

export const getAsyncSourceLocation = async (pandalLat: string | null, pandalLon: string | null) => {
    const lat = parseFloat(pandalLat || '') || 0;
    const lon = parseFloat(pandalLon || '') || 0;
    const data = await safe(
        GetLocationAndServiceability.getLocationObjectAndServiceability(
            {
                TAG: 'PlaceByLatLon',
                _0: {
                    contents: { lat, lon },
                    tag: '',
                },
            },
            undefined,
            undefined,
            undefined,
            'source',
        ),
    );
    return data.result;
};

export const getFilePath = () => {
    return Platform.select({
        ios: `${RNFS.ExternalDirectoryPath}`,
        android: `${RNFS.DownloadDirectoryPath}`,
    });
};

export const formatDistanceWithUnit = (
    value: number,
    unit: DistanceUnit_distanceUnit,
    userLanguageStrings: strings,
): string => {
    // If value is greater than or equal to 1000 and unit is meters, convert to kilometers
    if (value >= 1000 && unit === 'Meter') {
        const kmValue = value / 1000;
        return `${Math.round(kmValue * 10) / 10} ${getShortDistance('Kilometer', userLanguageStrings)}`;
    }
    return `${Math.round(value)} ${getShortDistance(unit, userLanguageStrings)}`;
};

export const formatTimeFromSeconds = (
    inputSeconds: number | undefined,
    roundOff: boolean | undefined,
    userLanguageStrings: strings | undefined,
): string => {
    const totalSeconds = inputSeconds || 0;
    if (totalSeconds < 0) {
        return userLanguageStrings ? userLanguageStrings.InvalidTime : 'Invalid time';
    }

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = roundOff ? Math.round((totalSeconds % 3600) / 60) : Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [
        ...(hours > 0
            ? [
                  `${hours} ${hours > 1 ? (userLanguageStrings ? userLanguageStrings.Hours : 'hrs') : userLanguageStrings ? userLanguageStrings.Hour : 'hr'}`,
              ]
            : []),
        ...(minutes > 0 || hours === 0
            ? [
                  `${minutes} ${minutes > 1 ? (userLanguageStrings ? userLanguageStrings.Minutes : 'mins') : userLanguageStrings ? userLanguageStrings.Minute : 'min'}`,
              ]
            : []),
        ...(!roundOff && seconds > 0 && hours === 0
            ? [
                  `${seconds} ${seconds > 1 ? (userLanguageStrings ? userLanguageStrings.Seconds : 'secs') : userLanguageStrings ? userLanguageStrings.Second : 'sec'}`,
              ]
            : []),
    ].join(' ');
};

export const getShortDistance = (distance: DistanceUnit_distanceUnit, userLanguageStrings: strings | undefined) => {
    if (distance === 'Kilometer') {
        return userLanguageStrings ? userLanguageStrings.Kilometer : 'Km';
    } else if (distance === 'Meter') {
        return userLanguageStrings ? userLanguageStrings.Meter : 'm';
    } else if (distance === 'Yard') {
        return userLanguageStrings ? userLanguageStrings.Yard : 'yd';
    } else if (distance === 'Mile') {
        return userLanguageStrings ? userLanguageStrings.Mile : 'mi';
    }
    return undefined;
};

/**
 * Formats a distance object for display with optional unit conversion
 * @param distance The distance object with unit and value
 * @param expectedUnit The desired output unit (optional)
 * @returns Formatted distance string
 */
export const formatDistance = (
    distance: distance,
    expectedUnit: DistanceUnit_distanceUnit | undefined,
    userLanguageStrings: strings | undefined,
): string => {
    if (!distance) return '';

    const { unit, value } = distance;
    const convertedValue = expectedUnit && unit !== expectedUnit ? convertDistance(value, unit, expectedUnit) : value;
    const outputUnit = expectedUnit || unit;

    // Round to 1 decimal place for km/miles, whole number for meters/yards
    const formattedValue =
        outputUnit === 'Meter' || outputUnit === 'Yard'
            ? Math.round(convertedValue)
            : Math.round(convertedValue * 10) / 10;

    return `${formattedValue} ${getShortDistance(outputUnit, userLanguageStrings ?? undefined) || outputUnit}`;
};

/**
 * Converts a distance value from one unit to another
 */
export const convertDistance = (
    value: number,
    fromUnit: DistanceUnit_distanceUnit,
    toUnit: DistanceUnit_distanceUnit,
): number => {
    // Handle conversions between different units
    if (fromUnit === 'Meter' && toUnit === 'Kilometer') {
        return value / 1000;
    } else if (fromUnit === 'Kilometer' && toUnit === 'Meter') {
        return value * 1000;
    } else if (fromUnit === 'Mile' && toUnit === 'Kilometer') {
        return value * 1.60934;
    } else if (fromUnit === 'Kilometer' && toUnit === 'Mile') {
        return value / 1.60934;
    } else if (fromUnit === 'Mile' && toUnit === 'Meter') {
        return value * 1609.34;
    } else if (fromUnit === 'Meter' && toUnit === 'Mile') {
        return value / 1609.34;
    } else if (fromUnit === 'Yard' && toUnit === 'Meter') {
        return value * 0.9144;
    } else if (fromUnit === 'Meter' && toUnit === 'Yard') {
        return value / 0.9144;
    }
    return value;
};

export const mkDataTranscitLegRatingProp = (journeySummary: JourneySummary[] | undefined): TranscitLegRatingProp[] => {
    if (!journeySummary) return [];

    const filteredTaxi = journeySummary.filter(leg => leg.transitMode === 'auto');
    const filteredMetro = journeySummary.find(leg => leg.transitMode === 'metro');
    const filteredBus = journeySummary.find(leg => leg.transitMode === 'bus');
    const filteredSubway = journeySummary.find(leg => leg.transitMode === 'train');

    const combinedTaxi = [
        ...filteredTaxi,
        ...(filteredMetro ? [filteredMetro] : []),
        ...(filteredBus ? [filteredBus] : []),
        ...(filteredSubway ? [filteredSubway] : []),
    ];

    return combinedTaxi.map((leg, index) => ({
        transitMode: leg.transitMode,
        legOrder: leg.legOrder,
        count: leg.transitMode === 'auto' ? index + 1 : undefined,
    }));
};

const getFareErrorMessage = (leg: legInfo): string => {
    if (leg.totalFare?.amount) {
        return '';
    }
    if (leg.estimatedMaxFare?.amount) {
        return `Leg ${leg.order} (${leg.legExtraInfo.TAG}): totalFare empty, using estimatedMaxFare`;
    }
    if (leg.estimatedMinFare?.amount) {
        return `Leg ${leg.order} (${leg.legExtraInfo.TAG}): totalFare empty, using estimatedMinFare`;
    }
    return `Leg ${leg.order} (${leg.legExtraInfo.TAG}): totalFare empty, all fare fields null`;
};

const getLegFare = (leg: legInfo): number => {
    if (isBookingStatusConfirmed(leg.bookingStatus)) {
        return leg.totalFare?.amount ?? leg.estimatedMaxFare?.amount ?? leg.estimatedMinFare?.amount ?? 0;
    } else if (isFRFSBookingAndCancelled(leg)) {
        return -1;
    }
    return 0;
};

export const mkDataForjourneySummary = (
    legInfo: legInfo[] | undefined,
): {
    journeySummary: JourneySummary[];
    errorMessage: string;
} => {
    if (!legInfo) {
        return { journeySummary: [], errorMessage: '' };
    }
    const result = legInfo.map((leg: legInfo) => {
        const fareAmount = getLegFare(leg);
        const totalCost = fareAmount ? Math.floor(fareAmount) : 0;

        // Generate error message if totalFare is empty
        const errorMsg = getFareErrorMessage(leg);

        const journeyItem: JourneySummary = {
            destination: getJourneyLegDestination(leg),
            totalCost,
            transitMode: mapModeToTransitType(
                leg.legExtraInfo.TAG,
                leg.legExtraInfo.TAG === 'Taxi' ? leg.legExtraInfo._0.serviceTierName : undefined,
            ),
            legOrder: leg.order,
        };

        return { journeyItem, errorMsg };
    });

    const journeySummary = result.map(item => item.journeyItem);
    const errorMessage = result
        .map(item => item.errorMsg)
        .filter(msg => msg !== '')
        .join('; ');

    return { journeySummary, errorMessage };
};

export const getMinutesRemaining = (utcTimeString: string): number => {
    const targetTime = new Date(utcTimeString);
    const currentTime = new Date();
    const timeDifference = targetTime.getTime() - currentTime.getTime();
    const minutesRemaining = Math.floor(timeDifference / (1000 * 60));
    return minutesRemaining > 0 ? minutesRemaining : 0;
};

export const isDebug = async () => {
    return await AppInfoModule.isDebug();
};

export const getTransitLocation = (leg: { legExtraInfo: legExtraInfo } | undefined, isOrigin: boolean): string => {
    if (!leg) return '';

    const legExtra = leg.legExtraInfo;

    switch (legExtra.TAG) {
        case 'Taxi':
        case 'Walk':
            return getPlaceArea(isOrigin ? legExtra._0.origin.address : legExtra._0.destination.address);
        case 'Bus':
            return isOrigin
                ? legExtra._0.originStop
                    ? getLocationForFrfs(legExtra._0.originStop)
                    : ''
                : legExtra._0.destinationStop
                  ? getLocationForFrfs(legExtra._0.destinationStop)
                  : '';
        case 'Metro':
        case 'Subway': {
            const routeInfo = legExtra._0.routeInfo;
            if (isOrigin) {
                return routeInfo?.[0]?.originStop ? getLocationForFrfs(routeInfo[0].originStop) : '';
            } else {
                const lastRoute = routeInfo?.[(routeInfo?.length ?? 1) - 1];
                return lastRoute?.destinationStop ? getLocationForFrfs(lastRoute.destinationStop) : '';
            }
        }
        default:
            return '';
    }
};
export const secondsToHours = (seconds: number | undefined, userLanguageStrings: strings): string => {
    if (!seconds) return '';

    if (seconds >= 3600) {
        const hours = Math.floor(seconds / 3600);
        const remainingMinutes = Math.floor((seconds % 3600) / 60);

        if (remainingMinutes > 0) {
            return `${hours} ${userLanguageStrings.Hour} ${remainingMinutes} ${userLanguageStrings.Min}`;
        } else {
            return `${hours} ${userLanguageStrings.Hour}`;
        }
    }

    if (seconds >= 60) {
        const minutes = Math.floor(seconds / 60);
        return `${minutes} ${userLanguageStrings.Min}`;
    }

    return '';
};

export const createNammaTravelObject = (journeys: journeyData[], nammaTransitConstant: string): PricingItemType[] => {
    return journeys && journeys[0]
        ? [
              {
                  id: journeys[0].journeyId,
                  tripMode: TripMode.DynamicOffer,
                  tripCategory: TripCategory.OneWay,
                  serviceTierName: nammaTransitConstant,
                  serviceTierShortDesc: '',
                  cost: Math.ceil(journeys[0].totalMaxFare ?? journeys[0].totalMinFare),
                  toCost: undefined,
                  validTill: journeys[0].endTime || '',
                  minVehicleServiceTierSeatingCapacity: 4,
                  maxVehicleServiceTierSeatingCapacity: 4,
                  // eslint-disable-next-line myCustomPlugin/no-lazy-png-imports
                  vehicleIconUrl: require('@/src-v2/assets/3D-assets/multi.webp'),
                  estimatedFareWithCurrency: {
                      amount: journeys[0].totalMinFare,
                      currency: 'INR',
                  },
                  expandedData: undefined,
                  fareBreakup: undefined,
                  isAirConditioned: undefined,
                  isValueAddNP: true,
                  isRoundTrip: false,
                  tipOptions: undefined,
                  smartTipSuggestion: {
                      value: undefined,
                      description: undefined,
                  },
                  vehicleVariant: undefined,
                  serviceTierType: undefined,
                  isInsured: false,
                  businessDiscountInfo: undefined,
              },
          ]
        : [];
};

export const isMatchVehicle = (vehicleName: string, availableOptions: (string | undefined)[]): boolean => {
    return availableOptions.some(val => val?.toLowerCase().includes(vehicleName.toLowerCase()));
};

export const getVehicleImageForBookAny = (
    availableOptions: (string | undefined)[],
    isSelected: boolean = false,
): ImageSourcePropType => {
    if (isMatchVehicle('auto', availableOptions)) {
        return mtBookAny;
    } else if (isMatchVehicle('bike', availableOptions)) {
        return isSelected ? mtBookAny : BookanyBikeSedan;
    } else if (isMatchVehicle('sedan', availableOptions)) {
        return BookanyMiniSedan;
    } else if (isMatchVehicle('xl plus', availableOptions)) {
        return BookanyMiniXL;
    } else {
        return mtIcCarCorolla;
    }
};

export const getVehicleImageSrcSelected = (
    serviceTierName: string | undefined,
    vehicleIconUrl: string | undefined,
    availableOptions: (string | undefined)[],
): ImageSourcePropType => {
    if (serviceTierName === 'Book Any') {
        return getVehicleImageForBookAny(availableOptions, true);
    } else if (vehicleIconUrl) {
        return { uri: vehicleIconUrl };
    } else {
        return mtIcCarCorolla;
    }
};

/**
 * Truncates text for suggestion pills to a maximum length with ellipsis
 * @param text - The text to truncate
 * @param maxLength - Maximum number of characters to show (default: 12)
 * @returns Truncated text with ellipsis if longer than maxLength
 *
 * @example
 * truncatePillText("Very long instruction text") => "Very long i..."
 * truncatePillText("Short text") => "Short text"
 */
export const truncatePillText = (text: string, maxLength: number = 12): string => {
    if (!text) return '';

    const trimmedText = text.trim();

    if (trimmedText.length <= maxLength) {
        return trimmedText;
    }

    return trimmedText.substring(0, maxLength) + '...';
};

export const castVehicleCategoryToMultimodalTravelMode = (
    vehicleType: VehicleCategory_vehicleCategory,
): MultimodalTravelMode_multimodalTravelMode => {
    switch (vehicleType) {
        case 'BUS':
            return 'Bus';
        case 'METRO':
            return 'Metro';
        case 'SUBWAY':
            return 'Subway';
    }
};

export const castTransitModeToMultimodalTravelMode = (
    transitMode: TransitMode,
): MultimodalTravelMode_multimodalTravelMode => {
    switch (transitMode) {
        case 'METRO':
            return 'Metro';
        case 'SUBWAY':
            return 'Subway';
        case 'BUS':
            return 'Bus';
        case 'AUTO':
        case 'BIKE':
        case 'TAXI':
            return 'Taxi';
        case 'WALK':
            return 'Walk';
    }
};

export const getPluralTravelMode = (travelMode: string | undefined): string | undefined => {
    switch (travelMode) {
        case 'Metro':
            return 'Metros';
        case 'Subway':
            return 'Subways';
        case 'Bus':
            return 'Buses';
        case 'Taxi':
            return 'Taxi';
        case 'Walk':
            return 'Walk';
        default:
            return travelMode;
    }
};

export const getUIDisplayTravelMode = (
    travelMode: MultimodalTravelMode_multimodalTravelMode | undefined,
): string | undefined => {
    switch (travelMode) {
        case 'Subway':
            return 'Train';
        default:
            return travelMode;
    }
};

export const mapCityToFrfsCityType = (city: string): FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity => {
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    return city as FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity;
};

export enum ContactColor {
    Blue = '#007AFF',
    Orange = '#FF9500',
    Green = '#34C759',
}

// Helper function to check if a ride is older than 72 hours
export const isRideOlderThan72Hours = (timestamp: string | undefined): boolean => {
    if (!timestamp) return false;
    const rideTime = new Date(timestamp);
    const seventyTwoHoursAgo = new Date(Date.now() - 72 * 60 * 60 * 1000);
    return rideTime < seventyTwoHoursAgo;
};

export const safeOpenUrl = (url: string) => {
    try {
        Linking.openURL(url);
    } catch (error) {
        console.error('Error opening URL:', error);
    }
};

export const cityToFrfsCityType = (city: string): FrfsConfigCity_frfsConfigCity => {
    const capitalizedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    return capitalizedCity as FrfsConfigCity_frfsConfigCity;
};

// Helper function to get BottomSheetStage name as string
export const getBottomSheetStageName = (stage: BottomSheetStage): string => {
    return BottomSheetStage[stage] || 'Unknown';
};

/**
 * Composes screen name with bottom sheet stage for analytics tracking
 * @param screenRoute - The screen route enum value
 * @param bottomSheetStage - The bottom sheet stage enum value (optional)
 * @returns Composed screen name string for logging
 */
export const getScreenNameWithContext = (
    screenRoute: ScreenRoute,
    bottomSheetStage: BottomSheetStage | undefined,
): string => {
    if (screenRoute === ScreenRoute.HOME_TAB_HOME_SCREEN && bottomSheetStage !== undefined) {
        return `${screenRoute}_${BottomSheetStage[bottomSheetStage]}`;
    }
    return screenRoute;
};

/**
 * Extracts the 32-char hex SDK id from a telemetry path string.
 * Expected format contains a segment like: "sdk:<32-hex>/<...>"
 * @example
 * extractSdkId("sdk:019a3482ac0f000000000000681bcdef/os:...") => "019a3482ac0f000000000000681bcdef"
 */
export const extractSdkId = (input: string): string | null => {
    const match = input.match(/sdk:([0-9a-fA-F]{32})(?:\/|$)/);
    if (!match || !match[1]) return null;
    return match[1];
};

/**
 * Converts Language_language enum to the corresponding language code string
 * as expected by the backend API (FromHttpApiData instance).
 * @param language - The Language_language enum value
 * @returns The corresponding language code string (e.g., 'en', 'hi', 'ta')
 */
export const languageToCode = (language: Language_language | undefined): string => {
    if (!language) return 'en';
    const languageMap: Record<Language_language, string> = {
        ENGLISH: 'en',
        HINDI: 'hi',
        KANNADA: 'kn',
        MALAYALAM: 'ml',
        TAMIL: 'ta',
        BENGALI: 'bn',
        FRENCH: 'fr',
        TELUGU: 'te',
        ODIA: 'or',
        DUTCH: 'nl',
        GERMAN: 'de',
        FINNISH: 'fi',
        SWEDISH: 'sv',
        GUJARATI: 'gu',
    };
    return languageMap[language] ?? 'en';
};

/**
 * Generates a random number between min and max (inclusive)
 * @param min - Minimum value (default: 1)
 * @param max - Maximum value (default: 100)
 * @returns A random integer between min and max (inclusive)
 * @example
 * getRandomNumber() => 42 // Random number between 1 and 100
 * getRandomNumber(1, 10) => 7 // Random number between 1 and 10
 * getRandomNumber(50, 200) => 123 // Random number between 50 and 200
 */
export const getRandomNumber = (min: number = 1, max: number = 100): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Extracts the image/file name from a URL
 * @param url - The full URL string
 * @returns The filename extracted from the URL, or empty string if invalid
 * @example
 * getImageNameFromUrl('https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/empathy.png') => 'empathy.png'
 * getImageNameFromUrl('https://example.com/path/to/image.jpg') => 'image.jpg'
 * getImageNameFromUrl('https://example.com/path/') => ''
 */
export const getImageNameFromUrl = (url: string): string => {
    if (!url) return '';

    try {
        // Split by '/' and get the last segment
        const segments = url.split('/');
        const fileName = segments[segments.length - 1];

        if (!fileName) return '';

        // Remove query parameters if any (e.g., ?param=value)
        const cleanFileName = fileName.split('?')[0];

        if (!cleanFileName) return '';

        // Remove hash fragments if any (e.g., #anchor)
        const finalFileName = cleanFileName.split('#')[0];

        return finalFileName || '';
    } catch (error) {
        console.error('Error extracting image name from URL:', error);
        return '';
    }
};

/* Type definition for HyperEvent data structure
 */
export type HyperEventData = {
    event: string | undefined;
    orderId: string | undefined;
    life_cycle_id: string | undefined;
    payload:
        | {
              action: string | undefined;
              screen: string | undefined;
              status: string | undefined;
              delete_account_req: boolean | undefined;
              value: object | undefined;
          }
        | undefined;
};

/**
 * Parses HyperEvent data with platform-specific handling
 * - iOS: Response directly contains event data
 * - Android: Response has wrapper with key and data properties
 * @param resp - Raw event response from HyperSDK
 * @param context - Context string for error logging
 * @returns Parsed HyperEventData
 */
export const parseHyperEventData = (
    resp: string | null | undefined,
    context: string = 'hyperEvent',
): HyperEventData => {
    const defaultEventData: HyperEventData = {
        event: undefined,
        orderId: undefined,
        life_cycle_id: undefined,
        payload: undefined,
    };

    if (Platform.OS === 'ios') {
        // iOS: Direct parsing
        console.info('[HyperEvent] Parsing iOS response:', resp);
        return safeJsonParse<HyperEventData>(resp, defaultEventData, context);
    } else {
        // Android: Parse wrapper structure
        console.info('[HyperEvent] Parsing Android response:', resp);
        const { data } = safeJsonParse<{
            key: string;
            data: HyperEventData;
        }>(
            resp,
            {
                key: 'hyperKey',
                data: defaultEventData,
            },
            context,
        );
        return data;
    }
};

export const useLocationPermissionModal = () => {
    const { locationPermissionModalRef } = useRefsContext();
    const hasRequestedLocationPermission = useAppSelector(selectHasRequestedLocationPermission);
    const hasRequestedForeGps = useAppSelector(selectHasRequestedForeGps);
    const dispatch = useDispatch();
    const openLocationPermissionModal = useCallback(() => {
        if (!hasRequestedLocationPermission || !hasRequestedForeGps) {
            locationPermissionModalRef?.current?.present();
            dispatch(setHasRequestedLocationPermission(true));
        }
    }, [locationPermissionModalRef, hasRequestedLocationPermission, hasRequestedForeGps]);

    const dismissLocationPermissionModal = useCallback(() => {
        locationPermissionModalRef?.current?.dismiss();
    }, [locationPermissionModalRef, dispatch, hasRequestedLocationPermission, hasRequestedForeGps]);
    return { openLocationPermissionModal, dismissLocationPermissionModal };
};

// Helper function to check if a ticket is older than 72 hours
export const isTicketOlderThanXSeconds = (timestamp: string | undefined, time: number): boolean => {
    if (!timestamp) return false;
    const ticketTime = new Date(timestamp);
    const seventyTwoHoursAgo = new Date(Date.now() - time * 1000);
    return ticketTime < seventyTwoHoursAgo;
};
