/* eslint-disable functional/no-let */
/* eslint-disable functional/immutable-data */
import { useState, useMemo, useCallback } from 'react';
import {
    publicTransportData,
    transportRoute,
    transportRouteStopMapping,
    transportStation,
} from '@/readOnly/api/types/PublicTransportData.gen';
import { PUBLIC_TRANSPORT_DATA_KEY } from '../hooks/usePublicTransportData';
import { SearchResultItem } from '../screens/Search/components/SearchSectionListItem/types';
import {
    VehicleCategory_vehicleCategory,
    FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
} from '@/readOnly/api/types/Enums.gen';
import { globalCache } from '@/src-v2/systems/cache/cache';
import { isUndefined } from 'lodash';
import { mapCityToFrfsCityType } from '@/src-v2/utils/common.ts';

const MAX_RESULTS = 20;
/**
 * Calculate distance between two points using the Haversine formula
 * @param lat1 Latitude of point 1
 * @param lon1 Longitude of point 1
 * @param lat2 Latitude of point 2
 * @param lon2 Longitude of point 2
 * @returns Distance in meters
 */
export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
};

/**
 * Find stops near a given location
 * @param latitude Current latitude
 * @param longitude Current longitude
 * @param routeStops Array of route stop mappings
 * @param maxDistance Maximum distance in meters (default: 1000)
 * @returns Array of nearby stops with distance information
 */
export const findNearbyStations = (
    latitude: number,
    longitude: number,
    stations: transportStation[],
    maxDistance: number | undefined,
    vehicleType: VehicleCategory_vehicleCategory | undefined,
    numberOfStations: number | undefined,
): Array<transportStation & { distance: number }> => {
    // Calculate distances and filter
    return stations
        .filter(station =>
            isUndefined(vehicleType) ? true : station.vehicleType.toLowerCase() === vehicleType?.toLowerCase(),
        )
        .map(station => ({
            ...station,
            distance: calculateDistance(latitude, longitude, station.lat, station.lon),
        }))
        .filter(station => (isUndefined(maxDistance) ? true : station.distance <= maxDistance))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, isUndefined(numberOfStations) ? undefined : numberOfStations);
};

/**
 * Find a route by its code
 * @param routeCode The route code to search for
 * @param routes Array of routes to search in
 * @returns The route if found, undefined otherwise
 */
export const findRouteByCode = (routeCode: string, routes: transportRoute[]): transportRoute | undefined => {
    return routes.find(route => route.code === routeCode);
};

/**
 * Find a station by its code
 * @param stationCode The station code to search for
 * @param stations Array of stations to search in
 * @returns The station if found, undefined otherwise
 */
export const findStationByCode = (stationCode: string, stations: transportStation[]): transportStation | undefined => {
    return stations.find(station => station.code === stationCode);
};

export const findStationsByName = (
    stationCode: string,
    stations: transportStation[],
): transportStation[] | undefined => {
    const targetStation = stations.find(station => station.code === stationCode);
    if (!targetStation) return undefined;
    // Return all stations with the same name
    return stations.filter(station => station.name === targetStation.name);
};

const isSubset = (str: string, target: string): boolean => {
    if (!str || !target) return false;
    const strAlphaNum = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    const targetAlphaNum = target.toLowerCase().replace(/[^a-z0-9]/g, '');
    return strAlphaNum.includes(targetAlphaNum);
};

/**
 * Get all stops for a specific route
 * @param routeCode The route code
 * @param routeStops Array of route stop mappings
 * @returns Array of stops for the route, sorted by sequence number
 */
export const getStopsForRoute = (
    routeCode: string,
    routeStops: transportRouteStopMapping[],
): transportRouteStopMapping[] => {
    return routeStops.filter(stop => stop.routeCode === routeCode).sort((a, b) => a.sequenceNum - b.sequenceNum);
};

/**
 * Find all routes that pass through a specific stop
 * @param stopCode The stop code
 * @param routeStops Array of route stop mappings
 * @returns Array of unique route codes
 */
export const getRoutesForStop = (stopCode: string, routeStops: transportRouteStopMapping[]): string[] => {
    return [...new Set(routeStops.filter(stop => stop.stopCode === stopCode).map(stop => stop.routeCode))];
};

