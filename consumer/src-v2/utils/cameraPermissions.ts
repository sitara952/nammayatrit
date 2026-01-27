import { Platform, Linking } from 'react-native';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export type CameraPermissionStatus = 'checking' | 'granted' | 'denied' | 'blocked' | 'unavailable';

export const checkCameraPermission = async (): Promise<CameraPermissionStatus> => {
    try {
        const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

        const result = await check(permission);

        switch (result) {
            case RESULTS.UNAVAILABLE:
                return 'unavailable';
            case RESULTS.DENIED:
                return 'denied';
            case RESULTS.GRANTED:
                return 'granted';
            case RESULTS.BLOCKED:
                return 'blocked';
            default:
                return 'denied';
        }
    } catch (error) {
        console.error('Error checking camera permission:', error);
        return 'denied';
    }
};

export const requestCameraPermission = async (): Promise<CameraPermissionStatus> => {
    try {
        const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

        const result = await request(permission);

        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.info('Camera is not available on this device.');
                return 'unavailable';
            case RESULTS.DENIED:
                console.info('Camera permission has been denied.');
                return 'denied';
            case RESULTS.GRANTED:
                console.info('Camera permission has been granted.');
                return 'granted';
            case RESULTS.BLOCKED:
                console.info('Camera permission is blocked and cannot be requested again.');
                return 'blocked';
            default:
                return 'denied';
        }
    } catch (error) {
        console.error('Error requesting camera permission:', error);
        return 'denied';
    }
};

export const openAppSettings = async (): Promise<void> => {
    try {
        if (Platform.OS === 'android') {
            // Android-specific approach - try multiple methods
            try {
                // Method 1: Try to open app-specific settings
                await Linking.openSettings();
            } catch (settingsError) {
                console.error('Linking.openSettings failed:', settingsError);
                // Method 2: Try package-specific URL
                try {
                    const packageName = 'package:com.mobility.movingtech';
                    await Linking.openURL(packageName);
                } catch (packageError) {
                    console.error('Package URL failed:', packageError);
                    // Method 3: Try general settings intent
                    try {
                        await Linking.openURL('android.settings.APPLICATION_DETAILS_SETTINGS');
                    } catch (generalError) {
                        console.error('All methods failed:', generalError);
                        throw generalError;
                    }
                }
            }
        } else {
            // iOS approach
            const canOpen = await Linking.canOpenURL('app-settings:');
            if (canOpen) {
                await Linking.openURL('app-settings:');
            } else {
                await Linking.openSettings();
            }
        }
    } catch (error) {
        console.error('Error opening app settings:', error);
        // Final fallback
        try {
            await Linking.openSettings();
        } catch (fallbackError) {
            console.error('Final fallback also failed:', fallbackError);
        }
    }
};
