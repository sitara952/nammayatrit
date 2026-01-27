import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import Animated, {
    Extrapolation,
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedProps,
    useAnimatedReaction,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
} from 'react-native-reanimated';
import { polar2Canvas, ReText, TAU } from 'react-native-redash';
import { Circle, Defs, G, Line, Mask, Path, Svg } from 'react-native-svg';
import { tailwind } from '../../tailwindTheme/tailwind';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { hapticEffect } from '@/typescript/utils/useHaptic';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const SIZE = 280;
const INNER_SIZE = 190;
const CENTER = { x: SIZE / 2, y: SIZE / 2 };

const notches = 360 / 12;
const angle = 30;

const last_angle = 360 - 30;
const start_angle = 0;

const LINES = 60;
const DELTA = TAU / LINES;

function toRad(degrees: number) {
    'worklet';
    return (degrees * Math.PI) / 180;
}

function toDeg(radians: number) {
    'worklet';
    return (radians * 180) / Math.PI;
}

const getStrokePosition = (angleInDegrees: number) => {
    'worklet';
    const angleInRadians = toRad(angleInDegrees);
    const x = CENTER.x * 0.58 * Math.cos(angleInRadians);
    const y = CENTER.y * 0.58 * Math.sin(angleInRadians);
    return { x, y };
};

const getCurrentStrokePosition = (angleInDegrees: number) => {
    'worklet';
    const angleInRadians = toRad(angleInDegrees);
    const x = CENTER.x * 0.835 * Math.cos(angleInRadians);
    const y = CENTER.y * 0.835 * Math.sin(angleInRadians);
    return { x, y };
};

const getTransform = (tranformAngle: number): ViewStyle => {
    'worklet';
    const { x, y } = getStrokePosition(tranformAngle);
    return {
        transform: [{ translateX: x }, { translateY: y }, { rotate: `${tranformAngle}deg` }],
    };
};

const Notches = () => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    return Array.from({ length: notches }, (_, index) => {
        const currentStrokeAngle = index * (360 / 12);
        return (
            <Animated.View
                key={index}
                style={[
                    tailwind.style(`absolute w-2 h-[1px] bg-[${themeColors.slider_primary}]`),
                    getTransform(currentStrokeAngle),
                ]}
            />
        );
    });
};

interface CircularSliderProps {
    min: number;
    max: number;
    onChange: (value: number) => void;
    value: number;
    parentScroll?: SharedValue<boolean>;
}

const SliderKnob = ({ currentAngle }: { currentAngle: SharedValue<number> }) => {
    const animatedPositionStyle = useAnimatedStyle(() => {
        const { x, y } = getCurrentStrokePosition(currentAngle.value === 330 ? 320 : currentAngle.value);
        return {
            transform: [{ translateX: x }, { translateY: y }],
        };
    }, [currentAngle]);
    return (
        <Animated.View style={[tailwind.style('bg-white absolute h-8 w-8 rounded-full z-10'), animatedPositionStyle]} />
    );
};

export const Arc = ({ currentAngle }: { currentAngle: SharedValue<number> }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const cx = SIZE / 2; // Center X
    const cy = SIZE / 2; // Center Y
    const STROKE_WIDTH = 38;
    const radius = INNER_SIZE / 2 + STROKE_WIDTH - 16; // Radius of the arc

    // Function to calculate (x, y) positions from an angle
    const getPositionFromAngle = (angle: number) => {
        'worklet';
        const radians = toRad(angle);
        return {
            x: cx + radius * Math.cos(radians),
            y: cy + radius * Math.sin(radians),
        };
    };

    const animatedProps = useAnimatedProps(() => {
        // Calculate start and end points
        const start = getPositionFromAngle(340); // Start at 0 degrees
        const end = getPositionFromAngle(currentAngle.value === 330 ? 320 : currentAngle.value); // End at the dynamic angle

        // Large arc flag (0 for small arc, 1 for large arc)
        const largeArcFlag = currentAngle.value >= 180 ? 1 : 0;
        return {
            d: `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`,
        };
    });

    return (
        <Svg width={SIZE} height={SIZE}>
            <Defs>
                <Mask id="mask">
                    <AnimatedPath
                        fill="none"
                        stroke={themeColors.slider_secondary}
                        strokeWidth={STROKE_WIDTH}
                        strokeLinecap="round"
                        animatedProps={animatedProps}
                    />
                </Mask>
            </Defs>
            <G mask="url(#mask)">
                <Circle
                    fill={themeColors.slider_primary}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={INNER_SIZE / 2 + STROKE_WIDTH + 10}
                />
                {new Array(LINES).fill(0).map((_, i) => {
                    const theta = DELTA * i;
                    const p1 = polar2Canvas({ theta, radius: INNER_SIZE / 2 + 18 }, CENTER);
                    const p2 = polar2Canvas({ theta, radius: INNER_SIZE / 2 + STROKE_WIDTH - 10 }, CENTER);

                    return (
                        <Line
                            stroke={themeColors.slider_secondary}
                            strokeWidth={2}
                            strokeLinecap="round"
                            key={i}
                            x1={p1.x}
                            y1={p1.y}
                            x2={p2.x}
                            y2={p2.y}
                        />
                    );
                })}
            </G>
        </Svg>
    );
};

