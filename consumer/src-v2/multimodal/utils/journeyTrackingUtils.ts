import { isUndefined, round } from 'lodash';
import {
    type FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType,
    type MultimodalTravelMode_multimodalTravelMode as Enums_MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';
import { type legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { type latLong as LatLongType } from '@/readOnly/api/types/LatLong.gen';
import {
    type TransitMode,
    type UserState,
    type LiveVehicleData,
    type TrackedLegInfoStaticInfo,
    StopsInformationItem,
    StopType,
    ProcessedLegInfo,
    GatesInfo,
} from '@/src-v2/multimodal/types/journeyTracking';
import { JourneyStatus, Transit } from '@/src-v2/multimodal/screens/NewLiveJourney/components/Iternary/types';
import { calculateDistance } from './PublicTransportUtils';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { geoJsonGeometry } from '@/api/apiTypes/ServiceabilityApi.gen';
import { STATION_DWELL_TIME } from '@/src-v2/multimodal/rules/strategies/common';
import { LocationWithTimestamp } from '../hooks/useRiderLocation';
import { getTrackingStatusForLeg, VehicleState } from '@/typescript/utils/LegStatusUtils';
import { legRouteInfo } from '@/readOnly/api/types/LegRouteInfo.gen';
import { strings } from 'config-types';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

export const mapTransitModeToAutoCab = (transitMode: TransitMode | undefined): 'auto' | 'cab' | 'bike' | undefined => {
    if (!transitMode) return undefined;
    switch (transitMode) {
        case 'AUTO':
            return 'auto';
        case 'TAXI':
            return 'cab';
        case 'BIKE':
            return 'bike';
        default:
            return undefined;
    }
};

export const capitalize = (str: string | undefined): string | undefined => {
    if (!str) return undefined;
    return str
        .split(' ')
        .map(word => {
            const firstChar = word.charAt(0);
            if (/[a-zA-Z]/.test(firstChar)) {
                return firstChar.toUpperCase() + word.slice(1).toLowerCase();
            }
            // If first char is not a letter, capitalize next letter
            const nextLetterIndex = word.split('').findIndex((char, i) => i > 0 && /[a-zA-Z]/.test(char));
            if (nextLetterIndex === -1) return word;
            return (
                word.slice(0, nextLetterIndex) +
                word.charAt(nextLetterIndex).toUpperCase() +
                word.slice(nextLetterIndex + 1).toLowerCase()
            );
        })
        .join(' ');
};

/**
 * Formats a gate description string to be properly capitalized and formatted
 * @param gateDescription String like "D-church street side"
 * @returns Formatted string like "Church Street Side Gate"
 */
export const formatGateDescription = (gateDescription: string | undefined): string | undefined => {
    if (!gateDescription) return undefined;
    // Remove any leading characters like "D-" followed by spaces
    const [gateNumber, gateName] = gateDescription.split('-');
    if (!gateName) return gateNumber;

    const formattedGate = gateNumber + ' (' + capitalize(gateName) + ')';

    return formattedGate.startsWith('Gate') ? formattedGate : `Gate ${formattedGate}`;
};

export const formatTime = (time: number | string) => {
    return typeof time === 'number'
        ? new Date(time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
        : time;
};

export const localMapHookTransitModeToDomainTransit = (hookMode: TransitMode | undefined): Transit => {
    switch (hookMode) {
        case 'WALK':
            return 'WALK';
        case 'BUS':
            return 'BUS';
        case 'METRO':
            return 'METRO';
        case 'SUBWAY':
            return 'SUBWAY';
        case 'TAXI':
            return 'TAXI';
        case 'AUTO':
            return 'AUTO';
        case 'BIKE':
            return 'BIKE';
        default:
            return 'NOTMOVING';
    }
};

export const mapBackendStatusToUserState = (legInfo: legInfo | undefined, transitMode: TransitMode): UserState => {
    if (transitMode === 'WALK') {
        return 'WALK';
    }

    const getUserStateFromTrackingStatus: () => UserState = () => {
        if (legInfo) {
            const status = getTrackingStatusForLeg(legInfo, undefined);
            if (status === 'Ongoing' || status === 'Finishing') {
                return 'INVEHICLE';
            }
            if (status === 'ExitingStation') {
                return 'EXITSTATION';
            }
        }
        return 'WAITING';
    };

    return getUserStateFromTrackingStatus();

    // if (legInfo) {
    //     // Use bookingStatus as primary source for UserState mapping
    //     switch (legInfo.bookingStatus.TAG) {
    //         case 'Initial': {
    //             switch (legInfo.bookingStatus._0) {
    //                 case 'BOOKING_PENDING':
    //                     return 'WAITING';
    //                 default:
    //                     return getUserStateFromTrackingStatus();
    //             }
    //         }
    //         case 'TaxiBooking': {
    //             switch (legInfo.bookingStatus._0) {
    //                 case 'CONFIRMED':
    //                 case 'TRIP_ASSIGNED':
    //                     return 'INVEHICLE';
    //                 case 'COMPLETED':
    //                     return 'EXITSTATION';
    //                 case 'CANCELLED':
    //                 case 'NEW':
    //                 case 'AWAITING_REASSIGNMENT':
    //                 case 'REALLOCATED':
    //                     return 'WAITING';
    //                 default:
    //                     return getUserStateFromTrackingStatus();
    //             }
    //         }
    //         case 'TaxiRide': {
    //             switch (legInfo.bookingStatus._0) {
    //                 case 'INPROGRESS':
    //                     return 'INVEHICLE';
    //                 case 'COMPLETED':
    //                     return 'EXITSTATION';
    //                 case 'CANCELLED':
    //                 case 'UPCOMING':
    //                 case 'NEW':
    //                     return 'WAITING';
    //                 default:
    //                     return getUserStateFromTrackingStatus();
    //             }
    //         }
    //         case 'FRFSBooking': {
    //             switch (legInfo.bookingStatus._0) {
    //                 default:
    //                     return getUserStateFromTrackingStatus();
    //             }
    //         }
    //         case 'FRFSTicket': {
    //             switch (legInfo.bookingStatus._0) {
    //                 default:
    //                     return getUserStateFromTrackingStatus();
    //             }
    //         }
    //         case 'TaxiEstimate': {
    //             switch (legInfo.bookingStatus._0) {
    //                 default:
    //                     return getUserStateFromTrackingStatus();
    //             }
    //         }
    //         case 'Feedback': {
    //             switch (legInfo.bookingStatus._0) {
    //                 case 'FEEDBACK_PENDING':
    //                     return 'EXITSTATION';
    //                 default:
    //                     return getUserStateFromTrackingStatus();
    //             }
    //         }
    //         default:
    //             return getUserStateFromTrackingStatus();
    //     }
    // }

    // return 'WAITING';
};

export const mapTravelModeToTransitMode = (
    travelMode: Enums_MultimodalTravelMode_multimodalTravelMode,
    serviceTierName: string | undefined,
): TransitMode => {
    if (travelMode === 'Taxi' && serviceTierName?.toLowerCase().includes('auto')) return 'AUTO';
    if (travelMode === 'Taxi' && serviceTierName?.toLowerCase().includes('bike')) return 'BIKE';
    switch (travelMode) {
        case 'Walk':
            return 'WALK';
        case 'Bus':
            return 'BUS';
        case 'Metro':
            return 'METRO';
        case 'Subway':
            return 'SUBWAY';
        case 'Taxi':
            return 'TAXI';
        default:
            return 'TAXI';
    }
};

export const getFrfsVehicleType = (
    transitMode: TransitMode,
): FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType | undefined => {
    switch (transitMode) {
        case 'BUS':
            return 'BUS';
        case 'METRO':
            return 'METRO';
        case 'SUBWAY':
            return 'SUBWAY';
        default:
            return undefined;
    }
};

export const isVehicleStateOngoing = (vehicleState: VehicleState) => {
    return (
        vehicleState === 'RIDESTARTED' ||
        vehicleState === 'RIDECLOSETODESTINATION' ||
        vehicleState === 'RIDEREACHEDDESTINATION' ||
        vehicleState === 'ARRIVEDATSTATIONPLATFORM'
    );
};

export const extractOriginName = (
    metaLeg: legInfo,
    previousLeg: legInfo | undefined,
): { entryGate: string | undefined; exitGate: string | undefined; stationName: string | undefined } => {
    const entryGate = previousLeg?.entrance?.streetName
        ? formatGateDescription(previousLeg.entrance.streetName)
        : undefined;
    const exitGate = metaLeg?.exit?.streetName ? formatGateDescription(metaLeg.exit.streetName) : undefined;
    const stationName = capitalize(
        (() => {
            if (metaLeg.legExtraInfo?.TAG === 'Walk' || metaLeg.legExtraInfo?.TAG === 'Taxi')
                return metaLeg.legExtraInfo?._0?.origin?.address?.title;
            if (metaLeg.legExtraInfo?.TAG === 'Bus') return metaLeg.legExtraInfo?._0?.originStop?.name;
            if (metaLeg.legExtraInfo?.TAG === 'Metro' || metaLeg.legExtraInfo?.TAG === 'Subway')
                return metaLeg.legExtraInfo?._0?.routeInfo?.[0]?.originStop?.name;
            return undefined;
        })(),
    );
    return { exitGate, entryGate, stationName };
};

export const extractOriginStopCode = (metaLeg: legInfo): string | undefined => {
    if (metaLeg.legExtraInfo?.TAG === 'Bus') return metaLeg.legExtraInfo?._0?.originStop?.code;
    if (metaLeg.legExtraInfo?.TAG === 'Metro' || metaLeg.legExtraInfo?.TAG === 'Subway')
        return metaLeg.legExtraInfo?._0?.routeInfo?.[0]?.originStop?.code;
    return undefined;
};

export const extractOriginLatLong = (metaLeg: legInfo, previousLeg: legInfo | undefined): LatLongType => {
    // Use previous leg's entrance coordinates if available
    if (previousLeg?.entrance?.lat !== undefined && previousLeg?.entrance?.lon !== undefined) {
        return {
            lat: previousLeg.entrance.lat,
            lon: previousLeg.entrance.lon,
        };
    }

    if (metaLeg.legExtraInfo?.TAG === 'Walk' || metaLeg.legExtraInfo?.TAG === 'Taxi')
        return {
            lat: metaLeg.exit?.lat ?? metaLeg.legExtraInfo?._0?.origin?.lat ?? 0,
            lon: metaLeg.exit?.lon ?? metaLeg.legExtraInfo?._0?.origin?.lon ?? 0,
        };
    if (metaLeg.legExtraInfo?.TAG === 'Bus')
        return {
            lat: metaLeg.legExtraInfo?._0?.originStop?.lat ?? 0,
            lon: metaLeg.legExtraInfo?._0?.originStop?.lon ?? 0,
        };
    if (metaLeg.legExtraInfo?.TAG === 'Metro' || metaLeg.legExtraInfo?.TAG === 'Subway') {
        const stop = metaLeg.legExtraInfo?._0?.routeInfo?.[0]?.originStop;
        return { lat: stop?.lat ?? 0, lon: stop?.lon ?? 0 };
    }
    return { lat: 0, lon: 0 };
};

export const extractDestinationName = (
    metaLeg: legInfo,
    nextLeg: legInfo | undefined,
): { exitGate: string | undefined; entryGate: string | undefined; stationName: string | undefined } => {
    const exitGate = nextLeg?.exit?.streetName ? formatGateDescription(nextLeg.exit.streetName) : undefined;
    const entryGate = metaLeg?.entrance?.streetName ? formatGateDescription(metaLeg.entrance.streetName) : undefined;

    const stationName = capitalize(
        (() => {
            if (metaLeg.legExtraInfo.TAG === 'Walk' || metaLeg.legExtraInfo.TAG === 'Taxi')
                return metaLeg.legExtraInfo._0.destination.address.title;
            if (metaLeg.legExtraInfo.TAG === 'Bus') return metaLeg.legExtraInfo._0.destinationStop.name;
            if (metaLeg.legExtraInfo.TAG === 'Metro' || metaLeg.legExtraInfo.TAG === 'Subway')
                return metaLeg.legExtraInfo._0.routeInfo?.[0]?.destinationStop.name;
            return undefined;
        })(),
    );
    return { exitGate, entryGate, stationName };
};

export const extractDestinationStopCode = (metaLeg: legInfo): string | undefined => {
    if (metaLeg.legExtraInfo.TAG === 'Bus') return metaLeg.legExtraInfo._0.destinationStop?.code;
    if (metaLeg.legExtraInfo.TAG === 'Metro' || metaLeg.legExtraInfo.TAG === 'Subway')
        return metaLeg.legExtraInfo._0.routeInfo?.[0]?.destinationStop?.code;
    return undefined;
};

export const extractDestinationLatLong = (metaLeg: legInfo, nextLeg: legInfo | undefined): LatLongType => {
    // Use next leg's exit coordinates if available
    if (nextLeg?.exit?.lat !== undefined && nextLeg?.exit?.lon !== undefined) {
        return {
            lat: nextLeg.exit.lat,
            lon: nextLeg.exit.lon,
        };
    }

    if (metaLeg.legExtraInfo.TAG === 'Walk' || metaLeg.legExtraInfo.TAG === 'Taxi')
        return {
            lat: metaLeg.entrance?.lat ?? metaLeg.legExtraInfo._0.destination.lat,
            lon: metaLeg.entrance?.lon ?? metaLeg.legExtraInfo._0.destination.lon,
        };
    if (metaLeg.legExtraInfo.TAG === 'Bus')
        return {
            lat: metaLeg.legExtraInfo._0.destinationStop.lat ?? 0,
            lon: metaLeg.legExtraInfo._0.destinationStop.lon ?? 0,
        };
    if (metaLeg.legExtraInfo.TAG === 'Metro' || metaLeg.legExtraInfo.TAG === 'Subway') {
        const stop = metaLeg.legExtraInfo._0.routeInfo?.[0]?.destinationStop;
        return { lat: stop?.lat ?? 0, lon: stop?.lon ?? 0 };
    }
    return { lat: 0, lon: 0 };
};

export const extractVehicleName = (metaLeg: legInfo, transitMode: TransitMode): string | null => {
    if (transitMode === 'BUS' && metaLeg.legExtraInfo.TAG === 'Bus') return metaLeg.legExtraInfo._0.routeName ?? null;
    if (transitMode === 'SUBWAY' && metaLeg.legExtraInfo.TAG === 'Subway')
        return metaLeg.legExtraInfo._0.routeInfo?.[0]?.trainNumber ?? null;
    if (transitMode === 'METRO' && metaLeg.legExtraInfo.TAG === 'Metro') {
        const lineColor = metaLeg.legExtraInfo._0.routeInfo?.[0]?.lineColor;
        return lineColor ? `${lineColor} Line` : null;
    }
    if (metaLeg.legExtraInfo.TAG === 'Taxi')
        return metaLeg.legExtraInfo._0.vehicleNumber ? `${metaLeg.legExtraInfo._0.vehicleNumber.toUpperCase()}` : '';
    return null;
};

export const extractTickets = (metaLeg: legInfo, transitMode: TransitMode): string[] | undefined => {
    if (
        (transitMode === 'BUS' && metaLeg.legExtraInfo.TAG === 'Bus') ||
        (transitMode === 'METRO' && metaLeg.legExtraInfo.TAG === 'Metro') ||
        (transitMode === 'SUBWAY' && metaLeg.legExtraInfo.TAG === 'Subway')
    )
        return metaLeg.legExtraInfo._0.tickets;
    return undefined;
};

export const extractTicketCreatedAt = (metaLeg: legInfo, transitMode: TransitMode): string[] | undefined => {
    if (
        (transitMode === 'BUS' && metaLeg.legExtraInfo.TAG === 'Bus') ||
        (transitMode === 'METRO' && metaLeg.legExtraInfo.TAG === 'Metro') ||
        (transitMode === 'SUBWAY' && metaLeg.legExtraInfo.TAG === 'Subway')
    )
        return metaLeg.legExtraInfo._0.ticketsCreatedAt;
    return undefined;
};

export const extractAlternateRouteNames = (metaLeg: legInfo, transitMode: TransitMode): string[] | undefined => {
    if (transitMode === 'BUS' && metaLeg.legExtraInfo.TAG === 'Bus') return metaLeg.legExtraInfo._0.alternateShortNames;
    return undefined;
};

export const extractPlatform = (metaLeg: legInfo, transitMode: TransitMode): string | undefined => {
    if (transitMode === 'METRO' && metaLeg.legExtraInfo.TAG === 'Metro')
        return metaLeg.legExtraInfo._0.routeInfo?.[0]?.platformNumber;
    if (transitMode === 'SUBWAY' && metaLeg.legExtraInfo.TAG === 'Subway')
        return metaLeg.legExtraInfo._0.routeInfo?.[0]?.platformNumber;
    return undefined;
};

export const extractBookingId = (metaLeg: legInfo): string | undefined => {
    if (metaLeg.legExtraInfo.TAG === 'Taxi') return metaLeg.legExtraInfo._0.bookingId;
    return undefined;
};

export const extractCategories = (metaLeg: legInfo): categoryInfoResponse[] => {
    if (metaLeg.legExtraInfo.TAG === 'Bus') return metaLeg.legExtraInfo._0.categories ?? [];
    if (metaLeg.legExtraInfo.TAG === 'Metro') return metaLeg.legExtraInfo._0.categories ?? [];
    if (metaLeg.legExtraInfo.TAG === 'Subway') return metaLeg.legExtraInfo._0.categories ?? [];
    return [];
};
export const extractDriverNumber = (metaLeg: legInfo): string | undefined => {
    if (metaLeg.legExtraInfo.TAG === 'Taxi') return metaLeg.legExtraInfo._0.driverMobileNumber;
    return undefined;
};

export const extractExoNumber = (metaLeg: legInfo): string | undefined => {
    const exoNumber = metaLeg.legExtraInfo.TAG === 'Taxi' ? metaLeg.legExtraInfo._0.exoPhoneNumber : undefined;
    return exoNumber?.startsWith('0') ? exoNumber : `0${exoNumber}`;
};

export const extractFrequency = (metaLeg: legInfo | undefined, transitMode: TransitMode): number | undefined => {
    if (transitMode === 'METRO' && metaLeg && metaLeg?.legExtraInfo?.TAG === 'Metro')
        return metaLeg.legExtraInfo?._0?.routeInfo?.[0]?.frequency;
    if (transitMode === 'SUBWAY' && metaLeg && metaLeg?.legExtraInfo?.TAG === 'Subway')
        return metaLeg.legExtraInfo?._0?.routeInfo?.[0]?.frequency;
    return undefined;
};

export const extractLegStartTime = (metaLeg: legInfo): string | undefined => {
    const utcTime =
        metaLeg.legExtraInfo.TAG === 'Taxi'
            ? (metaLeg.legExtraInfo._0.rideStartTime ?? metaLeg.startTime)
            : metaLeg.startTime;

    if (!utcTime) return undefined;
    return utcTime;
};

export const extractRouteCode = (metaLeg: legInfo): string | undefined => {
    if (metaLeg.legExtraInfo.TAG === 'Bus' && metaLeg.legExtraInfo._0) return metaLeg.legExtraInfo._0.routeCode;
    if (
        (metaLeg.legExtraInfo.TAG === 'Metro' || metaLeg.legExtraInfo.TAG === 'Subway') &&
        metaLeg.legExtraInfo._0?.routeInfo?.[0]
    )
        return metaLeg.legExtraInfo._0.routeInfo[0].routeCode;
    return undefined;
};

export const parseExitGate = (
    exitGate: string | undefined,
): { gateNo: string | undefined; gateSide: string | undefined } => {
    if (!exitGate) return { gateNo: undefined, gateSide: undefined };
    const match = exitGate.match(/Gate (\w+) \((.*)\)/);
    return {
        gateNo: match?.[1],
        gateSide: match?.[2],
    };
};

const AVERAGE_SPEED_MPS = {
    WALK: 1.39,
    AUTO: 5.56,
    TAXI: 6.94,
    BIKE: 4.17,
    BUS: 5.56,
    METRO: 11.11,
    SUBWAY: 11.11,
};

const FUDGE_FACTOR = 1.4;

export const calculateTravelTime = (
    origin: LatLongType,
    destination: LatLongType,
    modes: { mode: TransitMode; changeoverPoint: LatLongType | undefined }[],
): { time: number; distance: number } => {
    // eslint-disable-next-line functional/no-let
    let totalTime = 0;
    // eslint-disable-next-line functional/no-let
    let totalDistance = 0;

    // Handle single mode case
    if (modes.length === 1) {
        const distance = calculateDistance(origin.lat, origin.lon, destination.lat, destination.lon);
        const speed = AVERAGE_SPEED_MPS[modes[0]?.mode ?? 'WALK'] || AVERAGE_SPEED_MPS.WALK;
        return { time: (distance * FUDGE_FACTOR) / speed, distance };
    }

    // Handle multiple modes with changeover points
    // eslint-disable-next-line functional/no-let
    let currentPoint = origin;
    // eslint-disable-next-line functional/no-let
    for (let i = 0; i < modes.length; i++) {
        const nextPoint = modes[i]?.changeoverPoint || destination;
        const distance = calculateDistance(currentPoint.lat, currentPoint.lon, nextPoint.lat, nextPoint.lon);
        const speed = AVERAGE_SPEED_MPS[modes[i]?.mode ?? 'WALK'] || AVERAGE_SPEED_MPS.WALK;

        totalTime += (distance * FUDGE_FACTOR) / speed;
        totalDistance += distance;

        currentPoint = nextPoint;
    }

    return { time: totalTime, distance: totalDistance };
};

const calculateArrivalAndRemainingStops = (
    stops: StopType,
    stopsInformation: StopsInformationItem[],
    vehicleLocation: LatLongType | undefined,
    originStopCode: string | undefined,
    vehicleId: string,
):
    | {
          eta: number;
          remainingStops: number;
          currentStopCode: string | undefined;
          vehicleId: string;
      }
    | undefined => {
    const originStopInformation = stopsInformation.find(s => s.stopCode === originStopCode);
    if (!originStopInformation) return undefined;
    const stopsBeforeOrigin = stopsInformation.filter(s => s.sequenceNumber <= originStopInformation.sequenceNumber);
    const currentStopInformation = stopsInformation
        .slice()
        .sort((a: StopsInformationItem, b: StopsInformationItem) => a.sequenceNumber - b.sequenceNumber)[0];
    const currentStop = stops.find(s => s.stopCode === currentStopInformation?.stopCode);
    if (!currentStop || !currentStop.lat || !currentStop.lon) return undefined;
    const originStop = stops.find(s => s.stopCode === originStopCode);
    if (!originStop || !originStop.lat || !originStop.lon) return undefined;

    if (currentStop.sequenceNum <= originStop.sequenceNum) {
        const eta = calculateTravelTime(
            vehicleLocation ?? { lat: currentStop.lat, lon: currentStop.lon },
            { lat: originStop.lat, lon: originStop.lon },
            [{ mode: 'BUS', changeoverPoint: undefined }],
        );
        return {
            eta: originStopInformation.eta > 0 ? originStopInformation.eta : round(eta.time / 60),
            remainingStops: stopsBeforeOrigin.length,
            currentStopCode: currentStop.stopCode,
            vehicleId,
        };
    }
    return undefined;
};

export const calculateEta = (
    staticLeg: { staticInfo: TrackedLegInfoStaticInfo; transitMode: TransitMode; durationInMinutes: number },
    liveVehicleData: LiveVehicleData[],
    riderLocation: LatLongType,
    modes: { mode: TransitMode; changeoverPoint: LatLongType | undefined }[],
) => {
    const { time: timeToReachOrigin } = calculateTravelTime(riderLocation, staticLeg.staticInfo.origin.latLong, modes);
    const liveArrivals =
        liveVehicleData
            .map(vp =>
                calculateArrivalAndRemainingStops(
                    staticLeg.staticInfo.stops,
                    vp.stopsInformation,
                    vp.loc,
                    staticLeg.staticInfo.origin.stopCode,
                    vp.id,
                ),
            )
            .sort((a, b) => (a?.eta ?? 0) - (b?.eta ?? 0))
            .filter(eta => eta !== undefined) ?? [];
    const catchableLiveArrivals = liveArrivals.filter(arrival => arrival.eta * 60 > timeToReachOrigin);
    const timetableArrivals =
        staticLeg.staticInfo.timetable?.map(t => {
            const now = new Date().getTime();
            return round((t.time - now) / 1000);
        }) ?? [];
    const catchableTimetableArrivals = timetableArrivals
        .filter(eta => eta >= timeToReachOrigin - 90)
        .map(etaInSeconds => {
            const eta = round(etaInSeconds / 60);
            const originStop = staticLeg.staticInfo.stops.find(
                s => s.stopCode === staticLeg.staticInfo.origin.stopCode,
            );
            if (eta < 20 && originStop && staticLeg.transitMode === 'METRO') {
                const stopsBeforeOrigin = Math.max(Math.floor(eta / 3), 0);
                const currentStopSeq = originStop.sequenceNum - stopsBeforeOrigin;
                const currentStop = staticLeg.staticInfo.stops.find(s => s.sequenceNum === currentStopSeq);

                if (currentStop) {
                    return {
                        eta: eta,
                        remainingStops: stopsBeforeOrigin,
                        currentStopCode: currentStop.stopCode,
                        vehicleId: 'timetable-vehicle',
                    };
                }
            }

            return {
                eta: eta,
                remainingStops: undefined,
                currentStopCode: undefined,
                vehicleId: 'timetable-vehicle',
            };
        });

    const upcomingVehicleArrivals =
        catchableLiveArrivals.length > 0 ? catchableLiveArrivals : catchableTimetableArrivals;

    const originStopETAInMinutes = upcomingVehicleArrivals[0]?.eta;
    const originStopRemainingStops = upcomingVehicleArrivals[0]?.remainingStops;
    const currentStop = staticLeg.staticInfo.stops.find(
        s => s.stopCode === upcomingVehicleArrivals[0]?.currentStopCode,
    );

    const destinationStopETAInMinutes =
        liveVehicleData
            .map(
                vp =>
                    vp.stopsInformation.find(s => s.stopCode === staticLeg.staticInfo.destination.stopCode)?.eta ?? -1,
            )
            .find(eta => eta !== -1) ?? staticLeg.durationInMinutes + (originStopETAInMinutes ?? 0);

    const currentLiveVehicle = liveVehicleData.find(vp => vp.id === upcomingVehicleArrivals[0]?.vehicleId);
    return {
        originStopETAInMinutes,
        destinationStopETAInMinutes,
        upcomingVehicleArrivals: upcomingVehicleArrivals,
        currentLiveVehicle,
        originStopRemainingStops,
        currentStop,
    };
};

export const isLocationAccuracyGood = (locationHistory: LocationWithTimestamp[]) => {
    // If no locations, consider it good
    if (!locationHistory.length) return true;

    // Get the most recent location update.
    const latestLocation = locationHistory[locationHistory.length - 1];
    if (!latestLocation) return true;

    const locationAgeInSeconds = (Date.now() - latestLocation.timestamp) / 1000;
    // If location was manually set, give it a longer grace period (e.g., 300 seconds / 5 minutes)
    if (latestLocation.isManual) {
        return locationAgeInSeconds < 300;
    }

    // A GPS location is "good" only if it is RECENT (e.g., < 30 seconds old) and has acceptable ACCURACY (e.g., <= 100 meters).
    const isRecent = locationAgeInSeconds < 30;
    const isAccurate = latestLocation.accuracy <= 100;

    return isRecent && isAccurate;
};

export const filterExtraStops = (stops: StopType, destinationStopCode: string | undefined) => {
    if (!destinationStopCode) return stops;
    const destinationStop = stops.find(s => s.stopCode === destinationStopCode);
    if (!destinationStop) return stops;
    return stops.filter(stop => stop.sequenceNum <= destinationStop.sequenceNum);
};

export const getOnRouteStops = (stops: StopType, originStopCode: string | undefined) => {
    if (!originStopCode) return stops;
    const originStop = stops.find(s => s.stopCode === originStopCode);
    if (!originStop) return stops;
    return stops.filter(stop => stop.sequenceNum >= originStop.sequenceNum);
};

export const createLegOrder = (leg: legInfo): string => {
    const subOrder =
        leg.legExtraInfo.TAG === 'Metro' || leg.legExtraInfo.TAG === 'Subway'
            ? leg.legExtraInfo._0.routeInfo?.[0]?.subOrder
            : undefined;
    if (!isUndefined(subOrder)) {
        return `${leg.order}-${subOrder}`;
    }
    return `${leg.order}`;
};

export const getSubOrder = (order: string): number | undefined => {
    const [_, subOrder] = order.split('-');
    return subOrder ? parseInt(subOrder) : undefined;
};

export const getOrder = (order: string): number => {
    const [orderNumber] = order.split('-');
    return orderNumber ? parseInt(orderNumber) : 0;
};

export const getNextLegOrder = (allLegs: ProcessedLegInfo[], currentLegOrder: string): ProcessedLegInfo | undefined => {
    const currentLegOrderNumber = getOrder(currentLegOrder);
    const currentLegSubOrder = getSubOrder(currentLegOrder);
    const possibleNextLegOrders_ = [`${currentLegOrderNumber + 1}`, `${currentLegOrderNumber + 1}-1`];
    const possibleNextLegOrders = currentLegSubOrder
        ? [...possibleNextLegOrders_, `${currentLegOrderNumber}-${currentLegSubOrder + 1}`]
        : possibleNextLegOrders_;
    return allLegs.find(leg => possibleNextLegOrders.includes(leg.staticInfo.legOrder));
};

export const getPreviousLegOrder = (
    allLegs: ProcessedLegInfo[],
    currentLegOrder: string,
): ProcessedLegInfo | undefined => {
    const sortedLegs = [...allLegs].sort((a, b) => {
        const orderA = getOrder(a.staticInfo.legOrder);
        const orderB = getOrder(b.staticInfo.legOrder);
        if (orderA !== orderB) {
            return orderA - orderB;
        }
        return (getSubOrder(a.staticInfo.legOrder) ?? 1) - (getSubOrder(b.staticInfo.legOrder) ?? 1);
    });

    const currentIndex = sortedLegs.findIndex(leg => leg.staticInfo.legOrder === currentLegOrder);
    if (currentIndex > 0) {
        return sortedLegs[currentIndex - 1];
    }
    return undefined;
};

export const getJourneyUserState = (currentLeg: ProcessedLegInfo): JourneyStatus => {
    if (currentLeg.userState === 'FARAWAY') return 'OFFTRACK';
    if (currentLeg.userState === 'NONE' && currentLeg.vehicleState !== 'RIDEREACHEDDESTINATION') return 'NOTMOVING';
    return 'LIVE';
};

export const isLegOrderGreaterThan = (a: string, b: string): boolean => {
    const orderA = getOrder(a);
    const orderB = getOrder(b);
    if (orderA === orderB) {
        return (getSubOrder(a) ?? 1) > (getSubOrder(b) ?? 1);
    }
    return orderA > orderB;
};

export const isLegOrderLessThan = (a: string, b: string): boolean => {
    const orderA = getOrder(a);
    const orderB = getOrder(b);
    if (orderA === orderB) {
        return (getSubOrder(a) ?? 1) < (getSubOrder(b) ?? 1);
    }
    return orderA < orderB;
};

export const splitConnectedLeg = (leg: legInfo): legInfo[] => {
    if (leg.legExtraInfo.TAG === 'Metro') {
        const metroOrSubwayLegExtraInfo = leg.legExtraInfo._0;
        if (metroOrSubwayLegExtraInfo.routeInfo) {
            const sortedRoutes = [...metroOrSubwayLegExtraInfo.routeInfo].sort((a, b) =>
                a.subOrder !== undefined && b.subOrder !== undefined ? a.subOrder - b.subOrder : 0,
            );
            return sortedRoutes.map(route => {
                return {
                    ...leg,
                    legExtraInfo:
                        leg.legExtraInfo.TAG === 'Metro'
                            ? {
                                  TAG: 'Metro',
                                  _0: {
                                      ...metroOrSubwayLegExtraInfo,
                                      routeInfo: [route],
                                  },
                              }
                            : leg.legExtraInfo,
                };
            });
        }
    }
    if (leg.legExtraInfo.TAG === 'Subway') {
        const metroOrSubwayLegExtraInfo = leg.legExtraInfo._0;
        if (metroOrSubwayLegExtraInfo.routeInfo) {
            const sortedRoutes = [...metroOrSubwayLegExtraInfo.routeInfo].sort((a, b) =>
                a.subOrder !== undefined && b.subOrder !== undefined ? a.subOrder - b.subOrder : 0,
            );
            return sortedRoutes.map(route => {
                return {
                    ...leg,
                    legExtraInfo:
                        leg.legExtraInfo.TAG === 'Subway'
                            ? {
                                  TAG: 'Subway',
                                  _0: {
                                      ...metroOrSubwayLegExtraInfo,
                                      routeInfo: [route],
                                  },
                              }
                            : leg.legExtraInfo,
                };
            });
        }
    }
    return [leg];
};

export const combineSplitLegs = (legs: legInfo[]): legInfo[] => {
    // Group legs by leg.order using reduce
    const legsByOrder = legs.reduce((acc: Record<number, legInfo[]>, leg) => {
        const order = leg.order;
        return {
            ...acc,
            [order]: [...(acc[order] || []), leg],
        };
    }, {});

    // Combine legs with the same order
    return Object.values(legsByOrder)
        .map(legsWithSameOrder => {
            if (legsWithSameOrder.length === 1) {
                return legsWithSameOrder[0];
            }

            const firstLeg = legsWithSameOrder[0];
            if (!firstLeg) return firstLeg;

            // Check if it's Metro or Subway leg
            if (
                firstLeg.legExtraInfo.TAG === 'Metro' ||
                firstLeg.legExtraInfo.TAG === 'Subway' ||
                firstLeg.legExtraInfo.TAG === 'Bus'
            ) {
                const legExtraInfo = firstLeg.legExtraInfo._0;

                // Type guard to ensure routeInfo exists
                if (!('routeInfo' in legExtraInfo) || !legExtraInfo.routeInfo) {
                    return firstLeg;
                }

                // Collect all routeInfo from legs with same order
                const allRouteInfo = legsWithSameOrder.reduce((acc: legRouteInfo[], leg: legInfo) => {
                    if (leg.legExtraInfo.TAG === firstLeg.legExtraInfo.TAG) {
                        const legExtraInfo = leg.legExtraInfo._0;
                        if ('routeInfo' in legExtraInfo && legExtraInfo.routeInfo) {
                            return [...acc, ...legExtraInfo.routeInfo];
                        }
                    }
                    return acc;
                }, []);

                // Sort by subOrder
                const sortedRouteInfo = [...allRouteInfo].sort((a, b) => {
                    if (a.subOrder !== undefined && b.subOrder !== undefined) {
                        return a.subOrder - b.subOrder;
                    }
                    return 0;
                });

                // Create combined leg
                return {
                    ...firstLeg,
                    legExtraInfo: {
                        TAG: firstLeg.legExtraInfo.TAG,
                        _0: {
                            ...legExtraInfo,
                            routeInfo: sortedRouteInfo,
                        },
                    },
                };
            }

            // For non-Metro/Subway legs, return the first one
            return firstLeg;
        })
        .filter((leg): leg is legInfo => leg !== undefined);
};

export const parseGatesInfo = (gatesInfo: string | undefined): GatesInfo[] | undefined => {
    if (!gatesInfo) return undefined;
    return safeJsonParse(gatesInfo, [], 'GatesInfo');
};

export const parseGeoJson = (geoJson: string | undefined): geoJsonGeometry | undefined => {
    if (!geoJson) return undefined;
    const parsedGeoJson = safeJsonParse(geoJson, { type: '', coordinates: [[[]]] }, 'geoJsonGeometry');
    if (!parsedGeoJson) return undefined;
    return {
        // Thanks to Piyush for sending the geojson in this fucked up format
        coordinates:
            parsedGeoJson.coordinates?.[0]?.[0]
                ?.map(c => ({
                    lat: c[1] ?? 0,
                    lon: c[0] ?? 0,
                }))
                .filter(c => c.lat !== 0 && c.lon !== 0) ?? [],
    };
};

export const calculateTravelTimeFromStops = (
    fromStopCode: string | undefined,
    toStopCode: string | undefined,
    allStops: StopType,
    isIdeintifyTrainCall: boolean,
): number | undefined => {
    if (!fromStopCode || !toStopCode) {
        return undefined;
    }
    const fromIndex = allStops.findIndex(s => s.stopCode === fromStopCode);
    const toIndex = allStops.findIndex(s => s.stopCode === toStopCode);

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
        return undefined;
    }

    const stopsInBetween = allStops.slice(fromIndex, isIdeintifyTrainCall ? toIndex + 1 : toIndex);
    return stopsInBetween.reduce((total, stop, index) => {
        return total + stop.timeFromPrev + (index === 0 ? 0 : STATION_DWELL_TIME);
    }, 0);
};

export const calculateFullJourneyTime = (allStops: StopType): number => {
    return allStops.slice(1).reduce((total, stop, index) => {
        return total + stop.timeFromPrev + (index === 0 ? 0 : STATION_DWELL_TIME);
    }, 0);
};

/**
 * Find the closest waypoint index to a given location
 */
export const findClosestWaypointIndex = (location: LatLongType, waypoints: LatLongType[]): number => {
    // eslint-disable-next-line functional/no-let
    let minDistance = Infinity;
    // eslint-disable-next-line functional/no-let
    let closestIndex = 0;

    waypoints.forEach((waypoint, index) => {
        const distance = calculateDistance(location.lat, location.lon, waypoint.lat, waypoint.lon);
        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index;
        }
    });

    return closestIndex;
};

/**
 * Calculate route-based distance and travel time using waypoints
 */
export const calculateRouteBasedDistanceAndTime = (
    startLocation: LatLongType,
    endLocation: LatLongType,
    waypoints: LatLongType[],
    transitMode: TransitMode = 'BUS',
): { time: number; distance: number } | null => {
    if (!waypoints || waypoints.length < 2) {
        return null;
    }

    try {
        const startIndex = findClosestWaypointIndex(startLocation, waypoints);
        const endIndex = findClosestWaypointIndex(endLocation, waypoints);

        if (startIndex === endIndex) {
            const directDistance = calculateDistance(
                startLocation.lat,
                startLocation.lon,
                endLocation.lat,
                endLocation.lon,
            );
            const speed = AVERAGE_SPEED_MPS[transitMode ?? 'WALK'];
            return {
                time: (directDistance * FUDGE_FACTOR) / speed,
                distance: directDistance,
            };
        }

        // eslint-disable-next-line functional/no-let
        let totalDistance = 0;
        const actualStartIndex = Math.min(startIndex, endIndex);
        const actualEndIndex = Math.max(startIndex, endIndex);

        // eslint-disable-next-line functional/no-let
        for (let i = actualStartIndex; i < actualEndIndex; i++) {
            const current = waypoints[i];
            const next = waypoints[i + 1];
            if (current && next) {
                totalDistance += calculateDistance(current.lat, current.lon, next.lat, next.lon);
            }
        }

        const speed = AVERAGE_SPEED_MPS[transitMode ?? 'WALK'];
        const timeInSeconds = (totalDistance * FUDGE_FACTOR) / speed;

        return { time: timeInSeconds, distance: totalDistance };
    } catch (error) {
        console.warn('Error calculating route-based distance:', error);
        return null;
    }
};

export const getUserLanguageStringsForMetroLine = (mode: string, userLanguageStrings: strings) => {
    if (mode.toLowerCase() === 'blue') {
        return userLanguageStrings.Blue;
    }
    if (mode.toLowerCase() === 'green') {
        return userLanguageStrings.Green;
    }
    if (mode.toLowerCase() === 'purple') {
        return userLanguageStrings.Purple;
    }
    return mode;
};
