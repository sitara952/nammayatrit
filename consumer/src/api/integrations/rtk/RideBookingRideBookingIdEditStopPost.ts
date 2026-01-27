// open APISuccess
// open StopReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { stopReq } from '../../../readOnly/api/types/StopReq.gen';

export type rideBookingRideBookingIdEditStopPostWithParams = {
    rideBookingId: string;
    body: stopReq;
};

export const apiCall = (_rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingRideBookingIdEditStopPost: build.mutation({
                query: ({ rideBookingId, body }: { rideBookingId: string; body: stopReq }) => ({
                    url: '/rideBooking' + '/' + rideBookingId + '/' + 'editStop',
                    method: 'POST',
                    body: body,
                }),
                onCacheEntryAdded: undefined,
                onQueryStarted: undefined,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideBookingRideBookingIdEditStopPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
