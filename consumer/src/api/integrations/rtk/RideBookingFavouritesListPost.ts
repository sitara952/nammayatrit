// open DriverNo
// open Enums
// open FavouriteBookingListRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { RideBookingFavouritesListStatus_rideBookingFavouritesListStatus } from '../../../readOnly/api/types/Enums.gen';
import { decodeFavouriteBookingListRes } from '../../../readOnly/api/types/FavouriteBookingListRes.bs';
import { favouriteBookingListRes } from '../../../readOnly/api/types/FavouriteBookingListRes.gen';
import { driverNo } from '../../../readOnly/api/types/DriverNo.gen';

export type rideBookingFavouritesListPostWithParams = {
    limit: number | undefined;
    offset: number | undefined;
    onlyActive: boolean | undefined;
    status: RideBookingFavouritesListStatus_rideBookingFavouritesListStatus | undefined;
    clientId: string | undefined;
    body: driverNo;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingFavouritesListPost: build.mutation<
                favouriteBookingListRes,
                rideBookingFavouritesListPostWithParams
            >({
                query: ({ limit, offset, onlyActive, status, clientId, body }) => ({
                    url: (function () {
                        const url =
                            '/rideBooking/favourites/list' +
                            '?' +
                            (limit ? 'limit=' + limit + '&' : '') +
                            (offset ? 'offset=' + offset + '&' : '') +
                            (onlyActive ? 'onlyActive=' + onlyActive + '&' : '') +
                            (status ? 'status=' + status + '&' : '') +
                            (clientId ? 'clientId=' + clientId + '&' : '');
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFavouriteBookingListRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as favouriteBookingListRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideBookingFavouritesListPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
