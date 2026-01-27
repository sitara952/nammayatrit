// open APISuccess
// open AddTipRequest
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs.js';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen.tsx';
import { addTipRequest } from '../../../readOnly/api/types/AddTipRequest.gen.tsx';

export type paymentRideIdAddTipPostWithParams = {
    rideId: string;
    body: addTipRequest;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentRideIdAddTipPost: build.mutation<aPISuccess, paymentRideIdAddTipPostWithParams>({
                query: ({ rideId, body }) => ({
                    url: (function () {
                        const url = '/payment' + '/' + rideId + '/' + 'addTip' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
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

export const { usePaymentRideIdAddTipPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
