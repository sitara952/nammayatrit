// open CancellationDuesDetailsRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCancellationDuesDetailsRes } from '../../../readOnly/api/types/CancellationDuesDetailsRes.bs';
import { cancellationDuesDetailsRes } from '../../../readOnly/api/types/CancellationDuesDetailsRes.gen';

export type rideBookingCancellationDuesGetWithParams = {
    rideBookingId: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingCancellationDuesGet: build.query<
                cancellationDuesDetailsRes,
                rideBookingCancellationDuesGetWithParams
            >({
                query: ({ rideBookingId }) => ({
                    url: (function () {
                        const url =
                            '/rideBooking/cancellationDues' +
                            '?' +
                            (rideBookingId ? 'rideBookingId=' + rideBookingId + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCancellationDuesDetailsRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as cancellationDuesDetailsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideBookingCancellationDuesGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
