/* eslint-disable functional/immutable-data */
/* eslint-disable functional/no-let */
import {
    DistanceUnit_distanceUnit as Enums_DistanceUnit_distanceUnit,
    FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType,
    MultimodalTravelMode_multimodalTravelMode,
    VehicleCategory_vehicleCategory,
} from '@/readOnly/api/types/Enums.gen';
import { journeyLeg } from '@/readOnly/api/types/JourneyLeg.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { legRouteInfo } from '@/readOnly/api/types/LegRouteInfo.gen';
import { metroLegExtraInfo } from '@/readOnly/api/types/MetroLegExtraInfo.gen';
import { subwayLegExtraInfo } from '@/readOnly/api/types/SubwayLegExtraInfo.gen';
import { taxiLegExtraInfo } from '@/readOnly/api/types/TaxiLegExtraInfo.gen';
import { walkLegExtraInfo } from '@/readOnly/api/types/WalkLegExtraInfo.gen';
import { dummyLocationApiEntity } from './location';
import { busLegExtraInfo } from '@/readOnly/api/types/BusLegExtraInfo.gen';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';
import { fRFSStationAPI } from '@/readOnly/api/types/FRFSStationAPI.gen';
import { NextStopType } from '@/src-v2/multimodal/screens/LiveJourneyTracking/Types';
import { LatLng } from 'react-native-maps';
import { latLong } from '@/api/apiTypes/GetPlaceNameApi.gen';
import { latLng } from '../../helpers/externalModules/GMap/ReactMap.gen';
import { findNearestPoint } from '../Maps/helpers/mapUtils';
import {
    frfsRouteRouteCodeGetWithParams,
    useFrfsRouteRouteCodeGetMutation,
} from '@/api/integrations/rtk/FrfsRouteRouteCodeGet';
import { frfsRouteResp } from '@/src-v2/multimodal/screens/JourneyInfoScreen/Types';
import { TransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';
import { transportRoute, transportStation } from '@/readOnly/api/types/PublicTransportData.gen';
import {
    createFrfsRouteCacheKey,
    setCacheEntry,
    accessCacheEntry,
    selectCachedRouteData,
} from '@/typescript/state/client/frfsRouteCache';
import { store } from '@/typescript/state/store';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { LegTickets } from '../state/client/journey';
import { strings } from 'config-types';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { getAddressFromComponents } from '@/helpers/utils/Location/LocationUtils.bs';
// consumer/src/typescript/utils/MultiModal.ts
import { location } from '../../helpers/utils/Location/LocationTypes.gen';
import { Journey } from '@/typescript/state/client/journey';
import { priceAPIEntity } from '@/readOnly/api/types/PriceAPIEntity.gen';
import { JourneyDetails } from '@/src-v2/screens/MyBookingDetails/Types';
import { logger } from '@/src-v2/systems/logger/index.ts';
import { TransitType as TransitTypeWithWait } from '@/src-v2/multimodal/screens/NewLiveJourney/utils/getTransitIconUtils';
import {
    LatLongStopInfo,
    TrackedLegInfoStaticInfo,
    TimeEntry,
    StopType,
    latLong as LatLongType,
} from '@/src-v2/multimodal/types/journeyTracking';
import { calculateDistance } from '@/src-v2/multimodal/utils/PublicTransportUtils';
import { routeAvailabilityResp } from '@/readOnly/api/types/RouteAvailabilityResp.gen';
import { shouldIncludeInPriceCalculation } from './LegStatusUtils';
import { isUndefined } from 'lodash';
import { transitModes } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/PaymentFooterWithoutPPWidget';

dayjs.extend(advancedFormat);

export function convertIsoToUtc(isoTime: string | undefined): string {
    if (isoTime == undefined) {
        return '';
    }
    const date = new Date(isoTime);
    const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    };
    return date.toLocaleTimeString('en-US', options);
}

export function calculateTotalFare(legs: legInfo[]): number {
    return legs.reduce(
        (fare, leg) =>
            fare +
            Math.ceil(leg.totalFare?.amount ?? leg.estimatedMaxFare?.amount ?? leg.estimatedMinFare?.amount ?? 0),
        0,
    );
}

export const calculateTotalPriceFromJourney = (journeyDetails: JourneyDetails | null): string => {
    if (!journeyDetails || !journeyDetails.journeyModes) {
        return '0';
    }

    const totalPrice = journeyDetails.journeyModes.reduce((total, leg) => {
        if (!shouldIncludeInPriceCalculation(leg)) {
            return total;
        }

        const legPrice =
            leg.totalFare?.amount ??
            (leg.legExtraInfo.TAG === 'Bus'
                ? (leg.legExtraInfo._0?.selectedServiceTier?.fare?.amount ?? leg.estimatedMinFare?.amount ?? 0)
                : leg?.travelMode === 'Taxi'
                  ? (leg.estimatedMaxFare?.amount ?? leg.estimatedMinFare?.amount ?? 0)
                  : (leg.estimatedMinFare?.amount ?? 0));

        return total + (legPrice > 0 ? legPrice : 0);
    }, 0);

    return totalPrice.toString();
};

export const sortRoutes = (availableRoutesResp: routeAvailabilityResp | undefined) => {
    return availableRoutesResp?.availableRoutes
        ? [...availableRoutesResp.availableRoutes].sort((a, b) => {
              const firstTimingA = a.routeTimings[0];
              const firstTimingB = b.routeTimings[0];
              if (!firstTimingA && !firstTimingB) return 0;
              if (!firstTimingA) return 1;
              if (!firstTimingB) return -1;
              return firstTimingA - firstTimingB;
          })
        : undefined;
};

export const getWalkingDistance = (journeyLegs: journeyLeg[]): [number, string] => {
    const walkingLegs = journeyLegs.filter(leg => leg.journeyMode === 'Walk');

    if (walkingLegs.length === 0) {
        return [0, ''];
    }

    return walkingLegs.reduce<[number, string]>(
        ([accDistance, accUnit], currentLeg) => {
            if (currentLeg.distance) {
                return [accDistance + currentLeg.distance.value, currentLeg.distance.unit];
            }
            return [accDistance, accUnit];
        },
        [0, ''],
    );
};

export const getWalkingDistanceText = (journeyLegs: journeyLeg[]): string => {
    const walkingDistanceResult = getWalkingDistance(journeyLegs);
    const distance = walkingDistanceResult[0];
    const unit = walkingDistanceResult[1];
    if (distance != 0) {
        const walkingDistance =
            unit === 'Meter'
                ? `${Math.ceil(distance)} m`
                : unit === 'Kilometer'
                  ? `${distance} km`
                  : `${distance} ${unit}`;
        return `${walkingDistance} total walking distance`;
    } else {
        return 'No walking';
    }
};

export const getJourneyLegSourceInfo = (leg: legInfo | undefined) => {
    const sourceInfo = (() => {
        switch (leg?.legExtraInfo?.TAG) {
            case 'Metro':
                return leg?.legExtraInfo?._0?.routeInfo[0]?.originStop;
            case 'Bus':
                return leg?.legExtraInfo?._0?.originStop;
            default:
                return undefined;
        }
    })();

    const newLocation: location = {
        title: sourceInfo?.name,
        subtitle: sourceInfo?.address ? sourceInfo.address : undefined,
        lat: sourceInfo?.lat ? sourceInfo.lat : undefined,
        lng: sourceInfo?.lon ? sourceInfo.lon : undefined,
        specialLocation: undefined,
        placeId: undefined,
        tag: 'RECENTS',
        addressComponents: getAddressFromComponents(sourceInfo?.address ?? ',', undefined, undefined) ?? undefined,
        serviceable: true,
        serviceabilityCity: undefined,
        formattedAddress: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        hotSpotInfo: undefined,
    };
    return newLocation;
};

