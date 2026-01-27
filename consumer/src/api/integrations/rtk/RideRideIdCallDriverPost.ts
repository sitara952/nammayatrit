// open CallRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCallRes } from '../../../readOnly/api/types/CallRes.bs';
import { callRes } from '../../../readOnly/api/types/CallRes.gen';

export type rideRideIdCallDriverPostWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideRideIdCallDriverPost: build.mutation<callRes, rideRideIdCallDriverPostWithParams>({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/ride' + '/' + rideId + '/' + 'call/driver' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCallRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as callRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideRideIdCallDriverPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