// Faster version of Levenshtein that bails out early if distance exceeds max
const calculateLevenshteinDistanceFast = (a: string, b: string, max = Infinity): number => {
    if (Math.abs(a.length - b.length) > max) return max + 1;
    if (a === b) return 0;
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;

    // Use smaller strings to reduce matrix size
    if (b.length > a.length) {
        [a, b] = [b, a];
    }

    // Single row to save memory
    const previousRow = Array(b.length + 1);
    for (let i = 0; i <= b.length; i++) {
        previousRow[i] = i;
    }

    let minDistance = a.length;

    for (let i = 0; i < a.length; i++) {
        const currentRow = [i + 1];
        for (let j = 0; j < b.length; j++) {
            // Ensure we're accessing valid indices and handle potential undefined values
            const insertionCost = previousRow[j + 1] ?? Infinity;
            const deletionCost = currentRow[j] ?? Infinity;
            const substitutionCost = (previousRow[j] ?? Infinity) + (a[i] === b[j] ? 0 : 1);

            currentRow[j + 1] = Math.min(insertionCost + 1, deletionCost + 1, substitutionCost);
        }

        // Copy current row to previous row for next iteration
        for (let j = 0; j <= b.length; j++) {
            previousRow[j] = currentRow[j] ?? Infinity;
        }

        // Early termination if we can't get a better result
        const numericValues: number[] = currentRow.filter((val): val is number => val !== undefined);
        const minInRow = Math.min(...numericValues);
        if (minInRow > max) return max + 1;

        const currentDistance = currentRow[b.length] ?? Infinity;
        minDistance = Math.min(minDistance, currentDistance);
    }

    return minDistance;
};

/**
 * Calculate similarity ratio based on Levenshtein distance and prefix matching
 * @param a First string
 * @param b Second string
 * @returns Similarity ratio (0 to 1, where 1 is perfect match)
 */
const calculateSimilarityRatio = (a: string, b: string): number => {
    if (!a.length && !b.length) return 1; // Both empty strings are identical
    if (!a.length || !b.length) return 0; // One empty string means no similarity

    const str1 = a.toLowerCase();
    const str2 = b.toLowerCase();

    // Give high weight to prefix matches
    const prefixBonus = str1.startsWith(str2) || str2.startsWith(str1) ? 0.3 : 0;

    // Calculate word-level prefix matches (only if strings have multiple words)
    let wordPrefixBonus = 0;
    if (str1.includes(' ') || str2.includes(' ')) {
        const words1 = str1.split(/\s+/);
        const words2 = str2.split(/\s+/);
        wordPrefixBonus = words1.some(w1 => words2.some(w2 => w1.startsWith(w2) || w2.startsWith(w1))) ? 0.2 : 0;
    }

    // Base similarity from Levenshtein - use a maximum distance threshold to abort early
    const maxLen = Math.max(str1.length, str2.length);
    const maxDistance = Math.floor(maxLen * 0.6); // Don't calculate full distance if it can't meet our threshold
    const distance = calculateLevenshteinDistanceFast(str1, str2, maxDistance);

    // If distance exceeded our maximum, return a low score
    if (distance > maxDistance) return prefixBonus + wordPrefixBonus;

    const baseSimilarity = 1 - distance / maxLen;

    // Combine scores with bonuses
    return Math.min(1, baseSimilarity + prefixBonus + wordPrefixBonus);
};

/**
 * Checks if one string fuzzy matches another using enhanced matching logic
 * @param text The text to check
 * @param query The search query
 * @param threshold The similarity threshold (0-1, default: 0.5)
 * @returns Whether the text matches the query above the threshold
 */
