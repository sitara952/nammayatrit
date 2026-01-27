// open BookingStatusAPIEntity
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeBookingStatusAPIEntity } from '../../../readOnly/api/types/BookingStatusAPIEntity.bs';
import { bookingStatusAPIEntity } from '../../../readOnly/api/types/BookingStatusAPIEntity.gen';

export type rideBookingV2RideBookingIdGetWithParams = {
    rideBookingId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingV2RideBookingIdGet: build.query<bookingStatusAPIEntity, rideBookingV2RideBookingIdGetWithParams>(
                {
                    query: ({ rideBookingId }) => ({
                        url: (function () {
                            const url = '/rideBooking/v2' + '/' + rideBookingId + '/' + '' + '?';
                            return url;
                        })(),
                        method: 'GET',
                    }),
                    transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                        const res = decodeBookingStatusAPIEntity(baseQueryReturnValue);
                        if (res.TAG === 'Error') {
                            throw new Error(res._0);
                        }
                        return res._0 as bookingStatusAPIEntity;
                    },
                    ...rtkExtraOptions,
                },
            ),
        }),
        overrideExisting: false,
    });

export const { useRideBookingV2RideBookingIdGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