export const getJourneyLegDestination = (leg: legInfo | undefined) => {
    switch (leg?.legExtraInfo.TAG) {
        case 'Metro':
        case 'Subway': {
            const destinationStop =
                leg?.legExtraInfo._0.routeInfo?.length > 0
                    ? leg?.legExtraInfo._0.routeInfo[leg?.legExtraInfo._0.routeInfo?.length - 1]?.destinationStop
                    : undefined;
            return destinationStop?.name ?? destinationStop?.address ?? '';
        }
        case 'Bus': {
            const destinationStop = leg?.legExtraInfo._0?.destinationStop;
            if (!destinationStop) return '';
            return destinationStop.name || destinationStop.address || '';
        }
        case 'Taxi':
        case 'Walk': {
            const destinationAddress = leg?.legExtraInfo._0?.destination?.address;
            if (!destinationAddress) return '';
            return destinationAddress.title || destinationAddress.area || destinationAddress.building || '';
        }
        default:
            return '';
    }
};

export const getTransitType = (legMode: MultimodalTravelMode_multimodalTravelMode) => {
    switch (legMode) {
        case 'Metro':
            return 'metro';
        case 'Taxi':
            return 'auto';
        case 'Walk':
            return 'walk';
        case 'Subway':
            return 'train';
        default:
            return 'bus';
    }
};

export const getFRFSVehicleType = (mode: MultimodalTravelMode_multimodalTravelMode | undefined) => {
    switch (mode) {
        case 'Metro':
            return 'METRO';
        case 'Bus':
            return 'BUS';
        default:
            return 'SUBWAY';
    }
};

export const getDistanceOrUnitForJourney = (
    legs: legInfo[],
): { distance: number; unit: Enums_DistanceUnit_distanceUnit } => {
    type AccumulatorType = { distance: number; unit: Enums_DistanceUnit_distanceUnit };
    const initialValue: AccumulatorType = { distance: 0, unit: 'Kilometer' };

    return legs.reduce<AccumulatorType>(
        (acc, leg) => {
            if (leg.actualDistance) {
                return {
                    distance: acc.distance + leg.actualDistance.value,
                    unit: leg.actualDistance.unit, // Update unit only when actualDistance exists
                };
            }
            return acc;
        },
        initialValue, // Initial values
    );
};

export const getPriceOrCurrencyForJourney = (legs: legInfo[]): { price: string; currency: string } => {
    const { totalFare, currency } = legs.reduce(
        (acc, leg) => {
            if (leg.totalFare) {
                return {
                    totalFare: acc.totalFare + leg.totalFare.amount,
                    currency: leg.totalFare.currency,
                };
            }
            return acc;
        },
        { totalFare: 0, currency: '₹' },
    );

    return { price: totalFare.toString(), currency };
};

export const getLocationForFrfs = (frfsLocation: fRFSStationAPI): string => {
    return frfsLocation.name ?? '';
};

export const getlocationAPIEntitySourceOrDestination = (
    leg: legInfo | undefined,
    isSource: boolean,
): locationAPIEntity | undefined => {
    const legExtra = leg?.legExtraInfo._0;
    if (!legExtra) {
        return undefined;
    }

    switch (leg?.legExtraInfo.TAG) {
        case 'Bus': {
            const legExtraInfo: busLegExtraInfo = leg?.legExtraInfo._0;
            const stop = isSource ? legExtraInfo.originStop : legExtraInfo.destinationStop;
            return {
                ...dummyLocationApiEntity,
                area: stop?.name,
            };
        }
        case 'Metro':
        case 'Subway': {
            const legExtraInfo: metroLegExtraInfo | subwayLegExtraInfo = leg?.legExtraInfo._0;
            const route = legExtraInfo.routeInfo[0];
            if (!route) return undefined;
            const stop = isSource ? route.originStop : route.destinationStop;
            return {
                ...dummyLocationApiEntity,
                area: stop?.name,
            };
        }
        case 'Taxi':
        case 'Walk': {
            const legExtraInfo: taxiLegExtraInfo | walkLegExtraInfo = leg?.legExtraInfo._0;
            const loc = isSource ? legExtraInfo.origin : legExtraInfo.destination;
            return {
                area: loc.address.area,
                areaCode: loc.address.areaCode,
                building: loc.address.building,
                city: loc.address.city,
                country: loc.address.country,
                door: loc.address.door,
                extras: loc.address.extras,
                id: loc.id,
                instructions: loc.address.instructions,
                lat: loc.lat,
                lon: loc.lon,
                placeId: loc.address.placeId,
                state: loc.address.state,
                street: loc.address.street,
                title: loc.address.title,
                ward: loc.address.ward,
            };
        }
    }
};

export const convertLatLongToLatLng = (latLong: latLong): LatLng => {
    return {
        latitude: latLong.lat,
        longitude: latLong.lon,
    };
};

export const convertLatLongToLatLngStopInfo = (latLong: LatLongStopInfo): LatLng => {
    return {
        latitude: latLong.lat,
        longitude: latLong.lon,
    };
};

export const convertLatLngToLatLong = (latLong: latLng): latLong => {
    return {
        lat: latLong.latitude,
        lon: latLong.longitude,
    };
};

export const getNextStopForLeg = (
    nextStops: NextStopType[] | undefined,
    legOrder: number,
): NextStopType | undefined => {
    return nextStops?.find(leg => leg.order === legOrder);
};

const mapJourneyModeToVehicleType = (
    journeyMode: string,
): FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType => {
    const upperMode = journeyMode.toUpperCase();
    if (upperMode === 'METRO' || upperMode === 'BUS' || upperMode === 'SUBWAY') {
        return upperMode;
    }
    return 'SUBWAY'; // fallback
};

// Cache-aware helper function for FRFS route API calls
const getFrfsRouteWithCache = async (
    params: frfsRouteRouteCodeGetWithParams,
    getFrfsRoutes: ReturnType<typeof useFrfsRouteRouteCodeGetMutation>[0],
) => {
    // Create cache key
    const cacheKey = createFrfsRouteCacheKey(params.routeCode, params.city, params.vehicleType, params.platformType);

    // Check cache first
    const state = store.getState();
    const cachedData = selectCachedRouteData(state, cacheKey);

    if (cachedData) {
        // Mark as accessed
        store.dispatch(accessCacheEntry(cacheKey));
        return { data: cachedData };
    }

    // Make API call
    const response = await getFrfsRoutes(params);

    // Cache successful response
    if (response.data) {
        store.dispatch(
            setCacheEntry({
                key: cacheKey,
                data: response.data,
            }),
        );
    }

    return response;
};

