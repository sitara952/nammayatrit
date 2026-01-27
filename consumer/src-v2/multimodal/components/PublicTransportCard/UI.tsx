import multi from '../../../assets/3D-assets/multi.webp';
import React, { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { ScrollView } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    FadeInUp,
    FadeOutUp,
    interpolate,
    interpolateColor,
    LinearTransition,
    useAnimatedProps,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { tailwind } from '../../../tailwind-theme/tailwind';
import { useHaptic } from '../../../utils/useHaptic';
import { getIconFromType } from './PublicTransportCardUtils';
import { TransitSegmentProps, TransitSegmentType } from './types';
import Svg, { Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import { JourneyFilterOption } from '../common/JourneyFilterOption';
import { JourneyFilterOptions } from '../../screens/PublicTransitList/Types';
import ChevronUp from '@/typescript/assets/svg/symbols/ChevronUp';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { selectNewFeatureFlags, selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedSvg = Animated.createAnimatedComponent(Svg);

export const TransitSegment = (props: TransitSegmentProps) => {
    const { journey, duration } = props;
    const scrollX = useSharedValue(0);
    const { transitOptions } = useAppSelector(selectNewFeatureFlags);
    const animatedScrollHandler = useAnimatedScrollHandler({
        onScroll: event => {
            scrollX.value = event.contentOffset.x;
        },
    });
    const animatedStyle = useAnimatedProps(() => {
        return {
            opacity: interpolate(scrollX.value, [0, 20], [0, 1]),
        };
    });
    return (
        <Animated.View style={tailwind.style('flex-shrink-0 relative')}>
            <Animated.View style={tailwind.style('absolute z-30')}>
                <AnimatedSvg width="20" height="20" style={animatedStyle}>
                    <Rect width="20" height="20" fill="url(#fadeGradient)" />
                    <Defs>
                        <LinearGradient id="fadeGradient" x1="0" y1="0" x2="1" y2="0">
                            <Stop offset="0" stopColor="white" />
                            <Stop offset="1" stopColor="white" stopOpacity={0} />
                        </LinearGradient>
                    </Defs>
                </AnimatedSvg>
            </Animated.View>
            <Animated.View style={tailwind.style('bg-[#F5F5F5] rounded-[12px] px-2 py-1')}>
                <AnimatedScrollView
                    onScroll={animatedScrollHandler}
                    scrollEventThrottle={16}
                    onStartShouldSetResponder={() => true}
                    hitSlop={10}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    contentContainerStyle={tailwind.style('flex-row items-center')}>
                    {journey.map((transit, index) => {
                        return (
                            <React.Fragment key={JSON.stringify(transit.type + index)}>
                                <Animated.View
                                    onStartShouldSetResponder={() => true}
                                    style={tailwind.style(
                                        'h-[20px] items-center justify-center rounded-[12px] px-[5.5px]',
                                        'bg-transparent',
                                    )}>
                                    <Animated.View style={tailwind.style('flex flex-row items-center')}>
                                        {getIconFromType(transit.type, 12)}
                                    </Animated.View>
                                </Animated.View>
                                {index < journey.length - 1 && (
                                    <Animated.View style={tailwind.style('items-center justify-center px-1')}>
                                        <Animated.Text
                                            style={tailwind.style('text-[12px] font-areaNormal-bold text-[#636164]')}>
                                            +
                                        </Animated.Text>
                                    </Animated.View>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {transitOptions.showMoreRoutes && transitOptions.showPublicTransitPreferences && (
                        <Animated.View style={tailwind.style('ml-auto')}>
                            <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-bold text-[#636164]')}>
                                {duration}
                            </Animated.Text>
                        </Animated.View>
                    )}
                </AnimatedScrollView>
            </Animated.View>
        </Animated.View>
    );
};

interface PublicTransportCardProps {
    handleOnPress: () => void;
    cost: number;
    duration: string;
    journey: TransitSegmentType[];
    isSelected: boolean;
    selectJourneyFilter: (option: JourneyFilterOptions) => void;
}

export const PublicTransportCard = (props: PublicTransportCardProps) => {
    const appConfig = useAppSelector(selectAppConfig);
    // const themeColors = configManager.get('themeColors');

    const {
        handleOnPress,
        cost = 45,
        duration = '55 mins',
        journey = [
            { type: 'walk', duration: 5 },
            { type: 'bus', duration: 25 },
            { type: 'metro', duration: 16 },
            { type: 'auto', duration: 10 },
        ],
        isSelected,
    } = props;

    const hapticSelection = useHaptic(undefined, undefined);

    const derivedSelectedState = useDerivedValue(() => {
        return isSelected ? withSpring(1) : withSpring(0);
    });

    const animatedBorderStyle = useAnimatedStyle(() => {
        return {
            paddingTop: interpolate(derivedSelectedState.value, [0, 1], [16, 14.5], Extrapolation.CLAMP),
            paddingRight: interpolate(derivedSelectedState.value, [0, 1], [16, 14.5], Extrapolation.CLAMP),
            paddingBottom: interpolate(derivedSelectedState.value, [0, 1], [16, 14.5], Extrapolation.CLAMP),
            borderWidth: interpolate(derivedSelectedState.value, [0, 1], [0, 1.5], Extrapolation.CLAMP),
            borderColor: interpolateColor(derivedSelectedState.value, [0, 1], ['transparent', colors.gray64 || '']),
        };
    });

    const handleOnPressPublicTransport = () => {
        handleOnPress?.();
        hapticSelection?.();
    };

    const [expandPublicTransitJourneyFilter, setExpandPublicTransitJourneyFilter] = useState<boolean>(false);
    const { transitOptions } = useAppSelector(selectNewFeatureFlags);
    return (
        <Animated.View>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Select public transport option button`}
                onPress={handleOnPressPublicTransport}
                testID="94fffa1a-69a9-4bf3-8cfe-e7c180d17996">
                <Animated.View
                    layout={LinearTransition}
                    style={[tailwind.style('bg-white rounded-[16px] flex-col justify-between '), animatedBorderStyle]}>
                    <Animated.View style={tailwind.style('flex flex-row items-center')}>
                        <Animated.View style={tailwind.style('absolute w-[65px] h-[60px]')}>
                            <Image
                                resizeMode="cover"
                                style={tailwind.style('h-full w-full')}
                                source={multi}
                                accessible={true}
                                accessibilityLabel="multimodal image"
                            />
                        </Animated.View>
                        <Animated.View style={tailwind.style('pl-[75px] flex-1')}>
                            <Animated.View style={tailwind.style('flex flex-row items-center justify-between')}>
                                <Animated.View style={tailwind.style('flex-row items-center')}>
                                    <Animated.Text
                                        style={[
                                            tailwind.style(
                                                'text-[15px] font-areaNormal-extrabold text-[#37313E] leading-[17px]',
                                            ),
                                            styles.androidText,
                                        ]}>
                                        {appConfig.textConfig.publicTransitText}
                                    </Animated.Text>
                                    {transitOptions.showMoreRoutes && transitOptions.showPublicTransitPreferences && (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={`${
                                                expandPublicTransitJourneyFilter
                                                    ? 'Collapse filter options'
                                                    : 'Expand filter options'
                                            } button`}
                                            testID="fcce4a8e-1d31-433b-9617-d9e512343f0c"
                                            onPress={() =>
                                                setExpandPublicTransitJourneyFilter(!expandPublicTransitJourneyFilter)
                                            }
                                            style={tailwind.style('ml-2')}>
                                            {expandPublicTransitJourneyFilter ? (
                                                <ChevronUp height={15} width={15} />
                                            ) : (
                                                <ChevronDown height={15} width={15} />
                                            )}
                                        </Pressable>
                                    )}
                                </Animated.View>
                                <Animated.View style={tailwind.style('flex flex-row items-end')}>
                                    <Animated.Text
                                        style={[
                                            tailwind.style(
                                                'text-[16px] leading-[17px] font-areaNormal-semibold text-[#37313E] max-h-[17px]',
                                            ),
                                            styles.androidText,
                                        ]}>
                                        ₹
                                    </Animated.Text>
                                    <Animated.Text
                                        style={[
                                            tailwind.style(
                                                'text-[15px] leading-[16px] font-areaNormal-extrabold text-[#37313E] max-h-[16px]',
                                            ),
                                            styles.androidText,
                                        ]}>
                                        {Math.round(cost)}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                            <Animated.View style={tailwind.style('flex flex-row justify-between pt-2 items-center')}>
                                <TransitSegment journey={journey} duration={duration} />
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                    {transitOptions.showMoreRoutes &&
                    transitOptions.showPublicTransitPreferences &&
                    expandPublicTransitJourneyFilter ? (
                        <AnimatedScrollView
                            horizontal={true}
                            entering={FadeInUp}
                            exiting={FadeOutUp}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}>
                            <Animated.View
                                layout={LinearTransition}
                                style={tailwind.style('flex flex-row justify-between pt-2 items-center mt-3')}>
                                <Animated.View layout={LinearTransition}>
                                    <JourneyFilterOption
                                        options={[
                                            JourneyFilterOptions.Most_Relevant,
                                            JourneyFilterOptions.Quickest,
                                            JourneyFilterOptions.Cheapest,
                                            JourneyFilterOptions.Fewest_Transfers,
                                            JourneyFilterOptions.Least_Walking,
                                        ]}
                                        selectJourneyFilter={props.selectJourneyFilter}
                                        dispatch={undefined}
                                    />
                                </Animated.View>
                            </Animated.View>
                        </AnimatedScrollView>
                    ) : null}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    androidText: {
        includeFontPadding: false,
    },
});
