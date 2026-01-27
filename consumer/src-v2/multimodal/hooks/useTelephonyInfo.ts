import { useEffect, useState, useCallback, useRef } from 'react';
import { NativeModules, PermissionsAndroid, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { selectCurrentLocation } from '@/typescript/state/client/session';
import { useStoreTowerInfoPostMutation } from '@/api/integrations/rtk/StoreTowerInfoPost';

const { TelephonyModule } = NativeModules;

export interface CellTowerInfo {
    networkType: string;
    cellType: string;
    cellId: string | number;
    areaCode: number;
    signalStrength: number;
    isRegistered: boolean;
}

export interface TelephonyData {
    towerInfo: CellTowerInfo[];
    userLat: number | null;
    userLng: number | null;
    latLngAccuracy: number | null;
    timeStamp: number;
}

interface UseTelephonyInfoOptions {
    fetchOnMount?: boolean;
    includeLocation?: boolean;
}

interface UseTelephonyInfoResult {
    data: TelephonyData | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<TelephonyData | null>;
    isAvailable: boolean;
}

const requestTelephonyPermissions = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return false;

    try {
        const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return Object.values(granted).every(permission => permission === PermissionsAndroid.RESULTS.GRANTED);
    } catch {
        return false;
    }
};

export const useTelephonyInfo = (options: UseTelephonyInfoOptions = {}): UseTelephonyInfoResult => {
    const { fetchOnMount = true, includeLocation = true } = options;

    const [data, setData] = useState<TelephonyData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const hasFetchedOnMount = useRef(false);

    const currentLocation = useSelector(selectCurrentLocation);
    const locationRef = useRef(currentLocation);
    locationRef.current = currentLocation;

    const isAvailable = Platform.OS === 'android' && !!TelephonyModule;

    // RTK mutation hook for storing tower info
    const [storeTowerInfo] = useStoreTowerInfoPostMutation();

    const fetchTelephonyInfo = useCallback(async (): Promise<TelephonyData | null> => {
        if (!isAvailable) {
            // console.info('TelephonyModule not available on this platform/variant');
            setError('TelephonyModule not available');
            return null;
        }

        setIsLoading(true);
        setError(null);

        try {
            const location = locationRef.current;
            const locationData = includeLocation
                ? {
                      lat: location?.lat,
                      lng: location?.lng,
                      accuracy: location?.distanceFromCurrentLocation
                          ? parseFloat(location.distanceFromCurrentLocation)
                          : undefined,
                  }
                : null;

            const telephonyData = await fetchTelephonyData(locationData);

            if (!telephonyData) {
                const errorMsg = 'Failed to fetch telephony data';
                setError(errorMsg);
                setIsLoading(false);
                return null;
            }

            setData(telephonyData);

            // Call the API to store tower info
            try {
                await storeTowerInfo({
                    body: {
                        towerInfo: telephonyData.towerInfo.map(tower => ({
                            ...tower,
                            cellId: String(tower.cellId), // Convert to string as backend expects Text
                        })),
                        userLat: telephonyData.userLat ?? 0.0,
                        userLng: telephonyData.userLng ?? 0.0,
                        latLngAccuracy: telephonyData.latLngAccuracy ?? 0.0,
                        timeStamp: new Date(telephonyData.timeStamp).toISOString(),
                    },
                }).unwrap();
                console.info('✅ Tower info successfully sent to backend');
            } catch {
                // Don't set error state as this is a background operation
            }

            setIsLoading(false);
            // console.info('📡 Device & Location Information:', telephonyData);
            return telephonyData;
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Error fetching telephony info';
            // console.error('Error fetching telephony info:', err);
            setError(errorMsg);
            setIsLoading(false);
            return null;
        }
    }, [isAvailable, includeLocation, storeTowerInfo]);

    useEffect(() => {
        if (fetchOnMount && !hasFetchedOnMount.current) {
            hasFetchedOnMount.current = true;
            void fetchTelephonyInfo();
        }
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [fetchOnMount, fetchTelephonyInfo]);

    return {
        data,
        isLoading,
        error,
        refetch: fetchTelephonyInfo,
        isAvailable,
    };
};

export const fetchTelephonyData = async (
    location: { lat: number | undefined; lng: number | undefined; accuracy: number | undefined } | null | undefined,
): Promise<TelephonyData | null> => {
    if (Platform.OS !== 'android' || !TelephonyModule) {
        // console.info('TelephonyModule not available on this platform/variant');
        return null;
    }

    try {
        const hasPermissions = await requestTelephonyPermissions();

        if (!hasPermissions) {
            // console.warn('Telephony permissions not granted');
            return null;
        }

        const cellTowers = await TelephonyModule.getDeviceInfo();

        const telephonyData: TelephonyData = {
            towerInfo: cellTowers.map(
                (tower: {
                    networkType: string;
                    cellType: string;
                    cellId: string | number;
                    areaCode: number;
                    signalStrengthDbm: number;
                    isRegistered: boolean;
                }) => ({
                    networkType: tower.networkType,
                    cellType: tower.cellType,
                    cellId: tower.cellId,
                    areaCode: tower.areaCode,
                    signalStrength: tower.signalStrengthDbm,
                    isRegistered: tower.isRegistered,
                }),
            ),
            userLat: location?.lat ?? null,
            userLng: location?.lng ?? null,
            latLngAccuracy: location?.accuracy ?? null,
            timeStamp: Date.now(),
        };

        // console.info('📡 Device & Location Information:', telephonyData);
        return telephonyData;
    } catch {
        // Error fetching telephony info
        return null;
    }
};
