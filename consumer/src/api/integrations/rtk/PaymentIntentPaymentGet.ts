// open PaymentIntentResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePaymentIntentResponse } from '../../../readOnly/api/types/PaymentIntentResponse.bs';
import { paymentIntentResponse } from '../../../readOnly/api/types/PaymentIntentResponse.gen';

export type paymentIntentPaymentGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentIntentPaymentGet: build.query<paymentIntentResponse, paymentIntentPaymentGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/payment/intent/payment' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePaymentIntentResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as paymentIntentResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentIntentPaymentGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
