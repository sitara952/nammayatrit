/* eslint-disable functional/no-let */

import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeVpaResp } from '@/readOnly/api/types/VpaResp.bs';
import { vpaResp } from '@/readOnly/api/types/VpaResp.gen';

export type referralVerifyVpaGetWithParams = {
    vpa: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            referralVerifyVpaGet: build.query<vpaResp, referralVerifyVpaGetWithParams>({
                query: ({ vpa }) => ({
                    url: (function () {
                        let url = '/referral/verifyVpa' + '?';
                        url += 'vpa=' + vpa + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeVpaResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as vpaResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useReferralVerifyVpaGetQuery, useLazyReferralVerifyVpaGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
