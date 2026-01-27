import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { colors } from 'config-types/src/domain/default/themes/colors';
import colorss from '@/typescript/designSystem/colorPalette/index.ts';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type CircularProgressProps = {
    size: number;
    strokeWidth: number | undefined;
    progress: number; // Value between 0 and 1
    duration: number | undefined;
    color: string | undefined;
    backgroundColor: string | undefined;
    style: ViewStyle | undefined;
    children: React.ReactNode | undefined;
    onAnimationComplete: (() => void) | undefined;
    isReverse: boolean | undefined; // Controls clockwise vs counter-clockwise
};

const CircularProgress: React.FC<CircularProgressProps> = ({
    size,
    strokeWidth = 3,
    progress,
    duration = 1000,
    color = colors.gray64,
    backgroundColor = colorss.recovered.handle,
    style,
    children,
    onAnimationComplete,
    isReverse = false, // Default to clockwise direction
}) => {
    const animatedProgress = useSharedValue(0);
    const center = size / 2;
    const radius = center - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    // Handle animation completion
    const handleAnimationComplete = () => {
        if (onAnimationComplete) {
            onAnimationComplete();
        }
    };

    // Update the progress value when it changes
    useEffect(() => {
        // Ensure progress is between 0 and 1
        const safeProgress = Math.min(1, Math.max(0, progress));

        // Special case for progress = 1, make sure it fully completes
        if (safeProgress >= 0.999) {
            animatedProgress.value = withTiming(
                1,
                {
                    duration: 200, // Faster completion for the final step
                    easing: Easing.linear,
                },
                finished => {
                    if (finished && onAnimationComplete) {
                        runOnJS(handleAnimationComplete)();
                    }
                },
            );
        } else {
            animatedProgress.value = withTiming(
                safeProgress,
                {
                    duration,
                    easing: Easing.linear,
                },
                finished => {
                    if (finished && safeProgress >= 1 && onAnimationComplete) {
                        runOnJS(handleAnimationComplete)();
                    }
                },
            );
        }
    }, [progress, duration]);

    // Create animated props for the circle stroke dash
    const animatedProps = useAnimatedProps(() => {
        // Calculate strokeDashoffset based on direction
        const strokeDashoffset = isReverse
            ? circumference * (1 + animatedProgress.value)
            : circumference * (1 - animatedProgress.value);

        return {
            strokeDashoffset,
        };
    });

    return (
        <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
            <Svg width={size} height={size}>
                {/* Background Circle */}
                <Circle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Progress Circle */}
                <AnimatedCircle
                    cx={center}
                    cy={center}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeLinecap="round"
                    fill="transparent"
                    animatedProps={animatedProps}
                    // Always rotate to start from top (270 degrees)
                    transform={`rotate(270, ${center}, ${center})`}
                />
            </Svg>

            {/* Center content */}
            <View style={styles.childrenContainer}>{children}</View>
        </View>
    );
};

const styles = StyleSheet.create({
    childrenContainer: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CircularProgress;
