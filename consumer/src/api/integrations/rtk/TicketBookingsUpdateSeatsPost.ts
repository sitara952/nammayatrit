// open APISuccess
// open TicketBookingUpdateSeatsReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { ticketBookingUpdateSeatsReq } from '../../../readOnly/api/types/TicketBookingUpdateSeatsReq.gen';

export type ticketBookingsUpdateSeatsPostWithParams = {
    body: ticketBookingUpdateSeatsReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketBookingsUpdateSeatsPost: build.mutation<aPISuccess, ticketBookingsUpdateSeatsPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/ticket/bookings/update/seats' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
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

export const { useTicketBookingsUpdateSeatsPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
