import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFrfsSearchAndPolling } from '../../hooks/useFrfsSearchAndPolling';
import { useFrfsBookingAndStatus } from '../../hooks/useFrfsBookingAndStatus';
import {
    FrfsSearchVehicleType_frfsSearchVehicleType,
    FRFSQuoteCategoryType_fRFSQuoteCategoryType,
    FRFSServiceTierType_fRFSServiceTierType,
} from '@/readOnly/api/types/Enums.gen';
import { busLocation } from '@/readOnly/api/types/BusLocation.gen';
import { logger } from '@/src-v2/systems/logger';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserGender } from '@/typescript/state/client/user';
import { PaymentFooterWithoutPPWidget } from '../../screens/JourneyInfoScreen/components/PaymentFooterWithoutPPWidget';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { TransitType } from '../../components/PublicTransportCard/types';
import { JourneyPaymentModal } from '../JourneyPayment/UI';
import { LegCategorySelections } from '../JourneyPayment/Types';
import {
    calculateTotalFareForLeg,
    calculateOriginalTotalFareForLeg,
    calculateDiscountText,
    createLegCategorySelection,
    getCategoryDiscount,
    handleCategoryQuantityChange as handleCategoryQuantityChangeCommon,
} from '../JourneyPayment/journeyPaymentUtils';
import { getDefaultCategory } from '../JourneyPayment/Types';
import { getMaxTicketsForLeg } from '../../screens/JourneyInfoScreen/utils';

export interface FrfsPaymentFlowProps {
    /** Source station code */
    fromStationCode: string;
    /** Destination station code */
    toStationCode: string;
    /** Vehicle number (OTP) */
    vehicleNumber: string;
    /** Route code */
    routeCode?: string;
    /** Vehicle type */
    vehicleType: FrfsSearchVehicleType_frfsSearchVehicleType;
    /** Bus location data */
    busLocationData?: busLocation[];
    /** Whether the component should be active */
    enabled: boolean;
    /** Recent location ID */
    recentLocationId?: string;
    /** Navigation prop for journey payment UI */
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    /** Service tier */
    serviceTier: FRFSServiceTierType_fRFSServiceTierType | undefined;
}

