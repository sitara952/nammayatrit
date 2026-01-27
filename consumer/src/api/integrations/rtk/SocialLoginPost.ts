// open SocialLoginReq
// open SocialLoginRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSocialLoginRes } from '../../../readOnly/api/types/SocialLoginRes.bs';
import { socialLoginRes } from '../../../readOnly/api/types/SocialLoginRes.gen';
import { socialLoginReq } from '../../../readOnly/api/types/SocialLoginReq.gen';

export type socialLoginPostWithParams = {
    body: socialLoginReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            socialLoginPost: build.mutation<socialLoginRes, socialLoginPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/social/login' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeSocialLoginRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as socialLoginRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useSocialLoginPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
