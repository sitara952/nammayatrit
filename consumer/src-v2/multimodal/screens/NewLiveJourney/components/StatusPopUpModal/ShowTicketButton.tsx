import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '@/typescript/components/Icon';
import TicketIcon from '@/src-v2/assets/svg/TIcketIcon';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface ShowTicketButtonProps {
    onPress: () => void;
    text?: string;
    wrapperStyle?: string;
    icon?: React.ReactNode;
}

export const ShowTicketButton: React.FC<ShowTicketButtonProps> = ({
    onPress,
    text = 'Show Ticket',
    wrapperStyle = '',
    icon = undefined,
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');

    return (
        <Pressable
            testID="show-ticket-button"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={text + ' button'}
            style={tailwind.style('mt-[26px] px-[25px]', wrapperStyle)}
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        `bg-[${colors.Button_for_modes_bg}] h-[60px] flex-row items-center gap-[8px] justify-center rounded-[18px]`,
                    ),
                    animatedStyle,
                ]}>
                {icon || <Icon icon={<TicketIcon fill={colors.Button_for_modes_text} />} size={19} />}
                <Animated.Text
                    style={tailwind.style(
                        `text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[${colors.Button_for_modes_text}]`,
                    )}>
                    {text}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};
