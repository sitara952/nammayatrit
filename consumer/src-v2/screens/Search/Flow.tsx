import { SearchModalView } from './UI';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    BottomSheetStage,
    clearSession,
    SearchInput,
    selectActiveInput,
    selectAppConfig,
    selectCurrentLocationCoords,
    selectIsServiceable,
    selectLastKnownLocation,
    selectSearchedSource,
    selectSearchedStops,
    selectSelectedStopIndex,
    selectSeletedStopLocationsTextInput,
    selectSourceSetUsingPin,
    selectStartLocationFromTextInput,
    setActiveInput,
    setAmbulanceServiceClicked,
    setBottomSheetStage,
    setIsPickup,
    setIsServiceable,
    setSearchedSource,
    updateSelectedSearchedStop,
} from '@/typescript/state/client/session';
import { selectToken } from '@/typescript/state/client/auth';
import { useLocationPredictions, UseLocationPredictionsProps } from '@/typescript/hooks/useLocationPredictions';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resetIds } from '@/typescript/state/sharedReducer';
import { SearchModalScreenAction, SearchModalViewProps } from './Types';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { LocationObjectCaching } from '@/helpers/utils/Location/LocationCaching.bs';
import { GetLocationAndServiceability } from '@/helpers/utils/Location/LocationUtils.bs';
import { getPlaceNameAPIBody } from '@/typescript/utils/location';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useCheckForInterCity } from '@/typescript/hooks/checkForIntercity';
import { gatesInfoFull } from '@/api/apiTypes/ServiceabilityApi.gen';
import { TextInput } from 'react-native';
import { transitValues } from '@/src-v2/multimodal/screens/Search/constants';
import { TransitDataValuesType } from '@/src-v2/multimodal/screens/Search/types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { MainNavigationParamList, MainTabParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { setMapIsMoved } from '@/typescript/state/client/maps';
import { KeyboardController } from 'react-native-keyboard-controller';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { emptyJourneyDetailsProps } from '@/src-v2/multimodal/screens/JourneyInfoScreen';

