// open GetRideStatusResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetRideStatusResp } from '../../../readOnly/api/types/GetRideStatusResp.bs';
import { getRideStatusResp } from '../../../readOnly/api/types/GetRideStatusResp.gen';

export type rideRideIdStatusGetWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideRideIdStatusGet: build.query<getRideStatusResp, rideRideIdStatusGetWithParams>({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/ride' + '/' + rideId + '/' + 'status' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetRideStatusResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getRideStatusResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideRideIdStatusGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
