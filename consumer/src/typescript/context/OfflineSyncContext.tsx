/* eslint-disable myCustomPlugin/no-any-in-modified-files */
import { createMMKV } from '@/utils/mmkvUtils';
import { api } from '../state/api';
import { store } from '../state/store';
import { createContext, useContext } from 'react';
import { OfflineSyncEndpoints } from '../types/OfflineSyncEndpoints';
import { logger } from '@/src-v2/systems/logger';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

interface OfflineRequest {
    endpoint: OfflineSyncEndpoints; // e.g., 'rateRide' or 'submitFeedback'
    mutationConfig: any; // configs for Build.mutation
}

interface OfflineSyncContextType {
    storePendingRequest: (request: OfflineRequest) => void;
    syncPendingRequests: () => void;
    existsInOfflineRequests: (endpoint: OfflineSyncEndpoints) => boolean;
}

export const storage = createMMKV();
export const PENDING_REQUESTS_KEY = 'pending_requests'; // Pending,Completed request endpoints to check and avoid unnecessary redirect to feedback screen
export const COMPLETED_REQUESTS_KEY = 'completed_requests'; // -on app opening caused by ongoing,incomplete sync with backend.
const OFFLINE_REQUESTS_KEY = 'offline_requests';

export const getArrayFromStorage = (key: string): OfflineSyncEndpoints[] => {
    try {
        const data = storage.getString(key);
        const parsed = data ? safeJsonParse<OfflineSyncEndpoints[]>(data, [], 'offlineSyncStorage') : [];
        return parsed || [];
    } catch (error) {
        console.error(`[OfflineSync] Failed to parse ${key}:`, error);
        return [];
    }
};

const setArrayToStorage = (key: string, endpoints: OfflineSyncEndpoints[]): void => {
    try {
        storage.set(key, JSON.stringify(endpoints));
    } catch (error) {
        console.error(`[OfflineSync] Failed to write ${key}:`, error);
    }
};

const addEndpoint = (key: string, endpoint: OfflineSyncEndpoints) => {
    const existing = getArrayFromStorage(key);
    if (!existing.includes(endpoint)) {
        const updated = [...existing, endpoint];
        setArrayToStorage(key, updated);
    }
};

const getStoredRequests = (key: string): OfflineRequest[] => {
    const existingRequests = storage.getString(key);
    if (!existingRequests) return [];

    const parsed = safeJsonParse<OfflineRequest[]>(existingRequests, [], 'offlineStoredRequests');
    return parsed || [];
};

const removeEndpoint = (key: string, endpoint: OfflineSyncEndpoints) => {
    const existing = getArrayFromStorage(key);
    const updated = existing.filter(e => e !== endpoint);
    setArrayToStorage(key, updated);
};

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

export const useOfflineSync = (): OfflineSyncContextType => {
    const context = useContext(OfflineSyncContext);
    if (!context) {
        logger?.logError(
            'useOfflineSync must be used within an OfflineSyncProvider. Returning fallback value.',
            'OfflineSync',
        );
        return {
            storePendingRequest: () => {},
            syncPendingRequests: () => {},
            existsInOfflineRequests: () => false,
        };
    }
    return context;
};

export const OfflineSyncProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const storePendingRequest = (request: OfflineRequest) => {
        try {
            const requests = getStoredRequests(OFFLINE_REQUESTS_KEY);
            const newRequests = [...requests, { ...request }];
            storage.set(OFFLINE_REQUESTS_KEY, JSON.stringify(newRequests));
            addEndpoint(PENDING_REQUESTS_KEY, request.endpoint);

            console.info('[OfflineSync] Stored Request:', request);
        } catch (error) {
            console.error('[OfflineSync] Failed to store request:', error);
        }
    };

    const syncPendingRequests = async () => {
        try {
            // Clear completed requests of previous session at the start of each "online session"
            storage.delete(COMPLETED_REQUESTS_KEY);
            const requests = getStoredRequests(OFFLINE_REQUESTS_KEY);
            if (requests.length === 0) return;

            console.info('[OfflineSync] Pending Requests to SYNC:', requests.length);

            // Process requests sequentially using FP reduce pattern
            const remainingRequests = await requests.reduce(
                (promiseChain, request) =>
                    promiseChain.then(async accumulated => {
                        try {
                            console.info('[OfflineSync] Trying to sync:', request);
                            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                            const mutation = (api.endpoints as Record<OfflineSyncEndpoints, any>)[request.endpoint]
                                ?.initiate;

                            if (!mutation) {
                                console.warn('[OfflineSync] Invalid endpoint:', request.endpoint);
                                return [...accumulated, request];
                            }

                            await store.dispatch(mutation(request.mutationConfig)).unwrap();
                            console.info('[OfflineSync] Successfully retried:', request);

                            // Side effects managed within chain
                            addEndpoint(COMPLETED_REQUESTS_KEY, request.endpoint);
                            removeEndpoint(PENDING_REQUESTS_KEY, request.endpoint);

                            return accumulated;
                        } catch (error) {
                            console.error('[OfflineSync] API request failed:', request, error);
                            return [...accumulated];
                        }
                    }),
                Promise.resolve<OfflineRequest[]>([]),
            );

            // Update MMKV with remaining (those failed in current online session) requests
            // Update storage based on final state
            remainingRequests.length > 0
                ? storage.set(OFFLINE_REQUESTS_KEY, JSON.stringify(remainingRequests))
                : storage.delete(OFFLINE_REQUESTS_KEY);

            console.info('[OfflineSync] Remaining requests:', remainingRequests.length);
        } catch (error) {
            console.error('[OfflineSync] Sync failed:', error);
        }
    };

    const existsInOfflineRequests = (endpoint: OfflineSyncEndpoints): boolean => {
        const pendingRequests = getArrayFromStorage(PENDING_REQUESTS_KEY);
        const completedRequests = getArrayFromStorage(COMPLETED_REQUESTS_KEY);
        return pendingRequests.includes(endpoint) || completedRequests.includes(endpoint);
    };

    return (
        <OfflineSyncContext.Provider
            value={{
                storePendingRequest,
                syncPendingRequests,
                existsInOfflineRequests,
            }}>
            {children}
        </OfflineSyncContext.Provider>
    );
};
