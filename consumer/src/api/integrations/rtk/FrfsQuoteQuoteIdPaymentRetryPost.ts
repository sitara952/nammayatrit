// open FRFSTicketBookingStatusAPIRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSTicketBookingStatusAPIRes } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIRes.bs';
import { fRFSTicketBookingStatusAPIRes } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIRes.gen';

export type frfsQuoteQuoteIdPaymentRetryPostWithParams = {
    quoteId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsQuoteQuoteIdPaymentRetryPost: build.mutation<
                fRFSTicketBookingStatusAPIRes,
                frfsQuoteQuoteIdPaymentRetryPostWithParams
            >({
                query: ({ quoteId }) => ({
                    url: (function () {
                        const url = '/frfs/quote' + '/' + quoteId + '/' + 'payment/retry' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { useFrfsQuoteQuoteIdPaymentRetryPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