const fuzzyMatch = (text: string | undefined | null, query: string, threshold = 0.5): boolean => {
    if (!text || !query) return false;

    const safeText = String(text);
    const queryLower = query.toLowerCase();
    const textLower = safeText.toLowerCase();

    // Direct substring match gets high priority (fastest check)
    if (textLower.includes(queryLower)) {
        return true;
    }

    // For very short queries (1-2 chars), only use exact prefix matching
    if (query.length <= 2) {
        return textLower.startsWith(queryLower);
    }

    // For longer queries, check if any word starts with the query (faster than full similarity)
    const words = textLower.split(/\s+/);
    if (words.some(word => word.startsWith(queryLower))) {
        return true;
    }

    // Fall back to similarity ratio for other cases (most expensive, do last)
    // Only check individual words for medium-length words (optimization)
    if (queryLower.length > 2 && queryLower.length < 8) {
        if (words.some(word => calculateSimilarityRatio(word, queryLower) >= threshold)) {
            return true;
        }
    }

    return calculateSimilarityRatio(safeText, queryLower) >= threshold;
};

const compareRoutes = (a: transportRoute, b: transportRoute): number => {
    const tripCountA = a.dailyTripCount ?? 0;
    const tripCountB = b.dailyTripCount ?? 0;
    if (tripCountA !== tripCountB) {
        return tripCountB - tripCountA;
    }
    const stopCountA = a.stopCount ?? 0;
    const stopCountB = b.stopCount ?? 0;
    return stopCountB - stopCountA;
};

/**
 * Perform a fuzzy search on transport routes and stops
 * @param searchTerm The search term to match against routes and stops
 * @param vehicleType Optional filter by vehicle type
 * @param searchTarget Where to search: 'routes', 'stops', or 'both' (default)
 * @param routes Array of routes
 * @param stations Array of stations
 * @returns Array of SearchResultItems sorted by match score
 */
