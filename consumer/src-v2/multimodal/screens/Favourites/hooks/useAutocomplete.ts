import { debounce } from 'lodash';
import { useEffect, useState, useCallback } from 'react';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { location, locationWithServiceability } from '@/helpers/utils/Location/LocationTypes.gen';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { useLocationPredictions, UseLocationPredictionsProps } from '@/typescript/hooks/useLocationPredictions';

const useAutocomplete = (initialSearchText: string | undefined) => {
    const [searchText, setSearchText] = useState(initialSearchText || '');
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);

    const [predictLocations, { data: searchData, locationSearchStatus }] = useLocationPredictions();

    const locationByPlaceId = useCallback(async (item: location) => {
        const result: locationWithServiceability =
            await GetLocationAndServiceability.getLocationObjectAndServiceability(
                {
                    TAG: 'PlaceByPlaceId',
                    _0: {
                        contents: item.placeId ?? '',
                        tag: '',
                    },
                },
                item?.title,
                item?.subtitle,
                item?.locationType,
                'destination',
            );
        return result.location;
    }, []);

    const debouncedHandleSearch = debounce(predictLocations, 500);

    useEffect(() => {
        const predictLocationProps: UseLocationPredictionsProps = {
            input: searchText,
            lat: currentLocationCoords?.coords?.latitude,
            lng: currentLocationCoords?.coords?.longitude,
            isPickup: false,
            currentCoords: {
                lat: currentLocationCoords?.coords?.latitude,
                lng: currentLocationCoords?.coords?.longitude,
            },
        };
        if (searchText.length > 0) debouncedHandleSearch(predictLocationProps);
        else predictLocations(predictLocationProps);
        return () => {
            debouncedHandleSearch.cancel();
        };
    }, [searchText]);

    return { searchData, searchText, setSearchText, locationSearchStatus, locationByPlaceId };
};

export default useAutocomplete;
