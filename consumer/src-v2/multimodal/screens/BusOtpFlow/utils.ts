import {
    transportStation,
    transportRouteStopMapping,
    transportRoute,
} from '../../../../src/readOnly/api/types/PublicTransportData.gen';
import { getBestPossibleLocation } from '../../../../src/typescript/utils/location';
import { calculateStraightLineDistance } from '../../../../src/typescript/utils/common';

// Projection helpers - convert lat/lon to local XY (meters) for short-range projections
const EARTH_RADIUS = 6371000; // meters
const deg2rad = (deg: number) => (deg * Math.PI) / 180;

const latLonToXY = (lat: number, lon: number, refLat: number) => {
    const meanLatRad = deg2rad(refLat);
    const x = deg2rad(lon) * EARTH_RADIUS * Math.cos(meanLatRad);
    const y = deg2rad(lat) * EARTH_RADIUS;
    return { x, y };
};

export const projectPointOnSegment = (
    pLat: number,
    pLon: number,
    aLat: number,
    aLon: number,
    bLat: number,
    bLon: number,
) => {
    const refLat = (aLat + bLat + pLat) / 3; // mean lat for local projection
    const p = latLonToXY(pLat, pLon, refLat);
    const a = latLonToXY(aLat, aLon, refLat);
    const b = latLonToXY(bLat, bLon, refLat);

    const ab = { x: b.x - a.x, y: b.y - a.y };
    const ap = { x: p.x - a.x, y: p.y - a.y };

    const abLen2 = ab.x * ab.x + ab.y * ab.y;
    const dot = ab.x * ap.x + ab.y * ap.y;
    const t = abLen2 === 0 ? 0 : dot / abLen2;

    // projection clamped on segment
    const tClamped = Math.max(0, Math.min(1, t));

    const projLat = aLat + (bLat - aLat) * tClamped;
    const projLon = aLon + (bLon - aLon) * tClamped;

    const perpDist = calculateStraightLineDistance(pLat, pLon, projLat, projLon);

    return { t, tClamped, projLat, projLon, perpDist };
};
import { legInfo } from '../../../../src/readOnly/api/types/LegInfo.gen';
import { ProcessedLegInfo } from '../../types/journeyTracking';
import { StationSection, StationType } from '../MetroSubwayBooking/components/DestinationPickerWithSections';
import { capitalize } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { calculateTotalPriceFromCategories } from '../../components/JourneyPayment/Types';

/**
 * TicketData interface for bus ticket information
 */
export interface TicketData {
    busNumber: string;
    ticketNumber: string;
    date: string;
    time: string;
    routeCodes: {
        code1: string;
        code2: string;
        code3: string;
        code4: string;
    };
    route: {
        sourceInEnglish: string;
        destinationInEnglish: string;
        sourceInTamil: string;
        destinationInTamil: string;
    };
    fare: {
        quantity: number;
        unitPrice: number;
        categoryInitialPrice: number;
        name: string;
        total: number;
    }[];
    serviceTierType: string;
    busConductorId: string;
    busDriverId: string;
    price: {
        amount: string;
        currency: string;
    };
    header: {
        tamil: string;
        subtitle: string;
    };
    footer: {
        line1: string;
        line2: string;
    };
}

/**
 * Sorts stations based on the sequence number from route stop mappings
 * First filters stations by routeCode, then sorts by sequence number
 */
export const sortStationsBySequence = (
    stations: transportStation[],
    routeStopMappings: transportRouteStopMapping[],
    routeCode: string | null,
): transportStation[] => {
    if (!routeCode) {
        console.info('No routeCode provided, returning original stations');
        return [...stations];
    }

    const stationMap = stations.reduce((map, station) => {
        // eslint-disable-next-line functional/immutable-data
        map.set(station.code, station);
        return map;
    }, new Map<string, transportStation>());

    const filteredMappings = routeStopMappings.filter(mapping => mapping.routeCode === routeCode);

    const sortedMappings = [...filteredMappings].sort((a, b) => a.sequenceNum - b.sequenceNum);

    // Deduplicate mappings by stopCode (keep first occurrence - lowest sequence number)
    const uniqueMappings = sortedMappings.filter(
        (mapping, index, array) => array.findIndex(m => m.stopCode === mapping.stopCode) === index,
    );

    const sortedStations = uniqueMappings
        .map(mapping => stationMap.get(mapping.stopCode))
        .filter((station): station is transportStation => station !== undefined);

    return sortedStations;
};

