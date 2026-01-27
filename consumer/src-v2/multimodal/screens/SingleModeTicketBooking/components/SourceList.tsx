import Animated, { FadeIn } from 'react-native-reanimated';

import React from 'react';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import Shimmer from '../../Search/components/SearchSectionListItem/Shimmer';
import { DividerPill } from './DividerPill';
import { StopPicker, StopPickerItem } from './StopPicker';
import { useConfigContext } from '@/typescript/context/ConfigContext';
interface SourceListProps {
    activeIndex: number;
    list: StopPickerItem[];
    handleOnChange: (item: StopPickerItem) => void;
}

const SourceList = ({ activeIndex, list, handleOnChange }: SourceListProps) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    if (!list || list.length === 0) {
        return (
            <Animated.View entering={FadeIn.delay(150)} style={tailwind.style('pt-[18px] pb-[30px] bg-[#3B3A3C]')}>
                <DividerPill offset={10} style={tailwind.style('h-[1px] bg-[#343334] w-full')}>
                    <Animated.View
                        style={tailwind.style('flex-row items-center h-[28px] bg-[#343334] px-3 rounded-3xl')}>
                        <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#838185]')}>
                            {userLanguageStrings.FROM}
                        </Animated.Text>
                    </Animated.View>
                </DividerPill>
                <Animated.View style={tailwind.style('pt-[26px] gap-10 flex-row pb-[8px] justify-center items-center')}>
                    <Shimmer width={180} height={21} borderRadius={7} />
                    <Shimmer width={180} height={21} borderRadius={7} />
                    <Shimmer width={180} height={21} borderRadius={7} />
                </Animated.View>
            </Animated.View>
        );
    }
    return (
        <Animated.View style={tailwind.style('pt-[18px] pb-[30px] bg-[#3B3A3C]')}>
            <DividerPill offset={10} style={tailwind.style('h-[1px] bg-[#343334] w-full')}>
                <Animated.View style={tailwind.style('flex-row items-center h-[28px] bg-[#343334] px-3 rounded-3xl')}>
                    <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#838185]')}>
                        {userLanguageStrings.FROM}
                    </Animated.Text>
                </Animated.View>
            </DividerPill>
            <StopPicker
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                initialSelectedItem={list[activeIndex] as StopPickerItem}
                data={list}
                onChange={handleOnChange}
            />
            {/* <DividerPill children={undefined} style={undefined} offset={undefined} /> */}
        </Animated.View>
    );
};

export default React.memo(SourceList);
