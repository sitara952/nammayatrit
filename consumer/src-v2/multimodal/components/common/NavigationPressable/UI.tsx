import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { LeftArrow, RightArrow } from '../../svg/Arrows';
import { Icon } from '../Icon';
import Animated from 'react-native-reanimated';

type NavigationPressableTypes = {
    type: 'dark' | 'primary' | 'light';
    direction: 'left' | 'right';
    onPress: (() => void) | undefined;
};

export const NavigationPressable = ({ type, direction, onPress }: NavigationPressableTypes) => {
    const wrapperClassname = tailwind.style(
        'h-[40px] w-[48px] flex-row items-center rounded-[20px] border px-[13px]',
        type === 'dark' ? 'bg-[#212121] border-[#212121]' : '',
        type === 'primary' || type === 'light' ? 'bg-white border-[#EFECF2]' : '',
    );

    const iconColor = tailwind.color(
        type === 'dark'
            ? 'text-white'
            : type === 'primary'
              ? 'text-[#8C1AFD]'
              : type === 'light'
                ? 'text-[#212121]'
                : '',
    );

    const pressedStateColor =
        type === 'dark'
            ? 'bg-[#3f3f3f] border-[#3f3f3f]'
            : type === 'primary'
              ? 'bg-[#F6F1FB] border-[#F6F1FB]'
              : type === 'light'
                ? 'bg-[#F6F1FB]'
                : '';

    return (
        <Pressable
            testID={`b76bc95a-49d1-4795-93eb-fdcc86e577ec`}
            accessible={true}
            accessibilityLabel={`Navigate ${direction} button`}
            accessibilityRole="button"
            onPress={onPress}
            style={({ pressed }) => [wrapperClassname, tailwind.style(pressed ? pressedStateColor : '')]}>
            <Animated.View accessible={false}>
                {direction === 'left' ? (
                    <Icon color={iconColor} size={20} icon={<LeftArrow fill={undefined} />} />
                ) : (
                    <Icon color={iconColor} size={20} icon={<RightArrow fill={undefined} />} />
                )}
            </Animated.View>
        </Pressable>
    );
};
