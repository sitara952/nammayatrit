import React, { useRef, useMemo, useEffect } from 'react';
import { TextStyle, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, {
    SharedValue,
    useSharedValue,
    useDerivedValue,
    cancelAnimation,
    withSpring,
    runOnJS,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

import { useConfigContext } from '../context/ConfigContext';
import Typography from '../designSystem/components/primitives/Typography';
import { hapticEffect } from '../utils/useHaptic';
import LinearGradient from 'react-native-linear-gradient';

interface ArraySliderProps {
    values: number[];
    onChange: (index: number) => void;
    selectedIndex: number;
    parentScroll?: SharedValue<boolean>;
    height?: number;
    sliderWidth?: number;
    filledColor?: string;
    unfilledColor?: string;
    snapPointColor?: string;
    pointSize?: number;
    labels?: string[];
    labelStyle?: TextStyle;
    transformLabel?: (value: number) => string;
    useGradient?: boolean;
    gradient?: string[];
}

export const ArraySlider = ({
    values,
    onChange,
    selectedIndex,
    height = 15,
    sliderWidth,
    parentScroll,
    filledColor,
    unfilledColor,
    snapPointColor,
    pointSize = 12,
    labels = [],
    labelStyle = {},
    transformLabel,
    useGradient = false,
    gradient = ['#4facfe', '#00f2fe'],
}: ArraySliderProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    // Create a ref for the track
    const trackRef = useRef(null);

    // Use provided colors or fallback to theme colors
    const activeColor = filledColor || themeColors.slider_primary;
    const inactiveColor = unfilledColor || themeColors.slider_secondary;
    const snapColor = snapPointColor || themeColors.slider_secondary;

    const safeIndex = Math.max(0, Math.min(selectedIndex, values?.length ? values.length - 1 : 0));
    const totalSteps = values?.length ? values.length - 1 : 0;
    const thumbSize = 28;

    // Auto-generate labels if not provided
    const autoLabels = useMemo(() => {
        if (!values) return [];
        if (labels && labels.length > 0) {
            return labels;
        }

        return values.map(val => {
            if (transformLabel) {
                return transformLabel(val);
            }
            return `${val}`;
        });
    }, [labels, values, transformLabel]);

    // Initialize with a safe default width that will be updated on layout
    const dynamicSliderWidth = useSharedValue(sliderWidth || 350);
    const edgeInset = useSharedValue(15);

    const springConfig = {
        damping: 20,
        stiffness: 200,
        mass: 0.8,
        overshootClamping: true,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    };

    const adjustedStepWidth = useDerivedValue(() => {
        const width = dynamicSliderWidth.value - edgeInset.value * 2;
        if (width <= 0 || totalSteps <= 0) return 0;
        return width / totalSteps;
    }, [totalSteps]);

    // Calculate the initial progress for the selectedIndex
    const initialProgress = (() => {
        if (!values || values.length < 2) return edgeInset.value;
        const ratio = safeIndex / totalSteps;
        const baseWidth = sliderWidth || 350;
        const adjustedWidth = baseWidth - edgeInset.value * 2;
        return Math.max(
            edgeInset.value,
            Math.min(ratio * adjustedWidth + edgeInset.value, baseWidth - edgeInset.value),
        );
    })();

    // Use a single shared value for progress
    const progress = useSharedValue(initialProgress);

    // Ensure the slider is positioned correctly after initial mount
    useEffect(() => {
        if (!values || values.length < 2) return;
        // Find exact snap position for selected index after component mounted
        const exactSnapPosition = findNearestStep(initialProgress);

        // Animate to the exact position using spring animation
        progress.value = withSpring(exactSnapPosition, springConfig);
    }, []);

    // Update slider position when selectedIndex changes
    useEffect(() => {
        if (!values || values.length < 2) return;
        // Calculate the position for the current index
        const newProgress = edgeInset.value + safeIndex * adjustedStepWidth.value;
        // Snap to the correct position when selectedIndex changes
        if (adjustedStepWidth.value > 0) {
            // Animate to the new position
            progress.value = withSpring(newProgress, springConfig);
        }
    }, [selectedIndex, safeIndex, adjustedStepWidth.value]);

    // Calculate thumb position directly from progress
    const thumbPosition = useDerivedValue(() => {
        return Math.max(0, Math.min(progress.value - thumbSize / 2, dynamicSliderWidth.value - thumbSize));
    });

    const findNearestStep = (progressValue: number) => {
        'worklet';
        try {
            if (!isFinite(progressValue)) return edgeInset.value;
            if (adjustedStepWidth.value <= 0) return edgeInset.value;

            const maxWidth = dynamicSliderWidth.value - edgeInset.value;
            const minWidth = edgeInset.value;

            // Clamp progress to valid range
            if (progressValue >= maxWidth) return maxWidth;
            if (progressValue <= minWidth) return minWidth;

            // Calculate step index
            const normalizedProgress = progressValue - minWidth;
            const stepIndex = Math.round(normalizedProgress / adjustedStepWidth.value);

            // Calculate snapped position
            return minWidth + stepIndex * adjustedStepWidth.value;
        } catch (err) {
            console.error(err);
            return edgeInset.value;
        }
    };

    const updateIndexFromProgress = (progressValue: number) => {
        'worklet';
        try {
            if (!isFinite(progressValue)) return 0;

            const minBound = edgeInset.value;
            const maxBound = dynamicSliderWidth.value - edgeInset.value;

            // Handle edge cases
            if (progressValue >= maxBound) return totalSteps;
            if (progressValue <= minBound) return 0;

            // Calculate normalized ratio
            const ratio = (progressValue - minBound) / (maxBound - minBound);

            // Find corresponding index
            const index = Math.round(ratio * totalSteps);
            return Math.max(0, Math.min(index, totalSteps));
        } catch (err) {
            console.error(err);
            return 0;
        }
    };

    // Handle pan gesture
    const panGesture = Gesture.Pan()
        .onBegin(() => {
            if (parentScroll) parentScroll.value = false;
            runOnJS(hapticEffect)(HapticFeedbackTypes.selection, undefined);

            // Cancel any existing animation
            cancelAnimation(progress);
        })
        .onChange(event => {
            if (!isFinite(event.changeX)) return;

            // Update progress directly during drag
            const newProgress = Math.max(
                edgeInset.value,
                Math.min(progress.value + event.changeX, dynamicSliderWidth.value - edgeInset.value),
            );
            progress.value = newProgress;
        })
        .onEnd(() => {
            if (parentScroll) parentScroll.value = true;

            // Snap to nearest step
            const snappedProgress = findNearestStep(progress.value);

            // Only call onChange after the animation finishes
            const newIndex = updateIndexFromProgress(snappedProgress);
            if (isFinite(newIndex)) {
                // Animate to snapped position
                progress.value = withSpring(
                    snappedProgress,
                    springConfig,
                    // Call onChange in the finished callback
                    finished => {
                        if (finished) {
                            runOnJS(onChange)(newIndex);
                            runOnJS(hapticEffect)(HapticFeedbackTypes.impactMedium, undefined);
                        }
                    },
                );
            }
        });

    // Handle track press
    const handleTrackPress = (event: GestureResponderEvent) => {
        if (!event?.nativeEvent) return;

        const locationX = event.nativeEvent.locationX || 0;
        if (!isFinite(locationX)) return;

        // Cancel any existing animation
        cancelAnimation(progress);

        // Snap to nearest step
        const snappedProgress = findNearestStep(locationX);

        // Update value after animation completes
        const newIndex = updateIndexFromProgress(snappedProgress);
        if (isFinite(newIndex)) {
            progress.value = withSpring(snappedProgress, springConfig, finished => {
                if (finished) {
                    runOnJS(onChange)(newIndex);
                    runOnJS(hapticEffect)(HapticFeedbackTypes.impactMedium, undefined);
                }
            });
        }
    };

    // Handle layout change
    const onContainerLayout = (event: LayoutChangeEvent) => {
        if (!event?.nativeEvent?.layout) return;

        // If sliderWidth is provided, we'll use that fixed width
        // Otherwise, use the measured layout width
        if (sliderWidth === undefined) {
            const { width } = event.nativeEvent.layout;
            if (!isFinite(width) || width <= 0) return;

            if (width !== dynamicSliderWidth.value) {
                dynamicSliderWidth.value = width;

                // Recalculate progress when width changes
                const ratio = safeIndex / totalSteps;
                const adjustedWidth = width - edgeInset.value * 2;

                // Calculate the exact position for the selected index
                const calculatedProgress = Math.max(
                    edgeInset.value,
                    Math.min(ratio * adjustedWidth + edgeInset.value, width - edgeInset.value),
                );

                // Animate to position with spring
                progress.value = withSpring(calculatedProgress, springConfig);
            }
        } else {
            // Even with fixed width, ensure proper positioning on initial layout
            const ratio = safeIndex / totalSteps;
            const adjustedWidth = sliderWidth - edgeInset.value * 2;
            const calculatedProgress = Math.max(
                edgeInset.value,
                Math.min(ratio * adjustedWidth + edgeInset.value, sliderWidth - edgeInset.value),
            );

            // Animate to position with spring
            progress.value = withSpring(calculatedProgress, springConfig);
        }
    };

    // Handle point tap
    const handlePointTap = (index: number) => {
        if (index < 0 || index > totalSteps) return;

        // Cancel any existing animation
        cancelAnimation(progress);

        // Calculate new progress
        const newProgress = edgeInset.value + index * adjustedStepWidth.value;

        progress.value = withSpring(newProgress, springConfig, finished => {
            if (finished) {
                runOnJS(onChange)(index);
                runOnJS(hapticEffect)(HapticFeedbackTypes.impactMedium, undefined);
            }
        });
    };

    // Calculate positions
    const trackTopPosition = Math.max(0, (Math.max(thumbSize, height) - height) / 2);
    const pointTopPosition = Math.max(0, (Math.max(thumbSize, height) - pointSize) / 2);

    // Create animated styles from single progress value
    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: thumbPosition.value }],
    }));

    const animatedTrackStyle = useAnimatedStyle(() => ({
        width: progress.value,
    }));

    // Render guard - return null if values are invalid
    if (!values || values.length < 2) {
        console.error('ArraySlider requires at least 2 values');
        return null;
    }

    const ThumbSVG = React.memo(() => (
        <Animated.View
            style={{
                width: 28,
                height: 28,
                borderRadius: 25,
                borderWidth: 4,
                borderColor: '#ffffff',
                backgroundColor: '#58545D',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 3,
                },
                shadowOpacity: 0.27,
                shadowRadius: 4.65,
                elevation: 6,
            }}>
            <Animated.View style={{ backgroundColor: '#FFFFFF', height: 3, width: 10, borderRadius: 20 }} />
            <Animated.View style={{ backgroundColor: '#FFFFFF', height: 3, width: 10, borderRadius: 20 }} />
        </Animated.View>
    ));

    return (
        <Animated.View
            style={[
                tailwind.style('w-full'),
                {
                    marginVertical: 15,
                    // Only apply fixed width if sliderWidth is provided
                    ...(sliderWidth !== undefined ? { width: sliderWidth } : {}),
                },
            ]}
            onLayout={onContainerLayout}>
            {/* Container with additional padding-bottom to ensure labels are visible */}
            <Animated.View
                style={[
                    tailwind.style('relative'),
                    {
                        height: Math.max(thumbSize, height),
                        paddingBottom: autoLabels.length > 0 ? 25 : 0,
                    },
                ]}>
                {/* Slider Track */}
                <Animated.View
                    ref={trackRef}
                    onTouchStart={handleTrackPress}
                    style={[
                        {
                            width: '100%',
                            height: height,
                            borderRadius: height / 2,
                            backgroundColor: inactiveColor,
                            position: 'absolute',
                            top: trackTopPosition,
                            left: 0,
                            zIndex: 1,
                        },
                    ]}
                />

                {/* Progress Track */}
                {useGradient ? (
                    <Animated.View
                        style={[
                            {
                                height: height,
                                position: 'absolute',
                                top: trackTopPosition,
                                left: 0,
                                borderRadius: height / 2,
                                zIndex: 2,
                                overflow: 'hidden',
                            },
                            animatedTrackStyle,
                        ]}
                        pointerEvents="none">
                        <LinearGradient
                            colors={gradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{
                                height: '100%',
                                width: '100%',
                                borderRadius: height / 2,
                            }}
                        />
                    </Animated.View>
                ) : (
                    <Animated.View
                        style={[
                            {
                                height: height,
                                backgroundColor: activeColor,
                                position: 'absolute',
                                top: trackTopPosition,
                                left: 0,
                                borderRadius: height / 2,
                                zIndex: 2,
                            },
                            animatedTrackStyle,
                        ]}
                        pointerEvents="none"
                    />
                )}

                {/* Step Points with optimized rendering */}
                {Array.from({ length: values.length }, (_, index) => {
                    const pointPosition = edgeInset.value + index * adjustedStepWidth.value;
                    const label = autoLabels[index] || '';
                    const isActive = safeIndex === index;

                    const totalHeight = Math.max(thumbSize, height) + 25; // Height including label area

                    return (
                        <React.Fragment key={index}>
                            {/* Full vertical connecting touch area */}
                            <TouchableOpacity
                                testID="slider_below_area_clicked"
                                accessibilityRole="button"
                                activeOpacity={0.7}
                                onPress={() => handlePointTap(index)}
                                style={{
                                    position: 'absolute',
                                    width: pointSize * 3,
                                    height: totalHeight,
                                    top: 0,
                                    left: 0,
                                    zIndex: 4,
                                    transform: [{ translateX: pointPosition - pointSize * 1.5 }],
                                }}
                                accessibilityLabel={`Add tip of ${label} rupees`}>
                                {/* Empty view, just for touch area */}
                            </TouchableOpacity>

                            {/* The visible snap point */}
                            <TouchableOpacity
                                accessibilityRole="button"
                                testID="slider_clicked"
                                activeOpacity={0.7}
                                onPress={() => handlePointTap(index)}
                                style={{
                                    position: 'absolute',
                                    width: pointSize * 3,
                                    height: pointSize * 3,
                                    top: pointTopPosition - pointSize,
                                    left: 0,
                                    zIndex: 5,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transform: [{ translateX: pointPosition - pointSize * 1.5 }],
                                }}>
                                <Animated.View
                                    style={[
                                        {
                                            width: pointSize,
                                            height: pointSize,
                                            borderRadius: pointSize / 2,
                                            backgroundColor: snapColor,
                                            borderWidth: 2,
                                            borderColor: 'white',
                                        },
                                    ]}
                                />
                            </TouchableOpacity>

                            {/* Label below snap point as a touchable element */}
                            {label ? (
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    testID="slider_label_clicked"
                                    activeOpacity={0.7}
                                    onPress={() => handlePointTap(index)}
                                    style={{
                                        position: 'absolute',
                                        top: Math.max(thumbSize, height),
                                        left: 0,
                                        width: 35,
                                        height: 25,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        transform: [{ translateX: pointPosition - 20 }],
                                        zIndex: 5,
                                    }}>
                                    <Typography
                                        type="callout"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        style={[
                                            {
                                                textAlign: 'center',
                                                fontSize: 12,
                                                color: isActive ? '#313131' : '#9392A0',
                                            },
                                            labelStyle,
                                        ]}
                                        accessibilityRole={undefined}>
                                        {label}
                                    </Typography>
                                </TouchableOpacity>
                            ) : null}
                        </React.Fragment>
                    );
                })}

                {/* Slider Thumb with optimized gesture handling */}
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            {
                                width: thumbSize,
                                height: thumbSize,
                                position: 'absolute',
                                top: (Math.max(thumbSize, height) - thumbSize) / 2,
                                left: 0,
                                zIndex: 10,
                            },
                            animatedThumbStyle,
                        ]}>
                        <ThumbSVG />
                    </Animated.View>
                </GestureDetector>
            </Animated.View>
        </Animated.View>
    );
};
