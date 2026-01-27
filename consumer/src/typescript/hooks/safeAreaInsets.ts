import { useSafeAreaInsets as safeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { getBoolItem, MMKVKey } from '../utils/MMKV';

export const useSafeAreaInsets = () => {
    const insets = safeAreaInsets();
    const isGestureEnable = getBoolItem(MMKVKey.IS_GESTURE_ENABLE);
    // Default values for Android and iOS
    const DEFAULTS = {
        android: {
            top: 18,
            bottom: 15,
            left: 0,
            right: 0,
        },
        ios: {
            top: 20,
            bottom: 10,
            left: 0,
            right: 0,
        },
    };

    if (Platform.OS === 'android') {
        const top = insets.top === 0 ? DEFAULTS.android.top : insets.top + 5;
        const bottom = insets.bottom === 0 ? DEFAULTS.android.bottom : insets.bottom + (isGestureEnable ? 10 : 15);
        return { top, bottom, left: insets.left, right: insets.right };
    } else if (Platform.OS === 'ios') {
        const top = insets.top === 0 ? DEFAULTS.ios.top : insets.top;
        const bottom = insets.bottom === 0 ? DEFAULTS.ios.bottom : insets.bottom;
        return { top, bottom, left: insets.left, right: insets.right };
    }
    return {
        top: insets.top,
        bottom: insets.bottom,
        left: insets.left,
        right: insets.right,
    };
};
