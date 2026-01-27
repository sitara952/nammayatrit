import React from 'react';
import { Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';
import { getCategoryDisplayName } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/CategorySelector';

export const TicketSplit = (props: { categories: categoryInfoResponse[][] }) => {
    const { categories } = props;
    return (
        <View style={tailwind.style('px-6 pt-5 bg-[#FBFBFB]')}>
            {categories.map((categoryArray: categoryInfoResponse[]) => {
                return (
                    <>
                        {categoryArray.map((category: categoryInfoResponse) => {
                            const quantity = category.categorySelectedQuantity || 0;
                            if (quantity === 0) return null;
                            return (
                                <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                                    <Text
                                        style={tailwind.style(
                                            'text-[13px] font-areaNormal-extrabold text-[#3B3A3C] leading-[17px] tracking-[0.2px]',
                                        )}>
                                        {getCategoryDisplayName(category.categoryMeta?.title ?? category.categoryName)}
                                    </Text>
                                    <Text
                                        style={tailwind.style(
                                            'text-[13px] font-areaNormal-extrabold text-[#3B3A3C] leading-[17px] tracking-[0.2px]',
                                        )}>
                                        {quantity}
                                    </Text>
                                </Animated.View>
                            );
                        })}
                    </>
                );
            })}
        </View>
    );
};
