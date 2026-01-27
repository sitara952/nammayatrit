// open BookingListRes
// open Enums
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { RideBookingListStatus_rideBookingListStatus } from '../../../readOnly/api/types/Enums.gen';
import { decodeBookingListRes } from '../../../readOnly/api/types/BookingListRes.bs';
import { bookingListRes } from '../../../readOnly/api/types/BookingListRes.gen';

export type rideBookingListGetWithParams = {
    limit: number | undefined;
    offset: number | undefined;
    onlyActive: boolean | undefined;
    status: RideBookingListStatus_rideBookingListStatus | undefined;
    clientId: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingListGet: build.query<bookingListRes, rideBookingListGetWithParams>({
                query: ({ limit, offset, onlyActive, status, clientId }) => ({
                    url: (function () {
                        const url =
                            '/rideBooking/list' +
                            '?' +
                            (limit ? `limit=${limit}&` : '') +
                            (offset ? `offset=${offset}&` : '') +
                            (onlyActive ? `onlyActive=${onlyActive}&` : '') +
                            (status ? 'status=' + encodeURIComponent(JSON.stringify(status)) + '&' : '') +
                            (clientId ? `clientId=${clientId}&` : '');
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: unknown) {
                    const res = decodeBookingListRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as bookingListRes;
                },
                providesTags: result =>
                    result
                        ? result.list.map(({ id }) => ({ type: 'RideBookingList', id }))
                        : [{ type: 'RideBookingList', id: 'LIST' }],

                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideBookingListGetQuery, useLazyRideBookingListGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});

/**
 * Custom hook to safely use useAppSelector with onQueryStarted
 */
export const useRideBookingListGetLazyQueryWithAppName = () => {
    const [trigger, result] = useLazyRideBookingListGetQuery();
    const wrappedTrigger = async (params: rideBookingListGetWithParams) => {
        try {
            const response = await trigger(params).unwrap();
            return response;
        } catch (error) {
            console.error('RideBookingList API failed: ', error);
            throw error;
        }
    };

    return [wrappedTrigger, result] as const;
};