export const getFrfsRoute = async (
    journeyLeg: legInfo | journeyLeg,
    city: FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    getFrfsRoutes: ReturnType<typeof useFrfsRouteRouteCodeGetMutation>[0],
    fromStationCode: string | undefined,
    toStationCode: string | undefined,
    routeCode: string | undefined,
) => {
    if ('legExtraInfo' in journeyLeg) {
        const trackingleg = journeyLeg;
        const tag = trackingleg?.legExtraInfo.TAG;

        if (tag === 'Metro' || tag === 'Subway') {
            const routeInfos = trackingleg?.legExtraInfo._0.routeInfo;
            if (!routeInfos || routeInfos.length === 0) return { wayPoints: [], stops: [] };

            // Sort routeInfos by subOrder to ensure correct processing order
            const sortedRouteInfos = [...routeInfos].sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0));

            const { allWayPoints, allStops, allLastStops, allRouteStops } = await sortedRouteInfos.reduce<
                Promise<{
                    allWayPoints: latLong[];
                    allStops: fRFSStationAPI[];
                    allLastStops: fRFSStationAPI[];
                    allRouteStops: fRFSStationAPI[];
                }>
            >(
                async (
                    accPromise: Promise<{
                        allWayPoints: latLong[];
                        allStops: fRFSStationAPI[];
                        allLastStops: fRFSStationAPI[];
                        allRouteStops: fRFSStationAPI[];
                    }>,
                    routeInfo,
                ) => {
                    const acc = await accPromise;
                    const code = routeInfo.routeCode;
                    if (!code) return acc;

                    const frfsGetRoutesReq: frfsRouteRouteCodeGetWithParams = {
                        city: city,
                        routeCode: code,
                        platformType: 'MULTIMODAL',
                        vehicleType: getFRFSVehicleType(tag),
                    };

                    try {
                        const resp = await getFrfsRouteWithCache(frfsGetRoutesReq, getFrfsRoutes);
                        const newWayPoints = resp.data?.waypoints || [];
                        const startLatLong = { lat: routeInfo.originStop.lat ?? 0, lon: routeInfo.originStop.lon ?? 0 };
                        const endLatLong = {
                            lat: routeInfo.destinationStop.lat ?? 0,
                            lon: routeInfo.destinationStop.lon ?? 0,
                        };
                        const processedWayPoints = processWaypoints(tag, newWayPoints, startLatLong, endLatLong);
                        // Get the lastStop for this specific route segment
                        const currentLastStop: fRFSStationAPI | undefined =
                            resp.data?.stops?.[resp.data.stops.length - 1];

                        const stopsToAdd: fRFSStationAPI[] = (() => {
                            const { originCode, destinationCode } = {
                                originCode: routeInfo.originStop.code,
                                destinationCode: routeInfo.destinationStop.code,
                            };

                            if (resp.data?.stops) {
                                const originIndex = resp.data.stops.findIndex(stop => stop?.code === originCode);
                                const destinationIndex = resp.data.stops.findIndex(
                                    stop => stop?.code === destinationCode,
                                );

                                if (originIndex !== -1 && destinationIndex !== -1) {
                                    const filteredStops = resp.data.stops.slice(originIndex, destinationIndex + 1);
                                    return filteredStops.filter((stop): stop is fRFSStationAPI => stop !== undefined);
                                }
                            }
                            return [];
                        })();
                        const fullStops: fRFSStationAPI[] = (resp.data?.stops || []).filter(
                            (stop): stop is fRFSStationAPI => stop !== undefined,
                        );

                        const wayPointsWithFallback =
                            processedWayPoints.coordinates.length > 0
                                ? processedWayPoints.coordinates.map(coord => ({
                                      lat: coord.latitude,
                                      lon: coord.longitude,
                                  }))
                                : stopsToAdd.reduce<latLong[]>((acc, stop) => {
                                      if (stop.lat && stop.lon) {
                                          return [...acc, { lat: stop.lat, lon: stop.lon }];
                                      }
                                      return acc;
                                  }, []);
                        return {
                            allWayPoints: [...acc.allWayPoints, ...wayPointsWithFallback],
                            allStops: [...acc.allStops, ...stopsToAdd],
                            allLastStops: currentLastStop ? [...acc.allLastStops, currentLastStop] : acc.allLastStops,
                            allRouteStops: [...acc.allRouteStops, ...fullStops],
                        };
                    } catch (e) {
                        console.error(`Error while Calling FrfsGetRoutes for route ${code}`, e);
                        return acc; // Return current accumulator on error
                    }
                },
                Promise.resolve({ allWayPoints: [], allStops: [], allLastStops: [], allRouteStops: [] }),
            );

            return { wayPoints: allWayPoints, stops: allStops, lastStop: allLastStops, allRouteStops };
        } else if (tag === 'Bus') {
            const code = trackingleg?.legExtraInfo._0.routeCode;
            if (!code) return { wayPoints: [], stops: [] };

            const frfsGetRoutesReq: frfsRouteRouteCodeGetWithParams = {
                city: city,
                routeCode: code,
                platformType: 'MULTIMODAL',
                vehicleType: getFRFSVehicleType(tag),
            };

            try {
                const resp = await getFrfsRouteWithCache(frfsGetRoutesReq, getFrfsRoutes);

                const wayPoints = resp.data?.waypoints;
                const { originCode, destinationCode } = {
                    originCode: trackingleg?.legExtraInfo._0.originStop.code,
                    destinationCode: trackingleg?.legExtraInfo._0.destinationStop.code,
                };
                if (resp.data?.stops) {
                    const originIndex = resp.data.stops.findIndex(stop => stop?.code === originCode);
                    const destinationIndex = resp.data.stops.findIndex(stop => stop?.code === destinationCode);
                    if (originIndex !== -1 && destinationIndex !== -1) {
                        const filteredStops = resp.data.stops.slice(originIndex, destinationIndex + 1);
                        const stops = filteredStops.reduce<fRFSStationAPI[]>((acc, stop) => {
                            if (stop) {
                                return acc.concat(stop);
                            }
                            return acc;
                        }, []);

                        return { wayPoints, stops, lastStop: resp.data.stops[resp.data.stops.length - 1] };
                    } else {
                        return { wayPoints, stops: [], lastStop: resp.data.stops[resp.data.stops.length - 1] };
                    }
                }
            } catch (e) {
                console.error('Error while Calling FrfsGetRoutes11', e);
            }
        }
    } else if ('routeDetails' in journeyLeg) {
        try {
            if (journeyLeg.routeDetails[0]?.routeCode) {
                const frfsGetRoutesReq: frfsRouteRouteCodeGetWithParams = {
                    city: city,
                    platformType: 'MULTIMODAL',
                    routeCode: routeCode ? routeCode : journeyLeg.routeDetails[0]?.routeCode,
                    vehicleType: mapJourneyModeToVehicleType(journeyLeg.journeyMode),
                };
                const resp = await getFrfsRouteWithCache(frfsGetRoutesReq, getFrfsRoutes);

                const wayPoints = resp.data?.waypoints;

                if (resp.data?.stops) {
                    const fromStation =
                        journeyLeg.journeyMode === 'Metro' && fromStationCode
                            ? fromStationCode
                            : journeyLeg.fromStationCode;
                    const toStation =
                        journeyLeg.journeyMode === 'Metro' && toStationCode ? toStationCode : journeyLeg.toStationCode;
                    const originIndex = resp.data.stops.findIndex(stop => stop?.code === fromStation);
                    const destinationIndex = resp.data.stops.findIndex(stop => stop?.code === toStation);
                    if (originIndex !== -1 && destinationIndex !== -1) {
                        const filteredStops =
                            originIndex <= destinationIndex
                                ? resp.data.stops.slice(originIndex, destinationIndex + 1)
                                : resp.data.stops.slice(destinationIndex, originIndex + 1).reverse();
                        const stops = filteredStops.reduce<fRFSStationAPI[]>((acc, stop) => {
                            if (stop) {
                                return acc.concat(stop);
                            }
                            return acc;
                        }, []);
                        return { wayPoints, stops, lastStop: resp.data.stops[resp.data.stops.length - 1] };
                    } else {
                        return { wayPoints, stops: [], lastStop: resp.data.stops[resp.data.stops.length - 1] };
                    }
                }
            }
        } catch (e) {
            console.error('Error while Calling FrfsGetRoutes123', e);
        }
    }
    return { wayPoints: [], stops: [], lastStop: undefined };
};

