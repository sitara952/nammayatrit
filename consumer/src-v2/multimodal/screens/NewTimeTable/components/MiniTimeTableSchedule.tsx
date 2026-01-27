import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { getUIDisplayTravelMode } from '@/src-v2/utils/common';
import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { TimeEntry } from '../../NewLiveJourney/screens/TransitTracking/TransitTimetable';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getIconBGFromType, getIconFromType } from '../../NewLiveJourney/utils/getTransitIconUtils';
import { groupTimesByInterval } from './DetailedTimeTable';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';

export interface TimeTableScheduleProps {
    // mins - interval between time markers
    times: TimeEntry[];
    interval: number;
    mode: MultimodalTravelMode_multimodalTravelMode | undefined;
}

interface TimeMarker {
    time: number;
    isMain: boolean;
    isPrevious?: boolean;
    isNext?: boolean;
}

export interface TimeTableSegment {
    startTime: string;
    endTime: string;
    interval: number;
    description: string;
    startTimeTimestamp: number;
    endTimeTimestamp: number;
}

const formatTime = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60) % 24; // Wrap around 24 hours
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const MARKER_WIDTH = 13; // Width of each time marker in pixels

const getCurrentTimeInMinutes = (): number => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
};

// Helper function to floor time to the nearest interval boundary
const floorToInterval = (timeInMinutes: number, interval: number): number => {
    return Math.floor(timeInMinutes / interval) * interval;
};

// Helper function to ceil time to the nearest interval boundary
const ceilToInterval = (timeInMinutes: number, interval: number): number => {
    return Math.ceil(timeInMinutes / interval) * interval;
};

const calculateTimePosition = (currentTime: number, timeMarkers: TimeMarker[]): number => {
    if (timeMarkers.length === 0) return 0;

    const firstMarker = timeMarkers[0];
    const lastMarker = timeMarkers[timeMarkers.length - 1];

    if (!firstMarker || !lastMarker) return 0;

    const startTime = firstMarker.time;
    const endTime = lastMarker.time;

    // If current time is outside the range, clamp it to the bounds
    const clampedTime = Math.max(startTime, Math.min(endTime, currentTime));

    // Calculate position based on time progression
    const timeRange = endTime - startTime;
    const timeProgress = timeRange > 0 ? (clampedTime - startTime) / timeRange : 0;

    // Total width is number of markers * marker width (40px each)
    const totalWidth = timeMarkers.length * MARKER_WIDTH;

    return timeProgress * totalWidth;
};

