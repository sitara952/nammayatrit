import React, { useState, useMemo, useCallback, useEffect, useContext } from 'react';
import SearchContainer from './components/SearchContainer';
import { transitValues } from './constants';
import { TransitDataValuesType } from './types';

import { SearchModalViewProps } from '@/src-v2/screens/Search/Types';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { setIsServiceable, setSearchedSource } from '@/typescript/state/client/session';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { SearchResultItem } from './components/SearchSectionListItem/types';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { SearchInput } from '@/typescript/state/client/session';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.bs';
import { getPlaceNameAPIBody } from '@/typescript/utils/location';
import { checkForInterCityLegacy } from '@/typescript/utils/placeUtils';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { gateInfoFull } from '@/readOnly/api/types/GateInfoFull.gen';

import {
    selectSearchedStops,
    selectSelectedStopIndex,
    selectSourceSetUsingPin,
    setActiveInput,
    setBottomSheetStage,
    updateSelectedSearchedStop,
} from '../../../../src/typescript/state/client/session';
import { LocationObjectCaching } from '@/helpers/utils/Location/LocationCaching.bs';
import { useRefsContext } from '@/typescript/context/RefsContext';

import { selectActiveInput, selectSearchedSource, setIsPickup } from '@/typescript/state/client/session';
import { BottomSheetStage } from '@/typescript/state/client/session';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { createAction } from '@/typescript/utils/common';
import { MapContext } from '@/typescript/Maps/MapContext';
import { goToJourneyDetails } from '@/typescript/state/sharedReducer';
import { selectToken } from '@/typescript/state/client/auth';

const transformLocationToSearchResult = (locations: location[]): SearchResultItem[] => {
    return locations.map(location => ({
        title: location.title || '',
        subtitle: location.formattedAddress || location.subtitle || '',
        placeId: location.placeId || undefined,
        duration: location.distanceFromCurrentLocation || 'N/A',
        location: location,
        routeCode: undefined,
        stopCode: undefined,
        searchType: 'open',
        transitModes: [
            {
                mode: 'bus',
                duration: 10,
            },
        ],
    }));
};

const editTransitValues: TransitDataValuesType[] = [
    {
        transit: transitValues.bus,
        value: true,
        selectedBusRoutes: ['ordinary', 'deluxe'],
    },
    {
        transit: transitValues.metro,
        value: false,
        selectedBusRoutes: undefined,
    },
    {
        transit: transitValues.train,
        value: false,
        selectedBusRoutes: undefined,
    },
];

