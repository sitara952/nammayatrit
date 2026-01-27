import React, { useEffect } from 'react';
import { latLong } from '@/readOnly/api/types/LatLong.gen.tsx';
import { pickupRoutePostWithParams, usePickupRoutePostMutation } from '@/api/integrations/rtk/PickupRoutePost';
import { rideIdDriverLocationType } from '@/api/apiTypes/DriverLocation.gen';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import {
    rideRideIdDriverLocationPostWithParams,
    useRideRideIdDriverLocationPostMutation,
} from '@/api/integrations/rtk/RideRideIdDriverLocationPost';
import { getDriverLocResp } from '@/readOnly/api/types/GetDriverLocResp.gen';
import { RideId } from '@/typescript/state/client/booking';

export const startPolling = (interval: number, fn: () => void): (() => void) => {
    fn();
    const intervalId = setInterval(() => fn(), interval);
    return () => {
        clearInterval(intervalId);
    };
};

export const useObserve = (dependencies: React.DependencyList, fn: () => void): void => {
    useEffect(fn, dependencies);
};

export const useFetchDriverLoc = () => {
    const [getDriverLoc] = useRideRideIdDriverLocationPostMutation();
    return async (rideId: RideId): Promise<getDriverLocResp> => {
        const reqBody: rideRideIdDriverLocationPostWithParams = {
            rideId,
        };
        const payload = await getDriverLoc(reqBody).unwrap();
        return payload;
    };
};

export const useFetchRoute = () => {
    const [pickupRoutePost] = usePickupRoutePostMutation();
    const result = async (
        currDriverLocation: rideIdDriverLocationType | null,
        source: FormatedLocation | null,
        destination: FormatedLocation | undefined,
        stops: FormatedLocation[],
        rideDetails: rideAPIEntity | null,
        driverPrevRideDest: latLong | undefined,
        rideId: RideId | null,
    ) => {
        if (currDriverLocation != null && source != null) {
            const rSource = {
                lat: source.lat,
                lng: source.lng,
            };
            const rDest = {
                lat: destination?.lat,
                lng: destination?.lng,
            };
            const driverLoc = {
                lat: currDriverLocation.lat,
                lng: currDriverLocation.lon,
            };
            const [initialDriverDest, initialMiddleStops] =
                rideDetails?.status === 'NEW'
                    ? [rSource, []]
                    : [rDest, stops.slice(0, -1).map(stop => ({ lat: stop.lat, lon: stop.lng }))];
            const finalMiddleStops = driverPrevRideDest
                ? [driverPrevRideDest, ...initialMiddleStops]
                : initialMiddleStops;
            if (driverLoc.lat && driverLoc.lng && initialDriverDest.lat && initialDriverDest.lng) {
                const source = { lat: driverLoc.lat, lon: driverLoc.lng };
                const dest = { lat: initialDriverDest.lat, lon: initialDriverDest.lng };
                const reqBody: pickupRoutePostWithParams = {
                    body: {
                        calcPoints: true,
                        mode: 'CAR',
                        waypoints: [source, ...finalMiddleStops, dest],
                        rideId: rideId ?? undefined,
                    },
                };
                const payload = await pickupRoutePost(reqBody).unwrap();
                return payload.at(0);
            } else {
                console.error(
                    'ERROR getRouteAPI: Missing driverLoc or driverDestination',
                    driverLoc,
                    initialDriverDest,
                );
            }
        } else {
            console.error(
                'ERROR fetchRoute: one of currDriverLocation, source, destination is null or undefined',
                currDriverLocation,
                source,
                destination,
            );
        }
        return undefined;
    };
    return result;
};
