// open FareCacheReq
// open FareCacheResp

import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFareCacheResp } from '@/readOnly/api/types/FareCacheResp.bs';
import { fareCacheResp } from '@/readOnly/api/types/FareCacheResp.gen';
import { fareCacheReq } from '@/readOnly/api/types/FareCacheReq.gen';

export type fetchFareCachePostWithParams = {
    body: fareCacheReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            fetchFareCachePost: build.mutation<fareCacheResp, fetchFareCachePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/fetchFareCache' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFareCacheResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fareCacheResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFetchFareCachePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
