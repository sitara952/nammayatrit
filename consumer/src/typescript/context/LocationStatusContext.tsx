import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { LocationWithTimestamp } from '@/src-v2/multimodal/hooks/useRiderLocation';
import { isLocationAccuracyGood } from '@/src-v2/multimodal/utils/journeyTrackingUtils';

export type LocationStatus = 'success' | 'refreshing' | 'error';

interface LocationStatusContextType {
    locationStatus: LocationStatus;
    updateLocationHistoryForStatus: (history: LocationWithTimestamp[]) => void;
}

const LocationStatusContext = createContext<LocationStatusContextType | undefined>(undefined);

export const useLocationStatusContext = () => {
    const context = useContext(LocationStatusContext);
    if (!context) {
        throw new Error('useLocationStatusContext must be used within a LocationStatusProvider');
    }
    return context;
};

export const LocationStatusProvider = ({ children }: { children: React.ReactNode }) => {
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('success');
    const [locationHistory, setLocationHistory] = useState<LocationWithTimestamp[]>([]);
    const lastFailureTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const isLocationGood = isLocationAccuracyGood(locationHistory);

        if (isLocationGood) {
            // If location is good, reset failure time and show success
            lastFailureTimeRef.current = null;
            setLocationStatus('success');
        } else {
            // If location is not good, check if we should show refreshing or error
            const now = Date.now();
            const timeSinceLastFailure = lastFailureTimeRef.current ? now - lastFailureTimeRef.current : 0;
            const REFRESHING_DURATION = 10000; // 10 seconds

            if (timeSinceLastFailure < REFRESHING_DURATION) {
                // If we haven't tracked failure time yet, set it
                if (lastFailureTimeRef.current === null) {
                    lastFailureTimeRef.current = Date.now();
                }
                setLocationStatus('refreshing');
            } else {
                // Error state - don't reset the failure time, just show error
                setLocationStatus('error');
            }
        }
    }, [locationHistory]);

    const updateLocationHistoryForStatus = useCallback((history: LocationWithTimestamp[]) => {
        setLocationHistory(history);
    }, []);

    return (
        <LocationStatusContext.Provider value={{ locationStatus, updateLocationHistoryForStatus }}>
            {children}
        </LocationStatusContext.Provider>
    );
};