export const SearchUI: React.FC<SearchModalViewProps> = ({ searchData, isMultimodal, rcsDispatch }) => {
    const dispatch = useAppDispatch();
    const [dropLocation, setDropLocation] = useState('');
    const [transit, setTransit] = useState(editTransitValues);
    const userToken = useAppSelector(selectToken);
    // Selectors
    const activeInput = useAppSelector(selectActiveInput);
    const sourceSetUsingPin = useAppSelector(selectSourceSetUsingPin);
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const { stopLocationsTextInputRef, startLocationTextInputRef } = useRefsContext();
    const selectedStopIndex = useAppSelector(selectSelectedStopIndex);
    const stops = useAppSelector(selectSearchedStops);
    const source = useAppSelector(selectSearchedSource);

    const transitInitialized = React.useRef(false);

    const transformedSearchResults = useMemo(() => {
        return transformLocationToSearchResult(searchData);
    }, [searchData]);

    useEffect(() => {
        if (transitInitialized.current) {
            return;
        }
        transitInitialized.current = true;
    }, []);

    useEffect(() => {
        const hasValidState = transit.every(
            item =>
                typeof item.transit === 'string' &&
                typeof item.value === 'boolean' &&
                (item.transit !== 'bus-route' || item.value === false || Array.isArray(item.selectedBusRoutes)),
        );

        if (!hasValidState) {
            console.warn('Invalid transit state detected, resetting to defaults');
            setTransit(editTransitValues);
        }
    }, [transit]);

    const resetTransitSettings = useCallback(() => {
        setTransit(editTransitValues);
        transitInitialized.current = false;
    }, []);

    const handleTransitSwitchChange = useCallback((transit: string, value: boolean) => {
        setTransit(prev => {
            return prev.map(item => {
                // Only update the specific transit mode
                if (item.transit === transit) {
                    return {
                        ...item,
                        value: value,
                        // For bus-route, ensure we maintain or initialize selectedBusRoutes
                        // when enabling the toggle
                        selectedBusRoutes:
                            transit === 'bus-route' && value
                                ? item.selectedBusRoutes?.length
                                    ? item.selectedBusRoutes
                                    : ['ordinary']
                                : item.selectedBusRoutes,
                    };
                }
                return item;
            });
        });
    }, []);

    const handleBusRoutePress = useCallback((value: string[]) => {
        setTransit(prev =>
            prev.map(item => (item.transit === transitValues.bus ? { ...item, selectedBusRoutes: value } : item)),
        );
    }, []);

    const { mapRef } = useContext(MapContext);

    const handleSearchOnPress = useCallback(
        async (item: location) => {
            hapticEffect(undefined, undefined);

            if (activeInput === SearchInput.Destination) {
                // Handle destination selection
                const result = !item.placeId
                    ? undefined
                    : await GetLocationAndServiceability.getLocationObjectAndServiceability(
                          getPlaceNameAPIBody(item),
                          item?.title,
                          item?.subtitle,
                          item?.locationType,
                          'destination',
                      );
                const parsedData = result ? result.location : item;
                // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                dispatch(setIsServiceable(parsedData.serviceable as boolean));

                if (parsedData) {
                    dispatch(
                        updateSelectedSearchedStop({
                            ...parsedData,
                            title: `${item?.title}`,
                            tag: 'RECENTS',
                        }),
                    );

                    if (parsedData.serviceable) {
                        LocationObjectCaching.setRecentSearches({
                            ...parsedData,
                            tag: 'RECENTS',
                        });
                    }

                    // Reduce setTimeout calls by combining operations
                    requestAnimationFrame(() => {
                        stopLocationsTextInputRef?.current?.[stops.length - 1]?.setSelection(
                            0,

                            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                            (parsedData?.title?.length as number) + (parsedData?.subtitle?.length as number) + 1,
                        );
                    });
                }

                if (source) {
                    const stopsServiceable =
                        parsedData.serviceable &&
                        stops.every((stop, index) => stop?.serviceable || selectedStopIndex === index);

                    const nullIndex = stops.indexOf(null);

                    if (nullIndex !== -1 && nullIndex !== selectedStopIndex) {
                        stopLocationsTextInputRef.current?.[nullIndex]?.focus();
                    } else if (!sourceSetUsingPin && source.serviceable && stopsServiceable && !isMultimodal) {
                        const areDropSpecial =
                            !isMultimodal &&
                            parsedData.specialLocation?.gatesInfo.every(
                                (gate: gateInfoFull) => gate.gateType === 'Drop',
                            );

                        // Batch dispatch operations
                        dispatch(setIsPickup(!areDropSpecial));
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'mm_search' }));
                    } else if (source.serviceable && stopsServiceable) {
                        if (checkForInterCityLegacy(source, stops)) {
                            dispatch(
                                setBottomSheetStage({
                                    stage: BottomSheetStage.IntercitySearchDetails,
                                    src: 'mm_search_2',
                                }),
                            );
                        } else {
                            if (isMultimodal) {
                                goToJourneyDetails({
                                    userToken,
                                    dispatch,
                                    navigation,
                                    destinationStop: undefined,
                                    originStop: undefined,
                                    recentLocationId: undefined,
                                    routeCode: undefined,
                                    startTime: undefined,
                                    vehicleType: undefined,
                                    serviceableStartTime: undefined,
                                    otp: undefined,
                                    isSingleModeMetro: false,
                                });
                                mapRef.current?.addStaticMapPadding({ left: 0, top: 0, right: 0, bottom: 0 });
                            } else {
                                dispatch(
                                    setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'mm_search_3' }),
                                );
                            }
                        }
                    } else if (!source.serviceable && stopLocationsTextInputRef) {
                        dispatch(setActiveInput(SearchInput.Source));
                        startLocationTextInputRef?.current?.focus();
                    }
                } else {
                    startLocationTextInputRef?.current?.focus();
                }
            } else {
                // Handle source selection
                const result = !item.placeId
                    ? undefined
                    : await GetLocationAndServiceability.getLocationObjectAndServiceability(
                          getPlaceNameAPIBody(item),
                          item?.title,
                          item?.subtitle,
                          item?.locationType,
                          activeInput === SearchInput.Source ? 'source' : 'destination',
                      );
                const parsedData = result ? result.location : item;
                //   eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                dispatch(setIsServiceable(parsedData.serviceable as boolean));

                if (parsedData) {
                    // Batch related operations where possible
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    dispatch(setSearchedSource({ ...parsedData, title: `${item?.title}` }));

                    requestAnimationFrame(() => {
                        startLocationTextInputRef?.current?.setSelection(
                            0,

                            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                            (parsedData?.title?.length as number) + (parsedData?.subtitle?.length as number) + 1,
                        );
                    });

                    if (parsedData.serviceable) {
                        LocationObjectCaching.setRecentSearches({
                            ...parsedData,
                            tag: 'RECENTS',
                        });
                        if (stops.every(stop => stop !== null)) {
                            if (stops.every(stop => stop.serviceable)) {
                                const areDropSpecial =
                                    !isMultimodal &&
                                    parsedData.specialLocation?.gatesInfo.every(
                                        (gate: gateInfoFull) => gate.gateType === 'Drop',
                                    );
                                if (isMultimodal) {
                                    goToJourneyDetails({
                                        userToken,
                                        dispatch,
                                        navigation,
                                        destinationStop: undefined,
                                        originStop: undefined,
                                        recentLocationId: undefined,
                                        routeCode: undefined,
                                        startTime: undefined,
                                        vehicleType: undefined,
                                        serviceableStartTime: undefined,
                                        otp: undefined,
                                        isSingleModeMetro: false,
                                    });
                                    mapRef.current?.addStaticMapPadding({ left: 0, top: 0, right: 0, bottom: 0 });
                                } else {
                                    // Batch dispatch operations
                                    dispatch(setIsPickup(!areDropSpecial));
                                    setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'mm_search_4' });
                                }
                            } else {
                                const unserviceableIndex = stops.findIndex(stop => !stop.serviceable);
                                stopLocationsTextInputRef?.current?.[unserviceableIndex]?.focus();
                            }
                        } else {
                            const nullIndex = stops.indexOf(null) !== -1 ? stops.indexOf(null) : stops.length - 1;
                            stopLocationsTextInputRef?.current?.[nullIndex]?.focus();
                        }
                    }
                }
            }
        },
        [
            activeInput,
            dispatch,
            source,
            stops,
            selectedStopIndex,
            stopLocationsTextInputRef,
            sourceSetUsingPin,
            isMultimodal,
            startLocationTextInputRef,
            navigation,
            mapRef,
        ],
    );

    return (
        <SearchContainer
            dropLocation={dropLocation}
            setDropLocation={setDropLocation}
            onSearchModalClose={() => rcsDispatch(createAction('HANDLE_BACKPRESS', undefined))}
            handleSearchOnPress={handleSearchOnPress}
            handleSearchOnSingleModePress={undefined}
            searchResults={transformedSearchResults}
            editTransitValues={transit}
            onTransitSwitchChange={handleTransitSwitchChange}
            onBusRoutePress={handleBusRoutePress}
            onEditTransitConfirmPress={resetTransitSettings}
            isMultimodal={isMultimodal}
            showEditTransitBtn={true}
            isLoading={false}
        />
    );
};

// Memo the component to prevent unnecessary re-renders
export default React.memo(SearchUI);
