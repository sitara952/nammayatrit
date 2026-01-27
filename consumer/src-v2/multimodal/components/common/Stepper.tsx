import React, { useState } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { tailwind } from '../../../../src/typescript/tailwindTheme/tailwind';

const Minus = () => {
    return (
        <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <Path
                d="M10.75 5.55005V5.30005H10.5H1.5H1.25V5.55005V6.45005V6.70005H1.5H10.5H10.75V6.45005V5.55005Z"
                fill="#016ACD"
            />
            <Path
                d="M10.75 5.55005V5.30005H10.5H1.5H1.25V5.55005V6.45005V6.70005H1.5H10.5H10.75V6.45005V5.55005Z"
                stroke="#016ACD"
                strokeWidth="0.5"
            />
            <Path
                d="M10.75 5.55005V5.30005H10.5H1.5H1.25V5.55005V6.45005V6.70005H1.5H10.5H10.75V6.45005V5.55005Z"
                stroke="#016ACD"
                strokeWidth="0.5"
            />
        </Svg>
    );
};

const Plus = () => {
    return (
        <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <Path
                d="M6.70078 1.5V1.25H6.45078H5.55078H5.30078V1.5V10.5V10.75H5.55078H6.45078H6.70078V10.5V1.5Z"
                fill="#016ACD"
                stroke="#016ACD"
                strokeWidth="0.5"
            />
            <Path
                d="M10.75 5.55005V5.30005H10.5H1.5H1.25V5.55005V6.45005V6.70005H1.5H10.5H10.75V6.45005V5.55005Z"
                fill="#016ACD"
                stroke="#016ACD"
                strokeWidth="0.5"
            />
        </Svg>
    );
};

interface StepperProps {
    value?: number;
    defaultValue?: number;
    onChange?: (value: number) => void;
    onIncrement?: () => void;
    onDecrement?: () => void;
    minValue?: number;
    maxValue?: number;
    disabled?: boolean;
}

export const Stepper = ({
    value: controlledValue,
    defaultValue = 0,
    onChange,
    onIncrement,
    onDecrement,
    minValue = 1,
    maxValue = 99,
    disabled = false,
}: StepperProps) => {
    // Only set internal state from defaultValue on initial mount
    const [internalValue, setInternalValue] = useState(controlledValue !== undefined ? controlledValue : defaultValue);

    // Determine if component is controlled
    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const handleIncrement = () => {
        if (currentValue >= maxValue) return;

        const newValue = currentValue + 1;
        // Always update internal state for uncontrolled mode
        setInternalValue(newValue);
        onChange?.(newValue);
        onIncrement?.();
    };

    const handleDecrement = () => {
        if (currentValue <= minValue) return;

        const newValue = currentValue - 1;
        // Always update internal state for uncontrolled mode
        setInternalValue(newValue);
        onChange?.(newValue);
        onDecrement?.();
    };

    return (
        <Animated.View style={tailwind.style(`p-13px rounded-[20px] flex-row items-center bg-[#ffffff]`)}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Decrement Ticket count button"
                onPress={handleDecrement}
                testID="46b4c8aa-8bfd-4787-8529-9063687d90d7"
                style={({ pressed }) => [
                    tailwind.style(
                        'w-10 h-10 rounded-[14px] border border-[#F1F2F2] items-center justify-center',
                        pressed ? 'bg-gray-100' : 'bg-white',
                        currentValue <= minValue || disabled ? 'bg-[#E5E5E5] opacity-50' : 'opacity-100',
                    ),
                    {
                        shadowColor: '#ccc',
                        shadowOffset: { width: 0, height: 18 },
                        shadowOpacity: 0.26,
                        shadowRadius: 10,
                        elevation: 8,
                    },
                ]}
                disabled={disabled || currentValue <= minValue}>
                <Minus />
            </Pressable>

            <Animated.Text style={tailwind.style('text-center w-12 text-[16px] font-areaNormal-bold text-[#3B3A3C]')}>
                {String(currentValue).padStart(2, '0')}
            </Animated.Text>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Increment Ticket count button"
                testID={`09d3561a-ddcb-4a1c-ae02-c6727282e702`}
                onPress={handleIncrement}
                style={({ pressed }) => [
                    tailwind.style(
                        'w-10 h-10 rounded-[14px] border border-[#F1F2F2] items-center justify-center',
                        pressed ? 'bg-gray-100' : 'bg-white',
                        currentValue >= maxValue || disabled ? 'bg-[#E5E5E5] opacity-50' : 'opacity-100',
                        {
                            shadowColor: '#ccc',
                            shadowOffset: { width: 0, height: 18 },
                            shadowOpacity: 0.26,
                            shadowRadius: 10,
                            elevation: 8,
                        },
                    ),
                ]}
                disabled={disabled || currentValue >= maxValue}>
                <Plus />
            </Pressable>
        </Animated.View>
    );
};
