import { useState, useEffect } from 'react';
import { useMultimodalPassListGetQuery } from '@/api/integrations/rtk/MultimodalPassListGet';
import {
    getCachedPurchasedPasses,
    savePurchasedPassesToCache,
    isCachedPassesValid,
} from '../screens/Passes/BusPass/utils/passCache';
import { purchasedPassAPIEntityArray } from '../../src/readOnly/api/types/PurchasedPassAPIEntityArray.gen';
import { NativeModules } from 'react-native';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserLanguage } from '@/typescript/state/client/session';
import { languageToCode } from '../utils/common';

const { AppInfoModule } = NativeModules;

export const useCachedPurchasedPasses = (enabled: boolean) => {
    // Get cached data once and reuse
    const cachedData = getCachedPurchasedPasses();
    const isValidCache = cachedData && isCachedPassesValid(cachedData);
    const [imeiNumber, setImeiNumber] = useState<string | null>(null);
    const language = useAppSelector(selectUserLanguage);

    useEffect(() => {
        const fetchDeviceId = async () => {
            try {
                const id = await AppInfoModule.getUTSId();
                setImeiNumber(id);
                console.info('Device ID fetched:', id);
            } catch (error) {
                console.error('Error fetching device ID:', error);
                setImeiNumber(null);
            }
        };
        fetchDeviceId();
    }, []);

    // Initialize with cached data if available
    const [data, setData] = useState<purchasedPassAPIEntityArray | undefined>(() => {
        if (isValidCache) {
            console.info('useCachedPurchasedPasses: Using cached data on initialization');
            return cachedData.data;
        }
        return undefined;
    });

    const [isCachedData, setIsCachedData] = useState<boolean | null>(isValidCache);

    // Always make API call in background (never skip)
    const {
        data: apiData,
        isLoading: apiLoading,
        error: apiError,
        isFetching: apiFetching,
        refetch,
    } = useMultimodalPassListGetQuery(
        {
            limit: 10,
            offset: 0,
            status: 'Active',
            deviceId: null,
            imeiNumber,
            language: languageToCode(language),
        },
        {
            skip: !imeiNumber || !enabled, // Skip the query until we have a deviceId
        },
    );
    // Update display data when API returns successfully
    useEffect(() => {
        if (!apiFetching && apiData) {
            console.info('useCachedPurchasedPasses: API data received, updating cache and UI');
            console.warn('API Data:', JSON.stringify(apiData, null, 2));
            // TODO: Remove after backend changes are done
            const filteredData = apiData.filter(
                pass => !(pass.passEntity.passDetails.code === 'ULLA1DAY' && pass.status === 'Expired'),
            );
            setData(filteredData);
            setIsCachedData(false);
            savePurchasedPassesToCache(filteredData);
        }
    }, [apiFetching, apiData]);

    // Handle API errors - fallback to cache if no current data
    useEffect(() => {
        if (apiError && !data) {
            console.info('useCachedPurchasedPasses: API failed, checking for any cached data');
            const cached = getCachedPurchasedPasses();
            if (cached && cached.data) {
                console.info('useCachedPurchasedPasses: Using expired cached data as fallback');
                setData(cached.data);
                setIsCachedData(true);
            }
        }
    }, [apiError, data]);

    return {
        data,
        isLoading: !data && apiLoading, // Only show loading if no cached data available
        isCachedData,
        refetch,
        setData,
    };
};
