import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector, useAppDispatch } from '../../state/hooks';
import {
    selectNewFeatureFlags,
    setBottomSheetStage,
    BottomSheetStage,
    setActiveInput,
    SearchInput,
} from '../../state/client/session';
import { MainNavigationParamList } from '../../navigation/globalParamList';
import { GenericVideoBottomSheet } from './GenericVideoBottomSheet';

interface NammaTransitVideoBottomSheetProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
}

export const NammaTransitVideoBottomSheet: React.FC<NammaTransitVideoBottomSheetProps> = ({ sheetRef }) => {
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const config = featureFlags.nammaTransitServicePopupConfig;

    const handleNavigateToSearch = useCallback(() => {
        // Close the bottom sheet
        sheetRef.current?.dismiss();

        // Navigate to the HomeTab and trigger search
        navigation.navigate(
            'mainTabNavigation',
            {
                screen: 'homeTab_homeScreen',
            },
            { pop: true },
        );

        // Set active input to destination and trigger search bottom sheet
        dispatch(setActiveInput(SearchInput.Destination));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'namma_transit_button' }));
    }, [dispatch, navigation, sheetRef]);

    return <GenericVideoBottomSheet sheetRef={sheetRef} config={config} onButtonPress={handleNavigateToSearch} />;
};
