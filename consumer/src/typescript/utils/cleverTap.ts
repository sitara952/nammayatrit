import CleverTap from 'clevertap-react-native';
import { getStringItem, MMKVKey } from './MMKV';

export const logEvent: (
    eventName: string,
    props?: { [key: string]: string | number | boolean | object | undefined | null },
) => void = (eventName, props) => {
    CleverTap.recordEvent(eventName, props);
};

interface CleverTapProfile {
    [key: string]: string;
}

export const setCleverTapUserData = async (key: string, value: string): Promise<void> => {
    try {
        // Create a new immutable object for profile update
        const profileUpdate: CleverTapProfile = { [key]: value };

        // Log user login with the updated profile
        CleverTap.onUserLogin({ ...profileUpdate });

        // Fetch FCM Token from AsyncStorage
        const fcmRegId = getStringItem(MMKVKey.FCM_TOKEN);

        if (fcmRegId) {
            CleverTap.setFCMPushToken(fcmRegId);
        }
    } catch (error) {
        console.error('Error sending user data:', error);
    }
};
