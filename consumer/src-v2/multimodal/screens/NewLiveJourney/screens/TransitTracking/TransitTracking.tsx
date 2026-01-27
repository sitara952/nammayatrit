import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    interpolateColor,
    LinearTransition,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import Svg, { Path } from 'react-native-svg';

import mtIcBusTracking from '@/src-v2/assets/mt_ic_bus_top_view_tracking.webp';
import mtIcMetroTracking from '@/src-v2/assets/mt_ic_metro_top_view_tracking.webp';
import mtIcTrainTracking from '@/src-v2/assets/mt_ic_train_top_view_tracking.webp';
// import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { getDestinationLabel } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/MiniBusTracking';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Svg, { Path } from 'react-native-svg';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

export interface StopMapping {
    stopName: string;
    distance: number;
    lat: number;
    lon: number;
    stopCode: string | undefined;
}

// const UserIcon = () => {
//     return (
//         <Svg width="100%" height="100%" viewBox="0 0 12 12" fill="none">
//             <Path
//                 d="M5.98549 6.74707C6.34595 6.74707 6.68543 6.75726 7.0353 6.78906C8.28631 6.89516 9.31443 7.79647 9.61147 9.01562H9.63295V9.04785C9.81321 9.77951 9.25106 10.501 8.49819 10.501H3.4933C2.72991 10.5009 2.17835 9.77945 2.35854 9.04785V9.01562C2.65554 7.80694 3.68454 6.89509 4.93569 6.78906C5.28555 6.75726 5.62502 6.74707 5.98549 6.74707ZM5.98451 1.5C7.11478 1.5 8.03137 2.41662 8.03139 3.54688C8.03139 4.67715 7.11479 5.59375 5.98451 5.59375C4.85431 5.59366 3.93862 4.67709 3.93862 3.54688C3.93863 2.41667 4.85433 1.50009 5.98451 1.5Z"
//                 fill="white"
//             />
//         </Svg>
//     );
// };

interface TransitStopRowProps {
    index: number;
    stop: StopMapping;
    isBoarded: boolean;
    isCurrent: boolean;
    isPreDestination: boolean;
    isDestination: boolean;
    boardingStopTitle: string;
    destinationStopTitle: string;
    destinationStopSubtitle: string;
    boardingStopSubtitle: string;
    preDestinationMessage: string | undefined;
    nextLegMetroLineColor: string | undefined;
    hasCrossedPreDestination: boolean;
}

const ITEM_HEIGHT = 50;
const ITEM_HEIGHT_WITH_INFO = 62;
const PRE_DESTINATION_HEIGHT = 75;
const INITIAL_PADDING = -6; // pt-3 in tailwind equals 12px

