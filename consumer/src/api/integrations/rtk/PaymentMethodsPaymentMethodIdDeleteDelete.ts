// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type paymentMethodsPaymentMethodIdDeleteDeleteWithParams = {
    paymentMethodId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentMethodsPaymentMethodIdDeleteDelete: build.mutation<
                aPISuccess,
                paymentMethodsPaymentMethodIdDeleteDeleteWithParams
            >({
                query: ({ paymentMethodId }) => ({
                    url: (function () {
                        const url = '/payment/methods' + '/' + paymentMethodId + '/' + 'delete' + '?';
                        return url;
                    })(),
                    method: 'DELETE',
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

export const { usePaymentMethodsPaymentMethodIdDeleteDeleteMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