export const SearchModalFlow = (props: { sourceData: Promise<location | null> | undefined; isMultimodal: boolean }) => {
    const stopLocationsTextInput = useAppSelector(selectSeletedStopLocationsTextInput);
    const startLocationFromTextInput = useAppSelector(selectStartLocationFromTextInput);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const lastKnownLocation: location | null = useAppSelector(selectLastKnownLocation);
    const source = useAppSelector(selectSearchedSource);
    const activeInput = useAppSelector(selectActiveInput);
    const userToken = useAppSelector(selectToken);
    const isServiceable = useAppSelector(selectIsServiceable);
    const stops = useAppSelector(selectSearchedStops);
    const selectedStopIndex = useAppSelector(selectSelectedStopIndex);
    const sourceSetUsingPin = useAppSelector(selectSourceSetUsingPin);
    const appConfig = useAppSelector(selectAppConfig);
    const { stopLocationsTextInputRef, startLocationTextInputRef } = useRefsContext();
    const { isInterCity } = useCheckForInterCity(source, stops);

    const dispatch = useAppDispatch();
    // Autocomplete API
    const [predictLocations, { data: searchData, locationSearchStatus }] = useLocationPredictions();

    // Autocomplete scheduling refs and helpers
    const lastInputRef = useRef<string>('');
    const lastSentInputRef = useRef<string>('');
    const autocompleteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const computeAutocompleteDelay = useCallback((inputText: string, isDeleting: boolean): number => {
        const length = inputText.trim().length;

        if (isDeleting) {
            if (length <= 3) return 4000;
            return 1500;
        }

        if (length <= 3) return 4000;
        if (length <= 6) return 850;
        return 700;
    }, []);

    useEffect(() => {
        const inputRaw =
            activeInput === SearchInput.Source ? (startLocationFromTextInput ?? '') : (stopLocationsTextInput ?? '');
        const inputText = typeof inputRaw === 'string' ? inputRaw : '';
        const prevInput = lastInputRef.current ?? '';
        const isDeleting = inputText.length < prevInput.length;
        const normalizedForCompare = inputText.trim();

        if (autocompleteTimerRef.current) {
            clearTimeout(autocompleteTimerRef.current);
            autocompleteTimerRef.current = null;
        }
        if (normalizedForCompare.length === 0) {
            const predictLocationProps: UseLocationPredictionsProps = {
                input: '',
                lat: source?.lat || currentLocationCoords?.coords?.latitude || lastKnownLocation?.lat,
                lng: source?.lng || currentLocationCoords?.coords?.longitude || lastKnownLocation?.lng,
                isPickup: activeInput === SearchInput.Source,
                currentCoords: {
                    lat: currentLocationCoords?.coords?.latitude,
                    lng: currentLocationCoords?.coords?.longitude,
                },
            };
            // This will trigger the hook to show recents from local storage without API call
            predictLocations(predictLocationProps);
            lastSentInputRef.current = '';
            lastInputRef.current = inputText;
            return;
        }

        // Gate: minimum characters required (start at 1 character)
        const minCharsForSearch = 1;
        const hasSufficientLength = normalizedForCompare.length >= minCharsForSearch;

        // Dedupe: avoid re-sending the same query
        const isDuplicate = normalizedForCompare === lastSentInputRef.current;

        const shouldTrigger = hasSufficientLength && !isDuplicate;

        if (shouldTrigger) {
            const delay = computeAutocompleteDelay(inputText, isDeleting);
            const predictLocationProps: UseLocationPredictionsProps = {
                input: inputText,
                lat: source?.lat || currentLocationCoords?.coords?.latitude || lastKnownLocation?.lat,
                lng: source?.lng || currentLocationCoords?.coords?.longitude || lastKnownLocation?.lng,
                isPickup: activeInput === SearchInput.Source,
                currentCoords: {
                    lat: currentLocationCoords?.coords?.latitude,
                    lng: currentLocationCoords?.coords?.longitude,
                },
            };

            autocompleteTimerRef.current = setTimeout(() => {
                // Final dedupe guard
                const finalNormalized = (predictLocationProps.input ?? '').trim();
                if (finalNormalized === lastSentInputRef.current || finalNormalized.length < minCharsForSearch) return;
                predictLocations(predictLocationProps);
                lastSentInputRef.current = finalNormalized;
            }, delay);
        }

        // Track last input for direction detection
        lastInputRef.current = inputText;

        return () => {
            if (autocompleteTimerRef.current) {
                clearTimeout(autocompleteTimerRef.current);
                autocompleteTimerRef.current = null;
            }
        };
    }, [
        stopLocationsTextInput,
        startLocationFromTextInput,
        activeInput,
        source,
        currentLocationCoords,
        lastKnownLocation,
    ]);

    const resetSourceLocation = async () => {
        const sourceData = await props.sourceData;
        sourceData && dispatch(setSearchedSource(sourceData));
    };

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<MainTabParamList, 'homeTab_homeScreen'>>();
    const originTab = route.params && 'originTab' in route.params ? route.params.originTab : undefined;

    const handleOnPressBack = () => {
        if (originTab === 'live') {
            navigation.getParent()?.navigate('live');
            navigation.setParams({ originTab: undefined }); // reset
        }
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'search_handleOnPressBack' }));
        resetIds(userToken, null, dispatch);
        dispatch(
            clearSession([
                'currentLocation',
                'currentLocationCoords',
                'hasRequestedLocationPermission',
                'hasRequestedForeGps',
            ]),
        );
        resetSourceLocation();
    };

    const getParsedLocation = async (item: location, isSource: boolean, textInputRef: TextInput | undefined | null) => {
        const result = !item.placeId
            ? undefined
            : await GetLocationAndServiceability.getLocationObjectAndServiceability(
                  getPlaceNameAPIBody(item),
                  item?.title,
                  item?.subtitle,
                  item?.locationType,
                  isSource ? 'source' : 'destination',
              );
        const serviceData = result ? result.location : item;
        const parsedData: location = { ...serviceData, tag: item.tag };
        dispatch(setIsServiceable(parsedData.serviceable ?? false));
        if (parsedData) {
            const revisedLocation: location = {
                ...parsedData,
                addressComponents: item.addressComponents,
                tag: 'RECENTS',
            };
            if (isSource) dispatch(setSearchedSource(revisedLocation));
            else dispatch(updateSelectedSearchedStop(revisedLocation));
            if (parsedData.serviceable) {
                LocationObjectCaching.setRecentSearches(revisedLocation);
            }
        }
        setTimeout(() => {
            const titleLength = parsedData?.title?.length ?? 0;
            const subtitleLength = parsedData?.subtitle?.length ?? 0;
            textInputRef?.setSelection(0, titleLength + subtitleLength + 1);
        }, 10);
        return parsedData;
    };

    const setDropGateAndNavigate = (parsedData: location, isDestination: boolean) => {
        KeyboardController.dismiss();
        if (isDestination && isInterCity) {
            dispatch(
                setBottomSheetStage({
                    stage: BottomSheetStage.IntercitySearchDetails,
                    src: 'lcmt_hdlcrdPress_source_intercity',
                }),
            );
        } else {
            const areDropSpecial = parsedData.specialLocation?.gatesInfo.every(
                (gate: gatesInfoFull) => gate.gateType === 'Drop',
            );
            dispatch(setIsPickup(!areDropSpecial));
            // If destination is being selected and source was set using pin, skip ConfirmPickup
            if (isDestination && sourceSetUsingPin && source?.serviceable && parsedData.serviceable) {
                logEvent(EventName.NY_USER_PICKUP_SELECT, { Source: source.title });
                if (appConfig.appType === 'multimodal') {
                    navigation.navigate('ServicesTab', {
                        screen: 'singleModeBookingNavigator',
                        params: {
                            screen: 'journeyDetails',
                            params: emptyJourneyDetailsProps,
                        },
                    });
                } else {
                    dispatch(
                        setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'search_destination_selected' }),
                    );
                }
            } else {
                dispatch(
                    setBottomSheetStage({
                        stage: BottomSheetStage.ConfirmPickup,
                        src: 'lcmt_hdlcrdPress_destination',
                    }),
                );
            }
        }
    };

    const onStopUnserviceable = () => {
        const unserviceableIndex = stops.findIndex((stop: location | null) => stop && !stop.serviceable);
        stopLocationsTextInputRef?.current?.[unserviceableIndex]?.focus();
    };

    const checkServiceAndNullStopsOnDestinationClick = (parsedData: location): boolean => {
        const stopsServiceable =
            parsedData.serviceable &&
            stops.every((stop: location | null, index: number) => stop?.serviceable || selectedStopIndex === index);
        const nullIndex = stops.indexOf(null);
        if (nullIndex !== -1 && nullIndex !== selectedStopIndex) {
            stopLocationsTextInputRef.current?.[nullIndex]?.focus();
            return false;
        }
        if (!stopsServiceable) {
            onStopUnserviceable();
            return false;
        }
        return true;
    };
    const checkServiceAndNullStopsOnSourceClick = (parsedData: location): boolean => {
        const stopsServiceable = parsedData.serviceable && stops.every((stop: location | null) => stop?.serviceable);
        if (!stops.every((stop: location | null) => stop !== null)) {
            const nullIndex = stops.indexOf(null) !== -1 ? stops.indexOf(null) : stops.length - 1;
            stopLocationsTextInputRef.current?.[nullIndex]?.focus();
            return false;
        }
        if (!stopsServiceable) {
            onStopUnserviceable();
            return false;
        }
        return true;
    };

    const handleDestinationCardClick = async (item: location) => {
        const parsedData = await getParsedLocation(item, false, stopLocationsTextInputRef?.current?.[stops.length - 1]);
        if (source) {
            if (!source.serviceable) {
                dispatch(setActiveInput(SearchInput.Source));
                startLocationFromTextInput && startLocationTextInputRef.current?.focus();
            }
            if (!checkServiceAndNullStopsOnDestinationClick(parsedData)) return;
            setDropGateAndNavigate(parsedData, true);
        } else {
            startLocationTextInputRef?.current?.focus();
        }
    };

    const handleSourceCardClick = async (item: location) => {
        const parsedData = await getParsedLocation(item, true, startLocationTextInputRef?.current);
        if (parsedData && parsedData.serviceable) {
            if (!checkServiceAndNullStopsOnSourceClick(parsedData)) {
                dispatch(setActiveInput(SearchInput.Destination));
                return;
            }
            setDropGateAndNavigate(parsedData, false);
        }
    };

    const handleCardPress = async (item: location) => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        if (activeInput === SearchInput.Destination) {
            handleDestinationCardClick(item);
        } else {
            handleSourceCardClick(item);
        }
    };

    const resolver: Resolver<SearchModalScreenAction> = useCallback(
        async (action: SearchModalScreenAction) => {
            switch (action.type) {
                case 'HANDLE_BACKPRESS':
                    dispatch(setAmbulanceServiceClicked(false));
                    handleOnPressBack();
                    break;

                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [handleOnPressBack],
    );

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

    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);
    const [_, setTransit] = useState(editTransitValues);

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

    const searchFloatingMapButton = useCallback(() => {
        dispatch(setMapIsMoved({ id: 'MapBeforeRide', payload: false }));
        if (activeInput === SearchInput.Destination) {
            dispatch(setIsPickup(false));
        }
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.ConfirmPickup, src: 'fltngBtn_handleOnPress' }));
        logEvent(
            activeInput === SearchInput.Destination
                ? EventName.NY_USER_DEST_SET_LOCATION_ON_MAP
                : EventName.NY_USER_SRC_SET_LOCATION_ON_MAP,
        );
    }, [activeInput]);

    const transitInitialized = useRef(false);

    const handleBusRoutePress = useCallback((value: string[]) => {
        setTransit(prev =>
            prev.map(item => (item.transit === transitValues.bus ? { ...item, selectedBusRoutes: value } : item)),
        );
    }, []);

    const resetTransitSettings = useCallback(() => {
        setTransit(editTransitValues);
        transitInitialized.current = false;
    }, []);

    const searchModalViewState: SearchModalViewProps = useMemo(() => {
        return {
            isServiceable,
            locationSearchStatus,
            activeInput,
            startLocationFromTextInput,
            source,
            stopLocationsTextInput,
            searchData,
            rcsDispatch,
            handleCardPress,
            isMultimodal: props.isMultimodal,
            showEditTransitBtn: props.isMultimodal,
            editTransitValues: editTransitValues,
            onTransitSwitchChange: handleTransitSwitchChange,
            onBusRoutePress: handleBusRoutePress,
            onEditTransitConfirmPress: resetTransitSettings,
            searchFloatingMapButton,
        };
    }, [
        isServiceable,
        locationSearchStatus,
        activeInput,
        startLocationFromTextInput,
        source,
        navigation,
        stopLocationsTextInput,
        searchData,
        rcsDispatch,
        props.isMultimodal,
        editTransitValues,
        handleTransitSwitchChange,
        handleBusRoutePress,
        resetTransitSettings,
        handleCardPress,
        searchFloatingMapButton,
    ]);

    return <SearchModalView {...searchModalViewState} />;
};
