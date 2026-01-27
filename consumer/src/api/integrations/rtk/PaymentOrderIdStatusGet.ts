// open PaymentStatusResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePaymentStatusResp } from '../../../readOnly/api/types/PaymentStatusResp.bs';
import { paymentStatusResp } from '../../../readOnly/api/types/PaymentStatusResp.gen';

export type paymentOrderIdStatusGetWithParams = {
    orderId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentOrderIdStatusGet: build.query<paymentStatusResp, paymentOrderIdStatusGetWithParams>({
                query: ({ orderId }) => ({
                    url: (function () {
                        const url = '/payment' + '/' + orderId + '/' + 'status' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePaymentStatusResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as paymentStatusResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentOrderIdStatusGetQuery, useLazyPaymentOrderIdStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
