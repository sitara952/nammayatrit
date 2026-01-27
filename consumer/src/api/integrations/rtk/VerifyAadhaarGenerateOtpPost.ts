// open AadhaarOtpReq
// open AadhaarVerificationResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAadhaarVerificationResp } from '../../../readOnly/api/types/AadhaarVerificationResp.bs';
import { aadhaarVerificationResp } from '../../../readOnly/api/types/AadhaarVerificationResp.gen';
import { aadhaarOtpReq } from '../../../readOnly/api/types/AadhaarOtpReq.gen';

export type verifyAadhaarGenerateOtpPostWithParams = {
    body: aadhaarOtpReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            verifyAadhaarGenerateOtpPost: build.mutation<
                aadhaarVerificationResp,
                verifyAadhaarGenerateOtpPostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/verifyAadhaar/generateOtp' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAadhaarVerificationResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as aadhaarVerificationResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useVerifyAadhaarGenerateOtpPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