/**
 * Finds the nearest station to the user's current location
 */
export const findNearestStation = async (
    stations: transportStation[],
    userLocationOverride: { coords: { latitude: number; longitude: number } } | undefined = undefined,
): Promise<transportStation | null> => {
    try {
        const userLocation = userLocationOverride ?? (await getBestPossibleLocation());

        if (!userLocation || stations.length === 0) {
            return null;
        }

        const stationsWithDistance = stations.map(station => ({
            station,
            distance: calculateStraightLineDistance(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                station.lat,
                station.lon,
            ),
        }));

        const nearestStationData = stationsWithDistance.reduce((nearest, current) =>
            current.distance < nearest.distance ? current : nearest,
        );

        const nearestStation = nearestStationData.station;

        return nearestStation;
    } catch (error) {
        console.error('Error finding nearest station:', error);
        return null;
    }
};

/**
 * Bus OTP specific nearest station logic — uses projection along the segment
 * and prefers previous stop when applicable (see business requirements).
 */
export const findNearestStationForBusOtp = async (
    stations: transportStation[],
    preferNextThresholdMeters = 100,
    projectionToleranceMeters = 50,
    userLocationOverride: { coords: { latitude: number; longitude: number } } | undefined = undefined,
): Promise<transportStation | null> => {
    try {
        const userLocation = userLocationOverride ?? (await getBestPossibleLocation());

        if (!userLocation || stations.length === 0) {
            return null;
        }

        const stationsWithDistance = stations.map(station => ({
            station,
            distance: calculateStraightLineDistance(
                userLocation.coords.latitude,
                userLocation.coords.longitude,
                station.lat,
                station.lon,
            ),
        }));

        const nearestStationData = stationsWithDistance.reduce((nearest, current) =>
            current.distance < nearest.distance ? current : nearest,
        );

        const nearestStation = nearestStationData.station;
        const nearestDistance = nearestStationData.distance;

        // If nearest is the first or last station, return it directly
        const nearestIndex = stations.findIndex(s => s.code === nearestStation.code);
        if (nearestIndex === -1) return nearestStation;
        if (nearestIndex === 0 || nearestIndex === stations.length - 1) {
            return nearestStation;
        }

        const prevStation = stations[nearestIndex - 1];
        const nextStation = stations[nearestIndex + 1];

        if (!prevStation || !nextStation) {
            // Safety net: if for any reason the sequence is malformed, return nearest
            return nearestStation;
        }

        const projectAB = projectPointOnSegment(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            prevStation.lat,
            prevStation.lon,
            nearestStation.lat,
            nearestStation.lon,
        );

        const projectBC = projectPointOnSegment(
            userLocation.coords.latitude,
            userLocation.coords.longitude,
            nearestStation.lat,
            nearestStation.lon,
            nextStation.lat,
            nextStation.lon,
        );

        if (projectAB.t >= 0 && projectAB.t <= 1 && projectAB.perpDist <= projectionToleranceMeters) {
            if (nearestDistance <= preferNextThresholdMeters) {
                return nearestStation;
            }
            return prevStation;
        }

        if (projectBC.t >= 0 && projectBC.t <= 1 && projectBC.perpDist <= projectionToleranceMeters) {
            return nearestStation;
        }

        if (nearestDistance <= preferNextThresholdMeters) {
            return nearestStation;
        }

        return prevStation;
    } catch (error) {
        console.error('Error finding nearest station for bus otp:', error);
        return null;
    }
};

/**
 * Converts legInfo to TicketData format
 */
