import { BusEtaInfo } from '../screens/BusTrackingScreen/Types';
import { LatLng } from 'react-native-maps';
import { trackingResp } from '@/readOnly/api/types/TrackingResp.gen';
import type { FRFSServiceTierType_fRFSServiceTierType as Enums_FRFSServiceTierType_fRFSServiceTierType } from '@/readOnly/api/types/Enums.gen';

// Enhanced BusEtaInfo to include coordinates
export interface EnhancedBusEtaInfo extends BusEtaInfo {
    coordinates?: LatLng;
}

// Type for track vehicles data
/**
 * Processes bus tracking data and returns sorted bus ETA information with coordinates
 * @param trackVehiclesData - The vehicle tracking data from API
 * @param sourceStopName - Name of the source stop to filter buses for
 * @returns Array of buses sorted by ETA with coordinates included
 */
export const getBusesEtaInfo = (
    trackVehiclesData: trackingResp | undefined,
    sourceStopName: string | undefined,
): EnhancedBusEtaInfo[] | undefined => {
    if (!trackVehiclesData?.vehicleTrackingInfo || !sourceStopName) return undefined;

    const nowMs = Date.now();

    // Find all buses that have the sourceStop in their upcomingStops
    const candidateBuses = trackVehiclesData.vehicleTrackingInfo
        .map(vehicle => {
            // Find the sourceStop in this vehicle's upcomingStops
            const sourceStopInUpcoming = vehicle.upcomingStops?.find(
                stop =>
                    stop?.stopName === sourceStopName &&
                    stop?.estimatedTravelTime &&
                    typeof stop.estimatedTravelTime === 'string',
            );

            if (!sourceStopInUpcoming || !sourceStopInUpcoming.estimatedTravelTime) return undefined;

            const etaDate = new Date(sourceStopInUpcoming.estimatedTravelTime);

            const deviceTimezoneOffsetMs = new Date().getTimezoneOffset() * 60 * 1000;

            const adjustedEtaMs = etaDate.getTime() + deviceTimezoneOffsetMs;

            const etaSeconds = Math.max(0, Math.round((adjustedEtaMs - nowMs) / 1000));

            if (etaSeconds <= 0) return undefined;

            // Include coordinates directly in the result
            const coordinates: LatLng | undefined =
                vehicle.vehicleInfo.latitude && vehicle.vehicleInfo.longitude
                    ? {
                          latitude: Number(vehicle.vehicleInfo.latitude),
                          longitude: Number(vehicle.vehicleInfo.longitude),
                      }
                    : undefined;

            const busEtaInfo: EnhancedBusEtaInfo = {
                vehicleId: vehicle.vehicleId,
                stopName: vehicle.nextStop?.stopName || '',
                etaSeconds: etaSeconds,
                estimatedTravelTime: sourceStopInUpcoming.estimatedTravelTime,
                coordinates,
            };

            return busEtaInfo;
        })
        .filter((v): v is EnhancedBusEtaInfo => v !== undefined && v.etaSeconds > 0);
    const sorted = [...candidateBuses].sort((a, b) => a.etaSeconds - b.etaSeconds);
    return sorted;
};

export const getBusVariantonServiceTier = (
    serviceTierType: Enums_FRFSServiceTierType_fRFSServiceTierType | undefined,
) => {
    switch (serviceTierType) {
        case 'EXECUTIVE':
            return 'DeluxeBus';
        case 'AC':
            return 'AcBus';
        case 'EXPRESS':
            return 'ExpressBus';
        case 'ORDINARY':
            return 'OrdinaryBus';
        default:
            return 'Bus';
    }
};

export const getBusVariantonServiceTierCaption = (
    serviceTierType: Enums_FRFSServiceTierType_fRFSServiceTierType | undefined,
    routeShortName: string | undefined,
    vehicleId: string,
): string => {
    switch (serviceTierType) {
        case 'EXECUTIVE':
            return routeShortName ? routeShortName.toUpperCase() + '| DLX' : vehicleId + '| DLX';
        case 'AC':
            return routeShortName ? routeShortName.toUpperCase() + '| AC' : vehicleId + '| AC';
        case 'EXPRESS':
            return routeShortName ? routeShortName.toUpperCase() + '| EXP' : vehicleId + '| EXP';
        case 'ORDINARY':
            return routeShortName ? routeShortName.toUpperCase() + '| ORD' : vehicleId + '| ORD';
        default:
            return routeShortName ? routeShortName.toUpperCase() : vehicleId;
    }
};

/**
 * Gets the coordinates of the nearest bus from the sorted bus ETA info
 * @param allBusesEtaInfo - Array of buses sorted by ETA (nearest first)
 * @returns Coordinates of the nearest bus, or undefined if no buses or no coordinates
 */
export const getNearestBusCoordinates = (allBusesEtaInfo: EnhancedBusEtaInfo[]): LatLng | undefined => {
    const nearestBus = allBusesEtaInfo[0];
    return nearestBus?.coordinates;
};

/**
 * Normalizes a stop name for comparison by converting to lowercase and removing special characters
 * @param stopName - The stop name to normalize
 * @returns Normalized stop name
 */
export const normalizeStopName = (stopName: string): string => {
    return stopName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
};

/**
 * Formats a timestamp to a 12-hour time format (e.g., "2:30pm")
 * @param timestamp - ISO timestamp string or Date object
 * @returns Formatted time string or undefined if invalid
 */
export const formatToDisplayTime = (timestamp: string | Date): string | undefined => {
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) return undefined;

        const hours = date.getUTCHours();
        const minutes = date.getUTCMinutes();
        const ampm = hours >= 12 ? 'pm' : 'am';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');

        return `${displayHours}:${displayMinutes}${ampm}`;
    } catch {
        return undefined;
    }
};

/**
 * Finds the destination time for a specific bus and target stop
 * @param trackVehiclesData - Vehicle tracking data from API
 * @param selectedBusVehicleId - ID of the selected bus
 * @param targetStopName - Name of the target stop
 * @returns Formatted destination time string or undefined
 */
export const getBusDestinationTime = (
    trackVehiclesData: trackingResp | undefined,
    selectedBusVehicleId: string | undefined,
    targetStopName: string | undefined,
): string | undefined => {
    if (!trackVehiclesData?.vehicleTrackingInfo || !selectedBusVehicleId || !targetStopName) {
        return undefined;
    }

    const selectedBus = trackVehiclesData.vehicleTrackingInfo.find(bus => bus.vehicleId === selectedBusVehicleId);

    if (!selectedBus?.upcomingStops) return undefined;

    const targetNameNormalized = normalizeStopName(targetStopName);
    const nowMs = Date.now();

    const matchedStop = selectedBus.upcomingStops.find(stop => {
        if (!stop?.stopName || typeof stop.estimatedTravelTime !== 'string') return false;

        const normalizedStopName = normalizeStopName(stop.stopName);
        const eta = new Date(stop.estimatedTravelTime).getTime();

        return normalizedStopName === targetNameNormalized && !isNaN(eta) && eta > nowMs;
    });

    if (!matchedStop?.estimatedTravelTime) return undefined;

    return formatToDisplayTime(matchedStop.estimatedTravelTime);
};
