import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { ImageBackground, Image, View } from 'react-native';
import Animated from 'react-native-reanimated';
import busPassImage from '@/src-v2/assets/bus_pass.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface BusProps {
    profilePic?: string;
    number: string;
    validity: string;
    startDate: string;
    endDate: string;
    backgroundColor: string;
    onVerifyPress: () => void;
}

export const Bus = ({ profilePic, number, validity, startDate, endDate, backgroundColor, onVerifyPress }: BusProps) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <ImageBackground
            source={busPassImage}
            style={tailwind.style('h-full rounded-[24px] relative', `bg-[${backgroundColor}]`)}>
            <View style={tailwind.style('absolute top-[17%] left-[36%]')}>
                {profilePic && (
                    <Animated.View style={tailwind.style('flex-row gap-[5px]')}>
                        <Image
                            accessible={true}
                            accessibilityLabel="profile picture image"
                            source={{ uri: profilePic }}
                            style={tailwind.style('w-[106px] h-[106px] rounded-full')}
                            resizeMode="cover"
                        />
                        <Animated.View>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#138073] font-departureMono-regular text-[16px] mt-[8px]',
                                )}>
                                {userLanguageStrings.NO}:{number}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                )}
            </View>
            <Animated.View style={tailwind.style('absolute top-[40%] left-[15%]')}>
                <Animated.Text>
                    <Animated.Text
                        style={tailwind.style('font-areaNormal-extrabold text-[13px] leading-[15px] text-[#3B3A3C]')}>
                        {startDate}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style('font-areaNormal-extrabold text-[13px] leading-[15px] text-[#3B3A3C]')}>
                        {'  '}
                        முதல்
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style('font-areaNormal-extrabold text-[13px] leading-[15px] text-[#3B3A3C]')}>
                        {'  '}
                        {endDate}
                    </Animated.Text>
                    <Animated.Text
                        style={tailwind.style('font-areaNormal-extrabold text-[13px] leading-[15px] text-[#3B3A3C]')}>
                        {'  '}
                        வரை
                    </Animated.Text>
                </Animated.Text>
            </Animated.View>
            <Animated.View style={tailwind.style('absolute top-[48%] left-[18%]')}>
                <Animated.Text style={tailwind.style('text-[#056213] font-departureMono-regular text-[48px] mt-[8px]')}>
                    {validity}
                </Animated.Text>
            </Animated.View>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Verify button"
                testID="verify-button"
                style={tailwind.style('absolute top-[60%] left-[12%]')}
                {...handlers}
                onPress={onVerifyPress}>
                <Animated.View
                    style={[
                        tailwind.style(
                            'bg-white shadow-sm h-[56px] w-[286px] rounded-[16px] flex-row items-center justify-center',
                        ),
                        animatedStyle,
                    ]}>
                    <Animated.Text style={tailwind.style('text-[#016ACD] font-areaNormal-extrabold text-[15px]')}>
                        {userLanguageStrings.VerifyBusPass}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </ImageBackground>
    );
};
