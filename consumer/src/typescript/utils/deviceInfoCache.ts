import DeviceInfo from 'react-native-device-info';

// Using separate variables instead of mutable object to comply with immutability rules
// eslint-disable-next-line functional/no-let
let cachedDeviceDetails: string = '';
// eslint-disable-next-line functional/no-let
let isInitialized: boolean = false;

/**
 * Initialize device info cache on app startup.
 * Call this once during app initialization (e.g., in App.tsx or root component).
 * This prevents expensive async DeviceInfo calls on every API request.
 */
export const initDeviceInfoCache = async (): Promise<void> => {
    if (isInitialized) {
        return;
    }

    try {
        const [manufacturer, totalMemory, apiLevel] = await Promise.all([
            DeviceInfo.getManufacturer(),
            DeviceInfo.getTotalMemory(),
            DeviceInfo.getApiLevel(),
        ]);

        cachedDeviceDetails =
            DeviceInfo.getBrand() +
            '/' +
            DeviceInfo.getModel() +
            '/' +
            DeviceInfo.getSystemName() +
            ' v' +
            DeviceInfo.getSystemVersion() +
            '/' +
            (totalMemory / 1024 / 1024 / 1024).toFixed(2) +
            '/' +
            DeviceInfo.getDeviceId() +
            '/' +
            DeviceInfo.getDeviceType() +
            (manufacturer === '' ? '' : '/mf:' + manufacturer) +
            '/' +
            apiLevel;

        isInitialized = true;
    } catch (error) {
        console.error('Failed to initialize device info cache:', error);
        // Fallback to sync-only device info
        cachedDeviceDetails =
            DeviceInfo.getBrand() +
            '/' +
            DeviceInfo.getModel() +
            '/' +
            DeviceInfo.getSystemName() +
            ' v' +
            DeviceInfo.getSystemVersion() +
            '/' +
            DeviceInfo.getDeviceId() +
            '/' +
            DeviceInfo.getDeviceType();
        isInitialized = true;
    }
};

/**
 * Get cached device details string.
 * Returns empty string if cache is not initialized yet.
 * For best performance, ensure initDeviceInfoCache() is called at app startup.
 */
export const getCachedDeviceDetails = (): string => {
    return cachedDeviceDetails;
};

/**
 * Check if device info cache has been initialized.
 */
export const isDeviceInfoCacheInitialized = (): boolean => {
    return isInitialized;
};
