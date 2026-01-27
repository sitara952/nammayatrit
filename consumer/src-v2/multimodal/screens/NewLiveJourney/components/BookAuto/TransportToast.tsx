import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import LoadingSpinner from '../../assets/svg/LoadingSpinner';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import busImage from '../../../../../assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import metroImage from '../../../../../assets/3D-assets/mt_ic_metro_live_tracking.webp';
import trainImage from '../../../../../assets/mt_ic_multimodal_train_alternate.webp';
import { strings } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type TransportType = 'bus' | 'train' | 'metro';
export type RightElementType = 'TRACKBTN' | 'TIMETABLEBTN' | 'LOADER' | 'TIMER' | 'SWITCHBTN';
export type TransportState = 'normal' | 'missed';

interface TransportToastProps {
    type: TransportType;
    description: string;
    rightElementType: RightElementType;
    state: TransportState;
    onTrackPress?: () => void;
    timerValue?: string;
    onTimerEnd?: () => void;
}

const getTransportConfig = (type: TransportType) => {
    switch (type) {
        case 'bus':
            return {
                image: busImage,
                backgroundColor: '#FFF3E0',
                width: 120,
                height: 98,
            };
        case 'train':
            return {
                image: trainImage,
                backgroundColor: '#E8F5E8',
                width: 100,
                height: 68,
            };
        case 'metro':
            return {
                image: metroImage,
                backgroundColor: '#E3F2FD',
                width: 100,
                height: 80,
            };
        default:
            return {
                image: busImage,
                backgroundColor: '#FFF3E0',
                width: 120,
                height: 98,
            };
    }
};

const MissedIcon = () => (
    <Svg width="19" height="19" viewBox="0 0 19 19" fill="none">
        <Circle cx="9.5" cy="9.5" r="9.5" fill="#F24649" />
        <Path d="M8.01562 4.75452H10.9844L10.6875 11.2858H8.3125L8.01562 4.75452Z" fill="white" />
        <Rect x="8.31152" y="13.0682" width="2.375" height="2.375" fill="white" />
    </Svg>
);

export const TimerComponent = ({
    initialTime,
    onTimerEnd,
}: {
    initialTime: string;
    onTimerEnd: (() => void) | undefined;
}) => {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Convert time string (MM:SS) to total seconds
    const parseTimeString = (timeStr: string): number => {
        const parts = timeStr.split(':');
        if (parts.length === 2 && parts[0] && parts[1]) {
            const minutes = parseInt(parts[0], 10) || 0;
            const seconds = parseInt(parts[1], 10) || 0;
            return minutes * 60 + seconds;
        }
        return 0;
    };

    // Convert seconds back to MM:SS format
    const formatTime = (totalSeconds: number): string => {
        if (totalSeconds <= 0) return '00:00';
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // Initialize timer with parsed time
        const initialSeconds = parseTimeString(initialTime);
        setTimeLeft(initialSeconds);

        // Start countdown
        intervalRef.current = setInterval(() => {
            setTimeLeft(prevTime => {
                if (prevTime <= 1) {
                    // Timer reached 0, clear interval and call callback
                    if (intervalRef.current) {
                        clearInterval(intervalRef.current);
                        intervalRef.current = null;
                    }
                    if (onTimerEnd) {
                        onTimerEnd();
                    }
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        // Cleanup function
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, [initialTime]);

    return (
        <View style={tailwind.style('min-w-[60px] justify-center items-center')}>
            <Text style={tailwind.style('text-[23px] font-bold text-[#3B3A3C] text-center font-departureMono-regular')}>
                {formatTime(timeLeft)}
            </Text>
        </View>
    );
};

const TransportIconComponent = ({ type, state }: { type: TransportType; state: TransportState }) => {
    const config = getTransportConfig(type);

    return (
        <View style={tailwind.style(`w-8 h-8 ml-1.8 justify-center items-center rounded-lg relative`)}>
            <Image
                accessible={false}
                source={config.image}
                style={[
                    tailwind.style(`w-[${config.width}px] h-[${config.height}px]`),
                    type === 'train' && { transform: [{ scaleX: -1 }], marginLeft: 10 },
                ]}
                resizeMode="contain"
            />

            {/* Missed State Overlay */}
            {state === 'missed' && (
                <View style={tailwind.style('absolute -bottom-2 left-0 w-[19px] h-[19px]')}>
                    <MissedIcon />
                </View>
            )}
        </View>
    );
};

const TrackButton = ({
    onPress,
    userLangaugeStrings,
}: {
    onPress: (() => void) | undefined;
    userLangaugeStrings: strings;
}) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    return (
        <Pressable
            testID="transport-toast-track-button"
            accessibilityLabel="Track button"
            onPress={onPress}
            accessibilityRole="button"
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style('bg-[#3B3A3C] rounded-[20px] px-4 py-2 min-w-[60px] justify-center items-center'),
                    animatedStyle,
                ]}>
                <Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-white text-center')}>
                    {userLangaugeStrings.Track}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const TimetableButton = ({
    onPress,
    userLangaugeStrings,
}: {
    onPress: (() => void) | undefined;
    userLangaugeStrings: strings;
}) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    return (
        <Pressable
            testID="transport-toast-timetable-button"
            accessibilityLabel="Timetable button"
            onPress={onPress}
            accessibilityRole="button"
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        'bg-[#3B3A3C] rounded-[20px] px-[12px] py-[6px] min-w-[80px] justify-center items-center',
                    ),
                    animatedStyle,
                ]}>
                <Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-white text-center')}>
                    {userLangaugeStrings.Timetable}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const SwitchButton = ({
    onPress,
    userLangaugeStrings,
}: {
    onPress: (() => void) | undefined;
    userLangaugeStrings: strings;
}) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    return (
        <Pressable
            testID="transport-toast-switch-button"
            accessibilityLabel="Switch button"
            onPress={onPress}
            accessibilityRole="button"
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style('bg-[#3B3A3C] rounded-[20px] px-4 py-2 min-w-[60px] justify-center items-center'),
                    animatedStyle,
                ]}>
                <Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-white text-center')}>
                    {userLangaugeStrings.Switch}
                </Text>
            </Animated.View>
        </Pressable>
    );
};

