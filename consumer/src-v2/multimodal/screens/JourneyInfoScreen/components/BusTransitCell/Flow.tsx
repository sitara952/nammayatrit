import React, { FC, useCallback, useMemo } from 'react';
import { BusCellProps, BusTransitCellViewState, BusTransitCellAction } from './Types';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCurrentLocation, selectNewFeatureFlags } from '@/typescript/state/client/session';
import { getDistanceBtwPoints } from '@/typescript/Maps/helpers/mapUtils';
import { BusTransitCell } from './UI';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { convertFrfsStationToTransportStation } from '@/typescript/utils/MultiModal';
import { useUpcomingVehicle } from '../../../../hooks/useUpcomingVehicle';
import { useLiveOrGTFS } from '../../../../hooks/useLiveOrGTFS.ts';
import { isUndefined } from 'lodash';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';

export const BusTransitCellFlow: FC<BusCellProps> = ({
    legInfo,
    isLastCell,
    onClassChange,
    isDataLoading,
    fromJourneyInfoScreen,
    transitTime,
    onBusRouteSwitch,
    totalTicketCount,
    journeyId,
}) => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const isStatic = 'origin' in legInfo;
    const legExtraInfo = !isStatic && legInfo.legExtraInfo.TAG === 'Bus' ? legInfo.legExtraInfo._0 : undefined;
    const legOrder = !isStatic ? legInfo.order : undefined;
    const isPassEnabled = useAppSelector(selectNewFeatureFlags).passEnabled;

    const showPassText = useMemo(() => isPassEnabled && totalTicketCount <= 1, [isPassEnabled, totalTicketCount]);

    // Use our custom hook instead of direct RTK query
    const {
        upcomingVehicleInfo: upcomingBusInfo,
        allUpcomingVehicles,
        isLoading: _isUpcomingBusLoading,
    } = useUpcomingVehicle({
        routeCode: legExtraInfo?.routeCode ?? '',
        stopCode: legExtraInfo?.originStop.code || '',
        vehicleType: 'BUS',
        serviceTierType: legExtraInfo?.selectedServiceTier?.serviceTierType,
        enabled: !!legExtraInfo?.originStop.code && !!legExtraInfo?.routeCode,
    });

    const liveOrGTFSData = useMemo(() => {
        return {
            source: upcomingBusInfo?.source || 'LIVE',
            upcomingVehicles: allUpcomingVehicles,
            nextAvailableTimings: undefined,
        };
    }, [upcomingBusInfo, allUpcomingVehicles]);

    const sourceStop = useMemo(() => {
        return legExtraInfo ? convertFrfsStationToTransportStation(legExtraInfo.originStop, 'BUS') : undefined;
    }, [legExtraInfo?.originStop]);

    const destinationStop = useMemo(() => {
        return legExtraInfo ? convertFrfsStationToTransportStation(legExtraInfo.destinationStop, 'BUS') : undefined;
    }, [legExtraInfo?.destinationStop]);

    // Wrap the callback to include leg order
    const wrappedOnBusRouteSwitch = useMemo(() => {
        console.info('[BusTransitCellFlow] Wrapping callback', {
            hasCallback: !!onBusRouteSwitch,
            legOrder,
            isUndefined: isUndefined(legOrder),
        });
        if (!onBusRouteSwitch || isUndefined(legOrder)) {
            console.warn('[BusTransitCellFlow] Callback or legOrder is missing!', {
                hasCallback: !!onBusRouteSwitch,
                legOrder,
            });
            return undefined;
        }
        return async (routeInfo: availableRoute) => {
            console.info('[BusTransitCellFlow] Calling onBusRouteSwitch for leg order:', legOrder);
            return await onBusRouteSwitch(routeInfo, legOrder);
        };
    }, [onBusRouteSwitch, legOrder]);

    const { handleLiveOrGTFS, getTimeTableTimes } = useLiveOrGTFS({
        navigation,
        route: legExtraInfo?.routeCode,
        routeName: legExtraInfo?.routeName,
        sourceStop: sourceStop,
        destinationStop: destinationStop,
        routeStops: undefined,
        vehicleType: 'BUS',
        waypoints: undefined,
        fromJourneyInfoScreen,
        fromSingleModeSearch: false,
        onBusRouteSwitch: wrappedOnBusRouteSwitch,
        journeyId: journeyId,
        legOrder: legOrder,
    });

    const timeTableTimes = useMemo(() => {
        return getTimeTableTimes(liveOrGTFSData);
    }, [liveOrGTFSData, getTimeTableTimes]);

    const timeTableProps = useMemo(() => {
        return {
            times: timeTableTimes,
            source: sourceStop?.name ?? '',
            sheetRef: undefined,
            mode: legInfo.travelMode,
            towardsStation: undefined,
            onDismiss: undefined,
            allTowardsStation: undefined,
        };
    }, [timeTableTimes, sourceStop?.name, legInfo.travelMode]);

    const handleLiveOrGTFSClick = useCallback(
        (fromJourneyInfoScreen: boolean) => {
            handleLiveOrGTFS(timeTableTimes, 'LIVE', fromJourneyInfoScreen);
        },
        [timeTableTimes, handleLiveOrGTFS, upcomingBusInfo, allUpcomingVehicles, liveOrGTFSData.source],
    );

    const resolver: Resolver<BusTransitCellAction> = useCallback(
        async action => {
            if (isStatic) return;
            switch (action.type) {
                case 'LIVE_OR_GTFS_CLICK':
                    handleLiveOrGTFSClick(fromJourneyInfoScreen);
                    break;
                default:
                    break;
            }
        },
        [handleLiveOrGTFSClick],
    );

    const btDispatch = createDispatcher(resolver);
    const currLoc = useAppSelector(selectCurrentLocation);

    if (isStatic) {
        const viewState: BusTransitCellViewState = {
            isLastCell,
            originStop: {
                name: legInfo.origin.stationName,
                code: legInfo.origin.stopCode ?? '',
                lat: legInfo.origin.latLong.lat,
                lon: legInfo.origin.latLong.lon,
                address: '',
                hindiName: '',
                regionalName: '',
                parentStopCode: undefined,
                timeTakenToTravelUpcomingStop: undefined,
                routeCodes: [],
            },
            destinationStop: {
                name: legInfo.destination.stationName,
                code: legInfo.destination.stopCode ?? '',
                lat: legInfo.destination.latLong.lat,
                lon: legInfo.destination.latLong.lon,
                address: '',
                hindiName: '',
                regionalName: '',
                parentStopCode: undefined,
                timeTakenToTravelUpcomingStop: undefined,
                routeCodes: [],
            },
            providerName: undefined,
            routeName: legInfo.vehicleName ?? undefined,
            selectedServiceTier: { serviceTierName: legInfo.selectedServiceTierName },
            alternateShortNames: legInfo.alternateRoutesNames || [],
            routeCode: '',
            upcomingBusInfo: null,
            distance: null,
            onClassChange: undefined,
            ticketState: undefined,
            btDispatch: undefined,
            isDataLoading: false,
            isStatic: true,
            timeTableProps: undefined,
            transitTime,
            bookingAllowed: undefined,
            showPassText,
            totalTicketCount,
        };
        return <BusTransitCell {...viewState} />;
    }

    const distance =
        legExtraInfo?.originStop &&
        currLoc?.lat &&
        currLoc.lng &&
        legExtraInfo.originStop?.lat &&
        legExtraInfo.originStop?.lon
            ? getDistanceBtwPoints(
                  { latitude: currLoc?.lat, longitude: currLoc.lng },
                  { latitude: legExtraInfo.originStop?.lat, longitude: legExtraInfo.originStop?.lon },
              )
            : null;

    const BusTransitCellViewState: BusTransitCellViewState = {
        isLastCell,
        originStop: legExtraInfo?.originStop,
        destinationStop: legExtraInfo?.destinationStop,
        providerName: legExtraInfo?.providerName,
        routeName: legExtraInfo?.routeName ?? '',
        selectedServiceTier: legExtraInfo?.selectedServiceTier,
        alternateShortNames: legExtraInfo?.alternateShortNames ?? [],
        routeCode: legExtraInfo?.routeCode ?? '',
        upcomingBusInfo,
        distance,
        onClassChange,
        ticketState: 'review',
        btDispatch,
        isDataLoading,
        isStatic: false,
        timeTableProps,
        transitTime,
        bookingAllowed: legInfo.bookingAllowed,
        showPassText,
        totalTicketCount,
    };

    return <BusTransitCell {...BusTransitCellViewState} />;
};
