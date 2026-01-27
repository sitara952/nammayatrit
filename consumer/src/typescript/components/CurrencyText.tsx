import React, { useMemo } from 'react';
import { TypographyTypes } from '../designSystem/components/primitives/Typography';
import { StyleType } from '.././types/CommonTypes';
import Animated from 'react-native-reanimated';
import { tailwind } from '../tailwindTheme/tailwind';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

const CURRENCY_SYMBOLS = /([₹€$])/g;

interface CurrencyTextProps {
    text: string;
    textType: TypographyTypes;
    currencyStyle: StyleType;
    textStyle?: StyleType;
    accessible?: boolean;
    numberOfLines?: number;
}

export const CurrencyText = (props: CurrencyTextProps) => {
    const { textType, text, currencyStyle, textStyle, numberOfLines } = props;
    const currencySymbol = CURRENCY_SYMBOL.value;

    const textParts = useMemo(() => text.split(CURRENCY_SYMBOLS), [text]);

    const baseStyle = useMemo(() => [tailwind.style(`text-black ${textType}`), textStyle], [textType, textStyle]);

    return (
        <Animated.Text
            style={baseStyle}
            numberOfLines={numberOfLines}
            accessible={props.accessible === undefined ? true : props.accessible}>
            {textParts.map((part, index) =>
                part === '₹' || part === '€' || part === '$' ? (
                    <Animated.Text key={index} style={currencyStyle}>
                        {part === '₹' ? currencySymbol : part}
                    </Animated.Text>
                ) : (
                    <Animated.Text key={index}>{part}</Animated.Text>
                ),
            )}
        </Animated.Text>
    );
};
