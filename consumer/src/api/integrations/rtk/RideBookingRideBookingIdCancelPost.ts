// open APISuccess
// open CancelReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { cancelReq } from '../../../readOnly/api/types/CancelReq.gen';

export type rideBookingRideBookingIdCancelPostWithParams = {
    rideBookingId: string;
    body: cancelReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingRideBookingIdCancelPost: build.mutation<
                aPISuccess,
                rideBookingRideBookingIdCancelPostWithParams
            >({
                query: ({ rideBookingId, body }) => ({
                    url: (function () {
                        const url = '/rideBooking' + '/' + rideBookingId + '/' + 'cancel' + '?';
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

export const { useRideBookingRideBookingIdCancelPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