// Function to check if current time falls within a segment (with buffer)
const checkIfCurrentTimeInSegment = (segmentStartTime: number, segmentEndTime: number): boolean => {
    const currentTime = new Date();
    const currentHours = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    const bufferMinutes = 5; // 5-minute buffer for current segment detection

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

const getCurrentSegment = (segments: TimeTableSegment[]) => {
    return (
        segments.find(segment => checkIfCurrentTimeInSegment(segment.startTimeTimestamp, segment.endTimeTimestamp)) ||
        null
    );
};

// Convert timestamp to minutes since midnight
const timestampToMinutes = (timestamp: number): number => {
    const date = new Date(timestamp);
    return date.getHours() * 60 + date.getMinutes();
};

// Find the current and next metro times
const getCurrentAndNextMetroTimes = (times: TimeEntry[], currentTime: number) => {
    const sortedTimes = [...times]
        .map(item => ({
            ...item,
            timeInMinutes: timestampToMinutes(item.time),
        }))
        .sort((a, b) => a.timeInMinutes - b.timeInMinutes);

    const currentMetroTime = sortedTimes.find(
        item => Math.abs(item.timeInMinutes - currentTime) <= 2, // Within 2 minutes
    );

    const nextMetroTime = sortedTimes.find(item => item.timeInMinutes > currentTime);
    // Check if there is no metro for the next couple of hours (e.g., 2 hours)
    const isNoMetroForNextCoupleHours = (() => {
        const TWO_HOURS = 120;
        // Find the next metro time after currentTime
        const nextMetro = sortedTimes.find(item => item.timeInMinutes > currentTime);
        // If no next metro, or the next metro is more than 2 hours away, return true
        if (!nextMetro) return true;
        return nextMetro.timeInMinutes - currentTime > TWO_HOURS;
    })();
    return { currentMetroTime, nextMetroTime, allTimes: sortedTimes, isNoMetroForNextCoupleHours };
};

export const MiniTimeTableSchedule = ({ interval, times, mode }: TimeTableScheduleProps) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const [currentTime, setCurrentTime] = useState<number>(getCurrentTimeInMinutes());
    const [containerWidth, setContainerWidth] = useState(0);
    const { toleranceForGroupingTimeSegments } = useAppSelector(selectNewFeatureFlags);

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const processedSegments = groupTimesByInterval(
        times,
        false,
        mode,
        toleranceForGroupingTimeSegments,
        userLanguageStrings,
    );
    const currentSegment = useMemo(() => getCurrentSegment(processedSegments), [processedSegments, currentTime]);

    const { currentMetroTime, nextMetroTime, allTimes, isNoMetroForNextCoupleHours } = getCurrentAndNextMetroTimes(
        times,
        currentTime,
    );

    // Dynamic time range with interval-aligned boundaries
    const startMinutes = useMemo(() => {
        const oneHourBefore = currentTime - 60;
        return floorToInterval(oneHourBefore, interval);
    }, [currentTime, interval]);

    const endMinutes = useMemo(() => {
        const twoHoursAfter = currentTime + 120;
        return ceilToInterval(twoHoursAfter, interval);
    }, [currentTime, interval]);

    const timeMarkers = useMemo(() => {
        const mainMarkers: TimeMarker[] = Array.from(
            { length: Math.floor((endMinutes - startMinutes) / interval) + 1 },
            (_, index) => ({
                time: startMinutes + interval * index,
                isMain: true,
                isPrevious: false,
                isNext: false,
            }),
        );

        const subMarkers: TimeMarker[] = mainMarkers.slice(0, -1).flatMap((_, mainIndex) => {
            return Array.from({ length: 4 }, (__, subIndex) => ({
                time: startMinutes + interval * mainIndex + (interval * (subIndex + 1)) / 5,
                isMain: false,
                isPrevious: false,
                isNext: false,
            }));
        });

        const allMarkers = [...mainMarkers, ...subMarkers].sort((a, b) => a.time - b.time);

        // Find the previous and next main markers relative to current time
        const mainMarkersOnly = allMarkers.filter(marker => marker.isMain);
        const previousMainMarker: TimeMarker | null = mainMarkersOnly.reduce(
            (prev: TimeMarker | null, curr) =>
                curr.time <= currentTime && (!prev || curr.time > prev.time) ? curr : prev,
            null,
        );
        const nextMainMarker = mainMarkersOnly.find(marker => marker.time > currentTime) || null;

        // Update the markers with previous and next flags
        return allMarkers.map((marker: TimeMarker) => ({
            ...marker,
            isPrevious: marker === previousMainMarker,
            isNext: marker === nextMainMarker,
        }));
    }, [startMinutes, endMinutes, interval, currentTime]);

    // Calculate current time position relative to the timeline
    const currentTimePosition = useMemo(() => {
        return calculateTimePosition(currentTime, timeMarkers);
    }, [currentTime, timeMarkers]);

    const handleLayout = (event: LayoutChangeEvent) => {
        setContainerWidth(event.nativeEvent.layout.width);
    };

    // Update current time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(getCurrentTimeInMinutes());
        }, 120000); // Update every 2 minutes

        return () => clearInterval(timer);
    }, []);

    // Auto-scroll to keep current time centered
    useEffect(() => {
        if (!scrollViewRef.current || containerWidth === 0) return;

        const scrollPosition = Math.max(0, currentTimePosition - containerWidth / 2);

        // Scroll to position after a short delay to ensure layout is complete
        const timeoutId = setTimeout(() => {
            scrollViewRef.current?.scrollTo({ x: scrollPosition, animated: true });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [currentTimePosition, containerWidth]);

    return (
        <Animated.View
            style={[
                tailwind.style(' bg-white mx-5 rounded-[32px] pt-6 ', mode === 'Subway' ? 'mt-[480px]' : 'mt-[440px]'),
                styles.cardItem,
            ]}>
            {currentMetroTime && currentSegment ? (
                <View style={tailwind.style('px-6 pb-6')}>
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        {currentSegment.startTime} - {currentSegment.endTime}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[18px] pt-2 text-[#969696] pr-24',
                        )}>
                        {currentSegment.description}
                    </Animated.Text>
                </View>
            ) : isNoMetroForNextCoupleHours ? (
                <View style={tailwind.style('px-6 pb-6')}>
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        {userLanguageStrings.OutOfServiceHours}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[18px] pt-2 text-[#969696] pr-24',
                        )}>
                        {userLanguageStrings.ServicesClosedNextAvailableFrom(
                            getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings),
                            formatTime(allTimes[0]?.timeInMinutes || 0),
                        )}
                    </Animated.Text>
                </View>
            ) : nextMetroTime && !isNoMetroForNextCoupleHours ? (
                <View style={tailwind.style('px-6 pb-6')}>
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        {userLanguageStrings.NextModeAtTime(
                            getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings),
                            formatTime(nextMetroTime.timeInMinutes),
                        )}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold leading-[18px] pt-2 text-[#969696] pr-24',
                        )}>
                        {userLanguageStrings.NextModeArrivesInMinutes(
                            getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings),
                            nextMetroTime.timeInMinutes - currentTime,
                        )}
                    </Animated.Text>
                </View>
            ) : allTimes.length > 0 ? (
                <View style={tailwind.style('px-6 pb-6')}>
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        {userLanguageStrings.NextModeAvailableFrom(
                            getUIDisplayTravelMode(mode) ?? '',
                            formatTime(allTimes[0]?.timeInMinutes || 0),
                        )}
                    </Animated.Text>
                </View>
            ) : null}
            <View style={tailwind.style('relative overflow-hidden px-6')} onLayout={handleLayout}>
                <ScrollView
                    ref={scrollViewRef}
                    style={tailwind.style('bg-transparent h-[114px] overflow-visible')}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={tailwind.style('bg-transparent pt-[34px]')}>
                    {/* Current time indicator - positioned absolutely within the scrollable content */}
                    <View
                        style={[
                            tailwind.style('absolute top-0 z-20 h-10'),
                            {
                                left: currentTimePosition,
                                transform: [{ translateX: -1 }, { translateY: 34 }], // Center the 2px line
                            },
                        ]}>
                        <View style={tailwind.style('w-[2px] h-[18px] bg-[#FF5733] rounded-[3px]')} />
                    </View>

                    <View
                        style={[
                            tailwind.style('absolute z-20 top-6 w-18 h-8 bg-[#FFEB87] rounded-[12px]'),
                            {
                                left: currentTimePosition,
                                transform: [{ translateX: -32 }, { translateY: 34 }],
                            },
                            styles.timeCard,
                        ]}>
                        <View style={tailwind.style('flex-row justify-center h-full items-center')}>
                            <Svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                                <Path
                                    d="M6 1.5C8.4795 1.5 10.5 3.5205 10.5 6C10.5 8.4795 8.4795 10.5 6 10.5C3.5205 10.5 1.5 8.4795 1.5 6C1.5 3.5205 3.5205 1.5 6 1.5ZM6 2.40039C4.0155 2.40039 2.40039 4.0155 2.40039 6C2.40039 7.9845 4.0155 9.59961 6 9.59961C7.9845 9.59961 9.59961 7.9845 9.59961 6C9.59961 4.0155 7.9845 2.40039 6 2.40039ZM6 3.75V5.45996H7.70996V6.36035H5.09961V3.75H6Z"
                                    fill="#3B3A3C"
                                />
                            </Svg>
                            <Text
                                style={tailwind.style(
                                    'text-[13.5px] font-departureMono-regular -tracking-[0.78px] leading-[24px] text-[#3B3A3C] pl-0.5',
                                )}>
                                {formatTime(currentTime)}
                            </Text>
                        </View>
                    </View>
                    <View style={tailwind.style('flex-row relative')}>
                        {timeMarkers.map((marker, index) => (
                            <View key={index} style={tailwind.style('items-center')}>
                                <View
                                    style={[
                                        tailwind.style('rounded-[3px]'),
                                        marker.isMain
                                            ? tailwind.style('h-[18px] w-[2px]')
                                            : tailwind.style('h-3 w-[2px]'),
                                        marker.time <= currentTime
                                            ? tailwind.style('bg-[#C9C9C9]')
                                            : tailwind.style('bg-[#969696]'),
                                    ]}
                                />
                                {marker.isMain && (
                                    <Animated.View style={tailwind.style('absolute w-10 top-7')}>
                                        <Text
                                            style={tailwind.style(
                                                'text-xs text-center font-areaNormal-extrabold tracking-[0.2px] leading-[20px] mt-[1px]',
                                                marker.time <= currentTime ? 'text-[#C9C9C9]' : 'text-[#7E7E7E]',
                                            )}>
                                            {formatTime(marker.time)}
                                        </Text>
                                    </Animated.View>
                                )}
                                <View style={tailwind.style(`w-[${MARKER_WIDTH}px]`)} />
                            </View>
                        ))}
                    </View>
                    <MetroMarkers times={allTimes} timeMarkers={timeMarkers} currentTime={currentTime} mode={mode} />
                </ScrollView>
            </View>
        </Animated.View>
    );
};

