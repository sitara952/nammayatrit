// open GetFareReq
// open GetFareResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetFareResp } from '../../../readOnly/api/types/GetFareResp.bs';
import { getFareResp } from '../../../readOnly/api/types/GetFareResp.gen';
import { getFareReq } from '../../../readOnly/api/types/GetFareReq.gen';

export type frfsPartnerOrganizationUpsertPersonAndGetFarePostWithParams = {
    body: getFareReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsPartnerOrganizationUpsertPersonAndGetFarePost: build.mutation<
                getFareResp,
                frfsPartnerOrganizationUpsertPersonAndGetFarePostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/frfs/partnerOrganization/upsertPersonAndGetFare' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetFareResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getFareResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsPartnerOrganizationUpsertPersonAndGetFarePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
