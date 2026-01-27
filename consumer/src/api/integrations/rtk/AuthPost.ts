// open AuthReq
// open AuthRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAuthRes } from '../../../readOnly/api/types/AuthRes.bs';
import { authRes } from '../../../readOnly/api/types/AuthRes.gen';
import { authReq } from '../../../readOnly/api/types/AuthReq.gen';

export type authPostWithParams = {
    body: authReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authPost: build.mutation<authRes, authPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/auth' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAuthRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as authRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useAuthPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
