import React, { useCallback } from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { ShareWithFriendsButtonProps } from '../types';
import UpDoubleArrow from '@/src-v2/multimodal/components/svg/UpDoubleArrow';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const ShareWithFriendsButton = ({ onShareWithFriends }: ShareWithFriendsButtonProps) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handlePress = useCallback(() => {
        if (onShareWithFriends !== undefined) {
            onShareWithFriends();
        }
    }, [onShareWithFriends]);

    return (
        <Pressable
            {...handlers}
            onPress={handlePress}
            accessibilityRole="button"
            accessibilityLabel="Share with friends button"
            style={tailwind.style('px-6 pt-4')}
            testID="share-with-friends-button">
            <Animated.View
                style={[
                    tailwind.style(
                        'bg-[#047AEA] h-15 w-full flex-row justify-center items-center rounded-[16px] gap-2',
                    ),
                    animatedStyle,
                ]}>
                <Animated.Text style={tailwind.style('text-white text-base font-areaNormal-extrabold')}>
                    {userLanguageStrings.ShareWithFriends}
                </Animated.Text>
                <UpDoubleArrow />
            </Animated.View>
        </Pressable>
    );
};
