import { useCallback, useState, useMemo, useEffect } from 'react';
import { useNearbyBusBookingPostMutation } from '@/api/integrations/rtk/NearbyBusBookingPost';
import { nearbyBusesResponse } from '@/readOnly/api/types/NearbyBusesResponse.gen';
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { RepeatBookingListItem, RouteCard } from '../Types';
import { usePublicTransportUtils } from '../../../utils/PublicTransportUtils';
import { nearbyBusBookingPostWithParams } from '../../../../../src/api/integrations/rtk/NearbyBusBookingPost';
import { logger } from '@/src-v2/systems/logger';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const useNearbyBusesData = (
    currentLocationCoords: { latitude: number; longitude: number } | null,
    vehicleType: VehicleCategory_vehicleCategory,
    requireNearbyBuses: boolean | undefined,
    requireRecentRide: boolean | undefined,
) => {
    const [recentBookings, setRecentBookings] = useState<RepeatBookingListItem[] | undefined>(undefined);
    const [nearbyRoutes, setNearbyRoutes] = useState<RouteCard[] | undefined>(undefined);
    const { getRouteByCode, getStationByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });
    // Using the RTK mutation hook
    const [getNearbyBuses, { data: nearbyBusData, isLoading }] = useNearbyBusBookingPostMutation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    // Memoize request parameters
    const requestParams: nearbyBusBookingPostWithParams | undefined = useMemo(
        () =>
            currentLocationCoords
                ? {
                      body: {
                          platformType: 'MULTIMODAL',
                          requireRecentRide: requireRecentRide ?? false,
                          userLat: currentLocationCoords.latitude,
                          userLon: currentLocationCoords.longitude,
                          requireNearbyBuses: requireNearbyBuses ?? false,
                          vehicleType,
                      },
                  }
                : undefined,
        [currentLocationCoords?.latitude, currentLocationCoords?.longitude],
    );

    // Transform API response to RepeatBookingListItem
    const transformRecentRidesData = useCallback((data: nearbyBusesResponse): RepeatBookingListItem[] => {
        if (!data?.recentRides || data.recentRides.length === 0) return [];

        // Group rides by fromStopCode and toStopCode combination
        const routeGroups = data.recentRides.reduce<Record<string, RepeatBookingListItem>>((acc, ride) => {
            if (!ride.routeCode || !ride.fromStopCode || !ride.toStopCode) return acc;

            const fromStop = getStationByCode(ride.fromStopCode);
            const toStop = getStationByCode(ride.toStopCode);
            const route = getRouteByCode(ride.routeCode);

            if (!fromStop || !toStop || !route) return acc;

            const newEntry: RepeatBookingListItem = {
                fromStopName: fromStop.name,
                toStopName: toStop.name,
                price: ride.fare.amountInt,
                routeCode: ride.routeCode,
                routeShortName: route.shortName,
                fromStopCode: ride.fromStopCode,
                toStopCode: ride.toStopCode,
            };

            // Create a unique key combining fromStopCode and toStopCode
            const stopPairKey = `${ride.fromStopCode}_${ride.toStopCode}`;

            // If this stop pair already exists, update the price if higher
            if (acc[stopPairKey]) {
                return {
                    ...acc,
                    [stopPairKey]: {
                        ...newEntry,
                        price: Math.max(acc[stopPairKey]?.price || 0, newEntry.price),
                    },
                };
            }

            // Create new entry for this stop pair
            return {
                ...acc,
                [stopPairKey]: newEntry,
            };
        }, {});

        // Convert grouped data back to array
        return Object.values(routeGroups);
    }, []);

    // Transform nearbyBuses to RouteCard[]
    const transformNearbyBusesToRouteCards = useCallback(
        (data: nearbyBusesResponse): RouteCard[] => {
            if (!data?.nearbyBuses || data.nearbyBuses.length === 0) return [];

            // Group buses by routeCode
            const routeGroups = data.nearbyBuses.reduce<Record<string, number>>((acc, bus) => {
                if (!bus.routeCode) return acc;

                // Use routeCode as key for grouping
                const key = bus.routeCode;
                return {
                    ...acc,
                    [key]: (acc[key] || 0) + 1,
                };
            }, {});

            // Convert to RouteCard format using route's longName

            return Object.entries(routeGroups)
                .map<RouteCard | null>(([routeCode, count]) => {
                    const route = getRouteByCode(routeCode);
                    if (!route) return null;
                    return {
                        routeText: route?.longName || userLanguageStrings.Bus + ' ' + routeCode, // Fallback to routeCode if longName is not available
                        busesText: userLanguageStrings.BusesFoundInThisRoute(count),
                        routeCode: routeCode,
                    };
                })
                .filter((routeCard): routeCard is RouteCard => routeCard !== null);
        },
        [getRouteByCode],
    );

    // Function to fetch nearby buses
    const fetchNearbyBuses = useCallback(async () => {
        try {
            if (requestParams) {
                await getNearbyBuses(requestParams);
            }
        } catch (error) {
            console.error('Error fetching nearby buses:', error);
        }
    }, [getNearbyBuses, requestParams]);

    // Update state when nearbyBusData changes
    useEffect(() => {
        if (nearbyBusData) {
            logger.logInfo(
                `Received nearby buses data with ${nearbyBusData.nearbyBuses?.length || 0} buses and ${nearbyBusData.recentRides?.length || 0} recent rides`,
                'BookingFlow',
            );
            // Update recent bookings
            const transformedBookings = transformRecentRidesData(nearbyBusData);
            setRecentBookings(transformedBookings);

            // Update nearby routes
            const transformedRoutes = transformNearbyBusesToRouteCards(nearbyBusData);
            setNearbyRoutes(transformedRoutes);
        }
    }, [nearbyBusData]);

    // Call the API when hook is initialized
    useEffect(() => {
        fetchNearbyBuses();
    }, []);

    return {
        recentBookings,
        nearbyRoutes,
        nearbyBusData,
        isLoading,
        refetch: fetchNearbyBuses,
    };
};
