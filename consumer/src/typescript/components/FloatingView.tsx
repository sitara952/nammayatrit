import Animated, { SharedValue, SlideInDown, SlideOutDown, useAnimatedStyle } from 'react-native-reanimated';
import { useAnimatedContextValues } from '../context/AnimatedValuesContext';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import React from 'react';

interface FloatingViewProps {
    children: React.ReactNode;
    verticalPosition: number | undefined;
    style?: StyleProp<ViewStyle> | undefined;
    sheetAnimatedPosition?: SharedValue<number>;
}

export const FloatingView = React.memo(
    ({ children, verticalPosition = 70, style, sheetAnimatedPosition }: FloatingViewProps) => {
        const contextValues = useAnimatedContextValues(undefined);
        const animatedPosition = sheetAnimatedPosition ?? contextValues.sheetAnimatedPosition;

        const animatedStyle = useAnimatedStyle(() => {
            return {
                transform: [
                    {
                        translateY: animatedPosition.value - verticalPosition,
                    },
                ],
            };
        });

        return (
            <Animated.View style={[styles.container, animatedStyle, style]}>
                <Animated.View
                    entering={SlideInDown.springify().damping(50).stiffness(400)}
                    exiting={SlideOutDown.duration(1500)}>
                    {children}
                </Animated.View>
            </Animated.View>
        );
    },
);

const styles = StyleSheet.create({
    container: {
        zIndex: -50,
    },
});