const MetroMarkers = ({
    times,
    timeMarkers,
    currentTime,
    mode,
}: {
    times: TimeEntry[];
    timeMarkers: TimeMarker[];
    currentTime: number;
    mode: MultimodalTravelMode_multimodalTravelMode | undefined;
}) => {
    if (timeMarkers.length === 0) return null;

    const firstMarker = timeMarkers[0];
    const lastMarker = timeMarkers[timeMarkers.length - 1];
    if (!firstMarker || !lastMarker) return null;

    const startTime = firstMarker.time;
    const endTime = lastMarker.time;
    const timeRange = endTime - startTime;
    const totalWidth = timeMarkers.length * 13;

    return (
        <>
            {times.map(metroTime => {
                const metroTimeInMinutes = timestampToMinutes(metroTime.time);

                // Only show metro markers within the visible time range
                if (metroTimeInMinutes < startTime || metroTimeInMinutes > endTime) {
                    return null;
                }

                const timeProgress = timeRange > 0 ? (metroTimeInMinutes - startTime) / timeRange : 0;
                const position = timeProgress * totalWidth;

                const isPast = metroTimeInMinutes <= currentTime;
                const isCurrent = Math.abs(metroTimeInMinutes - currentTime) <= 2; // Within 2 minutes

                return (
                    <View
                        key={metroTime.id}
                        style={[
                            tailwind.style('absolute top-0 z-10'),
                            {
                                left: position,
                                transform: [{ translateX: -14 }], // Center the 12px circle
                            },
                        ]}>
                        {mode && (
                            <View
                                style={[
                                    tailwind.style(
                                        'w-7 h-7 justify-center items-center rounded-full border-2 border-white shadow-sm',
                                    ),
                                    isCurrent
                                        ? tailwind.style(`bg-[${getIconBGFromType(mode)}]`)
                                        : isPast
                                          ? tailwind.style('bg-[#F4F4F4] border border-white')
                                          : tailwind.style(`bg-[${getIconBGFromType(mode)}] border border-white`),
                                ]}>
                                {getIconFromType(
                                    mode,
                                    16,
                                    isCurrent ? '#1F2D3D' : isPast ? '#969696' : '#1F2D3D',
                                    false,
                                )}
                            </View>
                        )}
                    </View>
                );
            })}
        </>
    );
};

const styles = StyleSheet.create({
    cardItem: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        shadowOpacity: 0.075,
        elevation: 5,
    },
    timeCard: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 2,
        shadowOpacity: 0.03,
        elevation: 5,
        borderWidth: 4,
        borderColor: 'white',
    },
});
