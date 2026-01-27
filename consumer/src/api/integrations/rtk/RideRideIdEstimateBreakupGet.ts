// open EstimateDetailsRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeEstimateDetailsRes } from '../../../readOnly/api/types/EstimateDetailsRes.bs';
import { estimateDetailsRes } from '../../../readOnly/api/types/EstimateDetailsRes.gen';

export type rideRideIdEstimateBreakupGetWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideRideIdEstimateBreakupGet: build.query<estimateDetailsRes, rideRideIdEstimateBreakupGetWithParams>({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/ride' + '/' + rideId + '/' + 'estimateBreakup' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeEstimateDetailsRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as estimateDetailsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideRideIdEstimateBreakupGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
