// open PaymentOrderAPIEntity
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePaymentOrderAPIEntity } from '../../../readOnly/api/types/PaymentOrderAPIEntity.bs';
import { paymentOrderAPIEntity } from '../../../readOnly/api/types/PaymentOrderAPIEntity.gen';

export type paymentGetWithParams = {
    orderId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentGet: build.query<paymentOrderAPIEntity, paymentGetWithParams>({
                query: ({ orderId }) => ({
                    url: (function () {
                        const url = '/payment' + '?' + 'orderId=' + orderId + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePaymentOrderAPIEntity(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as paymentOrderAPIEntity;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
