import classNames from 'classnames';
import React from 'react';
import { TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import token from '../../tokens/index';

import { tailwind } from '../../../tailwindTheme/tailwind';
import { ChildrenType } from '../../../types/CommonTypes';
import { styleAdapter } from '../../../utils/styleAdapter';

import { useConfigContext } from '@/typescript/context/ConfigContext';

type InputTypes = TextInputProps & {
    type: 'secondary';
    prefix: ChildrenType | undefined;
    suffix: ChildrenType | undefined;
    containerStyle: ViewStyle | undefined;
    accessibleLabel: string | undefined;
};

const Input = React.forwardRef(
    (
        {
            type,
            prefix,
            suffix,
            placeholder,
            editable = true,
            style: inputStyle,
            containerStyle,
            autoFocus = false,
            accessibleLabel,
            ...otherProps
        }: InputTypes,
        ref: React.Ref<TextInput>,
    ) => {
        const configManager = useConfigContext();
        const themeColors = configManager.get('themeColors');
        const inputStyles = classNames(`input-${type}`, {
            [themeColors.Fill_neutralMidLow as string]: editable,
        });

        return (
            <View style={[tailwind?.style(inputStyles), styleAdapter(containerStyle, undefined)]}>
                {prefix}
                <TextInput
                    ref={ref}
                    autoFocus={autoFocus}
                    placeholder={placeholder}
                    placeholderTextColor={token?.text?.['text-weak']}
                    accessible
                    accessibilityLabel={accessibleLabel ?? placeholder}
                    style={[tailwind?.style('body-2 mb-[3px] flex-1 leading-[18px]'), inputStyle]}
                    editable={editable}
                    {...otherProps}
                />
                {suffix}
            </View>
        );
    },
);

export default Input;
