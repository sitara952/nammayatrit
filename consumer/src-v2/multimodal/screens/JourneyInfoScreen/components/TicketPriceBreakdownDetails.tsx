import React, { useState } from 'react';
import { View, LayoutAnimation, Platform, UIManager } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Pressable } from '../../../../primitives/Pressable';
import ChevronDown from '../../../../../src/typescript/assets/svg/symbols/ChevronDown';
import ChevronUp from '../../../../../src/typescript/assets/svg/symbols/ChevronUp';
import { LegCategorySelections, LegCategorySelection } from '@/src-v2/multimodal/components/JourneyPayment/Types';
import { capitalize } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface TicketDetailsProps {
    totalBaseFare: number;
    totalPayableFare: number;
    legCategorySelections: LegCategorySelections;
}

export const TicketPriceBreakdown: React.FC<TicketDetailsProps> = ({
    totalBaseFare,
    totalPayableFare,
    legCategorySelections,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpanded = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(prev => !prev);
    };

    return (
        <View style={tailwind.style('bg-white rounded-[16px] mb-6')}>
            <Pressable
                onPress={toggleExpanded}
                accessibilityRole="button"
                accessibilityLabel="Ticket Details"
                testID="ticket-details-toggle">
                <View style={tailwind.style('p-4 flex-row justify-between items-center')}>
                    <Animated.Text
                        style={tailwind.style('text-[16px] font-areaNormal-extrabold text-[#3B3A3C] leading-[22px]')}>
                        Ticket Details
                    </Animated.Text>
                    <View style={tailwind.style('flex-row items-center')}>
                        {isExpanded ? <ChevronUp height={20} width={20} /> : <ChevronDown height={20} width={20} />}
                    </View>
                </View>
            </Pressable>

            {isExpanded && (
                <View style={tailwind.style('px-4 pb-4')}>
                    <View style={tailwind.style('border-t border-[#F0F0F0] pt-4')}>
                        <View style={tailwind.style('flex-row justify-between items-center mb-3')}>
                            <Animated.Text
                                style={tailwind.style('text-[14px] font-areaNormal text-[#656565] leading-[21px]')}>
                                Total Base fare
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[14px] font-areaNormal-bold text-[#3B3A3C] leading-[21px]',
                                )}>
                                ₹ {totalBaseFare}
                            </Animated.Text>
                        </View>

                        {legCategorySelections.map((legCategorySelection: LegCategorySelection) =>
                            legCategorySelection.categories.map((category: categoryInfoResponse) => {
                                if (legCategorySelection.cashPayment || legCategorySelection.passApplicable)
                                    return null;
                                const quantity = legCategorySelection.selections.get(category.categoryName) || 0;
                                if (quantity === 0) return null;
                                const discountedAmount =
                                    ((category?.categoryPrice?.amount || 0) -
                                        (category?.categoryOfferedPrice?.amount || 0)) *
                                    quantity;
                                if (discountedAmount <= 0) return null;
                                return (
                                    <View style={tailwind.style('flex-row justify-between items-center mb-3')}>
                                        <Animated.Text
                                            style={tailwind.style('text-[14px] text-[#656565] leading-[21px]')}>
                                            {`${legCategorySelection.travelMode == 'Subway' ? 'Train' : legCategorySelection.travelMode}: ${capitalize(category.categoryName)} Discount`}
                                        </Animated.Text>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[14px] font-areaNormal-bold text-[#3B3A3C] leading-[21px]',
                                            )}>
                                            -₹ {discountedAmount.toFixed(1)}
                                        </Animated.Text>
                                    </View>
                                );
                            }),
                        )}
                        <View style={tailwind.style('pt-1')}>
                            <View style={tailwind.style('flex-row justify-between items-center')}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[16px] font-areaNormal-extrabold text-[#3B3A3C] leading-[22px]',
                                    )}>
                                    Final Total
                                </Animated.Text>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[18px] font-areaNormal-extrabold text-[#3B3A3C] leading-[22px]',
                                    )}>
                                    ₹{totalPayableFare}
                                </Animated.Text>
                            </View>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] font-areaNormal text-[#969696] leading-[16px] mt-1',
                                )}>
                                Inc. all taxes and charges
                            </Animated.Text>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};
