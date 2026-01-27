import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { createMMKV } from '@/utils/mmkvUtils';
import { MMKVKey } from '@/typescript/utils/MMKV';
import { purchasedPassAPIEntityArray } from '../../../../../src/readOnly/api/types/PurchasedPassAPIEntityArray.gen';

const storage = createMMKV();

// Purchased Passes Cache Management
export interface CachedPurchasedPassesData {
    data: purchasedPassAPIEntityArray;
    timestamp: number;
    expiresAt: number;
}

export const savePurchasedPassesToCache = (passesData: purchasedPassAPIEntityArray) => {
    const cacheData: CachedPurchasedPassesData = {
        data: passesData,
        timestamp: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days expiry
    };

    try {
        storage.set(MMKVKey.PURCHASED_PASSES_CACHE, JSON.stringify(cacheData));
        console.info('Purchased passes cached successfully');
    } catch (error) {
        console.error('Error caching purchased passes:', error);
    }
};

export const getCachedPurchasedPasses = (): CachedPurchasedPassesData | null => {
    try {
        const cached = storage.getString(MMKVKey.PURCHASED_PASSES_CACHE);
        if (cached) {
            const parsedData = safeJsonParse(cached, null, 'MMKV');
            return parsedData;
        }
        return null;
    } catch (error) {
        console.error('Error retrieving cached purchased passes:', error);
        return null;
    }
};

export const isCachedPassesValid = (cachedData: CachedPurchasedPassesData | null): boolean => {
    if (!cachedData) return false;
    return Date.now() < cachedData.expiresAt;
};

export const clearPurchasedPassesCache = () => {
    storage.delete(MMKVKey.PURCHASED_PASSES_CACHE);
};

export const getPassProfilePicture = (): string | undefined => {
    const cached = getCachedPurchasedPasses();
    if (!cached?.data || cached.data.length === 0) {
        return undefined;
    }
    // Try to find an active pass first
    const activePass = cached.data.find(pass => pass.status === 'Active');
    // Fall back to the first pass if no active pass
    const pass = activePass || cached.data[0];
    return pass?.profilePicture ?? undefined;
};
