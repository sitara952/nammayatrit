import { useCallback } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { upcomingVehicleInfo } from '@/readOnly/api/types/UpcomingVehicleInfo.gen';
import { transportRoute, transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { latLong } from '@/readOnly/api/types/LatLong.gen';
import { EnhancedStopMapping } from '../screens/SingleModeTicketBooking/Types';
import { TimeEntry } from '../types/journeyTracking';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { processTimetableEntry } from './useTimetables';
import { availableRoute } from '@/readOnly/api/types/AvailableRoute.gen';

type UseLiveOrGTFSProps = {
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    route: transportRoute | string | undefined;
    routeName: string | undefined;
    sourceStop: transportStation | undefined;
    destinationStop: transportStation | undefined;
    routeStops: EnhancedStopMapping[] | undefined;
    vehicleType: VehicleCategory_vehicleCategory;
    waypoints: latLong[] | undefined;
    fromJourneyInfoScreen: boolean;
    fromSingleModeSearch: boolean | undefined;
    onBusRouteSwitch: ((routeInfo: availableRoute, legOrder?: number) => Promise<unknown>) | undefined;
    journeyId: string | undefined;
    legOrder: number | undefined;
};

type dataSource = 'GTFS' | 'LIVE';

type LiveOrGTFSData = {
    source: dataSource;
    nextAvailableTimings: string[][] | undefined;
    upcomingVehicles: upcomingVehicleInfo[] | undefined;
};

type UseLiveOrGTFSResult = {
    handleLiveOrGTFS: (times: TimeEntry[], source: dataSource, fromJourneyInfoScreen: boolean) => void;
    getTimeTableTimes: (data: LiveOrGTFSData) => TimeEntry[];
};

export const useLiveOrGTFS = ({
    navigation,
    route: routeCode,
    routeName,
    sourceStop,
    destinationStop,
    routeStops,
    vehicleType,
    waypoints,
    fromJourneyInfoScreen,
    fromSingleModeSearch,
    onBusRouteSwitch,
    journeyId,
    legOrder,
}: UseLiveOrGTFSProps): UseLiveOrGTFSResult => {
    const { timeTableBottomSheetModalRef } = useRefsContext();

    const getTimeTableTimes = useCallback(
        (data: LiveOrGTFSData): TimeEntry[] => {
            if (data.nextAvailableTimings && data.nextAvailableTimings.length > 0) {
                const timings = data.nextAvailableTimings;
                const processedTimes = timings.flatMap((time, index) =>
                    processTimetableEntry(time[0], index, timings.length),
                );
                return processedTimes.slice().sort((a, b) => a.time - b.time);
            } else if (data.upcomingVehicles && data.upcomingVehicles.length > 0) {
                const vehicles = data.upcomingVehicles;
                const processedTimes = vehicles.flatMap((time, index) => {
                    return processTimetableEntry(time.nextAvailableTimings[0], index, vehicles.length);
                });
                return processedTimes.slice().sort((a, b) => a.time - b.time);
            }
            return [];
        },
        [processTimetableEntry],
    );

    const handleLiveOrGTFS = useCallback(
        (times: TimeEntry[], source: dataSource) => {
            if (source === 'GTFS') {
                if (times.length > 0) {
                    timeTableBottomSheetModalRef.current?.present();
                    return;
                }
            } else {
                navigation.navigate(
                    'busTracking',
                    {
                        routeCode: typeof routeCode === 'string' ? routeCode : routeCode?.code,
                        vehicleType,
                        fromJourneyInfoScreen,
                        fromSingleModeSearch,
                        sourceStop,
                        destinationStop,
                        onBusRouteSwitch,
                        journeyId,
                        legOrder,
                    },
                    { pop: !fromJourneyInfoScreen },
                );
            }
        },
        [
            navigation,
            routeCode,
            routeName,
            sourceStop,
            routeStops,
            vehicleType,
            waypoints,
            destinationStop,
            fromJourneyInfoScreen,
            onBusRouteSwitch,
            journeyId,
            legOrder,
        ],
    );

    return { handleLiveOrGTFS, getTimeTableTimes };
};