const TransitStopRow: React.FC<TransitStopRowProps> = props => {
    const {
        stop,
        isBoarded,
        isCurrent,
        isPreDestination,
        isDestination,
        index,
        destinationStopTitle,
        boardingStopTitle,
        destinationStopSubtitle,
        boardingStopSubtitle,
        preDestinationMessage,
        nextLegMetroLineColor,
        hasCrossedPreDestination,
    } = props;
    const shouldHighlight = useDerivedValue(() => {
        return isBoarded || isCurrent || isPreDestination || isDestination ? withSpring(1) : withSpring(0);
    });
    const animatedHighlightStyle = useAnimatedStyle(() => {
        return {
            color: interpolateColor(shouldHighlight.value, [0, 1], ['#969696', '#3B3A3C']),
        };
    });
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(200).stiffness(340).mass(1)}
            style={tailwind.style(
                !isDestination ? 'border-b-[1px] border-[#F4F4F4]' : '',
                index === 0 ? 'pt-1' : 'pt-[16.5px]',
                isDestination ? 'pb-1' : 'pb-[16.5px]',
            )}>
            {isDestination ? (
                <Animated.Text
                    style={tailwind.style(
                        'text-[13px] font-areaNormal-extrabold leading-[17px] tracking-[0.2px] text-[#09941E] pb-2',
                    )}>
                    {getDestinationLabel(destinationStopTitle, nextLegMetroLineColor, userLanguageStrings)}
                </Animated.Text>
            ) : null}
            {isBoarded ? (
                <Animated.Text
                    style={tailwind.style(
                        'text-[13px] font-areaNormal-extrabold text-[#969696] leading-[16px] tracking-[0.1px] pb-[9px]',
                    )}>
                    {boardingStopTitle}
                </Animated.Text>
            ) : null}
            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <Animated.Text
                    numberOfLines={1}
                    style={[
                        tailwind.style(
                            'text-[13px] font-areaNormal-extrabold tracking-[0.1px] text-[#969696] leading-[16px]',
                            isBoarded || isDestination ? 'text-[14px] leading-[16px]' : '',
                        ),
                        animatedHighlightStyle,
                    ]}>
                    {stop.stopName}
                </Animated.Text>
                {isDestination && (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] leading-[16px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.1px]',
                        )}>
                        {destinationStopSubtitle}
                    </Animated.Text>
                )}
                {isBoarded && (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] leading-[16px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.1px]',
                        )}>
                        {boardingStopSubtitle}
                    </Animated.Text>
                )}
            </Animated.View>
            {isPreDestination && preDestinationMessage ? (
                <PreDestinationBanner
                    message={preDestinationMessage}
                    isCurrent={isCurrent}
                    hasCrossedPreDestination={hasCrossedPreDestination}
                />
            ) : null}
        </Animated.View>
    );
};

const WIGGLE_DEGREES = 4;
const WIGGLE_DURATION_MS = 100;

interface PreDestinationBannerProps {
    message: string;
    isCurrent: boolean;
    hasCrossedPreDestination: boolean;
}

const PreDestinationBanner: React.FC<PreDestinationBannerProps> = ({
    message,
    isCurrent,
    hasCrossedPreDestination,
}) => {
    const rotation = useSharedValue(0);
    const haptic = useHaptic(HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });

    useEffect(() => {
        if (isCurrent) {
            rotation.value = withRepeat(
                withSequence(
                    withTiming(WIGGLE_DEGREES, { duration: WIGGLE_DURATION_MS }),
                    withTiming(-WIGGLE_DEGREES, { duration: WIGGLE_DURATION_MS }),
                ),
                -1,
                true,
            );
        } else {
            rotation.value = withTiming(0, { duration: WIGGLE_DURATION_MS });
        }
    }, [isCurrent]);

    const wiggleStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    useAnimatedReaction(
        () => rotation.value,
        (next, prev) => {
            if (isCurrent && next !== prev && (next === 4 || next === -4)) {
                haptic && runOnJS(haptic)();
            }
        },
    );

    return (
        <Animated.View style={tailwind.style('flex-row items-center pt-[9px]')}>
            <Animated.View style={wiggleStyle}>
                <Svg width="12" height="13" viewBox="0 0 12 13" fill="none">
                    <Path
                        d="M10.0323 7.97463V5.65861C10.0323 3.2566 8.18059 1.15842 5.77858 1.08963C3.37657 1.02083 1.25547 3.00436 1.25547 5.47516V7.97463C1.25547 8.17527 1.10068 8.34725 0.900037 8.37018L0.424221 8.41604C0.183447 8.43897 0 8.63962 0 8.88039V9.89509C0 10.1531 0.212111 10.3652 0.470083 10.3652H10.8062C11.0642 10.3652 11.2763 10.1531 11.2763 9.89509V8.88039C11.2763 8.63962 11.0928 8.43897 10.852 8.41604L10.3762 8.37018C10.1756 8.34725 10.0208 8.181 10.0208 7.97463H10.0323Z"
                        fill="#FFA600"
                    />
                    <Path
                        d="M3.65723 11.4824C3.90373 12.3481 4.69485 12.9901 5.64648 12.9901C6.59811 12.9901 7.3835 12.3481 7.63573 11.4824H3.66296H3.65723Z"
                        fill="#FFA600"
                    />
                    <Path
                        d="M5.93426 2.63132H5.35525C4.80491 2.63132 4.38069 2.14404 4.46095 1.60516L4.5756 0.77965C4.63866 0.332498 5.02275 0 5.46991 0H5.8196C6.27249 0 6.65658 0.332498 6.71391 0.77965L6.82856 1.60516C6.90309 2.14977 6.47887 2.63132 5.93426 2.63132Z"
                        fill="#FFA600"
                    />
                </Svg>
            </Animated.View>
            <Animated.Text
                style={tailwind.style(
                    'text-[13px] font-areaNormal-extrabold text-[#969696] leading-[16px] tracking-[0.1px] pl-1.5',
                )}>
                {hasCrossedPreDestination ? 'Bus crossed this stop' : message}
            </Animated.Text>
        </Animated.View>
    );
};

