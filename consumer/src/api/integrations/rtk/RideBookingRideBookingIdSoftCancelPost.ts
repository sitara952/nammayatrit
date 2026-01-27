// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type rideBookingRideBookingIdSoftCancelPostWithParams = {
    rideBookingId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingRideBookingIdSoftCancelPost: build.mutation<
                aPISuccess,
                rideBookingRideBookingIdSoftCancelPostWithParams
            >({
                query: ({ rideBookingId }) => ({
                    url: (function () {
                        const url = '/rideBooking' + '/' + rideBookingId + '/' + 'softCancel' + '?';
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

export const { useRideBookingRideBookingIdSoftCancelPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