export const processWaypoints = (
    journeyMode: MultimodalTravelMode_multimodalTravelMode | undefined,
    data: latLong[] | undefined,
    fromLatLong: latLong,
    toLatLong: latLong,
) => {
    const startOriginPoint = { latitude: fromLatLong.lat, longitude: fromLatLong.lon };
    const endOriginPoint = { latitude: toLatLong.lat, longitude: toLatLong.lon };
    const wayPoints =
        data?.map(point => ({
            latitude: point.lat,
            longitude: point.lon,
        })) || [];

    const startNearest = findNearestPoint(wayPoints, startOriginPoint);
    const endNearest = findNearestPoint(wayPoints, endOriginPoint);
    const startIndex = startNearest.index;
    const endIndex = endNearest.index;

    if (startIndex === -1 || endIndex === -1) {
        return { coordinates: [], legMode: journeyMode };
    }

    const slicedData =
        startIndex <= endIndex
            ? [startOriginPoint, ...wayPoints.slice(startIndex + 1, endIndex), endOriginPoint]
            : [startOriginPoint, ...wayPoints.slice(endIndex, startIndex + 1).reverse(), endOriginPoint];
    return {
        coordinates: slicedData,
        legMode: journeyMode,
    };
};

export const getDestinationLatLon = (journeyLegs: legInfo[]) => {
    const lastLeg = journeyLegs.at(-1);

    if (!lastLeg) {
        return { destinationLat: 0, destinationLon: 0 };
    }

    switch (lastLeg.legExtraInfo.TAG) {
        case 'Walk':
        case 'Taxi':
            return {
                destinationLat: lastLeg.legExtraInfo._0.destination.lat,
                destinationLon: lastLeg.legExtraInfo._0.destination.lon,
            };

        case 'Metro':
        case 'Subway': {
            const destinationStop =
                lastLeg.legExtraInfo._0.routeInfo?.length > 0
                    ? lastLeg.legExtraInfo._0.routeInfo[lastLeg.legExtraInfo._0.routeInfo?.length - 1]?.destinationStop
                    : undefined;
            return {
                destinationLat: destinationStop?.lat ?? 0,
                destinationLon: destinationStop?.lon ?? 0,
            };
        }
        case 'Bus':
            return {
                destinationLat: lastLeg.legExtraInfo._0.destinationStop.lat,
                destinationLon: lastLeg.legExtraInfo._0.destinationStop.lon,
            };

        default:
            return { destinationLat: 0, destinationLon: 0 };
    }
};

export const generateJourneyCoordinates = (
    originStopLat: number,
    originStopLon: number,
    destinationStopLat: number,
    destinationStopLon: number,
    wayPoints: latLong[] | undefined,
    journey: legInfo,
) => {
    const originLatLng: latLong = {
        lat: originStopLat,
        lon: originStopLon,
    };
    const destinationLatLng: latLong = {
        lat: destinationStopLat,
        lon: destinationStopLon,
    };
    // Add safety check for journey and journey.travelMode
    if (!journey || !journey.travelMode) {
        console.warn('generateJourneyCoordinates: journey or travelMode is undefined', journey);
        return [];
    }
    const journeyData = processWaypoints(journey?.travelMode, wayPoints, originLatLng, destinationLatLng);
    return journeyData.coordinates.map(coord => convertLatLngToLatLong(coord));
};

export const getSubLegOrder = (leg: legInfo): number => {
    const subLegOrder =
        leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway'
            ? (leg.legExtraInfo._0.routeInfo[0]?.subOrder ?? 1)
            : 1;
    return subLegOrder;
};

export const getWaypointsWithFallback = (resp: frfsRouteResp): latLong[] | undefined => {
    const stopsLatlngArray: latLong[] =
        resp?.stops?.reduce<latLong[]>((stops, stop) => {
            if (stop.lat !== undefined && stop.lon !== undefined) {
                return [
                    ...stops,
                    {
                        lat: stop.lat,
                        lon: stop.lon,
                    },
                ];
            }
            return stops;
        }, []) ?? [];
    return Array.isArray(resp?.wayPoints) && resp.wayPoints.length > 0 ? resp.wayPoints : stopsLatlngArray;
};

export const getRouteCodeForTransit = (
    leg: legInfo,
    getRouteByCode: (routeCode: string) => transportRoute | undefined,
) => {
    if (leg.legExtraInfo.TAG === 'Bus') {
        return leg.legExtraInfo._0?.routeName;
    }
    if (leg.legExtraInfo.TAG === 'Metro') {
        return leg.legExtraInfo._0.routeInfo[0]?.routeCode;
    }
    if (leg.legExtraInfo.TAG === 'Subway') {
        const routeCode = leg.legExtraInfo._0.routeInfo[0]?.routeCode;
        if (routeCode) {
            const route = getRouteByCode(routeCode);
            return route?.shortName;
        }
        return routeCode;
    }
    return undefined;
};

export const getTransitTypeColor = (transitType: TransitType) => {
    switch (transitType) {
        case 'auto':
            return '#656565';
        case 'walk':
            return '#656565';
        case 'metro':
            return '#0569C7';
        case 'bus':
            return '#F78622';
        case 'train':
            return '#17402F';
        default:
            return '#636164';
    }
};

export const convertFrfsStationToTransportStation = (
    station: fRFSStationAPI,
    vehicleType: VehicleCategory_vehicleCategory,
): transportStation => {
    return {
        code: station.code,
        name: station.name ?? '',
        lat: station.lat ?? 0,
        lon: station.lon ?? 0,
        address: station.address,
        vehicleType: vehicleType,
        suggestedDestination: undefined,
        gatesInfo: undefined,
        geoJson: undefined,
    };
};

export const convertFrfsStationToLocation = (station: transportStation | undefined): location | undefined => {
    if (!station) {
        logger.logWarn(`Station is undefined`, 'BookingFlow');
        return undefined;
    }
    return {
        lat: station.lat,
        lng: station.lon,
        placeId: undefined,
        title: station.name,
        subtitle: station.address,
        formattedAddress: station.address,
        tag: 'AUTOCOMPLETE',
        addressComponents: {
            title: station.name,
            area: station.address,
            areaCode: undefined,
            building: undefined,
            city: undefined,
            country: undefined,
            door: undefined,
            extras: undefined,
            instructions: undefined,
            placeId: undefined,
            state: undefined,
            street: undefined,
            ward: undefined,
        },
        serviceable: true,
        serviceabilityCity: undefined,
        specialLocation: undefined,
        locationType: undefined,
        distanceFromCurrentLocation: undefined,
        hotSpotInfo: undefined,
    };
};

