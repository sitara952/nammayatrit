import React, { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    useAnimatedReaction,
    runOnJS,
    FadeIn,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Button from '@/src-v2/primitives/Button';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useAppKeyboardAnimation } from '@/typescript/utils/useAppKeyboardAnimation';
import { useAppSelector } from '@/typescript/state/hooks';
import { MapPinIcon } from '@/typescript/components/svg/MapPinIcon';
import { selectScreenReaderEnabled } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import colors from '@/typescript/designSystem/colorPalette';

type FloatingMapButtonProps = {
    skipFirstKeyboardAnimation: boolean;
    handleOnPress: () => void;
};

export const FloatingMapButton: React.FC<FloatingMapButtonProps> = ({
    skipFirstKeyboardAnimation = true,
    handleOnPress,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const { bottom } = useSafeAreaInsets();

    const { height, progress } = useAppKeyboardAnimation();

    const screenReaderEnabled = useAppSelector(selectScreenReaderEnabled);

    const firstKeyboardOpened = useSharedValue(false);

    const [allowAnimation, setAllowAnimation] = useState(!skipFirstKeyboardAnimation);

    // Detect first keyboard open
    useAnimatedReaction(
        () => progress.value,
        p => {
            if (!firstKeyboardOpened.value && p >= 0.8) {
                firstKeyboardOpened.value = true;
                if (skipFirstKeyboardAnimation) {
                    runOnJS(setAllowAnimation)(true);
                }
            }
        },
    );

    const animatedPosition = useAnimatedStyle(() => {
        if (!allowAnimation) {
            return {
                transform: [{ translateY: 60 }],
            };
        }

        const interpolatedBottom = interpolate(progress.value, [0, 1], [bottom + 16, 20]);
        return {
            transform: [{ translateY: -(height.value + interpolatedBottom) }],
        };
    });

    if (screenReaderEnabled) return null;

    return (
        <Animated.View
            entering={Platform.OS === 'android' ? FadeIn.delay(600).duration(200) : undefined}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants"
            pointerEvents="box-none"
            style={[tailwind.style('absolute w-full justify-end flex-1 items-center bottom-0'), animatedPosition]}>
            <Button
                testID="search_floating_map"
                type={'primary'}
                style={[tailwind.style('bg-black rounded-full'), floatingMapButtonStyle.floatingMapButtonShadow]}
                prefix={
                    <Typography
                        type="title-3"
                        style={{ color: `${themeColors.Floating_map_pin_color}` }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Map}
                    </Typography>
                }
                suffix={<MapPinIcon color={themeColors.Floating_map_pin_color} />}
                onPress={() => {
                    handleOnPress();
                }}
            />
        </Animated.View>
    );
};

export const floatingMapButtonStyle = StyleSheet.create({
    floatingMapButtonShadow: {
        shadowColor: `${colors?.recovered?.neutralMax}1F`,
        shadowOffset: { width: 0, height: 0 },
        shadowRadius: 10,
        shadowOpacity: 1,
        elevation: 13,
    },
});
