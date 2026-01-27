import React, { useState, useEffect, useRef } from 'react';
import {
    Text,
    TextInput,
    View,
    StyleSheet,
    Platform,
    // eslint-disable-next-line no-restricted-imports
    Animated,
    NativeSyntheticEvent,
    TextInputSelectionChangeEventData,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import sharedStyles from '../../constants/style';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';

type OTPComponentProps = {
    value: string;
    onChange: (str: string) => void;
    error: boolean | undefined;
};

const OTPComponentNew: React.FC<OTPComponentProps> = ({ value, onChange, error }) => {
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const opacity = useRef(new Animated.Value(1)).current;
    const lastSelection = useRef<{ start: number; end: number } | null>(null);

    useEffect(() => {
        if (inputRef.current) {
            setTimeout(() => {
                inputRef?.current?.focus();
            }, 500);
        }

        if (Platform.OS === 'ios') {
            const clipboardListener = Clipboard.addListener(() => {
                handleClipboardChange();
            });

            return () => {
                clipboardListener.remove();
                if (inputRef.current) {
                    inputRef?.current?.blur();
                }
            };
        }

        return () => {
            if (inputRef.current) {
                inputRef?.current?.blur();
            }
        };
    }, []);

    const handleClipboardChange = async () => {
        try {
            const content = await Clipboard.getString();
            handlePastedContent(content);
        } catch (error) {
            console.error('Failed to read clipboard:', error);
        }
    };

    const handlePastedContent = (content: string) => {
        const numbers = content.replace(/\D/g, '');
        const otp = numbers.slice(0, 4);
        if (otp.length > 0) {
            onChange(otp);
        }
    };

    useEffect(() => {
        const blink = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
            ]),
        );

        blink.start();
        return () => blink.stop();
    }, [value.length, isFocused]);

    const handleTextChange = (text: string) => {
        if (text.length > 4) {
            const digitsOnly = text.replace(/\D/g, '');
            if (digitsOnly.slice(0, 4) === value) {
                return;
            }
            onChange(digitsOnly.slice(-4));
            return;
        }
        const otp = text.replace(/\D/g, '').slice(0, 4);
        onChange(otp);
    };

    const handleSelectionChange = async (event: NativeSyntheticEvent<TextInputSelectionChangeEventData>) => {
        const selection = event.nativeEvent.selection;

        if (
            lastSelection.current &&
            selection.start === selection.end &&
            selection.start > lastSelection.current.end + 1
        ) {
            const content = await Clipboard.getString();
            handlePastedContent(content);
        }

        lastSelection.current = selection;
    };

    const handleFocus = () => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleLongPress = async () => {
        if (value) {
            try {
                await Clipboard.setString(value);
            } catch (error) {
                console.error('Failed to copy:', error);
            }
        } else {
            try {
                const content = await Clipboard.getString();
                handlePastedContent(content);
            } catch (error) {
                console.error('Failed to paste:', error);
            }
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
            <Animated.Text style={[styles.text, { opacity, color: '#306AFE' }]}>{'|'}</Animated.Text>
        ) : null;
    };

    const renderDigitBox = (index: number) => {
        const isCurrentPosition = value.length === index;
        const borderColor = error ? sharedStyles.errorColor.color : isCurrentPosition ? '#306AFE' : '#E0E3E8';

        return (
            <TouchableWithoutFeedback
                accessibilityRole="button"
                testID="098add4c-f360-4e2c-96df-8494275fad7f"
                key={index}
                onPress={handleFocus}
                onLongPress={handleLongPress}>
                <View style={[styles.inDiv, { borderColor }]}>
                    {isCurrentPosition ? (
                        getAnimatedText()
                    ) : (
                        <Text style={{ ...styles.text, color: getColor() }}>{value[index] || ''}</Text>
                    )}
                </View>
            </TouchableWithoutFeedback>
        );
    };

    return (
        <View style={styles.container}>
            <TextInput
                accessibilityLabel="Text input field"
                ref={inputRef}
                style={styles.input}
                keyboardType="numeric"
                value={value}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChangeText={handleTextChange}
                onSelectionChange={handleSelectionChange}
            />
            <View style={styles.inputContainer}>{[0, 1, 2, 3].map(index => renderDigitBox(index))}</View>
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
        width: 80,
        padding: 10,
        display: 'none',
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
