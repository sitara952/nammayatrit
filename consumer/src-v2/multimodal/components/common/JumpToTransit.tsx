import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { Icon } from './Icon';
import { AutoIcon } from '../svg/transport/AutoIcon';
import { NarrowArrowRight } from '../svg/Arrows';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type JumpToTransitProps = {
    onPress: () => void;
};

export const JumpToTransit: React.FC<JumpToTransitProps> = props => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Jump to current transit button`}
            onPress={props.onPress}
            testID="c84301f4-4cd1-40b1-812f-7ab75cc62033">
            <Animated.View
                style={tailwind.style(
                    'px-4 mx-4 py-2 rounded-full bg-[#0569C7] flex-row justify-between items-center',
                )}>
                <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-bold text-[#FFFFFF]')}>
                    {userLanguageStrings.Jumptocurrenttransit}
                </Animated.Text>
                <View style={tailwind.style('flex-row justify-between items-center')}>
                    <Icon icon={<AutoIcon fill={undefined} />} size={20} color="#FFFFFF" />
                    <Icon
                        style={{ transform: [{ rotate: '90deg' }] }}
                        icon={<NarrowArrowRight fill={undefined} />}
                        size={20}
                        color="#FFFFFF"
                    />
                </View>
            </Animated.View>
        </Pressable>
    );
};
