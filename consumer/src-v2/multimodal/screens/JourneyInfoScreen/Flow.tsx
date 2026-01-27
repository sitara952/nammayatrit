import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { JourneyDetailScreenProps, JourneyDetailScreenAction, PopUpType } from './Types';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PublicTransitOverview } from './UI.tsx';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import {
    BottomSheetStage,
    clearSession,
    selectAppConfig,
    selectAppName,
    selectCurrentLocation,
    selectDestination,
    selectNewFeatureFlags,
    selectSearchedSource,
    setBottomSheetStage,
    setHideLoader,
    setSearchedSource,
} from '@/typescript/state/client/session.ts';
import {
    selectSelectedJourney,
    selectSelectedPricingItems,
    setSelectedModesFilter,
    selectCompleteRouteInfo,
} from '@/typescript/state/client/search.ts';
import { MapContext } from '@/typescript/Maps/MapContext.tsx';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { isNull, isUndefined } from 'lodash';
import { selectSearchId } from '@/typescript/state/client/user.ts';

import { MainNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import { useJourneyInfoPolling } from '../../hooks/useJourneyInfoPolling.ts';
import { JourneyDetailsProps } from './index.tsx';
import { useMultimodalUserPreferencesGetQuery } from '@/api/integrations/rtk/MultimodalUserPreferencesGet';
import { useVehicleTierOptions } from './hooks/useVehicleTierOptions.ts';
import { canBookLeg } from '@/typescript/utils/LegStatusUtils';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils.ts';
import { useSwitchLegs } from './hooks/useSwitchLegs';
import { useBusTrackingLogic } from '../../hooks/useBusTrackingLogic';
import { logger } from '@/src-v2/systems/logger/index';
import { useTimetables, getNextTwoTimes } from '../../hooks/useTimetables.ts';
import { TimeEntry } from '../NewLiveJourney/screens/TransitTracking/TransitTimetable.tsx';
import { createLegOrder } from '../../utils/journeyTrackingUtils';
import { NewTimeTableUIProps } from '@/src-v2/multimodal/screens/NewTimeTable/types';
import { mmEstimateRouteType } from '@/typescript/Maps/MapType.tsx';
import { calculateCumulativeTimeUpToLeg } from './utils';
import { useJourneyPayment } from '../../components/JourneyPayment/hooks/useJourneyPayment.ts';
import { JourneyPaymentUI } from '../../components/JourneyPayment/UI.tsx';
import { PaymentConfirmArgs } from '../../components/JourneyPayment/Types';
import { resetIds } from '@/typescript/state/sharedReducer.ts';
import { selectToken } from '@/typescript/state/client/auth.ts';
import { calculateAndUpdateLegsWithConsistentRounding } from './utils';
import { formatTime } from '../NewTimeTable/timeUtils.ts';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen.tsx';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen.tsx';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { logSuffixEvent } from '@/typescript/utils/logger.ts';
import { EventSuffix } from '@/typescript/utils/loggerEnums.ts';
import { FarAwayModal } from './components/FarAwayModal';
import { getDistanceBwCordinatesInKm } from '@/typescript/utils/location';

const JourneyDetail_: React.FC<JourneyDetailsProps> = props => {
    const dispatch = useAppDispatch();
    const currentLocation = useAppSelector(selectCurrentLocation);
    const [loadingDataForLeg, setLoadingDataForLeg] = useState<number | null>(null);
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const destination = useAppSelector(selectDestination);
    const source = useAppSelector(selectSearchedSource);
    const appName = useAppSelector(selectAppName);
    const appConfig = useAppSelector(selectAppConfig);
    const { farAwayDistanceThresholdKm } = useAppSelector(selectNewFeatureFlags);
    const userToken = useAppSelector(selectToken);

    const searchId = useAppSelector(state => selectSearchId(state, null));
    const _currentJourney = useAppSelector(state => selectSelectedJourney(state, searchId));
    const _isSingleMode: boolean =
        !isUndefined(props?.originStop) && !isUndefined(props?.destinationStop) && !isUndefined(props?.vehicleType);
    const isSingleModeRef = useRef<boolean>(_isSingleMode);

    const currentJourney = useMemo(() => {
        if (!_currentJourney) {
            return null;
        }
        if (_isSingleMode) {
            return {
                ..._currentJourney,
                journeyLegs: _currentJourney.journeyLegs?.filter(leg => !['Walk', 'Taxi'].includes(leg.journeyMode)),
                modes: _currentJourney.modes?.filter(mode => !['Walk', 'Taxi'].includes(mode)),
            };
        } else {
            return _currentJourney;
        }
    }, [_currentJourney, _isSingleMode]);

    const { vehicleOptionsModalRef, viaPointsModalRef } = useRefsContext();
    const { getRouteByCode, getStationByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });
    const { rideOptionModalRef, autoInfoModalRef } = useRefsContext();
    const { mapRef } = useContext(MapContext);

    const hasSetInitialPreferences = useRef(false);
    const { data: userPreferences } = useMultimodalUserPreferencesGetQuery({});
    const [isJourneyConfirmed, setIsJourneyConfirmed] = useState<boolean>(false);
    const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
    const [isSwitchPopupOpen, setIsSwitchPopupOpen] = useState<boolean>(false);
    const [isViaModalShown, setIsViaModalShown] = useState<boolean>(false);
    const [isJourneyInfoModalVisible, setIsJourneyInfoModalVisible] = useState<boolean>(false);
    const [pendingBookingArgs, setPendingBookingArgs] = useState<PaymentConfirmArgs | null>(null);
    const farAwayModalRef = useRef<BottomSheetModal>(null);

    const onNoJourneysFound = useCallback(() => {
        setIsJourneyInfoModalVisible(true);
    }, [setIsJourneyInfoModalVisible]);

    const {
        pollJourneyInfo,
        journeyInfoData,
        setJourneyInfoData,
        setPollJourneyInfo,
        showMultimodalWarning,
        multimodalWarning,
        initiateJourneySearch,
        isMultimodalWarningVisible,
        setMultimodalWarningVisible,
        isSingleMode,
    } = useJourneyInfoPolling({
        currentJourney,
        setLoadingDataForLeg,
        currentLocation,
        source,
        destination,
        publicTransportSearch: props,
        searchId,
        isSingleMode: isSingleModeRef.current,
        otp: props.otp,
        onNoJourneysFound,
        suggestedBusData: undefined,
    });

    useEffect(() => {
        setPollJourneyInfo(true);
    }, [currentJourney?.journeyId]);

    const { legTimetables } = useTimetables(journeyInfoData?.legs, false);
    const correctedJourneyInfoData = useMemo(() => {
        if (!journeyInfoData?.legs || !legTimetables) {
            return journeyInfoData;
        }

        const { totalDuration } = calculateAndUpdateLegsWithConsistentRounding(
            journeyInfoData.legs,
            legTimetables,
            true,
        );

        return {
            ...journeyInfoData,
            estimatedDuration: totalDuration,
        };
    }, [journeyInfoData, legTimetables]);

    const [busTrackingRouteInfo, setBusTrackingRouteInfo] = useState<availableRoute | undefined>(undefined);

    const { trackVehiclesData } = useBusTrackingLogic({
        initialRoute: busTrackingRouteInfo?.routeCode,
        initialWaypoints: undefined,
        initialRouteStops: undefined,
        vehicleType: props.vehicleType ?? 'BUS',
        sourceStop: props.originStop,
        destinationStop: props.destinationStop,
        city: journeyInfoData?.merchantOperatingCityName ?? 'Chennai',
        enabled: props.vehicleType === 'BUS',
        callFrfs: false,
    });

    const {
        journeyMapData,
        legRideOptionsPopup,
        bottomPad,
        popUpType: switchLegsPopUpType,
        skippedLegOrders: switchLegsSkippedLegOrders,
        switchLegMode,
        switchVehicle,
        handleShowRideOptions,
        handleChangeVehicle,
        handleSkipRide,
        setPopUpType: setSwitchLegsPopUpType,
        switchModeLoading,
        setJourneyMapData,
        isMapDataLoaded,
        handleChangeStation,
        recenterBusTracking,
    } = useSwitchLegs({
        currentJourney,
        journeyInfoData: correctedJourneyInfoData,
        searchId,
        loadingDataForLeg,
        setLoadingDataForLeg,
        setJourneyInfoData,
        setPollJourneyInfo,
        pollJourneyInfo,
        screenName: 'journeyDetails',
        vehicleType: props.vehicleType,
        trackVehiclesData,
    });

    const {
        vehicleLegToSwitch,
        setVehicleLegToSwitch,
        legForViaChange,
        setLegForViaChange,
        selectedVehicleTier,
        setSelectedVehicleTier,
        vehicleTierOptionsResp,
        isLoadingVehicleOptions,
        isFetchingVehicleTierOptions,
        isChangingVehicleClass,
        handleChangeVehicleClass,
        handleSelectAndChangeVehicleTier,
        handleShowVehicleTierOptions,
        getOtherVehicleOptions,
        transformedRouteOptions,
        transformViaPointName,
        handleChangeAlternateJourneyLeg,
        isFetchingSimilarJourneyLegs,
        handleShowBusRouteSelection,
        sortedRoutes,
        handleConfirmBusChange,
        similarJourneysLoaded,
    } = useVehicleTierOptions({
        journeyId: currentJourney?.journeyId,
        journeyInfoData: correctedJourneyInfoData,
        setJourneyInfoData,
        setLoadingDataForLeg,
        getStationByCode,
        setPollJourneyInfo,
        setJourneyMapData,
        isMapDataLoaded,
        pollJourneyInfo,
        setBusTrackingRouteInfo,
        allFareLoaded: !pollJourneyInfo,
    });

    const fetchingLegsFare = useMemo(
        () =>
            correctedJourneyInfoData?.legs?.some(
                item => canBookLeg(item) && item.bookingAllowed && isUndefined(item.pricingId),
            ) || false,
        [correctedJourneyInfoData],
    );

    const handleMoreOptions = useCallback(() => {
        dispatch(setHideLoader(false));
        navigation.navigate('HomeTab', {
            screen: 'journeyOptions',
        });
        setVehicleLegToSwitch(null);
    }, [navigation, setVehicleLegToSwitch]);

    useEffect(() => {
        if (userPreferences && !hasSetInitialPreferences.current && searchId) {
            const preferredModes = userPreferences.allowedTransitModes || [];
            dispatch(
                setSelectedModesFilter({
                    id: searchId,
                    payload: preferredModes,
                }),
            );
            hasSetInitialPreferences.current = true;
        }
    }, [userPreferences, searchId, dispatch]);

    const loadingTrainViaPoints = useMemo(() => {
        const journeyLeg = correctedJourneyInfoData?.legs[0];
        return (
            isSingleMode && isUndefined(vehicleTierOptionsResp?.options.length) && journeyLeg?.travelMode === 'Subway'
        );
    }, [vehicleTierOptionsResp?.options.length, isSingleMode, correctedJourneyInfoData?.legs]);

    useEffect(() => {
        if (isSingleMode) {
            const singleModeLeg = correctedJourneyInfoData?.legs?.[0];
            const order = singleModeLeg?.order;
            if (!isNull(order) && !isUndefined(order)) {
                setVehicleLegToSwitch(order);
                if (singleModeLeg?.travelMode === 'Subway') {
                    setLegForViaChange(order);
                }
            }
            if (
                singleModeLeg?.legExtraInfo.TAG === 'Bus' &&
                sortedRoutes &&
                sortedRoutes?.length > 0 &&
                isUndefined(busTrackingRouteInfo)
            ) {
                const currentRoute = sortedRoutes?.find(
                    route =>
                        singleModeLeg.legExtraInfo.TAG === 'Bus' &&
                        route.routeCode === singleModeLeg.legExtraInfo._0.routeCode,
                );
                if (currentRoute) {
                    setBusTrackingRouteInfo(currentRoute);
                }
            } else {
                if (singleModeLeg?.legExtraInfo.TAG === 'Bus' && isUndefined(busTrackingRouteInfo)) {
                    setBusTrackingRouteInfo({
                        routeCode: singleModeLeg?.legExtraInfo._0.routeCode ?? '',
                        source: 'LIVE',
                        routeShortName: singleModeLeg?.legExtraInfo._0.routeName ?? '',
                        routeTimings: [],
                        quoteId: '',
                        routeLongName: '',
                        serviceTierName: '',
                        serviceTierType: undefined,
                    });
                }
            }
        }
    }, [correctedJourneyInfoData, isSingleMode, sortedRoutes, busTrackingRouteInfo]);

    const isSubwayBoooking = useMemo(() => {
        return correctedJourneyInfoData?.legs?.every(leg => leg.travelMode === 'Subway');
    }, [correctedJourneyInfoData?.legs]);

    useEffect(() => {
        if (!isSingleModeRef.current || isSubwayBoooking === false) {
            setIsViaModalShown(true);
            return;
        }
        if (isUndefined(transformedRouteOptions)) return;
        if (!isViaModalShown && similarJourneysLoaded) {
            if (transformedRouteOptions.length > 1) viaPointsModalRef.current?.present();
            setIsViaModalShown(true);
        }
    }, [isSingleModeRef.current, transformedRouteOptions, isViaModalShown, similarJourneysLoaded, isSubwayBoooking]);

    // Get other bus options based on isSingleMode
    const otherVehicleOptions = useMemo(
        () => getOtherVehicleOptions(isSingleMode, 'Bus'),
        [getOtherVehicleOptions, isSingleMode],
    );

    const selectedMultimodalLeg = useMemo(
        () => correctedJourneyInfoData?.legs?.find(item => item.order === legRideOptionsPopup),
        [correctedJourneyInfoData, legRideOptionsPopup],
    );

    const { timeTableBottomSheetModalRef, busRouteSelectionModalRef } = useRefsContext();

    const selectedPricingItem = useAppSelector(state =>
        selectSelectedPricingItems(state, selectedMultimodalLeg?.searchId ?? null),
    );

    // Update the journey info polling hook with the loadingDataForLeg setter
    useEffect(() => {
        if (correctedJourneyInfoData) {
            setLoadingDataForLeg(null);
        }
    }, [correctedJourneyInfoData]);

    const recenterMap = useCallback(() => {
        // Extract coordinates from all routes in journeyMapData
        if (props.vehicleType === 'BUS') {
            recenterBusTracking(true);
            return;
        }
        const allCoordinates = Object.values(journeyMapData)
            .flatMap(routeData => {
                // Handle both single route and array of routes
                if (Array.isArray(routeData)) {
                    return routeData.flatMap(route => route?.coordinates || []);
                }
                return routeData?.coordinates || [];
            })
            .filter(coord => coord && coord.latitude && coord.longitude);

        if (allCoordinates.length > 0) {
            // First fit to coordinates with proper parameter structure
            mapRef.current?.fitToCoordinates({
                coordinates: allCoordinates,
                duration: 600,
            });
        }

        // Then add map padding for consistent view
    }, [mapRef, bottomPad, journeyMapData]);

    useEffect(() => {
        if (correctedJourneyInfoData?.journeyId) {
            setIsJourneyConfirmed(false);
        }
    }, [correctedJourneyInfoData?.journeyId]);

    // const { legTimetables } = useTimetables(correctedJourneyInfoData?.legs, false);

    const handleGoBack = useCallback(() => {
        if (appConfig.appType === 'multimodal' || isSingleMode) {
            resetIds(userToken, null, dispatch);
            dispatch(setSearchedSource(currentLocation));
            busRouteSelectionModalRef.current?.dismiss();
            dispatch(clearSession(['currentLocationCoords', 'currentLocation']));
            navigation.goBack();
            if (!isSingleMode) {
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'mm_j_info' }));
            }
        } else {
            resetIds(userToken, null, dispatch, false);
            dispatch(clearSession(['currentLocationCoords', 'currentLocation', 'searchedSource', 'searchedStops']));
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'mm_j_info' }));
            if (navigation.canGoBack()) navigation.goBack();
        }
    }, [userToken, dispatch, navigation, appConfig, currentLocation, isSingleMode]);

    const handleGoBackToSearch = useCallback(() => {
        resetIds(userToken, null, dispatch);
        dispatch(setSearchedSource(currentLocation));
        dispatch(clearSession(['currentLocationCoords', 'currentLocation']));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'mm_j_info' }));
        navigation.popTo('mainTabNavigation', {
            screen: 'homeTab_homeScreen',
        });
    }, [userToken, dispatch, navigation, currentLocation]);

    const { nextTwoArrivalTimes, firstArrivalTime } = useMemo(() => {
        const allLegs = correctedJourneyInfoData?.legs || [];

        const result = allLegs.reduce<{
            timesMap: Record<number, number[]>;
            firstArrivalTime: Record<number, string | undefined>;
        }>(
            (acc, leg) => {
                if (leg.legExtraInfo.TAG !== 'Taxi' && leg.legExtraInfo.TAG !== 'Walk') {
                    const timetableKey = createLegOrder(leg);
                    const timetable: TimeEntry[] =
                        timetableKey && legTimetables?.[timetableKey] ? legTimetables[timetableKey] : [];
                    const processedTimes = Array.from(
                        timetable.reduce((map, time) => {
                            if (!map.has(time.time)) {
                                // eslint-disable-next-line functional/immutable-data
                                map.set(time.time, time);
                            }
                            return map;
                        }, new Map<number, TimeEntry>()),
                    ).map(([, value]) => value);

                    const timesArray = getNextTwoTimes(processedTimes, Date.now());
                    const updatedFirstArrival =
                        leg.legExtraInfo.TAG === 'Metro'
                            ? (() => {
                                  const metroStartTime = calculateCumulativeTimeUpToLeg(allLegs, leg.order, true);
                                  // Find the actual next metro time from timetable
                                  const nextMetroTime = processedTimes
                                      .filter(entry => entry.time > metroStartTime)
                                      .sort((a, b) => a.time - b.time)[0];
                                  return {
                                      ...acc.firstArrivalTime,
                                      [leg.order]: nextMetroTime?.time ? formatTime(nextMetroTime.time) : undefined,
                                  };
                              })()
                            : acc.firstArrivalTime;

                    return {
                        timesMap: { ...acc.timesMap, [leg.order]: timesArray },
                        firstArrivalTime: updatedFirstArrival,
                    };
                }
                return acc;
            },
            { timesMap: {}, firstArrivalTime: {} },
        ) || { timesMap: {}, firstArrivalTime: {} };

        return {
            nextTwoArrivalTimes: result.timesMap,
            firstArrivalTime: result.firstArrivalTime,
        };
    }, [correctedJourneyInfoData, legTimetables]);

    const metroTimeTableRef = useRef<BottomSheetModal>(null);
    const subwayTimeTableRef = useRef<BottomSheetModal>(null);
    const onViewTimetable = useCallback((mode: VehicleCategory_vehicleCategory | undefined) => {
        logSuffixEvent(mode ?? '', EventSuffix.INFO_TIMETABLE);
        switch (mode) {
            case 'METRO':
                metroTimeTableRef.current?.present();
                return;
            case 'SUBWAY':
                subwayTimeTableRef.current?.present();
                return;
            default:
                timeTableBottomSheetModalRef.current?.present();
                return;
        }
    }, []);

    const timeTableData: Record<number, NewTimeTableUIProps> | undefined = useMemo(() => {
        return (
            correctedJourneyInfoData?.legs?.reduce<Record<number, NewTimeTableUIProps>>((acc, leg) => {
                if (['Bus', 'Metro', 'Subway'].includes(leg.legExtraInfo.TAG)) {
                    const timetableKey = createLegOrder(leg);
                    const timetable: TimeEntry[] =
                        timetableKey && legTimetables?.[timetableKey] ? legTimetables[timetableKey] : [];
                    const processedTimes = timetable.filter(
                        (time, index, self) => self.findIndex(t => t.time === time.time) === index,
                    );

                    const stationName =
                        leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway'
                            ? leg.legExtraInfo._0?.routeInfo?.[0]?.originStop?.name || ''
                            : leg.legExtraInfo.TAG === 'Bus'
                              ? leg.legExtraInfo._0?.originStop?.name || ''
                              : '';

                    const currentLegMapData = journeyMapData[leg.order];
                    const allTowardsStation = Array.isArray(currentLegMapData)
                        ? currentLegMapData
                              .map(data => data.lastStop?.name)
                              .filter((name): name is string => name !== undefined)
                        : undefined;

                    const routeData: mmEstimateRouteType | undefined = Array.isArray(currentLegMapData)
                        ? currentLegMapData[0]
                        : currentLegMapData;
                    const towardsStation = routeData?.lastStop?.name;

                    const sheetRef =
                        leg.legExtraInfo.TAG === 'Metro'
                            ? metroTimeTableRef
                            : leg.legExtraInfo.TAG === 'Subway'
                              ? subwayTimeTableRef
                              : undefined;

                    return {
                        ...acc,
                        [leg.order]: {
                            times: processedTimes,
                            source: stationName,
                            sheetRef: sheetRef,
                            mode: leg?.travelMode,
                            towardsStation,
                            onDismiss: undefined,
                            allTowardsStation: allTowardsStation,
                        },
                    };
                }
                return acc;
            }, {}) || {}
        );
    }, [correctedJourneyInfoData?.legs, legTimetables, journeyMapData]);

    const resolver: Resolver<JourneyDetailScreenAction> = useCallback(
        async (action: JourneyDetailScreenAction): Promise<void> => {
            switch (action.type) {
                case 'SWITCH_MODE':
                    if (action.payload) {
                        setIsSwitchPopupOpen(false);
                        rideOptionModalRef.current?.dismiss();
                        switchLegMode(action.payload.legOrder, action.payload.newMode);
                    }
                    break;
                case 'SHOW_RIDE_OPTIONS':
                    if (action.payload) {
                        setIsSwitchPopupOpen(true);
                        handleShowRideOptions(action.payload.legOrder);
                    }
                    break;
                case 'CHANGE_VEHICLE':
                    if (!isNull(action.payload?.legOrder)) {
                        setIsSwitchPopupOpen(false);
                        handleChangeVehicle(action.payload.legOrder ?? null);
                    } else {
                        logger.logWarn(
                            `Journey Id: ${correctedJourneyInfoData?.journeyId || 'No Journey Id'} - Leg Order is undefined. Can't Able to Change Vehicle`,
                            'BookingFlow',
                        );
                    }

                    break;
                case 'CHANGE_TRANSIT_CLASS':
                    handleChangeVehicleClass();
                    vehicleOptionsModalRef.current?.dismiss();
                    break;
                case 'SELECT_AND_CHANGE_VEHICLE_TIER':
                    if (action.payload && !isNull(action.payload.legOrder)) {
                        handleSelectAndChangeVehicleTier(action.payload.legOrder, action.payload.quoteId);
                        vehicleOptionsModalRef.current?.dismiss();
                    }
                    break;
                case 'SELECT_ALTERNATE_JOURNEY_LEG':
                    if (action.payload && !isNull(action.payload.legOrder)) {
                        handleChangeAlternateJourneyLeg(action.payload.legOrder, action.payload.newJourneyLegId);
                        viaPointsModalRef.current?.dismiss();
                    }
                    break;
                case 'CONFIRM_CHANGE_VEHICLE':
                    if (
                        selectedMultimodalLeg?.legExtraInfo.TAG === 'Taxi' &&
                        (!selectedPricingItem ||
                            !selectedPricingItem[0] ||
                            (selectedPricingItem[0] &&
                                selectedMultimodalLeg.legExtraInfo._0.serviceTierName ===
                                    selectedPricingItem[0]?.serviceTierName))
                    ) {
                        setSwitchLegsPopUpType(null);
                    }
                    switchVehicle(selectedMultimodalLeg?.order ?? 0, selectedPricingItem[0]?.id ?? null);
                    break;
                case 'GO_BACK':
                    handleGoBack();
                    break;
                case 'GO_BACK_TO_SEARCH':
                    handleGoBackToSearch();
                    break;
                case 'MORE_OPTIONS':
                    handleMoreOptions();
                    break;
                case 'RECENTER_MAP':
                    recenterMap();
                    break;
                case 'REMOVE_CHANGE_VEHICLE':
                    setSwitchLegsPopUpType(null);
                    break;
                case 'SKIP_RIDE':
                    handleSkipRide(action.payload?.legOrder);
                    break;
                case 'SHOW_AUTO_INFO_POPUP':
                    autoInfoModalRef.current?.present();
                    break;
                case 'SELECT_VEHICLE_TIER':
                    setSelectedVehicleTier(action.payload?.legTier ?? null);
                    break;
                case 'SHOW_VEHICLE_TIER_OPTIONS': {
                    if (!paymentState.isConfirmingJourney) {
                        handleShowVehicleTierOptions(action.payload?.legOrder ?? null);
                        vehicleOptionsModalRef.current?.present();
                    }
                    break;
                }
                case 'SHOW_VIA_POINTS_MODAL':
                    viaPointsModalRef.current?.present();
                    setLegForViaChange(action.payload?.legOrder ?? null);
                    break;
                case 'SWITCH_BUS_ROUTE':
                    setBusTrackingRouteInfo(action.payload?.routeInfo ?? undefined);
                    break;
                case 'SHOW_SWITCH_BUS_ROUTE_MODAL':
                    if (action.payload) {
                        handleShowBusRouteSelection(action.payload.legOrder);
                    }
                    break;
                case 'DISMISS_SWITCH_BUS_ROUTE_MODAL':
                    busRouteSelectionModalRef.current?.dismiss();
                    break;
                case 'CONFIRM_BUS_CHANGE':
                    if (action.payload?.routeInfo) {
                        handleConfirmBusChange(action.payload.routeInfo);
                    }
                    break;
                default:
                    break;
            }
        },
        [
            rideOptionModalRef,
            switchLegMode,
            handleShowRideOptions,
            handleChangeVehicle,
            handleChangeVehicleClass,
            handleSelectAndChangeVehicleTier,
            vehicleOptionsModalRef,
            switchVehicle,
            selectedMultimodalLeg,
            selectedPricingItem,
            handleMoreOptions,
            recenterMap,
            setSwitchLegsPopUpType,
            autoInfoModalRef,
            setSelectedVehicleTier,
            handleShowVehicleTierOptions,
            handleConfirmBusChange,
        ],
    );

    const mpDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const paymentProps = {
        legs: correctedJourneyInfoData?.legs ?? [],
        journeyId: correctedJourneyInfoData?.journeyId,
        offer: correctedJourneyInfoData?.offer,
        fetchingLegsFare,
        isJourneyConfirmed,
        loadingDataForLeg,
        handledQuoteExpiry: initiateJourneySearch,
        setIsJourneyConfirmed,
        navigation,
        onMoreOptions: props?.vehicleType === undefined ? handleMoreOptions : undefined,
        isSingleMode,
    };

    const paymentState = useJourneyPayment(paymentProps);

    const completeRouteInfo = useAppSelector(state => selectCompleteRouteInfo(state, null));
    const normalRideTime = completeRouteInfo?.duration;
    const multimodalJourneyTime = correctedJourneyInfoData?.estimatedDuration;
    const timeSavedByMultimodal =
        normalRideTime && multimodalJourneyTime ? normalRideTime - multimodalJourneyTime : undefined;

    const isLoading = paymentState.isConfirmingJourney || paymentState.hideLoader === true;

    const hasPublicTransport = useMemo(
        () => journeyInfoData?.legs.some(leg => ['Bus', 'Metro', 'Subway'].includes(leg.travelMode)),
        [journeyInfoData],
    );

    const viewState: JourneyDetailScreenProps = {
        mpDispatch,
        journeyInfo: correctedJourneyInfoData,
        destination: destination,
        currentLocation,
        confirmEnable: !pollJourneyInfo,
        popUpType: switchLegsPopUpType,
        selectedPricingItem,
        selectedMultimodalLeg,
        navigation,
        loadingDataForLeg,
        skippedLegOrders: switchLegsSkippedLegOrders,
        source,
        isChangingVehicleClass,
        fetchingLegsFare,
        getRouteByCode,
        isConfirmingJourney: paymentState.isConfirmingJourney,
        isSingleMode: isSingleMode,
        legCount: currentJourney?.modes?.length ?? 0,
        otherVehicleOptions: otherVehicleOptions,
        vehicleTierOptionsResp: vehicleTierOptionsResp,
        selectedVehicleTier: selectedVehicleTier ?? undefined,
        isLoadingVehicleOptions,
        isFetchingVehicleTierOptions,
        vehicleLegToSwitch,
        showMultimodalWarning,
        multimodalWarning,
        actualVehicleType: props?.vehicleType,
        journeySegments: paymentState.journeySegments,
        appName,
        journeyMapData,
        isMultimodalWarningVisible,
        setMultimodalWarningVisible,
        switchModeLoading,
        onViewTimetable,
        nextTwoArrivalTimes,
        firstArrivalTime: firstArrivalTime,
        timeTableData: timeTableData,
        transformedRouteOptions: transformedRouteOptions,
        transformViaPointName,
        isFetchingSimilarJourneyLegs,
        legForViaChange,
        timeSavedByMultimodal,
        totalFare: paymentState.totalFare,
        legCategorySelections: paymentState.legCategorySelections,
        switchToAuto: (legOrder: number) => {
            switchLegMode(legOrder, 'Taxi');
        },
        handleOnConfirmRoute: handleChangeStation,
        serviceableStartTime: props.serviceableStartTime,
        busTrackingRouteInfo,
        availableRoutes: sortedRoutes,
        sourceInfo: props?.vehicleType === 'BUS' ? props?.originStop : undefined,
        legRideOptionsPopup,
        isTicketModalOpen,
        isSwitchPopupOpen,
        setIsSwitchPopupOpen,
        isLoading,
        hasPublicTransport,
        handleConfirmBusChange,
    };

    const handlePaymentConfirm = useCallback(
        (args: PaymentConfirmArgs) => {
            if (isSingleMode && correctedJourneyInfoData?.legs?.[0]?.legExtraInfo?.TAG === 'Bus') {
                const originStop = correctedJourneyInfoData.legs[0].legExtraInfo._0.originStop;
                if (currentLocation?.lat && currentLocation?.lng && originStop?.lat && originStop?.lon) {
                    const distance = getDistanceBwCordinatesInKm(
                        currentLocation.lat,
                        currentLocation.lng,
                        originStop.lat,
                        originStop.lon,
                    );
                    if (distance > farAwayDistanceThresholdKm) {
                        setPendingBookingArgs(args);
                        dispatch(setHideLoader(false));
                        farAwayModalRef.current?.present();
                        return;
                    }
                }
            }
            paymentState.onConfirm(args);
        },
        [isSingleMode, correctedJourneyInfoData?.legs, currentLocation, dispatch, paymentState.onConfirm],
    );

    return (
        <>
            <PublicTransitOverview {...viewState} />
            {switchLegsPopUpType !== PopUpType.ChooseRidePopUp && (
                <JourneyPaymentUI
                    {...paymentProps}
                    {...paymentState}
                    onConfirm={handlePaymentConfirm}
                    offer={correctedJourneyInfoData?.offer}
                    loadingTrainViaPoints={loadingTrainViaPoints}
                    isViaModalShown={isViaModalShown}
                    legRideOptionsPopup={legRideOptionsPopup}
                    alwaysShowPaymentFooter={false}
                    setIsTicketModalOpen={setIsTicketModalOpen}
                    isJourneyInfoModalVisible={isJourneyInfoModalVisible}
                    setIsJourneyInfoModalVisible={setIsJourneyInfoModalVisible}
                    onGoBack={() => mpDispatch({ type: 'GO_BACK', payload: undefined })}
                />
            )}
            <FarAwayModal
                sheetRef={farAwayModalRef}
                amount={`₹${paymentState.totalFare}`}
                onContinue={() => {
                    farAwayModalRef.current?.dismiss();
                    if (pendingBookingArgs) {
                        paymentState.onConfirm(pendingBookingArgs);
                        setPendingBookingArgs(null);
                    }
                }}
                onCancel={() => {
                    farAwayModalRef.current?.dismiss();
                    dispatch(setHideLoader(false));
                    setPendingBookingArgs(null);
                }}
            />
        </>
    );
};

export default JourneyDetail_;
