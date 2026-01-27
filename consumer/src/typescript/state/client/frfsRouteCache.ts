import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { fRFSRouteAPI } from '../../../readOnly/api/types/FRFSRouteAPI.gen';
import {
    FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType,
    FrfsRouteRouteCodePlatformType_frfsRouteRouteCodePlatformType,
} from '../../../readOnly/api/types/Enums.gen';
import { PURGE } from 'redux-persist';
import { cloneDeep } from 'lodash';

// Cache key type for type safety
export type FrfsRouteCacheKey = string;

export function createFrfsRouteCacheKey(
    routeCode: string,
    city: FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    vehicleType: FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType,
    platformType: FrfsRouteRouteCodePlatformType_frfsRouteRouteCodePlatformType | undefined,
): FrfsRouteCacheKey {
    const platformTypePart = platformType ? `_${platformType}` : '';
    return `${routeCode}_${city}_${vehicleType}${platformTypePart}`;
}

// Cache entry structure
export interface FrfsRouteCacheEntry {
    data: fRFSRouteAPI;
    timestamp: number;
    expiresAt: number;
    accessCount: number;
    lastAccessed: number;
}

// Main cache state
export interface FrfsRouteCacheState {
    entries: Record<FrfsRouteCacheKey, FrfsRouteCacheEntry>;
    totalSize: number; // Track total cache size for management
    lastCleanup: number;
}

// Cache configuration constants
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const CACHE_CLEANUP_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MAX_CACHE_ENTRIES = 20; // Maximum number of cached routes

const REDUCER_NAME = 'frfsRouteCache';

const INITIAL_STATE: FrfsRouteCacheState = {
    entries: {},
    totalSize: 0,
    lastCleanup: Date.now(),
};

export const frfsRouteCacheSlice = createSlice({
    name: REDUCER_NAME,
    initialState: INITIAL_STATE,
    reducers: {
        setCacheEntry: (
            state,
            action: PayloadAction<{
                key: FrfsRouteCacheKey;
                data: fRFSRouteAPI;
            }>,
        ) => {
            const { key, data } = action.payload;
            const now = Date.now();
            const entry: FrfsRouteCacheEntry = {
                data: cloneDeep(data),
                timestamp: now,
                expiresAt: now + CACHE_EXPIRY_MS,
                accessCount: 1,
                lastAccessed: now,
            };

            state.entries[key] = entry;
            state.totalSize = Object.keys(state.entries).length;

            console.info('🚌 FRFS_ROUTE_CACHE: ENTRY_CACHED', {
                key,
                routeCode: data.code,
                shortName: data.shortName,
                stopsCount: data.stops?.length || 0,
                waypointsCount: data.waypoints?.length || 0,
                totalCacheSize: state.totalSize,
            });
        },

        accessCacheEntry: (state, action: PayloadAction<FrfsRouteCacheKey>) => {
            const key = action.payload;
            const entry = state.entries[key];
            if (entry) {
                // eslint-disable-next-line functional/immutable-data
                entry.accessCount += 1;
                // eslint-disable-next-line functional/immutable-data
                entry.lastAccessed = Date.now();

                console.info('🚌 FRFS_ROUTE_CACHE: ENTRY_ACCESSED', {
                    key,
                    accessCount: entry.accessCount,
                    routeCode: entry.data.code,
                });
            }
        },

        removeCacheEntry: (state, action: PayloadAction<FrfsRouteCacheKey>) => {
            const key = action.payload;
            if (state.entries[key]) {
                delete state.entries[key];
                state.totalSize = Object.keys(state.entries).length;

                console.info('🚌 FRFS_ROUTE_CACHE: ENTRY_REMOVED', {
                    key,
                    totalCacheSize: state.totalSize,
                });
            }
        },

        cleanupExpiredEntries: (state, _action: PayloadAction<void>) => {
            const now = Date.now();
            const initialSize = state.totalSize;
            // eslint-disable-next-line functional/no-let
            let removedCount = 0;

            Object.entries(state.entries).forEach(([key, entry]) => {
                if (entry && entry.expiresAt < now) {
                    delete state.entries[key];
                    removedCount += 1;
                }
            });

            state.totalSize = Object.keys(state.entries).length;
            state.lastCleanup = now;

            if (removedCount > 0) {
                console.info('🚌 FRFS_ROUTE_CACHE: CLEANUP_EXPIRED', {
                    removedCount,
                    initialSize,
                    finalSize: state.totalSize,
                });
            }
        },

        cleanupLeastUsedEntries: (state, _action: PayloadAction<void>) => {
            const now = Date.now();
            const entries = Object.entries(state.entries);

            if (entries.length <= MAX_CACHE_ENTRIES) {
                return;
            }

            // Sort by access count (ascending) and last accessed time (ascending)
            // eslint-disable-next-line functional/immutable-data
            const sortedEntries = entries.sort(([, a], [, b]) => {
                if (a.accessCount !== b.accessCount) {
                    return a.accessCount - b.accessCount;
                }
                return a.lastAccessed - b.lastAccessed;
            });

            // Remove least used entries to get under the limit
            const entriesToRemove = sortedEntries.slice(0, entries.length - MAX_CACHE_ENTRIES);
            const initialSize = state.totalSize;

            entriesToRemove.forEach(([key]) => {
                delete state.entries[key];
            });

            state.totalSize = Object.keys(state.entries).length;
            state.lastCleanup = now;

            console.info('🚌 FRFS_ROUTE_CACHE: CLEANUP_LEAST_USED', {
                removedCount: entriesToRemove.length,
                initialSize,
                finalSize: state.totalSize,
                maxEntries: MAX_CACHE_ENTRIES,
            });
        },

        clearAllCache: (state, _action: PayloadAction<void>) => {
            const initialSize = state.totalSize;
            state.entries = {};
            state.totalSize = 0;
            state.lastCleanup = Date.now();

            console.info('🚌 FRFS_ROUTE_CACHE: CACHE_CLEARED', {
                clearedEntries: initialSize,
            });
        },
    },
    extraReducers: builder => {
        builder.addCase(PURGE, () => {
            console.info('🚌 FRFS_ROUTE_CACHE: PURGED');
            return INITIAL_STATE;
        });
    },
});

