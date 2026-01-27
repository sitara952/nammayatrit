// open UpsertPersonAndQuoteConfirmReq
// open UpsertPersonAndQuoteConfirmRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeUpsertPersonAndQuoteConfirmRes } from '@/readOnly/api/types/UpsertPersonAndQuoteConfirmRes.bs';
import { upsertPersonAndQuoteConfirmRes } from '@/readOnly/api/types/UpsertPersonAndQuoteConfirmRes.gen';
import { upsertPersonAndQuoteConfirmReq } from '@/readOnly/api/types/UpsertPersonAndQuoteConfirmReq.gen';

export type frfsPartnerOrganizationUpsertPersonAndQuoteConfirmPostWithParams = {
    body: upsertPersonAndQuoteConfirmReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsPartnerOrganizationUpsertPersonAndQuoteConfirmPost: build.mutation<
                upsertPersonAndQuoteConfirmRes,
                frfsPartnerOrganizationUpsertPersonAndQuoteConfirmPostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/frfs/partnerOrganization/upsertPersonAndQuoteConfirm' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeUpsertPersonAndQuoteConfirmRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as upsertPersonAndQuoteConfirmRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsPartnerOrganizationUpsertPersonAndQuoteConfirmPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