export const createTicketDataFromLegInfo = (legInfo: legInfo | undefined): TicketData => {
    const busInfo = legInfo?.legExtraInfo.TAG === 'Bus' ? legInfo?.legExtraInfo._0 : undefined;
    const totalFare = legInfo?.totalFare?.amount ?? 0;

    const ticketCreatedAt = busInfo?.ticketsCreatedAt?.[0];
    const ticketDate = ticketCreatedAt ? new Date(ticketCreatedAt) : new Date();

    const routeCodes = busInfo?.alternateShortNames || [];

    return {
        busNumber: busInfo?.routeName || '',
        ticketNumber: busInfo?.ticketNo?.[0] || '',
        date: ticketDate.toLocaleDateString('en-US', { day: 'numeric', month: '2-digit', year: 'numeric' }),
        time: ticketDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }),
        routeCodes: {
            code1: routeCodes[0] || '',
            code2: routeCodes[1] || '',
            code3: routeCodes[2] || '',
            code4: routeCodes[3] || '',
        },
        route: {
            sourceInEnglish: busInfo?.originStop?.name || '',
            destinationInEnglish: busInfo?.destinationStop?.name || '',
            sourceInTamil: busInfo?.originStop?.regionalName || '',
            destinationInTamil: busInfo?.destinationStop?.regionalName || '',
        },
        fare: busInfo?.categories
            ? busInfo.categories
                  .filter(category => (category.categorySelectedQuantity ?? 0) > 0)
                  .map(category => ({
                      quantity: category.categorySelectedQuantity ?? 0,
                      unitPrice: category.categoryOfferedPrice?.amount ?? 0,
                      categoryInitialPrice: category.categoryPrice?.amount ?? 0,
                      name: category.categoryMeta?.title ?? category.categoryName,
                      total: (category.categorySelectedQuantity ?? 0) * (category.categoryOfferedPrice?.amount ?? 0),
                  }))
            : [],
        serviceTierType: busInfo?.selectedServiceTier?.serviceTierName || '',
        busConductorId: busInfo?.busConductorId ?? '',
        busDriverId: busInfo?.busDriverId ?? '',
        price: {
            amount: totalFare.toFixed(2),
            currency: 'ரூ.',
        },
        header: {
            tamil: 'மா. போ. க. (சென்னை)',
            subtitle: busInfo?.originStop?.name ?? '', //'தாம்பரம் பணிமனை',
        },
        footer: {
            line1: 'மோட்டார் வாகன',
            line2: 'விதிகளுக்குட்பட்டது',
        },
    };
};

/**
 * Converts ProcessedLegInfo to TicketData format
 */
export const createTicketDataFromProcessedLegInfo = (processedLegInfo: ProcessedLegInfo | undefined): TicketData => {
    const staticInfo = processedLegInfo?.staticInfo;
    const categories = staticInfo?.categories || [];
    const ticketCreatedAt = staticInfo?.ticketCreatedAt?.[0];
    const ticketDate = ticketCreatedAt ? new Date(ticketCreatedAt) : new Date();
    const routeCodes = staticInfo?.alternateRoutesNames || [];

    return {
        busNumber: staticInfo?.vehicleName || '',
        ticketNumber: staticInfo?.ticketNumber || '',
        date: ticketDate.toLocaleDateString('en-US', { day: 'numeric', month: '2-digit', year: 'numeric' }),
        time: ticketDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }),
        routeCodes: {
            code1: routeCodes[0] || '',
            code2: routeCodes[1] || '',
            code3: routeCodes[2] || '',
            code4: routeCodes[3] || '',
        },
        route: {
            sourceInEnglish: staticInfo?.origin.stationName || '',
            destinationInEnglish: staticInfo?.destination.stationName || '',
            sourceInTamil: staticInfo?.origin.regionalName || '',
            destinationInTamil: staticInfo?.destination.regionalName || '',
        },
        fare: categories
            .filter(category => (category.categorySelectedQuantity ?? 0) > 0)
            .map(category => ({
                quantity: category.categorySelectedQuantity ?? 0,
                unitPrice: category.categoryOfferedPrice?.amount ?? 0,
                categoryInitialPrice: category.categoryPrice.amount ?? 0,
                name: category.categoryMeta?.title ?? category.categoryName,
                total: (category.categorySelectedQuantity ?? 0) * (category.categoryOfferedPrice?.amount ?? 0),
            })),
        serviceTierType: staticInfo?.selectedServiceTierName || '',
        busConductorId: staticInfo?.busConductorId ?? '',
        busDriverId: staticInfo?.busDriverId ?? '',
        price: {
            amount: calculateTotalPriceFromCategories(categories).toFixed(2),
            currency: 'ரூ.',
        },
        header: {
            tamil: 'மா. போ. க. (சென்னை)',
            subtitle: staticInfo?.origin.stationName ?? '', //'தாம்பரம் பணிமனை',
        },
        footer: {
            line1: 'மோட்டார் வாகன',
            line2: 'விதிகளுக்குட்பட்டது',
        },
    };
};

