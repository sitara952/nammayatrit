import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import CrossIcon from '@/src-v2/assets/svg/CrossIcon';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';

interface CloseButtonProps {
    onPress: () => void;
    style?: string;
    closeButtonStyle?: string;
}

export const CloseButton: React.FC<CloseButtonProps> = ({ onPress, style, closeButtonStyle = '' }) => {
    const { handlers: closeButtonHandlers, animatedStyle: closeButtonAnimatedStyle } = useScaleAnimation();

    return (
        <Pressable
            onPress={onPress}
            testID="close-button"
            accessibilityRole="button"
            style={tailwind.style(style || 'mt-[24px]')}
            accessible
            accessibilityLabel="Close button"
            accessibilityHint="Click here to close"
            {...closeButtonHandlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        'bg-white h-[40px] px-[12px] flex-row items-center gap-[6px] justify-center rounded-[20px]',
                    ),
                    tailwind.style(closeButtonStyle),
                    closeButtonAnimatedStyle,
                ]}>
                <Icon icon={<CrossIcon />} color="#3B3A3C" size={16} />
            </Animated.View>
        </Pressable>
    );
};
