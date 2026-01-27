// open AckResponse
// open ExotelCallCallbackReq_CallAttachments
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAckResponse } from '../../../readOnly/api/types/AckResponse.bs';
import { ackResponse } from '../../../readOnly/api/types/AckResponse.gen';
import { exotelCallCallbackReq_CallAttachments } from '../../../readOnly/api/types/ExotelCallCallbackReq_CallAttachments.gen';

export type rideCallStatusCallbackPostWithParams = {
    body: exotelCallCallbackReq_CallAttachments;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideCallStatusCallbackPost: build.mutation<ackResponse, rideCallStatusCallbackPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/ride/call/statusCallback' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAckResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ackResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideCallStatusCallbackPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
