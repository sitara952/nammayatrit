// open FRFSTicketBookingStatusAPIRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSTicketBookingStatusAPIRes } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIRes.bs';
import { fRFSTicketBookingStatusAPIRes } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIRes.gen';

export type frfsQuoteQuoteIdConfirmPostWithParams = {
    quoteId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsQuoteQuoteIdConfirmPost: build.mutation<
                fRFSTicketBookingStatusAPIRes,
                frfsQuoteQuoteIdConfirmPostWithParams
            >({
                query: ({ quoteId }) => ({
                    url: (function () {
                        const url = '/frfs/quote' + '/' + quoteId + '/' + 'confirm' + '?';
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

export const { useFrfsQuoteQuoteIdConfirmPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
