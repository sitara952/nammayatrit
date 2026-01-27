import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import CurrentLocationIcon from './svg/CurrentLocationIcon';
import { getIconFromType } from './SearchSectionAlternate';
import HomeSvg from './svg/HomeSvg';
import TriangleFillerSvg from './svg/TriangleFillerSvg';
import { SearchResultItem } from './SearchSectionListItem/types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface CombinationalRouteCardProps {
    transitModes: SearchResultItem['transitModes'];
}

const CombinationalRouteCard: React.FC<CombinationalRouteCardProps> = ({ transitModes }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View
            style={tailwind.style('px-[12.5px] py-[14px] border border-[#F0F1F4] rounded-[18px] bg-[#FFFFFF]')}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <CurrentLocationIcon />

                <Animated.View style={tailwind.style('flex-row items-center justify-between gap-2 ')}>
                    <TriangleFillerSvg />
                    <TriangleFillerSvg />
                    <TriangleFillerSvg />
                </Animated.View>
                <Animated.View style={tailwind.style('flex flex-row gap-1 p-[9px] bg-[#F0F1F4] rounded-[24px]')}>
                    {transitModes?.map((mode, index) => {
                        return (
                            <Animated.View key={mode.mode} style={tailwind.style('flex flex-row items-center gap-1 ')}>
                                {getIconFromType(mode.mode, 18, '#525461')}

                                {transitModes.length - 1 !== index ? (
                                    <Animated.Text
                                        numberOfLines={1}
                                        style={tailwind.style(
                                            'text-[18px] font-areaNormal-extrabold text-[#655C6F] leading-[22px]',
                                        )}>
                                        +
                                    </Animated.Text>
                                ) : null}
                            </Animated.View>
                        );
                    })}
                </Animated.View>
                <Animated.View style={tailwind.style('flex-row items-center justify-between gap-2 ')}>
                    <TriangleFillerSvg />
                    <TriangleFillerSvg />
                    <TriangleFillerSvg />
                </Animated.View>
                <Animated.View style={tailwind.style('bg-[#F0F1F4] rounded-full px-[9.5px] py-[9px]')}>
                    <HomeSvg />
                </Animated.View>
            </Animated.View>
            <Animated.View style={tailwind.style('flex-row items-center justify-center mt-[8px]')}>
                <Animated.Text style={tailwind.style('text-[#89898A] text-[10px] font-areaNormal-extrabold')}>
                    {userLanguageStrings.FromYourLocationToHome}
                </Animated.Text>
            </Animated.View>
        </Animated.View>
    );
};

export default CombinationalRouteCard;
