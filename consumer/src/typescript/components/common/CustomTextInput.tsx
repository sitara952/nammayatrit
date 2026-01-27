import colors from '../../designSystem/colorPalette';
import { useState, useEffect, forwardRef } from 'react';
import { View, TextInput, StyleSheet, Text, ViewStyle, InputModeOptions, TextInputProps } from 'react-native';
import sharedStyles from '../../constants/style';
import React from 'react';

type CustomTextInputProps = TextInputProps & {
    bgColor: string | undefined;
    placeHolder: string | undefined;
    inputMode: InputModeOptions | undefined;
    errorText: string | undefined;
    columnName: string | undefined;
    onInput: ((val: string) => void) | undefined;
    input: string | undefined;
    shouldAllowInput: ((val: string) => boolean) | undefined;
    maxTextLen: number | undefined;
    autoFocus: boolean | undefined;
    validation: (val: string) => string | undefined;
    style: ViewStyle | undefined;
};

// Use forwardRef to allow parent components to access the inner TextInput
const CustomTextInput = forwardRef<TextInput, CustomTextInputProps>(
    (
        {
            bgColor,
            autoFocus = false,
            placeHolder,
            inputMode = 'text',
            errorText = '',
            columnName,
            onInput,
            input,
            maxTextLen,
            validation,
            style,
            ...props
        },
        ref,
    ): React.JSX.Element => {
        const [inputValue, setInputValue] = useState(input || '');
        const [componentError, setComponentError] = useState<string>(errorText);

        useEffect(() => {
            setInputValue(input || '');
        }, [input]);

        const onComponentInput = (val: string) => {
            setInputValue(val);
            onInput && onInput(val);

            if (validation) {
                const error = validation(val);
                setComponentError(error || '');
            }
        };

        useEffect(() => {
            setComponentError(errorText || '');
        }, [errorText]);

        return (
            <View style={[styles.wrapper, style]}>
                {columnName && <Text style={{ ...sharedStyles.bodyText3, ...styles.columnName }}>{columnName}</Text>}
                <View style={styles.touchableWrapper}>
                    <View
                        style={{
                            ...styles.signInContainer,
                            backgroundColor: bgColor || colors?.primitive.white[10],
                            borderWidth: 1,
                            borderColor: componentError
                                ? sharedStyles.errorColor.color
                                : colors?.recovered?.neutralMidLow,
                        }}>
                        <TextInput
                            ref={ref}
                            style={styles.inputText}
                            placeholder={placeHolder}
                            inputMode={inputMode}
                            onChangeText={onComponentInput}
                            value={inputValue} // Bind inputValue to the TextInput
                            maxLength={maxTextLen}
                            autoFocus={autoFocus}
                            {...props} // Spread additional TextInput props
                        />
                    </View>
                    {componentError && (
                        <View style={{ width: '100%', paddingTop: 5 }}>
                            <Text style={{ color: sharedStyles.errorColor.color }}>{componentError}</Text>
                        </View>
                    )}
                </View>
            </View>
        );
    },
);

const styles = StyleSheet.create({
    wrapper: {},
    columnName: {
        paddingTop: 8,
    },
    touchableWrapper: {
        paddingTop: 8,
    },
    signInContainer: {
        borderRadius: 10,
        padding: 7,
    },
    inputText: {
        fontSize: 16,
        paddingLeft: 10,
        width: '100%',
        minHeight: 35,
        color: '#000',
    },
});

export default CustomTextInput;
