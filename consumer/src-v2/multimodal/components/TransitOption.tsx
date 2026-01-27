import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import Animated from 'react-native-reanimated';
import { Switch, Platform } from 'react-native';
import { Path, Svg } from 'react-native-svg';
import React, { ReactElement } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { getTransitOptionLabel } from '@/typescript/utils/MultiModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const TickIcon = () => {
    return (
        <Svg width={9} height={7} viewBox="0 0 9 7" fill="none">
            <Path d="M1 3l2.5 2.5L8 1" stroke="#016ACD" strokeWidth={1.35} strokeLinejoin="round" />
        </Svg>
    );
};

export interface SubOption {
    name: string;
    isSelected: boolean;
    onPress: () => void;
    isDisabled?: boolean;
}

export interface TransitOptionProps {
    icon: ReactElement;
    iconBgColor: string;
    title: string;
    subtitle: string;
    isEnabled: boolean;
    onToggle: (value: boolean) => void;
    subOptions: SubOption[];
    showIcon?: boolean;
}

const TransitSubOptionButton = ({
    name,
    onPress,
    isSelected,
    isDisabled = false,
}: {
    name: string;
    onPress: () => void;
    isSelected: boolean;
    isDisabled: boolean;
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const label = getTransitOptionLabel(name, userLanguageStrings);

    return (
        <Pressable
            testID={`${name?.split(' ')?.join('')?.toLowerCase()}-transit-sub-option-button`}
            onPress={onPress}
            disabled={isDisabled}
            accessibilityRole="button"
            accessibilityLabel={name + ' button'}
            accessibilityState={{ selected: isSelected, disabled: isDisabled }}
            style={[
                tailwind.style('rounded-[12px] px-[10px] py-[11px] flex-row items-center gap-[6px]'),
                tailwind.style(
                    isDisabled
                        ? 'border border-[#E6E6E6] bg-[#F5F5F5] opacity-50'
                        : isSelected
                          ? 'border border-[#016ACD] bg-[#85A6C612]'
                          : 'border border-[#F1F2F2] bg-white',
                ),
            ]}>
            <Animated.Text
                style={[
                    tailwind.style('text-[12px] font-areaNormal-extrabold'),
                    tailwind.style(isDisabled ? 'text-[#969696]' : isSelected ? 'text-[#016ACD]' : 'text-[#3B3A3C]'),
                ]}>
                {label}
            </Animated.Text>
            {isSelected && !isDisabled && <TickIcon />}
        </Pressable>
    );
};

const TransitOption: React.FC<TransitOptionProps> = ({
    icon,
    iconBgColor,
    title,
    subtitle,
    isEnabled,
    onToggle,
    subOptions,
    showIcon = true,
}) => {
    return (
        <Animated.View style={tailwind.style('py-[20px] border-b border-[#E6E6E6]')}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <Animated.View style={tailwind.style('flex-row items-center gap-[12px]')}>
                    {showIcon && (
                        <Animated.View
                            style={tailwind.style(
                                `bg-[${iconBgColor}] h-[42px] w-[42px] rounded-full flex-row items-center justify-center`,
                            )}
                            accessible={false}
                            importantForAccessibility="no-hide-descendants">
                            <Icon icon={icon} size={21} />
                        </Animated.View>
                    )}
                    <Animated.View>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[15px] font-areaNormal-extrabold text-[#3B3A3C] leading-[18px] pt-3px',
                            )}>
                            {title}
                        </Animated.Text>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[13px] font-areaNormal-extrabold text-[#969696] mt-[9px] leading-[20px] pt-3px',
                            )}>
                            {subtitle}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
                <Switch
                    trackColor={{ false: '#F0F1F4', true: '#016ACD' }}
                    thumbColor={'#FFFFFF'}
                    style={{
                        transform: [
                            { scaleX: Platform.OS === 'ios' ? 0.8 : 1 },
                            { scaleY: Platform.OS === 'ios' ? 0.8 : 1 },
                        ],
                    }}
                    onValueChange={onToggle}
                    value={isEnabled}
                />
            </Animated.View>

            {subOptions.length > 0 && (
                <Animated.View style={tailwind.style('mt-[20px] flex-row gap-[8px] flex-wrap')}>
                    {subOptions.map((option, index) => (
                        <TransitSubOptionButton
                            key={`${option.name}-${index}`}
                            name={option.name}
                            onPress={option.onPress}
                            isSelected={option.isSelected}
                            isDisabled={option.isDisabled ?? false}
                        />
                    ))}
                </Animated.View>
            )}
        </Animated.View>
    );
};

export default TransitOption;
