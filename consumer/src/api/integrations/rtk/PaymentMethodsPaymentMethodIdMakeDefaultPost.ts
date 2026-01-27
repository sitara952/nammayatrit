// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type paymentMethodsPaymentMethodIdMakeDefaultPostWithParams = {
    paymentMethodId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentMethodsPaymentMethodIdMakeDefaultPost: build.mutation<
                aPISuccess,
                paymentMethodsPaymentMethodIdMakeDefaultPostWithParams
            >({
                query: ({ paymentMethodId }) => ({
                    url: (function () {
                        const url = '/payment/methods' + '/' + paymentMethodId + '/' + 'makeDefault' + '?';
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

export const { usePaymentMethodsPaymentMethodIdMakeDefaultPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
