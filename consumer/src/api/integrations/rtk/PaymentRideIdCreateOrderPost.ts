// open CreateOrderResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCreateOrderResp } from '../../../readOnly/api/types/CreateOrderResp.bs';
import { createOrderResp } from '../../../readOnly/api/types/CreateOrderResp.gen';

export type paymentRideIdCreateOrderPostWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentRideIdCreateOrderPost: build.mutation<createOrderResp, paymentRideIdCreateOrderPostWithParams>({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/payment' + '/' + rideId + '/' + 'createOrder' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { usePaymentRideIdCreateOrderPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
