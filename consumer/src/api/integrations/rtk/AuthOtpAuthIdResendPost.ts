// open AuthRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAuthRes } from '../../../readOnly/api/types/AuthRes.bs';
import { authRes } from '../../../readOnly/api/types/AuthRes.gen';

export type authOtpAuthIdResendPostWithParams = {
    authId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authOtpAuthIdResendPost: build.mutation<authRes, authOtpAuthIdResendPostWithParams>({
                query: ({ authId }) => ({
                    url: (function () {
                        const url = '/auth/otp' + '/' + authId + '/' + 'resend' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { useAuthOtpAuthIdResendPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
