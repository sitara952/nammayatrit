// open TicketBookingDetails
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTicketBookingDetails } from '../../../readOnly/api/types/TicketBookingDetails.bs';
import { ticketBookingDetails } from '../../../readOnly/api/types/TicketBookingDetails.gen';

export type ticketBookingsTicketBookingShortIdDetailsGetWithParams = {
    ticketBookingShortId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketBookingsTicketBookingShortIdDetailsGet: build.mutation<
                ticketBookingDetails,
                ticketBookingsTicketBookingShortIdDetailsGetWithParams
            >({
                query: ({ ticketBookingShortId }) => ({
                    url: (function () {
                        const url = '/ticket/bookings' + '/' + ticketBookingShortId + '/' + 'details' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketBookingDetails(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketBookingDetails;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketBookingsTicketBookingShortIdDetailsGetMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
