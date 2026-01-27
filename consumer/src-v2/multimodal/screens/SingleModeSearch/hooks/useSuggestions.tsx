import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { debounce, isUndefined } from 'lodash';
import { SearchResultItem } from '../../Search/components/SearchSectionListItem/types';
import { usePublicTransportUtils, SearchTarget } from '../../../utils/PublicTransportUtils';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { TransportationTypes } from '../Types';
import { transportRoute, transportStation } from '@/readOnly/api/types/PublicTransportData.gen';

export const castToVehicleCategory = (bookingType: TransportationTypes): VehicleCategory_vehicleCategory => {
    switch (bookingType) {
        case 'Bus':
            return 'BUS';
        case 'Train':
            return 'SUBWAY';
        case 'Metro':
            return 'METRO';
    }
};

export interface SuggestionsInput {
    searchString: string;
    searchType: SearchTarget;
}

export const useSuggestions = (
    bookingType: TransportationTypes,
    transformedRoutes: transportRoute[] | undefined,
    transformedStations: transportStation[] | undefined,
    showEditSource: boolean,
    isFallbackView: boolean,
) => {
    const [suggestions, setSuggestions] = useState<SearchResultItem[]>([]);
    const [suggestionsLoading, setSuggestionsLoading] = useState(false);
    const transformedRoutesRef = useRef(transformedRoutes);
    const transformedStationsRef = useRef(transformedStations);

    const { searchTransport } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    // Define debounced function outside the effect
    const debouncedSuggestions = useMemo(() => {
        const debouncedFn = debounce(
            (
                searchString: string,
                vehicleType: VehicleCategory_vehicleCategory,
                searchType: SearchTarget,
                transformedR: transportRoute[] | undefined,
                transformedS: transportStation[] | undefined,
            ) => {
                const suggestions = searchTransport(
                    searchString,
                    transformedR,
                    transformedS,
                    showEditSource,
                    isFallbackView,
                    vehicleType,
                    searchType,
                );

                const filteredSuggestions = isFallbackView
                    ? suggestions.filter(suggestion => isUndefined(suggestion.stopCode))
                    : suggestions;
                setSuggestions(filteredSuggestions);
                setSuggestionsLoading(false);
            },
            300,
        );
        return debouncedFn;
    }, [searchTransport, showEditSource, isFallbackView]);

    useEffect(() => {
        transformedRoutesRef.current = transformedRoutes;
        transformedStationsRef.current = transformedStations;
    }, [transformedRoutes, transformedStations]);

    // Use debounced function in the effect
    const searchPublicTransport = useCallback(
        (searchString: string, searchType: SearchTarget) => {
            setSuggestionsLoading(true);
            const vehicleType: VehicleCategory_vehicleCategory = castToVehicleCategory(bookingType);
            debouncedSuggestions(
                searchString,
                vehicleType,
                searchType,
                transformedRoutesRef.current,
                transformedStationsRef.current,
            );
        },
        [bookingType, debouncedSuggestions, setSuggestionsLoading],
    );

    return {
        suggestions,
        suggestionsLoading,
        searchPublicTransport,
    };
};
