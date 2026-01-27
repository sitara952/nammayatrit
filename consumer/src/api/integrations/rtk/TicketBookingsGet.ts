// open Enums
// open TicketBookingAPIEntityArray
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { TicketBookingsStatus_ticketBookingsStatus } from '../../../readOnly/api/types/Enums.gen';
import { decodeTicketBookingAPIEntityArray } from '../../../readOnly/api/types/TicketBookingAPIEntityArray.bs';
import { ticketBookingAPIEntityArray } from '../../../readOnly/api/types/TicketBookingAPIEntityArray.gen';

export type ticketBookingsGetWithParams = {
    limit: number | undefined;
    offset: number | undefined;
    status: TicketBookingsStatus_ticketBookingsStatus;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketBookingsGet: build.query<ticketBookingAPIEntityArray, ticketBookingsGetWithParams>({
                query: ({ limit, offset, status }) => ({
                    url: (function () {
                        const url =
                            '/ticket/bookings' +
                            '?' +
                            (limit ? 'limit=' + limit + '&' : '') +
                            (offset ? 'offset=' + offset + '&' : '') +
                            'status=' +
                            '"' +
                            status +
                            '"' +
                            '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketBookingAPIEntityArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketBookingAPIEntityArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketBookingsGetQuery, useLazyTicketBookingsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
