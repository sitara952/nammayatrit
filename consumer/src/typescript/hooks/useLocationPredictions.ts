import { LocationObjectCaching } from '../../helpers/utils/Location/LocationCaching.gen';
import { useAutoCompleteMutation } from '../state/server/searchApi';
import { location } from '../../helpers/utils/Location/LocationTypes.gen';
import { modifyLocationArrayDistance } from '../../helpers/utils/Location/LocationUtils.gen';
import { useEffect, useRef, useState } from 'react';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';
import { getPlaceNameByEnum } from '@/api/apiTypes/GetPlaceNameApi.gen';
import { selectAppConfig, useFilterAutocomplete } from '../state/client/session';
import { useAppSelector } from '../state/hooks';
import { savedReqLocationAPIEntity } from '@/readOnly/api/types/SavedReqLocationAPIEntity.gen';
import { useSavedLocations } from './useSavedLocations';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';

export enum LocationSearchOptions {
    LOADING,
    EMPTY_INPUT,
    RECENTS,
    LOCATIONS_FOUND,
    LOCATIONS_NOT_FOUND,
}

export type UseLocationPredictionsProps = {
    input: string;
    lat: number | undefined;
    lng: number | undefined;
    isPickup: boolean;
    currentCoords: {
        lat: number | undefined;
        lng: number | undefined;
    };
};

export const useLocationPredictions = () => {
    const [callAutoComplete, { data: autoCompleteData, isLoading: autoCompleteLoading }] = useAutoCompleteMutation();
    const allRecents = LocationObjectCaching.fetchRecents();
    const { savedLocations } = useSavedLocations();
    const useFilterOnAutocomplete = useAppSelector(useFilterAutocomplete);
    const appConfig = useAppSelector(selectAppConfig);
    const initialCoordinate = appConfig.merchantData.initialCoordinate;

    const [locationSearchStatus, setLocationSearchStatus] = useState<LocationSearchOptions>(
        LocationSearchOptions.LOADING,
    );
    const [data, setData] = useState<location[]>([]);
    const currentInputRef = useRef<string>('');

    const getMatchedRecents = (userInput: string, existingPlaceIds: Set<string | undefined>): location[] => {
        if (!userInput || !allRecents || allRecents.length === 0) return [];

        const normalizedInput = userInput.trim().toLowerCase();
        if (normalizedInput.length === 0) return [];

        return allRecents
            .filter((recent: location) => {
                const title = recent.title?.toLowerCase() ?? '';
                return title.includes(normalizedInput);
            })
            .filter((recent: location) => !recent.placeId || !existingPlaceIds.has(recent.placeId))
            .map((recent: location) => ({
                ...recent,
                tag: 'PRIORITIZE_RECENT',
            }));
    };
    const { setAutoClearTimeout } = useAutoClearTimeout();

    const fetchPredictions = async (props: UseLocationPredictionsProps) => {
        const { input, currentCoords } = props;
        currentInputRef.current = input;
        if (!input.length) {
            const recents = allRecents?.slice(0, 10);
            setLocationSearchStatus(recents ? LocationSearchOptions.RECENTS : LocationSearchOptions.EMPTY_INPUT);
            setAutoClearTimeout(() => {
                const data = recents
                    ? modifyLocationArrayDistance(
                          recents,
                          props.lat ?? currentCoords?.lat,
                          props.lng ?? currentCoords?.lng,
                      )
                    : [];
                setData(data);
            }, 350);
            return;
        }
        const locationObject = parseCoordinates(input);
        if (locationObject) {
            const reqBody: getPlaceNameByEnum = {
                TAG: 'PlaceByLatLon',
                _0: {
                    contents: {
                        lat: locationObject.lat,
                        lon: locationObject.long,
                    },
                    tag: '',
                },
            };
            const result = await GetLocationAndServiceability.getLocationObjectAndServiceability(
                reqBody,
                undefined,
                undefined,
                undefined,
                'destination',
            );
            const data = result.location;
            const existingPlaceIds = new Set([data.placeId].filter(Boolean));
            const matchedRecents = getMatchedRecents(currentInputRef.current, existingPlaceIds);
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            if (data) {
                const locationData: location = {
                    ...data,
                    tag: 'AUTOCOMPLETE',
                };
                setData([...matchedRecents, locationData]);
            }
            setLocationSearchStatus(LocationSearchOptions.LOCATIONS_FOUND);
        } else {
            const latitudeVal = props.lat ? props.lat : initialCoordinate.latitude;
            const longitudeVal = props.lng ? props.lng : initialCoordinate.longitude;
            await callAutoComplete({ ...props, lat: latitudeVal, lng: longitudeVal });
        }
        const eventName = props.isPickup
            ? EventName.NY_USER_AUTO_COMPLETE_API_TRIGGER_SRC
            : EventName.NY_USER_AUTO_COMPLETE_API_TRIGGER_DST;
        logEvent(eventName);
    };

    const filtered = useRef<location[]>([]);
    useEffect(() => {
        if (autoCompleteLoading) setLocationSearchStatus(LocationSearchOptions.LOADING);
        else if (autoCompleteData) {
            filtered.current = [];
            if (useFilterOnAutocomplete) {
                autoCompleteData.forEach((v: location) => {
                    const filterFavorite = savedLocations?.filter(
                        (fav: savedReqLocationAPIEntity) => fav.placeId === v.placeId,
                    );
                    const filterRecent = allRecents?.filter((recent: location) => recent.placeId === v.placeId);

                    if (filterFavorite && filterFavorite.length > 0) {
                        if (filterFavorite.at(0)) {
                            filtered.current = [{ ...v, tag: 'PRIORITIZE_FAVOURITE' }, ...filtered.current];
                        }
                    } else if (filterRecent && filterRecent.length > 0) {
                        if (filterRecent.at(0)) {
                            filtered.current = [{ ...v, tag: 'PRIORITIZE_RECENT' }, ...filtered.current];
                        }
                    } else {
                        filtered.current = [...filtered.current, v];
                    }
                });
                const existingPlaceIds = new Set(filtered.current.map(item => item.placeId).filter(Boolean));
                const matchedRecents = getMatchedRecents(currentInputRef.current, existingPlaceIds);
                filtered.current = [...matchedRecents, ...filtered.current];
            } else {
                filtered.current = autoCompleteData;
            }
            setData(filtered.current);
            setLocationSearchStatus(
                filtered.current.length > 0
                    ? LocationSearchOptions.LOCATIONS_FOUND
                    : LocationSearchOptions.LOCATIONS_NOT_FOUND,
            );
        }
    }, [autoCompleteData, autoCompleteLoading]);

    return [fetchPredictions, { data, locationSearchStatus }] as const;
};