export const FrfsPaymentFlow: React.FC<FrfsPaymentFlowProps> = ({
    fromStationCode,
    toStationCode,
    vehicleNumber,
    routeCode,
    vehicleType,
    busLocationData,
    enabled,
    recentLocationId,
    serviceTier,
    navigation: _navigation,
}) => {
    const userGender = useAppSelector(selectUserGender);
    const hideLoader = useAppSelector(state => state.session.hideLoader);

    // Category selections state for quantity management
    type CategorySelections = Map<FRFSQuoteCategoryType_fRFSQuoteCategoryType, number>;
    const [categorySelections, setCategorySelections] = useState<CategorySelections>(new Map());
    const [, setIsTicketModalOpen] = useState(false);

    // Calculate total ticket count
    const totalTicketCount = useMemo(() => {
        return Array.from(categorySelections.values()).reduce((sum, qty) => sum + qty, 0);
    }, [categorySelections]);

    // FRFS search and polling hook
    const {
        quotes,
        isLoading: isSearchLoading,
        refetch: refetchSearch,
    } = useFrfsSearchAndPolling({
        fromStationCode,
        toStationCode,
        vehicleNumber,
        routeCode,
        quantity: totalTicketCount,
        vehicleType,
        busLocationData,
        enabled,
        recentLocationId,
        serviceTier: serviceTier,
    });

    // Get the primary quote for booking
    const primaryQuote = quotes?.find(quote => quote.price > 0) || quotes?.[0];
    const quoteId = primaryQuote?.quoteId || null;

    // Initialize category selections when primary quote changes
    useEffect(() => {
        if (primaryQuote?.categories && primaryQuote.categories.length > 0) {
            const defaultCategory = getDefaultCategory(primaryQuote.categories, userGender ?? 'MALE');

            const newSelections = defaultCategory
                ? new Map<FRFSQuoteCategoryType_fRFSQuoteCategoryType, number>([[defaultCategory.categoryName, 1]])
                : new Map<FRFSQuoteCategoryType_fRFSQuoteCategoryType, number>();

            setCategorySelections(newSelections);
            logger.logInfo(
                `Initialized FRFS category selections: ${JSON.stringify(Array.from(newSelections.entries()))}`,
                'FrfsPaymentFlow',
            );
        }
    }, [primaryQuote?.quoteId, userGender]); // Use quoteId to reset when quote changes

    // Use existing journey payment calculation functions
    const totalFare = useMemo(() => {
        if (!primaryQuote?.categories) return 0;
        return calculateTotalFareForLeg(primaryQuote.categories, categorySelections);
    }, [primaryQuote?.categories, categorySelections]);

    const originalTicketValue = useMemo(() => {
        if (!primaryQuote?.categories) return 0;
        return calculateOriginalTotalFareForLeg(primaryQuote.categories, categorySelections);
    }, [primaryQuote?.categories, categorySelections]);

    // Calculate discount text using common function
    const discountText = useMemo(() => {
        if (!primaryQuote?.categories) return undefined;
        return calculateDiscountText(primaryQuote.categories, categorySelections, 'bus ticket');
    }, [primaryQuote?.categories, categorySelections]);

    // FRFS booking and status hook
    const {
        confirmBooking,
        isLoading: isBookingLoading,
        isPaymentProcessing,
    } = useFrfsBookingAndStatus({
        quoteId,
        enabled: enabled && !!quoteId,
        ticketQuantity: totalTicketCount,
        categorySelections: categorySelections,
        quoteCategories: primaryQuote?.categories,
        onQuoteExpired: refetchSearch,
    });

    // Handle category quantity changes
    const handleCategoryQuantityChange = useCallback(
        (
            _legOrder: number, // Not used in FRFS (single leg)
            categoryName: FRFSQuoteCategoryType_fRFSQuoteCategoryType,
            isIncr: boolean,
        ) => {
            setCategorySelections(prev => {
                if (!primaryQuote?.categories) return prev;

                const newSelections = handleCategoryQuantityChangeCommon(
                    prev,
                    categoryName,
                    isIncr,
                    primaryQuote.categories,
                    userGender ?? 'MALE',
                    getMaxTicketsForLeg(false),
                );

                logger.logInfo(`FRFS quantity changed: ${categoryName} ${isIncr ? '+' : '-'}`, 'FrfsPaymentFlow');
                return newSelections;
            });
        },
        [primaryQuote?.categories, userGender],
    );

    // Create leg category selection structure for modal compatibility
    const legCategorySelections: LegCategorySelections = useMemo(() => {
        if (!primaryQuote?.categories) return [];
        return [
            createLegCategorySelection(primaryQuote.categories, categorySelections, 0, 'Bus', {
                fixedPrice: false,
                cashPayment: false,
                passApplicable: false,
            }),
        ];
    }, [primaryQuote?.categories, categorySelections]);

    // Handle booking confirmation
    const handleConfirm = useCallback(
        ({ skipPayment, viaOfferButton }: { skipPayment: boolean; viaOfferButton: boolean }) => {
            logger.logInfo(
                `Confirming FRFS booking - skipPayment: ${skipPayment}, viaOfferButton: ${viaOfferButton}`,
                'FrfsPaymentFlow',
            );
            confirmBooking();
        },
        [confirmBooking],
    );

    // Calculate derived values for the generic PaymentFooter
    const computedOriginalTicketValue = originalTicketValue >= totalFare ? originalTicketValue : undefined;

    // Journey modes for payment footer
    const journeyModes: TransitType[] = ['bus'];

    // Get refs for payment components
    const { ticketSelectorModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const bottomViewPadding = useMemo(() => (bottom ? bottom : 16), [bottom]);

    // Determine loading state - show loading when searching, confirming, processing payment, no fares, or hideLoader is true
    const isLoading = isSearchLoading || isBookingLoading || isPaymentProcessing || !primaryQuote || hideLoader;

    // Always show payment footer with loading state when needed
    return (
        <Animated.View
            style={[
                tailwind?.style(`absolute bottom-0 pb-[${bottomViewPadding}px] w-full bg-white`),
                {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 7.49,
                    elevation: 12,
                    overflow: 'visible',
                },
            ]}>
            <PaymentFooterWithoutPPWidget
                offer={undefined} // No offers for FRFS yet
                totalFare={primaryQuote ? totalFare : 0}
                totalPayableFare={primaryQuote ? totalFare : 0}
                journeyModes={journeyModes}
                handleOnPress={() => handleConfirm({ skipPayment: false, viaOfferButton: false })}
                isLoading={isLoading}
                ticketSelectorModalRef={ticketSelectorModalRef}
                isSwitchPopupOpen={false}
                setIsTicketModalOpen={setIsTicketModalOpen}
                totalTicketCount={primaryQuote ? totalTicketCount : 1}
                originalTicketValue={primaryQuote ? computedOriginalTicketValue : undefined}
                discountText={primaryQuote ? discountText : undefined}
            />

            {/* Ticket Selector Modal - only show when fares are available */}
            {primaryQuote && (
                <JourneyPaymentModal
                    ticketSelectorModalRef={ticketSelectorModalRef}
                    journeyModes={journeyModes}
                    handleOnPress={() => handleConfirm({ skipPayment: false, viaOfferButton: false })}
                    isLoading={isLoading}
                    hasSubwayLeg={false}
                    onModalDismiss={() => setIsTicketModalOpen(false)}
                    legCategorySelections={legCategorySelections}
                    handleCategoryQuantityChange={handleCategoryQuantityChange}
                    getCategoryDiscount={getCategoryDiscount}
                />
            )}
        </Animated.View>
    );
};
