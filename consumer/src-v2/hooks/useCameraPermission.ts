import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
    CameraPermissionStatus,
    checkCameraPermission,
    requestCameraPermission,
    openAppSettings,
} from '../utils/cameraPermissions';

interface UseCameraPermissionReturn {
    permissionStatus: CameraPermissionStatus;
    isPermissionGranted: boolean;
    requestPermission: () => Promise<void>;
    openSettings: () => void;
    isLoading: boolean;
}

export const useCameraPermission = (delayMs: number = 2000): UseCameraPermissionReturn => {
    const [permissionStatus, setPermissionStatus] = useState<CameraPermissionStatus>('checking');
    const [isLoading, setIsLoading] = useState(true);
    const lastCheckTime = useRef<number>(0);
    const CHECK_DEBOUNCE_MS = 1000; // Prevent checking too frequently

    const isPermissionGranted = permissionStatus === 'granted';

    const checkPermission = useCallback(async () => {
        try {
            setIsLoading(true);
            const status = await checkCameraPermission();
            setPermissionStatus(status);
        } catch (error) {
            console.error('Error checking camera permission:', error);
            setPermissionStatus('denied');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const requestPermission = useCallback(async () => {
        try {
            setIsLoading(true);
            const status = await requestCameraPermission();
            setPermissionStatus(status);
        } catch (error) {
            console.error('Error requesting camera permission:', error);
            setPermissionStatus('denied');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const openSettings = useCallback(async () => {
        try {
            await openAppSettings();
        } catch (error) {
            console.error('Error opening settings:', error);
        }
    }, []);

    useEffect(() => {
        // Initial permission check
        checkPermission();
    }, []);

    useEffect(() => {
        // Delayed permission request if not granted
        if (permissionStatus === 'denied' && !isLoading) {
            const timer = setTimeout(() => {
                requestPermission();
            }, delayMs);

            return () => clearTimeout(timer);
        }
        return undefined;
    }, [permissionStatus, delayMs, isLoading]);

    // Handle app state changes to refresh permission status
    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active' && permissionStatus !== 'granted') {
                const now = Date.now();
                // Debounce to prevent too frequent checks
                if (now - lastCheckTime.current > CHECK_DEBOUNCE_MS) {
                    lastCheckTime.current = now;
                    console.info('App came to foreground, checking camera permission...');
                    // Use void to explicitly ignore the promise
                    void checkPermission().catch(error => {
                        console.error('Error checking permission on app focus:', error);
                    });
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
    }, [permissionStatus]);

    return {
        permissionStatus,
        isPermissionGranted,
        requestPermission,
        openSettings,
        isLoading,
    };
};
