import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';
import { hapticEffect } from '../../../utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Style } from 'twrnc';

interface RNSwitchProps {
    onChange: () => void;
    value: boolean;
    activeTrackColor?: string;
    inActiveTrackColor?: string;
    thumbColor?: string;
    children: React.ReactNode;
    containerStyle?: Style;
    circleStyle?: Style;
    translateValue?: number;
    testID: string;
    circleSize?: number;
    containerWidth?: number;
    shadowValue?: StyleSheet.NamedStyles<'shadowValue'>;
}

export const RNSwitch = React.memo((props: RNSwitchProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const {
        onChange,
        activeTrackColor = themeColors.switch_active,
        inActiveTrackColor = themeColors.switch_inactive,
        thumbColor = themeColors.switch_thumb,
        value,
        children,
        containerStyle,
        circleStyle,
        translateValue = 21,
        circleSize = 32,
        containerWidth = 58,
    } = props;

    const switchTranslate = useDerivedValue(() => {
        if (value) {
            return withSpring(translateValue, {
                mass: 1,
                damping: 15,
                stiffness: 120,
                overshootClamping: true,
                restSpeedThreshold: 0.001,
                restDisplacementThreshold: 0.001,
            });
        } else {
            return withSpring(0, {
                mass: 1,
                damping: 15,
                stiffness: 120,
                overshootClamping: true,
                restSpeedThreshold: 0.001,
                restDisplacementThreshold: 0.001,
            });
        }
    }, [value, translateValue]);

    const circleStyleAnimated = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: switchTranslate.value }],
        };
    });

    const interpolateBackgroundColor = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                switchTranslate.value,
                [0, translateValue ? translateValue : 21],
                [inActiveTrackColor, activeTrackColor],
            ),
        };
    });

    const memoizedOnSwitchPressCallback = React.useCallback(() => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        onChange();
    }, [onChange]);

    const styles = StyleSheet.create({
        circleStyle: {
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize,
        },
        containerStyle: {
            position: 'relative',
            width: containerWidth,
            paddingVertical: 2,
            paddingHorizontal: 2,
            borderRadius: 36.5,
        },
        shadowValue: {
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.23,
            shadowRadius: 2.62,

            elevation: 4,
        },
    });

    return (
        <Pressable
            accessibilityRole="button"
            testID={props.testID}
            accessibilityLabel="RNSwitch"
            onPress={memoizedOnSwitchPressCallback}>
            <Animated.View
                style={[containerStyle ? containerStyle : styles.containerStyle, interpolateBackgroundColor]}>
                <Animated.View
                    style={[
                        circleStyle ? circleStyle : styles.circleStyle,
                        { backgroundColor: thumbColor },
                        circleStyleAnimated,
                        styles.shadowValue,
                    ]}
                />
                {children}
            </Animated.View>
        </Pressable>
    );
});
