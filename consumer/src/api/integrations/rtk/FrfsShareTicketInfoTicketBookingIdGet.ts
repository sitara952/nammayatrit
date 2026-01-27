// open ShareTicketInfoResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeShareTicketInfoResp } from '../../../readOnly/api/types/ShareTicketInfoResp.bs';
import { shareTicketInfoResp } from '../../../readOnly/api/types/ShareTicketInfoResp.gen';

export type frfsShareTicketInfoTicketBookingIdGetWithParams = {
    ticketBookingId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsShareTicketInfoTicketBookingIdGet: build.query<
                shareTicketInfoResp,
                frfsShareTicketInfoTicketBookingIdGetWithParams
            >({
                query: ({ ticketBookingId }) => ({
                    url: (function () {
                        const url = '/frfs/shareTicketInfo' + '/' + ticketBookingId + '/' + '' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeShareTicketInfoResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as shareTicketInfoResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsShareTicketInfoTicketBookingIdGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
