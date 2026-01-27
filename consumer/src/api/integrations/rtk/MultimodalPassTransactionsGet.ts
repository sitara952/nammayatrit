// open PurchasedPassTransactionAPIEntityArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePurchasedPassTransactionAPIEntityArray } from '@/readOnly/api/types/PurchasedPassTransactionAPIEntityArray.bs';
import { purchasedPassTransactionAPIEntityArray } from '@/readOnly/api/types/PurchasedPassTransactionAPIEntityArray.gen';

export type multimodalPassTransactionsGetWithParams = {
    limit: number | undefined;
    offset: number | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalPassTransactionsGet: build.query<
                purchasedPassTransactionAPIEntityArray,
                multimodalPassTransactionsGetWithParams
            >({
                query: ({ limit, offset }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/multimodal/pass/transactions' + '?';
                        url += limit ? 'limit=' + limit + '&' : '';
                        url += offset ? 'offset=' + offset + '&' : '';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePurchasedPassTransactionAPIEntityArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as purchasedPassTransactionAPIEntityArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalPassTransactionsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
