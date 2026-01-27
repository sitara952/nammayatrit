import Animated, { useAnimatedStyle, withTiming, useDerivedValue, interpolateColor } from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { StyleSheet } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';

const ConfirmButton = ({
    onPress,
    text,
    disabled = false,
}: {
    onPress: () => void;
    text: string;
    disabled: boolean;
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const { animatedStyle } = useScaleAnimation();

    const progress = useDerivedValue(() => {
        return withTiming(disabled ? 1 : 0, { duration: 100 });
    }, [disabled]);

    const animatedColorStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            progress.value,
            [0, 1],
            [themeColors.favourites_confirm_button_bg, colors.neutral300],
        );

        return {
            backgroundColor,
        };
    });

    return (
        <Pressable
            accessibilityRole="button"
            testID="favourites-confirm-button"
            accessibilityLabel={`${text} button`}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}>
            <Animated.View style={[styles.container, animatedColorStyle, !disabled ? animatedStyle : null]}>
                <Animated.Text
                    style={[
                        tailwind.style('font-areaNormal-extrabold'),
                        styles.text,
                        { color: disabled ? colors.gray300 : themeColors.favourites_confirm_button_text },
                    ]}>
                    {text}
                </Animated.Text>
            </Animated.View>
        </Pressable>
    );
};

export default ConfirmButton;

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        borderRadius: 20,
        height: 52,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: 16,
    },
});
