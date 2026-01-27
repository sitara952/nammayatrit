import React, { useMemo } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Stepper } from '../../../components/common/Stepper';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import DiscountIcon from '@/typescript/assets/svg/symbols/discountIcon';
import { CategorySelections } from '../../../components/JourneyPayment/journeyPaymentUtils';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';
import { getMaxTicketsForLeg } from '../utils';
import { FRFSQuoteCategoryType_fRFSQuoteCategoryType } from '@/readOnly/api/types/Enums.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';

interface CategorySelectorProps {
    categories: categoryInfoResponse[];
    selections: CategorySelections;
    travelMode: MultimodalTravelMode_multimodalTravelMode;
    onQuantityChange: (
        legOrder: number,
        categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType,
        isIncr: boolean,
    ) => void;
    maxTotalTickets?: number;
    hasSubwayLeg?: boolean;
    legOrder: number;
    getCategoryDiscount: (category: categoryInfoResponse) => number;
}

// Helper to get display name for category
export const getCategoryDisplayName = (categoryName: string): string => {
    switch (categoryName) {
        case 'ADULT':
            return 'Adult';
        case 'CHILD':
            return 'Child';
        case 'SENIOR_CITIZEN':
            return 'Senior Citizen';
        case 'STUDENT':
            return 'Student';
        case 'FEMALE':
            return 'Female';
        case 'MALE':
            return 'Male';
        default:
            return categoryName;
    }
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selections,
    travelMode,
    onQuantityChange,
    legOrder,
    maxTotalTickets,
    hasSubwayLeg = false,
    getCategoryDiscount,
}) => {
    // Calculate total selected tickets
    const totalSelected = useMemo(() => {
        return Array.from(selections.values()).reduce((sum, qty) => sum + qty, 0);
    }, [selections]);

    // Get max tickets (hardcoded for now)
    const maxTickets = maxTotalTickets ?? getMaxTicketsForLeg(hasSubwayLeg);

    // Calculate max value for each category
    const getMaxValueForCategory = (categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType): number => {
        const currentQuantity = selections.get(categoryName) || 0;
        return Math.min(maxTickets, maxTickets - (totalSelected - currentQuantity));
    };

    // Calculate min value for each category (ensure at least 1 ticket total)
    const getMinValueForCategory = (categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType): number => {
        const currentQuantity = selections.get(categoryName) || 0;
        return totalSelected === 1 && currentQuantity === 1 ? 1 : 0;
    };

    // Get price for category
    const getCategoryPrice = (category: categoryInfoResponse): number => {
        return category.categoryOfferedPrice?.amount || category.categoryPrice?.amount || 0;
    };

    return (
        <View style={tailwind.style('mb-4')}>
            <Animated.Text
                style={tailwind.style(
                    'text-[16px] font-areaNormal-extrabold text-[#3B3A3C] leading-[22px] tracking-[0.35px] mb-4',
                )}>
                {`Number of Tickets (${travelMode == 'Subway' ? 'Train' : travelMode})`}
            </Animated.Text>

            {categories.map((category, categoryIndex) => {
                const quantity = selections.get(category.categoryName) || 0;
                const discount = getCategoryDiscount(category);
                const categoryName = getCategoryDisplayName(category.categoryMeta?.title || category.categoryName);
                const price = getCategoryPrice(category);

                return (
                    <View
                        key={category.categoryName}
                        style={tailwind.style(
                            `flex-row justify-between items-center ${categoryIndex < categories.length - 1 ? 'mb-4' : 'mb-2'}`,
                        )}>
                        <View style={tailwind.style('flex-1')}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] font-areaNormal-extrabold text-[#3B3A3C] leading-[22px] tracking-[0.35px]',
                                )}>
                                {categoryName} {price > 0 && `(₹${price})`}
                            </Animated.Text>
                            {discount > 0 && (
                                <View style={tailwind.style('flex-row items-center mt-1')}>
                                    <View
                                        style={tailwind.style(
                                            'bg-green-100 border-[1px] border-green-300 px-2 rounded-[10px] flex-row items-center',
                                        )}>
                                        <DiscountIcon width={15} height={15} />
                                        <Animated.Text
                                            style={tailwind.style('text-[13px] pl-1 mb-1 font-areaNormal-bold')}>
                                            {discount}% off
                                        </Animated.Text>
                                    </View>
                                </View>
                            )}
                        </View>
                        <Stepper
                            value={quantity}
                            minValue={getMinValueForCategory(category.categoryName)}
                            maxValue={getMaxValueForCategory(category.categoryName)}
                            onIncrement={() => onQuantityChange(legOrder, category.categoryName, true)}
                            onDecrement={() => onQuantityChange(legOrder, category.categoryName, false)}
                        />
                    </View>
                );
            })}
        </View>
    );
};
