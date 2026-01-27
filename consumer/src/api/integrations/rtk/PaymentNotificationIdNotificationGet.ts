// open CreateOrderResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCreateOrderResp } from '../../../readOnly/api/types/CreateOrderResp.bs';
import { createOrderResp } from '../../../readOnly/api/types/CreateOrderResp.gen';

export type paymentNotificationIdNotificationGetWithParams = {
    notificationId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentNotificationIdNotificationGet: build.query<
                createOrderResp,
                paymentNotificationIdNotificationGetWithParams
            >({
                query: ({ notificationId }) => ({
                    url: (function () {
                        const url = '/payment' + '/' + notificationId + '/' + 'notification' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCreateOrderResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as createOrderResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentNotificationIdNotificationGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
