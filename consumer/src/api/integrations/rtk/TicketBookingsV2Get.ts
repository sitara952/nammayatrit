// open Enums
// open TicketBookingAPIEntityV2Array
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { TicketBookingsV2Status } from '@/readOnly/api/types/Enums.bs';
import { TicketBookingsV2Status_ticketBookingsV2Status } from '@/readOnly/api/types/Enums.gen';
import { decodeTicketBookingAPIEntityV2Array } from '@/readOnly/api/types/TicketBookingAPIEntityV2Array.bs';
import { ticketBookingAPIEntityV2Array } from '@/readOnly/api/types/TicketBookingAPIEntityV2Array.gen';

export type ticketBookingsV2GetWithParams = {
    limit: number | undefined;
    offset: number | undefined;
    status: TicketBookingsV2Status_ticketBookingsV2Status | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketBookingsV2Get: build.query<ticketBookingAPIEntityV2Array, ticketBookingsV2GetWithParams>({
                query: ({ limit, offset, status }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/ticket/bookings/v2' + '?';
                        url += limit ? 'limit=' + limit + '&' : '';
                        url += offset ? 'offset=' + offset + '&' : '';
                        url += status
                            ? 'status=' +
                              JSON.stringify(TicketBookingsV2Status.ticketBookingsV2StatusToString(status)) +
                              '&'
                            : '';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketBookingAPIEntityV2Array(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketBookingAPIEntityV2Array;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketBookingsV2GetQuery, useLazyTicketBookingsV2GetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