function parseCoordinates(input: string): { lat: number; long: number } | undefined {
    // Regex pattern to match various coordinate formats:
    // - Decimal degrees (40.7128, -74.0060)
    // - DMS with directions (40°N 73°W)
    // - Mixed formats (40°30'20"N, 73°15'45"W)
    const regex =
        /^\s*(-?\d{1,3}(?:\.\d+)?|[-+]?\d{1,3}°\d{1,2}'\d{1,2}(?:\.\d+)?")\s*([NS]?)\s*,?\s*(-?\d{1,3}(?:\.\d+)?|[-+]?\d{1,3}°\d{1,2}'\d{1,2}(?:\.\d+)?")\s*([EW]?)\s*$/i;

    const match = input.match(regex);

    if (!match) return undefined;

    const [
        _,
        coordPart1, // First coordinate component (lat or long)
        dirIndicator1, // First direction indicator (N/S or E/W)
        coordPart2, // Second coordinate component
        dirIndicator2, // Second direction indicator
    ] = match;

    // Determine coordinate components based on direction indicators
    const {
        latValue, // Latitude value (string)
        latDirection, // N/S indicator
        longValue, // Longitude value (string)
        longDirection, // E/W indicator
    } =
        dirIndicator1?.toUpperCase() === 'N' || dirIndicator1?.toUpperCase() === 'S'
            ? {
                  // Case 1: First component is latitude with N/S indicator
                  latValue: coordPart1,
                  latDirection: dirIndicator1.toUpperCase(),
                  longValue: coordPart2,
                  longDirection: dirIndicator2?.toUpperCase(),
              }
            : dirIndicator2?.toUpperCase() === 'E' || dirIndicator2?.toUpperCase() === 'W'
              ? {
                    // Case 2: Second component is longitude with E/W indicator
                    latValue: coordPart2,
                    latDirection: dirIndicator1?.toUpperCase(),
                    longValue: coordPart1,
                    longDirection: dirIndicator2.toUpperCase(),
                }
              : {
                    // Case 3: No direction indicators, assume lat,long order
                    latValue: coordPart1,
                    latDirection: undefined,
                    longValue: coordPart2,
                    longDirection: undefined,
                };

    // Convert DMS to decimal degrees if needed
    const dmsToDecimal = (dms: string): number => {
        const dmsRegex = /([-+]?\d{1,3})°(\d{1,2})'(\d{1,2}(?:\.\d+)?)?"?/;
        const dmsMatch = dms.match(dmsRegex);
        if (dmsMatch) {
            const degrees = parseFloat(dmsMatch[1] ?? '0');
            const minutes = parseFloat(dmsMatch[2] ?? '0');
            const seconds = parseFloat(dmsMatch[3] ?? '0');
            return degrees + minutes / 60 + seconds / 3600;
        } else {
            return parseFloat(dms);
        }
    };

    // Calculate final coordinates with direction adjustment
    const lat = dmsToDecimal(latValue ?? '0') * (latDirection === 'S' ? -1 : 1);
    const long = dmsToDecimal(longValue ?? '0') * (longDirection === 'W' ? -1 : 1);

    // Validate coordinate ranges
    if (lat < -90 || lat > 90 || long < -180 || long > 180) {
        return undefined;
    }

    return { lat, long };
}