export const CircularSlider = (props: CircularSliderProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const { min, max, onChange, value, parentScroll } = props;
    const findNearestMultiple = (angleValue: number) => {
        'worklet';
        const adjustedAngle = angleValue + 15; // Add half the step (30/2)
        return adjustedAngle - (adjustedAngle % 30); // Round to nearest 30
    };

    const currentAngle = useSharedValue(start_angle + (value - 1) * 30);

    const gesturePreviousTheta = useSharedValue(0);
    const previousChangedAngle = useSharedValue(0);

    const finalAngleNotReached = useSharedValue(1);

    useEffect(() => {
        gesturePreviousTheta.value = currentAngle.value;
    }, []);

    useAnimatedReaction(
        () => currentAngle.value,
        (currentAngle, previousAngle) => {
            if (previousAngle !== currentAngle) {
                runOnJS(hapticEffect)(HapticFeedbackTypes.selection, undefined);
            }
        },
        [currentAngle],
    );

    const gesture = Gesture.Pan()
        .onBegin(event => {
            parentScroll && (parentScroll.value = false);
            const { x, y } = event;
            // Increase the effective area by using a larger radius for calculations
            const deltaX = x - CENTER.x;
            const deltaY = y - CENTER.y;
            const angleRadians = Math.atan2(deltaY, deltaX);
            const angleDegrees = toDeg(angleRadians);

            // Handle negative angles and normalize to 0-360 range
            const normalizedAngle = angleDegrees < 0 ? angleDegrees + 360 : angleDegrees;

            // Find nearest valid angle step
            gesturePreviousTheta.value = findNearestMultiple(normalizedAngle);
        })
        .onChange(event => {
            const { x, y } = event;
            const deltaX = x - CENTER.x;
            const deltaY = y - CENTER.y;

            // Calculate distance from center to determine if touch is too far
            const distanceFromCenter = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxAllowedDistance = SIZE * 1.2; // Increased touch area for better interaction

            if (distanceFromCenter <= maxAllowedDistance) {
                const angleRadians = Math.atan2(deltaY, deltaX);
                const angleDegrees = toDeg(angleRadians);
                const normalizedAngle = angleDegrees < 0 ? angleDegrees + 360 : angleDegrees;
                const adjustedAngle = findNearestMultiple(normalizedAngle);

                const angleDiff = adjustedAngle - gesturePreviousTheta.value;

                // Handle angle wrapping around 360 degrees
                let mutableWrappedAngleDiff = angleDiff;
                if (Math.abs(angleDiff) > 180) {
                    mutableWrappedAngleDiff = angleDiff > 0 ? angleDiff - 360 : angleDiff + 360;
                }

                const nextAngle = currentAngle.value + (mutableWrappedAngleDiff - previousChangedAngle.value);
                const changeAngleFactor = Math.abs(mutableWrappedAngleDiff - previousChangedAngle.value) / angle;

                if (changeAngleFactor >= 0.5 && changeAngleFactor < 2 && finalAngleNotReached.value) {
                    if (nextAngle <= last_angle && nextAngle >= 0) {
                        currentAngle.value = nextAngle;
                        previousChangedAngle.value = mutableWrappedAngleDiff;
                    }
                } else {
                    finalAngleNotReached.value = changeAngleFactor === notches - 1 ? 0 : 1;
                }
            }
        })
        .onEnd(() => {
            parentScroll && (parentScroll.value = true);
            previousChangedAngle.value = 0;
            finalAngleNotReached.value = 1;
            const value =
                currentAngle.value === 330
                    ? max
                    : Math.round(interpolate(currentAngle.value, [0, 300], [min, max - 1], Extrapolation.CLAMP));
            runOnJS(onChange)(value);
        });

    const derivedRentalValue = useDerivedValue(() => {
        return currentAngle.value === 330
            ? `${Math.round(max)} hrs`
            : `${Math.round(interpolate(currentAngle.value, [0, 300], [min, max - 1], Extrapolation.CLAMP))} hrs`;
    });

    return (
        <Animated.View style={{ transform: [{ rotate: `-60deg` }], overflow: 'visible' }}>
            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={tailwind.style(
                        `bg-[${themeColors.slider_secondary}] h-[${SIZE}px] w-[${SIZE}px] rounded-full justify-center items-center`,
                    )}>
                    <Animated.View style={tailwind.style('absolute z-10')}>
                        <Arc currentAngle={currentAngle} />
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style(
                            `bg-[${themeColors.slider_dial}] h-[${INNER_SIZE}px] w-[${INNER_SIZE}px] rounded-full relative justify-center items-center`,
                        )}>
                        {Array.from({ length: notches }, (_, index) => (
                            <Notches key={index} />
                        ))}
                        <ReText
                            text={derivedRentalValue}
                            style={[
                                tailwind.style('absolute text-white text-2xl font-bold'),
                                { transform: [{ rotate: `60deg` }] },
                            ]}
                        />
                    </Animated.View>
                    <SliderKnob currentAngle={currentAngle} />
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};
