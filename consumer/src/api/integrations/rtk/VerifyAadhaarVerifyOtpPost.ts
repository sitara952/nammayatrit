// open AadhaarOtpVerifyRes
// open VerifyAadhaarOtpReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAadhaarOtpVerifyRes } from '../../../readOnly/api/types/AadhaarOtpVerifyRes.bs';
import { aadhaarOtpVerifyRes } from '../../../readOnly/api/types/AadhaarOtpVerifyRes.gen';
import { verifyAadhaarOtpReq } from '../../../readOnly/api/types/VerifyAadhaarOtpReq.gen';

export type verifyAadhaarVerifyOtpPostWithParams = {
    body: verifyAadhaarOtpReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            verifyAadhaarVerifyOtpPost: build.mutation<aadhaarOtpVerifyRes, verifyAadhaarVerifyOtpPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/verifyAadhaar/verifyOtp' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAadhaarOtpVerifyRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as aadhaarOtpVerifyRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useVerifyAadhaarVerifyOtpPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
