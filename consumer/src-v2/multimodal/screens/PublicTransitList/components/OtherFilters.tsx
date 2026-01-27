import React from 'react';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface FilterOptionProps {
    title: string;
    description: string;
    isSelected: boolean;
    borderColor?: string;
    onSelect?: () => void;
}

const FilterOption: React.FC<FilterOptionProps> = ({
    title,
    description,
    isSelected,
    borderColor = '#E6E6E6',
    onSelect,
}) => (
    <Pressable
        accessibilityRole="button"
        onPress={onSelect}
        accessibilityLabel={title + ' button'}
        testID={`${title?.split(' ')?.join('')?.toLowerCase()}-filter-option`}>
        <Animated.View
            style={tailwind.style(
                `flex-row items-center justify-between pt-[18px] pb-[19px] border-b border-b-[${borderColor}]`,
            )}>
            <Animated.View>
                <Animated.Text style={tailwind.style('text-[15px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                    {title}
                </Animated.Text>
                <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#969696] mt-[9px]')}>
                    {description}
                </Animated.Text>
            </Animated.View>
            <Animated.View
                style={[
                    tailwind.style('rounded-full w-[20px] h-[20px]'),
                    tailwind.style(isSelected ? 'border-[5px] border-[#016ACD]' : 'border-[3px] border-[#969696]'),
                ]}
            />
        </Animated.View>
    </Pressable>
);

export type FilterType = 'bestRoute' | 'fewerTransfers' | 'lessWalking' | 'Cheapest';

interface OtherFiltersProps {
    onConfirmPress: () => void;
    selectedFilter: FilterType;
    onFilterSelect: (filter: FilterType) => void;
}

const OtherFilters: React.FC<OtherFiltersProps> = ({ onConfirmPress, selectedFilter, onFilterSelect }) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const colors = configManager.get('themeColors');
    return (
        <Animated.View style={tailwind.style('px-[24px]')}>
            <Animated.Text
                style={tailwind.style('text-[13px] font-areaNormal-extrabold text-[#969696] pt-[18px] text-center')}>
                {userLanguageStrings.Otherfilters}
            </Animated.Text>

            <Animated.View style={tailwind.style('mb-[12px]')}>
                <FilterOption
                    title={userLanguageStrings.FastRoute}
                    description={userLanguageStrings.SaveTimeGetThereFast}
                    isSelected={selectedFilter === 'bestRoute'}
                    onSelect={() => onFilterSelect('bestRoute')}
                />
                <FilterOption
                    title={userLanguageStrings.Price}
                    description={userLanguageStrings.SaveMoneyMostEconomical}
                    isSelected={selectedFilter === 'Cheapest'}
                    borderColor="#F7F7F7"
                    onSelect={() => onFilterSelect('Cheapest')}
                />
                <FilterOption
                    title={userLanguageStrings.FewerTransfers}
                    description={userLanguageStrings.LessSwitchMoreConvenience}
                    isSelected={selectedFilter === 'fewerTransfers'}
                    borderColor="#F7F7F7"
                    onSelect={() => onFilterSelect('fewerTransfers')}
                />
                <FilterOption
                    title={userLanguageStrings.LessWalking}
                    description={userLanguageStrings.MoreConvenience}
                    isSelected={selectedFilter === 'lessWalking'}
                    borderColor="#F7F7F7"
                    onSelect={() => onFilterSelect('lessWalking')}
                />
            </Animated.View>

            <Pressable
                testID="other-filters-confirm-button"
                onPress={onConfirmPress}
                accessibilityRole="button"
                accessibilityLabel="Confirm button"
                {...handlers}>
                <Animated.View
                    style={[
                        tailwind.style(`bg-[${colors.Confirm_button_bg}] py-[20px] rounded-[16px]`),
                        animatedStyle,
                    ]}>
                    <Animated.Text
                        style={[
                            tailwind.style(
                                `text-[14px] font-areaNormal-extrabold text-[${colors.Confirm_button_text}] text-center leading-[18px]`,
                            ),
                        ]}>
                        {userLanguageStrings.Confirm}
                    </Animated.Text>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

export default OtherFilters;
