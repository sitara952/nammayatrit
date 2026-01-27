import { useCallback, useMemo } from 'react';
import * as Haptics from 'react-native-haptic-feedback';

export interface HapticOptions {
    enableVibrateFallback: boolean | undefined;
    ignoreAndroidSystemSettings: boolean | undefined;
}

export const useHaptic = (
    feedbackType: Haptics.HapticFeedbackTypes = Haptics.HapticFeedbackTypes.selection,
    options: HapticOptions | undefined,
) => {
    const triggerHaptic = useCallback((type: Haptics.HapticFeedbackTypes, opts?: HapticOptions) => {
        const defaultOptions: HapticOptions = {
            enableVibrateFallback: true,
            ignoreAndroidSystemSettings: false,
            ...opts,
        };

        return () => Haptics.trigger(type, defaultOptions);
    }, []);

    const hapticEffect = useMemo(() => triggerHaptic(feedbackType, options), [feedbackType, options, triggerHaptic]);

    return hapticEffect;
};