// Selectors
const selectFrfsRouteCache = (state: RootState): FrfsRouteCacheState => state.frfsRouteCache || INITIAL_STATE;

export const selectCacheEntry = createSelector(
    [selectFrfsRouteCache, (_state: RootState, key: FrfsRouteCacheKey) => key],
    (cacheState, key) => {
        const entry = cacheState.entries[key];
        const now = Date.now();

        if (!entry || entry.expiresAt < now) {
            return null;
        }

        return entry;
    },
);

export const selectCachedRouteData = createSelector(
    [selectFrfsRouteCache, (_state: RootState, key: FrfsRouteCacheKey) => key],
    (cacheState, key) => {
        const entry = cacheState.entries[key];
        const now = Date.now();

        if (!entry || entry.expiresAt < now) {
            return null;
        }

        return entry.data;
    },
);

export const selectCacheStats = createSelector([selectFrfsRouteCache], cacheState => ({
    totalEntries: cacheState.totalSize,
    lastCleanup: cacheState.lastCleanup,
    needsCleanup: Date.now() - cacheState.lastCleanup > CACHE_CLEANUP_INTERVAL_MS,
    maxEntries: MAX_CACHE_ENTRIES,
    cacheExpiryMs: CACHE_EXPIRY_MS,
}));

export const selectAllCacheKeys = createSelector([selectFrfsRouteCache], cacheState => Object.keys(cacheState.entries));

// Helper function to check if cache needs maintenance
export const shouldRunCacheCleanup = (state: RootState): boolean => {
    const cacheState = selectFrfsRouteCache(state);
    const now = Date.now();
    return now - cacheState.lastCleanup > CACHE_CLEANUP_INTERVAL_MS || cacheState.totalSize > MAX_CACHE_ENTRIES;
};

// Export actions
export const {
    setCacheEntry,
    accessCacheEntry,
    removeCacheEntry,
    cleanupExpiredEntries,
    cleanupLeastUsedEntries,
    clearAllCache,
} = frfsRouteCacheSlice.actions;

export default frfsRouteCacheSlice;
