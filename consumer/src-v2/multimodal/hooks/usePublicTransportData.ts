/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-let */
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useLazyPublicTransportDataGetQuery } from '@/api/integrations/rtk/PublicTransportDataGet';
import { createMMKV } from '@/utils/mmkvUtils';
import { useNetInfo } from '@react-native-community/netinfo';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserProfile, setProfile } from '@/typescript/state/client/user';
import { RootState } from '@/typescript/state/store';
import { publicTransportData, transportStation, transportRoute } from '@/readOnly/api/types/PublicTransportData.gen';
import { globalCache } from '@/src-v2/systems/cache/cache';
import { api } from '@/typescript/state/api';
import { logger } from '@/src-v2/systems/logger';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { isNull } from 'lodash';
import { profileRes } from '@/readOnly/api/types/ProfileRes.gen';

// Storage key for the public transport data
export const PUBLIC_TRANSPORT_DATA_KEY = 'public_transport_data_v22';
export const PUBLIC_TRANSPORT_CONFIG_VERSION_KEY = 'public_transport_config_version';

// Storage instance for caching the data locally
const storage = createMMKV();

/**
 * Converts station codes in route longName to proper station names
 * @param subtitle The longName string potentially containing station codes
 * @param stations Array of stations to look up station codes
 * @param vehicleType The vehicle type to match for stations
 * @returns Properly formatted subtitle with station names
 */
const convertToProperSubtitle = (
    subtitle: string,
    stationMap: Record<string, Record<string, transportStation>>,
    vehicleType: string,
): string => {
    if (subtitle.includes('-')) {
        const [from, to] = subtitle.split('-');
        const fromTrimmed = from?.trim();
        const toTrimmed = to?.trim();
        const fromStation = fromTrimmed
            ? findStationFromMap(fromTrimmed, vehicleType, stationMap)?.name || fromTrimmed
            : '';
        const toStation = toTrimmed ? findStationFromMap(toTrimmed, vehicleType, stationMap)?.name || toTrimmed : '';
        return `${fromStation} To ${toStation}`;
    }
    return capitalizeWithDotHandling(subtitle);
};

/**
 * Capitalizes a string with special handling for dot-separated abbreviations
 * @param text The input text to capitalize
 * @returns The capitalized text
 */