export interface TransitTrackingProps {
    /**
     * Array of all stops in the route, in order.
     */
    routeStops: StopMapping[];
    /**
     * Index of the stop where the user boarded the vehicle.
     */
    boardingStopIndex: number;
    /**
     * Index of the stop where the user is currently located.
     */
    currentLocationStopIndex: number;
    /**
     * Index of the stop just before the final destination.
     */
    approachingDestinationStopIndex: number;
    /**
     * Index of the final destination stop.
     */
    finalDestinationStopIndex: number;
    /**
     * Title text for the boarding stop
     */
    boardingStopTitle: string;
    /**
     * Subtitle text for the boarding stop
     */
    boardingStopSubtitle: string;
    /**
     * Title text for the destination stop
     */
    destinationStopTitle: string;
    /**
     * Subtitle text for the destination stop
     */
    destinationStopSubtitle: string;
    /**
     * Message to be displayed when the user is approaching the destination stop
     */
    preDestinationMessage: string | undefined;
    /**
     * is the component Preboarding tracking
     */
    isPreboarding: boolean;
    /**
     * Mode of the transit
     */
    mode: 'Bus' | 'Train' | 'Metro';
    /**
     * Scroll view offset adjustment
     */
    scrollViewOffset?: number;
    /**
     * Color of the next leg's metro line
     */
    nextLegMetroLineColor: string | undefined;
}

