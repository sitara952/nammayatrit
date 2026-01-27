/* eslint-disable functional/immutable-data */
import { useState, useEffect, useCallback } from 'react';
import { createMMKV } from '@/utils/mmkvUtils';
import { isEqual } from 'lodash';
import { SearchResultItem } from '../screens/Search/components/SearchSectionListItem/types';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectOperatingCity } from '@/typescript/state/client/session';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

// Storage key for the recent searches
const RECENT_SEARCHES_KEY = 'PUBLIC_TRANSPORT_RECENT_SEARCHES_V3';

// Maximum number of recent searches to store
const MAX_RECENT_SEARCHES = 10;

// Storage instance for caching the data locally
const storage = createMMKV();

type RecentSearchItem = SearchResultItem & {
    frequency: number;
    lastUsed: number; // timestamp
};

type RecentSearchesMap = {
    [key: string]: RecentSearchItem[];
};

/**
 * A custom hook that manages recent searches, handling storage, duplicates,
 * and sorting based on frequency and recency
 *
 * @returns Object containing recent searches and methods to add/clear searches
 */
export const useRecentSearches = () => {
    const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);
    const city = useAppSelector(selectOperatingCity);

    // Load cached searches on mount
    useEffect(() => {
        try {
            const searchesJson = storage.getString(RECENT_SEARCHES_KEY);
            if (searchesJson) {
                const searchesMap = safeJsonParse<RecentSearchesMap>(searchesJson, {}, 'RecentSearchesMap');
                setRecentSearches(searchesMap[city] || []);
            }
        } catch (error) {
            console.error('Error loading cached recent searches:', error);
            setRecentSearches([]);
        }
    }, [city]);

    // Save searches to storage whenever they change
    const saveSearches = useCallback(
        (searches: RecentSearchItem[]) => {
            try {
                const searchesJson = storage.getString(RECENT_SEARCHES_KEY);
                const searchesMap: RecentSearchesMap = searchesJson
                    ? safeJsonParse<RecentSearchesMap>(searchesJson, {}, 'RecentSearchesMap SaveSearches')
                    : {};
                searchesMap[city] = searches;
                storage.set(RECENT_SEARCHES_KEY, JSON.stringify(searchesMap));
                setRecentSearches(searches);
            } catch (error) {
                console.error('Error saving recent searches:', error);
            }
        },
        [city],
    );

    // Add a search to recent searches
    const addSearch = useCallback(
        (search: SearchResultItem) => {
            setRecentSearches(prev => {
                // Check if this search already exists
                const existingIndex = prev.findIndex(item => {
                    // First check primary identifiers
                    if (search.searchType === 'station' && item.searchType === 'station') {
                        return item.stopCode === search.stopCode;
                    } else if (search.searchType === 'route' && item.searchType === 'route') {
                        return item.routeCode === search.routeCode;
                    } else if (search.searchType === 'open' && item.searchType === 'open') {
                        return item.placeId === search.placeId;
                    }
                    // If none of the above match, compare the whole objects
                    return isEqual(
                        { title: item.title, subtitle: item.subtitle, searchType: item.searchType },
                        { title: search.title, subtitle: search.subtitle, searchType: search.searchType },
                    );
                });

                const newSearches = [...prev];

                if (existingIndex >= 0) {
                    // Update existing search frequency and timestamp
                    const existingItem = prev[existingIndex];
                    if (existingItem) {
                        const updatedItem = {
                            ...existingItem,
                            frequency: existingItem.frequency + 1,
                            lastUsed: Date.now(),
                        };
                        newSearches.splice(existingIndex, 1, updatedItem);
                    }
                } else {
                    // Add new search
                    const newItem: RecentSearchItem = {
                        ...search,
                        frequency: 1,
                        lastUsed: Date.now(),
                    };
                    newSearches.push(newItem);
                }

                // Sort by frequency first, then by recency (lastUsed)
                newSearches.sort((a, b) => {
                    if (a.frequency !== b.frequency) {
                        return b.frequency - a.frequency; // Higher frequency first
                    }
                    return b.lastUsed - a.lastUsed; // More recent first
                });

                // Limit to MAX_RECENT_SEARCHES
                if (newSearches.length > MAX_RECENT_SEARCHES) {
                    const updatedSearches = newSearches.slice(0, MAX_RECENT_SEARCHES);
                    saveSearches(updatedSearches);
                    return updatedSearches;
                } else {
                    saveSearches(newSearches);
                    return newSearches;
                }
            });
        },
        [saveSearches],
    );

    // Clear all recent searches
    const clearSearches = useCallback(() => {
        saveSearches([]);
    }, [saveSearches]);

    // Get only the SearchResultItem part (without frequency and lastUsed)
    const searchResults = recentSearches.map(
        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
        ({ frequency: _frequency, lastUsed: _lastUsed, ...searchItem }) => searchItem as SearchResultItem,
    );

    return {
        recentSearches: searchResults,
        addSearch,
        clearSearches,
    };
};
