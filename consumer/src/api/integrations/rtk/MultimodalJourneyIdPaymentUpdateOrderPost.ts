// open UpdatePaymentOrderReq
// open UpdatePaymentOrderResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeUpdatePaymentOrderResp } from '@/readOnly/api/types/UpdatePaymentOrderResp.bs';
import { updatePaymentOrderResp } from '@/readOnly/api/types/UpdatePaymentOrderResp.gen';
import { updatePaymentOrderReq } from '@/readOnly/api/types/UpdatePaymentOrderReq.gen';

export type multimodalJourneyIdPaymentUpdateOrderPostWithParams = {
    journeyId: string;
    body: updatePaymentOrderReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdPaymentUpdateOrderPost: build.mutation<
                updatePaymentOrderResp,
                multimodalJourneyIdPaymentUpdateOrderPostWithParams
            >({
                query: ({ journeyId, body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal' + '/' + journeyId + '/' + 'payment/updateOrder' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeUpdatePaymentOrderResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as updatePaymentOrderResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdPaymentUpdateOrderPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
