import { usePlacesPostMutation } from '@/api/integrations/rtk/PlacesPost';
import { selectCurrentLocationCoords } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { useCallback, useState, useEffect, useRef } from 'react';
import { deleteItem, getStringItem, MMKVKey, setStringItem } from '@/typescript/utils/MMKV';
import { RecentMultimodalTrip } from '@/src-v2/screens/HomeScreen/Types';
import { GeneralVehicleType_generalVehicleType } from '@/readOnly/api/types/Enums.gen';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { RepeatBookingListItem } from '../screens/SingleModeSearch/Types';
import { usePublicTransportUtils } from '../utils/PublicTransportUtils';

const castGeneralVehicleTypeToMultimodalTravelMode = (
    vehicleType: GeneralVehicleType_generalVehicleType,
): MultimodalTravelMode_multimodalTravelMode => {
    switch (vehicleType) {
        case 'Bus':
            return 'Bus';
        case 'MetroRail':
            return 'Metro';
        case 'Subway':
            return 'Subway';
        case 'Walk':
            return 'Walk';
        default:
            return 'Walk';
    }
};

// Function to clear the cache
export const clearRecentMultimodalTripsCache = () => {
    console.error('Clearing recent multimodal trips cache');
    deleteItem(MMKVKey.RECENT_MULTIMODAL_TRIPS);
    deleteItem(MMKVKey.RECENT_SINGLE_MODE_TRIPS);
};