export const formatTimeForTimeTable = (timeStr: string | undefined): string => {
    if (!timeStr) return '';
    else {
        const timeParts = timeStr.split(':');
        if (timeParts.length >= 2) {
            const hours = timeParts[0];
            const minutes = timeParts[1];
            if (hours && minutes) {
                const hour = parseInt(hours, 10);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const formattedHour = hour % 12 || 12;
                return `${formattedHour}:${minutes} ${ampm}`;
            }
        }
        return timeStr;
    }
};
export const getLegTickets = (journey: journeyInfoResp | undefined): LegTickets => {
    const legs = journey?.legs ?? [];
    return legs.reduce<LegTickets>(
        (acc, leg) => {
            if (leg?.legExtraInfo?.TAG === 'Metro') {
                return { ...acc, metro: [...acc.metro, ...(leg?.legExtraInfo?._0?.tickets ?? [])] };
            } else if (leg?.legExtraInfo?.TAG === 'Bus') {
                return { ...acc, bus: [...acc.bus, ...(leg?.legExtraInfo?._0?.tickets ?? [])] };
            }
            return acc;
        },
        { metro: [], bus: [] },
    );
};

export const getTransitOptionLabel = (name: string, userLanguageStrings: strings) => {
    const labelMap: Record<string, string | undefined> = {
        AC: userLanguageStrings.AC,
        Ordinary: userLanguageStrings.Ordinary,
        Deluxe: userLanguageStrings.Deluxe,
        Express: userLanguageStrings.Express,
        'First Class': userLanguageStrings.FirstClass,
        'Second Class': userLanguageStrings.SecondClass,
    };
    return labelMap[name];
};

export const formatDateAndTime = (dateString: string | undefined) => {
    if (!dateString) return '';
    const d = dayjs(dateString);
    if (!d.isValid()) return dateString;
    // Format: 12th May 2025, 12:50 PM
    return d.format('Do MMMM YYYY, h:mm A');
};

export const formatTimestampToHMS = (timestamp: number): string | undefined => {
    const currentTime = Date.now(); // Convert current time to seconds
    const diffInSeconds = Math.floor((currentTime - timestamp) / 1000);

    // // Return undefined if less than 2 minutes
    if (diffInSeconds < 120) {
        return undefined;
    }

    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = Math.floor(diffInSeconds % 60);

    const timeStrings = [
        hours > 0 ? `${hours} hrs` : '',
        minutes > 0 ? `${minutes} mins` : '',
        seconds > 0 ? `${seconds} secs` : '',
    ];

    return timeStrings.filter(Boolean).join(' ') + ' ago';
};

export const mergeTrackedLegs = (legs: TrackedLegInfoStaticInfo[]): TrackedLegInfoStaticInfo[] => {
    // Group legs by their base order (e.g., "1-1", "1-2", "1-3" all belong to group "1")
    const groupedLegs = legs.reduce<Record<string, TrackedLegInfoStaticInfo[]>>((acc, leg) => {
        const baseOrder = leg.legOrder?.split('-')[0] || '0'; // Extract "1" from "1-1", "1-2", etc.
        if (!acc[baseOrder]) {
            acc[baseOrder] = [];
        }
        acc[baseOrder].push(leg);
        return acc;
    }, {});

    const mergedLegs: TrackedLegInfoStaticInfo[] = [];

    // Process each group
    Object.keys(groupedLegs)
        .sort((a, b) => parseInt(a) - parseInt(b)) // Sort by numeric order
        .forEach(baseOrder => {
            const groupLegs = groupedLegs[baseOrder];
            if (!groupLegs) return;
            if (groupLegs.length === 1 && groupLegs[0]) {
                const singleLeg = groupLegs[0];
                mergedLegs.push({
                    ...singleLeg,
                    allSourceStations: singleLeg.origin.stationName
                        ? [singleLeg.origin.stationName].filter(name => name !== undefined && name !== '')
                        : [],
                    allDestinationStations: singleLeg.destination.stationName
                        ? [singleLeg.destination.stationName].filter(name => name !== undefined && name !== '')
                        : [],
                    allTowardsStations: singleLeg.towardsStation
                        ? [singleLeg.towardsStation].filter(station => station !== undefined && station !== '')
                        : [],
                });
            } else {
                // Multiple legs with same base order, merge them into a single leg
                // Preserve all intermediate stations in the merged leg
                const sortedGroupLegs = groupLegs.sort((a, b) => {
                    const aSubOrder = parseInt(a.legOrder?.split('-')[1] || '0');
                    const bSubOrder = parseInt(b.legOrder?.split('-')[1] || '0');
                    return aSubOrder - bSubOrder;
                });

                // Create merged leg using first leg as base and last leg as destination
                const baseLeg = sortedGroupLegs[0];
                const lastLeg = sortedGroupLegs[sortedGroupLegs.length - 1];
                if (baseLeg && lastLeg) {
                    // Create intermediate stations from all leg origins and destinations
                    const allStations = sortedGroupLegs.map(leg => ({
                        stationName: leg.origin.stationName,
                        stopCode: leg.origin.stopCode,
                        latLong: leg.origin.latLong,
                        geoJson: leg.origin.geoJson,
                        entryGate: leg.origin.entryGate,
                        exitGate: leg.origin.exitGate,
                    }));

                    // Add the final destination
                    allStations.push({
                        stationName: lastLeg.destination.stationName,
                        stopCode: lastLeg.destination.stopCode,
                        latLong: lastLeg.destination.latLong,
                        geoJson: lastLeg.destination.geoJson,
                        entryGate: lastLeg.destination.entryGate,
                        exitGate: lastLeg.destination.exitGate,
                    });

                    const mergedLeg: TrackedLegInfoStaticInfo = {
                        ...baseLeg,
                        legOrder: baseOrder,
                        origin: {
                            ...baseLeg.origin,
                            stationName: baseLeg.travelMode === 'Subway' ? baseLeg.origin.stationName : undefined,
                        },
                        destination: {
                            ...lastLeg.destination,
                            stationName: lastLeg.travelMode === 'Subway' ? lastLeg.destination.stationName : undefined,
                        },
                        lineColor: (() => {
                            const allColors = sortedGroupLegs
                                .map(leg => leg.lineColor)
                                .filter(color => !isUndefined(color))
                                .flat();

                            return allColors ?? undefined;
                        })(),
                        routeWaypoints: sortedGroupLegs.reduce<LatLongType[]>((allWaypoints, leg) => {
                            return [...allWaypoints, ...(leg.routeWaypoints || [])];
                        }, []),
                        filteredRouteWaypoints: sortedGroupLegs.reduce<LatLongStopInfo[]>((allWaypoints, leg) => {
                            return [...allWaypoints, ...(leg.filteredRouteWaypoints || [])];
                        }, []),
                        stops: sortedGroupLegs.reduce<StopType>((allStops, leg) => {
                            return [...allStops, ...(leg.stops || [])];
                        }, []),
                        onRouteStops: sortedGroupLegs.reduce<StopType>((allStops, leg) => {
                            return [...allStops, ...(leg.onRouteStops || [])];
                        }, []),
                        distance: sortedGroupLegs.reduce((total, leg) => total + (leg.distance || 0), 0),
                        duration: baseLeg.duration,
                        timetable: sortedGroupLegs.reduce<TimeEntry[]>((allTimetables, leg) => {
                            return leg.timetable ? [...allTimetables, ...leg.timetable] : allTimetables;
                        }, []),
                        tickets: sortedGroupLegs.reduce<string[]>((allTickets, leg) => {
                            return leg.tickets ? [...allTickets, ...leg.tickets] : allTickets;
                        }, []),
                        alternateRoutesNames: sortedGroupLegs.reduce<string[]>((allRoutes, leg) => {
                            return leg.alternateRoutesNames ? [...allRoutes, ...leg.alternateRoutesNames] : allRoutes;
                        }, []),
                        // Use the most recent booking status
                        bookingStatus: lastLeg.bookingStatus || baseLeg.bookingStatus,
                        // Use single leg's fare (all legs have the same fare)
                        fare: baseLeg.fare,
                        towardsStation: undefined,
                        // Array fields for individual stations and colors
                        allSourceStations: allStations
                            .map(station => station.stationName)
                            .filter((name): name is string => name !== undefined && name !== ''),
                        allDestinationStations: sortedGroupLegs
                            .map(leg => leg.destination.stationName)
                            .filter((name): name is string => name !== undefined && name !== ''),
                        allTowardsStations: sortedGroupLegs
                            .map(leg => leg.towardsStation)
                            .filter((station): station is string => station !== undefined && station !== ''),
                        allLineColors: undefined,
                    };

                    mergedLegs.push(mergedLeg);
                }
            }
        });

    return mergedLegs;
};

