import { useCallback, useEffect, useState, useRef, useMemo } from 'react';
import { useFrfsSearchPostMutation } from '@/api/integrations/rtk/FrfsSearchPost';
import { useFrfsSearchSearchIdQuoteGetQuery } from '@/api/integrations/rtk/FrfsSearchSearchIdQuoteGet';
import { fRFSSearchAPIReq } from '@/readOnly/api/types/FRFSSearchAPIReq.gen';
import { fRFSQuoteAPIRes } from '@/readOnly/api/types/FRFSQuoteAPIRes.gen';
import {
    FrfsSearchVehicleType_frfsSearchVehicleType,
    FRFSServiceTierType_fRFSServiceTierType,
} from '@/readOnly/api/types/Enums.gen';
import { busLocation } from '@/readOnly/api/types/BusLocation.gen';
import { logger } from '@/src-v2/systems/logger';

export interface UseFrfsSearchAndPollingParams {
    /** Source station code */
    fromStationCode: string;
    /** Destination station code */
    toStationCode: string;
    /** Vehicle number (OTP) */
    vehicleNumber: string;
    /** Route code */
    routeCode?: string;
    /** Number of tickets */
    quantity?: number;
    /** Vehicle type for the search */
    vehicleType: FrfsSearchVehicleType_frfsSearchVehicleType;
    /** Bus location data */
    busLocationData?: busLocation[];
    /** Whether the hook should be enabled */
    enabled: boolean;
    /** Recent location ID */
    recentLocationId?: string;
    serviceTier: FRFSServiceTierType_fRFSServiceTierType | undefined;
}

export interface UseFrfsSearchAndPollingReturn {
    /** Array of quotes from search or polling */
    quotes: fRFSQuoteAPIRes[] | null;
    /** Search ID for the current search */
    searchId: string | null;
    /** Whether initial search is loading */
    isSearching: boolean;
    /** Whether quote polling is active */
    isPolling: boolean;
    /** Combined loading state */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Function to trigger a new search */
    refetch: () => void;
    /** Whether quotes have fare information */
    hasFare: boolean;
}

const POLLING_INTERVAL = 2000; // 2 seconds
const MAX_POLLING_ATTEMPTS = 30; // 60 seconds total

