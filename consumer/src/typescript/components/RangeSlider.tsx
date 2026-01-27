import React, { useRef, useMemo } from 'react';
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

interface RangeSliderProps {
    min: number;
    max: number;
    onChange: (value: number) => void;
    value: number;
    parentScroll?: SharedValue<boolean>;
    height?: number;
    sliderWidth?: number;
    step?: number;
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

export const RangeSlider = ({
    min = 0,
    max = 100,
    value,
    onChange,
    height = 15,
    sliderWidth,
    parentScroll,
    step = 1,
    filledColor,
    unfilledColor,
    snapPointColor,
    pointSize = 12,
    labels = [],
    labelStyle = {},
    transformLabel,
    useGradient = false,
    gradient = ['#4facfe', '#00f2fe'],
}: RangeSliderProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    // Create a ref for the track
    const trackRef = useRef(null);

    // Use provided colors or fallback to theme colors
    const activeColor = filledColor || themeColors.slider_primary;
    const inactiveColor = unfilledColor || themeColors.slider_secondary;
    const snapColor = snapPointColor || themeColors.slider_secondary;

    // Fix: More robust value initialization
    const safeMin = typeof min === 'number' ? min : 0;
    const safeMax = typeof max === 'number' ? max : 100;
    const safeValue = typeof value === 'number' ? value : safeMin;
    const safeStep = typeof step === 'number' && step > 0 ? step : 1;

    const clampedValue = Math.min(Math.max(safeValue, safeMin), safeMax);
    const thumbSize = 36;

    // Fix: More robust totalSteps calculation for min/max/step
    const safeDiff = Math.max(0.001, safeMax - safeMin); // Prevent division by zero
    const totalSteps = Math.max(1, Math.floor(safeDiff / safeStep));

    // Auto-generate labels based on min, max, and step values if not provided
    const autoLabels = useMemo(() => {
        if (labels && labels.length > 0) {
            // Use provided labels if they exist
            return labels;
        }

        // Generate labels based on min, max, and step
        return Array.from({ length: totalSteps + 1 }, (_, index) => {
            const labelValue = safeMin + index * safeStep;
            if (transformLabel) {
                return transformLabel(labelValue);
            }
            return `${labelValue}`;
        });
    }, [labels, safeMin, safeMax, safeStep, totalSteps, transformLabel]);

    // Initialize with a safe default width that will be updated on layout if needed
    const dynamicSliderWidth = useSharedValue(sliderWidth || 350);

    // Add inset margin to bring edge points inward
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
        const width = dynamicSliderWidth.value - edgeInset.value * 2; // Adjust for insets on both sides
        if (width <= 0 || totalSteps <= 0) return 0;
        return width / totalSteps;
    }, [totalSteps]);

    const initialProgress = (() => {
        if (safeMax <= safeMin) return edgeInset.value;

        const ratio = (clampedValue - safeMin) / (safeMax - safeMin);

        // Use sliderWidth if provided, otherwise use default width
        const baseWidth = sliderWidth || 350;
        const adjustedWidth = baseWidth - edgeInset.value * 2;
        return Math.max(
            edgeInset.value,
            Math.min(ratio * adjustedWidth + edgeInset.value, baseWidth - edgeInset.value),
        );
    })();

    // Use a single shared value for progress
    const progress = useSharedValue(initialProgress);

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

    const updateValueFromProgress = (progressValue: number) => {
        'worklet';
        try {
            if (!isFinite(progressValue)) return safeMin;

            const minBound = edgeInset.value;
            const maxBound = dynamicSliderWidth.value - edgeInset.value;

            // Handle edge cases
            if (progressValue >= maxBound) return safeMax;
            if (progressValue <= minBound) return safeMin;

            // Calculate normalized ratio
            const ratio = (progressValue - minBound) / (maxBound - minBound);

            // Calculate using min/max/step
            const rawValue = safeMin + ratio * (safeMax - safeMin);
            // Round to nearest step
            const stepsFromMin = Math.round((rawValue - safeMin) / safeStep);
            return safeMin + stepsFromMin * safeStep;
        } catch (err) {
            console.error(err);
            return safeMin;
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
            const newValue = updateValueFromProgress(snappedProgress);
            if (isFinite(newValue)) {
                // Animate to snapped position
                progress.value = withSpring(
                    snappedProgress,
                    springConfig,
                    // Call onChange in the finished callback
                    finished => {
                        if (finished) {
                            runOnJS(onChange)(newValue);
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
        const newValue = updateValueFromProgress(snappedProgress);
        if (isFinite(newValue)) {
            progress.value = withSpring(snappedProgress, springConfig, finished => {
                if (finished) {
                    runOnJS(onChange)(newValue);
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
                if (safeMax > safeMin) {
                    const ratio = (clampedValue - safeMin) / (safeMax - safeMin);
                    const adjustedWidth = width - edgeInset.value * 2;
                    progress.value = Math.max(
                        edgeInset.value,
                        Math.min(ratio * adjustedWidth + edgeInset.value, width - edgeInset.value),
                    );
                }
            }
        }
    };

    // Handle point tap
    const handlePointTap = (index: number) => {
        if (index < 0 || index > totalSteps) return;

        // Cancel any existing animation
        cancelAnimation(progress);

        // Calculate new progress
        const newProgress = edgeInset.value + index * adjustedStepWidth.value;

        // Calculate new value based on index
        const newValue = safeMin + index * safeStep;

        progress.value = withSpring(newProgress, springConfig, finished => {
            if (finished) {
                runOnJS(onChange)(newValue);
                runOnJS(hapticEffect)(HapticFeedbackTypes.impactMedium, undefined);
            }
        });
    };

    // Calculate positions more consistently
    const trackTopPosition = Math.max(0, (Math.max(thumbSize, height) - height) / 2);
    const pointTopPosition = Math.max(0, (Math.max(thumbSize, height) - pointSize) / 2);

    // Create animated styles from single progress value
    const animatedThumbStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: thumbPosition.value }],
    }));

    const animatedTrackStyle = useAnimatedStyle(() => ({
        width: progress.value,
    }));

    const ThumbSVG = React.memo(() => (
        <Animated.View
            style={{
                width: 36,
                height: 36,
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
                {Array.from({ length: totalSteps + 1 }, (_, index) => {
                    const pointPosition = edgeInset.value + index * adjustedStepWidth.value;
                    const label = autoLabels[index] || '';
                    const isActive = safeValue === safeMin + index * safeStep;

                    const totalHeight = Math.max(thumbSize, height) + 25; // Height including label area

                    return (
                        <React.Fragment key={index}>
                            {/* Full vertical connecting touch area */}
                            <TouchableOpacity
                                accessibilityRole="button"
                                testID="slider_below_area_clicked"
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
                                }}>
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
                                        width: 40,
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
                                                fontSize: 14,
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
