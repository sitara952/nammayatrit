/* eslint-disable myCustomPlugin/no-lazy-png-imports */
import mtIcMetro from '@/src-v2/assets/3D-assets/mt_ic_metro.webp';
import mtIcBookAnyAmbulance from '@/typescript/assets/ny-service/ny_ic_book_any_ambulance.webp';

import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen.tsx';
import { journeyData } from '@/readOnly/api/types/JourneyData.gen';
import { updateSuggestedDestinations } from '@/src-v2/helpers/location/utils/LocationCaching';
import { useNearbyDrivers } from '@/src-v2/hooks/useNearbyDrivers';
import { mapModeToTransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';
import { PublicTransportCard } from '@/src-v2/multimodal/components/PublicTransportCard/UI';
import { JourneyFilterOptions } from '@/src-v2/multimodal/screens/PublicTransitList/Types';
import { logger } from '@/src-v2/systems/logger';
import {
    adjustPriceForPetRide,
    calculateTipOptionsToPersist,
    createNammaTravelObject,
    formatTimeFromSeconds,
    getTitle,
    getVehicleImageSrcSelected,
    handleSmartTipSuggestion,
} from '@/src-v2/utils/common';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { CardEstimates, CardEstimatesShimmer } from '@/typescript/designSystem/components/CardEstimates';
import { useFlowStatusHandler } from '@/typescript/hooks/useFlowStatusHandler';
import useOnBottomSheetAnimate from '@/typescript/hooks/useOnBottomSheetAnimate';
import { MapContext } from '@/typescript/Maps/MapContext';
import useMapRoute from '@/typescript/Maps/UseMapRouteTS';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { selectToken } from '@/typescript/state/client/auth';
import { selectNearbyDrivers } from '@/typescript/state/client/maps';
import {
    PricingItemType,
    selectCompleteRouteInfo,
    selectIsAddTipSelected,
    selectIsPetRide,
    selectJourneys,
    selectPricingItems,
    selectRouteInfo,
    selectSelectedJourney,
    selectSelectedPricingItems,
    selectTripDistance,
    setSelectedJourney,
    setSelectedJourneyFilter,
    setSelectedPricingItems,
    TripCategory,
    TripMode,
    selectPersistedTipOptions,
    setPersistedTipOptions,
    setPersistedSmartTipValue,
    selectTripTypeSelection,
} from '@/typescript/state/client/search';
import {
    BottomSheetStage,
    resetToastProps,
    SearchInput,
    SearchWarningType,
    selectCurrentLocation,
    selectDestination,
    selectDropTime,
    selectFareProductType,
    selectFlowStatusValidated,
    selectNearbyDriversConfig,
    selectNewFeatureFlags,
    selectPickupTime,
    selectRentalDistance,
    selectRideDuration,
    selectScreenReaderEnabled,
    selectAmbulanceServiceClicked,
    selectSearchedSource,
    selectSearchedStops,
    selectSearchFailed,
    selectSearchWarning,
    setActiveInput,
    setBottomSheetStage,
    setSearchedSource,
    setSearchWarning,
    setSourceSetUsingPin,
    setStartLocationFromTextInput,
    setToastProps,
    updateSelectedStopLocationTextInput,
    selectAppConfig,
} from '@/typescript/state/client/session';
import {
    selectCachedDestinations,
    selectDisabilityListResp,
    selectSpecialAssistance,
    selectUserProfile,
    setSpecialAssistance,
} from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useSearchMutation, useSearchResultsQuery } from '@/typescript/state/server/searchApi';
import { resetIds } from '@/typescript/state/sharedReducer';
import { FareTypes, getFareType } from '@/typescript/utils/fareEntityHelper';
import { isServiceTierTypeAvailable } from '@/typescript/utils/vehicleImagesMapping';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CleverTap from 'clevertap-react-native';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { isArray, isNull, isUndefined } from 'lodash';
import React, { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import { runOnJS, useAnimatedReaction, useDerivedValue, withSpring } from 'react-native-reanimated';
import { shallowEqual } from 'react-redux';
import { useSearchExpiry } from '../Search/components/useSearchExpiry';
import {
    ChooseRideCardData,
    ChooseRideCardType,
    ChooseRideProps,
    ChooseRideViewProps,
    LoadingCardData,
    LoadingCardType,
    RenderItems,
    SelectedMultimodalLeg,
} from './Types';
import { ChooseRideView } from './UI';
import { calculateTotalJourneyDurationWithConsistentRounding } from '@/src-v2/multimodal/screens/JourneyInfoScreen/utils';
import { location } from '@/helpers/utils/Location/LocationTypes.gen';
import { useAdaptivePolling } from '../../utils/useAdaptivePolling';

const topPadding = 70;
const bottomPadOffset = Platform.OS == 'ios' ? 50 : 40;
export const BOOK_ANY = 'Book Any';
export const AMBULANCE_SERVICE = 'Ambulance Services';

const AMBULANCE_SERVICE_TIERS = [
    'AMBULANCE_TAXI',
    'AMBULANCE_TAXI_OXY',
    'AMBULANCE_AC',
    'AMBULANCE_AC_OXY',
    'AMBULANCE_VENTILATOR',
];

export const ChooseRideFlow: FC<ChooseRideProps> = ({
    showErrorStatesModal,
    hideAccessibility,
    setHideAccessibility,
    setIsScrolled,

    searchId,
    selectedMultimodalLeg,
    bookAnyVisible,
}) => {
    const {
        preSelectedSmartTip,
        enableMultimodal,
        showPublicTransportAboveEstimates,
        estimateCardsPositionConfig,
        showSeparateNammaTransit,
        showNammaTransitOnTop,
        enableUserRateCard,
    } = useAppSelector(selectNewFeatureFlags);
    const isAddTipSelected = useAppSelector(state => selectIsAddTipSelected(state, searchId));
    const isPetRide = useAppSelector(state => selectIsPetRide(state, searchId));
    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, searchId));
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const source = useAppSelector(selectSearchedSource);
    const destination = useAppSelector(selectDestination);
    const stopsWithNull = useAppSelector(selectSearchedStops);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const pricingItems = useAppSelector(state => selectPricingItems(state, searchId));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, searchId));
    const routeInfo = useAppSelector(state => selectRouteInfo(state, searchId));
    const tripDistance = useAppSelector(state => selectTripDistance(state, searchId));
    const searchWarning = useAppSelector(selectSearchWarning);
    const searchFailed = useAppSelector(selectSearchFailed);
    const fareProductType = useAppSelector(selectFareProductType);
    const userToken = useAppSelector(selectToken);
    const allCachedDestinations = useAppSelector(selectCachedDestinations);
    const pickupTime = useAppSelector(selectPickupTime);
    const dropTime = useAppSelector(selectDropTime);
    const rentalDuration = useAppSelector(selectRideDuration) ?? 3600;
    const rentalDistance = useAppSelector(selectRentalDistance);
    const screenReaderEnabled = useAppSelector(selectScreenReaderEnabled);
    const ambulanceServiceClicked = useAppSelector(selectAmbulanceServiceClicked);
    const journeys = useAppSelector(state => selectJourneys(state, null));
    const totalDuration = calculateTotalJourneyDurationWithConsistentRounding(journeys[0]?.journeyLegs || [], false);
    const selectedJourney = useAppSelector(state => selectSelectedJourney(state, null));
    const dispatch = useAppDispatch();
    const completeRouteInfo = useAppSelector(state => selectCompleteRouteInfo(state, null));
    const [isExpanded, setIsExpanded] = useState(false);
    const [showRateCardModal, setShowRateCardModal] = useState(false);
    const [selectedBookAnyPricingItems, setSelectedBookAnyPricingItems] = useState<PricingItemType[]>([]);
    const [selectedAmbulancePricingItems, setSelectedAmbulancePricingItems] = useState<PricingItemType[]>([]);
    const [selectedCard, setSelectedCard] = useState<null | PricingItemType>(null);
    const [stopPolling, setStopPolling] = useState(false);
    const pollingAttemptRef = useRef(0);
    const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const isScreenFocused = useIsFocused();
    const { sheetAnimatedPosition } = useAnimatedContextValues(undefined);
    const isInitialRouteRender = useRef(true);
    const { mapRef } = useContext(MapContext);
    useOnBottomSheetAnimate(
        sheetAnimatedPosition,
        useRef(true),
        {
            left: undefined,
            right: undefined,
            top: undefined,
            bottom: bottomPadOffset,
        },
        false,
    );
    const { removeRoute, drawEstimateRoute } = useMapRoute(null, undefined);
    const { stopLocationsTextInputRef, startLocationTextInputRef, bottomSheetTopBannerRef } = useRefsContext();
    const flowStatusValidated = useAppSelector(selectFlowStatusValidated);
    const { checkFlowStatus } = useFlowStatusHandler({ autoTrigger: false });
    const stops = stopsWithNull.filter((stop): stop is location => stop != null);
    const contextValues = useAnimatedContextValues(undefined);
    const enable = useRef(false);
    const appConfig = useAppSelector(selectAppConfig);
    const businessProfileConfig = appConfig.flowConfig.businessProfileConfig;
    const NAMMA_TRANSIT = appConfig.textConfig.publicTransitText;
    const { nammaTransitPosition, bookAnyPosition } = estimateCardsPositionConfig;
    const [rideSearch, { isSuccess: searchSuccessful }] = useSearchMutation();
    const isAddStop = stops.length > 1;

    const shouldStopPolling =
        (pricingItems.length > 0 && (journeys.length > 0 || !!selectedMultimodalLeg)) || stopPolling;

    const pollingConfigs = useMemo(
        () => [
            { count: 1, interval: 100 },
            { count: 1, interval: 1000 },
            { count: 10, interval: 300 },
            { count: 10, interval: 500 },
            { count: 10, interval: 1500 },
        ],
        [],
    );

    const specialAssistance = useAppSelector(selectSpecialAssistance);
    const userProfile = useAppSelector(selectUserProfile);
    const disabilityListRes = useAppSelector(selectDisabilityListResp);
    const temporarySpecialAssistanceTriggerRef = useRef(false);

    useEffect(() => {
        // Only restore if:
        // - specialAssistance is undefined (not explicitly turned off)
        // - user has disability in profile
        // - disability list is available
        if (
            specialAssistance === undefined &&
            userProfile?.hasDisability &&
            disabilityListRes &&
            !temporarySpecialAssistanceTriggerRef.current
        ) {
            const disabilityObj = disabilityListRes.find(item => item.tag === userProfile?.disability);
            dispatch(setSpecialAssistance({ id: userToken, payload: disabilityObj }));
        }
        temporarySpecialAssistanceTriggerRef.current = true;
    }, [disabilityListRes]); // Don't add more deps

    const pollingInterval = useAdaptivePolling({
        configs: pollingConfigs,
        pollingCounter: pollingAttemptRef.current,
        exponentialBase: 5,
        stop: shouldStopPolling,
    });

    const { data: searchResultsResp } = useSearchResultsQuery(
        {
            searchId,
            toastMessage: userLanguageStrings.lastChosenRideNotAvailable,
        },
        {
            skip: (!selectedMultimodalLeg && !searchSuccessful) || isNull(searchId),
            pollingInterval: pollingInterval,
        },
    );

    useEffect(() => {
        if (searchSuccessful && !stopPolling) {
            pollingAttemptRef.current = 0;
        }
    }, [searchSuccessful, stopPolling]);

    useEffect(() => {
        if (searchResultsResp && !stopPolling) {
            ++pollingAttemptRef.current;
        }
    }, [searchResultsResp?.apiTime, stopPolling]);

    useEffect(() => {
        if (
            (journeys.length > 0 || searchResultsResp?.data.allJourneysLoaded || isUndefined(searchResultsResp)) &&
            pricingItems.length > 0
        ) {
            setStopPolling(true);
        }
    }, [searchResultsResp?.data.allJourneysLoaded, pricingItems.length]);

    const updateSourceAndDestination = () => {
        dispatch(setSearchedSource(source));
        dispatch(setStartLocationFromTextInput((source?.title ?? '') + (source?.subtitle ?? '')));
        dispatch(updateSelectedStopLocationTextInput((destination?.title ?? '') + (destination?.subtitle ?? '')));
    };

    const onClickSource = () => {
        removeRoute('defaultRoute');
        resetIds(userToken, null, dispatch);
        updateSourceAndDestination();
        dispatch(setActiveInput(SearchInput.Source));
        bottomSheetTopBannerRef.current = false;
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'chseRdOnClickSource' }));
        startLocationTextInputRef.current?.setSelection(
            0,
            ((source?.title ?? '') + (source?.subtitle ?? '')).length + 1,
        );
    };

    const onClickDestination = () => {
        dispatch(setSourceSetUsingPin(false));
        removeRoute('defaultRoute');
        resetIds(userToken, null, dispatch);
        updateSourceAndDestination();
        dispatch(setActiveInput(SearchInput.Destination));
        bottomSheetTopBannerRef.current = false;
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'chseRdOnClickDestination' }));
        stopLocationsTextInputRef.current?.[stops.length - 1]?.setSelection(
            0,
            ((destination?.title ?? '') + (destination?.subtitle ?? '')).length + 1,
        );
    };

    const drawRoute = useCallback(() => {
        if (routeInfo && tripDistance && !searchFailed) {
            if (isInitialRouteRender.current && isNull(selectedMultimodalLeg)) {
                drawEstimateRoute({
                    coordinates: routeInfo || [],
                    sourceAddress: source ? getTitle(source) : undefined,
                    destAddress: destination ? getTitle(destination) : undefined,
                    onSourceClick: onClickSource,
                    onDestClick: onClickDestination,
                    showEditIcon: true,
                    destinationPoints: stops
                        .filter(stop => stop !== null)
                        .map(stop => ({
                            latitude: stop.lat !== undefined ? stop.lat : 0,
                            longitude: stop.lng !== undefined ? stop.lng : 0,
                        })),
                    destinationTitles: [],
                })
                    .then()
                    .catch(error => {
                        console.error('Error drawing route:', error);
                    });
                isInitialRouteRender.current = false;
            }
        }
    }, [routeInfo, tripDistance, searchFailed, source, destination, stops, onClickSource, onClickDestination]);

    const startPollingTimeout = useCallback(() => {
        // Reset previous timeout if exists
        if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
        }
        setStopPolling(false);
        pollingTimeoutRef.current = setTimeout(() => {
            setStopPolling(true);
            if (
                isScreenFocused &&
                searchResultsResp?.data.estimates.length === 0 &&
                searchResultsResp?.data.quotes.length === 0 &&
                (!searchResultsResp?.data.journey ||
                    (isArray(searchResultsResp?.data.journey) && searchResultsResp?.data.journey.length === 0))
            ) {
                console.error('Search API failed: ', searchResultsResp);
                dispatch(setSearchWarning(SearchWarningType.EstimatesNotAvailable));
                showErrorStatesModal(null);
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.SearchErrorStates, src: 'chseRd_noEstimates' }));
            }
            logEvent(EventName.NY_NO_ESTIMATES);
        }, 20000); // Stop polling after 20 seconds
    }, [
        searchResultsResp?.data.estimates,
        searchResultsResp?.data.quotes,
        showErrorStatesModal,
        pollingTimeoutRef.current,
        isScreenFocused,
    ]);

    useEffect(() => {
        return () => {
            bottomSheetTopBannerRef.current = false;
            setIsScrolled(false);
            if (pollingTimeoutRef.current) {
                clearTimeout(pollingTimeoutRef.current);
            }
        };
    }, []);

    const handleRideSearch = useCallback(
        /* eslint-disable myCustomPlugin/no-any-in-modified-files */
        async (searchParams: any) => {
            setStopPolling(false);
            dispatch(setPersistedTipOptions({ id: searchParams.searchId, payload: null }));
            dispatch(setPersistedSmartTipValue({ id: searchParams.searchId, payload: null }));
            rideSearch(searchParams).then(() => {
                logEvent(EventName.NY_USER_ESTIMATE, { search_id: searchParams.searchId });
                startPollingTimeout();
            });
        },
        [rideSearch, startPollingTimeout, dispatch],
    );

    const persistedTipOptions = useAppSelector(state => selectPersistedTipOptions(state, searchId));
    const shouldShowDefaultTips = useAppSelector(selectNewFeatureFlags).shouldShowDefaultTips;

    useEffect(() => {
        if (selectedPricingItems.length > 0 && (!persistedTipOptions || persistedTipOptions.length === 0)) {
            const tipOptionsToCache = calculateTipOptionsToPersist(selectedPricingItems, shouldShowDefaultTips);
            if (tipOptionsToCache.length > 0) {
                dispatch(setPersistedTipOptions({ id: searchId, payload: tipOptionsToCache }));

                const smartTipValue = selectedPricingItems[0]?.smartTipSuggestion?.value;
                if (smartTipValue) {
                    dispatch(setPersistedSmartTipValue({ id: searchId, payload: smartTipValue }));
                }
            }
        }
    }, [selectedPricingItems, searchId, dispatch, persistedTipOptions, shouldShowDefaultTips]);

    useEffect(() => {
        mapRef.current?.updateMarkerEditOption('routeEnd', true);
        mapRef.current?.updateMarkerEditOption('routeStart', true);
        return () => {
            mapRef.current?.updateMarkerEditOption('routeEnd', false);
            mapRef.current?.updateMarkerEditOption('routeStart', false);
        };
    }, []);

    useEffect(() => {
        if (!bookAnyVisible) {
            return;
        }
        mapRef.current?.changeAutoAnimationToCurrentLocation(false);
        mapRef.current?.addMapPadding({
            left: undefined,
            top: topPadding,
            right: undefined,
            bottom: 500,
        });
        updateSuggestedDestinations(source, stops[stops.length - 1], dispatch, userToken, allCachedDestinations);
        const cleverTapParams = {
            ny_user_enter_source: source,
            ny_user_enter_destination: stops,
        };
        const cleverTapParamsLatLon = {
            'Latest Search From': 'lat: ' + source?.lat + ' long: ' + source?.lng,
        };
        const cleverTapParamLatestSearch = {
            'Latest Search': new Date(),
        };
        logEvent(EventName.NY_USER_SOURCE_AND_DESTINATION, cleverTapParams);
        logEvent(EventName.NY_USER_SOURCE_AND_DESTINATION_7D, cleverTapParams);
        logEvent(EventName.NY_USER_SOURCE_AND_DESTINATION_30D, cleverTapParams);
        logEvent(EventName.NY_USER_SOURCE_AND_DESTINATION, cleverTapParamLatestSearch);
        logEvent(EventName.NY_USER_SOURCE_AND_DESTINATION_7D, cleverTapParamLatestSearch);
        logEvent(EventName.NY_USER_SOURCE_AND_DESTINATION_30D, cleverTapParamLatestSearch);
        CleverTap.profileSet(cleverTapParamsLatLon);
        if (flowStatusValidated || searchId === null) {
            dispatch(resetToastProps());

            if (!searchId) {
                handleRideSearch({
                    source,
                    stops,
                    pickupTime,
                    dropTime,
                    isInterCity: fareProductType === 'INTERCITY',
                    isFareProductOneway: fareProductType !== 'RENTAL',
                    rentalDuration,
                    rentalDistance,
                    isAmbulance: fareProductType === 'AMBULANCE',
                });
            }
        } else {
            checkFlowStatus();
            dispatch(
                setToastProps({
                    message: 'Please wait while we sync your details',
                    backgroundColor: '#FFA500',
                    visible: true,
                    logo: <ActivityIndicator size="large" color={colors.white} />,
                    buttons: [],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    onSpannedToastLoad: undefined,
                    autoDismissAfter: undefined,
                    margin: undefined,
                    dismissButton: () => {
                        dispatch(resetToastProps());
                    },
                    customToast: undefined,
                }),
            );
        }
    }, []);

    // Update useSearchExpiry to use handleRideSearch
    useSearchExpiry(handleRideSearch);
    // -----------------------------------------

    // Effect for handling warnings
    useEffect(() => {
        if (searchWarning === SearchWarningType.Acknowledged) {
            drawRoute();
            return;
        }

        if (searchWarning !== SearchWarningType.None) {
            return;
        }

        if (isScreenFocused && searchFailed) {
            dispatch(setSearchWarning(SearchWarningType.ApiError));
            showErrorStatesModal(null);
            dispatch(
                setBottomSheetStage({ stage: BottomSheetStage.SearchErrorStates, src: 'chseRd_noEstimates_wrng' }),
            );
        } else {
            drawRoute();
        }
    }, [searchFailed, routeInfo, isScreenFocused]);

    useEffect(() => {
        setIsExpanded(
            selectedCard?.serviceTierName === BOOK_ANY || selectedCard?.serviceTierName === AMBULANCE_SERVICE,
        );

        const bookAnySelectedItems =
            selectedCard?.serviceTierName === BOOK_ANY
                ? selectedPricingItems.length > 0
                    ? selectedPricingItems
                    : pricingItems
                          .filter(
                              item =>
                                  (!item.serviceTierType || isServiceTierTypeAvailable(item.serviceTierType)) &&
                                  (ambulanceServiceClicked
                                      ? item.serviceTierType && AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType)
                                      : !AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType ?? '')),
                          )
                          .slice(0, 3)
                : selectedPricingItems.length > 1
                  ? pricingItems
                        .filter(
                            item =>
                                (!item.serviceTierType || isServiceTierTypeAvailable(item.serviceTierType)) &&
                                (ambulanceServiceClicked
                                    ? item.serviceTierType && AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType)
                                    : !AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType ?? '')),
                        )
                        .slice(0, 3)
                  : undefined;
        if (bookAnySelectedItems && bookAnySelectedItems.length > 0 && isNull(selectedJourney)) {
            // Deep comparison to avoid infinite loops - compare by IDs
            const currentIds = selectedBookAnyPricingItems.map(item => item.id).sort();
            const newIds = bookAnySelectedItems.map(item => item.id).sort();
            const areArraysEqual =
                currentIds.length === newIds.length && currentIds.every((id, index) => id === newIds[index]);

            if (!areArraysEqual) {
                setSelectedBookAnyPricingItems(bookAnySelectedItems);
                dispatch(setSelectedPricingItems({ id: searchId, payload: bookAnySelectedItems }));
            }
        }
    }, [
        selectedPricingItems,
        selectedCard?.serviceTierName,
        pricingItems,
        searchId,
        selectedBookAnyPricingItems,
        dispatch,
    ]);

    useEffect(() => {
        if (!isNull(selectedJourney) && !isPetRide && selectedTripType !== 'BUSINESS') {
            if (selectedMultimodalLeg == undefined) {
                setSelectedCard(null);
            } else {
                const matchedItem = pricingItems.find(item => item.id === selectedMultimodalLeg?.pricingId);
                if (matchedItem) {
                    setSelectedCard(matchedItem);
                    dispatch(setSelectedPricingItems({ id: searchId, payload: [matchedItem] }));
                }
            }
        } else if (!selectedCard && pricingItems && pricingItems.length > 0) {
            const availablePricingItems = pricingItems.filter(
                item => !item.serviceTierType || isServiceTierTypeAvailable(item.serviceTierType),
            );

            if (availablePricingItems.length > 0) {
                const cardToSelect = availablePricingItems.at(0);
                setSelectedCard(cardToSelect ?? null);
                dispatch(setSelectedPricingItems({ id: searchId, payload: cardToSelect ? [cardToSelect] : [] }));
            }
        }
    }, [pricingItems, selectedMultimodalLeg?.pricingId, isPetRide, selectedTripType]);

    const publicTransportData: ChooseRideCardData | null = useMemo(() => {
        if (journeys[0])
            return [
                {
                    title: userLanguageStrings.PublicTransport,
                    data: [journeys[0]],
                    type: 'MULTIMODAL',
                },
            ];
        return null;
    }, [journeys]);

    const ambulancePricingItems =
        selectedAmbulancePricingItems.length > 0
            ? selectedAmbulancePricingItems
            : pricingItems.filter(
                  item => item.serviceTierType && AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType ?? ''),
              );

    const bookAnyPricingItems =
        selectedBookAnyPricingItems.length > 0
            ? selectedBookAnyPricingItems
            : pricingItems.some(item => item.tripCategory == TripCategory.OneWay && item.tripMode == TripMode.RideOtp)
              ? []
              : pricingItems
                    .filter(item => !item.serviceTierType || isServiceTierTypeAvailable(item.serviceTierType))
                    .slice(0, 3);
    const ambulanceServiceObject: PricingItemType[] =
        pricingItems.length > 0 &&
        ambulancePricingItems.length > 0 &&
        ambulancePricingItems[0] &&
        !selectedMultimodalLeg
            ? [
                  {
                      id: ambulancePricingItems[0].id,
                      tripMode: ambulancePricingItems[0].tripMode,
                      tripCategory: ambulancePricingItems[0].tripCategory,
                      serviceTierName: AMBULANCE_SERVICE,
                      serviceTierShortDesc: 'Emergency',
                      cost: Math.min(...(ambulancePricingItems?.map(i => i?.cost) ?? [])),
                      toCost: Math.max(...(ambulancePricingItems?.map(i => i?.toCost ?? 0) ?? [])),
                      minVehicleServiceTierSeatingCapacity: 1,
                      maxVehicleServiceTierSeatingCapacity: 2,
                      validTill: ambulancePricingItems[0].validTill,
                      vehicleIconUrl: ambulancePricingItems[0].vehicleIconUrl,
                      estimatedFareWithCurrency: ambulancePricingItems[0].estimatedFareWithCurrency,
                      expandedData: pricingItems
                          .filter(
                              item =>
                                  item.serviceTierType && AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType ?? ''),
                          )
                          .map(pricingItem => {
                              // Type guard to ensure vehicleVariant is a valid ServiceTierType_serviceTierType
                              const getValidServiceTierType = (
                                  variant: string | undefined,
                              ): ServiceTierType_serviceTierType => {
                                  if (!variant) return 'AMBULANCE_TAXI';
                                  return isServiceTierTypeAvailable(variant) ? variant : 'AMBULANCE_TAXI';
                              };

                              return {
                                  name: pricingItem?.serviceTierName !== undefined ? pricingItem.serviceTierName : '',
                                  value: pricingItem?.id !== undefined ? pricingItem.id : '',
                                  service: getValidServiceTierType(pricingItem?.serviceTierType),
                                  isAc: pricingItem?.isAirConditioned ?? false,
                                  // Enhanced data for detailed list view
                                  description: pricingItem?.serviceTierShortDesc || '',
                                  cost: pricingItem?.cost || 0,
                                  toCost: pricingItem?.toCost || pricingItem?.cost || 0,
                                  currency: pricingItem?.estimatedFareWithCurrency?.currency,
                                  vehicleIconUrl: pricingItem?.vehicleIconUrl,
                              };
                          }),
                      fareBreakup: ambulancePricingItems[0]?.fareBreakup,
                      isAirConditioned: true,
                      isValueAddNP: true,
                      isRoundTrip: false,
                      tipOptions: undefined,
                      smartTipSuggestion: {
                          value: undefined,
                          description: undefined,
                      },
                      vehicleVariant: undefined,
                      serviceTierType: undefined,
                      isInsured: ambulancePricingItems[0]?.isInsured,
                      businessDiscountInfo: undefined,
                  },
              ]
            : [];

    const minCostItem = bookAnyPricingItems?.reduce(
        (min, item) => ((item?.cost ?? Infinity) < (min?.cost ?? Infinity) ? item : min),
        bookAnyPricingItems?.[0],
    );

    const maxToCostItem = bookAnyPricingItems?.reduce(
        (max, item) => ((item?.toCost ?? 0) > (max?.toCost ?? 0) ? item : max),
        bookAnyPricingItems?.[0],
    );

    const bookAnyObject: PricingItemType[] =
        pricingItems.length > 0 && bookAnyPricingItems?.[0] && !selectedMultimodalLeg
            ? [
                  {
                      id: bookAnyPricingItems?.[0]?.id,
                      tripMode: TripMode.DynamicOffer,
                      tripCategory: TripCategory.OneWay,
                      serviceTierName: BOOK_ANY,
                      serviceTierShortDesc: ambulanceServiceClicked ? 'Emergency' : userLanguageStrings.BookInstantly,
                      cost: Math.min(...(bookAnyPricingItems?.map(i => i?.cost) ?? [])),
                      toCost: Math.max(...(bookAnyPricingItems?.map(i => i?.toCost ?? 0) ?? [])),
                      minVehicleServiceTierSeatingCapacity: bookAnyPricingItems
                          ? Math.min(
                                ...(bookAnyPricingItems?.map(i =>
                                    i?.minVehicleServiceTierSeatingCapacity
                                        ? i?.minVehicleServiceTierSeatingCapacity
                                        : ambulanceServiceClicked
                                          ? 2
                                          : 4,
                                ) ?? []),
                            )
                          : ambulanceServiceClicked
                            ? 1
                            : 4,
                      maxVehicleServiceTierSeatingCapacity: bookAnyPricingItems
                          ? Math.max(
                                ...(bookAnyPricingItems?.map(i =>
                                    i?.maxVehicleServiceTierSeatingCapacity
                                        ? i?.maxVehicleServiceTierSeatingCapacity
                                        : 4,
                                ) ?? []),
                            )
                          : ambulanceServiceClicked
                            ? 2
                            : 4,
                      validTill: bookAnyPricingItems?.[0]?.validTill,
                      vehicleIconUrl: bookAnyPricingItems?.[0]?.vehicleIconUrl,
                      estimatedFareWithCurrency: bookAnyPricingItems?.[0]?.estimatedFareWithCurrency,
                      expandedData: pricingItems
                          ?.filter(
                              pricingItem =>
                                  pricingItem?.serviceTierName !== undefined &&
                                  pricingItem.tripMode !== TripMode.RideOtp &&
                                  (!isPetRide ||
                                      pricingItem.fareBreakup?.some(
                                          fare => getFareType(fare.title).name === FareTypes.PET_CHARGES,
                                      )) &&
                                  (!pricingItem.serviceTierType ||
                                      isServiceTierTypeAvailable(pricingItem.serviceTierType)) &&
                                  (ambulanceServiceClicked
                                      ? pricingItem.serviceTierType &&
                                        AMBULANCE_SERVICE_TIERS.includes(pricingItem.serviceTierType)
                                      : !AMBULANCE_SERVICE_TIERS.includes(pricingItem.serviceTierType ?? '')),
                          )
                          ?.map(pricingItem => {
                              // Type guard to ensure vehicleVariant is a valid ServiceTierType_serviceTierType
                              const getValidServiceTierType = (
                                  variant: string | undefined,
                              ): ServiceTierType_serviceTierType => {
                                  if (!variant) return ambulanceServiceClicked ? 'AMBULANCE_TAXI' : 'SEDAN';
                                  return isServiceTierTypeAvailable(variant)
                                      ? variant
                                      : ambulanceServiceClicked
                                        ? 'AMBULANCE_TAXI'
                                        : 'SEDAN';
                              };

                              return {
                                  name: pricingItem?.serviceTierName !== undefined ? pricingItem.serviceTierName : '',
                                  value: pricingItem?.id !== undefined ? pricingItem.id : '',
                                  service: getValidServiceTierType(
                                      ambulanceServiceClicked
                                          ? pricingItem?.serviceTierType
                                          : pricingItem?.vehicleVariant,
                                  ),
                                  isAc: pricingItem?.isAirConditioned ?? false,
                                  // Enhanced data for ambulance detailed list view
                                  description: ambulanceServiceClicked
                                      ? pricingItem?.serviceTierShortDesc || ''
                                      : undefined,
                                  cost: ambulanceServiceClicked ? pricingItem?.cost || 0 : undefined,
                                  toCost: ambulanceServiceClicked
                                      ? pricingItem?.toCost || pricingItem?.cost || 0
                                      : undefined,
                                  currency: ambulanceServiceClicked
                                      ? pricingItem?.estimatedFareWithCurrency?.currency
                                      : undefined,
                                  vehicleIconUrl: ambulanceServiceClicked ? pricingItem?.vehicleIconUrl : undefined,
                              };
                          }),
                      fareBreakup: bookAnyPricingItems?.[0]?.fareBreakup,
                      isAirConditioned: true,
                      isValueAddNP: true,
                      isRoundTrip: false,
                      tipOptions: undefined,
                      smartTipSuggestion: {
                          value: undefined,
                          description: undefined,
                      },
                      vehicleVariant: undefined,
                      serviceTierType: undefined,
                      isInsured: bookAnyPricingItems?.[0]?.isInsured,
                      businessDiscountInfo: bookAnyPricingItems?.[0]?.businessDiscountInfo
                          ? {
                                businessDiscount: minCostItem?.businessDiscountInfo?.businessDiscount || 0,
                                businessDiscountPercentage:
                                    bookAnyPricingItems[0].businessDiscountInfo.businessDiscountPercentage,
                                businessDiscountWithCurrency:
                                    bookAnyPricingItems[0].businessDiscountInfo.businessDiscountWithCurrency,
                                maxBusinessDiscount: maxToCostItem?.businessDiscountInfo?.businessDiscount || 0,
                            }
                          : undefined,
                  },
              ]
            : [];
    const nammaTravelObject: PricingItemType[] = createNammaTravelObject(journeys, NAMMA_TRANSIT);

    const pricingItemsData: ChooseRideCardData = useMemo(() => {
        if (pricingItems.length === 0) return null;

        const filteredPricingItems = (
            isPetRide
                ? pricingItems.filter(item =>
                      item.fareBreakup?.some(fare => getFareType(fare.title).name === FareTypes.PET_CHARGES),
                  )
                : pricingItems
        ).filter(item => {
            if (item.serviceTierType && !isServiceTierTypeAvailable(item.serviceTierType)) {
                return false;
            }

            // If ambulance service was clicked, only show ambulance service variants
            if (ambulanceServiceClicked) {
                return item.serviceTierType && AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType);
            }

            // Filter out individual ambulance service tiers when ambulanceServiceObject exists
            if (
                ambulanceServiceObject.length > 0 &&
                item.serviceTierType &&
                AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType)
            ) {
                return false;
            }
            return true;
        });

        // Sort filteredPricingItems for business rides based on businessEstimatedOrder
        const sortedPricingItems =
            selectedTripType === 'BUSINESS' && businessProfileConfig?.businessEstimatedOrder?.length
                ? [...filteredPricingItems].sort((a, b) => {
                      const order = businessProfileConfig.businessEstimatedOrder;
                      const serviceTierA = a.serviceTierType;
                      const serviceTierB = b.serviceTierType;

                      if (!serviceTierA && !serviceTierB) return 0;
                      if (!serviceTierA) return 1;
                      if (!serviceTierB) return -1;

                      const indexA = order.findIndex(tier => tier === serviceTierA);
                      const indexB = order.findIndex(tier => tier === serviceTierB);

                      if (indexA !== -1 && indexB !== -1) {
                          return indexA - indexB;
                      }
                      if (indexA !== -1) return -1;
                      if (indexB !== -1) return 1;
                      return 0;
                  })
                : filteredPricingItems;

        const getNammaTravelObject: () => PricingItemType[] | undefined[] = () => {
            // Don't show Namma Transit for business rides
            if (selectedTripType === 'BUSINESS') {
                return [];
            }
            if (!showSeparateNammaTransit) {
                if (
                    bookAnyVisible &&
                    enableMultimodal &&
                    !isPetRide &&
                    fareProductType !== 'INTERCITY' &&
                    fareProductType !== 'RENTAL' &&
                    fareProductType !== 'AMBULANCE' &&
                    !ambulanceServiceClicked &&
                    !isAddStop
                ) {
                    if (publicTransportData) return nammaTravelObject;
                    else if (stopPolling) return [];
                    else return [undefined];
                }
                return [];
            }
            return [];
        };
        const nammaTravel = getNammaTravelObject();
        const isNammaTransitLoading = nammaTravel.some(item => item === undefined);

        if (!showNammaTransitOnTop) {
            // Original behavior: add everything to finalData
            const finalData: (PricingItemType | undefined)[] = [...sortedPricingItems];

            // Add ambulance service object at configured position if available
            // if (ambulanceServiceObject.length > 0) { // Deprecated as per new design
            //     finalData.splice(ambulanceServicePosition, 0, ...ambulanceServiceObject);
            //     console.log('Added Ambulance Service Object at position', ambulanceServicePosition, 'of finalData: ', finalData);
            // }

            if (nammaTransitPosition < bookAnyPosition) {
                /* eslint-disable functional/immutable-data */
                finalData.splice(nammaTransitPosition, 0, ...nammaTravel);

                if (bookAnyObject.length > 0) {
                    finalData.splice(bookAnyPosition, 0, ...bookAnyObject);
                }
            } else {
                finalData.splice(bookAnyPosition, 0, ...bookAnyObject);
                finalData.splice(nammaTransitPosition, 0, ...nammaTravel);
            }

            return [
                {
                    type: 'NORMAL',
                    title: userLanguageStrings.Ridesforyou,
                    data: finalData,
                },
            ];
        } else {
            // When showing Bharat Transit on top, handle sections separately
            const finalData: (PricingItemType | undefined)[] = [...sortedPricingItems];

            // Add Book Any to finalData if needed
            if (bookAnyObject.length > 0) {
                finalData.splice(bookAnyPosition, 0, ...bookAnyObject);
            }

            // Get actual Bharat Transit cards (not undefined loading items)
            const actualNammaTransitCards = nammaTravel.filter(item => item?.serviceTierName === NAMMA_TRANSIT);
            const hasNammaTransit = actualNammaTransitCards.length > 0;

            if (hasNammaTransit || isNammaTransitLoading) {
                // Transit section data: actual cards or loading shimmer
                const transitData = isNammaTransitLoading && !hasNammaTransit ? [undefined] : actualNammaTransitCards;

                // Regular rides section: everything except Bharat Transit
                const regularRideOptions = finalData.filter(item => item?.serviceTierName !== NAMMA_TRANSIT);

                return [
                    {
                        type: 'NORMAL',
                        title: userLanguageStrings.SaveTimeAndMoney,
                        data: transitData,
                    },
                    {
                        type: 'NORMAL',
                        title: userLanguageStrings.Loadingridesforyou,
                        data: regularRideOptions,
                    },
                ];
            } else {
                return [
                    {
                        type: 'NORMAL',
                        title: userLanguageStrings.Ridesforyou,
                        data: finalData,
                    },
                ];
            }
        }
    }, [
        pricingItems,
        bookAnyObject,
        NAMMA_TRANSIT,
        isPetRide,
        nammaTravelObject,
        bookAnyVisible,
        enableMultimodal,
        fareProductType,
        stopPolling,
        publicTransportData,
        nammaTransitPosition,
        bookAnyPosition,
        showNammaTransitOnTop,
        showSeparateNammaTransit,
        userLanguageStrings.SaveTimeAndMoney,
        userLanguageStrings.Loadingridesforyou,
        userLanguageStrings.Ridesforyou,
        isAddStop,
        selectedTripType,
        businessProfileConfig,
    ]);
    const LOADING_DATA: LoadingCardData = [
        {
            title: userLanguageStrings.Loadingridesforyou,
            data: [undefined, undefined, undefined, undefined, undefined, undefined, undefined],
            type: 'NORMAL',
        },
    ];
    const loadingData: LoadingCardData = useMemo(() => LOADING_DATA, []);

    const derivedAddTipState = useDerivedValue(() =>
        isAddTipSelected
            ? withSpring(1, { damping: 40, stiffness: 300 })
            : withSpring(0, { damping: 40, stiffness: 300 }),
    );

    const selectPublicTransportItem = useCallback(
        (_index: number, currentJourney: journeyData) => {
            setSelectedCard(null);
            dispatch(setSelectedJourney({ id: searchId, payload: currentJourney }));
        },
        [searchId],
    );

    const selectCardEstimate = (_index: number, currentCard: PricingItemType) => {
        setSelectedCard(currentCard);
        if (currentCard?.serviceTierName === BOOK_ANY) {
            const validSelectedItems = selectedBookAnyPricingItems.filter(
                item => !item.serviceTierType || isServiceTierTypeAvailable(item.serviceTierType),
            );

            logger.logInfo(
                `SearchId: ${searchId} - Selected BookAny -> ${validSelectedItems.map(v => v.serviceTierName).join(',')}`,
                'BookingFlow',
            );
            handleSmartTipSuggestion(dispatch, searchId, validSelectedItems[0], preSelectedSmartTip);
            dispatch(
                setSelectedPricingItems({
                    id: searchId,
                    payload: validSelectedItems,
                }),
            );
        } else if (currentCard?.serviceTierName === AMBULANCE_SERVICE) {
            // Don't pre-select any ambulance items - let user make the selection
            const validSelectedItems = selectedAmbulancePricingItems.length > 0 ? selectedAmbulancePricingItems : []; // Start with no selection
            setSelectedAmbulancePricingItems(validSelectedItems);
            dispatch(
                setSelectedPricingItems({
                    id: searchId,
                    payload: validSelectedItems,
                }),
            );
        } else {
            if (currentCard?.serviceTierType && !isServiceTierTypeAvailable(currentCard.serviceTierType)) {
                return;
            }

            logger.logInfo(
                `SearchId: ${searchId} - Selected Normal Estimate -> ${currentCard?.serviceTierName}`,
                'BookingFlow',
            );
            handleSmartTipSuggestion(dispatch, searchId, currentCard, preSelectedSmartTip);
            dispatch(
                setSelectedPricingItems({
                    id: searchId,
                    payload: [currentCard],
                }),
            );
        }
    };

    const mapId = mapRef.current?.mapId ?? 'MapBeforeRide';
    const nearbyDrivers = useAppSelector(state => selectNearbyDrivers(state, mapId), shallowEqual);
    const nearbyDriversConfig = useAppSelector(selectNearbyDriversConfig, shallowEqual);
    const { getDrivers } = useNearbyDrivers();

    useEffect(() => {
        if (
            currentLocation?.lat !== source?.lat &&
            currentLocation?.lng !== source?.lng &&
            source?.lat !== undefined &&
            source?.lng !== undefined &&
            nearbyDriversConfig.enabled &&
            !(Platform.OS === 'android' && !nearbyDriversConfig.androidEnabled)
        ) {
            getDrivers(source?.lat, source?.lng);
        }
    }, [currentLocation?.lat, currentLocation?.lng, source?.lat, source?.lng]);

    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;

        const tier = selectedCard?.serviceTierType;
        if (!tier) {
            map.removeNearbyMarkers();
            return;
        }

        const data = nearbyDrivers?.nearbyDrivers;
        if (!data || data.buckets.length === 0) {
            map.removeNearbyMarkers();
            return;
        }
        console.info('vehicle tier', tier);
        const vehicleVariant = data.serviceTierTypeToVehicleVariant[tier];
        const finalVehicleVariant = tier === 'TAXI' ? 'SEDAN' : vehicleVariant;
        console.info('final vehicle variant', finalVehicleVariant);
        if (finalVehicleVariant) {
            map.updateNearbyMarkers(data, finalVehicleVariant, true);
        }
    }, [
        mapRef.current,
        selectedCard?.serviceTierName,
        nearbyDrivers?.nearbyDrivers?.serviceTierTypeToVehicleVariant,
        nearbyDrivers?.nearbyDrivers?.buckets,
    ]);

    const onArrowClick = useCallback(
        (index: number, currentCard: PricingItemType) => {
            setIsExpanded(oldVal => !oldVal);
            selectCardEstimate(index, currentCard);
        },
        [setIsExpanded, selectCardEstimate],
    );

    const onCardPress = useCallback(
        (index: number, currentCard: PricingItemType) => {
            if (currentCard.serviceTierName === NAMMA_TRANSIT && journeys[0]) {
                logEvent(EventName.USER_SELECTED_NAMMA_TRANSIT_ESTIMATE);
                dispatch(setSelectedJourney({ id: searchId, payload: journeys[0] }));
                setSelectedCard(currentCard);
                return;
            }
            setIsExpanded(
                selectedCard?.serviceTierName !== BOOK_ANY && currentCard?.serviceTierName === BOOK_ANY
                    ? true
                    : isExpanded,
            );
            selectCardEstimate(index, currentCard);
        },
        [isExpanded, selectedCard?.serviceTierName, selectCardEstimate],
    );

    // Get available service tier names from pricing data
    const availableOptions = pricingItemsData
        ? pricingItemsData.flatMap(section =>
              section.type === 'NORMAL' ? section.data.map(item => item?.serviceTierName) : [],
          )
        : [];

    useAnimatedReaction(
        () => ({
            sheetPosition: contextValues.sheetAnimatedIndex.value,
        }),
        (newSheetPosition, prevSheetPosition) => {
            if (newSheetPosition.sheetPosition === 0 && prevSheetPosition && prevSheetPosition.sheetPosition === 0)
                enable.current = true;

            if (enable.current) {
                if (prevSheetPosition && newSheetPosition.sheetPosition > prevSheetPosition?.sheetPosition)
                    runOnJS(setIsScrolled)(true);
                else runOnJS(setIsScrolled)(false);
            }
        },
    );

    // Memoize to prevent new array reference on every render
    const defaultSelectedExpandedData = useMemo(() => {
        return (
            selectedBookAnyPricingItems
                ?.map(defaultItem => defaultItem.id)
                .filter((id): id is string => typeof id === 'string') || []
        );
    }, [selectedBookAnyPricingItems]);

    const bookAnyImage = (fareProductType: string | null, pricingItems: PricingItemType[]) => {
        const isAutoIncluded = pricingItems.some(
            item => item.serviceTierType === 'AUTO_RICKSHAW' || item.serviceTierType === 'EV_AUTO_RICKSHAW',
        );
        const isBikeIncluded = pricingItems.some(
            item => item.serviceTierType === 'BIKE' || item.serviceTierType === 'BIKE_DELIVERY',
        );
        const mtICBookAnyBike = {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vehicle_icons/img-bookany_bikesedan-1761641814504.webp',
        };
        const mtICBookAny = {
            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vehicle_icons/img-bookany_minisedan-1763638636351.webp',
        };

        if (fareProductType === 'AMBULANCE' || ambulanceServiceClicked) return mtIcBookAnyAmbulance;
        else if (isAutoIncluded) return mtICBookAny;
        else if (isBikeIncluded) return mtICBookAnyBike;
        return mtICBookAny;
    };

    const getBusinessDiscountAmount = useCallback(
        (item?: PricingItemType): number => {
            if (!item || selectedTripType !== 'BUSINESS' || !item.businessDiscountInfo) {
                return 0;
            }
            return item.businessDiscountInfo.businessDiscount || 0;
        },
        [selectedTripType],
    );

    const renderPriceItem: RenderItems = useCallback(
        ({ item, index }: { item: unknown; index: number }) => {
            if (!item) return <CardEstimatesShimmer />;

            // Type guard to ensure item is a PricingItemType
            const isPricingItemType = (obj: unknown): obj is PricingItemType => {
                return typeof obj === 'object' && obj !== null && 'serviceTierName' in obj;
            };

            if (!isPricingItemType(item)) return <CardEstimatesShimmer />;
            const value = item;
            const isSelected =
                selectedCard == null
                    ? selectedJourney && !isPetRide && selectedTripType !== 'BUSINESS'
                        ? false
                        : index === 0
                    : selectedCard?.serviceTierName === value?.serviceTierName;

            // Adjust cost for pet ride
            const petCharges = value?.fareBreakup?.find(val => getFareType(val.title).name === FareTypes.PET_CHARGES)
                ?.priceWithCurrency.amount;
            const adjustedCost = adjustPriceForPetRide(value?.cost, isPetRide, petCharges);
            const adjustedToCost =
                value?.toCost === value?.cost
                    ? adjustedCost
                    : adjustPriceForPetRide(value?.toCost, isPetRide, petCharges);

            const businessDiscountAmount = getBusinessDiscountAmount(value);
            const hasBusinessDiscount = businessDiscountAmount > 0 && selectedTripType === 'BUSINESS';

            const isBookAny = value?.serviceTierName === BOOK_ANY;
            const maxBusinessDiscountAmount = isBookAny
                ? value?.businessDiscountInfo?.maxBusinessDiscount || businessDiscountAmount
                : businessDiscountAmount;

            const discountedCost =
                hasBusinessDiscount && typeof adjustedCost === 'number'
                    ? Math.max(0, adjustedCost - businessDiscountAmount)
                    : adjustedCost;
            const discountedToCost =
                hasBusinessDiscount && typeof adjustedToCost === 'number'
                    ? Math.max(0, adjustedToCost - maxBusinessDiscountAmount)
                    : adjustedToCost;

            return (
                <CardEstimates
                    isSelected={isSelected}
                    imgSrc={
                        value?.serviceTierName === NAMMA_TRANSIT
                            ? mtIcMetro
                            : value?.serviceTierName === BOOK_ANY
                              ? bookAnyImage(fareProductType, pricingItems) // Fallback, custom component will override
                              : value?.serviceTierName === AMBULANCE_SERVICE
                                ? mtIcBookAnyAmbulance
                                : value?.vehicleIconUrl
                                  ? { uri: value?.vehicleIconUrl }
                                  : require('@/typescript/assets/ny-service/mt_ic_car_corolla.webp')
                    }
                    // customImageComponent={
                    //     value?.serviceTierName === BOOK_ANY ? (
                    //         <AlternatingImageComponent
                    //             autoImageSrc={mtIcAutoNew}
                    //             cabImageSrc={require('@/typescript/assets/ny-service/mt_ic_car_ride_complete.webp')}
                    //         />
                    //     ) : undefined
                    // }
                    imgSrcSelected={getVehicleImageSrcSelected(
                        value?.serviceTierName,
                        value?.vehicleIconUrl,
                        availableOptions,
                    )}
                    title={value?.serviceTierName}
                    titleIcon={undefined}
                    description={value?.serviceTierShortDesc}
                    count={
                        value?.minVehicleServiceTierSeatingCapacity == value?.maxVehicleServiceTierSeatingCapacity
                            ? value?.minVehicleServiceTierSeatingCapacity
                            : value?.minVehicleServiceTierSeatingCapacity +
                              ' - ' +
                              value?.maxVehicleServiceTierSeatingCapacity
                    }
                    currency={value?.estimatedFareWithCurrency?.currency}
                    // time={value?.estimatedPickupDuration}
                    cost={discountedCost}
                    originalCost={hasBusinessDiscount ? adjustedCost : undefined}
                    originalToCost={hasBusinessDiscount ? adjustedToCost : undefined}
                    index={index}
                    isAnimate={false}
                    onPress={() => onCardPress(index, value)}
                    defaultSelectedExpandedData={defaultSelectedExpandedData}
                    onTagSelect={tagData => {
                        if (value?.serviceTierName === AMBULANCE_SERVICE) {
                            // Handle ambulance service selection
                            const data = pricingItems
                                .filter(item => tagData.includes(item.id))
                                .filter(
                                    item =>
                                        item.serviceTierType &&
                                        AMBULANCE_SERVICE_TIERS.includes(item.serviceTierType ?? ''),
                                );
                            setSelectedAmbulancePricingItems(data);
                            dispatch(setSelectedPricingItems({ id: searchId, payload: data }));
                        } else {
                            // Handle book any selection
                            const data = pricingItems
                                .filter(item => tagData.includes(item.id))
                                .filter(
                                    item => !item.serviceTierType || isServiceTierTypeAvailable(item.serviceTierType),
                                );
                            setSelectedBookAnyPricingItems(data);
                            dispatch(setSelectedPricingItems({ id: searchId, payload: data }));
                        }
                    }}
                    isExpanded={
                        (selectedCard?.serviceTierName === BOOK_ANY ||
                            selectedCard?.serviceTierName === AMBULANCE_SERVICE) &&
                        isExpanded
                    }
                    expandedData={value.expandedData || undefined}
                    onRateCardPress={
                        value?.serviceTierName === BOOK_ANY
                            ? undefined
                            : () => {
                                  if (screenReaderEnabled) {
                                      setHideAccessibility(true);
                                  }
                                  setShowRateCardModal(true);
                              }
                    }
                    showRateCardInfoIcon={
                        enableUserRateCard &&
                        value?.serviceTierName != BOOK_ANY &&
                        value?.serviceTierName != AMBULANCE_SERVICE &&
                        value?.fareBreakup &&
                        isSelected &&
                        value?.tripMode !== TripMode.RideOtp && // Disbaling Rate Card for RideOtp Flows (not showing slab based fares as its too confusing)
                        fareProductType !== 'AMBULANCE'
                    }
                    time={undefined}
                    allowMultipleSelect={undefined}
                    style={undefined}
                    dividerType={undefined}
                    disabled={false}
                    isNammaTransit={value?.serviceTierName === NAMMA_TRANSIT}
                    journeyDuration={value?.serviceTierName === NAMMA_TRANSIT ? totalDuration : journeys[0]?.duration}
                    isBookAny={value?.serviceTierName === BOOK_ANY}
                    isAmbulance={fareProductType === 'AMBULANCE'}
                    listLikeExpandedState={value?.serviceTierName === AMBULANCE_SERVICE}
                    showDiscountedPrice={hasBusinessDiscount}
                    toCost={discountedToCost}
                />
            );
        },
        [
            pricingItemsData,
            selectedCard?.serviceTierName,
            onArrowClick,
            selectedJourney,
            onCardPress,
            defaultSelectedExpandedData,
            isExpanded,
            screenReaderEnabled,
            pricingItems,
            searchId,
            dispatch,
            isPetRide,
            getBusinessDiscountAmount,
        ],
    );

    const showEstimatedDistanceAndDuration = (
        selectedMultimodalLeg: SelectedMultimodalLeg | null,
    ): { duration: number | undefined; distance: number | undefined } => {
        return {
            duration: selectedMultimodalLeg ? selectedMultimodalLeg?.duration : completeRouteInfo?.duration,
            distance: selectedMultimodalLeg ? selectedMultimodalLeg?.distance : completeRouteInfo?.distance,
        };
    };

    const { duration, distance } = showEstimatedDistanceAndDuration(selectedMultimodalLeg);
    const selectJourneyFilter = (option: JourneyFilterOptions) => {
        dispatch(
            setSelectedJourneyFilter({
                id: searchId,
                payload: option || JourneyFilterOptions.Most_Relevant,
            }),
        );
    };

    const journeyLoadData: LoadingCardData = useMemo(
        () => [
            {
                title: userLanguageStrings.PublicTransport,
                data: [undefined],
                type: 'MULTIMODAL',
            },
        ],
        [],
    );

    const sectionData: (ChooseRideCardType | LoadingCardType)[] = useMemo(() => {
        const getJourneyData = () => {
            // Don't show Namma Transit for business rides
            if (selectedTripType === 'BUSINESS') {
                return [];
            }
            if (
                bookAnyVisible &&
                enableMultimodal &&
                !isPetRide &&
                fareProductType !== 'INTERCITY' &&
                fareProductType !== 'RENTAL' &&
                showSeparateNammaTransit &&
                !isAddStop
            ) {
                if (publicTransportData) return publicTransportData;
                else if (stopPolling) return [];
                else return journeyLoadData;
            }
            return [];
        };
        const journeyData = getJourneyData();
        if (showPublicTransportAboveEstimates) {
            return [...journeyData, ...(pricingItemsData ?? loadingData)];
        } else {
            return [...(pricingItemsData ?? loadingData), ...journeyData];
        }
    }, [
        bookAnyVisible,
        enableMultimodal,
        isPetRide,
        publicTransportData,
        stopPolling,
        journeyLoadData,
        pricingItemsData,
        loadingData,
        isAddStop,
        selectedTripType,
    ]);
    const hasLoggedNammaTransitEstimate = useRef(false);
    useEffect(() => {
        if (!hasLoggedNammaTransitEstimate.current && journeys && journeys.length > 0) {
            logEvent(EventName.USER_GOT_NAMMA_TRANSIT_ESTIMATE);
            hasLoggedNammaTransitEstimate.current = true;
        }
    }, [journeys]);

    const renderPublicTransportOptions: RenderItems = useCallback(
        ({ item, index }: { item: unknown; index: number }) => {
            // Type guard to ensure item is a journeyData
            const isJourneyData = (obj: unknown): obj is journeyData => {
                return typeof obj === 'object' && obj !== null && 'journeyLegs' in obj && 'duration' in obj;
            };

            if (item && isJourneyData(item)) {
                const value = item;
                const legs = value.journeyLegs.map(leg => {
                    return {
                        type: mapModeToTransitType(leg.journeyMode, undefined),
                        duration: (leg.duration && Math.round(leg.duration / 60)) || null,
                    };
                });
                return (
                    <PublicTransportCard
                        handleOnPress={() => selectPublicTransportItem(index, value)}
                        cost={value.totalMaxFare || value.totalMinFare || 0}
                        duration={formatTimeFromSeconds(value.duration, true, userLanguageStrings)}
                        journey={legs}
                        isSelected={!isNull(selectedJourney)}
                        selectJourneyFilter={selectJourneyFilter}
                    />
                );
            }
            return <></>;
        },
        [publicTransportData, selectedJourney],
    );

    const goToJourneyOption = () =>
        navigation.navigate('HomeTab', {
            screen: 'journeyOptions',
        });

    const chooseRideViewState: ChooseRideViewProps = {
        derivedAddTipState,
        hideAccessibility,
        setHideAccessibility,
        pricingItemsData,
        loadingData,
        screenReaderEnabled,
        selectedCard,
        renderPriceItem,
        duration,
        distance,
        bookAnyVisible,
        selectedJourney,
        journeys,
        isAddStop,
        selectJourneyFilter,
        goToJourneyOption,
        selectPublicTransportItem,
        hasMultiModalView: selectedMultimodalLeg ? true : false,
        appConfig,
        enableMultimodal,
        showPublicTransportAboveEstimates,
        stopPolling,
        fareProductType: fareProductType ?? undefined,
        publicTransportData,
        renderPublicTransportOptions,
        sectionData,
        showRateCardModal,
        setShowRateCardModal,
    };

    return <ChooseRideView {...chooseRideViewState} />;
};

export const MemoizedChooseRideFlow = React.memo(ChooseRideFlow);
