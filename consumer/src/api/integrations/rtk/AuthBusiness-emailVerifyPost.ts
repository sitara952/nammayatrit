// open VerifyBusinessEmailReq
// open VerifyBusinessEmailRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeVerifyBusinessEmailRes } from '@/readOnly/api/types/VerifyBusinessEmailRes.bs';
import { verifyBusinessEmailRes } from '@/readOnly/api/types/VerifyBusinessEmailRes.gen';
import { verifyBusinessEmailReq } from '@/readOnly/api/types/VerifyBusinessEmailReq.gen';

export type authBusinessemailVerifyPostWithParams = {
    body: verifyBusinessEmailReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authBusinessemailVerifyPost: build.mutation<verifyBusinessEmailRes, authBusinessemailVerifyPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/auth/business-email/verify' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeVerifyBusinessEmailRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as verifyBusinessEmailRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useAuthBusinessemailVerifyPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: 0 });
//
