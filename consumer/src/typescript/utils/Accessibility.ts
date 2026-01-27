import { AccessibilityInfo, View } from 'react-native';
import { NotificationData } from '../../App';
import type { RefObject } from 'react';

export const setFocus = (_ref: RefObject<View | null>) => {
    // const FOCUS_ON_VIEW = 8;
    // console.log('Inside_SetFocus', ref);
    // if (!ref || !ref.current) return;
    // const reactTag = findNodeHandle(ref.current);
    // if (reactTag === null) return;
    // if(Platform.OS === 'android') {
    //   // UIManager.sendAccessibilityEvent(reactTag, FOCUS_ON_VIEW)
    // }else{
    //   console.log("setAccessibilityFocus", reactTag);
    // AccessibilityInfo.setAccessibilityFocus(reactTag);
    // AccessibilityInfo.setAccessibilityFocus(reactTag);
    // }
};

export const FCMBasedAccessibility = (data: NotificationData) => {
    switch (data.notification_type) {
        case 'DRIVER_ASSIGNMENT':
            AccessibilityInfo.announceForAccessibilityWithOptions('Driver assigned for you', { queue: true });
            return;
        case 'TRIP_STARTED':
            AccessibilityInfo.announceForAccessibilityWithOptions('Your trip started', { queue: true });
            return;
        case 'TRIP_FINISHED':
            AccessibilityInfo.announceForAccessibilityWithOptions('Your trip finished', { queue: true });
            return;
        default:
            break;
    }
};
