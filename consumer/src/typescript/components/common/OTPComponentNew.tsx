import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-restricted-imports
import { Animated, Platform, Text, TextInput, TextStyle, ViewStyle, AccessibilityInfo } from 'react-native';
import { StyleSheet, View } from 'react-native';
import sharedStyles from '../../constants/style';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import { getHash, removeListener, startOtpListener } from 'react-native-otp-verify';

type OTPComponentProps = {
    value: string;
    onChange: (str: string) => void;
    error: boolean | undefined;
    cellStyle: ViewStyle | undefined;
    textStyle: TextStyle | undefined;
};

const OTPComponentNew: React.FC<OTPComponentProps> = ({ value, onChange, error, cellStyle = {}, textStyle = {} }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const opacity = useRef(new Animated.Value(1)).current;
    useEffect(() => {
        // Open the keyboard automatically when the component loads
        if (inputRef.current) {
            setTimeout(() => {
                inputRef?.current?.focus();
            }, 500);
        }
        return () => {
            if (inputRef.current) {
                inputRef?.current?.blur();
            }
        };
    }, []);

    useEffect(() => {
        if (Platform.OS == 'android') {
            const fetchHash = async () => {
                try {
                    const hash = await getHash();
                    console.info('Hash fetched:', hash);
                } catch (error) {
                    console.error('Error fetching hash:', error);
                }
            };
            const handleOtpMessage = (message: string) => {
                console.info('Received OTP message:', message);
                const otpMatch = message && message.match(/\b\d{4}\b/);
                if (otpMatch) {
                    handleTextChange(otpMatch[0]);
                    console.info('OTP matched:', otpMatch[0]);
                } else {
                    console.info('No OTP found in the message.');
                }
            };
            startOtpListener(handleOtpMessage);
            fetchHash();
            return () => removeListener();
        }
        return () => {};
    }, []);

    // Animated value for opacity
    useEffect(() => {
        const blink = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0, // Fade out
                    duration: 500, // Duration for fading out
                    useNativeDriver: true, // Use native driver for better performance
                }),
                Animated.timing(opacity, {
                    toValue: 1, // Fade in
                    duration: 500, // Duration for fading in
                    useNativeDriver: true, // Use native driver for better performance
                }),
            ]),
        );

        blink.start(); // Start the animation loop

        // Cleanup the animation when the component is unmounted
        return () => blink.stop();
    }, [value.length, isFocused]);

    const handleTextChange = (text: string) => {
        // Only keep the first 4 digits
        if (text.length > 4) {
            // Remove all non-digit characters
            const digitsOnly = text.replace(/\D/g, '');
            if (digitsOnly.slice(0, 4) == value) {
                return;
            }
            onChange(digitsOnly.slice(-4));
            const lastChar = digitsOnly.slice(-1);
            if (lastChar) {
                const acc = AccessibilityInfo;
                if (typeof acc.announceForAccessibilityWithOptions === 'function') {
                    acc.announceForAccessibilityWithOptions(lastChar, { queue: true });
                } else {
                    AccessibilityInfo.announceForAccessibility(lastChar);
                }
            }
            return;
        }
        const otp = text.replace(/\D/g, '').slice(0, 4);
        onChange(otp);
        const lastChar = otp.length > 0 ? otp.at(-1) || '' : '';
        if (lastChar) {
            const acc = AccessibilityInfo;
            if (typeof acc.announceForAccessibilityWithOptions === 'function') {
                acc.announceForAccessibilityWithOptions(lastChar, { queue: true });
            } else {
                AccessibilityInfo.announceForAccessibility(lastChar);
            }
        }
    };

    const handleFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const getColor = () => {
        if (error) {
            return sharedStyles.errorColor.color;
        }

        return '#000000';
    };

    const getAnimatedText = () => {
        return isFocused ? (
            <Animated.Text style={[styles.text, { opacity, color: '#306AFE' }, textStyle]}>{'|'}</Animated.Text>
        ) : null;
    };

    return (
        <View style={styles.container}>
            <TextInput
                accessibilityLabel="Text input field"
                ref={inputRef}
                style={styles.input}
                keyboardType="numeric"
                value={value}
                onFocus={_ => setIsFocused(true)}
                onBlur={_ => setIsFocused(false)}
                onChangeText={handleTextChange}
            />
            <View style={styles.inputContainer}>
                <TouchableWithoutFeedback
                    testID="fc633688-27e0-43a3-ba20-9578bd4beab3"
                    accessibilityRole="button"
                    onPress={handleFocus}
                    accessibilityLabel="enter 1st letter in OTP">
                    <View
                        style={{
                            ...styles.inDiv,
                            borderColor: error
                                ? sharedStyles.errorColor.color
                                : value.length == 0
                                  ? '#306AFE'
                                  : '#E0E3E8',
                            ...cellStyle,
                        }}>
                        {value.length == 0 ? (
                            getAnimatedText()
                        ) : (
                            <Text
                                style={{
                                    ...styles.text,
                                    ...textStyle,
                                    color: error ? sharedStyles.errorColor.color : '#000000',
                                }}>
                                {value[0] || ''}
                            </Text>
                        )}
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    testID="02badc0f-82b6-40c8-9967-f18d8f2d0b77"
                    onPress={handleFocus}
                    accessibilityRole="button"
                    accessibilityLabel="enter 2nd letter in OTP">
                    <View
                        style={{
                            ...styles.inDiv,
                            borderColor: error
                                ? sharedStyles.errorColor.color
                                : value.length == 1
                                  ? '#306AFE'
                                  : '#E0E3E8',
                            ...cellStyle,
                        }}>
                        {value.length == 1 ? (
                            getAnimatedText()
                        ) : (
                            <Text
                                style={{ ...styles.text, color: getColor(), ...textStyle }}
                                accessibilityLabel="enter 3rd letter in OTP">
                                {value[1] || ''}
                            </Text>
                        )}
                    </View>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                    accessibilityRole="button"
                    testID="ed6dedf0-f4ee-4a85-8596-579d436793f5"
                    onPress={handleFocus}>
                    <View
                        style={{
                            ...styles.inDiv,
                            borderColor: error
                                ? sharedStyles.errorColor.color
                                : value.length == 2
                                  ? '#306AFE'
                                  : '#E0E3E8',
                            ...cellStyle,
                        }}>
                        {value.length == 2 ? (
                            getAnimatedText()
                        ) : (
                            <Text style={{ ...styles.text, color: getColor(), ...textStyle }}>{value[2] || ''}</Text>
                        )}
                    </View>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                    testID="a61796d6-5f42-45bd-b818-ccc91fbbff58"
                    onPress={handleFocus}
                    accessibilityRole="button"
                    accessibilityLabel="enter 4th letter in OTP">
                    <View
                        style={{
                            ...styles.inDiv,
                            borderColor: error
                                ? sharedStyles.errorColor.color
                                : value.length >= 3
                                  ? '#306AFE'
                                  : '#E0E3E8',
                            ...cellStyle,
                        }}>
                        {value.length == 3 ? (
                            getAnimatedText()
                        ) : (
                            <Text style={{ ...styles.text, color: getColor(), ...textStyle }}>{value[3] || ''}</Text>
                        )}
                    </View>
                </TouchableWithoutFeedback>
            </View>
        </View>
    );
};

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
