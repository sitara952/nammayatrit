// open FRFSQuoteConfirmReq
// open FRFSTicketBookingStatusAPIRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSTicketBookingStatusAPIRes } from '@/readOnly/api/types/FRFSTicketBookingStatusAPIRes.bs';
import { fRFSTicketBookingStatusAPIRes } from '@/readOnly/api/types/FRFSTicketBookingStatusAPIRes.gen';
import { fRFSQuoteConfirmReq } from '@/readOnly/api/types/FRFSQuoteConfirmReq.gen';

export type frfsQuoteV2QuoteIdConfirmPostWithParams = {
    quoteId: string;
    body: fRFSQuoteConfirmReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsQuoteV2QuoteIdConfirmPost: build.mutation<
                fRFSTicketBookingStatusAPIRes,
                frfsQuoteV2QuoteIdConfirmPostWithParams
            >({
                query: ({ quoteId, body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/frfs/quote/v2' + '/' + quoteId + '/' + 'confirm' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSTicketBookingStatusAPIRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSTicketBookingStatusAPIRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsQuoteV2QuoteIdConfirmPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
