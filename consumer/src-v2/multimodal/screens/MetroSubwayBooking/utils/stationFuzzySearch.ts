import Fuse from 'fuse.js';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';

export const STATION_SEARCH_CONFIG = {
    keys: [
        { name: 'name', weight: 0.3 },
        { name: 'code', weight: 0.7 },
    ],
    threshold: 0.4,
    distance: 100,
    ignoreLocation: false,
    location: 0,
    includeScore: true,
    minMatchCharLength: 1,
};

export type StationWithSection = transportStation & {
    sectionTitle: string;
    sectionRouteCode: string | undefined;
    sectionType: string;
};

/**
 * Creates a Fuse instance for fuzzy searching stations
 * @param stations - Array of transport stations to search through
 * @returns Fuse instance or null if stations is empty
 */
export const createStationFuse = (stations: transportStation[]) => {
    if (!stations || stations.length === 0) {
        return null;
    }

    return new Fuse(stations, STATION_SEARCH_CONFIG);
};

/**
 * Creates a Fuse instance for fuzzy searching stations with section metadata
 * @param stations - Array of transport stations with section metadata
 * @returns Fuse instance or null if stations is empty
 */
export const createStationWithSectionFuse = (stations: StationWithSection[]) => {
    if (!stations || stations.length === 0) {
        return null;
    }

    return new Fuse(stations, STATION_SEARCH_CONFIG);
};

/**
 * Performs fuzzy search on stations
 * @param fuse - Fuse instance
 * @param searchText - Search query
 * @returns Array of matching stations
 */
export const searchStations = (fuse: Fuse<transportStation> | null, searchText: string): transportStation[] => {
    if (!fuse || !searchText.trim()) {
        return [];
    }

    const results = fuse.search(searchText.trim());
    return results.map(result => result.item);
};

export type StationWithScore = StationWithSection & {
    searchScore: number;
};

/**
 * Performs fuzzy search on stations with section metadata
 * @param fuse - Fuse instance for stations with section metadata
 * @param searchText - Search query
 * @returns Array of matching stations with section metadata
 */
export const searchStationsWithSection = (
    fuse: Fuse<StationWithSection> | null,
    searchText: string,
): StationWithScore[] => {
    if (!fuse || !searchText.trim()) {
        return [];
    }

    const results = fuse.search(searchText.trim());

    return results.map(result => ({
        ...result.item,
        searchScore: result.score ?? 1,
    }));
};
