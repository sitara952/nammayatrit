import { BusStopIconSvg } from '@/src-v2/assets/svg/BusStopIconSvg';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { TransitArrowRight } from '@/src-v2/multimodal/components/svg/Arrows';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import React from 'react';
import { Platform } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useConfigContext } from '@/typescript/context/ConfigContext';

import {
    getIconBGFromType,
    getIconFromType,
    getIconSecondaryBGFromType,
} from '../../JourneyInfoScreen/components/TransitIconWrapper';
import { isNull, isUndefined } from 'lodash';
import { BusList } from '../Types';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
interface NearbyBusStopProps {
    busList: BusList[] | undefined;
    stopName: string;
}

export const NearbyBusStop = (props: NearbyBusStopProps) => {
    const { busList, stopName } = props;
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    if (appConfig.appType !== 'multimodal' || isUndefined(busList) || busList.length === 0 || isNull(stopName))
        return null;
    return (
        <Animated.View
            style={tailwind.style(`py-4 bg-[${colors.CrossButton_bg}] rounded-[20px] mx-4 mb-5`)}
            entering={FadeIn}>
            <Animated.View
                style={tailwind.style('flex-row items-center gap-x-2 px-4')}
                accessibilityLabel={`Nearest bus stop is ${stopName}`}>
                <BusStopIconSvg width={24} height={28} fill="#7C7C7C" />
                <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                    {stopName}
                </Animated.Text>
            </Animated.View>
            <Animated.ScrollView
                style={tailwind.style('mt-5')}
                contentContainerStyle={tailwind.style('flex-row gap-x-2 px-4')}
                showsHorizontalScrollIndicator={false}
                horizontal
                accessibilityLabel={busList ? `available buses are` : ''}>
                {busList.map(bus => (
                    <Pressable
                        key={bus.busNo}
                        testID={`bus-stop-${bus.busNo}`}
                        onPress={bus.onPress}
                        style={({ pressed }: { pressed: boolean }) =>
                            tailwind.style('bg-white p-3 max-w-[138px] rounded-[10px]', pressed && 'bg-[#F4F4F4]')
                        }
                        accessibilityRole="button"
                        accessibilityLabel={`Bus ${bus.busNo}, Destination ${bus.destination} button`}>
                        <Animated.View style={tailwind.style('flex-row items-center gap-x-2')}>
                            <Animated.View
                                style={tailwind.style(
                                    'h-5 w-5 justify-center items-center rounded-full',
                                    `bg-[${getIconBGFromType('Bus')}]`,
                                )}>
                                {getIconFromType('Bus', 12, getIconSecondaryBGFromType('Bus'))}
                            </Animated.View>
                            <Animated.Text
                                style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                                {bus.busNo}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View style={tailwind.style('flex-row items-center gap-x-2 flex-wrap pt-2')}>
                            <Animated.Text
                                style={[
                                    tailwind.style(
                                        'text-[12px] leading-[12px] font-areaNormal-extrabold text-[#838185]',
                                    ),
                                    { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
                                ]}>
                                <Icon
                                    style={tailwind.style(Platform.OS === 'ios' ? '-mt-[1px]' : '')}
                                    icon={<TransitArrowRight />}
                                    size={12}
                                    color="#838185"
                                />{' '}
                                {bus.destination}
                            </Animated.Text>
                        </Animated.View>
                    </Pressable>
                ))}
            </Animated.ScrollView>
        </Animated.View>
    );
};
