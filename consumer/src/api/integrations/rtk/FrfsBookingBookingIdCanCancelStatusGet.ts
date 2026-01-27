// open FRFSCanCancelStatus
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSCanCancelStatus } from '../../../readOnly/api/types/FRFSCanCancelStatus.bs';
import { fRFSCanCancelStatus } from '../../../readOnly/api/types/FRFSCanCancelStatus.gen';
import { BookingId } from '@/typescript/state/client/user';

export type frfsBookingBookingIdCanCancelStatusGetWithParams = {
    bookingId: BookingId;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsBookingBookingIdCanCancelStatusGet: build.query<
                fRFSCanCancelStatus,
                frfsBookingBookingIdCanCancelStatusGetWithParams
            >({
                query: ({ bookingId }) => ({
                    url: (function () {
                        const url = '/frfs/booking' + '/' + bookingId + '/' + 'canCancel/status' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSCanCancelStatus(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSCanCancelStatus;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsBookingBookingIdCanCancelStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
