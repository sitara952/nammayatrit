import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import { Dimensions, Platform } from 'react-native';
import Animated, {
    Extrapolation,
    interpolate,
    SensorType,
    useAnimatedSensor,
    useAnimatedStyle,
    useReducedMotion,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import mtIcJourneyCompleteBgText from '../../../assets/mt_ic_journey_complete_bg_text.webp';
import mtIcWavyBg from '../../../assets/mt_ic_wavy_bg.webp';
import { JourneyHighlightCard } from './components/JourneyHighlightCard';
import { JourneyReviewCard } from './components/JourneyReviewCard';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { RightArrowIcon } from '@/src-v2/assets/svg/RightArrowIcon';
import { ScreenHeader } from './components/ScreenHeader';
import { JourneyCompleteProps } from './types';
import { FallbackHighlightCard } from './components/FallbackHighlightCard';
import { useConfigContext } from '@/typescript/context/ConfigContext';
const { width, height } = Dimensions.get('window');

export function FullScreenRadialGradient() {
    return (
        <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
            <Defs>
                <RadialGradient id="grad" cx="50%" cy="50%" r="75%" fx="50%" fy="50%">
                    <Stop offset="0%" stopColor="#ECE6EE" stopOpacity={1} />
                    <Stop offset="24%" stopColor="#ECEAE2" stopOpacity={1} />
                    <Stop offset="48%" stopColor="#F0EAF2" stopOpacity={1} />
                    <Stop offset="75%" stopColor="#F6FFFE" stopOpacity={1} />
                    <Stop offset="100%" stopColor="#DBE8ED" stopOpacity={1} />
                </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width={width} height={height} fill="url(#grad)" fillOpacity={0.945} />
        </Svg>
    );
}

export const JourneyCompleteUI = (props: JourneyCompleteProps) => {
    const {
        primaryMode,
        timeSaved,
        costSaved,
        journeyModes,
        destination,
        totalJourneyCost,
        journeyLegs,
        journeyTime,
        publicTransportCost,
        autoCost,
        tollCharges,
        surgeCharges,
        initialRating,
        onGoBack,
        onShowTicket,
        // onShareWithFriends,
        onSubmitFeedback,
    } = props;

    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <Animated.View style={tailwind.style('relative flex-1 bg-blue-100')}>
            <AnimatedBackground />
            <Animated.ScrollView
                stickyHeaderIndices={[0]}
                contentContainerStyle={tailwind.style('relative bg-transparent', `pb-[${bottom ? bottom : 12}px]`)}>
                <ScreenHeader onGoBack={onGoBack} onShowTicket={onShowTicket} />
                {timeSaved > 10 || costSaved > 10 ? (
                    <JourneyHighlightCard
                        mode={primaryMode}
                        timeSaved={timeSaved}
                        costSaved={costSaved}
                        journeyModes={journeyModes}
                    />
                ) : (
                    <FallbackHighlightCard
                        mode={primaryMode}
                        timeSaved={timeSaved}
                        costSaved={costSaved}
                        journeyModes={journeyModes}
                    />
                )}
                <JourneyReviewCard
                    destination={destination}
                    costSaved={costSaved}
                    timeSaved={timeSaved}
                    totalJourneyCost={totalJourneyCost}
                    journeyLegs={journeyLegs}
                    journeyTime={journeyTime}
                    publicTransportCost={publicTransportCost}
                    autoCost={autoCost}
                    tollCharges={tollCharges}
                    surgeCharges={surgeCharges}
                    initialRating={initialRating}
                    onSubmitFeedback={onSubmitFeedback}
                    onSkipToHome={onGoBack}
                />
                <Animated.View style={tailwind.style('px-6 mt-4')}>
                    <Pressable accessibilityRole="button" testID="skip-to-home-below-card" onPress={onGoBack}>
                        <Animated.View
                            style={tailwind.style(
                                'h-[56px] w-full flex-row justify-center items-center rounded-[16px] gap-1',
                            )}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#3B3A3C] text-[16px] leading-[20px] tracking-[0.2px] font-areaNormal-extrabold pb-1',
                                )}>
                                {userLanguageStrings.SkiptoHome}{' '}
                            </Animated.Text>
                            <RightArrowIcon color={'#3B3A3C'} width={20} height={20} strokeWidth={2.0} />
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            </Animated.ScrollView>
        </Animated.View>
    );
};

const AnimatedBackground = () => {
    const { sensor, isAvailable } = useAnimatedSensor(SensorType.ROTATION, {
        interval: Platform.OS === 'ios' ? 'auto' : 16,
    });

    const reduceMotion = useReducedMotion();

    const animatedBackgroundStyle = useAnimatedStyle(() => {
        if (!isAvailable || reduceMotion) {
            return { transform: [{ scale: 1 }, { translateX: 0 }] };
        }

        const v = sensor.value;
        if (!v || !Number.isFinite(v.qy)) {
            return { transform: [{ scale: 1 }, { translateX: 0 }] };
        }

        // clamp & dead-zone
        const raw = v.qy;
        const y = Math.abs(raw) > 0.01 ? Math.max(Math.min(raw, 0.2), -0.2) : 0;

        // symmetric map, clamped
        const translateX = interpolate(y, [-0.2, 0, 0.2], [35, 0, -35], Extrapolation.CLAMP);

        return { transform: [{ translateX }, { scale: 1.2 }] };
    });

    const animatedJourneyCompleteBgTextStyle = useAnimatedStyle(() => {
        if (!isAvailable || reduceMotion) {
            return { transform: [{ scale: 1 }, { translateY: 0 }] };
        }

        const v = sensor.value;
        if (!v || !Number.isFinite(v.qx)) {
            return { transform: [{ scale: 1 }, { translateY: 0 }] };
        }

        // clamp x tilt to a sane range, then map
        const x = Math.max(Math.min(v.qx, 0.5), -0.5);
        const translateY = interpolate(x, [-0.5, -0.2, 0, 0.2, 0.5], [20, 10, 0, -10, -20], Extrapolation.CLAMP);

        return { transform: [{ translateY }, { scale: 1.15 }] };
    });

    const { top } = useSafeAreaInsets();

    return (
        <Animated.View style={[tailwind.style('absolute inset-0 bg-[#1E1E1E]')]}>
            <Animated.View style={[animatedBackgroundStyle]}>
                <Animated.Image
                    accessible={false}
                    source={mtIcWavyBg}
                    style={tailwind.style(`h-[${height}px] w-[${width}px]`)}
                />
                <FullScreenRadialGradient />
            </Animated.View>
            <Animated.Image
                accessible={false}
                source={mtIcJourneyCompleteBgText}
                resizeMode="contain"
                style={[
                    tailwind.style(
                        'absolute top-0',
                        `h-[78px] w-[310px] left-[${(SCREEN_WIDTH - 310) / 2}px] top-[${top - 6}px]`,
                    ),
                    animatedJourneyCompleteBgTextStyle,
                ]}
            />
        </Animated.View>
    );
};
