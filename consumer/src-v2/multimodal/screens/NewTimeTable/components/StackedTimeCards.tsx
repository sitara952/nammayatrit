import { Pressable } from '@/src-v2/primitives/Pressable';
import { getUIDisplayTravelMode } from '@/src-v2/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    FadeOut,
    interpolate,
    SlideInLeft,
    SlideInRight,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    ZoomIn,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Path, Rect } from 'react-native-svg';
import mtIcBusSideView from '../../../../assets/3D-assets/mt_ic_bus_side_view.webp';
import mtIcMetroSideView from '../../../../assets/3D-assets/mt_ic_metro_side_view.webp';
import mtIcTrainSideView from '../../../../assets/3D-assets/mt_ic_train_side_view.webp';
import mtIcTrainLight from '../../../../assets/mt_ic_train_light.png';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { TimeTableInfo } from '../types';
import { SwipeCard, SwipeCardRef } from './SwipeCard';
import { strings } from 'config-types';
import { getUserLanguageStringsForMode } from '@/src-v2/multimodal/utils/BusServiceUtils';

interface BaseStackedTimeCardsProps {
    timeTableInfoList: TimeTableInfo[];
    source: string;
    refreshStack: () => void;
    towardsJunction: string | undefined;
    displayTimeType: 'timer' | 'timerWithJustMins' | 'time';
    swipeDisabled: boolean;
    isNightMode: boolean;
}

interface PreboardingStackedTimeCardsProps extends BaseStackedTimeCardsProps {
    variant: 'preboarding';
    checkIn: () => void;
}

interface TimetableStackedTimeCardsProps extends BaseStackedTimeCardsProps {
    variant: 'timetable';
}

export type StackedTimeCardsProps = PreboardingStackedTimeCardsProps | TimetableStackedTimeCardsProps;

interface BaseTimeCardProps {
    timeTableInfo: TimeTableInfo;
    isNextImmediate?: boolean;
    isAccessible: boolean;
    source: string;
    refreshStack: () => void;
    towardsJunction: string | undefined;
    displayTimeType: 'timer' | 'timerWithJustMins' | 'time';
    isNightMode: boolean;
    userLanguageStrings: strings;
}

interface PreboardingTimeCardProps extends BaseTimeCardProps {
    variant: 'preboarding';
    checkIn: () => void;
}

interface TimetableTimeCardProps extends BaseTimeCardProps {
    variant: 'timetable';
}

type TimeCardProps = PreboardingTimeCardProps | TimetableTimeCardProps;

interface TimerProps {
    targetTime: number;
    refreshStack: () => void;
    displayTimeType: 'timer' | 'timerWithJustMins';
    isNightMode: boolean;
    mode: string;
    userLanguageStrings: strings;
}

