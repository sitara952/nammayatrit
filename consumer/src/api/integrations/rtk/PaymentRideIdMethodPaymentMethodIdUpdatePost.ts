// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type paymentRideIdMethodPaymentMethodIdUpdatePostWithParams = {
    rideId: string;
    paymentMethodId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentRideIdMethodPaymentMethodIdUpdatePost: build.mutation<
                aPISuccess,
                paymentRideIdMethodPaymentMethodIdUpdatePostWithParams
            >({
                query: ({ rideId, paymentMethodId }) => ({
                    url: (function () {
                        const url =
                            '/payment' + '/' + rideId + '/' + 'method' + '/' + paymentMethodId + '/' + 'update' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentRideIdMethodPaymentMethodIdUpdatePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
