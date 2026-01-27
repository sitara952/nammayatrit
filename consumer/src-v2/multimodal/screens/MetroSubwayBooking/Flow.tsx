import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MetroSubwayBookingAction, MetroSubwayBookingRouteProps } from './Types';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import {
    BottomSheetStage,
    selectCurrentLocation,
    selectCurrentLocationCoords,
    selectPtRestrictedHours,
    setBottomSheetStage,
    setSearchedSource,
} from '@/typescript/state/client/session';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { SingleModeMetroTicketBookingUI } from './UI';
import { useMetroSubwayServiceability } from '../../hooks/useMetroSubwayServiceability';
import { getDistanceBtwPoints } from '@/typescript/Maps/helpers/mapUtils';
import { useNearbyBusesData } from '../SingleModeSearch/hooks/useNearbyBusesData';
import { selectToken } from '@/typescript/state/client/auth';
import { goToJourneyDetails } from '@/typescript/state/sharedReducer';
import { logger } from '@/src-v2/systems/logger';
import { usePublicTransportData } from '../../hooks/usePublicTransportData';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { StationType } from './components/DestinationPickerWithSections';
import { get12HourFormatText } from '@/typescript/utils/time';

export const MetroSubwayBooking = () => {
    const { refreshData, isDataLoaded, isDataAvailable } = usePublicTransportData(true);
    const { serviceUnavailableModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const navigationRoute: RouteProp<{ params: MetroSubwayBookingRouteProps }, 'params'> = useRoute();
    const { vehicleType, station } = navigationRoute.params;
    const { isServiceable } = useMetroSubwayServiceability(vehicleType);
    const dispatch = useAppDispatch();
    const [sourceStation, setSourceStation] = useState<transportStation | undefined>(station);
    const [destinationStation, setDestinationStation] = useState<transportStation | undefined>(undefined);
    const [isRouteToggled, setIsRouteToggled] = useState(false);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const userToken = useAppSelector(selectToken);
    const ptRestrictedHours = useAppSelector(selectPtRestrictedHours);

    const getServiceabilityStartTime = () => {
        if (vehicleType === 'METRO' && ptRestrictedHours?.metro.endTime)
            return get12HourFormatText(ptRestrictedHours?.metro.endTime);
        else if (vehicleType === 'SUBWAY' && ptRestrictedHours?.subway.endTime)
            return get12HourFormatText(ptRestrictedHours?.subway.endTime);
        return undefined;
    };

    const location =
        currentLocationCoords?.coords?.latitude && currentLocationCoords?.coords?.longitude
            ? {
                  latitude: currentLocationCoords?.coords?.latitude,
                  longitude: currentLocationCoords?.coords?.longitude,
              }
            : null;

    const { recentBookings: repeatBookings, isLoading: isRepeatBookingsLoading } = useNearbyBusesData(
        location,
        vehicleType,
        false,
        true,
    );

    const { getNearestStation, getStationByCode, getAllStations, updateUserLocation, userLocation, isLoading } =
        usePublicTransportUtils({
            maxStopDistance: undefined,
            enabled: true,
        });

    // Refresh data when the public transport data is not loaded
    useEffect(() => {
        const refreshFunction = async () => {
            if (!isDataLoaded && !isDataAvailable) {
                await refreshData();
            }
        };
        refreshFunction();
    }, [isDataLoaded, isDataAvailable]);

    useEffect(() => {
        if (!isServiceable) {
            serviceUnavailableModalRef.current?.present();
        }
    }, [isServiceable]);

    // Update the user location when we have current location
    useEffect(() => {
        if (currentLocationCoords?.coords?.latitude && currentLocationCoords?.coords?.longitude) {
            updateUserLocation(currentLocationCoords.coords.latitude, currentLocationCoords.coords.longitude);
        }
    }, [currentLocationCoords]);

    // When we have location and source/destination codes from the route params, load them
    useEffect(() => {
        if (!isLoading && userLocation && !sourceStation) {
            // Get the nearest station within 15km
            const nearestStation = getNearestStation(userLocation, vehicleType);
            if (nearestStation) {
                setSourceStation(nearestStation);
            }
        }
    }, [isLoading, userLocation]);

    const currentLocation = useAppSelector(selectCurrentLocation);
    // Handle going back
    const handleGoBack = useCallback(
        (stage: BottomSheetStage) => {
            dispatch(setBottomSheetStage({ stage: stage, src: 'm_s_booking' }));
            dispatch(setSearchedSource(currentLocation));
            navigation.goBack();
        },
        [navigation],
    );
    // Handle confirmation and navigation to journey details
    const handleConfirmSelection = useCallback(
        (source: transportStation | undefined, destination: transportStation | undefined) => {
            if (!source || !destination) {
                logger.logWarn(
                    `Cannot confirm: sourceStation or destinationStation is undefined. source -> ${source?.code} & destination -> ${destination?.code}`,
                    'MetroSubwayBookingFlow',
                );
                return;
            }
            logEvent(EventName.METRO_SOURCE_DESTINATION_ENTERED);
            goToJourneyDetails({
                userToken,
                dispatch,
                navigation,
                destinationStop: destination,
                originStop: source,
                recentLocationId: undefined,
                routeCode: undefined,
                startTime: undefined,
                vehicleType: vehicleType,
                serviceableStartTime: undefined,
                otp: undefined,
                isSingleModeMetro: vehicleType === 'METRO' ? true : false,
            });
        },
        [navigation, vehicleType],
    );

    // Create action resolver
    const resolver: Resolver<MetroSubwayBookingAction> = async action => {
        switch (action.type) {
            case 'TOGGLE_ROUTE':
                setIsRouteToggled(!isRouteToggled);
                break;
            case 'GO_BACK':
                handleGoBack(BottomSheetStage.Home);
                break;
            case 'SINGLE_MODE_REPEAT_TICKET':
                if (action.payload) {
                    const sourceStop = getStationByCode(action.payload.sourceStopCode);
                    const destinationStop = getStationByCode(action.payload.destStopCode);
                    handleConfirmSelection(sourceStop, destinationStop);
                }
                break;
            case 'GO_BACK_TO_SEARCH':
                handleGoBack(BottomSheetStage.Search);
                break;
            case 'CONFIRM_SELECTION':
                handleConfirmSelection(sourceStation, destinationStation);
                break;
            case 'UPDATE_SOURCE':
                if (action.payload) {
                    setSourceStation(action.payload.station);
                } else {
                    logger.logWarn('Payload is null for UPDATE_SOURCE', 'MetroSubwayBookingFlow');
                }
                break;
            case 'UPDATE_DESTINATION':
                if (action.payload) {
                    setDestinationStation(action.payload.station);
                    handleConfirmSelection(sourceStation, action.payload.station);
                } else {
                    logger.logWarn('Payload is null for UPDATE_DESTINATION', 'MetroSubwayBookingFlow');
                }
                break;
            default:
                break;
        }
    };

    const mpDispatch = createDispatcher(resolver);

    const sortedStationsForSourcePicker = useMemo(() => {
        const stations = getAllStations(vehicleType);

        // Sort stations based on distance from user's location if available
        if (userLocation) {
            return [...stations].sort((a, b) => {
                const distanceA = getDistanceBtwPoints(
                    { latitude: a.lat, longitude: a.lon },
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                );
                const distanceB = getDistanceBtwPoints(
                    { latitude: b.lat, longitude: b.lon },
                    { latitude: userLocation.latitude, longitude: userLocation.longitude },
                );
                return distanceA - distanceB;
            });
        }
        return stations;
    }, [getAllStations, userLocation]);

    const sortedStationsForDestinationPicker = useMemo(() => {
        if (!sourceStation) {
            return [
                {
                    title: userLanguageStrings.AllStations,
                    stations: sortedStationsForSourcePicker,
                    index: 100,
                    toggableIndex: 100,
                    routeCode: undefined,
                    type: StationType.Other,
                },
            ];
        }

        const suggestedDestinations =
            sourceStation.suggestedDestination
                ?.slice()
                ?.sort((a, b) => (isRouteToggled ? a.toggableIndex - b.toggableIndex : a.index - b.index)) || [];

        const modifiedSuggestedDestination = suggestedDestinations.map(suggestedDestination => {
            const towardsStation = getStationByCode(suggestedDestination.towardsStation);
            return {
                title: 'Stations towards ' + (towardsStation?.name || suggestedDestination.towardsStation),
                stations: suggestedDestination.stationsList
                    .map(stationCode => getStationByCode(stationCode))
                    .filter((station): station is transportStation => station !== undefined),
                index: suggestedDestination.index,
                toggableIndex: suggestedDestination.toggableIndex,
                routeCode: undefined,
                type: StationType.Towards,
            };
        });

        const allSuggestedStationCodes = suggestedDestinations.flatMap(d => d.stationsList);
        const remaningStations = sortedStationsForSourcePicker.filter(
            station => !allSuggestedStationCodes.includes(station.code),
        );

        return [
            ...modifiedSuggestedDestination,
            {
                title:
                    modifiedSuggestedDestination.length > 0
                        ? userLanguageStrings.OtherStations
                        : userLanguageStrings.AllStations,
                stations: remaningStations,
                index: 100,
                toggableIndex: 100,
                routeCode: undefined,
                type: StationType.Other,
            },
        ];
    }, [sourceStation, sortedStationsForSourcePicker, isRouteToggled]);

    const distanceToSourceStation = useMemo(() => {
        if (!sourceStation || !userLocation) {
            return undefined;
        }
        return getDistanceBtwPoints(
            { latitude: sourceStation.lat, longitude: sourceStation.lon },
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
        );
    }, [sourceStation, userLocation]);
    const onTicketButtonPress = () =>
        navigation.navigate('mainTabNavigation', { screen: 'ticketsTab_homeScreen' }, { pop: true });
    const viewState = {
        mpDispatch,
        sourceStation,
        destinationStation,
        sortedStationsForSourcePicker,
        sortedStationsForDestinationPicker,
        repeatBookings,
        isRepeatBookingsLoading,
        vehicleType,
        distanceToSourceStation,
        onTicketButtonPress,
        isDataLoaded,
        serviceableStartTime: getServiceabilityStartTime(),
        serviceUnavailableModalRef,
        navigation,
        userLanguageStrings,
    };

    return <SingleModeMetroTicketBookingUI {...viewState} />;
};
