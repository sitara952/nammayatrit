// open ConfirmRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeConfirmRes } from '../../../readOnly/api/types/ConfirmRes.bs';
import { confirmRes } from '../../../readOnly/api/types/ConfirmRes.gen';

export type rideSearchQuotesQuoteIdConfirmPostWithParams = {
    quoteId: string;
    paymentMethodId: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideSearchQuotesQuoteIdConfirmPost: build.mutation<
                confirmRes,
                rideSearchQuotesQuoteIdConfirmPostWithParams
            >({
                query: ({ quoteId, paymentMethodId }) => ({
                    url: (function () {
                        const url =
                            '/rideSearch/quotes' +
                            '/' +
                            quoteId +
                            '/' +
                            'confirm' +
                            '?' +
                            (paymentMethodId ? 'paymentMethodId=' + paymentMethodId + '&' : '');
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeConfirmRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as confirmRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideSearchQuotesQuoteIdConfirmPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