const Timer = ({ targetTime, refreshStack, displayTimeType, isNightMode, mode, userLanguageStrings }: TimerProps) => {
    // Initialize with correct value to avoid showing "00:00" initially
    const [secondsLeft, setSecondsLeft] = useState<number>(() => {
        const now = Date.now();
        const difference = targetTime - now;
        return difference > 0 ? Math.floor(difference / 1000) : 0;
    });

    const [hasTriggeredRefresh, setHasTriggeredRefresh] = useState(false);
    const refreshStackRef = useRef(refreshStack);

    // Keep ref updated with latest refreshStack function
    refreshStackRef.current = refreshStack;

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = Date.now();
            const target = targetTime;
            const difference = target - now;

            if (difference <= 0) {
                setSecondsLeft(0);

                // Only trigger refresh once and add a delay
                if (!hasTriggeredRefresh) {
                    setHasTriggeredRefresh(true);
                    setTimeout(
                        () => {
                            refreshStackRef.current();
                        },
                        mode === 'Subway' ? 45000 : 120000,
                    );
                }
                return;
            }

            const seconds = Math.floor(difference / 1000);
            setSecondsLeft(seconds);
        };

        calculateTimeLeft();

        // Always set up interval to continue monitoring
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }, [targetTime, hasTriggeredRefresh]);

    // Reset hasTriggeredRefresh when targetTime changes (new timer)
    useEffect(() => {
        setHasTriggeredRefresh(false);
    }, [targetTime]);

    const formatTimer = (seconds: number, displayTimeType: 'timer' | 'timerWithJustMins') => {
        const minutes = Math.floor(seconds / 60) + (displayTimeType === 'timerWithJustMins' ? 1 : 0);
        const remainingSeconds = seconds % 60;
        if (displayTimeType === 'timerWithJustMins') {
            return `${minutes.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    };

    return (
        <>
            {/* <Animated.Text
                numberOfLines={1}
                style={tailwind.style(
                    'text-[17px] font-areaNormal-extrabold tracking-[0.2px] leading-[28px] text-center text-[#313131] px-7.5',
                )}>
                arrives {secondsLeft > 0 ? 'in' : ''}
            </Animated.Text> */}
            {secondsLeft === 0 ? (
                <Animated.View
                    entering={ZoomIn.springify().damping(40).stiffness(240)}
                    exiting={FadeOut.duration(250)}
                    style={tailwind.style('min-h-[137px] justify-center items-center')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[70px] font-departureMono-regular leading-[73px] -tracking-[0.78px] text-center pt-6',
                            isNightMode ? 'text-[#00C81E]' : 'text-[#09941E]',
                        )}>
                        {userLanguageStrings.Now}
                    </Animated.Text>
                </Animated.View>
            ) : null}
            {secondsLeft > 0 ? (
                <Animated.View
                    entering={ZoomIn.springify().damping(40).stiffness(240)}
                    exiting={FadeOut.duration(250)}
                    style={tailwind.style('min-h-[137px] justify-center items-center')}>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[70px] font-departureMono-regular leading-[73px] -tracking-[0.78px] text-center pt-6',
                            isNightMode ? 'text-[#00C81E]' : 'text-[#09941E]',
                        )}>
                        {formatTimer(secondsLeft, displayTimeType)}
                    </Animated.Text>
                    {displayTimeType === 'timerWithJustMins' ? (
                        <Animated.Text
                            style={tailwind.style(
                                'text-[25px] font-departureMono-regular tracking-[0.2px] leading-[20px] text-center text-[#C9C9C9] pt-5  uppercase',
                            )}>
                            {userLanguageStrings.Mins}
                        </Animated.Text>
                    ) : null}
                </Animated.View>
            ) : null}
        </>
    );
};

const formatTimeWithAMPM = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
};

const getMinutesDiff = (targetTime: number): number => {
    const now = Date.now();
    const diffMs = targetTime - now;
    return Math.max(0, Math.round(diffMs / 60000));
};

const TimeCard = ({
    timeTableInfo,
    isNextImmediate = false,
    isAccessible,
    source,
    refreshStack,
    variant,
    towardsJunction,
    displayTimeType,
    isNightMode,
    userLanguageStrings,
    ...props
}: TimeCardProps) => {
    const { mode } = timeTableInfo;
    const isMoreThan40Minutes = timeTableInfo.time - Date.now() > 40 * 60 * 1000;
    const checkInHandler = variant === 'preboarding' && 'checkIn' in props ? props.checkIn : undefined;

    return (
        <Animated.View style={[tailwind.style('absolute w-full')]}>
            <Animated.View
                style={[
                    tailwind.style('mx-5 rounded-[32px] mt-4', isNightMode ? 'bg-[#3B3A3C]' : 'bg-white'),
                    styles.cardItem,
                ]}>
                <Animated.View
                    style={tailwind.style(
                        'relative overflow-hidden border-b-[2px] border-[#7E7E7E] mb-6 pt-5',
                        mode === 'Subway' ? 'border-b-0 pt-0' : '',
                    )}>
                    {mode === 'Metro' ? (
                        <Animated.Image
                            accessible={isAccessible}
                            accessibilityLabel={isAccessible ? 'metro transit tracking image' : undefined}
                            entering={SlideInLeft.springify().damping(25).stiffness(300)}
                            source={mtIcMetroSideView}
                            resizeMode={'cover'}
                            style={tailwind.style('h-[100px] w-full -left-1/2')}
                        />
                    ) : null}
                    {mode === 'Bus' ? (
                        <Animated.Image
                            accessible={isAccessible}
                            accessibilityLabel={isAccessible ? 'bus transit tracking image' : undefined}
                            entering={SlideInLeft.springify().damping(25).stiffness(300)}
                            source={mtIcBusSideView}
                            resizeMode={'contain'}
                            style={tailwind.style('h-[100px] w-full -left-1/2')}
                        />
                    ) : null}
                </Animated.View>
                <Animated.Text
                    accessible={isAccessible}
                    accessibilityLabel={isAccessible ? `${source} text` : undefined}
                    numberOfLines={2}
                    style={tailwind.style(
                        'text-[17px] font-areaNormal-extrabold tracking-[0.2px] leading-[28px] text-center px-7.5',
                        isNightMode ? 'text-[#F7F7F7]' : 'text-[#313131]',
                    )}>
                    {getUserLanguageStringsForMode(getUIDisplayTravelMode(mode) ?? '', userLanguageStrings)}{' '}
                    {userLanguageStrings.ArrivesAt} {'\n'}
                    {source}
                </Animated.Text>

                {isNextImmediate && (displayTimeType === 'timer' || displayTimeType === 'timerWithJustMins') ? (
                    isMoreThan40Minutes ? (
                        <Animated.View
                            entering={ZoomIn.springify().damping(40).stiffness(240)}
                            exiting={FadeOut.duration(250)}
                            style={tailwind.style('min-h-[137px] justify-center items-center')}>
                            <Animated.Text
                                accessible={isAccessible}
                                style={tailwind.style(
                                    'text-[58px] font-departureMono-regular leading-[61px] -tracking-[0.78px] text-center text-[#3B3A3C]',
                                    isNightMode ? 'text-[#F7F7F7]' : 'text-[#313131]',
                                )}>
                                {formatTimeWithAMPM(timeTableInfo.time)}
                            </Animated.Text>
                            <Animated.Text
                                accessible={isAccessible}
                                style={tailwind.style(
                                    'text-[25px] font-departureMono-regular tracking-[0.2px] leading-[20px] text-center text-[#C9C9C9] pt-5  uppercase',
                                )}>
                                {`${getMinutesDiff(timeTableInfo.time)} ${userLanguageStrings.Mins}`}
                            </Animated.Text>
                        </Animated.View>
                    ) : (
                        <Timer
                            targetTime={timeTableInfo.time}
                            refreshStack={refreshStack}
                            displayTimeType={displayTimeType}
                            isNightMode={isNightMode}
                            mode={mode || ''}
                            userLanguageStrings={userLanguageStrings}
                        />
                    )
                ) : (
                    <Animated.View
                        entering={ZoomIn.springify().damping(40).stiffness(240)}
                        exiting={FadeOut.duration(250)}
                        style={tailwind.style('min-h-[137px]')}>
                        <Animated.Text
                            accessible={isAccessible}
                            style={tailwind.style(
                                'text-[58px] font-departureMono-regular leading-[61px] -tracking-[0.78px] text-center text-[#3B3A3C] pt-6',
                                isNightMode ? 'text-[#F7F7F7]' : 'text-[#313131]',
                            )}>
                            {formatTimeWithAMPM(timeTableInfo.time)}
                        </Animated.Text>
                        <Animated.Text
                            accessible={isAccessible}
                            style={tailwind.style(
                                'text-[25px] font-departureMono-regular tracking-[0.2px] leading-[20px] text-center text-[#C9C9C9] pt-5  uppercase',
                            )}>
                            {userLanguageStrings.In}{' '}
                            {`${getMinutesDiff(timeTableInfo.time)} ${userLanguageStrings.Mins}`}
                        </Animated.Text>
                    </Animated.View>
                )}

                <Animated.View style={tailwind.style('flex-row justify-center items-center')}>
                    <Animated.Text
                        accessible={isAccessible}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold tracking-[0.2px] leading-[21px] text-center',
                            isNightMode ? 'text-[#F7F7F7]' : 'text-[#656565]',
                        )}>
                        {timeTableInfo.info}
                    </Animated.Text>
                    {isNextImmediate ? (
                        <Svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            style={tailwind.style('ml-1 mt-0.5')}>
                            <G clipPath="url(#clip0_13242_14168)">
                                <Path
                                    d="M6.99805 0.890625C10.3708 0.890776 13.1045 3.62526 13.1045 6.99805C13.1043 10.3707 10.3707 13.1043 6.99805 13.1045C3.62526 13.1045 0.890776 10.3708 0.890625 6.99805C0.890625 3.62517 3.62517 0.890625 6.99805 0.890625ZM6.99805 2.39062C4.45359 2.39062 2.39062 4.45359 2.39062 6.99805C2.39078 9.54237 4.45369 11.6045 6.99805 11.6045C9.54228 11.6043 11.6043 9.54228 11.6045 6.99805C11.6045 4.45369 9.54237 2.39078 6.99805 2.39062ZM7.75 6.25391H9.67383V7.75391H7.04297C6.8202 7.75391 6.6573 7.66012 6.56836 7.5918C6.48094 7.52455 6.42576 7.45254 6.39746 7.41211C6.36648 7.36785 6.34487 7.32842 6.33203 7.30273C6.32527 7.2892 6.31998 7.27687 6.31543 7.2666C6.31314 7.26144 6.31045 7.25637 6.30859 7.25195C6.30765 7.24971 6.30651 7.24718 6.30566 7.24512C6.30527 7.24415 6.30506 7.24312 6.30469 7.24219V7.24023H6.30371V7.23926L6.25 7.10547V3.875H7.75V6.25391Z"
                                    fill={isNightMode ? '#F7F7F7' : '#656565'}
                                />
                            </G>
                            <Defs>
                                <ClipPath id="clip0_13242_14168">
                                    <Rect width="14" height="14" fill="white" />
                                </ClipPath>
                            </Defs>
                        </Svg>
                    ) : null}

                    <Animated.Text
                        accessible={isAccessible}
                        style={tailwind.style(
                            'text-[13px] font-areaNormal-extrabold tracking-[0.2px] leading-[21px] text-center pt-5 pb-4.5',
                            isNightMode ? 'text-[#F7F7F7]' : 'text-[#656565]',
                        )}>
                        {' '}
                        {isNextImmediate ? formatTimeWithAMPM(timeTableInfo.time) : ''}
                        {variant === 'preboarding' && isNextImmediate && !isMoreThan40Minutes ? ' |' : ''}
                    </Animated.Text>
                    {variant === 'preboarding' && isNextImmediate ? (
                        <Pressable
                            accessible={isAccessible}
                            accessibilityLabel="Check in"
                            accessibilityRole="button"
                            testID="manual-checkin"
                            hitSlop={10}
                            onPress={checkInHandler}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[13px] font-areaNormal-extrabold tracking-[0.2px] leading-[21px] text-center text-[#016ACD] pt-5 pb-4.5',
                                    isNightMode ? 'text-[#1E92FF]' : 'text-[#016ACD]',
                                )}>
                                {' '}
                                {userLanguageStrings.CheckIn}
                            </Animated.Text>
                        </Pressable>
                    ) : null}
                </Animated.View>
                {mode === 'Subway' ? (
                    <Animated.View style={tailwind.style('relative  overflow-hidden rounded-br-[32px]')}>
                        <Animated.View style={tailwind.style('absolute bottom-8 justify-center pl-7')}>
                            <Animated.Text
                                numberOfLines={2}
                                style={tailwind.style(
                                    'text-base font-areaNormal-extrabold text-[#C9C9C9] leading-[22px]',
                                    `max-w-[${SCREEN_WIDTH / 2}px]`,
                                )}>
                                {userLanguageStrings.Towards}
                                {'\n'}
                                {towardsJunction}
                            </Animated.Text>
                        </Animated.View>
                        <SubwayTrainSideView />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
};

const SubwayTrainSideView = () => {
    const appearAnimation = useSharedValue(0);
    const animatedLightStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(appearAnimation.value, [0, 0.3, 0.6, 1], [0, 1, 0, 1]),
        };
    });
    useEffect(() => {
        appearAnimation.value = withDelay(2500, withSpring(1, { damping: 10, stiffness: 100 }));
    }, []);
    return (
        <Animated.View
            entering={SlideInRight.springify().damping(25).stiffness(300)}
            style={tailwind.style('relative -mt-10 top-1')}>
            <Animated.Image
                accessible={false}
                resizeMode={'contain'}
                source={mtIcTrainLight}
                style={[
                    tailwind.style('absolute -top-2 right-0 h-[320px]'),
                    { aspectRatio: 204 / 228 },
                    animatedLightStyle,
                ]}
            />
            <Animated.Image
                accessible={false}
                source={mtIcTrainSideView}
                resizeMode={'cover'}
                style={[
                    tailwind.style('h-[200px]'),
                    {
                        aspectRatio: 1524 / 396,
                        transform: [{ scaleX: -1 }, { translateX: -(SCREEN_WIDTH / 2) + 48 }],
                    },
                ]}
            />
        </Animated.View>
    );
};

type CardWithId = TimeTableInfo & {
    id: string;
    originalIndex: number;
    refreshStack: () => void;
};

export const StackedTimeCards = ({
    timeTableInfoList,
    source,
    refreshStack,
    towardsJunction,
    displayTimeType,
    swipeDisabled,
    isNightMode,
    ...props
}: StackedTimeCardsProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const animatedPosition = useSharedValue(0);

    // Create stable cards array that never gets reordered
    const cards: CardWithId[] = timeTableInfoList.map((card, index) => ({
        ...card,
        id: `card-${index}-${card.mode}`,
        originalIndex: index,
        refreshStack,
    }));

    // Track the index of the card that should be at the front
    const [frontCardIndex, setFrontCardIndex] = useState(0);

    const cardRefs = useRef<Record<string, SwipeCardRef | null>>({});

    // Reset frontCardIndex to 0 when timeTableInfoList changes (e.g., on refresh)
    useEffect(() => {
        setFrontCardIndex(0);
    }, [timeTableInfoList]);

    // Calculate the visual position of a card in the stack
    const getCardStackPosition = (cardIndex: number) => {
        const totalCards = cards.length;
        const offset = (cardIndex - frontCardIndex + totalCards) % totalCards;
        return offset;
    };

    const handleCardSwiped = useCallback(
        (cardIndex: number) => (_direction: 'left' | 'right') => {
            // Move to the next card immediately
            setFrontCardIndex(prevIndex => (prevIndex + 1) % cards.length);

            // Reset the swiped card after animation completes
            setTimeout(() => {
                const cardId = cards[cardIndex]?.id;
                if (cardId) {
                    cardRefs.current[cardId]?.resetCard();
                }
            }, 600); // Wait for swipe animation to complete
        },
        [cards.length, cards],
    );

    return (
        <Animated.View style={tailwind.style('pt-4')}>
            {cards.map((timeTableInfo, index) => {
                const stackPosition = getCardStackPosition(index);
                const isNextImmediate = index === 0;
                const isAccessible = stackPosition === 0;

                const cardProps: TimeCardProps =
                    props.variant === 'preboarding'
                        ? {
                              variant: 'preboarding',
                              timeTableInfo,
                              isNextImmediate,
                              isAccessible,
                              source,
                              refreshStack,
                              checkIn: props.checkIn,
                              towardsJunction,
                              displayTimeType,
                              isNightMode,
                              userLanguageStrings,
                          }
                        : {
                              variant: 'timetable',
                              timeTableInfo,
                              isNextImmediate,
                              isAccessible,
                              source,
                              refreshStack,
                              towardsJunction,
                              displayTimeType,
                              isNightMode,
                              userLanguageStrings,
                          };

                return (
                    <SwipeCard
                        disabled={swipeDisabled}
                        ref={ref => {
                            cardRefs.current[timeTableInfo.id] = ref;
                        }}
                        animatedPosition={animatedPosition}
                        key={timeTableInfo.id}
                        onCardSwiped={handleCardSwiped(index)}
                        onCardRemoved={undefined}
                        currentIndex={0} // Always 0 for the front card
                        cardIndex={stackPosition} // Use stack position instead of array index
                        totalCards={cards.length}>
                        <Animated.View style={tailwind.style('w-full relative h-[1px]')}>
                            <TimeCard {...cardProps} />
                        </Animated.View>
                    </SwipeCard>
                );
            })}
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
        elevation: 10,
    },
});
