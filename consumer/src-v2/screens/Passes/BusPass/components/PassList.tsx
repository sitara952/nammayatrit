import mtIcMetroPassNormal from '@/src-v2/assets/mt_ic_metro_pass_placeholder.webp';
import mtIcTrainPassNormal from '@/src-v2/assets/mt_ic_train_pass_placeholder.webp';
import { Transit } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types';
import { getIcon } from '@/src-v2/multimodal/screens/NewLiveJourney/utils/getIternaryUtils.tsx';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useMemo, useRef, useState } from 'react';
import { Dimensions, Platform, SafeAreaView } from 'react-native';
import Animated, {
    AnimatedStyle,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import type { ICarouselInstance } from 'react-native-reanimated-carousel';
import Carousel from 'react-native-reanimated-carousel';
import { PanGesture, ScrollView } from 'react-native-gesture-handler';
import { BusPass, BusPassProps } from './passes/BusPass';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface TransportButtonProps {
    iconType?: Transit;
    iconColor?: string;
    label: string;
    testID: string;
    accessibilityLabel: string;
    onPress: () => void;
    animatedStyle: AnimatedStyle;
    handlers: {
        onPressIn: () => void;
        onPressOut: () => void;
    };
    activeAnimatedStyle: AnimatedStyle;
    textAnimatedStyle: AnimatedStyle;
}

const _DummyTrainPass: BusPassProps = {
    passNo: 'Train',
    passCode: 'TRAIN',
    daysToExpire: 0,
    isGoldPass: false,
    profileImageUri: '',
    fleetNo: '',
    amount: 0,
    validTill: new Date(),
    isPreBooked: false,
    isExpired: false,
    validFrom: new Date(),
    onVerifyPress: () => {},
    onRefetchPassData: () => {},
    onRenewPress: () => {},
    qrValue: '',
    onBuyNewPass: () => {},
    onPreBookedPassPress: () => {},
    onSwitchConfirm: async () => {},
    deviceSwitchAllowed: false,
    showDeviceSwitchFlow: false,
    onActivateTodayPress: () => {},
};

const _DummyMetroPass: BusPassProps = {
    passNo: 'Metro',
    passCode: 'METRO',
    daysToExpire: 0,
    isGoldPass: false,
    profileImageUri: '',
    fleetNo: '',
    amount: 0,
    validTill: new Date(),
    isPreBooked: false,
    isExpired: false,
    validFrom: new Date(),
    onVerifyPress: () => {},
    onRefetchPassData: () => {},
    onRenewPress: () => {},
    qrValue: '',
    onBuyNewPass: () => {},
    onPreBookedPassPress: () => {},
    onSwitchConfirm: async () => {},
    deviceSwitchAllowed: false,
    showDeviceSwitchFlow: false,
    onActivateTodayPress: () => {},
};

const TransportButton: React.FC<TransportButtonProps> = React.memo(
    ({
        iconType,
        iconColor,
        label,
        testID,
        accessibilityLabel,
        onPress,
        animatedStyle,
        handlers,
        activeAnimatedStyle,
        textAnimatedStyle,
    }) => {
        return (
            <Pressable
                testID={testID}
                onPress={onPress}
                accessibilityLabel={accessibilityLabel + ' button'}
                accessibilityRole="button"
                {...handlers}>
                <Animated.View
                    style={[
                        tailwind.style(
                            'h-[38px] flex-row items-center justify-center gap-[6px] px-[10px] rounded-[26px]',
                        ),
                        activeAnimatedStyle,
                        animatedStyle,
                    ]}>
                    {iconType && iconColor && getIcon(iconType, 13, iconColor, undefined, undefined)}
                    <Animated.Text
                        style={[
                            tailwind.style('font-areaNormal-extrabold text-[12px] leading-[15px]'),
                            textAnimatedStyle,
                        ]}>
                        {label}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        );
    },
);

// Compute image dimensions once to avoid recalculations
const imageWidth = SCREEN_WIDTH - 48 - 10;
const imageHeight = 540;

// Moved outside to prevent recreation and improve performance
const DummyComponent = React.memo(({ type }: { type: string }) => {
    if (type === 'Metro') {
        return (
            <Animated.View style={tailwind.style('flex-row justify-center items-center')}>
                <Animated.Image
                    resizeMode="contain"
                    source={mtIcMetroPassNormal}
                    style={{ width: imageWidth, height: imageHeight }}
                />
            </Animated.View>
        );
    } else if (type === 'Train') {
        return (
            <Animated.View style={tailwind.style('flex-row justify-center items-center')}>
                <Animated.Image
                    source={mtIcTrainPassNormal}
                    style={{ width: imageWidth, height: imageHeight }}
                    resizeMode="contain"
                />
            </Animated.View>
        );
    }

    return null;
});
export const PassList = ({ busPasses }: { busPasses: BusPassProps[] }) => {
    const { handlers: _metroHandlers, animatedStyle: _metroAnimatedStyle } = useScaleAnimation();
    const { handlers: _trainHandlers, animatedStyle: _trainAnimatedStyle } = useScaleAnimation();
    const animatedIndex = useSharedValue(0);
    const carouselRef = useRef<ICarouselInstance>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const busIconColor = useMemo(() => {
        return currentIndex < busPasses.length ? '#656565' : '#3B3A3C';
    }, [currentIndex]);
    const _metroIconColor = useMemo(() => {
        return currentIndex === busPasses.length ? '#3B3A3C' : '#656565';
    }, [currentIndex]);
    const _trainIconColor = useMemo(() => {
        return currentIndex === busPasses.length + 1 ? '#3B3A3C' : '#656565';
    }, [currentIndex]);

    // Create animated styles for transport buttons
    const _metroActiveAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animatedIndex.value,
            [busPasses.length - 1, busPasses.length, busPasses.length + 1],
            ['#3B3A3C', '#EFEFEF', '#3B3A3C'],
        );
        return { backgroundColor };
    });

    const _trainActiveAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            animatedIndex.value,
            [busPasses.length, busPasses.length + 1, busPasses.length + 2],
            ['#3B3A3C', '#EFEFEF', '#3B3A3C'],
        );
        return { backgroundColor };
    });

    // Create animated text color styles for transport buttons
    const _metroTextAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            animatedIndex.value,
            [busPasses.length - 1, busPasses.length, busPasses.length + 1],
            ['#656565', '#3B3A3C', '#656565'],
        );
        return { color };
    });

    const _trainTextAnimatedStyle = useAnimatedStyle(() => {
        const color = interpolateColor(
            animatedIndex.value,
            [busPasses.length, busPasses.length + 1, busPasses.length + 2],
            ['#656565', '#3B3A3C', '#656565'],
        );
        return { color };
    });

    const BusTransportButton: React.FC<{ pass: BusPassProps; index: number }> = React.memo(({ pass, index }) => {
        const { handlers: perButtonHandlers, animatedStyle: perButtonAnimatedStyle } = useScaleAnimation();

        const activeAnimatedStyle = useAnimatedStyle(() => {
            const backgroundColor = interpolateColor(
                animatedIndex.value,
                [index - 0.5, index, index + 0.5],
                ['#3B3A3C', '#EFEFEF', '#3B3A3C'],
            );
            return { backgroundColor };
        });

        const textAnimatedStyle = useAnimatedStyle(() => {
            const color = interpolateColor(
                animatedIndex.value,
                [index - 0.5, index, index + 0.5],
                ['#656565', '#3B3A3C', '#656565'],
            );
            return { color };
        });

        return (
            <TransportButton
                iconType="BUS"
                iconColor={busIconColor}
                label={`${userLanguageStrings.Bus}(${index + 1}/${busPasses.length})`}
                testID={`bus-pass-list-bus-button-${pass.passNo}`}
                accessibilityLabel={`bus-pass-list-bus-button-${pass.passNo}`}
                onPress={() => {
                    carouselRef.current?.scrollTo({ index: index, animated: true });
                }}
                animatedStyle={perButtonAnimatedStyle}
                handlers={perButtonHandlers}
                activeAnimatedStyle={activeAnimatedStyle}
                textAnimatedStyle={textAnimatedStyle}
            />
        );
    });

    return (
        <SafeAreaView style={tailwind.style('h-full bg-[#060606]', Platform.OS === 'android' ? 'pt-[16px]' : '')}>
            <Animated.View style={tailwind.style('px-[21px] flex-row justify-between mb-2')}>
                <Animated.View style={tailwind.style('flex-row gap-[8px]')}>
                    {busPasses.map((pass, index) => (
                        <BusTransportButton key={pass.passNo} pass={pass} index={index} />
                    ))}

                    {/* <TransportButton
                        iconType="METRO"
                        iconColor={metroIconColor}
                        label={userLanguageStrings.Metro}
                        testID="bus-pass-list-metro-button"
                        accessibilityLabel="bus-pass-list-metro-button"
                        onPress={() => {
                            carouselRef.current?.scrollTo({ index: busPasses.length, animated: true });
                        }}
                        animatedStyle={metroAnimatedStyle}
                        handlers={metroHandlers}
                        activeAnimatedStyle={metroActiveAnimatedStyle}
                        textAnimatedStyle={metroTextAnimatedStyle}
                    />

                    <TransportButton
                        iconType="SUBWAY"
                        iconColor={trainIconColor}
                        label={userLanguageStrings.Train}
                        testID="bus-pass-list-train-button"
                        accessibilityLabel="bus-pass-list-train-button"
                        onPress={() => {
                            carouselRef.current?.scrollTo({ index: busPasses.length + 1, animated: true });
                        }}
                        animatedStyle={trainAnimatedStyle}
                        handlers={trainHandlers}
                        activeAnimatedStyle={trainActiveAnimatedStyle}
                        textAnimatedStyle={trainTextAnimatedStyle}
                    /> */}
                </Animated.View>
            </Animated.View>

            <ScrollView contentContainerStyle={tailwind.style('mt-2 pb-[300px]')}>
                <Animated.View style={tailwind.style(`h-[${imageHeight}px]`)}>
                    <Carousel
                        ref={carouselRef}
                        onConfigurePanGesture={(gestureChain: PanGesture) => gestureChain.activeOffsetX([-10, 10])}
                        vertical={false}
                        loop={false}
                        width={Dimensions.get('window').width}
                        height={Dimensions.get('window').height}
                        data={busPasses} //.concat([DummyMetroPass, DummyTrainPass])
                        scrollAnimationDuration={300}
                        onSnapToItem={index => {
                            animatedIndex.value = withTiming(index, { duration: 300 });
                            setCurrentIndex(index);
                        }}
                        renderItem={({ item }) => {
                            if (['Metro', 'Train'].includes(item.passNo)) {
                                return <DummyComponent type={item.passNo} />;
                            }
                            return (
                                <Animated.View style={tailwind.style('flex-1')}>
                                    <BusPass {...item} />
                                </Animated.View>
                            );
                        }}
                    />
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
};