export const TransitTracking = (props: TransitTrackingProps) => {
    const {
        routeStops,
        boardingStopIndex,
        currentLocationStopIndex,
        approachingDestinationStopIndex,
        finalDestinationStopIndex,
        boardingStopTitle,
        destinationStopTitle,
        boardingStopSubtitle,
        destinationStopSubtitle,
        preDestinationMessage,
        // isPreboarding,
        mode,
        scrollViewOffset = 0,
        nextLegMetroLineColor,
    } = props;
    const scrollViewRef = useRef<ScrollView>(null);

    // Pre-condition checks
    if (
        boardingStopIndex < 0 ||
        boardingStopIndex >= routeStops.length ||
        currentLocationStopIndex < 0 ||
        currentLocationStopIndex >= routeStops.length ||
        approachingDestinationStopIndex < 0 ||
        approachingDestinationStopIndex >= routeStops.length ||
        finalDestinationStopIndex < 0 ||
        finalDestinationStopIndex >= routeStops.length
    ) {
        throw new Error('Invalid stop index provided. All indices must be within the range of route stops.');
    }

    const calculateYPosition = useMemo(() => {
        const position = Array.from({ length: currentLocationStopIndex }).reduce<number>((acc, _, i) => {
            const isSpecialStop =
                i === boardingStopIndex || i === approachingDestinationStopIndex || i === finalDestinationStopIndex;
            return (
                acc +
                (isSpecialStop
                    ? i === approachingDestinationStopIndex
                        ? PRE_DESTINATION_HEIGHT
                        : ITEM_HEIGHT_WITH_INFO
                    : ITEM_HEIGHT)
            );
        }, INITIAL_PADDING);

        return position;
    }, [currentLocationStopIndex, boardingStopIndex, approachingDestinationStopIndex, finalDestinationStopIndex]);

    const busAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withSpring(
                        mode === 'Train'
                            ? calculateYPosition - 80 / 2
                            : mode === 'Metro'
                              ? calculateYPosition - 120 / 2
                              : calculateYPosition,
                        {
                            damping: 180,
                            stiffness: 340,
                            mass: 1,
                        },
                    ),
                },
            ],
        };
    }, [calculateYPosition]);

    const DOT_HEIGHT = 6; // 1.5 tailwind units
    const DOT_MARGIN = 33; // 4 tailwind units
    const DOT_SPACING = DOT_HEIGHT + DOT_MARGIN;

    interface AnimatedDotProps {
        index: number;
        calculateYPosition: number;
    }

    const AnimatedDot: React.FC<AnimatedDotProps> = ({ index, calculateYPosition }) => {
        const dotPosition = index * DOT_SPACING + 12; // top-3 = 12px
        const isBehindBus = dotPosition >= calculateYPosition + 12;

        const animatedStyle = useAnimatedStyle(() => {
            return {
                backgroundColor: isBehindBus ? '#016ACD' : '#C9C9C9',
                opacity: isBehindBus ? 1 : index === 0 ? 1 : 0,
                zIndex: isBehindBus ? -9999 : 1,
            };
        });

        return (
            <Animated.View
                style={[
                    tailwind.style('h-1.5 w-1.5 rounded-full', `mb-[${DOT_MARGIN}px]`, index === 0 ? 'mt-0' : ''),
                    animatedStyle,
                ]}
            />
        );
    };

    const gradientProps = useMemo(() => {
        const interpolatedYValue = interpolate(
            currentLocationStopIndex,
            [0, routeStops.length],
            [0, 1],
            Extrapolation.CLAMP,
        );
        return {
            start: { x: 0, y: 0 },
            end: { x: 0, y: interpolatedYValue + 0.03 },
            locations: [0, 0.9, 1],
            colors: ['#F7F7F7', '#FFE898', '#F7F7F7'],
        };
    }, [currentLocationStopIndex, routeStops.length]);

    const { bottom, top } = useSafeAreaInsets();
    // This value is calculated by subtracting the height of all the elements in the scroll view from the screen height
    const SCROLL_CONTAINER_HEIGHT =
        Platform.OS === 'ios'
            ? SCREEN_HEIGHT - scrollViewOffset - top - 102 - 96 - (bottom ? bottom : 16)
            : SCREEN_HEIGHT - scrollViewOffset - bottom - top - 96 - 102 - 68 - 56;

    const calculateScrollPosition = useMemo(() => {
        return Array.from({ length: currentLocationStopIndex + 1 }).reduce<number>((acc, _, i) => {
            const isSpecialStop =
                i === boardingStopIndex || i === approachingDestinationStopIndex || i === finalDestinationStopIndex;
            return (
                acc +
                (isSpecialStop
                    ? i === approachingDestinationStopIndex
                        ? PRE_DESTINATION_HEIGHT
                        : ITEM_HEIGHT_WITH_INFO
                    : ITEM_HEIGHT)
            );
        }, 0);
    }, [currentLocationStopIndex, boardingStopIndex, approachingDestinationStopIndex, finalDestinationStopIndex]);

    useEffect(() => {
        // Add a small delay to ensure the layout is complete
        const timeoutId = setTimeout(() => {
            scrollViewRef.current?.scrollTo({
                y: Math.max(0, calculateScrollPosition - SCROLL_CONTAINER_HEIGHT / 2),
                animated: true,
            });
        }, 100);

        return () => clearTimeout(timeoutId);
    }, [calculateScrollPosition, SCROLL_CONTAINER_HEIGHT]);

    return (
        <Animated.View style={tailwind.style('border-t-[1px] border-b-[1px] border-[#F4F4F4] mx-6')}>
            <LinearGradient
                style={tailwind.style('absolute h-[24px] w-full left-0 right-0 top-0 bottom-0 z-1 bg-transparent')}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }}
                locations={[0.2, 1]}
                colors={['rgba(255,255,255,0)', 'white']}
            />
            <ScrollView
                ref={scrollViewRef}
                contentContainerStyle={tailwind.style('py-6')}
                showsVerticalScrollIndicator={false}
                style={tailwind.style(`h-[${SCROLL_CONTAINER_HEIGHT}px]`)}>
                <Animated.View style={tailwind.style('relative overflow-hidden')}>
                    <Animated.View
                        style={tailwind.style(
                            'absolute left-0 top-0 bottom-0 w-7 rounded-[34px] bg-[#F7F7F7] overflow-hidden',
                        )}>
                        {mode === 'Bus' ? (
                            <Animated.Image
                                accessible={false}
                                source={mtIcBusTracking}
                                style={[tailwind.style('absolute left-0 h-[80px] w-[28px] z-3'), busAnimatedStyle]}
                            />
                        ) : null}
                        {mode === 'Train' ? (
                            <Animated.Image
                                accessible={false}
                                source={mtIcTrainTracking}
                                style={[tailwind.style('absolute left-0 h-[100px] w-[28px] z-3'), busAnimatedStyle]}
                            />
                        ) : null}
                        {mode === 'Metro' ? (
                            <Animated.Image
                                accessible={false}
                                source={mtIcMetroTracking}
                                style={[tailwind.style('absolute left-0 h-[110px] w-[28px] z-3'), busAnimatedStyle]}
                            />
                        ) : null}
                        <Animated.View style={tailwind.style('left-[11px] top-3 overflow-hidden z-2')}>
                            {Array.from({ length: 120 }).map((_, index) => (
                                <AnimatedDot key={index} index={index} calculateYPosition={calculateYPosition} />
                            ))}
                        </Animated.View>
                        <LinearGradient {...gradientProps} style={[StyleSheet.absoluteFill, { zIndex: 1 }]} />

                        {/* {isPreboarding && (
                            <Animated.View
                                style={tailwind.style(
                                    'absolute left-0.5 bottom-0.5 h-6 w-6 rounded-full z-10 bg-red-500 flex items-center justify-center',
                                )}>
                                <Icon icon={<UserIcon />} size={12} color="white" />
                            </Animated.View>
                        )} */}
                    </Animated.View>
                    <Animated.View style={tailwind.style('pl-13')}>
                        {routeStops.map((stop, index) => (
                            <TransitStopRow
                                index={index}
                                key={stop.stopName + index}
                                stop={stop}
                                isBoarded={index === boardingStopIndex}
                                isCurrent={index === currentLocationStopIndex}
                                isPreDestination={index === finalDestinationStopIndex - 1}
                                isDestination={index === finalDestinationStopIndex}
                                boardingStopTitle={boardingStopTitle}
                                destinationStopTitle={destinationStopTitle}
                                boardingStopSubtitle={boardingStopSubtitle}
                                destinationStopSubtitle={destinationStopSubtitle}
                                preDestinationMessage={preDestinationMessage}
                                nextLegMetroLineColor={nextLegMetroLineColor}
                                hasCrossedPreDestination={
                                    index === finalDestinationStopIndex - 1 && currentLocationStopIndex > index
                                }
                            />
                        ))}
                    </Animated.View>
                </Animated.View>
            </ScrollView>
            <LinearGradient
                style={tailwind.style('absolute h-[24px] w-full left-0 right-0 bottom-0 z-1 bg-transparent')}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                locations={[0.2, 1]}
                colors={['rgba(255,255,255,0)', 'white']}
            />
        </Animated.View>
    );
};
