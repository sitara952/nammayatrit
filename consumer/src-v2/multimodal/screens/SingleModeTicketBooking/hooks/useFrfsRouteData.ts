import { useCallback, useEffect, useState, useMemo } from 'react';
import { useFrfsRouteRouteCodeGetMutation } from '@/api/integrations/rtk/FrfsRouteRouteCodeGet';
import { findNearestPoint, getDistanceBtwPoints } from '@/typescript/Maps/helpers/mapUtils';
import { selectCurrentLocation } from '@/typescript/state/client/session';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { StopInfo } from '../Types';
import { EnhancedStopMapping } from '../Types';
import {
    FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    VehicleCategory_vehicleCategory,
} from '@/readOnly/api/types/Enums.gen';
import { latLong } from '@/readOnly/api/types/LatLong.gen';
import { fRFSRouteAPI } from '@/readOnly/api/types/FRFSRouteAPI.gen';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import {
    createFrfsRouteCacheKey,
    selectCachedRouteData,
    setCacheEntry,
    accessCacheEntry,
    shouldRunCacheCleanup,
    cleanupExpiredEntries,
    cleanupLeastUsedEntries,
} from '@/typescript/state/client/frfsRouteCache';

type FrfsRouteDataResult = {
    routeStops: EnhancedStopMapping[] | null;
    isLoading: boolean;
    error: string | null;
    waypoints: latLong[] | undefined;
    routeShortName: string | undefined;
} & StopInfo;

type FrfsRouteDataParams = {
    routeCode: string;
    vehicleType: VehicleCategory_vehicleCategory;
    city: FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity | undefined;
    skip: boolean;
};

/**
 * Hook to fetch and manage FRFS route data
 *
 * This hook encapsulates the logic for fetching route stops information,
 * setting source and destination stops, and handling location-based stop selection.
 */
export const useFrfsRouteData = ({
    routeCode,
    vehicleType,
    city = 'Chennai', // Default city
    skip = false,
}: FrfsRouteDataParams): FrfsRouteDataResult => {
    const [routeStops, setRouteStops] = useState<EnhancedStopMapping[] | null>(null);
    const [sourceCode, setSourceCode] = useState<string | undefined>();
    const [destCode, setDestCode] = useState<string | undefined>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [waypoints, setWaypoints] = useState<undefined | latLong[]>(undefined);
    const [routeShortName, setRouteShortName] = useState<string | undefined>(undefined);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const dispatch = useAppDispatch();

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

    // Create cache key for this request
    const cacheKey = useMemo(
        () => createFrfsRouteCacheKey(routeCode, city || 'Chennai', vehicleType, 'MULTIMODAL'),
        [routeCode, city, vehicleType],
    );

    // Check for cached data
    const cachedRouteData = useAppSelector(state => selectCachedRouteData(state, cacheKey));

    // Process route data from API response or cache
    const processRouteData = useCallback(
        (data: fRFSRouteAPI, _source: 'cache' | 'api') => {
            if (data) {
                // Process stop data with distance calculations
                const processedStops =
                    data.stops?.map((stop: fRFSStationAPI, index: number) => {
                        const distance =
                            currentLocation?.lat && currentLocation?.lng && stop.lat && stop.lon
                                ? getDistanceBtwPoints(
                                      { latitude: currentLocation.lat, longitude: currentLocation.lng },
                                      { latitude: stop.lat, longitude: stop.lon },
                                  )
                                : null;

                        return {
                            routeCode: data.code,
                            stopCode: stop.code,
                            sequenceNum: index,
                            stopName: stop.name,
                            distance,
                            lat: stop.lat,
                            lon: stop.lon,
                        };
                    }) ?? [];

                setRouteStops(processedStops);
                setRouteShortName(data.shortName);
                setWaypoints(data.waypoints);
                const defaultSourceCode = data.stops?.[0]?.code;
                const defaultDestCode = data.stops?.[1]?.code;

                // Find nearest stop from current location or use default stops
                if (currentLocation && data.stops) {
                    const nearestStop = findNearestPoint(
                        data.stops.map((stop: fRFSStationAPI) => ({
                            latitude: stop.lat || 0,
                            longitude: stop.lon || 0,
                        })),
                        {
                            latitude: currentLocation.lat || 0,
                            longitude: currentLocation.lng || 0,
                        },
                    );

                    const nearestStopIndex = nearestStop.point
                        ? data.stops.findIndex(
                              (stop: fRFSStationAPI) =>
                                  stop.lat === nearestStop.point?.latitude && stop.lon === nearestStop.point?.longitude,
                          )
                        : -1;

                    if (nearestStopIndex >= 0) {
                        const selectedSourceCode = data.stops?.[nearestStopIndex]?.code;
                        setSourceCode(selectedSourceCode);
                    } else {
                        setSourceCode(defaultSourceCode);
                        setDestCode(defaultDestCode);
                    }
                } else {
                    setSourceCode(defaultSourceCode);
                    setDestCode(defaultDestCode);
                }
            }
        },
        [currentLocation, routeParams],
    );

    // Fetch route information - cache-first strategy
    const fetchRouteData = useCallback(async () => {
        if (!routeCode || skip) {
            return;
        }

        // Check cache first
        if (cachedRouteData) {
            console.info('🚌 FRFS_ROUTE_API: HOOK_CACHE_HIT', {
                cacheKey,
                routeParams,
                hookContext: 'useFrfsRouteData',
            });

            // Mark cache entry as accessed
            dispatch(accessCacheEntry(cacheKey));

            // Process cached data
            processRouteData(cachedRouteData, 'cache');
            return;
        }

        setIsLoading(true);
        try {
            const res = await getFrfsRouteRouteCodeFn(routeParams);

            if (res.data) {
                // Cache the successful response
                dispatch(
                    setCacheEntry({
                        key: cacheKey,
                        data: res.data,
                    }),
                );

                // Process the API data
                processRouteData(res.data, 'api');
            }
        } catch (err) {
            setError(`${err}`);
        } finally {
            setIsLoading(false);
        }
    }, [routeParams, cacheKey, cachedRouteData, dispatch, processRouteData, getFrfsRouteRouteCodeFn]);

    // Cache cleanup effect
    const needsCleanup = useAppSelector(shouldRunCacheCleanup);
    useEffect(() => {
        if (needsCleanup) {
            dispatch(cleanupExpiredEntries());
            dispatch(cleanupLeastUsedEntries());
        }
    }, [needsCleanup, dispatch]);

    // Fetch route data on component mount or when dependencies change
    useEffect(() => {
        fetchRouteData();
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [fetchRouteData]);

    return {
        routeStops,
        sourceCode,
        destCode,
        setSourceCode,
        setDestCode,
        isLoading,
        waypoints,
        routeShortName,
        error,
    };
};
