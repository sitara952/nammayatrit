import { encodeGeoHash } from '@/src-v2/helpers/location/utils/GeoHash';
import { api } from '@/typescript/state/api';
import { globalCache } from '@/src-v2/systems/cache/cache';
import { setNearbyDrivers, emptyNearbyDriversRes, selectNearbyDrivers } from '@/typescript/state/client/maps';
import { selectNearbyDriversConfig } from '@/typescript/state/client/session';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { latLong as LatLong_latLong } from '@/readOnly/api/types/LatLong.gen';
import type {
    VehicleVariant_vehicleVariant,
    MultimodalTravelMode_multimodalTravelMode,
} from '@/readOnly/api/types/Enums.gen';

import type { publicTransportBucket as PublicTransportBucket_publicTransportBucket } from '@/readOnly/api/types/PublicTransportBucket.gen.ts';
import type { nearByDriversBucket as NearByDriversBucket_nearByDriversBucket } from '@/readOnly/api/types/NearByDriversBucket.gen.ts';
import { RootState } from '../store';

export type driverInfo = {
    readonly applicableServiceTierTypes: ServiceTierType_serviceTierType[];
    readonly bearing: number | undefined;
    readonly distance: number;
    readonly driverId: string;
    readonly lat: number;
    readonly lon: number;
};

export type nearByDriversBucket = {
    readonly driverInfo: driverInfo[];
    readonly radius: number;
    readonly variant: VehicleVariant_vehicleVariant;
};

export type PublicTransportVehicleLocation = {
    readonly lat: number;
    readonly lon: number;
};

export type PublicTransportVehicle = {
    readonly bearing: number | null;
    readonly currentLocation: PublicTransportVehicleLocation;
    readonly distance: number;
    readonly routeCode: string;
    readonly routeState: string;
    readonly shortName: string;
    readonly vehicleNumber: string;
};

export type vehicleDataBucket = {
    readonly radius: number;
    readonly travelMode: MultimodalTravelMode_multimodalTravelMode;
    readonly vehicleInfo: nearbyVehicleInfo;
};

export type nearbyVehicleInfo =
    | { tag: 'PublicTransport'; contents: PublicTransportBucket_publicTransportBucket }
    | { tag: 'Taxi'; contents: NearByDriversBucket_nearByDriversBucket };

export type nearbyDriverRes = {
    readonly buckets: nearByDriversBucket[];
    readonly serviceTierTypeToVehicleVariant: Record<string, string>;
    readonly variantLevelDriverCount: Record<string, number>;
    readonly vehicleDataBuckets: vehicleDataBucket[];
};

export type nearbyDriverReq = {
    readonly location: LatLong_latLong;
    readonly radius: number;
    readonly travelMode: MultimodalTravelMode_multimodalTravelMode | undefined;
    readonly vehicleVariants: VehicleVariant_vehicleVariant[] | undefined;
};

export type nearbyDriversPostWithParams = {
    body: nearbyDriverReq;
    skipCache: boolean;
};

export const nearbyDriversApi = api.injectEndpoints({
    endpoints: build => ({
        getNearbyDrivers: build.mutation({
            queryFn: async ({ body, skipCache = false }, { dispatch, getState }, _extraOptions, fetchWithBQ) => {
                if (body.location.lat === undefined || body.location.lon === undefined) {
                    return {
                        data: emptyNearbyDriversRes,
                    };
                }
                const geohash = encodeGeoHash(body.location.lat, body.location.lon, 7);

                const cachedDrivers: nearbyDriverRes | undefined = globalCache.get(geohash);

                if (cachedDrivers && !skipCache) {
                    //eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    const state = getState() as RootState;
                    const nearbyDrivers = selectNearbyDrivers(state, 'MapBeforeRide');
                    if (nearbyDrivers.geohash !== geohash) {
                        dispatch(
                            setNearbyDrivers({
                                id: 'MapBeforeRide',
                                geohash: geohash,
                                nearbyDrivers: cachedDrivers,
                            }),
                        );
                    }
                    return { data: cachedDrivers };
                }

                try {
                    console.info('Fetching nearby drivers from API for', geohash);
                    const result = await fetchWithBQ({
                        url: '/nearbyDrivers',
                        method: 'POST',
                        body: body,
                    });

                    //eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    const nearbyDrivers = result.data as nearbyDriverRes | undefined;

                    const config = selectNearbyDriversConfig();

                    if (nearbyDrivers) {
                        globalCache.set(geohash, nearbyDrivers, config.refreshInterval ?? 30000);

                        dispatch(
                            setNearbyDrivers({
                                id: 'MapBeforeRide',
                                geohash: geohash,
                                nearbyDrivers: nearbyDrivers,
                            }),
                        );
                    }

                    return { data: nearbyDrivers || emptyNearbyDriversRes };
                } catch (error) {
                    console.error('Error fetching nearby drivers:', error);
                    return {
                        error: {
                            status: 'CUSTOM_ERROR',
                            error: error instanceof Error ? error.message : String(error),
                        },
                    };
                }
            },
        }),
    }),
    overrideExisting: true,
});

export const { useGetNearbyDriversMutation } = nearbyDriversApi;
