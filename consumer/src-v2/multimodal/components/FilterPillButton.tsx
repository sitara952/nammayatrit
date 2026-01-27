import Animated from 'react-native-reanimated';
import React from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { G, ClipPath, Defs, Path, Svg } from 'react-native-svg';
import { Icon } from '@/typescript/components/Icon';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const DownArrowIcon = () => {
    return (
        <Svg width={10} height={10} viewBox="0 0 10 6" fill="none">
            <Path d="M1 .8l4 4 4-4" stroke="#7E7E7E" strokeWidth={1.8} strokeLinejoin="round" />
        </Svg>
    );
};

const CloseIcon = () => {
    return (
        <Svg width={10} height={10} viewBox="0 0 10 10" fill="none">
            <G clipPath="url(#clip0_4033_33478)">
                <Path d="M1.42 1.989l6.351 6.35.842-.84-6.351-6.352-.842.842z" fill="#525461" />
                <Path d="M8.61 7.492l-.84.841-6.348-6.347.841-.841" fill="#3B3A3C" />
                <Path d="M7.77 1.14L1.417 7.493l.842.842 6.35-6.351-.84-.842z" fill="#525461" />
                <Path d="M2.263 8.333l-.841-.84L7.77 1.144l.84.84" fill="#3B3A3C" />
            </G>
            <Defs>
                <ClipPath id="clip0_4033_33478">
                    <Path fill="#fff" transform="translate(1.422 1.145)" d="M0 0H7.18882V7.18882H0z" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};

const FilterPillButton = ({ isClose, name, onPress }: { isClose: boolean; name: string; onPress: () => void }) => {
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const readableName = name.trim() == 'Subway' ? 'Train' : name;
    return (
        <Pressable
            testID={`${readableName?.split(' ')?.join('')?.toLowerCase()}-filter-pill-button`}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${readableName} filter ${isClose ? 'close' : 'open'} button`}
            onPress={onPress}
            style={[
                tailwind.style('rounded-[14px] h-[34px] px-[12px] flex-row items-center gap-[6px]'),
                tailwind.style(
                    isClose
                        ? 'border border-[#3B3A3C] bg-[#F4F4F4]'
                        : `border border-[${colors.CrossButton_bg}] bg-white `,
                ),
            ]}>
            <Animated.Text
                accessible={false}
                style={[tailwind.style('text-[12px] font-areaNormal-extrabold text-[#3B3A3C] leading-[14px]')]}>
                {readableName}
            </Animated.Text>
            <Animated.View accessible={false}>
                {isClose ? <Icon icon={<CloseIcon />} size={10} color="#3B3A3C" /> : <Icon icon={<DownArrowIcon />} />}
            </Animated.View>
        </Pressable>
    );
};

export default FilterPillButton;
