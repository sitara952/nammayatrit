import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import Animated from 'react-native-reanimated';
import { CaretDown } from '../../../assets/svg/Caret';

interface ExpandCollapseTrackingButtonProps {
    buttonText: string;
    onPress: () => void;
    isExpanded: boolean;
}

export const ExpandCollapseTrackingButton = (props: ExpandCollapseTrackingButtonProps) => {
    const { buttonText, onPress, isExpanded } = props;
    const { animatedStyle, handlers } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');

    return (
        <Animated.View style={[tailwind.style('flex-row items-center justify-center pt-4 pb-3'), animatedStyle]}>
            <Pressable
                onPress={onPress}
                testID="track-hide-bus-tracking-button"
                accessibilityRole="button"
                accessibilityLabel={buttonText + ' button'}
                style={tailwind.style(
                    `flex-row bg-[${colors.view_ticket_bg}] rounded-[20px] min-h-10 px-4 items-center justify-center`,
                )}
                {...handlers}>
                <Animated.Text
                    style={tailwind.style(
                        `text-[13px] font-areaNormal-extrabold text-[${colors.view_ticket_text}] capitalize`,
                    )}>
                    {buttonText}
                </Animated.Text>
                <Animated.View
                    style={[tailwind.style('ml-1'), isExpanded ? { transform: [{ rotate: '180deg' }] } : {}]}>
                    <Icon icon={<CaretDown fill={colors.CaretDown_fill} />} size={12} color={colors.view_ticket_text} />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export const SecondaryExpandCollapseTrackingButton = (props: ExpandCollapseTrackingButtonProps) => {
    const { buttonText, onPress, isExpanded } = props;
    const { animatedStyle, handlers } = useScaleAnimation();

    return (
        <Animated.View style={[tailwind.style('flex-row items-center justify-center pt-4 pb-3'), animatedStyle]}>
            <Pressable
                onPress={onPress}
                testID="track-hide-bus-tracking-button-secondary"
                accessibilityRole="button"
                accessibilityLabel={buttonText + ' button'}
                style={tailwind.style(`flex-row bg-[#E5E5E5] rounded-[20px] min-h-10 px-4 items-center justify-center`)}
                {...handlers}>
                <Animated.Text
                    style={tailwind.style(`text-[13px] font-areaNormal-extrabold text-[#3B3A3C] capitalize`)}>
                    {buttonText}
                </Animated.Text>
                <Animated.View
                    style={[tailwind.style('ml-1'), isExpanded ? { transform: [{ rotate: '180deg' }] } : {}]}>
                    <Icon icon={<CaretDown fill={'#3B3A3C'} />} size={12} color={'#3B3A3C'} />
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};
