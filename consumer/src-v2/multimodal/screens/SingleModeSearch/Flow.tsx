import { useCallback, useEffect, useMemo, useState } from 'react';
import { SingleModeSearchAction, SingleModeSearchRouteProps } from './Types';
import { SingleModeSearchUI } from './UI';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { clearSession, selectCurrentLocationCoords, selectAppConfig } from '@/typescript/state/client/session';
import { calculateDistance, usePublicTransportUtils } from '../../utils/PublicTransportUtils';
import { useNearbyBusesData } from './hooks/useNearbyBusesData';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { resetIds } from '@/typescript/state/sharedReducer';
import { selectToken } from '@/typescript/state/client/auth';
import { selectAppName } from '@/typescript/state/client/session';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { castToVehicleCategory, useSuggestions } from './hooks/useSuggestions';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { useFrfsStationsData } from '../../hooks/useFrfsStationsData';
import { goToJourneyDetails } from '@/typescript/state/sharedReducer';
import { logger } from '@/src-v2/systems/logger';
import { isUndefined } from 'lodash';
import { clearBusOtpData } from '../BusOtpFlow/busOtp';
import { Keyboard } from 'react-native';

export const SingleModeSearch: React.FC = () => {
    const route: RouteProp<{ params: SingleModeSearchRouteProps }, 'params'> = useRoute();
    const { bookingType, sourceStop, fallbackView, otp } = route.params;
    const vehicleType = useMemo(() => castToVehicleCategory(bookingType), [bookingType]);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const appName = useAppSelector(selectAppName);
    const [showEditSource, setShowEditSource] = useState(false);
    const appSystemConfig = useAppSelector(selectAppConfig);

    const isFallbackView = useMemo(() => fallbackView ?? false, [fallbackView]);

    const handleGoBack = useCallback(() => {
        dispatch(clearSession(['currentLocationCoords', 'currentLocation']));
        resetIds(userToken, null, dispatch);
        navigation.goBack();
    }, [navigation]);

    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);

    const [selectedSourceStop, setSelectedSourceStop] = useState<(transportStation & { distance: number }) | undefined>(
        sourceStop,
    );

    const {
        getStationByCode,
        getNearestStation,
        isLoading: isLoadingTransportData,
    } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    // hook for FRFS stations API data
    const {
        transformedStations,
        transformedRoutes,
        destStationParentStopCodeMap,
        isLoading: _isFrfsLoading,
    } = useFrfsStationsData({
        sourceStationCode: selectedSourceStop?.code || '',
        vehicleType: 'BUS',
        enabled: bookingType === 'Bus' && appName === 'odishaYatri' && !!selectedSourceStop?.code,
    });

    useEffect(() => {
        if (
            isLoadingTransportData ||
            selectedSourceStop ||
            isUndefined(currentLocationCoords?.coords?.latitude) ||
            isUndefined(currentLocationCoords?.coords?.longitude)
        )
            return;
        setSelectedSourceStop(
            getNearestStation(
                {
                    latitude: currentLocationCoords?.coords?.latitude,
                    longitude: currentLocationCoords?.coords?.longitude,
                },
                vehicleType,
            ) ?? undefined,
        );
    }, [currentLocationCoords?.coords?.latitude, currentLocationCoords?.coords?.longitude, isLoadingTransportData]);

    const { recentSearches, addSearch } = useRecentSearches();

    const location =
        currentLocationCoords?.coords?.latitude && currentLocationCoords?.coords?.longitude
            ? { latitude: currentLocationCoords?.coords?.latitude, longitude: currentLocationCoords?.coords?.longitude }
            : null;

    const { recentBookings, nearbyRoutes, isLoading } = useNearbyBusesData(location, vehicleType, false, true);

    const { suggestions, suggestionsLoading, searchPublicTransport } = useSuggestions(
        bookingType,
        transformedRoutes,
        transformedStations,
        showEditSource,
        fallbackView,
    );

    const resolver: Resolver<SingleModeSearchAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'GO_BACK':
                    handleGoBack();
                    break;
                case 'SET_SELECTED_SOURCE_STOP': {
                    if (!action?.payload) {
                        logger.logWarn('Payload is undefined in SET_SELECTED_SOURCE_STOP', 'BookingFlow');
                        return;
                    }
                    const stop = getStationByCode(action?.payload);
                    if (!stop) {
                        logger.logWarn(`Station is undefined for code -> ${action.payload}`, 'BookingFlow');
                        return;
                    }
                    const distance = calculateDistance(
                        currentLocationCoords?.coords?.latitude ?? 0,
                        currentLocationCoords?.coords?.longitude ?? 0,
                        stop.lat,
                        stop.lon,
                    );
                    setSelectedSourceStop({ ...stop, distance });
                    break;
                }
                case 'HANDLE_FALLBACK_CASE': {
                    if (action.payload) {
                        dispatch(clearBusOtpData(otp ?? ''));
                        Keyboard.dismiss();
                        // Use replace instead of navigate to ensure fresh screen instance
                        navigation.navigate(
                            'HomeTab',
                            {
                                screen: 'busOTPViaTicketBookingFlow',
                                params: {
                                    otp: otp ?? '',
                                    routeCode: action.payload?.routeCode,
                                    resetKey: Date.now().toString(), // Forces new screen instance
                                },
                            },
                            { pop: true },
                        );
                    }
                    break;
                }
                case 'SINGLE_MODE_REPEAT_ROUTE': {
                    if (action.payload) {
                        navigation.navigate('ServicesTab', {
                            screen: 'singleModeBookingNavigator',
                            params: {
                                screen: 'singleModeTicketBooking',
                                params: {
                                    routeCode: action.payload?.routeCode,
                                    vehicleType: castToVehicleCategory(bookingType),
                                    selectedSourceStopCode: selectedSourceStop?.code,
                                },
                            },
                        });
                    }
                    break;
                }
                case 'SINGLE_MODE_REPEAT_TICKET': {
                    if (action.payload) {
                        const destinationStop = action.payload?.destStopCode
                            ? getStationByCode(action.payload?.destStopCode)
                            : undefined;

                        // Check if a mapped source stop exists for this destination code
                        const mappedSourceStopCode =
                            action.payload?.destStopCode && destStationParentStopCodeMap
                                ? destStationParentStopCodeMap[action.payload.destStopCode]
                                : undefined;
                        const originStop =
                            mappedSourceStopCode && getStationByCode(mappedSourceStopCode)
                                ? getStationByCode(mappedSourceStopCode)
                                : action.payload?.sourceStopCode
                                  ? getStationByCode(action.payload.sourceStopCode)
                                  : undefined;

                        goToJourneyDetails({
                            userToken,
                            dispatch,
                            navigation,
                            destinationStop,
                            originStop,
                            recentLocationId: undefined,
                            routeCode: action.payload?.routeCode,
                            startTime: undefined,
                            vehicleType: castToVehicleCategory(bookingType),
                            serviceableStartTime: undefined,
                            otp: undefined,
                            isSingleModeMetro: false,
                        });
                    } else {
                        logger.logWarn('Payload is undefined in SINGLE_MODE_REPEAT_TICKET', 'BookingFlow');
                    }
                    break;
                }
                case 'SINGLE_MODE_TICKET_BOOKING': {
                    Keyboard.dismiss();
                    if (action.payload && appName !== 'odishaYatri') {
                        addSearch(action.payload);
                    } else {
                        logger.logWarn('Payload is undefined in SINGLE_MODE_TICKET_BOOKING', 'BookingFlow');
                    }
                    if (action.payload?.routeCode) {
                        if (appSystemConfig.flowConfig.enableLiveTracking) {
                            // Pass only routeCode to busTracking. Let busTracking fetch/match stop details.
                            navigation.navigate(
                                'busTracking',
                                {
                                    routeCode: action.payload.routeCode,
                                    vehicleType,
                                    fromJourneyInfoScreen: false,
                                    fromSingleModeSearch: true,
                                    sourceStop: selectedSourceStop,
                                    destinationStop: undefined,
                                    onBusRouteSwitch: undefined,
                                    journeyId: undefined,
                                    legOrder: undefined,
                                },
                                { pop: true },
                            );
                        } else
                            navigation.navigate('ServicesTab', {
                                screen: 'singleModeBookingNavigator',
                                params: {
                                    screen: 'singleModeTicketBooking',
                                    params: {
                                        routeCode: action.payload?.routeCode,
                                        vehicleType: castToVehicleCategory(bookingType),
                                        selectedSourceStopCode: selectedSourceStop?.code,
                                    },
                                },
                            });
                    } else {
                        const destinationStop = action.payload?.stopCode
                            ? getStationByCode(action.payload?.stopCode)
                            : undefined;

                        // Check if a mapped source stop exists for this destination code
                        const mappedSourceStopCode =
                            action.payload?.stopCode && destStationParentStopCodeMap
                                ? destStationParentStopCodeMap[action.payload.stopCode]
                                : undefined;
                        const originStop =
                            mappedSourceStopCode && getStationByCode(mappedSourceStopCode)
                                ? getStationByCode(mappedSourceStopCode)
                                : selectedSourceStop;

                        goToJourneyDetails({
                            userToken,
                            dispatch,
                            navigation,
                            destinationStop,
                            originStop,
                            recentLocationId: undefined,
                            routeCode: undefined,
                            startTime: undefined,
                            vehicleType: castToVehicleCategory(bookingType),
                            serviceableStartTime: undefined,
                            otp: undefined,
                            isSingleModeMetro: false,
                        });
                    }
                    break;
                }

                default:
                    break;
            }
        },
        [
            bookingType,
            selectedSourceStop,
            currentLocationCoords?.coords?.latitude,
            currentLocationCoords?.coords?.longitude,
            destStationParentStopCodeMap,
        ],
    );

    const mpDispatch = createDispatcher(resolver);
    const onHardwareBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);
    const viewState = {
        mpDispatch,
        isRepeatBookingsLoading: isLoading,
        startStop: selectedSourceStop,
        vehicleType,
        searchPublicTransport,
        startStopDistance: selectedSourceStop?.distance,
        suggestions,
        loadingSuggestions: suggestionsLoading,
        recentSearches,
        repeatBookings: recentBookings,
        nearbyRoutes,
        showEditSource,
        appName,
        setShowEditSource,
        fallbackView: isFallbackView,
        onHardwareBackPress,
        isSrcHasDestinations: transformedStations.length > 0, // This check is only helpful for Odisha Yatri app
        navigation,
        appSystemConfig,
    };

    return <SingleModeSearchUI {...viewState} />;
};
