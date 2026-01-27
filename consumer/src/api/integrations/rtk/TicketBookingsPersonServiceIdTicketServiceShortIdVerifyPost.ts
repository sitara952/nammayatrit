// open TicketServiceVerificationResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTicketServiceVerificationResp } from '../../../readOnly/api/types/TicketServiceVerificationResp.bs';
import { ticketServiceVerificationResp } from '../../../readOnly/api/types/TicketServiceVerificationResp.gen';

export type ticketBookingsPersonServiceIdTicketServiceShortIdVerifyPostWithParams = {
    personServiceId: string;
    ticketServiceShortId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketBookingsPersonServiceIdTicketServiceShortIdVerifyPost: build.mutation<
                ticketServiceVerificationResp,
                ticketBookingsPersonServiceIdTicketServiceShortIdVerifyPostWithParams
            >({
                query: ({ personServiceId, ticketServiceShortId }) => ({
                    url: (function () {
                        const url =
                            '/ticket/bookings' +
                            '/' +
                            personServiceId +
                            '/' +
                            '' +
                            '/' +
                            ticketServiceShortId +
                            '/' +
                            'verify' +
                            '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketServiceVerificationResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketServiceVerificationResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketBookingsPersonServiceIdTicketServiceShortIdVerifyPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
