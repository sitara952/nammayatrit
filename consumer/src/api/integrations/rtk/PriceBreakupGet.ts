// open QuoteBreakupRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeQuoteBreakupRes } from '../../../readOnly/api/types/QuoteBreakupRes.bs';
import { quoteBreakupRes } from '../../../readOnly/api/types/QuoteBreakupRes.gen';
import { BookingId } from '@/typescript/state/client/user';

export type priceBreakupGetWithParams = {
    bookingId: BookingId;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            priceBreakupGet: build.query<quoteBreakupRes, priceBreakupGetWithParams>({
                query: ({ bookingId }) => ({
                    url: (function () {
                        const url = '/priceBreakup' + '?' + 'bookingId=' + bookingId + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeQuoteBreakupRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as quoteBreakupRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePriceBreakupGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