export const useRecentMultimodalTrips = (skip = false) => {
    const { getRouteByCode, getStationByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });
    const [fetchRecentMultimodalTrips] = usePlacesPostMutation();
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const [recentMultimodalTrips, setRecentMultimodalTrips] = useState<RecentMultimodalTrip[]>([]);
    const [recentSingleModeTrips, setRecentSingleModeTrips] = useState<RepeatBookingListItem[]>([]);
    const hasFetched = useRef(false);

    const getCachedMultimodalTrips = useCallback(() => {
        const cachedData = getStringItem(MMKVKey.RECENT_MULTIMODAL_TRIPS);
        if (cachedData) {
            try {
                return safeJsonParse<RecentMultimodalTrip[]>(cachedData, [], 'RecentMultimodalTrip');
            } catch (error) {
                console.error('Error parsing cached trips:', error);
                return [];
            }
        }
        return [];
    }, []);

    const getCachedSingleModeTrips = useCallback(() => {
        const cachedData = getStringItem(MMKVKey.RECENT_SINGLE_MODE_TRIPS);
        if (cachedData) {
            try {
                return safeJsonParse<RepeatBookingListItem[]>(cachedData, [], 'RepeatBookingListItem');
            } catch (error) {
                console.error('Error parsing cached single mode trips:', error);
                return [];
            }
        }
        return [];
    }, []);

    const cacheSingleModeTrips = useCallback((trips: RepeatBookingListItem[]) => {
        setStringItem(MMKVKey.RECENT_SINGLE_MODE_TRIPS, JSON.stringify(trips));
    }, []);

    const cacheMultimodalTrips = useCallback((trips: RecentMultimodalTrip[]) => {
        setStringItem(MMKVKey.RECENT_MULTIMODAL_TRIPS, JSON.stringify(trips));
    }, []);

    const fetchTrips = useCallback(async () => {
        if (skip || !currentLocationCoords) return;

        try {
            const result = await fetchRecentMultimodalTrips({
                body: {
                    userLat: currentLocationCoords?.coords.latitude,
                    userLon: currentLocationCoords?.coords.longitude,
                    integratedBppConfigId: '', // not used at backend, remove it
                },
            });
            if ('data' in result) {
                const locations = result.data?.recentLocations.concat(result.data?.popularLocations);
                const multimodalTrips: RecentMultimodalTrip[] | undefined = locations?.reduce<RecentMultimodalTrip[]>(
                    (acc: RecentMultimodalTrip[], multimodalLocation) => {
                        if (multimodalLocation.mode !== 'MULTIMODAL') return acc;
                        const multimodalRoutes = multimodalLocation.multimodalRoutes ?? [];
                        const firstRoute = multimodalRoutes[0];
                        if (!firstRoute) return acc;
                        const journeyIncludes = firstRoute.legs.map(leg => ({
                            mode: castGeneralVehicleTypeToMultimodalTravelMode(leg.mode),
                            busInfo: leg.routeDetails[0]?.shortName ?? '',
                        }));
                        return [
                            ...acc,
                            {
                                title: multimodalLocation.name,
                                journeyIncludes,
                                destination: {
                                    lat: multimodalLocation.lat,
                                    lng: multimodalLocation.lon,
                                    placeId: multimodalLocation.recentLocationId,
                                    title: multimodalLocation.name,
                                    subtitle: multimodalLocation.address,
                                    formattedAddress: multimodalLocation.address,
                                    tag: 'PUBLIC_TRANSPORT_RECENTS',
                                    addressComponents: {
                                        area: multimodalLocation.address,
                                        areaCode: undefined,
                                        building: multimodalLocation.name,
                                        city: undefined,
                                        country: undefined,
                                        door: undefined,
                                        extras: undefined,
                                        instructions: undefined,
                                        placeId: undefined,
                                        state: undefined,
                                        street: undefined,
                                        title: multimodalLocation.name,
                                        ward: undefined,
                                    },
                                    hotSpotInfo: undefined,
                                    serviceable: undefined,
                                    serviceabilityCity: undefined,
                                    specialLocation: undefined,
                                    locationType: undefined,
                                    distanceFromCurrentLocation: undefined,
                                },
                                cost: multimodalLocation?.fare,
                            },
                        ];
                    },
                    [],
                );

                const singleModeTripsGrouped = locations?.reduce<Record<string, RepeatBookingListItem>>((acc, ride) => {
                    if (ride.mode === 'MULTIMODAL') return acc;
                    if (!ride.routeCode || !ride.fromStationCode || !ride.toStationCode) return acc;

                    const fromStop = getStationByCode(ride.fromStationCode);
                    const toStop = getStationByCode(ride.toStationCode);
                    const route = getRouteByCode(ride.routeCode);

                    const newEntry: RepeatBookingListItem = {
                        fromStopName: fromStop?.name,
                        toStopName: toStop?.name,
                        price: ride.fare ?? 0,
                        routeCode: ride.routeCode,
                        routeShortName: route?.shortName,
                        fromStopCode: ride.fromStationCode,
                        toStopCode: ride.toStationCode,
                    };

                    // Create a unique key combining fromStopCode and toStopCode
                    const stopPairKey = `${ride.fromStationCode}_${ride.toStationCode}`;

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

                const singleModeTrips = Object.values(singleModeTripsGrouped ?? {});

                if (multimodalTrips) {
                    cacheMultimodalTrips(multimodalTrips);
                    setRecentMultimodalTrips(multimodalTrips);
                }

                if (singleModeTrips) {
                    cacheSingleModeTrips(singleModeTrips);
                    setRecentSingleModeTrips(singleModeTrips);
                }
            }
        } catch (error) {
            console.error('Error fetching recent multimodal trips:', error);
            // Fallback to cached data if available
            const cachedTrips = getCachedMultimodalTrips();
            if (cachedTrips.length > 0) {
                setRecentMultimodalTrips(cachedTrips);
            }

            const cachedSingleModeTrips = getCachedSingleModeTrips();
            if (cachedSingleModeTrips.length > 0) {
                setRecentSingleModeTrips(cachedSingleModeTrips);
            }
        }
    }, [
        currentLocationCoords?.coords.latitude,
        currentLocationCoords?.coords.longitude,
        fetchRecentMultimodalTrips,
        cacheMultimodalTrips,
        getCachedMultimodalTrips,
        getCachedSingleModeTrips,
        cacheSingleModeTrips,
        skip,
    ]);

    useEffect(() => {
        if (skip) return;

        const cachedTrips = getCachedMultimodalTrips();
        const cachedSingleModeTrips = getCachedSingleModeTrips();
        if (cachedTrips.length > 0) {
            setRecentMultimodalTrips(cachedTrips);
        } else if (cachedSingleModeTrips.length > 0) {
            setRecentSingleModeTrips(cachedSingleModeTrips);
        } else if (currentLocationCoords && !hasFetched.current) {
            // Only fetch if there's no cached data and we have location
            fetchTrips();
            hasFetched.current = true;
        }
    }, [skip, currentLocationCoords]);

    const addTripToCache = useCallback(
        (trip: RecentMultimodalTrip) => {
            if (skip) return;
            const currentTrips = getCachedMultimodalTrips();
            const updatedTrips = [trip, ...currentTrips];
            cacheMultimodalTrips(updatedTrips);
            setRecentMultimodalTrips(updatedTrips);
        },
        [getCachedMultimodalTrips, cacheMultimodalTrips, skip],
    );

    return {
        recentMultimodalTrips: recentMultimodalTrips.length > 0 ? recentMultimodalTrips : [],
        recentSingleModeTrips: recentSingleModeTrips.length > 0 ? recentSingleModeTrips : [],
        addTripToCache,
    };
};
