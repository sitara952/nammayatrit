import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import React from 'react';
import { Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { TimeTableContainer } from '../../../TimeTable';
import { DetailedLiveHeader, DetailedLiveHeaderProps } from '../../components/DetailedLiveJourney/DetailedLiveHeader';
import { ExpandCollapseTrackingButton } from './components/ExpandCollapseTrackingButton';
import { formatTime } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface StopMapping {
    stopName: string;
    distance: string;
    lat: number;
    lon: number;
}

export interface TimeEntry {
    id: number;
    time: number;
}

export interface TransitTimetableUIProps {
    detailedLiveHeaderProps: DetailedLiveHeaderProps;
    onHideDetails: () => void;
    times: TimeEntry[];
    firstTime: number | string;
    lastTime: number | string;
    destination: string;
    source: string;
}

export const TransitTimetableUI = ({
    detailedLiveHeaderProps,
    onHideDetails,
    times,
    firstTime,
    lastTime,
}: TransitTimetableUIProps) => {
    const configManger = useConfigContext();
    const userLanguageStrings = configManger.get('userLanguageStrings');
    const { bottom, top } = useSafeAreaInsets();
    const MAX_CONTAINER_HEIGHT = SCREEN_HEIGHT - 71 - bottom - 93 - 68 - (Platform.OS === 'android' ? 70 : 20);
    return (
        <Animated.View style={tailwind.style('flex-1 bg-white', `pb-[${bottom}px] pt-[${top + 12}px]`)}>
            <DetailedLiveHeader {...detailedLiveHeaderProps} />
            <TimeTableContainer
                backgroundColor="#FBFBFB"
                times={times
                    .map(time => ({
                        ...time,
                        time: formatTime(time.time),
                    }))
                    .filter((time, index, self) => self.findIndex(t => t.time === time.time) === index)}
                firstTime={formatTime(firstTime)}
                lastTime={formatTime(lastTime)}
                maxContainerHeight={MAX_CONTAINER_HEIGHT}
            />

            <Animated.View style={tailwind.style('justify-end flex-1')}>
                <ExpandCollapseTrackingButton
                    buttonText={userLanguageStrings.HideDetails}
                    onPress={onHideDetails}
                    isExpanded={false}
                />
            </Animated.View>
        </Animated.View>
    );
};
