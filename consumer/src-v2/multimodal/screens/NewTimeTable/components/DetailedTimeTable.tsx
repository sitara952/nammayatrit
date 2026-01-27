import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { TimeEntry } from '@/src-v2/multimodal/types/journeyTracking';
import { getPluralTravelMode, getUIDisplayTravelMode } from '@/src-v2/utils/common';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { formatTime } from '../../../utils/journeyTrackingUtils';
import { strings } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';

interface TimeTableSegment {
    startTime: string;
    endTime: string;
    interval: number;
    description: string;
    startTimeTimestamp: number;
    endTimeTimestamp: number;
}

interface DetailedTimeTableProps {
    times: TimeEntry[];
    mode: MultimodalTravelMode_multimodalTravelMode | undefined;
}

// Function to check if current time falls within a segment (with buffer)
const checkIfCurrentTimeInSegment = (
    segmentStartTime: number,
    segmentEndTime: number,
    bufferMinutes: number,
): boolean => {
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    // Convert segment timestamps to minutes for comparison
    const segmentStart = new Date(segmentStartTime);
    const segmentEnd = new Date(segmentEndTime);

    const segmentStartMinutes = segmentStart.getHours() * 60 + segmentStart.getMinutes();
    const segmentEndMinutes = segmentEnd.getHours() * 60 + segmentEnd.getMinutes();

    // Apply buffer to segment boundaries
    const bufferedStartMinutes = segmentStartMinutes - bufferMinutes;
    const bufferedEndMinutes = segmentEndMinutes + bufferMinutes;

    // Handle overnight segments (e.g., 23:00 to 01:00)
    if (segmentStartMinutes > segmentEndMinutes) {
        // Overnight segment with buffer
        return currentTimeInMinutes >= bufferedStartMinutes || currentTimeInMinutes <= bufferedEndMinutes;
    } else {
        // Normal segment within the same day with buffer
        return currentTimeInMinutes >= bufferedStartMinutes && currentTimeInMinutes <= bufferedEndMinutes;
    }
};

