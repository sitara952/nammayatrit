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
    disabled?: boolean;
}

export const ShowTicketButtonNew: React.FC<ShowTicketButtonProps> = ({
    onPress,
    text = 'Show Ticket',
    wrapperStyle = '',
    icon = undefined,
    disabled = false,
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');

    return (
        <Pressable
            accessibilityLabel={text + ' button'}
            testID="show-ticket-button-new"
            onPress={onPress}
            accessibilityRole="button"
            style={tailwind.style('mt-[26px] px-[25px]', wrapperStyle, disabled ? 'opacity-50' : '')}
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        `bg-[${colors.view_ticket_bg}] h-[60px] flex-row items-center gap-[8px] justify-center rounded-[18px] border-[${colors.view_ticket_bg}] border-[0.5px]`,
                    ),
                    animatedStyle,
                ]}>
                {icon || (
                    <Icon
                        icon={<TicketIcon fill={colors.view_ticket_text} />}
                        size={19}
                        color={colors.view_ticket_text}
                    />
                )}
                <Animated.Text
                    style={tailwind.style(
                        `text-[16px] font-areaNormal-extrabold tracking-[0.3px] text-[${colors.view_ticket_text}]`,
                    )}>
                    {text}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};
