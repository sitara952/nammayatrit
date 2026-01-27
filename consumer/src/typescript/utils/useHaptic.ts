import { Platform } from 'react-native';
import * as Haptics from 'react-native-haptic-feedback';

export interface HapticOptions {
    enableVibrateFallback?: boolean;
    ignoreAndroidSystemSettings?: boolean;
}

const getAndroidFeedback = (type: Haptics.HapticFeedbackTypes | undefined): Haptics.HapticFeedbackTypes | undefined => {
    switch (type) {
        case Haptics.HapticFeedbackTypes.selection:
            return Haptics.HapticFeedbackTypes.impactLight;
        default:
            return type;
    }
};

const getIOSFeedback = (type: Haptics.HapticFeedbackTypes | undefined): Haptics.HapticFeedbackTypes | undefined => {
    switch (type) {
        case Haptics.HapticFeedbackTypes.clockTick:
        case Haptics.HapticFeedbackTypes.contextClick:
        case Haptics.HapticFeedbackTypes.keyboardPress:
        case Haptics.HapticFeedbackTypes.keyboardRelease:
        case Haptics.HapticFeedbackTypes.keyboardTap:
        case Haptics.HapticFeedbackTypes.longPress:
        case Haptics.HapticFeedbackTypes.textHandleMove:
        case Haptics.HapticFeedbackTypes.virtualKey:
        case Haptics.HapticFeedbackTypes.virtualKeyRelease:
        case Haptics.HapticFeedbackTypes.effectClick:
        case Haptics.HapticFeedbackTypes.effectDoubleClick:
        case Haptics.HapticFeedbackTypes.effectHeavyClick:
        case Haptics.HapticFeedbackTypes.effectTick:
            return Haptics.HapticFeedbackTypes.soft;
        default:
            return type;
    }
};

export const hapticEffect = (type: Haptics.HapticFeedbackTypes | undefined, opts: HapticOptions | undefined) => {
    const defaultOptions: HapticOptions = {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
        ...opts,
    };

    const feedbackType = Platform.OS === 'ios' ? getIOSFeedback(type) : getAndroidFeedback(type);

    Haptics.trigger(feedbackType, defaultOptions);
};
