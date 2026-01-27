import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { colors } from 'config-types/src/domain/default/themes/colors';

export type TouchEffects = 'scale' | 'ripple';
interface TouchEffectProps {
    children: React.ReactNode;
    onPress: (() => void) | undefined;
    style: StyleProp<ViewStyle> | undefined;
    testID: string;
    effects: TouchEffects[] | undefined;
    accessible: boolean | undefined;
    accessibilityLabel: string | undefined;
}

const TouchEffect = ({
    children,
    onPress,
    style,
    testID,
    effects,
    accessible,
    accessibilityLabel,
}: TouchEffectProps) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    return (
        <Animated.View style={effects?.includes('scale') ? animatedStyle : {}}>
            <Pressable
                testID={testID}
                accessibilityRole="button"
                {...handlers}
                onPress={onPress}
                accessible={accessible}
                accessibilityLabel={accessibilityLabel}
                style={({ pressed }) => [
                    style,
                    pressed && effects?.includes('ripple') && { backgroundColor: colors.neutral400 },
                ]}>
                {children}
            </Pressable>
        </Animated.View>
    );
};

export default TouchEffect;
