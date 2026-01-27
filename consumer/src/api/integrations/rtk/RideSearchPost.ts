// open SearchReq
// open SearchResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSearchResp } from '../../../readOnly/api/types/SearchResp.bs';
import { searchResp } from '../../../readOnly/api/types/SearchResp.gen';
import { searchReq } from '../../../readOnly/api/types/SearchReq.gen';

export type rideSearchPostWithParams = {
    body: searchReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideSearchPost: build.mutation<searchResp, rideSearchPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/rideSearch' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeSearchResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as searchResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideSearchPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
