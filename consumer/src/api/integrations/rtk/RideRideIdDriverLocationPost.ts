// open GetDriverLocResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetDriverLocResp } from '../../../readOnly/api/types/GetDriverLocResp.bs';
import { getDriverLocResp } from '../../../readOnly/api/types/GetDriverLocResp.gen';

export type rideRideIdDriverLocationPostWithParams = {
    rideId: string | null;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideRideIdDriverLocationPost: build.mutation<getDriverLocResp, rideRideIdDriverLocationPostWithParams>({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/ride' + '/' + rideId + '/' + 'driver/location' + '?';
                        return url;
                    })(),
                    keepUnusedDataFor: 0,
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetDriverLocResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getDriverLocResp;
                },
                ...rtkExtraOptions,
            }),
            rideRideIdDriverLocation: build.query<getDriverLocResp, rideRideIdDriverLocationPostWithParams>({
                query: ({ rideId }) => ({
                    url: '/ride' + '/' + rideId + '/' + 'driver/location' + '?',
                    method: 'POST',
                    keepUnusedDataFor: 0,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetDriverLocResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getDriverLocResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideRideIdDriverLocationPostMutation, useRideRideIdDriverLocationQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