export const getUniqueStations = (stations: transportStation[]): transportStation[] => {
    const stationMap = stations.reduce((map, station) => {
        // eslint-disable-next-line functional/immutable-data
        map.set(station.code, station);
        return map;
    }, new Map<string, transportStation>());

    return Array.from(stationMap.values());
};

/**
 * Creates station sections from available routes
 * Each route will have its own section with all stations sorted by sequence
 * Includes displayName with direction arrows (↑/↓) and "towards [destination]"
 */
export const createStationSectionsFromRoutes = (
    availableRoutes: transportRoute[],
    allStations: transportStation[],
    routeStopMappings: transportRouteStopMapping[],
): StationSection[] => {
    const sections: StationSection[] = [];

    availableRoutes.forEach((route, index) => {
        const sortedStations = sortStationsBySequence(allStations, routeStopMappings, route.code);

        if (sortedStations.length === 0) {
            return;
        }

        const getDirectionIndicator = (route: transportRoute, index: number) => {
            if (route.reverseRoute) {
                return '↓';
            }

            const isReverse = availableRoutes.some(r => r.reverseRoute === route.code);
            if (isReverse) {
                return '↑';
            }

            return index % 2 === 0 ? '↓' : '↑';
        };

        const direction = getDirectionIndicator(route, index);
        const displayName = `${route.shortName} ${direction}`;
        const lastStation = sortedStations[sortedStations.length - 1];

        if (!lastStation) {
            return;
        }

        // eslint-disable-next-line functional/immutable-data
        sections.push({
            title: `${displayName} towards ${capitalize(lastStation.name)}`,
            stations: sortedStations,
            routeCode: route.code,
            type: StationType.Towards,
        });
    });

    return sections;
};

/**
 * Computes filtered route sections based on a selected source station code
 * For each route, removes stops before the source station (or nearest station if source not in route)
 */
export const computeFilteredRouteSections = async (
    sourceStationCode: string | undefined,
    availableRoutes: transportRoute[],
    allStations: transportStation[],
    routeStopMappings: transportRouteStopMapping[],
    userLocationOverride: { coords: { latitude: number; longitude: number } } | undefined,
): Promise<StationSection[]> => {
    const routeSections = createStationSectionsFromRoutes(availableRoutes, allStations, routeStopMappings);

    const filteredSections = await Promise.all(
        routeSections.map(async section => {
            if (!sourceStationCode || section.stations.length === 0) {
                return section;
            }

            const stationIndex = section.stations.findIndex(station => station.code === sourceStationCode);

            if (stationIndex !== -1) {
                // Source found in this route - truncate stops before it
                const isIndexValid = stationIndex < section.stations.length - 2;
                return {
                    ...section,
                    stations: section.stations.slice(isIndexValid ? stationIndex + 1 : stationIndex),
                    routeCode: section.routeCode,
                };
            } else {
                // Source not in this route - find nearest station in this route
                const nearestInRoute = await findNearestStationForBusOtp(
                    section.stations,
                    100,
                    50,
                    userLocationOverride,
                );
                if (nearestInRoute) {
                    const nearestIndex = section.stations.findIndex(s => s.code === nearestInRoute.code);
                    if (nearestIndex !== -1) {
                        const isIndexValid = nearestIndex < section.stations.length - 2;
                        return {
                            ...section,
                            stations: section.stations.slice(isIndexValid ? nearestIndex + 1 : nearestIndex),
                            routeCode: section.routeCode,
                        };
                    }
                }
            }
            return section;
        }),
    );

    return filteredSections;
};
