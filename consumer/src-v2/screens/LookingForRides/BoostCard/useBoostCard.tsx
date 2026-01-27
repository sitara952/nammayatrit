import { logEvent } from '@/typescript/utils/cleverTap';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import colors from '@/typescript/designSystem/colorPalette';
import {
    selectCustomerTip,
    selectPricingItems,
    selectSelectedPricingItems,
    selectIsEditClicked,
    setVehicleChanged,
    setIsSearchBoosted,
    setIsEditClicked,
    setCustomerTip,
    setSelectedPricingItems,
    setIsEditButtonDisabled,
} from '@/typescript/state/client/search';
import {
    selectBottomSheetStage,
    BottomSheetStage,
    setBottomSheetStage,
    setToastProps,
    selectNewFeatureFlags,
} from '@/typescript/state/client/session';
import { BookingId, selectSearchId } from '@/typescript/state/client/user';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { useCallSelectPricingItemAPI } from '@/typescript/utils/useCallSelectEsimateApi';
import { useState, useMemo, useEffect } from 'react';
import { logger } from '@/src-v2/systems/logger';
import Danger from '@/typescript/components/svg/Danger';
import { useRideFareCalculation } from '@/src-v2/hooks/useRideFareCalculation';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const useBoostCard = (
    resetSearch: () => void,
    bookingId: BookingId | null,
    alwaysSearch: boolean,
    cancel: boolean,
) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);

    const customerTip = useAppSelector(state => selectCustomerTip(state, null));
    const pricingItems = useAppSelector(state => selectPricingItems(state, null));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const searchId = useAppSelector(state => selectSearchId(state, null));

    // Memoize to prevent new array reference on every render
    const selectedItems = useMemo(() => {
        return selectedPricingItems?.map(item => item.id) || [];
    }, [selectedPricingItems]);

    const [selectedExpandedData, setSelectedExpandedData] = useState(selectedItems);
    const isEditClicked = useAppSelector(state => selectIsEditClicked(state, null));
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const [isLoading, setIsLoading] = useState(false);

    const callSelectPricingItemAPI = useCallSelectPricingItemAPI({
        cancel: cancel,
        prevEstimateId: selectedPricingItems[0]?.id,
    });

    const dispatch = useAppDispatch();

    const [additionalFare, setAdditionalFare] = useState(customerTip);

    // Add state to track vehicle selection changes in non-edit mode
    const [initialSelectedVehicles, setInitialSelectedVehicles] = useState<string[]>(selectedItems);

    useEffect(() => {
        setInitialSelectedVehicles(selectedItems);
    }, [selectedItems]);

    const itemsToUse = useMemo(
        () =>
            isEditClicked
                ? pricingItems.filter(item => selectedExpandedData.includes(item.id))
                : pricingItems.filter(item => initialSelectedVehicles.includes(item.id)),
        [isEditClicked, pricingItems, selectedExpandedData, initialSelectedVehicles],
    );

    const isDoneState =
        !alwaysSearch &&
        isEditClicked &&
        additionalFare === customerTip &&
        selectedItems.length === selectedExpandedData.length &&
        selectedItems.every(v => selectedExpandedData.includes(v));

    const isDisabled =
        !alwaysSearch &&
        !isEditClicked &&
        additionalFare === customerTip &&
        selectedItems.length === selectedExpandedData.length &&
        selectedItems.every(v => selectedExpandedData.includes(v));

    const onSuccess = (selectedServiceTier: (string | undefined)[]) => {
        setIsLoading(false);
        resetSearch();
        if (customerTip) {
            logger.logDebug(
                `Tip amount (${CURRENCY_SYMBOL.value})': ${customerTip} and Vehicle Variants: ${selectedServiceTier}`,
                'BookingFlow',
            );
            logEvent('ny_user_tip_search', {
                [`Tip amount (${CURRENCY_SYMBOL.value})`]: customerTip,
            });
        }
        dispatch(setVehicleChanged({ id: searchId, payload: true }));
        dispatch(setIsSearchBoosted({ id: searchId, payload: true }));
        if (bottomSheetStage == BottomSheetStage.RetryBoostedSearch) {
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.LookingForRides, src: 'boostCard_onSuccess' }));
        }
    };

    const onError = () => {
        setIsLoading(false);
        dispatch(
            setToastProps({
                message: userLanguageStrings.FailedtochangenPleaseretry,
                backgroundColor: `${colors?.primitive?.red?.danger}`,
                autoDismissAfter: 1500,
                visible: true,
                logo: <Danger />,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                margin: undefined,
                customToast: undefined,
            }),
        );
    };

    const onPress = () => {
        logEvent(
            customerTip === undefined || customerTip === null || customerTip === 0 ? 'ny_no_tip_added' : 'ny_tip_added',
        );
        if (isEditClicked) {
            dispatch(setIsEditClicked({ id: searchId, payload: false }));
            // Disable the edit button using the configured time
            dispatch(setIsEditButtonDisabled({ id: searchId, payload: true }));
            setTimeout(() => {
                dispatch(setIsEditButtonDisabled({ id: searchId, payload: false }));
            }, newFeatureFlags.editTipOrVehicleButtonDisableThreshold);

            if (
                !alwaysSearch &&
                additionalFare === customerTip &&
                selectedExpandedData.every(v => selectedItems.includes(v)) &&
                selectedItems.every(v => selectedExpandedData.includes(v))
            )
                return;
        }
        const data = pricingItems.filter(item => selectedExpandedData.includes(item.id));
        const selectedServiceTier = data.map(v => v.serviceTierName);
        if (additionalFare != 0) dispatch(setCustomerTip({ id: searchId, payload: additionalFare }));
        dispatch(setSelectedPricingItems({ id: searchId, payload: data }));

        setIsLoading(true);
        callSelectPricingItemAPI({
            selectedPricingItems: data,
            customerTip: additionalFare,
            bookingId: bookingId,
            searchId: searchId,
            onSuccess: () => onSuccess(selectedServiceTier),
            onError: onError,
        });
    };

    const { priceString, fareDisplay } = useRideFareCalculation(itemsToUse, additionalFare);

    const buttonText = isDoneState
        ? userLanguageStrings.Done
        : !alwaysSearch && isEditClicked
          ? userLanguageStrings.Submit + priceString
          : userLanguageStrings.BoostSearch + priceString;

    return {
        onPress,
        isDisabled,
        additionalFare,
        setAdditionalFare,
        selectedExpandedData,
        setSelectedExpandedData,
        updateInitialSelectedVehicles: setInitialSelectedVehicles,
        isLoading,
        isEditClicked,
        buttonText,
        fareDisplay,
    };
};
