import classNames from 'classnames';
import React, { FC, useCallback } from 'react';
import {
    GestureResponderEvent,
    PressableProps,
    PressableStateCallbackType,
    StyleProp,
    TextStyle,
    View,
} from 'react-native';
import token from '@/typescript/designSystem/tokens';

import Typography, { TypographyTypes } from '@/typescript/designSystem/components/primitives/Typography';

import Animated, { BaseAnimationBuilder, EntryExitAnimationFunction } from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { ChildrenType } from '@/typescript/types/CommonTypes';
import { styleAdapter } from '@/typescript/utils/styleAdapter';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';

export type EntryOrExitLayoutType = BaseAnimationBuilder | typeof BaseAnimationBuilder | EntryExitAnimationFunction;

export interface AnimationProps {
    entering?: EntryOrExitLayoutType;
    exiting?: EntryOrExitLayoutType;
}

interface ButtonTypes extends PressableProps, AnimationProps {
    testID: string;
    children?: ChildrenType;
    disabled?: boolean;
    type: 'primary' | 'secondary' | 'secondary-inverse' | 'link' | 'secondary-danger' | 'clear';
    text?: string;
    textColor?: string;
    showLoader?: boolean;
    textWeight?: string;
    bgColor?: string;
    textType?: TypographyTypes;
    prefix?: ChildrenType;
    suffix?: ChildrenType;
    size?: 'xl' | 'lg' | 'md' | 'sm';
    isLoading?: boolean;
    numberOfLines?: number;
    colorChange?: boolean;
    hapticFeedback?: boolean;
    accessible?: boolean;
    accessibilityLabel?: string;
    accessibilityHint?: string;
    textStyle?: StyleProp<TextStyle> | undefined;
}

const Button: FC<ButtonTypes> = (props: ButtonTypes) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const {
        children,
        style = tailwind.style('justify-center'),
        disabled = false,
        type,
        textType = 'callout',
        text,
        textColor = themeColors.Button_Primary_Default_Text_Base,
        entering = undefined,
        exiting = undefined,
        prefix,
        suffix,
        bgColor,
        size = 'lg',
        isLoading = false,
        showLoader = true,
        numberOfLines = 1,
        colorChange = true,
        onPress,
        hapticFeedback = true,
        accessible,
        accessibilityLabel,
        accessibilityHint,
        testID,
        textStyle,
        ...otherProps
    } = props;
    const showLoaderInternal = (type === 'primary' && showLoader) || isLoading;
    const { animatedStyle, handlers } = useScaleAnimation();
    const bgStyleLogic = (pressed: boolean) => {
        if (type === 'primary') {
            if (disabled) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMid}] opacity-100`);
            }

            if (pressed) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMid}] opacity-50`);
            } else {
                return tailwind?.style(`bg-[${bgColor ? bgColor : themeColors.Button_primary_default_fill_base}]`);
            }
        }

        if (type === 'secondary' || type === 'secondary-inverse' || type === 'secondary-danger') {
            if (disabled) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMid}] opacity-50`);
            }

            if (pressed) {
                return tailwind?.style(`bg-[${themeColors.Fill_neutralMid}] opacity-50`);
            } else {
                return tailwind?.style(`bg-[${bgColor ? bgColor : themeColors.Fill_neutralMin}]`);
            }
        }
        if (type === 'clear') {
            return undefined;
        }
        return undefined;
    };

    const textWidth = () => {
        if (size === 'lg') {
            if (prefix && suffix) {
                return 'max-w-[83%]';
            }

            if (prefix || suffix) {
                return 'max-w-[95%]';
            }
        }

        if (size === 'md') {
            if (prefix && suffix) {
                return 'max-w-[83%]';
            }

            if (prefix || suffix) {
                return 'max-w-[90%]';
            }
        }

        return '';
    };

    const typographyStyles = classNames(textWidth(), {
        [textColor ? `text-[${textColor}]` : 'text-white']: type === 'primary' && !disabled,
        [textColor ? ` text-[${themeColors.Icon_neutralHigh}]` : `text-[${token?.text?.['text-weak']}]`]:
            (type === 'primary' && disabled) || (type === 'secondary' && disabled),
        [`text-[${token?.text?.['text-bold']}]`]: type === 'secondary' && !disabled,
        [`text-[${token?.text?.['text-inverse-error']}]`]: type === 'secondary-danger',
        [`text-[${themeColors.Button_primary_default_fill_base}]`]: type === 'link' && !disabled && colorChange,
        [`underline underline-offset-8`]: type === 'link' && !disabled,
    });
    const contentWrapperStyles = classNames({
        [`flex-row gap-[${token?.gap?.spacing?.[8]}] items-center`]: type !== 'secondary' || size !== 'xl',
        [`flex-col gap-[${token?.spacing?.[16]}]`]: type === 'secondary' && size === 'xl',
    });

    const handleOnPress = useCallback(
        (event: GestureResponderEvent) => {
            onPress?.(event);
            if (hapticFeedback) {
                hapticEffect(HapticFeedbackTypes.selection, undefined);
            }
        },
        [hapticFeedback, onPress],
    );

    const handlePress = useCallback(
        (event: GestureResponderEvent) => {
            if (!isLoading) {
                handleOnPress(event);
            } else {
                console.warn('Button is disabled due to data loading');
            }
        },
        [handleOnPress],
    );
    return (
        <Animated.View entering={entering} exiting={exiting} style={animatedStyle} accessible={false}>
            <Pressable
                testID={testID}
                accessible={accessible ?? true}
                accessibilityLabel={accessibilityLabel ?? undefined}
                accessibilityHint={accessibilityHint ?? undefined}
                accessibilityState={{ disabled: disabled }}
                accessibilityRole="button"
                style={(touchState: PressableStateCallbackType) => [
                    tailwind.style(`button-${type}-${size}`),
                    tailwind.style(bgStyleLogic(touchState.pressed)),
                    styleAdapter(style, touchState),
                ]}
                disabled={disabled}
                {...handlers}
                onPress={handlePress}
                {...otherProps}
                children={state => {
                    if ((state.pressed && showLoaderInternal) || isLoading) {
                        return (
                            <LottieWithFallback
                                style={tailwind.style('w-[50px] h-[50px] ml-[-15px]')}
                                source={
                                    type === 'secondary'
                                        ? require('../../src/typescript/assets/ny-service/mt_ic_loading_dots_black.lottie')
                                        : require('../../src/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')
                                }
                                autoPlay
                                loop
                                fallback={undefined}
                            />
                        );
                    } else {
                        if (children) {
                            return children;
                        } else {
                            if ((textType && text) || prefix || suffix) {
                                return (
                                    <View style={tailwind.style(contentWrapperStyles)}>
                                        {prefix && prefix}
                                        {text && (
                                            <Typography
                                                numberOfLines={numberOfLines}
                                                type={textType}
                                                style={[tailwind.style(typographyStyles), textStyle]}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {text}
                                            </Typography>
                                        )}
                                        {suffix && suffix}
                                    </View>
                                );
                            }
                            return <></>;
                        }
                    }
                }}></Pressable>
        </Animated.View>
    );
};

export default Button;
