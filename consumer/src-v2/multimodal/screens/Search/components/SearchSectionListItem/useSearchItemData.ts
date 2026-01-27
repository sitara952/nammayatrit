/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SearchResultItem } from './types';
import { TransportationTypes } from '@/src-v2/multimodal/screens/Search/types';
//
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.gen';

import {
    multimodalTransitOptionsLiteGetWithParams,
    useMultimodalTransitOptionsLiteGetQuery,
} from '../../../../../../src/api/integrations/rtk/MultimodalTransitOptionsLiteGet';
import { multimodalTransitOptionsResp } from '@/readOnly/api/types/MultimodalTransitOptionsResp.gen';
import { multimodalTransitOptionData } from '@/readOnly/api/types/MultimodalTransitOptionData.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentLocationCoords, selectSearchedSource } from '@/typescript/state/client/session';

const API_TIMEOUT_MS = 3000;
const DUMMY_DATA_DELAY_MS = 1000;
const USE_DUMMY_DATA = false;

type LocationCoordinates = {
    latitude: number;
    longitude: number;
};

type TransitModeData = {
    mode: TransportationTypes;
    duration: number | undefined;
};

type SearchItemData = {
    duration: string;
    transitModes: TransitModeData[] | undefined;
};

export const useSearchItemData = (item: SearchResultItem, searchKey: string) => {
    const [coordinates, setCoordinates] = useState<LocationCoordinates | undefined>(undefined);
    const [itemData, setItemData] = useState<SearchItemData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [transitQuery, setTransitQuery] = useState<multimodalTransitOptionsLiteGetWithParams | undefined>(undefined);
    const [useDummyData, setUseDummyData] = useState(USE_DUMMY_DATA);
    const [shouldShowDummy, setShouldShowDummy] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const dummyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const itemRef = useRef<SearchResultItem>(item);
    const isMounted = useRef<boolean>(true);

    const generateItemData = useCallback(() => {
        const dummyData = generateDummyTransitData(itemRef.current.duration);
        setItemData(dummyData);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        itemRef.current = item;
    }, [item.placeId]);

    useEffect(() => {
        if (!searchKey) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (dummyTimeoutRef.current) {
            clearTimeout(dummyTimeoutRef.current);
            dummyTimeoutRef.current = null;
        }

        const resetState = () => {
            setIsLoading(true);
            setItemData(null);
            setCoordinates(undefined);
            setTransitQuery(undefined);
            setShouldShowDummy(false);
            setUseDummyData(USE_DUMMY_DATA);
        };

        resetState();

        if (USE_DUMMY_DATA) {
            dummyTimeoutRef.current = setTimeout(() => {
                setShouldShowDummy(true);
            }, DUMMY_DATA_DELAY_MS);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (dummyTimeoutRef.current) clearTimeout(dummyTimeoutRef.current);
        };
    }, [searchKey]);

    useEffect(() => {
        if (USE_DUMMY_DATA || coordinates || !isLoading) {
            return;
        }

        const fetchCoordinates = async () => {
            if (!itemRef.current.placeId) {
                if (isMounted.current) {
                    setIsLoading(false);
                    setUseDummyData(true);
                }
                return;
            }

            try {
                const result = await fetchLocationCoordinates(
                    itemRef.current.placeId,
                    itemRef.current.title,
                    itemRef.current.subtitle,
                );

                if (isMounted.current) {
                    setCoordinates(result);

                    if (!result) {
                        setUseDummyData(true);
                    }
                }
            } catch (error) {
                console.error('Error fetching coordinates:', error);
                if (isMounted.current) {
                    setUseDummyData(true);
                    setIsLoading(false);
                }
            }
        };

        fetchCoordinates();

        timeoutRef.current = setTimeout(() => {
            if (isMounted && isLoading && !itemData) {
                setUseDummyData(true);
            }
        }, API_TIMEOUT_MS);

        return () => {
            isMounted.current = false;

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [coordinates, isLoading, itemData]);

    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const source = useAppSelector(selectSearchedSource);

    const transitRequest = useMemo(() => {
        if (!coordinates || useDummyData) return undefined;

        return {
            body: {
                sourceLatLong: {
                    lat: source?.lat || currentLocationCoords?.coords?.latitude || 0.0,
                    lon: source?.lng || currentLocationCoords?.coords?.longitude || 0.0,
                },
                destLatLong: {
                    lat: coordinates.latitude,
                    lon: coordinates.longitude,
                },
            },
        };
    }, [coordinates, useDummyData, source, currentLocationCoords]);

    useEffect(() => {
        if (transitRequest) {
            setTransitQuery(transitRequest);
        }
    }, [transitRequest]);

    const {
        data: transitData,
        isLoading: isTransitLoading,
        isError: isTransitError,
        error: transitError,
    } = useMultimodalTransitOptionsLiteGetQuery(transitQuery as multimodalTransitOptionsLiteGetWithParams, {
        skip: !transitQuery || useDummyData,

        refetchOnMountOrArgChange: true,
        refetchOnReconnect: true,
        refetchOnFocus: true,
    });

    useEffect(() => {
        if (useDummyData && shouldShowDummy) {
            generateItemData();
            return;
        }

        if (useDummyData) {
            return;
        }

        if (isTransitLoading || !transitData) return;

        try {
            const processedData = processTransitData(transitData, itemRef.current);
            setItemData(processedData);
            setIsLoading(false);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        } catch (error) {
            console.error('Error processing transit data:', error);

            setUseDummyData(true);
        }
    }, [transitData, isTransitLoading, useDummyData, shouldShowDummy]);

    useEffect(() => {
        if (isTransitError) {
            console.error('Transit data fetch error:', transitError);

            setUseDummyData(true);
        }
    }, [isTransitError, transitError]);

    return { itemData, isLoading };
};

const fetchLocationCoordinates = async (
    placeId: string,
    title: string,
    subtitle: string,
): Promise<LocationCoordinates | undefined> => {
    try {
        const result = await GetLocationAndServiceability.getLocationObjectAndServiceability(
            {
                TAG: 'PlaceByPlaceId',
                _0: {
                    contents: placeId,
                    tag: '',
                },
            },
            title,
            subtitle,
            undefined,
            'destination',
        );
        const locationData = result.location;

        if (locationData && locationData.lat && locationData.lng) {
            const coordinates = {
                latitude: locationData.lat,
                longitude: locationData.lng,
            };
            return coordinates;
        }
        return undefined;
    } catch (error) {
        console.error('Error in fetchLocationCoordinates:', error);
        return undefined;
    }
};

const formatDuration = (duration: string | undefined): string => {
    if (!duration) return '';
    return duration === '0.0 km' ? ' ' : duration;
};

const processTransitData = (
    transitData: multimodalTransitOptionsResp,
    originalItem: SearchResultItem,
): SearchItemData => {
    try {
        if (!transitData.options || !Array.isArray(transitData.options) || transitData.options.length === 0) {
            return {
                duration: formatDuration(originalItem.duration),
                transitModes: undefined,
            };
        }

        const transitModes: TransitModeData[] =
            transitData.options && Array.isArray(transitData.options)
                ? transitData.options.reduce((acc: TransitModeData[], option: multimodalTransitOptionData) => {
                      if (option.travelModes && Array.isArray(option.travelModes) && option.travelModes.length > 0) {
                          const modesFromOption = option.travelModes
                              .map((travelMode: MultimodalTravelMode_multimodalTravelMode) => {
                                  const mappedMode = mapTransitMode(travelMode);
                                  return mappedMode
                                      ? {
                                            mode: mappedMode,
                                            duration: option.duration || undefined,
                                        }
                                      : null;
                              })
                              .filter(Boolean) as TransitModeData[];

                          return [...acc, ...modesFromOption];
                      }
                      return acc;
                  }, [])
                : [];

        if (transitModes.length === 0) {
            return {
                duration: formatDuration(originalItem.duration),
                transitModes: undefined,
            };
        }

        return {
            duration: formatDuration(originalItem.duration),
            transitModes,
        };
    } catch (error) {
        console.error('Error processing transit data:', error);
        return generateDummyTransitData(originalItem.duration);
    }
};

const mapTransitMode = (apiMode: MultimodalTravelMode_multimodalTravelMode): TransportationTypes | null => {
    switch (apiMode) {
        case 'Bus':
            return 'bus';
        case 'Metro':
        case 'Subway':
            return 'metro';
        case 'Taxi':
            return 'auto';
        case 'Walk':
            return 'walking';
        default:
            return null;
    }
};

const generateDummyTransitData = (originalDuration: string | undefined = undefined): SearchItemData => {
    const modes: TransportationTypes[] = ['bus', 'metro', 'train', 'auto'];

    const numModes = Math.floor(Math.random() * 3) + 1;

    const selectedModes = Array.from({ length: numModes }, () => {
        const randomMode = modes[Math.floor(Math.random() * modes.length)];
        const durationMinutes = Math.floor(Math.random() * 30) + 5;
        return {
            mode: randomMode as TransportationTypes,
            duration: durationMinutes,
        };
    });

    const formattedDuration = formatDuration(originalDuration);
    const fallbackDuration = formattedDuration || `${Math.floor(Math.random() * 30) + 5} km`;

    return {
        duration: fallbackDuration,
        transitModes: selectedModes,
    };
};