// Groups timestamps into headway segments for a single local day (no duplicates, no cross‑day repeats)
export const groupTimesByInterval = (
    times: TimeEntry[],
    filterFromCurrentTime: boolean = false,
    mode: MultimodalTravelMode_multimodalTravelMode | undefined,
    tolerance: number,
    userLanguageStrings: strings,
): TimeTableSegment[] => {
    if (times.length < 2) return [];

    const BREAK_THRESHOLD_MIN = 90;
    const BUFFER_MIN = 5;
    const ms = (m: number) => m * 60_000;

    const dayKey = (ts: number) => {
        const d = new Date(ts); // local day
        return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    };

    // 1) sort
    const sortedTimes = [...times].sort((a, b) => a.time - b.time);

    // 2) de-dupe: keep first per minute (immutable)
    const deduped = sortedTimes.filter((t, i, arr) => {
        const minuteKey = Math.floor(t.time / 60_000);
        const firstIndex = arr.findIndex(x => Math.floor(x.time / 60_000) === minuteKey);
        return i === firstIndex;
    });
    if (deduped.length < 2) return [];

    type IntervalRec = {
        startIndex: number;
        endIndex: number;
        interval: number; // minutes
        startTime: number; // ms
        endTime: number; // ms
        isServiceBreak: boolean;
    };

    // 3) intervals + local day breaks
    const intervals: IntervalRec[] = deduped.slice(0, -1).map((cur, i) => {
        const nxt = deduped[i + 1];
        if (!nxt) throw new Error('Unexpected: next element not found');
        const diffMin = Math.round((nxt.time - cur.time) / 60000);

        const curD = new Date(cur.time);
        const nxtD = new Date(nxt.time);
        const crossesDay =
            curD.getFullYear() !== nxtD.getFullYear() ||
            curD.getMonth() !== nxtD.getMonth() ||
            curD.getDate() !== nxtD.getDate();

        return {
            startIndex: i,
            endIndex: i + 1,
            interval: diffMin,
            startTime: cur.time,
            endTime: nxt.time,
            isServiceBreak: crossesDay || diffMin >= BREAK_THRESHOLD_MIN,
        };
    });

    // 4) split into chunks at service breaks (immutable; guarded)
    const chunks = intervals
        .reduce<IntervalRec[][]>((acc, iv) => {
            if (iv.isServiceBreak) return [...acc, []];
            if (acc.length === 0) return [[iv]];
            const last = acc[acc.length - 1] ?? []; // guard for TS
            return last.length === 0 ? [...acc.slice(0, -1), [iv]] : [...acc.slice(0, -1), [...last, iv]];
        }, [])
        .filter(c => c.length > 0);
    if (!chunks.length) return [];

    // 5) choose one day (first timestamp’s day; change to dayKey(Date.now()) for "today")
    const targetDay = dayKey(deduped[0]?.time ?? 0);
    const dayChunks: IntervalRec[][] = chunks.filter(c => {
        const first = c[0];
        if (!first) return false;
        const timeEntry = deduped[first.startIndex];
        return timeEntry ? dayKey(timeEntry.time) === targetDay : false;
    });
    if (!dayChunks.length) return [];

    type Segment = { startTime: number; endTime: number; interval: number; count: number };

    // 6) reduce one chunk into segments (guard 'last' without non-null assertions)
    const reduceChunk = (chunk: IntervalRec[], firstDepartureTime: number): Segment[] =>
        chunk.reduce<Segment[]>((segs, iv, i) => {
            if (i === 0) {
                return [
                    ...segs,
                    { startTime: firstDepartureTime, endTime: iv.endTime, interval: iv.interval, count: 1 },
                ];
            }
            const last = segs[segs.length - 1]; // Segment | undefined
            if (last && Math.abs(iv.interval - last.interval) <= tolerance) {
                const extended: Segment = { ...last, endTime: iv.endTime, count: last.count + 1 };
                return [...segs.slice(0, -1), extended];
            }
            return [...segs, { startTime: iv.startTime, endTime: iv.endTime, interval: iv.interval, count: 1 }];
        }, []);

    // 7) build segments (reduce; guard c[0])
    const allSegments = dayChunks.reduce<Segment[]>((acc, c) => {
        const first = c[0];
        if (!first) return acc;
        const firstDepartureTime = deduped[first.startIndex]?.time;
        if (firstDepartureTime == null) return acc;
        const segs = reduceChunk(c, firstDepartureTime);
        return [...acc, ...segs];
    }, []);
    // 8) keep only segments that have more than one departure (i.e. more than one bus)
    const multiBusSegments = allSegments.filter(s => s.count > 1);

    // 9) optional current-time filter: include the first segment that is "current" (with buffer) and everything after,
    // also include one preceding segment for context if available.
    const now = Date.now();
    const filteredSegments = filterFromCurrentTime
        ? (() => {
              const idx = multiBusSegments.findIndex(s => s.endTime >= now - ms(BUFFER_MIN));
              return idx === -1 ? multiBusSegments : multiBusSegments.slice(Math.max(0, idx - 1));
          })()
        : multiBusSegments;

    // 10) final shape
    return filteredSegments.map(segment => ({
        startTime: formatTime(segment.startTime),
        endTime: formatTime(segment.endTime),
        interval: segment.interval,
        description: mode
            ? getPluralTravelMode(
                  getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings),
              ) +
              ' ' +
              userLanguageStrings.ArriveEveryMinutesDuringPeriod.replace('{interval}', segment.interval.toString())
            : getPluralTravelMode(
                  getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings),
              ) +
              ' ' +
              userLanguageStrings.ArrivesEveryMinutesDuringPeriod.replace('{interval}', segment.interval.toString()),
        startTimeTimestamp: segment.startTime,
        endTimeTimestamp: segment.endTime,
    }));
};

