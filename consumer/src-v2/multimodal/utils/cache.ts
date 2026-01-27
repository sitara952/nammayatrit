import { createMMKV } from '@/utils/mmkvUtils';
import { type latLong as LatLongType } from '@/readOnly/api/types/LatLong.gen';
import { ConfirmedBoardingData, StopType } from '@/src-v2/multimodal/types/journeyTracking';
import { TimeEntry } from '@/src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/TransitTimetable';
import { logger } from '@/src-v2/systems/logger';

const storage = createMMKV();

const CACHE_EXPIRATION_TIME = 4 * 60 * 60 * 1000; // 4 hours
const CACHE_EXPIRATION_TIME_FOR_SUBURBAN = 1 * 60 * 1000; // 1 minutes

export const shouldInvalidateCache = (key: string, hasInternet: boolean, isSuburban: boolean): boolean => {
    if (!hasInternet) {
        console.info(`[Cache] Offline mode: NOT invalidating cache for key: ${key}`);
        return false;
    }

    const cachedData = storage.getString(key);
    if (!cachedData) return true;

    try {
        // eslint-disable-next-line myCustomPlugin/no-direct-json-parse
        const { timestamp } = JSON.parse(cachedData);
        const isExpired =
            Date.now() - timestamp >= (isSuburban ? CACHE_EXPIRATION_TIME_FOR_SUBURBAN : CACHE_EXPIRATION_TIME);

        if (isExpired) {
            console.info(`[Cache] Cache expired for key: ${key}, invalidating`);
        }

        return isExpired;
    } catch {
        return true;
    }
};

const getWaypointCacheKey = (origin: LatLongType, destination: LatLongType, mode: 'WALK' | 'TAXI') =>
    `waypoints-${mode}-${origin.lat},${origin.lon}-${destination.lat},${destination.lon}`;

export const getWaypointsFromCache = (
    origin: LatLongType,
    destination: LatLongType,
    mode: 'WALK' | 'TAXI',
): { waypoints: LatLongType[]; stops: StopType } | null => {
    const key = getWaypointCacheKey(origin, destination, mode);
    return getCache(key);
};

export const setWaypointsInCache = (
    origin: LatLongType,
    destination: LatLongType,
    mode: 'WALK' | 'TAXI',
    data: { waypoints: LatLongType[]; stops: StopType },
) => {
    const key = getWaypointCacheKey(origin, destination, mode);
    setCache(key, data);
};

export const getTimetableCacheKey = (routeCode: string, stopCode: string, destinationStopCode: string) =>
    `timetable-${routeCode}-${stopCode}-${destinationStopCode}`;

export const getTimetableFromCache = (
    routeCode: string,
    stopCode: string,
    destinationStopCode: string,
): TimeEntry[] | null => {
    const key = getTimetableCacheKey(routeCode, stopCode, destinationStopCode);
    return getCache(key);
};

export const setTimetableInCache = (
    routeCode: string,
    stopCode: string,
    destinationStopCode: string,
    data: TimeEntry[],
) => {
    const key = getTimetableCacheKey(routeCode, stopCode, destinationStopCode);
    setCache(key, data);
};

export const getCache = <T>(key: string): T | null => {
    const cachedData = storage.getString(key);
    if (cachedData) {
        // eslint-disable-next-line myCustomPlugin/no-direct-json-parse
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRATION_TIME) {
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            return data as T;
        }
    }
    return null;
};

export const setCache = <T>(key: string, data: T) => {
    const cacheData = {
        data,
        timestamp: Date.now(),
    };
    storage.set(key, JSON.stringify(cacheData));
};

export const getConfirmedBoardingDataCacheKey = (journeyId: string, legOrder: string) =>
    `confirmed-boarding-time-v2-${journeyId}-${legOrder}`;

export const getConfirmedBoardingDataFromCache = (
    journeyId: string,
    legOrder: string,
): ConfirmedBoardingData | undefined => {
    const key = getConfirmedBoardingDataCacheKey(journeyId, legOrder);
    return getCache<ConfirmedBoardingData>(key) ?? undefined;
};

export const setConfirmedBoardingDataInCache = (journeyId: string, legOrder: string, data: ConfirmedBoardingData) => {
    const key = getConfirmedBoardingDataCacheKey(journeyId, legOrder);
    logger.logDebug(
        `Journey Id: ${journeyId || 'No Journey Id'}, Leg Order: ${legOrder} - Confirmed Boarding Time set in cache: ${data}`,
        'MultimodalTracking',
    );
    setCache<ConfirmedBoardingData>(key, data);
};

export const hasConfirmedBoardingDataInCache = (journeyId: string, legOrder: string): boolean => {
    const key = getConfirmedBoardingDataCacheKey(journeyId, legOrder);
    return storage.contains(key);
};

export const removeConfirmedBoardingTimeFromCache = (journeyId: string, legOrder: string) => {
    const key = getConfirmedBoardingDataCacheKey(journeyId, legOrder);
    storage.delete(key);
};