export const createMockRouteInfoFromTrackedLeg = (staticLegInfo: TrackedLegInfoStaticInfo): legRouteInfo[] => {
    // Create mock routeInfo from static data for each line color
    const lineColors = staticLegInfo.lineColor || [];

    if (lineColors.length === 0) {
        // No line colors, create single route info
        return [
            {
                originStop: {
                    code: staticLegInfo.origin.stopCode || '',
                    name: staticLegInfo.origin.stationName || '',
                    lat: staticLegInfo.origin.latLong?.lat || 0,
                    lon: staticLegInfo.origin.latLong?.lon || 0,
                    address: undefined,
                    hindiName: undefined,
                    timeTakenToTravelUpcomingStop: undefined,
                    regionalName: undefined,
                    routeCodes: undefined,
                    parentStopCode: undefined,
                },
                destinationStop: {
                    code: staticLegInfo.destination.stopCode || '',
                    name: staticLegInfo.destination.stationName || '',
                    lat: staticLegInfo.destination.latLong?.lat || 0,
                    lon: staticLegInfo.destination.latLong?.lon || 0,
                    address: undefined,
                    hindiName: undefined,
                    timeTakenToTravelUpcomingStop: undefined,
                    regionalName: undefined,
                    routeCodes: undefined,
                    parentStopCode: undefined,
                },
                subOrder: 1,
                frequency: undefined,
                lineColor: undefined,
                lineColorCode: undefined,
                platformNumber: staticLegInfo.platform,
                trackingStatus: undefined,
                trackingStatusLastUpdatedAt: undefined,
                trainNumber: undefined,
                routeCode: '',
                allAvailableRoutes: [],
            },
        ];
    }

    // Create route info for each line color
    return lineColors.map((lineColor, index) => ({
        originStop: {
            code: staticLegInfo.origin.stopCode || '',
            name: staticLegInfo.origin.stationName || '',
            lat: staticLegInfo.origin.latLong?.lat || 0,
            lon: staticLegInfo.origin.latLong?.lon || 0,
            address: undefined,
            hindiName: undefined,
            parentStopCode: undefined,
            timeTakenToTravelUpcomingStop: undefined,
            regionalName: undefined,
            routeCodes: undefined,
        },
        destinationStop: {
            code: staticLegInfo.destination.stopCode || '',
            name: staticLegInfo.destination.stationName || '',
            lat: staticLegInfo.destination.latLong?.lat || 0,
            lon: staticLegInfo.destination.latLong?.lon || 0,
            address: undefined,
            hindiName: undefined,
            timeTakenToTravelUpcomingStop: undefined,
            regionalName: undefined,
            routeCodes: undefined,
            parentStopCode: undefined,
        },
        subOrder: index + 1,
        frequency: undefined,
        lineColor: lineColor,
        lineColorCode: undefined,
        platformNumber: staticLegInfo.platform,
        trackingStatus: undefined,
        trackingStatusLastUpdatedAt: undefined,
        trainNumber: undefined,
        routeCode: '',
        allAvailableRoutes: [],
    }));
};

export const mergeJourneyLegs = (legs: legInfo[]): legInfo[] => {
    const sortedLegs = [...legs].sort((a, b) => (a.order || 0) - (b.order || 0));

    const mergedLegs = sortedLegs.reduce<legInfo[]>((acc, currentLeg) => {
        const previousLeg = acc?.at(-1);
        if (!previousLeg || (previousLeg && currentLeg && previousLeg.order !== currentLeg.order))
            return [...acc, currentLeg];
        if (previousLeg && currentLeg && previousLeg.order === currentLeg.order) {
            const olderLegs = acc?.slice(0, -2) || [];

            if (previousLeg && currentLeg.legExtraInfo.TAG === 'Metro' && previousLeg.legExtraInfo.TAG === 'Metro') {
                return [
                    ...olderLegs,
                    {
                        ...previousLeg,
                        legExtraInfo: {
                            ...previousLeg.legExtraInfo,
                            _0: {
                                ...previousLeg.legExtraInfo._0,
                                routeInfo: [
                                    ...previousLeg.legExtraInfo._0.routeInfo,
                                    ...currentLeg.legExtraInfo._0.routeInfo,
                                ],
                            },
                        },
                    },
                ];
            } else if (
                previousLeg &&
                currentLeg.legExtraInfo.TAG === 'Subway' &&
                previousLeg.legExtraInfo.TAG === 'Subway'
            ) {
                return [
                    ...olderLegs,
                    {
                        ...previousLeg,
                        legExtraInfo: {
                            ...previousLeg.legExtraInfo,
                            _0: {
                                ...previousLeg.legExtraInfo._0,
                                routeInfo: [
                                    ...previousLeg.legExtraInfo._0.routeInfo,
                                    ...currentLeg.legExtraInfo._0.routeInfo,
                                ],
                            },
                        },
                    },
                ];
            }
        }
        return [];
    }, []);

    // Set the overall ticket validity after reduction

    return mergedLegs;
};

