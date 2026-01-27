import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { BusPassUI } from './UI';
import { useMultimodalPassAvailablePassesGetQuery } from '@/api/integrations/rtk/MultimodalPassAvailablePassesGet';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserLanguage } from '@/typescript/state/client/session';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { passAPIEntity } from '@/readOnly/api/types/PassAPIEntity.gen';
import { useCachedPurchasedPasses } from '@/src-v2/hooks/useCachedPurchasedPasses';
import { PurchasedPassFlowWithScreenGuard } from './PurchasedPass/Flow';
import { BuyBussPassOptionsSheet } from './components/BuyBussPassOptionsSheet';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setHasPurchasedPasses } from '@/typescript/state/client/session';
import { languageToCode } from '@/src-v2/utils/common';
import { EventName, EventPrefix, logEvent, logPrefixEvent } from '@/typescript/utils/logger';

export const BusPassFlow: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<StackNavigationProp<MainNavigationParamList>>();
    const language = useAppSelector(selectUserLanguage);
    const {
        data,
        isLoading,
        error: _error,
    } = useMultimodalPassAvailablePassesGetQuery({ language: languageToCode(language) });
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const [selectedPassData, setSelectedPassData] = useState<passAPIEntity | null>(null);
    const [showBuyPassUI, setShowBuyPassUI] = useState(false);

    const offer = data?.[0]?.passes?.[0]?.offer;
    const passes = data?.[0]?.passes;
    const { buyBussPassOptionsSheetRef } = useRefsContext();
    const { data: purchasedPasses } = useCachedPurchasedPasses(true);

    // Update Redux state based on current view
    useEffect(() => {
        const isShowingBuyPassUI = showBuyPassUI || !purchasedPasses?.length || purchasedPasses?.length === 0;
        dispatch(setHasPurchasedPasses(!isShowingBuyPassUI));
    }, [showBuyPassUI, purchasedPasses, dispatch]);

    const handleBuyNow = () => {
        buyBussPassOptionsSheetRef.current?.present();
    };

    const handleConfirmValidity = (data: { startDate: Date; endDate: Date }) => {
        buyBussPassOptionsSheetRef.current?.close();

        if (selectedPassData) {
            logEvent(EventName.USER_PHOTO_SCREEN);
            navigation.navigate('PassesTab', {
                screen: 'takePhoto',
                params: {
                    selectedPass: selectedPassData,
                    date: data,
                    offer: offer,
                    uploadMode: undefined,
                    purchasedPassId: undefined,
                },
            });
        }
    };

    const handleConfirmPass = (selectedPass: passAPIEntity | undefined) => {
        if (selectedPass) {
            logPrefixEvent(EventPrefix.USER_CONFIRMED_PASS, selectedPass.code);
            setSelectedPassData(selectedPass);
            setOpenDatePicker(true);
        }
    };

    const handleModalDismiss = () => {
        setOpenDatePicker(false);
    };

    const handleNavigateToBuyPass = () => {
        setShowBuyPassUI(true);
    };

    // Show BuyPassUI if explicitly requested or if no purchased passes
    if (showBuyPassUI || !purchasedPasses?.length || purchasedPasses?.length === 0) {
        return (
            <BusPassUI
                offer={offer}
                onBuyNow={handleBuyNow}
                passes={passes}
                purchasedPasses={purchasedPasses}
                isLoading={isLoading}
                openDatePicker={openDatePicker}
                onConfirmValidity={handleConfirmValidity}
                onConfirmPass={handleConfirmPass}
                onModalDismiss={handleModalDismiss}
            />
        );
    }

    // Show PurchasedPassFlow if purchased passes exist
    return (
        <>
            <PurchasedPassFlowWithScreenGuard
                handleRenew={handleBuyNow}
                onNavigateToBuyPass={handleNavigateToBuyPass}
            />
            <BuyBussPassOptionsSheet
                passes={passes}
                purchasedPasses={purchasedPasses}
                onConfirm={handleConfirmPass || (() => {})}
                isLoading={isLoading}
                isValidity={openDatePicker}
                handleConfirmValidity={handleConfirmValidity || (() => {})}
                onDismiss={handleModalDismiss}
            />
        </>
    );
};
