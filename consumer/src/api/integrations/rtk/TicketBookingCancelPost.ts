// open APISuccess
// open TicketBookingCancelReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { ticketBookingCancelReq } from '../../../readOnly/api/types/TicketBookingCancelReq.gen';

export type ticketBookingCancelPostWithParams = {
    body: ticketBookingCancelReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketBookingCancelPost: build.mutation<aPISuccess, ticketBookingCancelPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/ticket/booking/cancel' + '?';
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

export const { useTicketBookingCancelPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
