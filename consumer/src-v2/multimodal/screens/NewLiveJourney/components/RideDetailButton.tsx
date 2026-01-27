import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { getIconFromType } from '../utils/getTransitIconUtils';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface RideDetailButtonProps {
    onPress: () => void;
    text?: string;
    wrapperStyle?: string;
}

export const RideDetailButton: React.FC<RideDetailButtonProps> = ({
    onPress,
    text = 'Ride Detail',
    wrapperStyle = '',
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const congigManager = useConfigContext();
    const colors = congigManager.get('themeColors');

    return (
        <Pressable
            accessibilityLabel={`${text} button`}
            testID="ride-detail-button"
            onPress={onPress}
            accessibilityRole="button"
            style={tailwind.style('mt-[26px] px-[25px]', wrapperStyle)}
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        `bg-[${colors.CrossButton_bg}] h-[57px] flex-row items-center gap-[8px] justify-center rounded-[16px]`,
                    ),
                    animatedStyle,
                ]}>
                {getIconFromType('Taxi', 19, '#0071CE', false)}
                <Animated.Text
                    style={tailwind.style('text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[#016ACD]')}>
                    {text}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};
