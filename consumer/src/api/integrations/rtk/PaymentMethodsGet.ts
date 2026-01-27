// open PaymentMethodsResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePaymentMethodsResponse } from '../../../readOnly/api/types/PaymentMethodsResponse.bs';
import { paymentMethodsResponse } from '../../../readOnly/api/types/PaymentMethodsResponse.gen';

export type paymentMethodsGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentMethodsGet: build.query<paymentMethodsResponse, paymentMethodsGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/payment/methods' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePaymentMethodsResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as paymentMethodsResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentMethodsGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
