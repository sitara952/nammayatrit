// open EditLocationReq
// open EditLocationResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeEditLocationResp } from '../../../readOnly/api/types/EditLocationResp.bs.js';
import { editLocationResp } from '../../../readOnly/api/types/EditLocationResp.gen.tsx';
import { editLocationReq } from '../../../readOnly/api/types/EditLocationReq.gen.tsx';

export type rideRideIdEditLocationPostWithParams = {
    rideId: string;
    body: editLocationReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideRideIdEditLocationPost: build.mutation<editLocationResp, rideRideIdEditLocationPostWithParams>({
                query: ({ rideId, body }) => ({
                    url: (function () {
                        const url = '/ride' + '/' + rideId + '/' + 'edit/location' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeEditLocationResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as editLocationResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideRideIdEditLocationPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