export type SearchTarget = 'routes' | 'stops' | 'both';
export const fuzzySearchTransport = (
    searchTerm: string,
    vehicleType: VehicleCategory_vehicleCategory | undefined,
    searchTarget: SearchTarget = 'both',
    routes: transportRoute[],
    stations: transportStation[],
): SearchResultItem[] => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
        return [];
    }

    // Filter early by minimum characters to improve performance
    if (term.length === 1) {
        // For single character, only return exact matches on shortName but sort by trip count
        if (searchTarget === 'stops') {
            return [];
        }

        // Filter routes with exact match on short name
        const matchingRoutes = routes.filter(
            route =>
                (!vehicleType || route.vehicleType.toLowerCase() === vehicleType.toLowerCase()) &&
                String(route.shortName).toLowerCase() === term,
        );

        // Sort by trip count and stop count
        return matchingRoutes
            .sort(compareRoutes)
            .slice(0, MAX_RESULTS)
            .map(route => ({
                title: route.shortName || route.code,
                subtitle: route.longName || '',
                placeId: undefined,
                routeCode: route.code,
                stopCode: undefined,
                duration: '',
                transitModes: [],
                location: undefined,
                searchType: 'route',
            }));
    }

    const results: Array<{ item: SearchResultItem; score: number }> = [];
    const startsWithNumber = /^\d/.test(term);
    const isRouteLikePattern = /^[a-zA-Z]+[0-9]+/.test(term);

    // Pre-filter the data by vehicle type if specified (applied once)
    const routesToSearch = vehicleType
        ? routes.filter(route => route.vehicleType.toLowerCase() === vehicleType.toLowerCase())
        : routes;

    const stationsToSearch = vehicleType
        ? stations.filter(station => station.vehicleType.toLowerCase() === vehicleType.toLowerCase())
        : stations;

    // Helper function to search routes - only process shortName for performance first
    const searchRoutesFast = () => {
        const highMatchedRoutes = new Set<string>(); // Track routes we've already added
        const exactMatches: Array<{ route: transportRoute; isExactMatch: boolean; isStartsWith: boolean }> = [];

        // First quick pass - collect exact matches and starts with (very fast)
        for (const route of routesToSearch) {
            const shortName = String(route.shortName).toLowerCase();

            // Quick exact match or starts with - high relevance
            if (shortName === term) {
                exactMatches.push({
                    route,
                    isExactMatch: true,
                    isStartsWith: true,
                });
            } else if (shortName.startsWith(term)) {
                exactMatches.push({
                    route,
                    isExactMatch: false,
                    isStartsWith: true,
                });
            }
        }

        // Sort by match quality first, then by trip count
        // Priority: exact matches first, then by length difference (shorter is better), then by trip count
        exactMatches.sort((a, b) => {
            // First priority: exact matches
            if (a.isExactMatch && !b.isExactMatch) return -1;
            if (!a.isExactMatch && b.isExactMatch) return 1;

            // Second priority: for starts-with matches, prefer shorter route names (closer matches)
            // But we also want to consider the type of suffix: letters vs numbers
            if (!a.isExactMatch && !b.isExactMatch) {
                const lengthDiffA = String(a.route.shortName).length - term.length;
                const lengthDiffB = String(b.route.shortName).length - term.length;

                // If same length difference, prefer letter suffixes over number suffixes
                if (lengthDiffA === lengthDiffB && lengthDiffA === 1) {
                    const suffixA = String(a.route.shortName).slice(term.length);
                    const suffixB = String(b.route.shortName).slice(term.length);
                    const isLetterA = /^[a-zA-Z]$/.test(suffixA);
                    const isLetterB = /^[a-zA-Z]$/.test(suffixB);

                    // Prefer letter suffixes (16J, 16K) over number suffixes (164, 165)
                    if (isLetterA && !isLetterB) return -1;
                    if (!isLetterA && isLetterB) return 1;
                }

                // Different length differences - shorter wins
                if (lengthDiffA !== lengthDiffB) {
                    return lengthDiffA - lengthDiffB; // Shorter difference wins
                }
            }

            // Third priority: trip count and stop count
            return compareRoutes(a.route, b.route);
        });

        // Add sorted matches to results
        for (const { route, isExactMatch } of exactMatches) {
            if (highMatchedRoutes.has(route.code)) continue;
            highMatchedRoutes.add(route.code);
            results.push({
                item: {
                    title: route.shortName || route.code,
                    subtitle: route.longName || '',
                    placeId: undefined,
                    routeCode: route.code,
                    stopCode: undefined,
                    duration: '',
                    transitModes: [],
                    location: undefined,
                    searchType: 'route',
                },
                score: isExactMatch ? 1 : 0.9,
            });

            // Break early if we've reached the limit
            if (results.length >= MAX_RESULTS) break;
        }

        // If term is more than 2 characters, do a contains search (still fast)
        if (term.length > 2 && results.length < MAX_RESULTS) {
            for (const route of routesToSearch) {
                // Skip already matched routes
                if (highMatchedRoutes.has(route.code)) continue;

                const shortName = String(route.shortName).toLowerCase();
                if (shortName.includes(term)) {
                    results.push({
                        item: {
                            title: route.shortName || route.code,
                            subtitle: route.longName || '',
                            placeId: undefined,
                            routeCode: route.code,
                            stopCode: undefined,
                            duration: '',
                            transitModes: [],
                            location: undefined,
                            searchType: 'route',
                        },
                        score: 0.8,
                    });
                    highMatchedRoutes.add(route.code);

                    // Break early if we've reached the limit
                    if (results.length >= MAX_RESULTS) break;
                }
            }
        }

        // Only fall back to full fuzzy search if we don't have enough results
        if (results.length < MAX_RESULTS) {
            for (const route of routesToSearch) {
                // Skip already matched routes
                if (highMatchedRoutes.has(route.code)) continue;

                // Calculate best match score across route properties
                const scores = [
                    isSubset(String(route.shortName), term) ? 1 : fuzzyMatch(String(route.shortName), term) ? 0.5 : 0,
                    isSubset(String(route.longName.split('To')[1] ?? ''), term)
                        ? 1
                        : fuzzyMatch(String(route.longName.split('To')[1] ?? ''), term)
                          ? 0.5
                          : 0,
                    route.color
                        ? isSubset(String(route.color), term)
                            ? 1
                            : fuzzyMatch(String(route.color), term)
                              ? 0.5
                              : 0
                        : 0,
                ];
                const maxScore = Math.max(...scores);

                if (maxScore > 0) {
                    results.push({
                        item: {
                            title: route.shortName || route.code,
                            subtitle: route.longName || '',
                            placeId: undefined,
                            routeCode: route.code,
                            stopCode: undefined,
                            duration: '',
                            transitModes: [],
                            location: undefined,
                            searchType: 'route',
                        },
                        score: maxScore * 0.7, // Reduce score a bit for fuzzy matches
                    });

                    // Break early if we've reached the limit
                    if (results.length >= MAX_RESULTS) break;
                }
            }
        }
    };

    // Helper function to search stations - optimized version
    const searchStationsFast = () => {
        const seenStationNames = new Set<string>();
        const highMatchedStations = new Set<string>(); // Track stations we've already added with high relevance

        // First quick pass - check exact matches and starts with (very fast)
        for (const station of stationsToSearch) {
            // Skip if we've already seen this station name with high relevance
            if (highMatchedStations.has(station.name)) {
                continue;
            }

            const stationName = station.name.toLowerCase();

            // Exact match or starts with - high relevance
            if (stationName === term || stationName.startsWith(term)) {
                highMatchedStations.add(station.name);
                seenStationNames.add(station.name);

                results.push({
                    item: {
                        title: station.name,
                        subtitle: station.address || '',
                        placeId: station.code,
                        routeCode: undefined,
                        stopCode: station.code,
                        duration: '',
                        transitModes: [],
                        location: {
                            lat: station.lat,
                            lng: station.lon,
                            placeId: undefined,
                            title: station.name,
                            subtitle: station.address || '',
                            formattedAddress: station.address || '',
                            tag: 'AUTOCOMPLETE',
                            addressComponents: undefined,
                            serviceable: undefined,
                            serviceabilityCity: undefined,
                            specialLocation: undefined,
                            locationType: undefined,
                            distanceFromCurrentLocation: undefined,
                            hotSpotInfo: undefined,
                        },
                        searchType: 'station',
                    },
                    score: stationName === term ? 1 : 0.9,
                });

                // Break early if we've reached the limit
                if (results.length >= MAX_RESULTS) break;
            }
        }

        // If term is more than 2 characters, do a contains search (still fast)
        if (term.length > 2 && results.length < MAX_RESULTS) {
            for (const station of stationsToSearch) {
                // Skip if we've already seen this station name
                if (seenStationNames.has(station.name)) {
                    continue;
                }

                const stationName = station.name.toLowerCase();
                if (stationName.includes(term)) {
                    seenStationNames.add(station.name);

                    results.push({
                        item: {
                            title: station.name,
                            subtitle: station.address || '',
                            placeId: station.code,
                            routeCode: undefined,
                            stopCode: station.code,
                            duration: '',
                            transitModes: [],
                            location: {
                                lat: station.lat,
                                lng: station.lon,
                                placeId: undefined,
                                title: station.name,
                                subtitle: station.address || '',
                                formattedAddress: station.address || '',
                                tag: 'AUTOCOMPLETE',
                                addressComponents: undefined,
                                serviceable: undefined,
                                serviceabilityCity: undefined,
                                specialLocation: undefined,
                                locationType: undefined,
                                distanceFromCurrentLocation: undefined,
                                hotSpotInfo: undefined,
                            },
                            searchType: 'station',
                        },
                        score: 0.8,
                    });

                    // Break early if we've reached the limit
                    if (results.length >= MAX_RESULTS) break;
                }
            }
        }

        // Only do full fuzzy match if needed and the term is long enough
        if (results.length < MAX_RESULTS && term.length > 2) {
            for (const station of stationsToSearch) {
                // Skip if we've already seen this station name
                if (seenStationNames.has(station.name)) {
                    continue;
                }

                // Calculate best match score across station properties
                const scores = [
                    isSubset(String(station.name), term) ? 1 : fuzzyMatch(String(station.name), term) ? 0.5 : 0,
                    station.address
                        ? isSubset(String(station.address), term)
                            ? 1
                            : fuzzyMatch(String(station.address), term)
                              ? 0.5
                              : 0
                        : 0,
                ];
                const maxScore = Math.max(...scores);

                if (maxScore > 0) {
                    seenStationNames.add(station.name);

                    results.push({
                        item: {
                            title: station.name,
                            subtitle: station.address || '',
                            placeId: station.code,
                            routeCode: undefined,
                            stopCode: station.code,
                            duration: '',
                            transitModes: [],
                            location: {
                                lat: station.lat,
                                lng: station.lon,
                                placeId: undefined,
                                title: station.name,
                                subtitle: station.address || '',
                                formattedAddress: station.address || '',
                                tag: 'AUTOCOMPLETE',
                                addressComponents: undefined,
                                serviceable: undefined,
                                serviceabilityCity: undefined,
                                specialLocation: undefined,
                                locationType: undefined,
                                distanceFromCurrentLocation: undefined,
                                hotSpotInfo: undefined,
                            },
                            searchType: 'station',
                        },
                        score: maxScore * 0.7, // Reduce score a bit for fuzzy matches
                    });

                    // Break early if we've reached the limit
                    if (results.length >= MAX_RESULTS) break;
                }
            }
        }
        results.sort((a, b) => b.score - a.score);
    };

    // Execute search based on searchTarget and term pattern
    if (searchTarget === 'routes') {
        searchRoutesFast();
    } else if (searchTarget === 'stops') {
        searchStationsFast();
    } else {
        // searchTarget === 'both'
        if (startsWithNumber || isRouteLikePattern) {
            searchRoutesFast();
            // Only search stations if we need more results
            if (results.length < MAX_RESULTS) {
                searchStationsFast();
            }
        } else {
            searchStationsFast();
            // Only search routes if we need more results
            if (results.length < MAX_RESULTS) {
                searchRoutesFast();
            }
        }
    }

    // Sort by score and limit results - avoid unnecessary sorting/mapping when possible
    if (results.length > MAX_RESULTS) {
        return results.slice(0, MAX_RESULTS).map(result => result.item);
    } else {
        // If less than MAX_RESULTS results, we can just sort in place
        return results.map(result => result.item);
    }
};
/**
 * A custom hook that provides public transport utility functions with data fetching
 *
 * @param options Optional configuration options
 * @returns Object containing public transport data and utility functions
 */
