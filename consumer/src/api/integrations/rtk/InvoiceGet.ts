// open InvoiceResArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeInvoiceResArray } from '../../../readOnly/api/types/InvoiceResArray.bs';
import { invoiceResArray } from '../../../readOnly/api/types/InvoiceResArray.gen';

export type invoiceGetWithParams = {
    from: string;
    to: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            invoiceGet: build.query<invoiceResArray, invoiceGetWithParams>({
                query: ({ from, to }) => ({
                    url: (function () {
                        const url = '/invoice' + '?' + 'from=' + from + '&' + 'to=' + to + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeInvoiceResArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as invoiceResArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useInvoiceGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
