import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';
import {
    FRFSQuoteCategoryType_fRFSQuoteCategoryType,
    MultimodalTravelMode_multimodalTravelMode,
    Gender_gender,
} from '@/readOnly/api/types/Enums.gen';
import { LegCategorySelection } from './Types';
import { getDefaultCategory } from './Types';

export type CategorySelections = Map<FRFSQuoteCategoryType_fRFSQuoteCategoryType, number>; // categoryName -> quantity

/**
 * Calculate total fare for a leg based on category selections
 * Uses the offered price (discounted) if available, otherwise falls back to regular price
 */
export function calculateTotalFareForLeg(
    availableCategories: categoryInfoResponse[],
    categorySelections: CategorySelections,
): number {
    return availableCategories.reduce((totalFare, category) => {
        const qty = categorySelections.get(category.categoryName) ?? 0;
        const price = category.categoryOfferedPrice?.amount ?? category.categoryPrice?.amount ?? 0;
        return totalFare + price * qty;
    }, 0);
}

/**
 * Calculate original total fare for a leg based on category selections
 * Uses the original price (before discounts)
 */
export function calculateOriginalTotalFareForLeg(
    availableCategories: categoryInfoResponse[],
    categorySelections: CategorySelections,
): number {
    return availableCategories.reduce((totalFare, category) => {
        const qty = categorySelections.get(category.categoryName) ?? 0;
        const price = category.categoryPrice?.amount ?? 0;
        return totalFare + price * qty;
    }, 0);
}

/**
 * Calculate discount percentage between original and discounted fare
 */
export function calculateDiscountPercentage(originalFare: number, fareAfterDiscount: number): number {
    if (originalFare <= 0 || fareAfterDiscount >= originalFare || fareAfterDiscount < 0) {
        return 0;
    }
    const discountAmount = originalFare - fareAfterDiscount;
    const discountPercentage = (discountAmount / originalFare) * 100;
    return Math.round(discountPercentage);
}

/**
 * Calculate discount text for categories
 * Generates formatted text showing discount percentages for each category
 */
export function calculateDiscountText(
    categories: categoryInfoResponse[],
    categorySelections: CategorySelections,
    travelMode: string = 'ticket',
): string | undefined {
    const categoryDiscounts: string[] = categories
        .map(category => {
            const qty = categorySelections.get(category.categoryName) ?? 0;
            if (qty === 0) return null;
            const originalPrice = category.categoryPrice?.amount ?? 0;
            const offeredPrice = category.categoryOfferedPrice?.amount ?? 0;
            if (originalPrice <= 0 || offeredPrice >= originalPrice) return null;
            const discount = calculateDiscountPercentage(originalPrice, offeredPrice);
            if (discount <= 0) return null;
            if (category.categoryName === 'ADULT') {
                return `${discount}%`;
            } else {
                return `${discount}% ${category.categoryName.toLowerCase()}`;
            }
        })
        .filter((discount): discount is string => discount !== null);

    if (categoryDiscounts.length === 0) return undefined;
    return `Applied ${categoryDiscounts.join(' and ')} passenger discount on ${travelMode}`;
}

/**
 * Options for configuring LegCategorySelection behavior
 */
export interface LegCategorySelectionOptions {
    /** Whether the price is fixed and cannot be changed */
    fixedPrice: boolean | undefined;
    /** Whether this leg supports cash payment */
    cashPayment: boolean | undefined;
    /** Whether passes are applicable for this leg */
    passApplicable: boolean | undefined;
}

/**
 * Create a single LegCategorySelection structure
 * Generic function that works for both FRFS and Journey Payment systems
 */
export function createLegCategorySelection(
    categories: categoryInfoResponse[],
    categorySelections: CategorySelections,
    legOrder: number,
    travelMode: MultimodalTravelMode_multimodalTravelMode,
    options: LegCategorySelectionOptions,
): LegCategorySelection {
    const { fixedPrice = false, cashPayment = false, passApplicable = false } = options;

    return {
        categories,
        legOrder,
        travelMode,
        fixedPrice,
        cashPayment,
        passApplicable,
        selections: categorySelections,
    };
}

/**
 * Calculate discount percentage for a category
 * Compares original price with offered price to determine discount percentage
 */
export function getCategoryDiscount(category: categoryInfoResponse): number {
    const originalPrice = category.categoryPrice?.amount || 0;
    const discountedPrice = category.categoryOfferedPrice?.amount || 0;
    if (originalPrice > discountedPrice && originalPrice > 0) {
        return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
    }
    return 0;
}

/**
 * Handle category quantity changes for a single category selection map
 * Used by both FRFS and Journey Payment systems
 * @param maxTotalTickets - Maximum total tickets allowed. If provided, validates that incrementing won't exceed this limit.
 */
export function handleCategoryQuantityChange(
    categorySelections: CategorySelections,
    categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType,
    isIncr: boolean,
    availableCategories: categoryInfoResponse[],
    userGender: Gender_gender,
    maxTotalTickets: number | undefined,
): CategorySelections {
    const currentQuantity = categorySelections.get(categoryName) || 0;

    // Calculate current total tickets across all categories
    const currentTotalTickets = Array.from(categorySelections.values()).reduce((sum, qty) => sum + qty, 0);

    // For increment operations, validate against max limit before proceeding
    if (isIncr && maxTotalTickets !== undefined) {
        // If incrementing would exceed the limit, return unchanged selections
        if (currentTotalTickets >= maxTotalTickets) {
            return categorySelections;
        }
    }

    const newQuantity = isIncr ? currentQuantity + 1 : Math.max(0, currentQuantity - 1);

    // Create new map with updated quantities
    const entries = Array.from(categorySelections.entries());

    if (newQuantity > 0) {
        // Update or add the category
        const existingIndex = entries.findIndex(([cat]) => cat === categoryName);
        const newEntries =
            existingIndex >= 0
                ? entries.map((entry, index) =>
                      index === existingIndex ? ([categoryName, newQuantity] as const) : entry,
                  )
                : [...entries, [categoryName, newQuantity] as const];
        return new Map(newEntries);
    } else {
        // Remove the category
        const filteredEntries = entries.filter(([cat]) => cat !== categoryName);

        // Ensure at least one ticket is selected
        if (filteredEntries.length === 0 && availableCategories.length > 0) {
            const defaultCategory = getDefaultCategory(availableCategories, userGender);
            if (defaultCategory) {
                return new Map([[defaultCategory.categoryName, 1]]);
            }
        }

        return new Map(filteredEntries);
    }
}