export const usePublicTransportUtils = (
    options:
        | {
              maxStopDistance: number | undefined;
              enabled: boolean | undefined;
          }
        | undefined,
) => {
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    // Default options
    const maxStopDistance = options?.maxStopDistance || 1000;

    // Memoized data to prevent unnecessary recalculations
    const transportData = useMemo(() => {
        const data = globalCache.get<publicTransportData>(PUBLIC_TRANSPORT_DATA_KEY);
        if (!data) return null;

        return {
            routes: data.routes || [],
            stations: data.stations || [],
            routeStops: data.routeStopMappings || [],
        };
    }, []);

    /**
     * Update the user's current location
     */
    const updateUserLocation = useCallback((latitude: number | undefined, longitude: number | undefined): void => {
        if (!latitude || !longitude) return;
        setUserLocation({ latitude, longitude });
    }, []);
    /**
     * Find nearby stops based on the user's current location
     */
    const getNearbyStations = useMemo(() => {
        return (
            vehicleType: VehicleCategory_vehicleCategory | undefined,
            numberOfStations: number | undefined,
        ): Array<transportStation & { distance: number }> => {
            if (!userLocation || !transportData) return [];

            return findNearbyStations(
                userLocation.latitude,
                userLocation.longitude,
                transportData.stations,
                maxStopDistance,
                vehicleType,
                numberOfStations,
            );
        };
    }, [userLocation, transportData, maxStopDistance]);

    /**
     * Get nearest stop with distance from current location
     */
    const getNearestStation = useMemo(() => {
        return (
            currentLocation: { latitude: number; longitude: number } | undefined,
            vehicleType: VehicleCategory_vehicleCategory | undefined,
        ): (transportStation & { distance: number }) | null => {
            if (!currentLocation || !transportData) return null;

            const nearbyStations = findNearbyStations(
                currentLocation.latitude,
                currentLocation.longitude,
                transportData.stations,
                undefined,
                vehicleType,
                1,
            );

            if (nearbyStations.length === 0) return null;

            return nearbyStations.reduce((nearest, current) => {
                return current.distance < nearest.distance ? current : nearest;
            });
        };
    }, [transportData]);

    const getTwoNearestStations = useMemo(() => {
        return (
            currentLocation: { latitude: number; longitude: number } | undefined,
            vehicleType: VehicleCategory_vehicleCategory | undefined,
        ): (transportStation & { distance: number })[] | null => {
            if (!currentLocation || !transportData) return null;

            const nearbyStations = findNearbyStations(
                currentLocation.latitude,
                currentLocation.longitude,
                transportData.stations,
                undefined,
                vehicleType,
                2,
            );

            if (nearbyStations.length === 0) return null;

            return nearbyStations;
        };
    }, [transportData]);

    /**
     * Get a route by its code
     */
    const getRouteByCode = useMemo(() => {
        return (routeCode: string): transportRoute | undefined => {
            if (!transportData) return undefined;
            return findRouteByCode(routeCode, transportData.routes);
        };
    }, [transportData]);

    /**
     * Get a station by its code
     */
    const getStationByCode = useMemo(() => {
        return (stationCode: string): transportStation | undefined => {
            if (!transportData) return undefined;
            return findStationByCode(stationCode, transportData.stations);
        };
    }, [transportData]);

    const getStationsByName = useMemo(() => {
        return (stationCode: string): transportStation[] | undefined => {
            if (!transportData) return undefined;
            return findStationsByName(stationCode, transportData.stations);
        };
    }, [transportData]);

    /**
     * Get all stations
     */
    const getAllStations = useMemo(() => {
        return (vehicleType: VehicleCategory_vehicleCategory | undefined): transportStation[] => {
            if (vehicleType) {
                return (
                    transportData?.stations.filter(
                        station => station.vehicleType.toLowerCase() === vehicleType.toLowerCase(),
                    ) || []
                );
            }
            return transportData?.stations || [];
        };
    }, [transportData]);
    /**
     * Get all stops for a specific route
     */
    const getRouteStops = useMemo(() => {
        return (routeCode: string): transportRouteStopMapping[] => {
            if (!transportData) return [];
            return getStopsForRoute(routeCode, transportData.routeStops);
        };
    }, [transportData]);

    /**
     * Get all routes that pass through a specific stop
     */
    const getStopRoutes = useMemo(() => {
        return (stopCode: string): string[] => {
            if (!transportData) return [];
            return getRoutesForStop(stopCode, transportData.routeStops);
        };
    }, [transportData]);

    /**
     * Search for routes and stations matching a search term
     */
    const searchTransport = useMemo(() => {
        return (
            searchTerm: string,
            transformedRoutes: transportRoute[] | undefined,
            transformedStations: transportStation[] | undefined,
            showEditSource: boolean,
            isFallbackView: boolean,
            vehicleType?: VehicleCategory_vehicleCategory,
            searchTarget: SearchTarget = 'both',
        ): SearchResultItem[] => {
            if (!transportData) return [];
            const routes =
                !showEditSource && !isUndefined(transformedRoutes) && transformedRoutes?.length > 0 && !isFallbackView
                    ? transformedRoutes
                    : transportData.routes;
            const stations =
                !showEditSource &&
                !isUndefined(transformedStations) &&
                transformedStations?.length > 0 &&
                !isFallbackView
                    ? transformedStations
                    : transportData.stations;

            return fuzzySearchTransport(searchTerm, vehicleType, searchTarget, routes, stations ?? []);
        };
    }, [transportData]);

    const mapCityToFrfsCity = (city: string): FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity => {
        // Special case for Bhubaneshwar
        if (city.toLowerCase() === 'bhubaneswar') {
            return 'Bhubaneshwar';
        }

        // For all other cities, convert first letter to uppercase and rest to lowercase
        const formattedCity = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
        // Handle specific known cities
        return mapCityToFrfsCityType(formattedCity);
    };

    return {
        userLocation,
        isLoading: !transportData,
        updateUserLocation,

        // Utility functions
        getNearbyStations,
        getNearestStation,
        getRouteByCode,
        getStationByCode,
        getRouteStops,
        getStopRoutes,
        searchTransport,

        // Raw utility functions
        calculateDistance,
        calculateSimilarityRatio,
        fuzzyMatch,
        findNearbyStations,
        findRouteByCode,
        findStationByCode,
        getStopsForRoute,
        getRoutesForStop,
        fuzzySearchTransport,
        getAllStations,
        getTwoNearestStations,
        getStationsByName,
        mapCityToFrfsCity,
    };
};
