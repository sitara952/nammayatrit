// open FRFSTicketBookingStatusAPIRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSTicketBookingStatusAPIRes } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIRes.bs';
import { fRFSTicketBookingStatusAPIRes } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIRes.gen';
import { BookingId } from '@/typescript/state/client/user';

export type frfsBookingBookingIdStatusGetWithParams = {
    bookingId: BookingId;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsBookingBookingIdStatusGet: build.query<
                fRFSTicketBookingStatusAPIRes,
                frfsBookingBookingIdStatusGetWithParams
            >({
                query: ({ bookingId }) => ({
                    url: (function () {
                        const url = '/frfs/booking' + '/' + bookingId + '/' + 'status' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSTicketBookingStatusAPIRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSTicketBookingStatusAPIRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsBookingBookingIdStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