const RightElementComponent = ({
    type,
    onTrackPress,
    timerValue,
    onTimerEnd,
    userLangaugeStrings,
}: {
    type: RightElementType;
    onTrackPress: (() => void) | undefined;
    timerValue: string | undefined;
    onTimerEnd: (() => void) | undefined;
    userLangaugeStrings: strings;
}) => {
    switch (type) {
        case 'TRACKBTN':
            return <TrackButton onPress={onTrackPress} userLangaugeStrings={userLangaugeStrings} />;

        case 'TIMETABLEBTN':
            return <TimetableButton onPress={onTrackPress} userLangaugeStrings={userLangaugeStrings} />;

        case 'LOADER':
            return (
                <View style={tailwind.style('w-[60px] h-[32px] justify-center items-center')}>
                    <View style={tailwind.style('w-5 h-5')}>
                        <LoadingSpinner />
                    </View>
                </View>
            );

        case 'TIMER':
            return <TimerComponent initialTime={timerValue || '00:00'} onTimerEnd={onTimerEnd} />;

        case 'SWITCHBTN':
            return <SwitchButton onPress={onTrackPress} userLangaugeStrings={userLangaugeStrings} />;

        default:
            return null;
    }
};

export const TransportToast: React.FC<TransportToastProps> = ({
    type,
    description,
    rightElementType,
    state,
    onTrackPress,
    timerValue,
    onTimerEnd,
}) => {
    const backgroundColor = state === 'missed' ? '#FFE688' : '#F7F7F7';
    const configManager = useConfigContext();
    const userLangaugeStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind.style('mx-6')}>
            <Animated.View
                style={tailwind.style(
                    `overflow-hidden pr-4 flex-row items-center bg-[${backgroundColor}] h-16 rounded-[20px] my-2 w-full shadow-md flex items-center justify-between`,
                )}>
                {/* Transport Icon */}
                <View style={tailwind.style(' ')}>
                    <TransportIconComponent type={type} state={state} />
                </View>

                {/* Text Content */}
                <View style={tailwind.style('w-[50%] ')}>
                    <Typography
                        style={tailwind.style('text-[13px] font-extrabold text-[#3B3A3C] leading-[19.5px]  ')}
                        type={'callout'}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {description}
                    </Typography>
                </View>

                {/* Right Element */}
                <RightElementComponent
                    type={rightElementType}
                    onTrackPress={onTrackPress}
                    timerValue={timerValue}
                    onTimerEnd={onTimerEnd}
                    userLangaugeStrings={userLangaugeStrings}
                />
            </Animated.View>
        </View>
    );
};

export default TransportToast;
