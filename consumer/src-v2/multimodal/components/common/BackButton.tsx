import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { Icon } from './Icon';
import CrossIcon from '../../screens/Search/components/svg/CloseIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const BackButton = ({ onPress }: { onPress: () => void }) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');

    return (
        <Pressable
            hitSlop={4}
            testID="back-button"
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel="Back button"
            {...handlers}>
            <Animated.View
                style={[
                    tailwind.style(
                        `h-9 w-9 rounded-full bg-[${colors.CrossButton_bg}] flex-row items-center justify-center`,
                    ),
                    animatedStyle,
                ]}>
                <Icon icon={<CrossIcon />} size={16} />
            </Animated.View>
        </Pressable>
    );
};
