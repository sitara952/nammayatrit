import { tailwind } from '../../../../../src/typescript/tailwindTheme/tailwind';
import React, { useMemo } from 'react';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { TransitCost } from './TransitCost';
import { isUndefined } from 'lodash';
import { TrainIcon } from '@/src-v2/multimodal/components/svg/transport/TrainIcon';

import { Icon } from '@/typescript/components/Icon';
import StationSwitch from '@/src-v2/assets/svg/StationSwitchIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export type SwitchType = 'Train Switch' | 'Station Switch' | 'Direct Train';

export type RouteOptionCardProps = {
    viaPointName: string | undefined;
    switchType: SwitchType;
    arrivalTimes: string[];
    price: number;
    distance: number | undefined;
    onPress: (() => void) | undefined;
    quoteId: string | undefined;
    isSelected: boolean;
};

export const RouteOptionCard: React.FC<RouteOptionCardProps> = ({
    viaPointName,
    switchType,
    arrivalTimes,
    price,
    distance,
    onPress,
    isSelected,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const getSwitchIcon = () => {
        if (switchType === 'Direct Train') {
            return (
                <Animated.View style={tailwind.style('flex-row items-center mr-2')}>
                    <Icon icon={<TrainIcon fill={'#09941E'} />} size={16} color="#09941E" />
                </Animated.View>
            );
        }
        if (switchType === 'Train Switch') {
            return (
                <Animated.View style={tailwind.style('flex-row items-center mr-2')}>
                    <Animated.Text style={tailwind.style('text-[13px] text-[#09941E] font-areaNormal-extrabold')}>
                        →{' '}
                    </Animated.Text>
                    <Icon icon={<TrainIcon fill={'#09941E'} />} size={16} color="#09941E" />
                </Animated.View>
            );
        } else {
            return (
                <Animated.View style={tailwind.style('flex-row items-center mr-8 mt-1')}>
                    <Icon icon={<StationSwitch />} size={16} color="#09941E" />
                </Animated.View>
            );
        }
    };

    const distanceText = useMemo(() => {
        if (distance) {
            return distance > 1000 ? `${Math.round(distance / 1000)} km` : `${Math.round(distance)} m`;
        }
        return undefined;
    }, [distance]);

    return (
        <Pressable
            accessibilityRole="button"
            onPress={onPress}
            accessibilityLabel="Route Option Card button"
            testID="route-option-card">
            <Animated.View
                style={tailwind.style(
                    'bg-white rounded-[20px] p-4 mb-3 shadow-md',
                    isSelected ? 'border-2 border-blue-500' : '',
                )}>
                {!isUndefined(viaPointName) && viaPointName.trim() !== '' ? (
                    <Animated.Text
                        style={tailwind.style(
                            'text-[14px] leading-[15px] text-[#3B3A3C] font-areaNormal-extrabold tracking-[0.16px] capitalize mb-2',
                        )}>
                        {switchType === 'Train Switch' ? `${userLanguageStrings.Via}: ` : ''}
                        {viaPointName}
                    </Animated.Text>
                ) : null}

                <Animated.View style={tailwind.style('flex-row items-center mb-3')}>
                    {getSwitchIcon()}
                    <Animated.Text style={tailwind.style('text-[13px] text-[#656565] font-areaNormal-extrabold')}>
                        {switchType}
                    </Animated.Text>
                </Animated.View>

                <Animated.View style={tailwind.style('flex-row justify-between items-end')}>
                    <Animated.View style={tailwind.style('flex-row items-center')}>
                        <Animated.Text
                            style={tailwind.style('text-[12px] text-[#7E7E7E] font-areaNormal-extrabold mr-2')}>
                            {userLanguageStrings.ArrivesIn}
                        </Animated.Text>
                        <Animated.View style={tailwind.style('flex-row')}>
                            {arrivalTimes.map((time, index) => (
                                <Animated.View
                                    layout={LinearTransition.springify().damping(40).stiffness(300)}
                                    key={index}
                                    style={tailwind.style('items-start mr-2')}>
                                    <Animated.Text
                                        layout={LinearTransition.springify().damping(40).stiffness(300)}
                                        style={tailwind.style(
                                            'min-h-5 justify-center items-center px-[5px] rounded-[6px] bg-[#F4F4F4] overflow-hidden',
                                            `text-white font-areaNormal-extrabold text-[10px] leading-[20px] tracking-[0.2px]`,
                                            'text-[#097B42]',
                                        )}>
                                        {time}
                                    </Animated.Text>
                                </Animated.View>
                            ))}
                        </Animated.View>
                    </Animated.View>

                    <Animated.View style={tailwind.style('items-end')}>
                        <TransitCost cost={price} numberColor="#313131" rupeeColor="#313131" />
                        {!isUndefined(distance) ? (
                            <Animated.Text
                                style={tailwind.style('text-[12px] text-[#7E7E7E] font-areaNormal-extrabold mt-1')}>
                                {distanceText}
                            </Animated.Text>
                        ) : null}
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};
