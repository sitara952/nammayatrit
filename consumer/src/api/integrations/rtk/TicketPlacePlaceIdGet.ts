// open TicketPlaceResp
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTicketPlaceResp } from '@/readOnly/api/types/TicketPlaceResp.bs';
import { ticketPlaceResp } from '@/readOnly/api/types/TicketPlaceResp.gen';

export type ticketPlacePlaceIdGetWithParams = {
    placeId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketPlacePlaceIdGet: build.query<ticketPlaceResp, ticketPlacePlaceIdGetWithParams>({
                query: ({ placeId }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/ticket/place' + '/' + placeId + '/' + '' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketPlaceResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketPlaceResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketPlacePlaceIdGetQuery, useLazyTicketPlacePlaceIdGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
