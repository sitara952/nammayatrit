// open GetQuotesRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetQuotesRes } from '../../../readOnly/api/types/GetQuotesRes.bs';
import { getQuotesRes } from '../../../readOnly/api/types/GetQuotesRes.gen';

export type rideSearchSearchIdResultsGetWithParams = {
    searchId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideSearchSearchIdResultsGet: build.query<getQuotesRes, rideSearchSearchIdResultsGetWithParams>({
                query: ({ searchId }) => ({
                    url: (function () {
                        const url = '/rideSearch' + '/' + searchId + '/' + 'results' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetQuotesRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getQuotesRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideSearchSearchIdResultsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
