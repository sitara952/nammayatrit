import { useMemo, useEffect } from 'react';
import { useFrfsStationsPossibleStopsPostMutation } from '@/api/integrations/rtk/FrfsStationsPossibleStopsPost';
import {
    FrfsAutocompletePlatformType_frfsAutocompletePlatformType,
    FrfsStationsCity_frfsStationsCity,
    FrfsStationsVehicleType_frfsStationsVehicleType,
} from '@/readOnly/api/types/Enums.gen';
import { transportRoute, transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import { usePublicTransportUtils } from '../utils/PublicTransportUtils';

interface UseFrfsStationsDataParams {
    sourceStationCode: string;
    vehicleType?: FrfsStationsVehicleType_frfsStationsVehicleType;
    city?: FrfsStationsCity_frfsStationsCity;
    enabled?: boolean;
    minimalData?: boolean;
    platformType?: FrfsAutocompletePlatformType_frfsAutocompletePlatformType | undefined;
}

interface UseFrfsStationsDataReturn {
    transformedStations: transportStation[];
    transformedRoutes: transportRoute[];
    destStationParentStopCodeMap: Record<string, string | undefined>;
    isLoading: boolean;
}

// Hook to fetch and transform FRFS stations data based on the selected source station code and other parameters
export const useFrfsStationsData = ({
    sourceStationCode,
    vehicleType = 'BUS',
    city = 'Bhubaneshwar',
    enabled = true,
    platformType = 'MULTIMODAL',
}: UseFrfsStationsDataParams): UseFrfsStationsDataReturn => {
    const { getStationByCode, getRouteByCode, getStationsByName } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    const stationCodes = useMemo(() => {
        if (!enabled) return undefined;
        const stations = getStationsByName(sourceStationCode);
        return stations ? { stationCodes: stations.map(station => station.code) } : undefined;
    }, [getStationsByName, sourceStationCode]);

    // FRFS stations API query
    const [triggerFrfsStations, { data: frfsStations, isLoading }] = useFrfsStationsPossibleStopsPostMutation();

    // Trigger the mutation when parameters change
    useEffect(() => {
        if (enabled && stationCodes) {
            triggerFrfsStations({
                city,
                platformType,
                vehicleType,
                body: stationCodes,
            });
        }
    }, [enabled, city, platformType, vehicleType, stationCodes]);

    // Transform frfsStations into transportStation[]
    const transformedStations = useMemo((): transportStation[] => {
        if (!frfsStations || !Array.isArray(frfsStations)) return [];
        return frfsStations.reduce<transportStation[]>((acc, station) => {
            const fullStationInfo = getStationByCode(station.code);
            if (fullStationInfo) {
                return [...acc, fullStationInfo];
            }
            return acc;
        }, []);
    }, [frfsStations, getStationByCode]);

    // Transform frfsStations into transportRoute[]
    const transformedRoutes = useMemo((): transportRoute[] => {
        if (!frfsStations || !Array.isArray(frfsStations)) return [];

        const uniqueRoutes: transportRoute[] = frfsStations.reduce<transportRoute[]>((acc, station) => {
            const routes: transportRoute[] =
                station.routeCodes?.reduce<transportRoute[]>((routeAcc, routeCode) => {
                    const routeInfo = getRouteByCode(routeCode);
                    if (routeInfo && !acc.some((r: transportRoute) => r.code === routeInfo.code)) {
                        return [...routeAcc, routeInfo];
                    }
                    return routeAcc;
                }, []) || [];

            return [...acc, ...routes];
        }, []);

        const res = uniqueRoutes.filter(
            (route: transportRoute, index: number, self: transportRoute[]) =>
                index === self.findIndex((r: transportRoute) => r.code === route.code),
        );
        return res;
    }, [frfsStations, getRouteByCode]);

    const destStationParentStopCodeMap = useMemo((): Record<string, string | undefined> => {
        if (!frfsStations || !Array.isArray(frfsStations)) return {};

        return frfsStations.reduce<Record<string, string | undefined>>((acc, station) => {
            if (station.code) {
                return {
                    ...acc,
                    [station.code]: station.parentStopCode ?? undefined,
                };
            }
            return acc;
        }, {});
    }, [frfsStations]);

    return {
        transformedStations,
        transformedRoutes,
        destStationParentStopCodeMap,
        isLoading,
    };
};
