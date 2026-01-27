import React, { useCallback, useMemo, useState } from 'react';
import { SingleModeTicketBookingAction, SingleModeTicketBookingRouteProps, EnhancedStopMapping } from './Types';
import { SingleModeTicketBookingUI } from './UI';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils';
import { useNextVehicleDetailsRouteCodeStopCodeGetQuery } from '@/api/integrations/rtk/NextVehicleDetailsRouteCodeStopCodeGet';
import { useFrfsRouteData } from './hooks/useFrfsRouteData';
import { useLiveOrGTFS } from '../../hooks/useLiveOrGTFS.ts';
import { goToJourneyDetails } from '@/typescript/state/sharedReducer.ts';
import { selectToken } from '@/typescript/state/client/auth.ts';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { selectOperatingCity, selectAppConfig } from '@/typescript/state/client/session';
import { selectAppName } from '@/typescript/state/client/session';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { castVehicleCategoryToMultimodalTravelMode } from '@/src-v2/utils/common.ts';
import { transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';

export const SingleModeTicketBooking = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const navigationRoute: RouteProp<{ params: SingleModeTicketBookingRouteProps }, 'params'> = useRoute();
    const { routeCode: initialRouteCode, vehicleType, selectedSourceStopCode } = navigationRoute.params;

    const [routeCode, setRouteCode] = useState<string>(initialRouteCode);
    const currentCity = useAppSelector(selectOperatingCity);
    const appName = useAppSelector(selectAppName);
    const { directBusBookingTimeTableRef } = useRefsContext();
    const appSystemConfig = useAppSelector(selectAppConfig);
    const enableLiveTracking = appSystemConfig.flowConfig.enableLiveTracking;

    const {
        getStationByCode,
        getRouteByCode,
        isLoading: isLoadingTransportData,
        mapCityToFrfsCity,
    } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    // Use the new hook to handle FRFS route data
    const {
        routeStops,
        sourceCode,
        destCode,
        setSourceCode,
        setDestCode,
        isLoading: isLoadingRouteData,
        waypoints,
    } = useFrfsRouteData({
        routeCode,
        vehicleType,
        city: currentCity ? mapCityToFrfsCity(currentCity) : 'Chennai',
        skip: false,
    });

    const userToken = useAppSelector(selectToken);
    const dispatch = useAppDispatch();

    const route = useMemo(() => {
        if (isLoadingTransportData) {
            return undefined;
        }
        return getRouteByCode(routeCode);
    }, [routeCode, isLoadingTransportData, getRouteByCode]);

    // use reverse route code if route is toggled to fetch the upcoming buses for the reverse route
    const { data: upcomingBusResp, isLoading: _isUpcomingBusLoading } = useNextVehicleDetailsRouteCodeStopCodeGetQuery(
        {
            routeCode: routeCode,
            stopCode: sourceCode || '',
            vehicleType,
        },
        {
            skip: !sourceCode || !routeCode,
            selectFromResult: ({ data, isLoading }) => ({
                data,
                isLoading,
            }),
        },
    );

    // Process upcoming buses data
    const upcomingBusInfo = useMemo(() => {
        if (!upcomingBusResp?.upcomingVehicles?.length) return null;
        return (
            [...upcomingBusResp.upcomingVehicles].sort((a, b) => a.arrivalTimeInSeconds - b.arrivalTimeInSeconds)[0] ??
            null
        );
    }, [upcomingBusResp?.upcomingVehicles]);

    const handleGoBack = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const convertStopMappingToStation = useCallback(
        (stopMapping: EnhancedStopMapping, vehicleType: VehicleCategory_vehicleCategory): transportStation => {
            return {
                code: stopMapping.stopCode,
                name: stopMapping.stopName || '',
                lat: stopMapping.lat ?? 0,
                lon: stopMapping.lon ?? 0,
                vehicleType: vehicleType,
                address: undefined,
                suggestedDestination: undefined,
                gatesInfo: undefined,
                geoJson: undefined,
            };
        },
        [],
    );

    const getStationFromRouteStops = useCallback(
        (stopCode: string | undefined, vehicleType: VehicleCategory_vehicleCategory): transportStation | undefined => {
            if (!stopCode || !routeStops) return undefined;
            const stopMapping = routeStops.find(stop => stop.stopCode === stopCode);
            if (!stopMapping) return undefined;
            return convertStopMappingToStation(stopMapping, vehicleType);
        },
        [routeStops, convertStopMappingToStation],
    );

    const handleBookTicket = useCallback(() => {
        const nativeSourceStopFromCode = sourceCode ? getStationByCode(sourceCode) : undefined;
        const nativeSourceStop =
            nativeSourceStopFromCode || (sourceCode ? getStationFromRouteStops(sourceCode, vehicleType) : undefined);

        const destinationStopFromCode = destCode ? getStationByCode(destCode) : undefined;
        const destinationStop =
            destinationStopFromCode || (destCode ? getStationFromRouteStops(destCode, vehicleType) : undefined);

        goToJourneyDetails({
            userToken,
            dispatch,
            navigation,
            destinationStop,
            originStop: nativeSourceStop,
            recentLocationId: undefined,
            routeCode,
            startTime: undefined,
            vehicleType,
            serviceableStartTime: undefined,
            otp: undefined,
            isSingleModeMetro: false,
        });
    }, [
        navigation,
        routeCode,
        destCode,
        sourceCode,
        getStationByCode,
        getStationFromRouteStops,
        vehicleType,
        userToken,
        dispatch,
    ]);

    const sourceStop = useMemo(() => {
        return sourceCode ? getStationByCode(sourceCode) : undefined;
    }, [sourceCode, getStationByCode]);

    const destinationStop = useMemo(() => {
        return destCode ? getStationByCode(destCode) : undefined;
    }, [destCode, getStationByCode]);

    const { handleLiveOrGTFS, getTimeTableTimes } = useLiveOrGTFS({
        navigation,
        route,
        routeName: route?.shortName,
        sourceStop: sourceStop,
        destinationStop: destinationStop,
        routeStops: routeStops ?? undefined,
        vehicleType,
        waypoints,
        fromJourneyInfoScreen: false,
        fromSingleModeSearch: false,
        onBusRouteSwitch: undefined,
        journeyId: undefined,
        legOrder: undefined,
    });

    const liveOrGTFSData = useMemo(() => {
        if (!upcomingBusInfo?.source || !upcomingBusResp?.upcomingVehicles) return;
        return {
            source: upcomingBusInfo.source,
            upcomingVehicles: upcomingBusResp.upcomingVehicles,
            nextAvailableTimings: undefined,
        };
    }, [upcomingBusInfo?.source, upcomingBusResp?.upcomingVehicles]);

    const timeTableTimes = useMemo(() => {
        if (!liveOrGTFSData) return [];
        return getTimeTableTimes(liveOrGTFSData);
    }, [liveOrGTFSData, getTimeTableTimes]);

    const handleLiveOrGTFSClick = useCallback(
        (fromJourneyInfoScreen: boolean) => {
            // Handling the time table on click here since this screen has a separate time table ref
            if (liveOrGTFSData && timeTableTimes.length > 0) {
                if (liveOrGTFSData.source === 'GTFS' && timeTableTimes.length > 0) {
                    directBusBookingTimeTableRef.current?.present();
                } else {
                    handleLiveOrGTFS(timeTableTimes, liveOrGTFSData.source, fromJourneyInfoScreen);
                }
            }
        },
        [handleLiveOrGTFS, liveOrGTFSData, timeTableTimes, directBusBookingTimeTableRef.current],
    );

    const timeTableProps = useMemo(() => {
        if (!liveOrGTFSData) return undefined;
        return {
            times: timeTableTimes,
            source: sourceStop?.name ?? '',
            sheetRef: undefined,
            mode: castVehicleCategoryToMultimodalTravelMode(vehicleType),
            towardsStation: undefined,
            onDismiss: undefined,
            allTowardsStation: undefined,
        };
    }, [liveOrGTFSData, timeTableTimes, sourceStop?.name, vehicleType]);

    const numberOfBuses = useMemo(() => {
        return upcomingBusResp?.upcomingVehicles?.length ?? 0;
    }, [upcomingBusResp]);

    const resolver: Resolver<SingleModeTicketBookingAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'GO_BACK':
                    handleGoBack();
                    break;
                case 'BOOK_TICKET':
                    handleBookTicket();
                    break;
                case 'TOGGLE_ROUTE':
                    setRouteCode(route?.reverseRoute ?? routeCode);
                    break;
                case 'LIVE_OR_GTFS_CLICK':
                    handleLiveOrGTFSClick(false);
                    break;
                default:
                    break;
            }
        },
        [handleGoBack, handleBookTicket, route?.reverseRoute, routeCode, handleLiveOrGTFSClick],
    );

    const mpDispatch = createDispatcher(resolver);

    // Memoize the view state to prevent unnecessary re-renders
    const viewState = useMemo(
        () => ({
            mpDispatch,
            routeStops,
            route,
            mode: vehicleType,
            sourceCode,
            destCode,
            setSourceCode,
            setDestCode,
            upcomingBusInfo,
            numberOfBuses,
            isLoadingRouteData,
            appName,
            timeTableProps,
            selectedSourceStopCode,
            enableLiveTracking,
        }),
        [
            mpDispatch,
            routeStops,
            route,
            vehicleType,
            sourceCode,
            destCode,
            setSourceCode,
            setDestCode,
            upcomingBusInfo,
            numberOfBuses,
            isLoadingRouteData,
            appName,
            timeTableProps,
            selectedSourceStopCode,
            enableLiveTracking,
        ],
    );

    return <SingleModeTicketBookingUI {...viewState} />;
};
