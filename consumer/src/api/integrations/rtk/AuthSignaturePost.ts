// open AuthRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAuthRes } from '../../../readOnly/api/types/AuthRes.bs';
import { authRes } from '../../../readOnly/api/types/AuthRes.gen';

export type authSignaturePostWithParams = string;

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authSignaturePost: build.mutation<authRes, authSignaturePostWithParams>({
                query: body => ({
                    url: (function () {
                        const url = '/auth/signature';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue, _meta, _arg) {
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

export const { useAuthSignaturePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
