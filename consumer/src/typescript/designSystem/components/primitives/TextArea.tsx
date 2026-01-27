import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { NativeSyntheticEvent, TextInputFocusEventData, TextInputProps, ViewStyle } from 'react-native';
import token from '../../tokens/index';

import { tailwind } from '../../../tailwindTheme/tailwind';
import { ChildrenType } from '../../../types/CommonTypes';
import { styleAdapter } from '../../../utils/styleAdapter';

import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import Animated, { useAnimatedStyle, interpolateColor, useSharedValue, withSpring } from 'react-native-reanimated';

import { useConfigContext } from '@/typescript/context/ConfigContext';

type TextAreaTypes = TextInputProps & {
    type: 'secondary' | 'primary';
    size: 'xl' | 'lg' | 'md' | 'sm';
    prefix: ChildrenType | undefined;
    suffix: ChildrenType | undefined;
    containerStyle: ViewStyle | undefined;
};

const TextArea = React.forwardRef(
    (
        {
            type,
            placeholder,
            editable = true,
            style: inputStyle,
            containerStyle,
            size,
            autoFocus = false,
            onFocus,
            onBlur,
            ...otherProps
        }: TextAreaTypes,
        ref: React.Ref<Animated.View>,
    ) => {
        const configManager = useConfigContext();
        const themeColors = configManager.get('themeColors');
        const [focused, setFocused] = useState(false);
        const inputStyles = classNames(`text-area-${type}`, {
            [themeColors.Fill_neutralMidLow as string]: editable,
        });

        const handleOnFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setFocused(true);
            onFocus?.(e);
        };

        const handleOnBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
            setFocused(false);
            onBlur?.(e);
        };

        const selectedSharedValue = useSharedValue(0);
        useEffect(() => {
            if (focused) {
                selectedSharedValue.value = withSpring(1, { duration: 900 });
            } else {
                selectedSharedValue.value = withSpring(0, { duration: 900 });
            }
        }, [focused]);

        const selectedBorderStyle = useAnimatedStyle(() => {
            return {
                borderColor: interpolateColor(
                    selectedSharedValue.value,
                    [0, 1],
                    [`${token?.default?.secondary?.outline?.default}`, '#323232'],
                ),
            };
        });

        return (
            <Animated.View
                ref={ref}
                style={[
                    tailwind?.style(inputStyles),
                    styleAdapter(containerStyle, undefined),
                    selectedBorderStyle,
                    { borderWidth: 1 },
                ]}>
                <BottomSheetTextInput
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    placeholderTextColor={token?.text?.['text-weak']}
                    style={[
                        tailwind?.style('body-2 mb-[3px] flex-1 leading-[18px]'),
                        inputStyle,
                        { textAlignVertical: 'top' },
                    ]}
                    editable={editable}
                    multiline={true}
                    numberOfLines={size === 'xl' ? 10 : 2}
                    {...otherProps}
                    onFocus={handleOnFocus}
                    onBlur={handleOnBlur}
                />
            </Animated.View>
        );
    },
);

export default TextArea;
