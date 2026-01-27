import { BottomSheetModal } from '@gorhom/bottom-sheet';
import React, { useCallback } from 'react';
import { GenericVideoBottomSheet } from './GenericVideoBottomSheet';
import { VideoBottomSheetConfig } from '@/src-v2/systems/configs/types';
import { useHomeActions } from '../../homeActions/useHomeActions';

interface AppLaunchVideoBottomSheetProps {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    config: VideoBottomSheetConfig;
}

/**
 * Generic app launch video bottom sheet component
 * Displays a video popup when the app launches based on configuration
 * Uses centralized Home action handlers for all VideoBottomSheetActions
 */
export const AppLaunchVideoBottomSheet: React.FC<AppLaunchVideoBottomSheetProps> = ({ sheetRef, config }) => {
    const { triggerHomeAction } = useHomeActions();

    const handleButtonPress = useCallback(() => {
        const action = config.onButtonPress;

        if (!action) {
            sheetRef.current?.dismiss();
            return;
        }

        triggerHomeAction(action.actionName, {
            ...action,
            source: 'APP_LAUNCH_VIDEO',
        });
        sheetRef.current?.dismiss();
    }, [config.onButtonPress, sheetRef, triggerHomeAction]);

    return <GenericVideoBottomSheet sheetRef={sheetRef} config={config} onButtonPress={handleButtonPress} />;
};
