import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { AccessibilityInfo, StyleSheet, View, findNodeHandle } from 'react-native';
import { TextInput as GestureTextInput } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';

type OTPComponentProps = {
    value: string;
    onChange: (str: string) => void;
    error: boolean | undefined;
    isSuccess: boolean;
};

export type OTPComponentRef = {
    focusInput: () => void;
};

type OTPInputProps = {
    value: string;
    index: number;
    error: boolean | undefined;
    isSuccess: boolean;
};

const isNumber = (char: string) => /^[0-9]$/.test(char);

const OTPInput: React.FC<OTPInputProps> = React.memo(
    ({ value, index, error, isSuccess }) => {
        const opacity = useSharedValue(0);
        const textOpacity = useSharedValue(0);

        useEffect(() => {
            const hasValue = !!value[index];

            // Only animate opacity for smooth appearance - everything else is instant
            // Ultra-minimal animation for maximum performance
            if (hasValue) {
                opacity.value = withSpring(1, {
                    damping: 15,
                    stiffness: 500,
                    mass: 0.3,
                });
                textOpacity.value = withSpring(1, {
                    damping: 12,
                    stiffness: 600,
                    mass: 0.3,
                });
            } else {
                opacity.value = 0;
                textOpacity.value = 0;
            }
        }, [value[index]]);

        const hasValue = !!value[index];
        const isFilled = isSuccess || error;

        const animatedStyles = useAnimatedStyle(() => {
            return {
                height: hasValue ? 90 : 4,
                backgroundColor: isFilled
                    ? error
                        ? '#FEE3E3'
                        : isSuccess
                          ? '#F1FBD9'
                          : '#FFFFFF'
                    : hasValue
                      ? '#F7F7F7'
                      : '#C9C9C9',
                borderRadius: hasValue ? 11 : 1.5,
                width: 50,
                marginRight: index === 4 ? 0 : 19,
                marginTop: hasValue ? 0 : 86,
                justifyContent: 'center' as const,
                alignItems: 'center' as const,
                opacity: hasValue ? opacity.value : 1,
                transform: [
                    {
                        scale: hasValue ? 1 : 0.95,
                    },
                ],
            };
        }, [hasValue, isFilled, error, isSuccess, index]);

        const textAnimatedStyle = useAnimatedStyle(() => {
            return {
                opacity: textOpacity.value,
                transform: [
                    {
                        scale: hasValue ? 1 : 0.5,
                    },
                ],
            };
        }, [hasValue]);

        const getAccessibilityLabel = () => {
            const position = index + 1;
            const suffix = position === 1 ? 'st' : position === 2 ? 'nd' : position === 3 ? 'rd' : 'th';
            const inputType = index === 0 ? 'letter' : 'number';
            return `enter ${position}${suffix} ${inputType} in OTP`;
        };

        return (
            <Animated.View style={animatedStyles}>
                <Animated.Text
                    testID={`otp-input-${index}`}
                    accessibilityRole="text"
                    accessibilityLabel={getAccessibilityLabel()}
                    style={[tailwind.style('text-[78px] font-geist-mono-semibold text-[#3B3A3C]'), textAnimatedStyle]}>
                    {value[index] || ''}
                </Animated.Text>
            </Animated.View>
        );
    },
    (prevProps, nextProps) => {
        // Only re-render if the character at this index changes, or error/success state changes
        return (
            prevProps.value[prevProps.index] === nextProps.value[nextProps.index] &&
            prevProps.error === nextProps.error &&
            prevProps.isSuccess === nextProps.isSuccess
        );
    },
);

const OTPComponentNew = Object.assign(
    React.memo(
        forwardRef<OTPComponentRef, OTPComponentProps>(({ value = '', onChange, error, isSuccess }, ref) => {
            const inputRef = useRef<GestureTextInput | null>(null);
            const inputContainerRef = useRef<View>(null);
            const appSystemConfig = useAppSelector(selectAppConfig);
            const allowedLetters = appSystemConfig?.uiConfig.otpKeypadCharacters || 'IJKS'; // e.g 'ODIS' or 'IJKS'

            const isLetter = useCallback(
                (char: string) => new RegExp(`^[${allowedLetters}]$`).test(char),
                [allowedLetters],
            );

            useImperativeHandle(
                ref,
                () => ({
                    focusInput: () => {
                        if (inputContainerRef.current) {
                            const reactTag = findNodeHandle(inputContainerRef.current);
                            if (reactTag) {
                                AccessibilityInfo.setAccessibilityFocus(reactTag);
                            }
                        }
                    },
                }),
                [],
            );

            useEffect(() => {
                return () => {
                    if (inputRef.current) {
                        inputRef.current?.blur();
                    }
                };
            }, [inputRef.current]);

            const handleTextChange = useCallback(
                (text: string = '') => {
                    const upperText = text.toUpperCase();

                    // Process each character up to 5 characters
                    const newValue = Array.from(upperText)
                        .slice(0, 5)
                        .reduce((acc, char, index) => {
                            // Ensure char is defined before testing
                            if (!char) return acc;

                            if (index === 0) {
                                // First position: only allowed letters from config
                                if (isLetter(char)) {
                                    return acc + char;
                                }
                            } else {
                                // All other positions: only numbers
                                if (isNumber(char)) {
                                    return acc + char;
                                }
                            }
                            return acc;
                        }, '');

                    // Only update if the value is valid and different
                    if (newValue !== value) {
                        onChange(newValue);
                    }
                },
                [onChange, isLetter],
            );

            return (
                <View style={styles.container}>
                    <BottomSheetTextInput
                        ref={inputRef}
                        style={styles.input}
                        keyboardType="default"
                        autoCapitalize="characters"
                        value={value}
                        onChangeText={handleTextChange}
                        blurOnSubmit={false}
                        autoFocus={false}
                        maxLength={5}
                    />
                    <View
                        ref={inputContainerRef}
                        style={styles.inputContainer}
                        accessible={true}
                        accessibilityLabel="Enter your OTP - first letter I, J, or K, then 4 numbers">
                        {[0, 1, 2, 3, 4].map(index => (
                            <OTPInput key={index} value={value} index={index} error={error} isSuccess={isSuccess} />
                        ))}
                    </View>
                </View>
            );
        }),
    ),
    { displayName: 'OTPComponent' },
);

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingVertical: 10,
    },
    input: {
        fontSize: 24,
        textAlign: 'center',
        width: 1,
        height: 0,
        padding: 0,
        opacity: 0,
        display: 'flex',
        borderBottomWidth: 1,
        borderColor: '#000',
    },
    inputContainer: {
        width: '100%',
        flexDirection: 'row',
    },
    text: {
        fontSize: 24,
    },
    inDiv: {
        width: 50,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 20,
        marginRight: 10,
        borderRadius: 10,
        borderWidth: 1,
        borderStyle: 'solid',
    },
});

export default OTPComponentNew;