export const convertJourneyToJourneyInfoResp = (journey: Journey): journeyInfoResp => {
    const defaultPrice: priceAPIEntity = { amount: 0, currency: 'INR' };

    if (!journey.journeyId) {
        logger.logDebug(`Journery id not found`, 'BookingFlow');
        // Return a default journeyInfoResp with empty journeyId
        return {
            isSingleMode: undefined,
            endTime: undefined,
            estimatedDistance: { value: journey.estimatedDistance ?? 0, unit: 'Kilometer' },
            estimatedDuration: journey.estimatedDuration ?? undefined,
            estimatedMaxFare: journey.estimatedMaxFare ?? defaultPrice,
            estimatedMinFare: journey.estimatedMinFare ?? defaultPrice,
            journeyId: '',
            journeyStatus: journey.status ?? 'NEW',
            legs: mergeJourneyLegs(journey.legs),
            merchantOperatingCityName: journey.merchantOperatingCityName ?? undefined,
            paymentOrderShortId: journey.paymentOrderShortId ?? undefined,
            startTime: journey.startTime ?? undefined,
            unifiedQRV2: journey.unifiedQRV2 ?? undefined,
            result: undefined,
            offer: undefined,
            createdAt: journey.startTime ?? '',
        };
    }

    return {
        isSingleMode: undefined,
        endTime: undefined, // Journey type does not have endTime
        estimatedDistance: { value: journey.estimatedDistance ?? 0, unit: 'Kilometer' },
        estimatedDuration: journey.estimatedDuration ?? undefined,
        estimatedMaxFare: journey.estimatedMaxFare ?? defaultPrice, // Provide default if null
        estimatedMinFare: journey.estimatedMinFare ?? defaultPrice, // Provide default if null
        journeyId: journey.journeyId,
        journeyStatus: journey.status ?? 'NEW',
        legs: mergeJourneyLegs(journey.legs),
        merchantOperatingCityName: journey.merchantOperatingCityName ?? undefined,
        paymentOrderShortId: journey.paymentOrderShortId ?? undefined,
        startTime: journey.startTime ?? undefined,
        unifiedQRV2: journey.unifiedQRV2 ?? undefined,
        result: undefined,
        offer: undefined,
        createdAt: journey.startTime ?? '',
    };
};
export const getTransitModesSentence = (
    modes: MultimodalTravelMode_multimodalTravelMode[] | undefined,
    userLanguageStrings: strings,
): string => {
    if (!modes || modes.length === 0) return '';

    const ignoreModes: MultimodalTravelMode_multimodalTravelMode[] = ['Walk', 'Taxi'];

    const filteredModes = [
        ...new Set(
            modes.filter(
                (mode): mode is MultimodalTravelMode_multimodalTravelMode =>
                    mode !== undefined && !ignoreModes.includes(mode),
            ),
        ),
    ];

    const modeLabelMap: Record<string, string> = {
        Bus: userLanguageStrings.bus,
        Metro: userLanguageStrings.metro,
        Subway: userLanguageStrings.suburban,
    };

    const processedModes = filteredModes.map(mode => modeLabelMap[mode] || mode);

    if (processedModes.length === 0) return '';
    if (processedModes.length === 1) return processedModes[0] || '';
    if (processedModes.length === 2) {
        return `${processedModes[0]} ${userLanguageStrings.and} ${processedModes[1]}`;
    }

    const allButLast = processedModes.slice(0, -1);
    const last = processedModes[processedModes.length - 1];

    return `${allButLast.join(', ')} ${userLanguageStrings.and} ${last}`;
};

export const getTicketTypeText = (
    modes: MultimodalTravelMode_multimodalTravelMode[] | undefined,
    ticketCount: number,
): string => {
    if (!modes || modes.length === 0) return '';

    const ignoreModes: MultimodalTravelMode_multimodalTravelMode[] = ['Walk', 'Taxi'];
    const filteredModes = [
        ...new Set(
            modes.filter(
                (mode): mode is MultimodalTravelMode_multimodalTravelMode =>
                    mode !== undefined && !ignoreModes.includes(mode),
            ),
        ),
    ];

    if (filteredModes.length === 0) return '';
    if (filteredModes.length === 1) return filteredModes[0] + (ticketCount > 1 ? ' tickets' : ' ticket') || '';
    if (filteredModes.length === 2) {
        return 'Combo ' + (ticketCount > 1 ? 'tickets' : 'ticket');
    }
    return ticketCount > 1 ? 'tickets' : 'ticket';
};

export const getVehicleImageForTransit = (transitMode: TransitType): transitModes => {
    switch (transitMode) {
        case 'metro':
            return 'metro';
        case 'metroNoleaf':
            return 'metro';
        case 'train':
            return 'train';
        case 'bus':
            return 'bus';
        default:
            return undefined;
    }
};

export const getMultimodalTravelMode = (
    transitMode: TransitTypeWithWait,
): MultimodalTravelMode_multimodalTravelMode | undefined => {
    switch (transitMode) {
        case 'Wait':
            return undefined;
        case 'Tick':
            return 'Walk';
        default:
            return transitMode;
    }
};

export const getCurrNearbyStops = (stoplist: (string | undefined)[] | undefined, currentStop: string | undefined) => {
    if (!Array.isArray(stoplist) || !currentStop) return [];
    const currentIndex = stoplist.findIndex(stop => stop?.toLowerCase().trim() === currentStop?.toLowerCase().trim());
    if (currentIndex === -1) return [];
    const startIndex = Math.max(0, currentIndex - 2);
    const endIndex = Math.min(stoplist.length - 1, currentIndex + 2);
    return stoplist.slice(startIndex, endIndex + 1);
};

export const getUniqueStops = (stops: fRFSStationAPI[] | undefined) => {
    return Array.from(new Map(stops?.map(stop => [`${stop.code}_${stop?.routeCodes?.join(',')}`, stop])).values());
};

export const checkAndReverseByRouteCode = (
    stopsList: fRFSStationAPI[] | undefined,
    currStopLatLng: { lat: number; lon: number } | undefined,
) => {
    if (stopsList && stopsList.length > 0 && currStopLatLng) {
        const firstStop = stopsList[0];
        const lastStop = stopsList[stopsList.length - 1];

        if (!firstStop?.lat || !firstStop?.lon || !lastStop?.lat || !lastStop?.lon) return stopsList;

        const distanceTofirstStop = calculateDistance(
            currStopLatLng.lat,
            currStopLatLng.lon,
            firstStop.lat,
            firstStop.lon,
        );

        const distanceTolastStop = calculateDistance(
            currStopLatLng.lat,
            currStopLatLng.lon,
            lastStop.lat,
            lastStop.lon,
        );

        if (distanceTolastStop < distanceTofirstStop) {
            return [...stopsList].reverse();
        }
    }
    return stopsList;
};

export const getInitialNearbySourceDestStops = (
    stops: fRFSStationAPI[] | undefined,
    currentCode: string,
    countBefore: number,
    countAfter: number,
) => {
    const currentIndex = stops?.findIndex(stop => stop?.code === currentCode);
    if (currentIndex === -1 || !stops || currentIndex === undefined) return [];

    const startIndex = Math.max(0, currentIndex - countBefore);
    const endIndex = Math.min(stops.length, currentIndex + 1 + countAfter);

    return stops.slice(startIndex, endIndex).map(stop => stop.name);
};

export const getPossibleSourceDestStopLists = (
    legInfo: legInfo | TrackedLegInfoStaticInfo,
    originStopName: string | undefined,
    destinationStopName: string | undefined,
    allStops: fRFSStationAPI[] | undefined,
) => {
    const isStatic = 'origin' in legInfo;
    if (isStatic) return { sourceStoplist: [], destinationStoplist: [] };

    const uniqueStops = getUniqueStops(allStops);

    const originStopData = uniqueStops.find(stop => stop.name === originStopName);
    const destinationStopData = uniqueStops.find(stop => stop.name === destinationStopName);

    const originCode = originStopData?.code;
    const destinationCode = destinationStopData?.code;

    const originLatLng =
        originStopData?.lat && originStopData?.lon ? { lat: originStopData.lat, lon: originStopData.lon } : undefined;
    const destinationLatLng =
        destinationStopData?.lat && destinationStopData?.lon
            ? { lat: destinationStopData.lat, lon: destinationStopData.lon }
            : undefined;

    const originRouteCode = originStopData?.routeCodes;
    const destinationRouteCode = destinationStopData?.routeCodes;

    const filterByRouteCode = (stops: fRFSStationAPI[] | undefined, routeCodes: string[] | null | undefined) =>
        stops?.filter(stop => stop.routeCodes?.some(code => routeCodes?.includes(code)));

    const sameRouteForSource = checkAndReverseByRouteCode(
        filterByRouteCode(uniqueStops, originRouteCode),
        originLatLng,
    );

    const sameRouteForDestination = checkAndReverseByRouteCode(
        filterByRouteCode(uniqueStops, destinationRouteCode),
        destinationLatLng,
    );

    const sourceStoplist = originCode ? getInitialNearbySourceDestStops(sameRouteForSource, originCode, 2, 2) : [];
    const destinationStoplist = destinationCode
        ? getInitialNearbySourceDestStops(sameRouteForDestination, destinationCode, 2, 2)
        : [];

    return { sourceStoplist, destinationStoplist };
};

