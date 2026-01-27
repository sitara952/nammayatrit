// open Enums
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { TicketBookingStatus } from '../../../readOnly/api/types/Enums.bs';
import { TicketBookingStatus_ticketBookingStatus } from '../../../readOnly/api/types/Enums.gen';

export type ticketBookingsTicketBookingShortIdStatusGetWithParams = {
    ticketBookingShortId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketBookingsTicketBookingShortIdStatusGet: build.mutation<
                TicketBookingStatus_ticketBookingStatus,
                ticketBookingsTicketBookingShortIdStatusGetWithParams
            >({
                query: ({ ticketBookingShortId }) => ({
                    url: (function () {
                        const url = '/ticket/bookings' + '/' + ticketBookingShortId + '/' + 'status' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = TicketBookingStatus.decodeTicketBookingStatus(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as TicketBookingStatus_ticketBookingStatus;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketBookingsTicketBookingShortIdStatusGetMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
