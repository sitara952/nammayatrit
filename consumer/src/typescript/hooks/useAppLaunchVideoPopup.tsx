import { useEffect, useRef, useMemo, useCallback } from 'react';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { VideoBottomSheetConfig } from '@/src-v2/systems/configs/types';
import { shouldShowPopup, markPopupAsShown } from '../utils/videoPopupFrequencyManager';

interface UseAppLaunchVideoPopupParams {
    config: VideoBottomSheetConfig;
    autoShowOnMount?: boolean;
    delayMs?: number; // Delay in milliseconds before showing popup
}

interface UseAppLaunchVideoPopupReturn {
    sheetRef: React.RefObject<BottomSheetModal | null>;
    shouldShow: boolean;
    showPopup: () => void;
    dismissPopup: () => void;
}

/**
 * Hook to manage app launch video popup with frequency controls
 * @param config Video bottom sheet configuration from remote config (already city-specific from selector)
 * @param autoShowOnMount Whether to automatically show popup on mount (default: false)
 * @param delayMs Delay in milliseconds before showing popup (default: 1500ms for smooth home screen transition)
 * @returns Object containing sheet ref, shouldShow flag, and control functions
 */
export const useAppLaunchVideoPopup = ({
    config,
    autoShowOnMount = false,
    delayMs = 1500,
}: UseAppLaunchVideoPopupParams): UseAppLaunchVideoPopupReturn => {
    const sheetRef = useRef<BottomSheetModal>(null);
    const hasShownRef = useRef(false);

    // Determine if popup should be shown based on all conditions
    const shouldShow = useMemo(() => {
        // Basic enabled check
        if (!config.enabled) {
            return false;
        }

        // Check if configured to show on launch
        if (!config.showOnLaunch) {
            return false;
        }

        // Check frequency rules
        if (!shouldShowPopup(config.id, config.frequency)) {
            return false;
        }

        return true;
    }, [config.enabled, config.showOnLaunch, config.id, config.frequency]);

    /**
     * Show the popup and mark it as shown
     */
    const showPopup = useCallback(() => {
        if (shouldShow && !hasShownRef.current) {
            // Delay to ensure home screen is fully rendered and transition is complete
            setTimeout(() => {
                sheetRef.current?.present();
                markPopupAsShown(config.id);
                hasShownRef.current = true;
            }, delayMs);
        }
    }, [shouldShow, config.id, delayMs]);

    /**
     * Dismiss the popup
     */
    const dismissPopup = useCallback(() => {
        sheetRef.current?.dismiss();
    }, []);

    // Auto-show on mount if enabled
    useEffect(() => {
        if (autoShowOnMount) {
            showPopup();
        }
    }, [autoShowOnMount]);

    return {
        sheetRef,
        shouldShow,
        showPopup,
        dismissPopup,
    };
};
