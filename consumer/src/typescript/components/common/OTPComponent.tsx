import React, { RefObject, useEffect, useRef, useState } from 'react';
import { Keyboard, TextInput, View, StyleSheet } from 'react-native';
import colors from '../../designSystem/colorPalette/index.ts'; // Make sure to define colors here or update as per your project structure
import sharedStyles from '../../constants/style';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';

type OTPInputProps = {
    onChange: (str: string) => void;
    onDelete: () => void;
    error: boolean;
};

const FourDigitInput: React.FC<OTPInputProps> = ({ onChange, onDelete, error }) => {
    const input1 = useRef<TextInput>(null);
    const input2 = useRef<TextInput>(null);
    const input3 = useRef<TextInput>(null);
    const input4 = useRef<TextInput>(null);
    const [focuses, setFocuses] = useState([0, 0, 0, 0]);

    const updateFocues = (arr: number[], index: number, val: number) => {
        return arr.map((item, i) => (i === index ? val : item));
    };
    useEffect(() => {
        setTimeout(() => {
            input1?.current?.focus();
            setFocuses(v => updateFocues(v, 0, 1));
        }, 500);
    }, []);

    const handleChange = (text: string, nextInput: RefObject<TextInput | null> | null) => {
        if (text.length === 1 && nextInput) {
            nextInput?.current?.focus();
        }
        if (text.length == 1 && nextInput == null) {
            Keyboard.dismiss();
        }

        onChange(text);
    };

    const handleBackspace = (text: string, prevInput: RefObject<TextInput | null> | null) => {
        if (text === '' && prevInput) {
            prevInput?.current?.focus();
        }
        onDelete();
    };

    return (
        <View style={styles1.inputContainer}>
            <TextInput
                accessibilityLabel="Text input field"
                ref={input1}
                style={{
                    ...styles1.input,
                    color: error ? sharedStyles.errorColor.color : '#14171F',
                    borderColor: error ? sharedStyles.errorColor.color : focuses[0] === 1 ? '#306AFE' : '#E0E3E8',
                }}
                keyboardType="numeric"
                maxLength={1}
                onFocus={_ => setFocuses(v => updateFocues(v, 0, 1))}
                onBlur={_ => setFocuses(v => updateFocues(v, 0, 0))}
                onChangeText={text => handleChange(text, input2)}
                onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && handleBackspace('', input1)}
            />
            <TextInput
                accessibilityLabel="Text input field"
                ref={input2}
                style={{
                    ...styles1.input,
                    color: error ? sharedStyles.errorColor.color : '#14171F',
                    borderColor: error ? sharedStyles.errorColor.color : focuses[1] === 1 ? '#306AFE' : '#E0E3E8',
                }}
                keyboardType="numeric"
                maxLength={1}
                onFocus={_ => setFocuses(v => updateFocues(v, 1, 1))}
                onBlur={_ => setFocuses(v => updateFocues(v, 1, 0))}
                onChangeText={text => handleChange(text, input3)}
                onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && handleBackspace('', input1)}
            />
            <TextInput
                accessibilityLabel="Text input field"
                ref={input3}
                onFocus={_ => setFocuses(v => updateFocues(v, 2, 1))}
                onBlur={_ => setFocuses(v => updateFocues(v, 2, 0))}
                style={{
                    ...styles1.input,
                    color: error ? sharedStyles.errorColor.color : '#14171F',
                    borderColor: error ? sharedStyles.errorColor.color : focuses[2] === 1 ? '#306AFE' : '#E0E3E8',
                }}
                keyboardType="numeric"
                maxLength={1}
                onChangeText={text => handleChange(text, input4)}
                onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && handleBackspace('', input2)}
            />
            <TextInput
                accessibilityLabel="Text input field"
                ref={input4}
                onFocus={_ => setFocuses(v => updateFocues(v, 3, 1))}
                onBlur={_ => setFocuses(v => updateFocues(v, 3, 0))}
                style={{
                    ...styles1.input,
                    color: error ? sharedStyles.errorColor.color : '#14171F',
                    borderColor: error ? sharedStyles.errorColor.color : focuses[3] === 1 ? '#306AFE' : '#E0E3E8',
                }}
                keyboardType="numeric"
                maxLength={1}
                onChangeText={text => handleChange(text, null)}
                onKeyPress={({ nativeEvent }) => nativeEvent.key === 'Backspace' && handleBackspace('', input3)}
            />
        </View>
    );
};

const styles1 = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
    },
    title: {
        fontSize: 18,
        marginBottom: 20,
    },
    inputContainer: {
        flexDirection: 'row',
    },
    input: {
        width: 50,
        height: 60,
        borderWidth: 1,
        borderRadius: 10,

        marginRight: 10,
        marginTop: 10,

        textAlign: 'center',
        fontSize: 18,
    },
});

type OTPComponentProps = {
    errorText: string | undefined;
    onComplete: (pin: string) => void;
    setErrorText: (pin: string) => void;
    setOtpValue: (func: (pin: string) => string) => void;
};

const OTPComponent: React.FC<OTPComponentProps> = ({ errorText = '', onComplete, setErrorText, setOtpValue }) => {
    const handleChangeText = (text: string) => {
        if (text == '') return;
        setErrorText('');

        setOtpValue((v: string) => v + text);
        if (text.length == 4) {
            onComplete(text);
        }
    };

    const handleDelete = () => {
        setOtpValue(v => v.slice(0, -1));
    };

    return (
        <View
            style={[
                tailwind.style('flex-row'),
                {
                    backgroundColor: colors.primitive.white[10],
                },
            ]}>
            <FourDigitInput error={errorText.length !== 0} onChange={handleChangeText} onDelete={handleDelete} />
        </View>
    );
};

export default OTPComponent;
