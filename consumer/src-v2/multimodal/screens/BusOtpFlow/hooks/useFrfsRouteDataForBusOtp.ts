import { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { useFrfsRouteRouteCodeGetMutation } from '../../../../../src/api/integrations/rtk/FrfsRouteRouteCodeGet';
import { setBusRouteData, updateNearestStation } from '../busOtp';
import { findNearestStationForBusOtp } from '../utils';
import { selectValidBusOtpLastClickLocation } from '@/typescript/state/client/session';
import { convertFrfsStationToTransportStation } from '@/typescript/utils/MultiModal';
import { transportStation } from '../../../../../src/readOnly/api/types/PublicTransportData.gen';
import { fRFSStationAPI } from '../../../../../src/readOnly/api/types/FRFSStationAPI.gen';
import { fRFSRouteAPI } from '../../../../../src/readOnly/api/types/FRFSRouteAPI.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';

import { type FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity } from '@/readOnly/api/types/Enums.gen';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';

interface UseFrfsRouteDataForBusOtpParams {
    routeCode: string;
    otp: string;
    vehicleType?: VehicleCategory_vehicleCategory;
    city?: FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity;
    detectedRoute?: string; // Defaults to '21G' if not provided
    skip?: boolean;
}

interface UseFrfsRouteDataForBusOtpReturn {
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    refetch: () => void;
}

/**
 * Hook to fetch FRFS route data and update BusOtp Redux store
 * This is used when useBusOtpFlow hook is not called but we need route data
 */
export const useFrfsRouteDataForBusOtp = ({
    routeCode,
    otp,
    vehicleType = 'BUS',
    city = 'Chennai',
    detectedRoute,
    skip = false,
}: UseFrfsRouteDataForBusOtpParams): UseFrfsRouteDataForBusOtpReturn => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const storedLoc = useAppSelector(selectValidBusOtpLastClickLocation);
    const [getFrfsRouteRouteCodeFn] = useFrfsRouteRouteCodeGetMutation();

    const routeParams = useMemo(
        () => ({
            routeCode,
            platformType: 'MULTIMODAL' as const,
            city,
            vehicleType,
        }),
        [routeCode, city, vehicleType],
    );

    const transformFrfsStationsToTransportStations = useCallback(
        (frfsStations: fRFSStationAPI[]): transportStation[] => {
            return frfsStations.map(station => convertFrfsStationToTransportStation(station, vehicleType));
        },
        [vehicleType],
    );

    const processRouteData = useCallback(
        async (routeData: fRFSRouteAPI) => {
            try {
                if (!routeData?.stops || !Array.isArray(routeData.stops)) {
                    throw new Error('Invalid route data: missing or invalid stops array');
                }

                // Transform FRFS stations to transport stations
                const sortedStations = transformFrfsStationsToTransportStations(routeData.stops);

                // Try using the stored user location for bus OTP flows — fallback to actual GPS if not available
                const userLocationOverride = storedLoc ? { coords: storedLoc.coords } : undefined;
                const nearestStation = await findNearestStationForBusOtp(sortedStations, 100, 50, userLocationOverride);

                // Update Redux store with route data
                dispatch(
                    setBusRouteData({
                        otp,
                        payload: {
                            sortedStations,
                            detectedRoute: detectedRoute ?? '21G',
                            nearestStation,
                            detectedRouteCode: routeCode,
                            detectedRouteObject: null,
                            enableSourceStopsSlicing: newFeatureFlags.enableSourceStopsSlicing,
                            filteredRouteSections: [],
                            eligiblePassIds: [],
                        },
                    }),
                );

                // Update nearest station separately to trigger stops list updates
                if (nearestStation) {
                    dispatch(
                        updateNearestStation({
                            otp,
                            payload: {
                                transportStation: nearestStation,
                                enableSourceStopsSlicing: newFeatureFlags.enableSourceStopsSlicing,
                            },
                        }),
                    );
                }
                setIsSuccess(true);
                setError(null);
            } catch (err) {
                console.error('Error processing FRFS route data:', err);
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                setIsSuccess(false);
            }
        },
        [dispatch, otp, routeCode, detectedRoute, transformFrfsStationsToTransportStations],
    );

    const fetchRouteData = useCallback(() => {
        if (!routeCode || skip || !otp) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        const fetchData = async () => {
            try {
                const result = await getFrfsRouteRouteCodeFn(routeParams);

                if (result.data) {
                    await processRouteData(result.data);
                } else if (result.error) {
                    // Handle different error types
                    const errorMessage = (() => {
                        if (
                            'data' in result.error &&
                            result.error.data &&
                            typeof result.error.data === 'object' &&
                            'message' in result.error.data
                        ) {
                            const errorData = result.error.data;
                            return typeof errorData.message === 'string'
                                ? errorData.message
                                : 'Failed to fetch route data';
                        }
                        return 'Failed to fetch route data';
                    })();
                    setError(errorMessage);
                    console.error('FRFS route API error:', result.error);
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
                setError(errorMessage);
                console.error('FRFS route fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [routeParams, skip, otp, processRouteData, getFrfsRouteRouteCodeFn]);

    // Fetch route data on mount or when dependencies change
    useEffect(() => {
        fetchRouteData();
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [fetchRouteData]);

    return {
        isLoading,
        error,
        isSuccess,
        refetch: fetchRouteData,
    };
};
