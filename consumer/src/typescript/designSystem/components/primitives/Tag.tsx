import React from 'react';
import classNames from 'classnames';
import token from '../../tokens';
import Animated from 'react-native-reanimated';
import Typography, { TypographyTypes } from './Typography';

import { tailwind } from '../../../tailwindTheme/tailwind';
import { ChildrenType, StyleType } from '../../../types/CommonTypes';
import { AccessibilityInfo, AccessibilityRole, AccessibilityState, TextStyle } from 'react-native';

import { CurrencyText } from '@/typescript/components/CurrencyText';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

interface TagTypes {
    testID: string;
    children?: ChildrenType;
    text?: string;
    icon?: ChildrenType;
    type: 'secondary' | 'primary' | 'secondary-dark';
    size: 'md';
    style?: StyleType;
    disabled?: boolean;
    textStyle?: string;
    fontType?: TypographyTypes;
    selected?: boolean;
    onPress?: () => void;
    accessible?: boolean;
    accessibilityHint?: string;
    accessibilityLabel?: string;
    accessibilityRole?: AccessibilityRole;
    accessibilityState?: AccessibilityState;
    subText?: string;
    subTextStyle?: TextStyle;
    subTextType?: TypographyTypes;
}

const Tag = ({
    testID,
    text,
    icon,
    style,
    type,
    size,
    disabled = false,
    textStyle,
    fontType,
    selected = false,
    onPress = () => {},
    children,
    accessible,
    accessibilityHint,
    accessibilityLabel,
    accessibilityRole,
    accessibilityState,
    subText,
    subTextStyle,
    subTextType,
}: TagTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const currencySymbol = CURRENCY_SYMBOL.value;

    const typographyStyles = classNames({
        [`text-[${token?.text['text-bold']}]`]: (type === 'secondary' || type === 'secondary-dark') && !disabled,
        [`text-[${token?.text?.['text-weak']}]`]:
            (type === 'secondary' && disabled) || ((type === 'secondary' || type === 'secondary-dark') && disabled),
        [`text-[${token?.text?.['text-inverse-highContrast']}]`]:
            (type === 'secondary' && disabled) || ((type === 'secondary' || type === 'secondary-dark') && selected),
        [`text-[${token?.text?.['text-highContrast']}]`]:
            (type === 'primary' && disabled) || (type === 'primary' && selected),
    });

    const bgStyleLogic = (pressed: boolean) => {
        if (type === 'secondary') {
            if (selected) {
                return tailwind?.style(`bg-[${themeColors.Text_neutralHigh}] border-transparent`);
            }
            if (disabled) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMidLow}]`);
            }

            if (pressed) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMidLow}]`);
            } else {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMin}]`);
            }
        } else if (type === 'primary') {
            if (selected) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMin}] border-[#696969] border`);
            }

            if (disabled) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMidLow}]`);
            }

            if (pressed) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMidLow}] border-[#F5F5F5] border`);
            } else {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMin}] border-[#F5F5F5] border`);
            }
        } else if (type === 'secondary-dark') {
            if (selected) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralUltraHigh}] border-transparent`);
            }
            if (disabled) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMidLow}]`);
            }

            if (pressed) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMidLow}]`);
            } else {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMin}]`);
            }
        }
        return undefined;
    };

    const tagStyles = classNames(`flex-row items-center gap-[${token?.gap?.spacing?.[6]}]`, {
        'px-4': !text,
    });

    const onPressTag = () => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Selected ' + (accessibilityLabel ?? text ?? ''), {
            queue: true,
        });
        onPress();
    };

    return (
        <Pressable
            testID={testID}
            onPress={onPressTag}
            accessible={accessible ?? true}
            accessibilityHint={accessibilityHint}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole={accessibilityRole ?? 'button'}
            accessibilityState={accessibilityState ?? { selected: selected }}>
            {({ pressed }) => (
                <Animated.View
                    style={[
                        tailwind.style(`tag-${type}-${size}`),
                        tailwind.style(bgStyleLogic(pressed)),
                        tailwind.style(tagStyles),
                        style,
                    ]}>
                    {children || (
                        <>
                            {icon && icon}
                            {text ? (
                                text.includes('₹') ? (
                                    <CurrencyText
                                        textType={fontType ?? 'callout'}
                                        textStyle={tailwind.style(typographyStyles, textStyle)}
                                        currencyStyle={tailwind.style('font-inter-bold')}
                                        text={text.replace('₹', currencySymbol) ?? ''}
                                    />
                                ) : (
                                    <>
                                        <Typography
                                            accessible={false}
                                            numberOfLines={1}
                                            type={fontType ?? 'callout'}
                                            style={tailwind.style(typographyStyles, 'capitalize', textStyle)}
                                            isAnimate={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {text ?? ''}
                                        </Typography>
                                        {subText && (
                                            <Typography
                                                accessible={false}
                                                numberOfLines={1}
                                                type={subTextType ?? 'callout-1'}
                                                style={[tailwind.style('text-[#409F47]'), subTextStyle]}
                                                isAnimate={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {'(Most Accepted)'}
                                            </Typography>
                                        )}
                                    </>
                                )
                            ) : null}
                        </>
                    )}
                </Animated.View>
            )}
        </Pressable>
    );
};

export default Tag;