export const useFrfsSearchAndPolling = (params: UseFrfsSearchAndPollingParams): UseFrfsSearchAndPollingReturn => {
    const {
        fromStationCode,
        toStationCode,
        vehicleNumber,
        routeCode,
        quantity = 1,
        vehicleType,
        busLocationData,
        enabled,
        recentLocationId,
        serviceTier,
    } = params;

    // State management
    const [quotes, setQuotes] = useState<fRFSQuoteAPIRes[] | null>(null);
    const [searchId, setSearchId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shouldPoll, setShouldPoll] = useState(false);
    const pollingAttempts = useRef(0);
    const searchTrigger = useRef(0);

    // RTK mutations and queries
    const [frfsSearch, { isLoading: isSearching }] = useFrfsSearchPostMutation();

    // Quote polling query - only enabled when shouldPoll is true and we have a searchId
    const {
        data: pollingData,
        isLoading: isPolling,
        error: pollingError,
    } = useFrfsSearchSearchIdQuoteGetQuery(
        { searchId: searchId || '' },
        {
            skip: !shouldPoll || !searchId,
            pollingInterval: shouldPoll ? POLLING_INTERVAL : 0,
        },
    );

    // Check if quotes have fare information
    const hasFare = quotes ? quotes.some(quote => quote.price > 0) : false;

    // Combined loading state
    const isLoading = isSearching || isPolling;

    // Memoize search request to avoid dependency issues
    const searchRequest = useMemo(
        (): fRFSSearchAPIReq => ({
            fromStationCode,
            toStationCode,
            vehicleNumber,
            routeCode: routeCode || undefined,
            quantity,
            busLocationData: busLocationData || undefined,
            recentLocationId: recentLocationId || undefined,
            journeySearchData: undefined,
            searchAsParentStops: undefined,
            serviceTier: serviceTier,
            platformType: 'MULTIMODAL',
        }),
        [fromStationCode, toStationCode, vehicleNumber, routeCode, quantity, busLocationData, recentLocationId],
    );

    // Perform initial FRFS search
    const performSearch = useCallback(async () => {
        if (!enabled || !fromStationCode || !toStationCode || !vehicleNumber) {
            return;
        }

        try {
            setError(null);
            setQuotes(null);
            setSearchId(null);
            setShouldPoll(false);
            pollingAttempts.current = 0;

            logger.logInfo(
                `Starting FRFS search from ${fromStationCode} to ${toStationCode} with vehicle ${vehicleNumber}`,
                'FrfsSearchAndPolling',
            );

            const result = await frfsSearch({
                vehicleType,
                body: searchRequest,
            }).unwrap();

            logger.logInfo(
                `FRFS search completed. SearchId: ${result.searchId}, Quotes: ${result.quotes.length}`,
                'FrfsSearchAndPolling',
            );

            setSearchId(result.searchId);
            setQuotes(result.quotes);

            // Check if we need to start polling for quotes with fare
            const hasQuotesWithFare = result.quotes.some(quote => quote.price > 0);

            if (!hasQuotesWithFare && result.quotes.length === 0) {
                logger.logInfo(
                    `No fare found in initial search, starting quote polling for searchId: ${result.searchId}`,
                    'FrfsSearchAndPolling',
                );
                setShouldPoll(true);
                pollingAttempts.current = 0;
            }
            // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to perform FRFS search';
            logger.logError(`FRFS search failed: ${errorMessage}`, 'FrfsSearchAndPolling');
            setError(errorMessage);
        }
    }, [enabled, fromStationCode, toStationCode, vehicleNumber, vehicleType, frfsSearch, searchRequest]);

    // Handle polling data updates
    useEffect(() => {
        if (pollingData && shouldPoll) {
            pollingAttempts.current += 1;

            logger.logInfo(
                `Quote polling attempt ${pollingAttempts.current}: Received ${pollingData.length} quotes`,
                'FrfsSearchAndPolling',
            );

            setQuotes(pollingData);

            // Check if we got quotes with fare or reached max attempts
            const hasQuotesWithFare = pollingData.some(quote => quote.price > 0);

            if (hasQuotesWithFare) {
                logger.logInfo(
                    `Fare found in polling, stopping poll after ${pollingAttempts.current} attempts`,
                    'FrfsSearchAndPolling',
                );
                setShouldPoll(false);
            } else if (pollingAttempts.current >= MAX_POLLING_ATTEMPTS) {
                logger.logWarn(
                    `Max polling attempts reached (${MAX_POLLING_ATTEMPTS}), stopping poll`,
                    'FrfsSearchAndPolling',
                );
                setShouldPoll(false);
                setError('Timeout waiting for fare information');
            }
        }
    }, [pollingData, shouldPoll]);

    // Handle polling errors
    useEffect(() => {
        if (pollingError && shouldPoll) {
            logger.logError(`Quote polling error: ${pollingError}`, 'FrfsSearchAndPolling');
            setShouldPoll(false);
            setError('Failed to fetch updated quotes');
        }
    }, [pollingError, shouldPoll]);

    // Trigger search when parameters change or when explicitly requested
    useEffect(() => {
        if (enabled && fromStationCode && toStationCode && vehicleNumber) {
            performSearch();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enabled, fromStationCode, toStationCode, vehicleNumber, searchTrigger.current]);

    // Refetch function to manually trigger a new search
    const refetch = useCallback(() => {
        searchTrigger.current += 1;
        if (enabled && fromStationCode && toStationCode && vehicleNumber) {
            performSearch();
        }
    }, [enabled, fromStationCode, toStationCode, vehicleNumber, performSearch]);

    return {
        quotes,
        searchId,
        isSearching,
        isPolling,
        isLoading,
        error,
        refetch,
        hasFare,
    };
};
