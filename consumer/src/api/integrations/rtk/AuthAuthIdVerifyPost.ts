// open AuthVerifyReq
// open AuthVerifyRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAuthVerifyRes } from '../../../readOnly/api/types/AuthVerifyRes.bs';
import { authVerifyRes } from '../../../readOnly/api/types/AuthVerifyRes.gen';
import { authVerifyReq } from '../../../readOnly/api/types/AuthVerifyReq.gen';

export type authAuthIdVerifyPostWithParams = {
    authId: string;
    body: authVerifyReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authAuthIdVerifyPost: build.mutation<authVerifyRes, authAuthIdVerifyPostWithParams>({
                query: ({ authId, body }) => ({
                    url: (function () {
                        const url = '/auth' + '/' + authId + '/' + 'verify' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAuthVerifyRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as authVerifyRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useAuthAuthIdVerifyPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
