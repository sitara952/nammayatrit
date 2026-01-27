import React from 'react';
import Animated from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import DoubleChevronRight from '@/src-v2/assets/svg/DoubleChevronRight';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface PrimaryButtonProps {
    text: string;
    onPress: () => void;
    testID: string;
    wrapperStyle: string;
    iconColor?: string;
    style?: string;
    textStyle?: string;
    prefix?: React.ReactNode;
    suffix?: React.ReactNode;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
    text,
    onPress,
    testID,
    wrapperStyle,
    iconColor,
    style = '',
    textStyle = '',
    prefix = '',
    suffix = '',
}) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    iconColor = iconColor || colors.Confirm_button_text;
    return (
        <Pressable
            testID={testID}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={text + ' button'}
            style={tailwind.style(wrapperStyle)}
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        `bg-[${colors.Confirm_button_bg}] rounded-[16px] h-[57px] items-center justify-center flex-row gap-[8px]`,
                        style,
                    ),
                    animatedStyle,
                ]}>
                {prefix}
                <Animated.Text
                    style={tailwind.style(
                        `text-[15px] text-[${colors.Confirm_button_text}] font-areaNormal-extrabold`,
                        textStyle,
                    )}>
                    {text}
                </Animated.Text>
                {!suffix ? <Icon icon={<DoubleChevronRight fill={iconColor} />} color={iconColor} size={15} /> : suffix}
            </Animated.View>
        </Pressable>
    );
};

export default PrimaryButton;
