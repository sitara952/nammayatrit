// open ApplyCodeReq
// open ReferrerInfo
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeReferrerInfo } from '../../../readOnly/api/types/ReferrerInfo.bs';
import { referrerInfo } from '../../../readOnly/api/types/ReferrerInfo.gen';
import { applyCodeReq } from '../../../readOnly/api/types/ApplyCodeReq.gen';

export type personApplyReferralPostWithParams = {
    body: applyCodeReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            personApplyReferralPost: build.mutation<referrerInfo, personApplyReferralPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/person/applyReferral' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeReferrerInfo(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as referrerInfo;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePersonApplyReferralPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
