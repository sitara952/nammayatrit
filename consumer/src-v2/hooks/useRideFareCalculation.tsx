import { PricingItemType } from '@/typescript/state/client/search';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectIsPetRide, selectTripTypeSelection } from '@/typescript/state/client/search';
import { getCurrency } from '@/typescript/utils/getCurrency';
import { FareTypes, getFareType } from '@/typescript/utils/fareEntityHelper';
import { useMemo } from 'react';
import { adjustPriceForPetRide } from '../utils/common';

export const useRideFareCalculation = (
    selectedPricingItems: PricingItemType[],
    customerTip: number | undefined,
    searchId: string | null = null,
) => {
    const isPetRide = useAppSelector(state => selectIsPetRide(state, searchId));
    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, searchId));

    const currency = getCurrency(selectedPricingItems?.[0]?.estimatedFareWithCurrency?.currency ?? 'INR');

    const petCharges = useMemo(
        () =>
            selectedPricingItems[0]?.fareBreakup?.find(val => getFareType(val.title).name === FareTypes.PET_CHARGES)
                ?.priceWithCurrency.amount,
        [selectedPricingItems],
    );

    const getBusinessDiscountAmount = useMemo(() => {
        if (selectedTripType !== 'BUSINESS' || selectedPricingItems.length === 0) {
            return 0;
        }
        const businessDiscountInfo = selectedPricingItems[0]?.businessDiscountInfo;
        return businessDiscountInfo?.businessDiscount || 0;
    }, [selectedTripType, selectedPricingItems]);

    const hasBusinessDiscount = getBusinessDiscountAmount > 0 && selectedTripType === 'BUSINESS';
    const minCost = useMemo(() => {
        if (selectedPricingItems.length === 0) return 0;
        const baseMinCost = Math.min(...(selectedPricingItems?.map(i => i?.cost) ?? []));
        const adjustedMinCost = adjustPriceForPetRide(baseMinCost, isPetRide, petCharges);
        const discountedCost = hasBusinessDiscount
            ? Math.max(0, (adjustedMinCost ?? 0) - getBusinessDiscountAmount)
            : adjustedMinCost;
        return (discountedCost ?? 0) + (customerTip ?? 0);
    }, [selectedPricingItems, customerTip, isPetRide, petCharges, hasBusinessDiscount, getBusinessDiscountAmount]);

    const maxCost = useMemo(() => {
        if (selectedPricingItems.length === 0) return 0;
        const baseMaxCost = Math.max(...(selectedPricingItems?.map(i => i?.toCost ?? 0) ?? []));
        const adjustedMaxCost = adjustPriceForPetRide(baseMaxCost, isPetRide, petCharges);
        const discountedCost = hasBusinessDiscount
            ? Math.max(0, (adjustedMaxCost ?? 0) - getBusinessDiscountAmount)
            : adjustedMaxCost;
        return (discountedCost ?? 0) + (customerTip ?? 0);
    }, [selectedPricingItems, customerTip, isPetRide, petCharges, hasBusinessDiscount, getBusinessDiscountAmount]);

    const fareDisplay = useMemo(() => {
        if (selectedPricingItems.length === 0) return `${currency}--`;
        return minCost < maxCost ? `${currency}${minCost} - ${currency}${maxCost}` : `${currency}${minCost}`;
    }, [minCost, maxCost, currency, selectedPricingItems]);

    const priceString = useMemo(() => {
        if (selectedPricingItems.length === 0) return '';

        return minCost < maxCost ? ` @ ${currency}${minCost}-${currency}${maxCost}` : ` @ ${currency}${minCost}`;
    }, [selectedPricingItems, minCost, maxCost, currency]);

    return {
        minCost,
        maxCost,
        currency,
        fareDisplay,
        priceString,
        customerTip,
    };
};
