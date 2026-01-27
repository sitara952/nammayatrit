import React, { useState, useEffect, useCallback } from 'react';
import { TransitPreferencesState } from './Types';
import {
    FRFSServiceTierType_fRFSServiceTierType,
    MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';
import TransitPreferencesUI from './UI';
import { useMultimodalUserPreferencesGetQuery } from '@/api/integrations/rtk/MultimodalUserPreferencesGet';
import { useMultimodalUserPreferencesPostMutation } from '@/api/integrations/rtk/MultimodalUserPreferencesPost';
import { multimodalUserPreferences } from '@/readOnly/api/types/MultimodalUserPreferences.gen';
import { useAppDispatch } from '@/typescript/state/hooks';
import { setToastProps } from '@/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Danger from '@/typescript/components/svg/Danger';
import { ToastProps } from '@/typescript/state/client/session';
import { ActivityIndicator, View } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';

const TransitPreferencesFlow: React.FC = () => {
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');

    const { data: preferencesData, isLoading } = useMultimodalUserPreferencesGetQuery({});
    const [updatePreferences, { isLoading: isUpdating }] = useMultimodalUserPreferencesPostMutation();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const [preferences, setPreferences] = useState<TransitPreferencesState>({
        allowedTransitModes: [],
        busTransitTypes: [],
        subwayTransitTypes: [],
    });

    const handleGoBack = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
        navigation.goBack();
    }, [navigation]);

    useEffect(() => {
        if (preferencesData) {
            setPreferences({
                allowedTransitModes: preferencesData.allowedTransitModes,
                busTransitTypes: preferencesData.busTransitTypes || [],
                subwayTransitTypes: preferencesData.subwayTransitTypes || [],
            });
        }
    }, [preferencesData]);

    const handleToggleMode = useCallback((mode: MultimodalTravelMode_multimodalTravelMode) => {
        setPreferences(prev => {
            const isCurrentlyEnabled = prev.allowedTransitModes.includes(mode);
            const newAllowedModes = isCurrentlyEnabled
                ? prev.allowedTransitModes.filter(m => m !== mode)
                : [...prev.allowedTransitModes, mode];

            // If we're disabling the mode, clear its sub-options
            if (isCurrentlyEnabled) {
                return {
                    ...prev,
                    allowedTransitModes: newAllowedModes,
                    busTransitTypes: mode === 'Bus' ? [] : prev.busTransitTypes,
                    subwayTransitTypes: mode === 'Subway' ? [] : prev.subwayTransitTypes,
                };
            }

            return {
                ...prev,
                allowedTransitModes: newAllowedModes,
            };
        });
    }, []);

    const handleToggleTier = useCallback((mode: 'bus' | 'subway', tier: FRFSServiceTierType_fRFSServiceTierType) => {
        setPreferences(prev => ({
            ...prev,
            [`${mode}TransitTypes`]: prev[`${mode}TransitTypes`].includes(tier)
                ? prev[`${mode}TransitTypes`].filter(t => t !== tier)
                : [...prev[`${mode}TransitTypes`], tier],
        }));
    }, []);

    const handleConfirm = useCallback(async () => {
        try {
            const payload: multimodalUserPreferences = {
                allowedTransitModes: preferences.allowedTransitModes,
                busTransitTypes: preferences.busTransitTypes,
                subwayTransitTypes: preferences.subwayTransitTypes,
                journeyOptionsSortingType: preferencesData?.journeyOptionsSortingType,
            };
            await updatePreferences({ body: payload }).unwrap();
            navigation.goBack();
        } catch {
            const errorToast: ToastProps = {
                message: 'Failed to save preferences',
                backgroundColor: `${themeColors.Fill_negativeHigh}`,
                visible: true,
                logo: <Danger />,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                autoDismissAfter: 2000,
                customToast: undefined,
                margin: undefined,
            };
            dispatch(setToastProps(errorToast));
        }
    }, [preferences, preferencesData]);

    if (isLoading) {
        return (
            <View style={tailwind`flex-1 justify-center items-center`}>
                <ActivityIndicator size="large" color={themeColors.Icon_neutralUltraHigh} />
            </View>
        );
    }

    return (
        <TransitPreferencesUI
            preferences={preferences}
            onToggleMode={handleToggleMode}
            onToggleTier={handleToggleTier}
            onConfirm={handleConfirm}
            isLoading={isUpdating}
            backpress={handleGoBack}
        />
    );
};

export default TransitPreferencesFlow;
