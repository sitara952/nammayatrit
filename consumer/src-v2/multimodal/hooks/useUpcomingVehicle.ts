import { useEffect, useState } from 'react';
import { upcomingVehicleInfo } from '@/readOnly/api/types/UpcomingVehicleInfo.gen';
import { useNextVehicleDetailsRouteCodeStopCodeGetQuery } from '@/api/integrations/rtk/NextVehicleDetailsRouteCodeStopCodeGet';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';

type UseUpcomingVehicleProps = {
    routeCode: string;
    stopCode: string;
    vehicleType: VehicleCategory_vehicleCategory;
    serviceTierType: string | undefined;
    enabled: boolean | undefined;
};

type UseUpcomingVehicleResult = {
    upcomingVehicleInfo: upcomingVehicleInfo | null;
    allUpcomingVehicles: upcomingVehicleInfo[];
    isLoading: boolean;
    error: string | undefined;
};

/**
 * Custom hook for fetching and processing upcoming vehicle information
 *
 * @param routeCode - The code of the route
 * @param stopCode - The code of the stop
 * @param vehicleType - The type of vehicle (BUS, SUBWAY, etc.)
 * @param serviceTierType - Optional filter for service tier type
 * @param enabled - Whether the query should be enabled (defaults to true if required params are provided)
 * @returns Object containing the nearest upcoming vehicle, all vehicles, loading state and error
 */
export const useUpcomingVehicle = ({
    routeCode,
    stopCode,
    vehicleType,
    serviceTierType,
    enabled,
}: UseUpcomingVehicleProps): UseUpcomingVehicleResult => {
    const [upcomingVehicleInfo, setUpcomingVehicleInfo] = useState<upcomingVehicleInfo | null>(null);
    const [allUpcomingVehicles, setAllUpcomingVehicles] = useState<upcomingVehicleInfo[]>([]);

    // Skip query if required parameters are missing or if explicitly disabled
    const shouldSkip = !stopCode || !routeCode || enabled === false;

    const {
        data: upcomingVehiclesResp,
        isLoading,
        error,
    } = useNextVehicleDetailsRouteCodeStopCodeGetQuery(
        {
            routeCode,
            stopCode,
            vehicleType,
        },
        {
            skip: shouldSkip,
        },
    );

    // Process and sort upcoming vehicles when data is available
    useEffect(() => {
        if (upcomingVehiclesResp?.upcomingVehicles) {
            // Filter by service tier type if provided
            const filteredVehicles = serviceTierType
                ? upcomingVehiclesResp.upcomingVehicles.filter(vehicle => vehicle.serviceType === serviceTierType)
                : upcomingVehiclesResp.upcomingVehicles;

            // Sort by arrival time
            const sortedVehicles = [...filteredVehicles].sort((a, b) => {
                const timeA = new Date(a.arrivalTimeInSeconds).getTime();
                const timeB = new Date(b.arrivalTimeInSeconds).getTime();
                return timeA - timeB;
            });

            setAllUpcomingVehicles(sortedVehicles);
            setUpcomingVehicleInfo(sortedVehicles[0] || null);
        } else {
            setAllUpcomingVehicles([]);
            setUpcomingVehicleInfo(null);
        }
    }, [upcomingVehiclesResp, serviceTierType]);

    return {
        upcomingVehicleInfo,
        allUpcomingVehicles,
        isLoading,
        error: error ? String(error) : undefined,
    };
};
