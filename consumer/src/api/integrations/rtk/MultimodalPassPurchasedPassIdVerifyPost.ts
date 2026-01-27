// open APISuccess
// open PassVerifyReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { passVerifyReq } from '@/readOnly/api/types/PassVerifyReq.gen';

export type multimodalPassPurchasedPassIdVerifyPostWithParams = {
    purchasedPassId: string;
    body: passVerifyReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalPassPurchasedPassIdVerifyPost: build.mutation<
                aPISuccess,
                multimodalPassPurchasedPassIdVerifyPostWithParams
            >({
                query: ({ purchasedPassId, body }) => ({
                    url: '/multimodal/pass' + '/' + purchasedPassId + '/' + 'verify',
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalPassPurchasedPassIdVerifyPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
