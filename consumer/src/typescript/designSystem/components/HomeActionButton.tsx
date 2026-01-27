import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import React from 'react';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';

type HomeActionButtonTypes = {
    svg: React.ReactNode | undefined;
    text: string;
    wrapperStyle: string | undefined;
    textStyle: string | undefined;
    onPress: (() => void) | undefined;
};

const HomeActionButton = ({
    svg,
    text,
    wrapperStyle = '',
    textStyle = '',
    onPress = undefined,
}: HomeActionButtonTypes) => {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel="Home Action Button"
            testID="c4db6ad1-5a98-4909-8848-e8a51147488b"
            onPress={onPress}>
            <Animated.View
                style={[
                    tailwind.style(
                        `flex-row items-center gap-[6px] bg-[#FBFBFB] rounded-[20px] h-[36px] px-[12px] border border-[#F5F5F5]`,
                    ),
                    tailwind.style(wrapperStyle),
                    {
                        shadowColor: '#000000',
                        shadowOffset: { width: 1, height: 1 },
                        shadowOpacity: 0.007,
                        shadowRadius: 2,
                        elevation: 1,
                    },
                ]}>
                {svg}

                <Animated.Text
                    style={tailwind.style([
                        'font-areaNormal-bold text-[14px] tracking-[0.35px] leading-[37px]',
                        textStyle,
                    ])}>
                    {text}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

export default HomeActionButton;
