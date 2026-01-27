import { useContext, useRef } from 'react';
import { haversineDistance } from '@/helpers/utils/Utils.gen'; // km
import { MapContext } from '@/typescript/Maps/MapContext';
import { useGetNearbyDriversMutation } from '@/typescript/state/server/nearbyDriversApi';
import { setNearbyMarkerLocation } from '@/typescript/state/client/maps';
import { selectNearbyDriversConfig } from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import type { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';

const MIN_MOVE_METRES = 3; // ignore GPS jitter < 3 m

type UseNearbyDriversOptions = {
    travelMode: MultimodalTravelMode_multimodalTravelMode | undefined;
};

export const useNearbyDrivers = (options: UseNearbyDriversOptions = { travelMode: undefined }) => {
    const { mapRef } = useContext(MapContext);
    const mapId = mapRef.current?.mapId ?? 'MapBeforeRide';

    const dispatch = useAppDispatch();
    const [getNearbyDrivers] = useGetNearbyDriversMutation();
    const cfg = useAppSelector(selectNearbyDriversConfig);

    const lastPos = useRef<{ lat: number; lon: number } | null>(null);
    const callNo = useRef(0);

    const getDrivers = async (lat: number, lon: number) => {
        callNo.current += 1;
        const thisCall = callNo.current;

        // Skip if movement < 3 m
        if (lastPos.current) {
            const metres = haversineDistance(lastPos.current.lat, lastPos.current.lon, lat, lon) * 1000;
            if (metres < MIN_MOVE_METRES) {
                return;
            }
        }

        dispatch(setNearbyMarkerLocation({ id: mapId, payload: { lat, lon } }));
        lastPos.current = { lat, lon };
        return getNearbyDrivers({
            body: {
                location: { lat, lon },
                radius: cfg.radius,
                travelMode: options.travelMode,
                vehicleVariants: undefined,
            },
        }).then(
            () => {},
            err => {
                console.error(`[DebugNearByDrivers] fetch failed (#${thisCall})`, err);
            },
        );
    };

    return { getDrivers };
};
