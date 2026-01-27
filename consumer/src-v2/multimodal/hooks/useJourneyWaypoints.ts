import { useState, useEffect } from 'react';
import { type latLong as LatLongType } from '@/readOnly/api/types/LatLong.gen';
import { useFrfsRouteRouteCodeGetMutation } from '@/api/integrations/rtk/FrfsRouteRouteCodeGet';
import { useTripRoutePostMutation } from '@/api/integrations/rtk/TripRoutePost';
import {
    getFrfsVehicleType,
    mapTravelModeToTransitMode,
    extractRouteCode,
    createLegOrder,
    parseGatesInfo,
    parseGeoJson,
} from '../utils/journeyTrackingUtils';
import { type StopType } from '../types/journeyTracking';
import { type fRFSStationAPI as FRFSStation_station } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { calculateDistance, usePublicTransportUtils } from '../utils/PublicTransportUtils';
import { type getRoutesReq } from '@/readOnly/api/types/GetRoutesReq.gen';
import {
    type FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    type TravelMode_travelMode,
} from '@/readOnly/api/types/Enums.gen';
import { getCache, setCache, getWaypointsFromCache, setWaypointsInCache, shouldInvalidateCache } from '../utils/cache';
import { capitalize } from '../utils/journeyTrackingUtils';
import { useNetworkAware } from './useNetworkAware';
import type { legInfo as LegInfo_legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { selectMerchantOperatingCityName } from '@/typescript/state/client/journey';
import { JourneyId } from '@/typescript/state/client/user';
import { useAppSelector } from '@/typescript/state/hooks';
import { checkTaxiLeg } from '@/typescript/utils/common';

export type WaypointFetchState = {
    data: { waypoints: LatLongType[]; stops: StopType } | null;
    isLoading: boolean;
    error: unknown;
};

export const useJourneyWaypoints = (journeyId: JourneyId | null, legs: LegInfo_legInfo[] | null, mockMode: boolean) => {
    const [legWaypoints, setLegWaypoints] = useState<Record<string, WaypointFetchState>>({});
    const [fetchPublicTransportWaypoints] = useFrfsRouteRouteCodeGetMutation();
    const { getStationByCode } = usePublicTransportUtils({ enabled: true, maxStopDistance: 1000 });
    const merchantOperatingCityName = useAppSelector(state => selectMerchantOperatingCityName(state, journeyId));
    const [fetchWalkTaxiWaypoints] = useTripRoutePostMutation();
    const { shouldMakeApiCalls, isNetworkStateKnown } = useNetworkAware();

    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    const operatingCity: FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity = (merchantOperatingCityName ??
        'Chennai') as FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity;

    useEffect(() => {
        if (mockMode || !legs) return;

        const fetchAllWaypoints = async () => {
            if (!legs) return;

            const waypointPromises = legs.map(async metaLeg => {
                const transitMode = mapTravelModeToTransitMode(
                    metaLeg?.travelMode,
                    metaLeg.legExtraInfo.TAG === 'Taxi' ? metaLeg.legExtraInfo._0.serviceTierName : undefined,
                );
                const legOrderKey = createLegOrder(metaLeg);
                const vehicleType = getFrfsVehicleType(transitMode);
                const routeCode = extractRouteCode(metaLeg);
                const cacheKey = `waypoints_v5_${routeCode}_${vehicleType}`;
                // Always check cache first
                const cachedData = getCache<{ waypoints: LatLongType[]; stops: StopType }>(cacheKey);

                // If we have cached data and no internet, use cached data
                if (cachedData && !shouldMakeApiCalls) {
                    console.info(`[Waypoints] Offline mode: using cached data for ${legOrderKey}`);
                    setLegWaypoints(prev => ({
                        ...prev,
                        [legOrderKey]: { data: cachedData, isLoading: false, error: null },
                    }));
                    return;
                }

                // If we have cached data and internet, check if we should invalidate
                if (cachedData && shouldMakeApiCalls && !shouldInvalidateCache(cacheKey, true, false)) {
                    setLegWaypoints(prev => ({
                        ...prev,
                        [legOrderKey]: { data: cachedData, isLoading: false, error: null },
                    }));
                    return;
                }

                // If no internet and no cache, return empty data with error
                // But only warn if network state is known (to avoid false warnings during initialization)
                if (!shouldMakeApiCalls) {
                    if (isNetworkStateKnown) {
                        console.warn(`[Waypoints] Offline mode: no cached data available for ${legOrderKey}`);
                        setLegWaypoints(prev => ({
                            ...prev,
                            [legOrderKey]: {
                                data: { waypoints: [], stops: [] },
                                isLoading: false,
                                error: new Error('No internet connection and no cached data available'),
                            },
                        }));
                    } else {
                        console.info(
                            `[Waypoints] Network state unknown, waiting for proper detection for ${legOrderKey}`,
                        );
                        setLegWaypoints(prev => ({
                            ...prev,
                            [legOrderKey]: {
                                data: { waypoints: [], stops: [] },
                                isLoading: false,
                                error: null, // Don't set error when network state is unknown
                            },
                        }));
                    }
                    return;
                }

                try {
                    if (transitMode === 'BUS' || transitMode === 'METRO' || transitMode === 'SUBWAY') {
                        if (vehicleType && routeCode) {
                            try {
                                const response = await fetchPublicTransportWaypoints({
                                    routeCode,
                                    city: operatingCity ?? 'Chennai',
                                    vehicleType,
                                    platformType: 'MULTIMODAL',
                                }).unwrap();
                                const waypointsToSet = response.waypoints || [];

                                const legOriginLatLong: LatLongType | undefined = (() => {
                                    if (metaLeg.legExtraInfo.TAG === 'Bus' && metaLeg.legExtraInfo._0.originStop) {
                                        return {
                                            lat: metaLeg.legExtraInfo._0.originStop.lat ?? 0,
                                            lon: metaLeg.legExtraInfo._0.originStop.lon ?? 0,
                                        };
                                    }
                                    if (
                                        (metaLeg.legExtraInfo.TAG === 'Metro' ||
                                            metaLeg.legExtraInfo.TAG === 'Subway') &&
                                        metaLeg.legExtraInfo._0?.routeInfo?.[0]?.originStop
                                    ) {
                                        const stop = metaLeg.legExtraInfo._0.routeInfo[0].originStop;
                                        return { lat: stop.lat ?? 0, lon: stop.lon ?? 0 };
                                    }
                                    return undefined;
                                })();

                                const stopsToSet: StopType = (response.stops || []).map(
                                    (apiStop: FRFSStation_station, index: number) => {
                                        const stopDistanceStrCalc = () => {
                                            if (
                                                legOriginLatLong &&
                                                typeof apiStop.lat === 'number' &&
                                                typeof apiStop.lon === 'number'
                                            ) {
                                                return calculateDistance(
                                                    legOriginLatLong.lat,
                                                    legOriginLatLong.lon,
                                                    apiStop.lat,
                                                    apiStop.lon,
                                                );
                                            }
                                            return 0;
                                        };
                                        const distance = stopDistanceStrCalc();
                                        const station =
                                            vehicleType !== 'BUS' ? getStationByCode(apiStop.code) : undefined;
                                        const transportStationPart = {
                                            name: capitalize(apiStop.name),
                                            code: apiStop.code,
                                            lat: apiStop.lat,
                                            lon: apiStop.lon,
                                            vehicleType,
                                        };
                                        const mappedStop = {
                                            ...transportStationPart,
                                            stopCode: apiStop.code,
                                            sequenceNum: index + 1,
                                            distance: distance,
                                            parsedGatesInfo: parseGatesInfo(station?.gatesInfo),
                                            parsedGeoJson: parseGeoJson(station?.geoJson),
                                            timeFromPrev: apiStop.timeTakenToTravelUpcomingStop ?? 150,
                                        };
                                        return mappedStop;
                                    },
                                );
                                const waypoints = (() => {
                                    if (waypointsToSet.length > 0) {
                                        return waypointsToSet;
                                    }
                                    return stopsToSet
                                        .map(stop => ({
                                            lat: stop.lat ?? 0,
                                            lon: stop.lon ?? 0,
                                        }))
                                        .filter(point => point.lat !== 0 && point.lon !== 0);
                                })();
                                const dataToCache = { waypoints, stops: stopsToSet };
                                setCache(cacheKey, dataToCache);
                                setLegWaypoints(prev => ({
                                    ...prev,
                                    [legOrderKey]: {
                                        data: dataToCache,
                                        isLoading: false,
                                        error: null,
                                    },
                                }));
                            } catch (error: unknown) {
                                console.error(`Error fetching waypoints for leg ${legOrderKey}:`, error);
                                setLegWaypoints(prev => ({
                                    ...prev,
                                    [legOrderKey]: {
                                        data: { waypoints: [], stops: [] },
                                        isLoading: false,
                                        error: undefined,
                                    },
                                }));
                            }
                        } else {
                            setLegWaypoints(prev => ({
                                ...prev,
                                [legOrderKey]: {
                                    data: { waypoints: [], stops: [] },
                                    isLoading: false,
                                    error: new Error('Missing params for public transport waypoints'),
                                },
                            }));
                        }
                    } else if (checkTaxiLeg(transitMode, true)) {
                        if (
                            (metaLeg.legExtraInfo.TAG === 'Walk' || metaLeg.legExtraInfo.TAG === 'Taxi') &&
                            metaLeg.legExtraInfo._0.origin &&
                            metaLeg.legExtraInfo._0.destination
                        ) {
                            const origin: LatLongType = {
                                lat: metaLeg.exit?.lat ?? metaLeg.legExtraInfo._0.origin.lat,
                                lon: metaLeg.exit?.lon ?? metaLeg.legExtraInfo._0.origin.lon,
                            };
                            const destination: LatLongType = {
                                lat: metaLeg.entrance?.lat ?? metaLeg.legExtraInfo._0.destination.lat,
                                lon: metaLeg.entrance?.lon ?? metaLeg.legExtraInfo._0.destination.lon,
                            };

                            const cachedWaypoints = getWaypointsFromCache(
                                origin,
                                destination,
                                transitMode === 'WALK' ? 'WALK' : 'TAXI',
                            );
                            if (cachedWaypoints) {
                                setLegWaypoints(prev => ({
                                    ...prev,
                                    [legOrderKey]: { data: cachedWaypoints, isLoading: false, error: null },
                                }));
                                return;
                            }

                            const modeApi: TravelMode_travelMode = transitMode === 'WALK' ? 'FOOT' : 'CAR';
                            const body: getRoutesReq = {
                                waypoints: [origin, destination],
                                mode: modeApi,
                                calcPoints: true,
                            };
                            const response = await fetchWalkTaxiWaypoints({ body }).unwrap();
                            const waypointsToSet = response[0]?.points || [];
                            const stopsToSet: StopType = [];
                            const dataToCache = { waypoints: waypointsToSet, stops: stopsToSet };
                            setWaypointsInCache(
                                origin,
                                destination,
                                transitMode === 'WALK' ? 'WALK' : 'TAXI',
                                dataToCache,
                            );
                            setLegWaypoints(prev => ({
                                ...prev,
                                [legOrderKey]: {
                                    data: dataToCache,
                                    isLoading: false,
                                    error: null,
                                },
                            }));
                        } else {
                            setLegWaypoints(prev => ({
                                ...prev,
                                [legOrderKey]: {
                                    data: { waypoints: [], stops: [] },
                                    isLoading: false,
                                    error: new Error('Missing origin/destination for walk/taxi waypoints'),
                                },
                            }));
                        }
                    } else {
                        setLegWaypoints(prev => ({
                            ...prev,
                            [legOrderKey]: { data: { waypoints: [], stops: [] }, isLoading: false, error: null },
                        }));
                    }
                } catch (error: unknown) {
                    console.error(`Error fetching waypoints for leg ${legOrderKey}:`, error);

                    // In case of API error, try to use cached data if available
                    const fallbackCachedData = getCache<{ waypoints: LatLongType[]; stops: StopType }>(cacheKey);
                    if (fallbackCachedData) {
                        console.info(`[Waypoints] API failed, falling back to cached data for ${legOrderKey}`);
                        setLegWaypoints(prev => ({
                            ...prev,
                            [legOrderKey]: { data: fallbackCachedData, isLoading: false, error: null },
                        }));
                    } else {
                        setLegWaypoints(prev => ({
                            ...prev,
                            [legOrderKey]: { data: { waypoints: [], stops: [] }, isLoading: false, error },
                        }));
                    }
                }
            });
            await Promise.all(waypointPromises.filter(p => p !== undefined));
        };

        fetchAllWaypoints();
    }, [legs, mockMode, shouldMakeApiCalls, isNetworkStateKnown]);

    return legWaypoints;
};