// Individual time segment card component
const TimeSegmentCard = ({
    segment,
    index,
    isLastItem,
    isCurrentSegment,
    bufferMinutesForCurrentSegment,
    userLanguageStrings,
}: {
    segment: TimeTableSegment;
    index: number;
    isLastItem: boolean;
    isCurrentSegment: boolean | undefined;
    bufferMinutesForCurrentSegment: number;
    userLanguageStrings: strings;
}) => {
    const currentSegment =
        isCurrentSegment ??
        checkIfCurrentTimeInSegment(
            segment.startTimeTimestamp,
            segment.endTimeTimestamp,
            bufferMinutesForCurrentSegment,
        );
    return (
        <Animated.View
            key={index}
            style={tailwind.style(
                'py-[18px] mx-[24px] flex-row justify-between items-center',
                !isLastItem && 'border-b-[1px] border-[#ECEDEF]',
            )}>
            {isCurrentSegment ? (
                <Animated.View
                    style={tailwind.style(
                        'absolute w-[3px] my-[20px] rounded-[3px] top-0 -left-[13.5px] right-0 bottom-0 bg-[#047AEA]',
                    )}></Animated.View>
            ) : null}
            <View style={tailwind.style('flex-1 pr-9')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[14px] font-areaNormal-extrabold',
                        currentSegment ? 'text-[#3B3A3C]' : 'text-[#7E7E7E]',
                    )}>
                    {segment.startTime} - {segment.endTime}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style('text-[13px] font-areaNormal-extrabold leading-[18px] pt-2 text-[#969696]')}>
                    {segment.description}
                </Animated.Text>
            </View>
            <View style={tailwind.style('items-center justify-center w-[54px] h-13 rounded-2xl mr-1.5 bg-[#F7F7F7]')}>
                <Animated.Text
                    style={tailwind.style(
                        'text-[19px] font-areaNormal-extrabold',
                        currentSegment ? 'text-[#09941E]' : 'text-[#656565]',
                    )}>
                    {segment.interval < 10 ? `0${segment.interval}` : segment.interval}
                </Animated.Text>
                <Animated.Text
                    style={tailwind.style(
                        'text-[10px] font-areaNormal-extrabold',
                        currentSegment ? 'text-[#09941E]' : 'text-[#656565]',
                    )}>
                    {userLanguageStrings.Minutes}
                </Animated.Text>
            </View>
        </Animated.View>
    );
};

export const removeMinuteDuplicates = (times: TimeEntry[]): TimeEntry[] => {
    const sorted = [...times].sort((a, b) => a.time - b.time);

    return sorted.filter((t, i, arr) => {
        // Keep this item only if it's the first in its minute bucket
        const minuteKey = Math.floor(t.time / 60_000);
        const firstIndex = arr.findIndex(x => Math.floor(x.time / 60_000) === minuteKey);
        return i === firstIndex;
    });
};

export const DetailedTimeTable = (props: DetailedTimeTableProps) => {
    const { times } = props;
    const dedupedTimes = removeMinuteDuplicates(times);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { toleranceForGroupingTimeSegments, bufferMinutesForCurrentSegment } = useAppSelector(selectNewFeatureFlags);
    // Process the timestamps into grouped segments
    const processedSegments = groupTimesByInterval(
        dedupedTimes,
        true,
        props.mode,
        toleranceForGroupingTimeSegments,
        userLanguageStrings,
    );
    if (processedSegments.length === 0) {
        return (
            <Animated.View style={[tailwind.style('mx-5 py-1.5 mt-6 bg-white rounded-[24px]'), styles.cardItem]}>
                <View style={tailwind.style('p-4 items-center justify-center')}>
                    <Animated.Text
                        style={tailwind.style('text-base font-areaNormal-extrabold text-[#7E7E7E] text-center')}>
                        {userLanguageStrings.NoTimeTableAvailable}
                    </Animated.Text>
                </View>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[tailwind.style('mx-5 py-1.5 mt-6 bg-white rounded-[32px]'), styles.cardItem]}>
            {processedSegments.map((segment, index) => (
                <TimeSegmentCard
                    key={`${segment.startTime}-${segment.endTime}-${index}`}
                    segment={segment}
                    index={index}
                    isLastItem={index === processedSegments.length - 1}
                    bufferMinutesForCurrentSegment={bufferMinutesForCurrentSegment}
                    isCurrentSegment={checkIfCurrentTimeInSegment(
                        segment.startTimeTimestamp,
                        segment.endTimeTimestamp,
                        bufferMinutesForCurrentSegment,
                    )}
                    userLanguageStrings={userLanguageStrings}
                />
            ))}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    cardItem: {
        // box-shadow: 0px 0px 1px 0px #0000001C inset;
        // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        shadowOpacity: 0.075,
        elevation: 5,
    },
});
