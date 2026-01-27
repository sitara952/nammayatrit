// open CreateOrderResp
// open TicketBookingReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCreateOrderResp } from '../../../readOnly/api/types/CreateOrderResp.bs';
import { createOrderResp } from '../../../readOnly/api/types/CreateOrderResp.gen';
import { ticketBookingReq } from '../../../readOnly/api/types/TicketBookingReq.gen';

export type ticketPlacesPlaceIdBookPostWithParams = {
    placeId: string;
    body: ticketBookingReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketPlacesPlaceIdBookPost: build.mutation<createOrderResp, ticketPlacesPlaceIdBookPostWithParams>({
                query: ({ placeId, body }) => ({
                    url: (function () {
                        const url = '/ticket/places' + '/' + placeId + '/' + 'book' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCreateOrderResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as createOrderResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketPlacesPlaceIdBookPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
