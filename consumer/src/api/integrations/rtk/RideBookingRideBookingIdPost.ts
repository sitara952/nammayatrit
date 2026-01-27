// open BookingAPIEntity
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeBookingAPIEntity } from '../../../readOnly/api/types/BookingAPIEntity.bs';
import { bookingAPIEntity } from '../../../readOnly/api/types/BookingAPIEntity.gen';

export type rideBookingRideBookingIdPostWithParams = {
    rideBookingId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingRideBookingIdPost: build.mutation<bookingAPIEntity, rideBookingRideBookingIdPostWithParams>({
                query: ({ rideBookingId }) => ({
                    url: (function () {
                        const url = '/rideBooking' + '/' + rideBookingId + '/' + '' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeBookingAPIEntity(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as bookingAPIEntity;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideBookingRideBookingIdPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
