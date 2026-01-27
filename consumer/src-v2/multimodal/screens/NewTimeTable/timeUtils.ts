import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen.tsx';
import { TimeEntry } from '../../types/journeyTracking.ts';
import { SegmentTimeTableType, TimeTableInfo, TimeTableSegment } from './types.tsx';
import { getUIDisplayTravelMode } from '@/src-v2/utils/common.ts';
import { strings } from 'config-types';
import { getUserLanguageStringsForMode } from '../../utils/BusServiceUtils.ts';

// Utility function to format timestamp to readable time
export const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

// Function to calculate interval between two timestamps in minutes
export const calculateInterval = (timestamp1: number, timestamp2: number): number => {
    // Normalize timestamps to today by getting only the time part
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);

    const time1 = date1.getHours() * 60 + date1.getMinutes();
    const time2 = date2.getHours() * 60 + date2.getMinutes();

    // Handle case where time2 is on the next day (e.g., 23:45 -> 00:15)
    const interval = time2 - time1;
    const adjustedInterval = interval < 0 ? interval + 24 * 60 : interval;

    return adjustedInterval;
};

// Function to group timestamps by similar intervals
export const _groupTimesByInterval = (times: TimeEntry[]): TimeTableSegment[] => {
    if (times.length < 2) return [];

    // Sort times by timestamp
    const sortedTimes = [...times].sort((a, b) => a.time - b.time);

    // Calculate intervals between consecutive times
    const intervals = sortedTimes
        .slice(0, -1)
        .map((currentTime, i) => {
            const nextTime = sortedTimes[i + 1];

            if (currentTime && nextTime) {
                const interval = calculateInterval(currentTime.time, nextTime.time);
                return {
                    startIndex: i,
                    endIndex: i + 1,
                    interval: interval,
                    startTime: currentTime.time,
                    endTime: nextTime.time,
                };
            }
            return null;
        })
        .filter(Boolean);

    // Group consecutive intervals that are similar (within tolerance)
    const tolerance = 3; // 3 minutes tolerance for grouping

    if (intervals.length === 0 || sortedTimes.length < 2) return [];

    const firstTime = sortedTimes[0];
    const secondTime = sortedTimes[1];
    const firstInterval = intervals[0];

    if (!firstTime || !secondTime || !firstInterval) return [];

    const segmentGroups = intervals.reduce((acc: SegmentTimeTableType, currentInterval, i) => {
        if (!currentInterval) return acc;

        if (i === 0) {
            return [
                {
                    startTime: firstTime.time,
                    endTime: secondTime.time,
                    interval: firstInterval.interval,
                    count: 1,
                },
            ];
        }

        const lastSegment = acc[acc.length - 1];
        if (!lastSegment) return acc;

        // If interval is similar to current segment, extend the segment
        if (Math.abs(currentInterval.interval - lastSegment.interval) <= tolerance) {
            return [
                ...acc.slice(0, -1),
                {
                    ...lastSegment,
                    endTime: currentInterval.endTime,
                    count: lastSegment.count + 1,
                },
            ];
        } else {
            // Start new segment
            return [
                ...acc,
                {
                    startTime: currentInterval.startTime,
                    endTime: currentInterval.endTime,
                    interval: currentInterval.interval,
                    count: 1,
                },
            ];
        }
    }, []);

    // Convert to final format
    return segmentGroups.map(segment => ({
        startTime: formatTime(segment.startTime),
        endTime: formatTime(segment.endTime),
        interval: segment.interval,
        description: `Metros arrive every ${segment.interval} minutes during this period.`,
    }));
};

// Function to reduce segments to 4-5 most significant ones
export const _reduceToMainSegments = (segments: TimeTableSegment[]): TimeTableSegment[] => {
    if (segments.length <= 5) return segments;

    // Sort by duration (endTime - startTime) to get most significant segments
    const segmentsWithDuration = segments.map(segment => {
        try {
            const startTime = new Date(`1970-01-01 ${segment.startTime}`);
            const endTime = new Date(`1970-01-01 ${segment.endTime}`);

            if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
                return { ...segment, duration: 0 };
            }

            const duration = endTime.getTime() - startTime.getTime();

            // Handle day rollover
            const finalDuration = duration < 0 ? duration + 24 * 60 * 60 * 1000 : duration;

            return { ...segment, duration: finalDuration };
        } catch {
            return { ...segment, duration: 0 };
        }
    });

    // Sort by duration descending and take top 5
    return [...segmentsWithDuration]
        .sort((a, b) => b.duration - a.duration)
        .slice(0, 5)
        .map(({ duration: _duration, ...segment }) => segment);
};