const capitalizeWithDotHandling = (text: string): string => {
    // Handle empty/null cases
    if (!text) return '';

    // Split by spaces first to handle separate words
    const words = text.split(' ');

    return words
        .map(word => {
            // Split each word by dots
            const parts = word.split('.');

            // If single part with no dots, just capitalize first letter
            if (parts.length === 1) {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            }

            // Check if this part contains all single characters (like c.m.b.t)
            const isAbbreviation = parts.every(part => part.length <= 1);

            if (isAbbreviation) {
                // Join all parts and make uppercase for abbreviations
                return parts.join('').toUpperCase();
            }

            // For mixed cases like "m.g.r.central", split into abbreviation and word
            const abbreviationParts = [];
            const wordParts = [];

            let isWordStarted = false;
            for (const part of parts) {
                if (!isWordStarted && part.length <= 1) {
                    abbreviationParts.push(part);
                } else {
                    isWordStarted = true;
                    wordParts.push(part);
                }
            }

            const result = [];
            if (abbreviationParts.length > 0) {
                result.push(abbreviationParts.join('').toUpperCase());
            }
            if (wordParts.length > 0) {
                const word = wordParts.join(' ');
                result.push(word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
            }

            return result.join(' ');
        })
        .join(' ');
};

/**
 * Find a station by its code with matching vehicle type
 * @param stationCode The station code to search for
 * @param vehicleType The vehicle type to match
 * @param stations Array of stations to search in
 * @returns The station if found, undefined otherwise
 */
const findStationFromMap = (
    code: string,
    vehicleType: string,
    stationMap: Record<string, Record<string, transportStation>>,
): transportStation | undefined => {
    return stationMap[vehicleType]?.[code];
};

const buildStationMap = (stations: transportStation[]): Record<string, Record<string, transportStation>> => {
    const map: Record<string, Record<string, transportStation>> = {};
    for (const station of stations) {
        const { vehicleType, code } = station;
        if (!vehicleType || !code) continue; // Skip invalid stations
        if (!map[vehicleType]) {
            map[vehicleType] = {};
        }
        map[vehicleType][code] = station;
    }
    return map;
};

/**
 * Finds the reverse route code for a given route based on station names
 * @param route The current route to find a reverse for
 * @param routeMap Map of station pairs to route objects for quick lookup
 * @returns The routeCode of the reverse route, or undefined if not found
 */
const findReverseRouteCode = (route: transportRoute, routeMap: Map<string, transportRoute[]>): string | undefined => {
    // Skip if longName doesn't follow the expected format
    if (!route.longName.includes(' To ')) {
        return undefined;
    }

    // Extract station names from longName
    const [fromStation, toStation] = route.longName.split(' To ').map(s => s.trim());

    // Create key for the reverse route
    const reverseKey = `${toStation}:${fromStation}`;

    // Look up potential reverse routes
    const candidates = routeMap.get(reverseKey);

    if (!candidates || candidates.length === 0) {
        return undefined;
    }

    if (candidates.length === 1) {
        return candidates[0]?.code;
    }

    // If multiple routes match, choose the one with highest dailyTripCount
    return candidates.reduce((best, current) => {
        if (!best) return current;

        const bestTripCount = best.dailyTripCount
            ? typeof best.dailyTripCount === 'number'
                ? best.dailyTripCount
                : 0
            : 0;

        const currentTripCount = current.dailyTripCount
            ? typeof current.dailyTripCount === 'number'
                ? current.dailyTripCount
                : 0
            : 0;

        return currentTripCount > bestTripCount ? current : best;
    }, candidates[0])?.code;
};

/**
 * Creates a map of route station pairs for quick reverse route lookup
 * @param routes Array of routes
 * @returns Map with keys in format "fromStation:toStation" and values as arrays of matching routes
 */
const createRouteMap = (routes: transportRoute[]): Map<string, transportRoute[]> => {
    const routeMap = new Map<string, transportRoute[]>();

    routes.forEach(route => {
        if (!route.longName.includes(' To ')) return;

        const [fromStation, toStation] = route.longName.split(' To ').map(s => s.trim());
        const key = `${fromStation}:${toStation}`;

        if (!routeMap.has(key)) {
            routeMap.set(key, []);
        }

        routeMap.get(key)?.push(route);
    });

    return routeMap;
};

/**
 * A custom hook that manages public transport data, handling offline caching and version synchronization
 * Uses FCM notifications and profile API to check for data updates instead of polling
 *
 * @param enabled - Whether the feature is enabled
 * @returns Object containing public transport data and loading/error states
 */
export const usePublicTransportData = (enabled: boolean) => {
    const { isConnected } = useNetInfo();
    const dispatch = useDispatch();

    // States for managing cache version and loading
    const [cacheInitialized, setCacheInitialized] = useState(false);
    const [cachedVersion, setCachedVersion] = useState<string | null>(null);

    // Get profile config version from Redux
    const userProfile = useSelector((state: RootState) => selectUserProfile(state));
    const profileVersion = userProfile?.publicTransportVersion;

    // Initialize cache data on mount
    useEffect(() => {
        const initializeCache = async () => {
            try {
                const storedVersion = storage.getString(PUBLIC_TRANSPORT_CONFIG_VERSION_KEY);
                const storedData = storage.getString(PUBLIC_TRANSPORT_DATA_KEY);

                if (storedVersion && storedData) {
                    // We have cached data
                    setCachedVersion(storedVersion);
                    const parsedData = safeJsonParse<publicTransportData | null>(
                        storedData,
                        null,
                        'public transport data',
                    );
                    if (!isNull(parsedData)) {
                        globalCache.set<publicTransportData>(
                            PUBLIC_TRANSPORT_DATA_KEY,
                            parsedData,
                            1000 * 60 * 60 * 24, // 24 hours TTL
                        );
                        console.info('[PublicTransportData] Loaded cached data with version:', storedVersion);
                    } else {
                        console.info('[PublicTransportData] Loading cached data failed due to parse');
                    }
                } else {
                    setCachedVersion(null);
                    console.info('[PublicTransportData] No cached data found');
                }
            } catch (error) {
                logger.logError(
                    `[PublicTransportData] Version: ${cachedVersion} - Error loading cached data: ${error}`,
                    'PublicTransportData',
                );
                console.error('[PublicTransportData] Error loading cached data:', error);
                setCachedVersion(null);
            } finally {
                setCacheInitialized(true);
            }
        };
        initializeCache();
    }, []);

    // Determine if we need to fetch data
    const shouldFetchData = useMemo(() => {
        if (!enabled || !isConnected || !cacheInitialized) {
            return false;
        }

        // First time installation - no cached version
        if (cachedVersion === null) {
            console.info('[PublicTransportData] First time installation - fetching data');
            return true;
        }

        // Version mismatch - need to update
        if (profileVersion && cachedVersion !== profileVersion) {
            console.info('[PublicTransportData] Version mismatch detected:', {
                cached: cachedVersion,
                profile: profileVersion,
                action: 'fetching updated data',
            });
            return true;
        }

        console.info('[PublicTransportData] Using cached data - versions match');
        return false;
    }, [enabled, isConnected, cacheInitialized, cachedVersion, profileVersion]);

    // Prepare query parameters
    const queryParams = useMemo(
        () => ({
            city: undefined,
            publicTransportConfigVersion: cachedVersion || undefined,
            vehicleType: undefined,
            vehicleNumber: undefined,
        }),
        [cachedVersion],
    );

    // RTK Query for fetching data
    const [
        triggerPublicTransportDataGet,
        { data: queryData, error: queryError, isLoading: queryLoading, isSuccess: querySuccess },
    ] = useLazyPublicTransportDataGetQuery();

    // Trigger data fetch when shouldFetchData becomes true
    useEffect(() => {
        if (shouldFetchData) {
            console.info('[PublicTransportData] Triggering data fetch due to shouldFetchData change');
            triggerPublicTransportDataGet(queryParams);
        }
    }, [shouldFetchData, queryParams.city, queryParams.publicTransportConfigVersion]);

    // Process and cache new data when it arrives
    useEffect(() => {
        if (!queryData || !querySuccess) return;

        const processAndCacheData = async () => {
            try {
                console.info(
                    '[PublicTransportData] Processing new data with version:',
                    queryData.publicTransportConfigVersion,
                );
                logger.logWarn(
                    `[PublicTransportData] Processing new data. Updating from ${cachedVersion} -> ${queryData.publicTransportConfigVersion}`,
                    'PublicTransportData',
                );

                const processedData = await transformPublicTransportData(queryData);

                // Cache the processed data
                storage.set(PUBLIC_TRANSPORT_DATA_KEY, JSON.stringify(processedData));
                storage.set(PUBLIC_TRANSPORT_CONFIG_VERSION_KEY, processedData.publicTransportConfigVersion);

                // Update in-memory cache
                globalCache.set<publicTransportData>(PUBLIC_TRANSPORT_DATA_KEY, processedData, 1000 * 60 * 60 * 24);

                // Update local state
                setCachedVersion(processedData.publicTransportConfigVersion);

                if (userProfile) {
                    const updatedProfile: profileRes = {
                        ...userProfile,
                        publicTransportVersion: processedData.publicTransportConfigVersion,
                    };
                    dispatch(setProfile({ id: userProfile.id, payload: updatedProfile }));
                }

                // Invalidate RTK Query cache using your existing tags
                dispatch(api.util.invalidateTags(['PublicTransportData']));

                console.info(
                    '[PublicTransportData] Data cached successfully with version:',
                    processedData.publicTransportConfigVersion,
                );
            } catch (error) {
                console.error('[PublicTransportData] Error processing and caching data:', error);
                logger.logError(
                    `[PublicTransportData] Error processing version: ${queryData.publicTransportConfigVersion} and caching data : ${error}`,
                    'PublicTransportData',
                );
            }
        };

        processAndCacheData();
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [queryData, querySuccess, dispatch, cachedVersion, userProfile]);

    // Manual refresh function
    const refreshData = useCallback(async () => {
        try {
            console.info('[PublicTransportData] Manual refresh triggered');
            // Clear current cache
            setCachedVersion(null);
            globalCache.delete(PUBLIC_TRANSPORT_DATA_KEY);
            storage.delete(PUBLIC_TRANSPORT_DATA_KEY);
            storage.delete(PUBLIC_TRANSPORT_CONFIG_VERSION_KEY);

            // Invalidate RTK Query cache using your existing tags
            dispatch(api.util.invalidateTags(['PublicTransportData']));

            // Trigger a new fetch with the updated queryParams (which will now have publicTransportConfigVersion: undefined)
            await triggerPublicTransportDataGet(queryParams);
            if (userProfile) {
                const updatedProfile: profileRes = {
                    ...userProfile,
                    publicTransportVersion: queryData?.publicTransportConfigVersion,
                };
                dispatch(setProfile({ id: updatedProfile.id, payload: updatedProfile }));
            }
        } catch (error) {
            console.error('[PublicTransportData] Error during manual refresh:', error);
        }
    }, [dispatch, queryParams]); // Changed queryRefetch to triggerPublicTransportDataGet and added queryParams

    // Determine if data is available and loaded
    const isDataAvailable = globalCache.has(PUBLIC_TRANSPORT_DATA_KEY);
    const hasVersionMismatch = profileVersion && cachedVersion && profileVersion !== cachedVersion;

    // Data is only considered "loaded" if:
    // 1. Cache is initialized AND
    // 2. We have data available AND
    // 3. Either there's no version mismatch OR we just successfully fetched new data
    const isDataLoaded = cacheInitialized && isDataAvailable && !hasVersionMismatch;

    // We're loading if:
    // 1. Cache is not initialized OR
    // 2. We're actively fetching data OR
    // 3. We have a version mismatch (even if we have old cached data)
    const isLoading = useMemo(
        () => !cacheInitialized || queryLoading || (hasVersionMismatch && !querySuccess),
        [cacheInitialized, queryLoading, hasVersionMismatch, querySuccess],
    );

    return {
        isDataLoaded,
        isLoading,
        error: queryError,
        refreshData,
        cachedVersion,
        profileVersion,
        hasVersionMismatch,
        isDataAvailable,
    };
};

/**
 * Separate function to handle data transformation
 * This improves separation of concerns and makes testing easier
 */
export const transformPublicTransportData = async (originalData: publicTransportData): Promise<publicTransportData> => {
    const startTime = performance.now();

    try {
        const routeStopMappings = originalData.routeStopMappings || [];

        // First pass: Transform routes with proper names
        const stationMap = buildStationMap(originalData.stations);
        const routesWithProperNames = originalData.routes?.map((route: transportRoute) => {
            const hasTo = route.longName.includes(' To ');
            const longName = hasTo
                ? capitalizeWithDotHandling(route.longName)
                : convertToProperSubtitle(route.longName, stationMap, route.vehicleType);
            return {
                ...route,
                longName,
                shortName: route.shortName,
            };
        });

        // Second pass: Add reverse route information
        const routeMap = createRouteMap(routesWithProperNames || []);
        const transformedRoutes =
            routesWithProperNames?.map((route: transportRoute) => ({
                ...route,
                reverseRoute: findReverseRouteCode(route, routeMap),
            })) || originalData.routes;

        // Third pass: Transform stations
        const transformedStations =
            originalData.stations?.map(station => ({
                ...station,
                name: capitalizeWithDotHandling(station.name),
                address: station.address ? capitalizeWithDotHandling(station.address) : undefined,
            })) || originalData.stations;

        // Log statistics
        const routesWithoutReverse = transformedRoutes.filter(route => !route.reverseRoute).length;
        const endTime = performance.now();

        console.info(`[PublicTransportData] Data transformation completed in ${endTime - startTime}ms`);
        console.info(
            `[PublicTransportData] Routes without reverse: ${routesWithoutReverse}/${transformedRoutes.length}`,
        );

        return {
            routes: transformedRoutes,
            stations: transformedStations,
            routeStopMappings,
            publicTransportConfigVersion: originalData.publicTransportConfigVersion,
            eligiblePassIds: undefined, // Will be populated from API response if available
        };
    } catch (error) {
        console.error('[PublicTransportData] Error during data transformation:', error);
        throw error;
    }
};
