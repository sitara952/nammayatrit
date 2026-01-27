// open APISuccess
// open StopReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { stopReq } from '../../../readOnly/api/types/StopReq.gen';

export type rideBookingRideBookingIdAddStopPostWithParams = {
    rideBookingId: string | null;
    body: stopReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingRideBookingIdAddStopPost: build.mutation<
                aPISuccess,
                rideBookingRideBookingIdAddStopPostWithParams
            >({
                query: ({ rideBookingId, body }) => ({
                    url: (function () {
                        const url = '/rideBooking' + '/' + rideBookingId + '/' + 'addStop' + '?';
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

export const { useRideBookingRideBookingIdAddStopPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
