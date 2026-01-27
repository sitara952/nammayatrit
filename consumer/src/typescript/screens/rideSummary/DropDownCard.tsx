import React, { useState } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import ChevronUp from '../../assets/svg/symbols/ChevronUp';
import ChevronDown from '../../assets/svg/symbols/ChevronDown';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

type DropdownCardProps = {
    title: string;
    initialState: boolean;
    children: React.ReactNode | undefined;
    enableAnimation: boolean | undefined;
    titleStyle: ViewStyle | undefined;
    testID: string;
    onToggle: (() => void) | undefined;
};

const DropdownCard: React.FC<DropdownCardProps> = ({
    title,
    initialState,
    children,
    enableAnimation = true,
    titleStyle,
    onToggle,
    testID,
}) => {
    const [isOpen, setIsOpen] = useState(initialState);
    const [contentHeight, setContentHeight] = useState(0);

    const animatedHeight = useAnimatedStyle(() => {
        return {
            height: withTiming(isOpen ? contentHeight : 0, {
                duration: 100,
                easing: Easing.ease,
            }),
        };
    });

    // Toggle the dropdown open/close state
    const toggleDropdown = () => {
        runOnJS(hapticEffect)(HapticFeedbackTypes.selection, undefined);
        setIsOpen(prev => !prev);
        if (onToggle) {
            onToggle();
        }
    };

    return (
        <Animated.View style={tailwind.style('w-full my-2 bg-white border border-gray-100 rounded-2xl shadow-sm ')}>
            {/* Hidden measurement view */}
            <View
                style={{ position: 'absolute', opacity: 0, zIndex: -10 }}
                onLayout={event => {
                    const { height } = event.nativeEvent.layout;
                    setContentHeight(height);
                }}>
                <View style={tailwind.style('px-4')}>{children}</View>
            </View>

            <TouchableOpacity
                testID={testID}
                accessibilityRole="button"
                onPress={toggleDropdown}
                style={[tailwind.style('flex-row items-center p-4 bg-white rounded-2xl'), titleStyle]}>
                <Typography
                    type="subhead-700"
                    style={[tailwind.style('flex-1'), titleStyle]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
                {isOpen ? <ChevronUp height={24} width={24} /> : <ChevronDown height={24} width={24} />}
            </TouchableOpacity>

            <Animated.View
                style={[{ overflow: 'hidden' }, tailwind.style('bg-white rounded-2xl')].concat(
                    enableAnimation ? [animatedHeight] : [],
                )}>
                {isOpen && <View style={tailwind.style('px-4')}>{children}</View>}
            </Animated.View>
        </Animated.View>
    );
};

export default DropdownCard;
