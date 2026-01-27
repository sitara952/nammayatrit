import React, { useCallback, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, runOnJS } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Svg, Path, Line } from 'react-native-svg';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';

// Create styles once outside component to prevent recreation
const styles = StyleSheet.create({
    backspaceButton: {
        backgroundColor: '#F8F8F8',
        borderWidth: 0,
    },
    numberButton: {
        alignItems: 'center',
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        minHeight: 54,
    },
    numberButtonText: {
        color: '#656565',
        paddingTop: 7,
        fontFamily: 'GeistMono-SemiBold',
        fontSize: 27,
        lineHeight: 28,
    },
    numberPad: {
        minHeight: 330,
        backgroundColor: '#F8F8F8',
        width: '100%',
        paddingHorizontal: 8,
        paddingTop: 0,
    },
    numberRow: {
        flexDirection: 'row',
        flex: 1,
        width: '100%',
        height: 50,
    },
    numberRowNoMargin: {
        flexDirection: 'row',
        flex: 1,
        width: '100%',
        marginBottom: 0,
        height: 50,
    },
});

// Memoized button component to prevent unnecessary re-renders
const KeypadButton = React.memo<{
    label: string;
    onPress: (label: string) => void;
    isActive: boolean;
}>(
    ({ label, onPress, isActive }) => {
        const isLetter = isNaN(Number(label));
        const scale = useSharedValue(1);
        const backgroundColor = useSharedValue('rgba(255, 255, 255, 1)'); // white

        const tapGesture = Gesture.Tap()
            .onBegin(() => {
                'worklet';
                scale.value = withTiming(0.92, { duration: 40 });
                backgroundColor.value = isActive
                    ? withTiming('#F2F2F2', { duration: 40 })
                    : withTiming('rgba(255, 255, 255, 1)', { duration: 80 });
            })
            .onFinalize(() => {
                'worklet';
                scale.value = withTiming(1, { duration: 80 });
                backgroundColor.value = withTiming('rgba(255, 255, 255, 1)', { duration: 80 });
                runOnJS(onPress)(label);
            });

        const animatedStyle = useAnimatedStyle(() => ({
            // transform: [{ scale: scale.value }],
            backgroundColor: backgroundColor.value,
        }));

        return (
            <GestureDetector gesture={tapGesture}>
                <Animated.View
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={label}
                    style={[tailwind.style('items-center flex-1 justify-center min-h-[50px]'), animatedStyle]}
                    testID={`keyboard-number-${label}-disable-event`}>
                    <Typography
                        type="body"
                        style={[styles.numberButtonText]}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={`${isLetter ? 'Letter' : 'Number'} ${label}`}
                        accessibilityRole="text">
                        {label}
                    </Typography>
                </Animated.View>
            </GestureDetector>
        );
    },
    // Custom comparison function - re-render if label or isActive changes
    (prevProps, nextProps) => prevProps.label === nextProps.label && prevProps.isActive === nextProps.isActive,
);

// Memoized backspace button component
const BackspaceButton = React.memo<{
    onPress: () => void;
}>(
    ({ onPress }) => {
        const scale = useSharedValue(1);
        const backgroundColor = useSharedValue('rgba(255, 255, 255, 1)'); // white

        const tapGesture = Gesture.Tap()
            .onBegin(() => {
                'worklet';
                scale.value = withTiming(0.92, { duration: 40 });
                backgroundColor.value = withTiming('#F2F2F2', { duration: 40 });
            })
            .onFinalize(() => {
                'worklet';
                scale.value = withTiming(1, { duration: 80 });
                backgroundColor.value = withTiming('rgba(255, 255, 255, 1)', { duration: 80 });
                runOnJS(onPress)();
            });

        const animatedStyle = useAnimatedStyle(() => ({
            backgroundColor: backgroundColor.value,
        }));

        return (
            <GestureDetector gesture={tapGesture}>
                <Animated.View
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel="Backspace"
                    style={[tailwind.style('items-center flex-1 justify-center min-h-[50px]'), animatedStyle]}
                    testID={`keyboard-backspace-disable-event`}>
                    <Svg width="30" height="20" viewBox="0 0 48 32">
                        <Path
                            d="M16 4 h26 a2 2 0 0 1 2 2 v20 a2 2 0 0 1-2 2 H16 l-12-12 Z"
                            fill="#f9f9f9"
                            stroke="#555"
                            strokeWidth="3"
                            strokeLinejoin="round"
                        />
                        <Line x1="22" y1="11" x2="32" y2="21" stroke="#555" strokeWidth="3" strokeLinecap="round" />
                        <Line x1="32" y1="11" x2="22" y2="21" stroke="#555" strokeWidth="3" strokeLinecap="round" />
                    </Svg>
                </Animated.View>
            </GestureDetector>
        );
    },
    // Prevent re-renders - onPress reference should be stable via useCallback in parent
    () => true,
);

