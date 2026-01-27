import { api } from './../api';
import { decodeBookingStatusAPIEntity } from '../../../readOnly/api/types/BookingStatusAPIEntity.bs';
import { decodeBookingAPIEntity } from '../../../readOnly/api/types/BookingAPIEntity.bs';
import { bookingAPIEntity } from '../../../readOnly/api/types/BookingAPIEntity.gen';
import { setBookingAndRideDetails } from '../sharedReducer';

export const searchApi = api.injectEndpoints({
    endpoints: build => ({
        getBookingStatus: build.query({
            query: bookingId => {
                return {
                    url: `/rideBooking/v2/${bookingId}`,
                    keepUnusedDataFor: 0,
                };
            },
            transformResponse(baseQueryReturnValue, _meta, _arg) {
                return decodeBookingStatusAPIEntity(baseQueryReturnValue);
            },
            merge: undefined,
            forceRefetch: undefined,
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        getBookingStatusById: build.mutation({
            query: bookingId => {
                return {
                    url: `/rideBooking/v2/${bookingId}`,
                };
            },
            transformResponse(baseQueryReturnValue, _meta, _arg) {
                return decodeBookingStatusAPIEntity(baseQueryReturnValue);
            },
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        getBookingDetails: build.mutation({
            query: bookingId => {
                return {
                    url: `/rideBooking/${bookingId}`,
                    method: 'POST',
                };
            },
            transformResponse(baseQueryReturnValue, _meta, _arg) {
                return decodeBookingAPIEntity(baseQueryReturnValue);
            },
            onQueryStarted: async (_bookingId, { queryFulfilled, dispatch }) => {
                const { data } = await queryFulfilled;
                const bookingDetails = data._0 as bookingAPIEntity;
                setBookingAndRideDetails(bookingDetails, dispatch);
            },
            onCacheEntryAdded: undefined,
        }),
        cancelBooking: build.mutation({
            query: req => ({
                url: `/rideBooking/${req.bookingId}/cancel`,
                method: 'POST',
                body: req.data,
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetBookingStatusQuery,
    useGetBookingStatusByIdMutation,
    useGetBookingDetailsMutation,
    useCancelBookingMutation,
} = searchApi;
