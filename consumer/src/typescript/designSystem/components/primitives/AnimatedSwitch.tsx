import React, { forwardRef, useMemo } from 'react';
import { Gesture, GestureDetector, TapGestureHandler } from 'react-native-gesture-handler';
import {
    interpolate,
    interpolateColor,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { ViewStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useState, useEffect } from 'react';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

import { createComponent } from '@/typescript/utils/createComponent';

export interface BoxProps {
    style?: ViewStyle;
}

const Box = View;
const AnimatedBox = Animated.createAnimatedComponent(View);

function useControllableState<T>({
    value,
    defaultValue,
    onChange,
}: {
    value: T | undefined;
    defaultValue: T;
    onChange: (value: T) => void;
}) {
    const [state, setState] = useState(defaultValue);

    useEffect(() => {
        if (value !== undefined) {
            setState(value);
        }
    }, [value]);

    const handleChange = (newValue: T) => {
        if (value === undefined) {
            setState(newValue);
        }
        onChange?.(newValue);
    };

    return [value ?? state, handleChange] as const;
}

export type SwitchSize = 'sm';
export type SwitchTheme = 'base';

export interface SwitchProps extends BoxProps {
    defaultState?: boolean;
    state?: boolean;
    onStateChange?: (value: boolean) => void;
    disabled?: boolean;
    onStateColor?: string;
    offStateColor?: string;
    onStatePressedColor?: string;
    offStatePressedColor?: string;
    thumbTintColor?: string;
    size?: SwitchSize;
    themeColor?: SwitchTheme;
    label?: string | null;
    description?: string | null;
    hapticEnabled?: boolean;
    containerStyle?: ViewStyle;
    style?: ViewStyle;
    testID?: string;
}

const SPRING_CONFIG = {
    mass: 0.8,
    damping: 15,
    stiffness: 150,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
};

const AnimatedSwitch: React.FC<Partial<SwitchProps>> = forwardRef<typeof TapGestureHandler, Partial<SwitchProps>>(
    (props, _ref) => {
        const switchTheme = {
            themeColor: {
                base: {
                    activeWrapper: {
                        disabled: '#E0E0E0',
                        default: '#4CAF50',
                        active: '#388E3C',
                    },
                    inActiveWrapper: {
                        disabled: '#E0E0E0',
                        default: '#9E9E9E',
                        active: '#757575',
                    },
                    container: {
                        active: '#FFFFFF',
                        default: '#FFFFFF',
                    },
                },
            },
            size: {
                sm: {
                    switchInterpolateWidths: [16, 16, 16, 16],
                    thumbTranslateValue: 21,
                    thumbInitTranslateValue: 2,
                    thumbIntermediateTranslateValue: 4,
                    switchContainerStyle: {
                        height: 20,
                        borderRadius: 10,
                    },
                    thumbStyle: {
                        height: 16,
                        borderRadius: 8,
                        marginVertical: 2,
                    },
                },
            },
            thumbColor: '#FFFFFF',
        };

        const {
            onStateChange,
            state,
            defaultState = false,
            size = 'sm',
            onStateColor: onStateColorFromProps,
            offStateColor: offStateColorFromProps,
            disabled = false,
            offStatePressedColor: offStatePressedColorFromProps,
            onStatePressedColor: onStatePressedColorFromProps,
            thumbTintColor: thumbTintColorFromProps,
            themeColor = 'base',
            hapticEnabled = true,
            label,
            description,
            style,
            containerStyle,
            ...otherProps
        } = props;

        const [switchState, setSwitchState] = useControllableState({
            defaultValue: defaultState,
            value: state,
            onChange: (newValue: boolean) => {
                onStateChange?.(newValue);
            },
        });

        const thumbAnimated = useSharedValue(switchState ? 1 : 0);
        const hapticSelection = () => hapticEffect(HapticFeedbackTypes.selection, undefined);

        const onStateColor = disabled
            ? switchTheme.themeColor[themeColor]?.activeWrapper?.disabled
            : onStateColorFromProps || switchTheme.themeColor[themeColor]?.activeWrapper?.default;

        const offStateColor = disabled
            ? switchTheme.themeColor[themeColor]?.inActiveWrapper?.disabled
            : offStateColorFromProps || switchTheme.themeColor[themeColor]?.inActiveWrapper?.default;

        const offStatePressedColor =
            offStatePressedColorFromProps || switchTheme.themeColor[themeColor]?.inActiveWrapper?.active;

        const onStatePressedColor =
            onStatePressedColorFromProps || switchTheme.themeColor[themeColor]?.activeWrapper?.active;

        const thumbTintColor = thumbTintColorFromProps || switchTheme.thumbColor;

        const interpolatedWidths = useMemo(() => {
            return switchTheme.size[size]?.switchInterpolateWidths;
        }, [size, switchTheme.size]);

        const translatedThumbDistance = useMemo(() => {
            return switchTheme.size[size]?.thumbTranslateValue;
        }, [size, switchTheme.size]);

        const initTranslatedThumbDistance = useMemo(() => {
            return switchTheme.size[size]?.thumbInitTranslateValue;
        }, [size, switchTheme.size]);

        const intermediateThumbTranslateValue = useMemo(() => {
            return switchTheme.size[size]?.thumbIntermediateTranslateValue;
        }, [size, switchTheme.size]);

        useAnimatedReaction(
            () => switchState,
            currentState => {
                if (currentState) {
                    thumbAnimated.value = withSpring(1, SPRING_CONFIG);
                } else {
                    thumbAnimated.value = withSpring(0, SPRING_CONFIG);
                }
            },
        );

        const animatedSwitchBackground = useAnimatedStyle(() => {
            return {
                backgroundColor: interpolateColor(
                    thumbAnimated.value,
                    [0, 0.3, 0.7, 1],
                    [offStateColor, offStatePressedColor, onStatePressedColor, onStateColor],
                ),
            };
        });

        const activeContainerState = switchTheme.themeColor[themeColor]?.container?.active;
        const defaultContainerState = switchTheme.themeColor[themeColor]?.container?.default;

        const animatedContainerBackground = useAnimatedStyle(() => {
            return {
                backgroundColor: interpolateColor(
                    thumbAnimated.value,
                    [0, 0.3, 0.7, 1],
                    [defaultContainerState, activeContainerState, activeContainerState, defaultContainerState],
                ),
            };
        });

        const animatedThumbStyle = useAnimatedStyle(() => {
            return {
                backgroundColor: thumbTintColor,
                width: interpolate(thumbAnimated.value, [0, 0.3, 0.7, 1], interpolatedWidths),
                transform: [
                    {
                        translateX: interpolate(
                            thumbAnimated.value,
                            [0, 0.3, 0.7, 1],
                            [
                                initTranslatedThumbDistance,
                                initTranslatedThumbDistance,
                                translatedThumbDistance - intermediateThumbTranslateValue,
                                translatedThumbDistance,
                            ],
                        ),
                    },
                ],
            };
        });

        const switchTapGesture = Gesture.Tap()
            .enabled(!disabled)
            .maxDuration(99999999)
            .shouldCancelWhenOutside(true)
            .onBegin(() => {
                if (switchState) {
                    thumbAnimated.value = withSpring(0.7, SPRING_CONFIG);
                } else {
                    thumbAnimated.value = withSpring(0.3, SPRING_CONFIG);
                }
            })
            .onEnd(() => {
                if (switchState) {
                    thumbAnimated.value = withSpring(0, SPRING_CONFIG);
                } else {
                    thumbAnimated.value = withSpring(1, SPRING_CONFIG);
                }
                runOnJS(setSwitchState)(!switchState);
                hapticEnabled && hapticSelection && runOnJS(hapticSelection)();
            })
            .onTouchesCancelled(() => {
                if (switchState) {
                    thumbAnimated.value = withSpring(1, SPRING_CONFIG);
                } else {
                    thumbAnimated.value = withSpring(0, SPRING_CONFIG);
                }
            });

        return (
            <GestureDetector gesture={switchTapGesture}>
                <AnimatedBox
                    style={[style, label ? (description ? {} : animatedContainerBackground) : {}]}
                    {...otherProps}>
                    <Box style={{}}>
                        {label}
                        {description}
                    </Box>
                    <AnimatedBox
                        style={[
                            switchTheme.size[size]?.switchContainerStyle,
                            animatedSwitchBackground,
                            containerStyle,
                        ]}>
                        <AnimatedBox style={[switchTheme.size[size]?.thumbStyle, animatedThumbStyle]} />
                    </AnimatedBox>
                </AnimatedBox>
            </GestureDetector>
        );
    },
);

export const Switch = createComponent<Partial<SwitchProps>>(AnimatedSwitch, {
    shouldMemo: true,
});
