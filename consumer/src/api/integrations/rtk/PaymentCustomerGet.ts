// open CreateCustomerResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCreateCustomerResp } from '../../../readOnly/api/types/CreateCustomerResp.bs';
import { createCustomerResp } from '../../../readOnly/api/types/CreateCustomerResp.gen';

export type paymentCustomerGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentCustomerGet: build.query<createCustomerResp, paymentCustomerGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/payment/customer' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCreateCustomerResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as createCustomerResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentCustomerGetQuery, useLazyPaymentCustomerGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