// Main function to process timestamps into grouped segments
export const processTimestampsIntoSegments = (times: TimeEntry[]): TimeTableSegment[] => {
    const segments = _groupTimesByInterval(times);
    return _reduceToMainSegments(segments);
};

// Function to get next 3 times from current time
export const getNext3TimesFromNow = (
    times: TimeEntry[],
    mode: MultimodalTravelMode_multimodalTravelMode | undefined,
    userLanguageStrings: strings,
): TimeTableInfo[] => {
    const now = new Date();
    const currentTimeSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

    // Sort times chronologically
    const sortedTimes = [...times].sort((a, b) => a.time - b.time);

    // Find times that are after current time of day
    const futureTimes = sortedTimes.filter(item => {
        const itemDate = new Date(item.time);
        const itemTimeSeconds = itemDate.getHours() * 3600 + itemDate.getMinutes() * 60 + itemDate.getSeconds();
        return itemTimeSeconds > currentTimeSeconds;
    });

    // If no future times found today, wrap around to next day (start from beginning)
    const timesToReturn = futureTimes.length > 0 ? futureTimes : sortedTimes;

    // Return next 3 items transformed to TimeTableInfo format
    return timesToReturn.slice(0, 3).map((item, index) => {
        // Convert the time to a proper future timestamp
        const itemDate = new Date(item.time);
        const today = new Date();

        // Create a new date with today's date but the item's time
        const futureTime = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate(),
            itemDate.getHours(),
            itemDate.getMinutes(),
            itemDate.getSeconds(),
        );

        // If the time has already passed today, add a day
        if (futureTime.getTime() <= Date.now()) {
            futureTime.setDate(futureTime.getDate() + 1);
        }

        return {
            info:
                index === 0
                    ? `${getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings)} ${userLanguageStrings.ArrivesAt}`
                    : `${userLanguageStrings.InCaseYouMissPrevious} ${getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings)}`,
            mode: mode,
            time: futureTime.getTime(),
            formattedTime: formatTime(item.time),
        };
    });
};

export const getNext3TimesFromTime = (
    times: TimeEntry[],
    fromTime: number,
    mode: MultimodalTravelMode_multimodalTravelMode | undefined,
    userLanguageStrings: strings,
): TimeTableInfo[] => {
    const givenDate = new Date(fromTime);
    const givenTimeSeconds = givenDate.getHours() * 3600 + givenDate.getMinutes() * 60 + givenDate.getSeconds();

    // Sort times chronologically
    const sortedTimes = [...times].sort((a, b) => a.time - b.time);

    // Find times that are after given time of day
    const futureTimes = sortedTimes.filter(item => {
        const itemDate = new Date(item.time);
        const itemTimeSeconds = itemDate.getHours() * 3600 + itemDate.getMinutes() * 60 + itemDate.getSeconds();
        return itemTimeSeconds > givenTimeSeconds;
    });

    // If no future times found today, wrap around to next day (start from beginning)
    const timesToReturn = futureTimes.length > 0 ? futureTimes : sortedTimes;

    // Return next 3 items transformed to TimeTableInfo format
    return timesToReturn.slice(0, 3).map((item, index) => {
        // Convert the time to a proper future timestamp
        const itemDate = new Date(item.time);
        const baseDate = new Date(fromTime);

        // Create a new date with base date but the item's time
        const futureTime = new Date(
            baseDate.getFullYear(),
            baseDate.getMonth(),
            baseDate.getDate(),
            itemDate.getHours(),
            itemDate.getMinutes(),
            itemDate.getSeconds(),
        );

        // If the time has already passed on the base date, add a day
        if (futureTime.getTime() <= fromTime) {
            futureTime.setDate(futureTime.getDate() + 1);
        }

        return {
            info:
                index === 0
                    ? `${getUIDisplayTravelMode(mode)} ${userLanguageStrings.ArrivesAt}`
                    : `${userLanguageStrings.InCaseYouMissPrevious} ${getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings)}`,
            mode: mode,
            time: futureTime.getTime(),
            formattedTime: formatTime(item.time),
        };
    });
};
