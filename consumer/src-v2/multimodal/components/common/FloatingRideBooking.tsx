import { useAnimatedContextValues, AnimatedScreenKey } from '@/typescript/context/AnimatedValuesContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import Animated, { interpolate, SlideInDown, SlideOutDown, useAnimatedStyle } from 'react-native-reanimated';
// import { ThreeDot } from '../svg/ThreeDot';
import { AutoIcon } from './../svg/transport/AutoIcon';
import { Icon } from './Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { CarIcon } from '../svg/transport/CarIcon';

interface FloatingRideBookingProps {
    handleOnBookCabPress: () => void;
    toggleRideOption?: () => void;
    serviceTierName: string | undefined;
    vehicleIconUrl: string | undefined;
    screenName?: AnimatedScreenKey;
}

export const FloatingRideBooking = ({
    handleOnBookCabPress,
    serviceTierName,
    vehicleIconUrl,
    screenName,
}: FloatingRideBookingProps) => {
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues(screenName);
    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - 100,
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0.8, 1], [1, 1]),
        };
    });

    return (
        <Animated.View
            entering={SlideInDown.springify().damping(28).stiffness(240)}
            exiting={SlideOutDown.springify().damping(28).stiffness(240)}
            style={[
                tailwind.style(
                    'absolute p-4 bg-[#2B282F] rounded-[16px] left-4',
                    `w-[${SCREEN_WIDTH - 32}px] overflow-hidden`,
                ),
                floatingHeaderStyle,
            ]}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <Animated.View style={tailwind.style('w-[80px] h-[50px]')}>
                    <Animated.Image
                        accessible={true}
                        accessibilityLabel="vehicle image"
                        source={vehicleIconUrl ? { uri: vehicleIconUrl } : undefined}
                        resizeMode="contain"
                        style={tailwind.style('w-full h-full')}
                    />
                </Animated.View>
                <Animated.View style={tailwind.style('flex-1 flex-row items-center justify-between')}>
                    <Animated.Text
                        style={tailwind.style('text-[14px] text-[#FFFFFF] font-areaNormal-bold')}
                        numberOfLines={2}>
                        {`Book your \n${serviceTierName} now`}
                    </Animated.Text>
                    <Animated.View style={tailwind.style('overflow-hidden flex-row')}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Book button"
                            style={({ pressed }) => [
                                tailwind.style(
                                    'h-9 flex-row items-center justify-center bg-[#F78118] px-4 rounded-[16px] relative overflow-hidden',
                                ),
                                pressed && { opacity: 0.5 },
                            ]}
                            onPress={handleOnBookCabPress}
                            testID="c620bfc3-0222-4ac9-95d1-e35ae49148b4">
                            <Animated.View style={[tailwind.style('absolute inset-0 bg-[#F7A918]')]} />
                            <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-extrabold text-white')}>
                                Book
                            </Animated.Text>
                            <Icon
                                style={tailwind.style('ml-1')}
                                color="#FFFFFF"
                                icon={
                                    serviceTierName === 'Auto' ? (
                                        <AutoIcon fill="#FFFFFF" />
                                    ) : (
                                        <CarIcon fill="#FFFFFF" />
                                    )
                                }
                                size={16}
                            />
                        </Pressable>
                        {/* <Pressable
                            onPress={toggleRideOption}
                            style={[
                                tailwind.style(
                                    'h-9 px-[12.5px] bg-[#FFFFFF] justify-center items-center rounded-[20px] ml-1.5',
                                ),
                            ]}
                            testID="669ad523-71df-4b1f-9683-d38d8468d96c">
                            <Icon color="#2F2D32" icon={<ThreeDot />} size={16} />
                        </Pressable> */}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