export const getRefundAmount = (leg: legInfo | undefined) => {
    if (!leg) return undefined;
    const legExtra = leg?.legExtraInfo;
    if (!legExtra) return undefined;
    if (legExtra.TAG === 'Bus' || legExtra.TAG === 'Metro' || legExtra.TAG === 'Subway')
        return legExtra._0.refund?.amount;

    return undefined;
};

export const transformSortedRouteToJourneyRoutes = (
    /* eslint-disable myCustomPlugin/enforce-optional-params */
    sortedRoute: (legRouteInfo & { towardsStation?: string[] })[] | undefined,
    allSourceStations?: string[],
    allDestinationStations?: string[],
    allTowardsStations?: string[],
): Array<{
    type: 'SWITCH_STATION_START_JOURNEY' | 'NON_SWITCH_STATION_START_JOURNEY' | 'WALK' | 'DESTINATION_JOURNEY';
    sourceStation: string | undefined;
    sourceStationRegional: string | undefined;
    destinationStation: string | undefined;
    destinationStationRegional: string | undefined;
    platformNumber: string | undefined;
    isChangeStation: boolean | undefined;
    lineColor: (string | undefined)[];
    lastStop: string | undefined;
    towardsStation: string | undefined;
    allLastStops: string[] | undefined;
    allTowardsStations: string[] | undefined;
}> => {
    // Handle empty or invalid input
    if (!sortedRoute) {
        return [];
    }

    if (sortedRoute.length === 0) {
        return [];
    }

    const journeyRoutes: Array<{
        type: 'SWITCH_STATION_START_JOURNEY' | 'NON_SWITCH_STATION_START_JOURNEY' | 'WALK' | 'DESTINATION_JOURNEY';
        sourceStation: string | undefined;
        sourceStationRegional: string | undefined;
        destinationStation: string | undefined;
        destinationStationRegional: string | undefined;
        platformNumber: string | undefined;
        isChangeStation: boolean | undefined;
        lineColor: (string | undefined)[];
        lastStop: string | undefined;
        towardsStation: string | undefined;
        allLastStops: string[];
        allTowardsStations: string[];
    }> = [];

    let allStations: string[] = [];

    if (allSourceStations && allSourceStations.length > 0) {
        allStations = allSourceStations;
    } else {
        const firstRoute = sortedRoute[0];
        if (firstRoute && firstRoute.originStop.name) {
            if (sortedRoute[0]?.originStop.name) {
                allStations.push(sortedRoute[0].originStop.name);
            }

            // Add destination stations from each route
            sortedRoute.forEach(route => {
                if (route.destinationStop.name && !allStations.includes(route.destinationStop.name)) {
                    allStations.push(route.destinationStop.name);
                }
            });
        }
    }

    if (allStations.length === 0) {
        return [];
    }

    const hasMultipleRoutes = sortedRoute.length > 1;

    // Create legs for each station segment
    for (let i = 0; i < allStations.length - 1; i++) {
        const currentStation = allStations[i];
        const nextStation = allStations[i + 1];

        if (currentStation && nextStation) {
            // Determine the type based on position
            let journeyType:
                | 'SWITCH_STATION_START_JOURNEY'
                | 'NON_SWITCH_STATION_START_JOURNEY'
                | 'WALK'
                | 'DESTINATION_JOURNEY';

            if (i === 0) {
                // First leg of the journey
                journeyType = hasMultipleRoutes ? 'SWITCH_STATION_START_JOURNEY' : 'NON_SWITCH_STATION_START_JOURNEY';
            } else if (i === allStations.length - 2) {
                // Last leg of the journey
                journeyType = 'DESTINATION_JOURNEY';
            } else {
                // Intermediate legs - these are switch stations
                journeyType = 'SWITCH_STATION_START_JOURNEY';
            }

            let platformNumber: string | undefined;
            let lastStop: string | undefined;
            let processedAllLastStops: string[] | undefined;
            let processedAllTowardsStations: string[] | undefined;

            // Use provided arrays if available
            if (allTowardsStations && allTowardsStations.length > 0) {
                // Use provided towards stations array directly
                processedAllTowardsStations = allTowardsStations;
            } else {
                if (Array.isArray(sortedRoute[0]?.towardsStation)) {
                    processedAllTowardsStations = sortedRoute[0].towardsStation.filter(
                        (s): s is string => s !== undefined,
                    );
                }
            }
            const wasBuiltFromIndividualRoutes = !allSourceStations;

            if (wasBuiltFromIndividualRoutes) {
                const correspondingRoute =
                    sortedRoute.find(
                        route => route.originStop.name === currentStation && route.destinationStop.name === nextStation,
                    ) || sortedRoute[0]; // fallback to first route
                platformNumber = correspondingRoute?.platformNumber;
                lastStop = allStations[allStations.length - 1];
                processedAllLastStops = [allStations[allStations.length - 1] || ''].filter(s => s);
            } else {
                // For combined string or provided arrays: Use appropriate data
                platformNumber = sortedRoute[0]?.platformNumber;

                if (allDestinationStations && allDestinationStations.length > 0) {
                    lastStop = allDestinationStations[allDestinationStations.length - 1];
                    processedAllLastStops = allDestinationStations;
                }
            }

            journeyRoutes.push({
                type: journeyType,
                sourceStation: currentStation,
                sourceStationRegional: undefined,
                destinationStation: nextStation,
                destinationStationRegional: undefined,
                platformNumber: platformNumber,
                isChangeStation: i > 0,
                lineColor: sortedRoute.map(route => route.lineColor),
                lastStop: lastStop,
                towardsStation: undefined,
                allLastStops: processedAllLastStops || [],
                allTowardsStations: processedAllTowardsStations || [],
            });
        }
    }

    return journeyRoutes;
};

export const createLineStationMapping = (
    lineColors: (string | undefined)[],
    towardsStation: string[] | undefined,
): Array<{ line: string; station: string }> => {
    if (!towardsStation) return [];

    const stations = towardsStation;

    return lineColors
        .map((lineColor, index) => ({
            line: lineColor || '',
            station: stations[index] || '',
        }))
        .filter(mapping => mapping.line && mapping.station);
};

export const mapJourneyLegsToJourneyModes = (legs: legInfo[]): ('metro' | 'bus' | 'taxi' | 'walk')[] => {
    return legs.map(leg => {
        switch (leg.travelMode) {
            case 'Subway':
            case 'Metro':
                return 'metro';
            case 'Bus':
                return 'bus';
            case 'Taxi':
                return 'taxi';
            default:
                return 'walk';
        }
    });
};
