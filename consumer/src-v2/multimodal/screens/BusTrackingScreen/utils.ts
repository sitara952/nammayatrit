import { trackingResp } from '@/readOnly/api/types/TrackingResp.gen';
import { upcomingStop } from '@/readOnly/api/types/UpcomingStop.gen';
import { vehicleTrackingInfo } from '@/readOnly/api/types/VehicleTrackingInfo.gen';

export const formatEta = (minutes: number | undefined): string | undefined => {
    if (minutes === undefined || minutes === 0) return undefined;
    if (minutes < 60) return `${minutes} min`;

    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
};

export const getEtaColor = (minutes: number | undefined): string => {
    if (minutes === undefined) return '#656565';
    return minutes < 15 ? '#097B42' : '#FF7301';
};

export type ArrivingVehicle = {
    vehicleId: string;
    routeCode: string;
    etaMinutes: number | undefined;
    stopSeq: number;
};

/* eslint-disable functional/immutable-data, @typescript-eslint/no-non-null-assertion */
export const buildStopToVehiclesMap = (trackingData: trackingResp): Map<string, ArrivingVehicle[]> => {
    const stopToVehicles = new Map<string, ArrivingVehicle[]>();
    trackingData.vehicleTrackingInfo.forEach((vehicle: vehicleTrackingInfo) => {
        vehicle.upcomingStops.forEach((stop: upcomingStop) => {
            const etaMinutes = stop.estimatedTravelTime
                ? Math.max(0, Math.round((new Date(stop.estimatedTravelTime).getTime() - Date.now()) / 60000))
                : undefined;

            const arrivingVehicle: ArrivingVehicle = {
                vehicleId: vehicle.vehicleId,
                routeCode: vehicle.routeCode,
                etaMinutes,
                stopSeq: stop.stopSeq,
            };

            if (!stopToVehicles.has(stop.stopCode)) {
                stopToVehicles.set(stop.stopCode, [arrivingVehicle]);
            } else {
                stopToVehicles.get(stop.stopCode)!.push(arrivingVehicle);
            }
        });
    });

    return stopToVehicles;
};
/* eslint-enable functional/immutable-data, @typescript-eslint/no-non-null-assertion */