const OtpKeyboardComponent: React.FC<{
    showFirstRow: boolean;
    onNumberPress: (number: string) => void;
    onBackspacePress: () => void;
    otpChars: string;
    otp: string;
}> = ({ showFirstRow, onNumberPress, onBackspacePress, otpChars, otp }) => {
    // first 3 chars for firstRow, last char for lastRowFirst
    const firstRow = otpChars.slice(0, 3).split('');
    const lastRowFirst = otpChars[3] || 'S';

    // Animation for first row opacity
    const firstRowOpacity = useSharedValue(showFirstRow ? 0.4 : 1);

    // Animation for other rows opacity (inverse of first row)
    const otherRowsOpacity = useSharedValue(showFirstRow ? 1 : 0.4);

    useEffect(() => {
        firstRowOpacity.value = withTiming(showFirstRow ? 0.4 : 1, {
            duration: 60,
        });
        otherRowsOpacity.value = withTiming(showFirstRow ? 1 : 0.4, {
            duration: 60,
        });
    }, [showFirstRow]);

    const firstRowAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: firstRowOpacity.value,
        };
    });

    const otherRowsAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: otherRowsOpacity.value,
        };
    });

    // Direct callbacks without haptic feedback for maximum performance
    const handleBackspacePress = useCallback(() => {
        onBackspacePress();
    }, [onBackspacePress]);

    const handleNumberPress = useCallback(
        (label: string) => {
            onNumberPress(label);
        },
        [onNumberPress],
    );

    return (
        <View style={styles.numberPad}>
            <Animated.View style={[styles.numberRow, firstRowAnimatedStyle]}>
                {firstRow.map(label => (
                    <KeypadButton key={label} label={label} onPress={handleNumberPress} isActive={true} />
                ))}
            </Animated.View>
            <Animated.View style={[styles.numberRow, otherRowsAnimatedStyle]}>
                {[1, 2, 3].map(num => (
                    <KeypadButton
                        key={num}
                        label={String(num)}
                        onPress={handleNumberPress}
                        isActive={otp?.length >= 1}
                    />
                ))}
            </Animated.View>
            <Animated.View style={[styles.numberRow, otherRowsAnimatedStyle]}>
                {[4, 5, 6].map(num => (
                    <KeypadButton
                        key={num}
                        label={String(num)}
                        onPress={handleNumberPress}
                        isActive={otp?.length >= 1}
                    />
                ))}
            </Animated.View>
            <Animated.View style={[styles.numberRow, otherRowsAnimatedStyle]}>
                {[7, 8, 9].map(num => (
                    <KeypadButton
                        key={num}
                        label={String(num)}
                        onPress={handleNumberPress}
                        isActive={otp?.length >= 1}
                    />
                ))}
            </Animated.View>
            <View style={styles.numberRowNoMargin}>
                <Animated.View style={[{ flex: 1 }, firstRowAnimatedStyle]}>
                    <KeypadButton label={lastRowFirst} onPress={handleNumberPress} isActive={otp?.length >= 1} />
                </Animated.View>
                <Animated.View style={[{ flex: 1 }, otherRowsAnimatedStyle]}>
                    <KeypadButton label="0" onPress={handleNumberPress} isActive={otp?.length >= 1} />
                </Animated.View>
                <View style={{ flex: 1 }}>
                    <BackspaceButton onPress={handleBackspacePress} />
                </View>
            </View>
        </View>
    );
};

// Memoize the entire component to prevent re-renders when parent state changes
export const OtpKeyboard = React.memo(OtpKeyboardComponent, (prevProps, nextProps) => {
    // Only re-render if these specific props change
    return (
        prevProps.showFirstRow === nextProps.showFirstRow &&
        prevProps.onNumberPress === nextProps.onNumberPress &&
        prevProps.onBackspacePress === nextProps.onBackspacePress &&
        prevProps.otpChars === nextProps.otpChars
    );
});
