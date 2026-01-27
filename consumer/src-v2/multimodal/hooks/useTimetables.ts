import { useState, useEffect } from 'react';
import { type legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { useLazyTimetableRouteCodeStopStopCodeGetQuery } from '@/api/integrations/rtk/TimetableRouteCodeStopStopCodeGet';
import {
    getTimetableCacheKey,
    getTimetableFromCache,
    setTimetableInCache,
    shouldInvalidateCache,
} from '../utils/cache';
import { type timetableResponse } from '@/readOnly/api/types/TimetableResponse.gen';
import {
    createLegOrder,
    extractRouteCode,
    getFrfsVehicleType,
    mapTravelModeToTransitMode,
    extractOriginStopCode,
    extractDestinationStopCode,
} from '../utils/journeyTrackingUtils';
import { TimeEntry } from '../screens/NewLiveJourney/screens/TransitTracking/TransitTimetable';
import { useNetworkAware } from './useNetworkAware';

export type TimetableFetchState = {
    data: timetableResponse | null;
    isLoading: boolean;
    error: unknown;
};

/**
 * Processes a single timetable entry and returns TimeEntry objects for today and tomorrow
 * @param timeOfArrival - Time string in format "HH:MM:SS"
 * @param index - Index of the entry in the original timetable
 * @param totalEntries - Total number of entries in the original timetable
 * @returns Array of TimeEntry objects for today and tomorrow
 */
export function processTimetableEntry(
    timeOfArrival: string | undefined,
    index: number,
    totalEntries: number,
): TimeEntry[] {
    if (!timeOfArrival) {
        return [];
    }
    const [hours = 0, minutes = 0, seconds = 0] = timeOfArrival.split(':').map(Number);

    const today = new Date();
    const todayTimestamp = new Date(today).setHours(hours, minutes, seconds);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimestamp = new Date(tomorrow).setHours(hours, minutes, seconds);

    return [
        { time: todayTimestamp, id: index },
        { time: tomorrowTimestamp, id: index + totalEntries },
    ];
}

export function getNextTwoTimes(times: TimeEntry[], startTimeOfVehicle: number | undefined): number[] {
    const now = startTimeOfVehicle ?? Date.now();
    const oneMilliSec = 60000;

    const sortedTimes = times.filter(entry => entry.time > now).sort((a, b) => a.time - b.time);

    const timeDiffs = sortedTimes.reduce((acc: number[], entry) => {
        const diffInMinutes = Math.round((entry.time - now) / oneMilliSec);
        if (!acc.includes(diffInMinutes) && acc.length < 2) {
            return [...acc, diffInMinutes];
        }
        return acc;
    }, []);

    return timeDiffs;
}

export const useTimetables = (legs: legInfo[] | undefined, mockMode: boolean) => {
    const [legTimetables, setLegTimetables] = useState<Record<string, TimeEntry[]>>({});
    const [fetchTimetable, { isLoading, error }] = useLazyTimetableRouteCodeStopStopCodeGetQuery({
        selectFromResult: ({ isLoading, error }) => ({ isLoading, error }),
    });
    const { shouldMakeApiCalls, isNetworkStateKnown } = useNetworkAware();

    useEffect(() => {
        if (mockMode || !legs) return;

        const fetchAllTimetables = async () => {
            if (!legs) return;

            const timetablePromises = legs.map(async metaLeg => {
                const transitMode = mapTravelModeToTransitMode(
                    metaLeg?.travelMode,
                    metaLeg.legExtraInfo.TAG === 'Taxi' ? metaLeg.legExtraInfo._0.serviceTierName : undefined,
                );

                if (transitMode !== 'BUS' && transitMode !== 'METRO' && transitMode !== 'SUBWAY') {
                    return;
                }

                const legOrderKey = createLegOrder(metaLeg);
                const routeCode = extractRouteCode(metaLeg);
                const stopCode = extractOriginStopCode(metaLeg);
                const destinationStopCode = extractDestinationStopCode(metaLeg);
                const vehicleType = getFrfsVehicleType(transitMode);

                if (!routeCode || !stopCode || !destinationStopCode) {
                    return;
                }

                // Always check cache first
                const cachedData = getTimetableFromCache(routeCode, stopCode, destinationStopCode);

                // If we have cached data and no internet, use cached data
                if (cachedData && cachedData.length > 0 && !shouldMakeApiCalls) {
                    console.info(`[Timetables] Offline mode: using cached data for ${legOrderKey}`);
                    setLegTimetables(prev => ({
                        ...prev,
                        [legOrderKey]: cachedData,
                    }));
                    return;
                }

                // If we have cached data and internet, check if we should invalidate
                const cacheKey = getTimetableCacheKey(routeCode, stopCode, destinationStopCode);
                if (
                    cachedData &&
                    cachedData.length > 0 &&
                    shouldMakeApiCalls &&
                    !shouldInvalidateCache(cacheKey, true, vehicleType === 'SUBWAY')
                ) {
                    setLegTimetables(prev => ({
                        ...prev,
                        [legOrderKey]: cachedData,
                    }));
                    return;
                }

                // If no internet and no cache, return empty timetable
                // But only warn if network state is known (to avoid false warnings during initialization)
                if (!shouldMakeApiCalls) {
                    if (isNetworkStateKnown) {
                        console.warn(`[Timetables] Offline mode: no cached data available for ${legOrderKey}`);
                    } else {
                        console.info(
                            `[Timetables] Network state unknown, waiting for proper detection for ${legOrderKey}`,
                        );
                    }
                    setLegTimetables(prev => ({
                        ...prev,
                        [legOrderKey]: [],
                    }));
                    return;
                }

                try {
                    const response = await fetchTimetable({
                        routeCode,
                        stopCode,
                        destinationStopCode,
                        vehicleType,
                    }).unwrap();
                    const timetableData = {
                        ...response,
                        timetable: [...response.timetable]
                            .flatMap((item, index) =>
                                processTimetableEntry(item.timeOfArrival, index, response.timetable.length),
                            )
                            .slice()
                            .sort((a, b) => a.time - b.time),
                    };
                    setTimetableInCache(routeCode, stopCode, destinationStopCode, timetableData.timetable);
                    setLegTimetables(prev => ({
                        ...prev,
                        [legOrderKey]: timetableData.timetable,
                    }));
                } catch (e) {
                    console.error(e);

                    // In case of API error, try to use cached data if available
                    const fallbackCachedData = getTimetableFromCache(routeCode, stopCode, destinationStopCode);
                    if (fallbackCachedData && fallbackCachedData.length > 0) {
                        console.info(`[Timetables] API failed, falling back to cached data for ${legOrderKey}`);
                        setLegTimetables(prev => ({
                            ...prev,
                            [legOrderKey]: fallbackCachedData,
                        }));
                    } else {
                        setLegTimetables(prev => ({
                            ...prev,
                            [legOrderKey]: [],
                        }));
                    }
                }
            });

            await Promise.all(timetablePromises);
        };

        fetchAllTimetables();
    }, [legs, mockMode, shouldMakeApiCalls, isNetworkStateKnown]);

    return { legTimetables, isLoading, error };
};

export const useTimetablesFromCache = (legs: legInfo[] | undefined): { legTimetables: Record<string, TimeEntry[]> } => {
    if (!legs || legs.length === 0) {
        return { legTimetables: {} };
    }

    const legTimetables = legs.reduce<Record<string, TimeEntry[]>>((acc, metaLeg) => {
        const transitMode = mapTravelModeToTransitMode(
            metaLeg?.travelMode,
            metaLeg.legExtraInfo.TAG === 'Taxi' ? metaLeg.legExtraInfo._0.serviceTierName : undefined,
        );
        if (transitMode !== 'BUS' && transitMode !== 'METRO' && transitMode !== 'SUBWAY') {
            return acc;
        }
        const legOrderKey = createLegOrder(metaLeg);
        const routeCode = extractRouteCode(metaLeg);
        const stopCode = extractOriginStopCode(metaLeg);
        const destinationStopCode = extractDestinationStopCode(metaLeg);

        if (!routeCode || !stopCode || !destinationStopCode) {
            return acc;
        }

        const cachedData = getTimetableFromCache(routeCode, stopCode, destinationStopCode);

        if (cachedData && cachedData.length > 0) {
            return {
                ...acc,
                [legOrderKey]: cachedData,
            };
        }
        return acc;
    }, {});

    const hasCachedData = Object.keys(legTimetables).length > 0;
    return hasCachedData ? { legTimetables } : { legTimetables: {} };
};
