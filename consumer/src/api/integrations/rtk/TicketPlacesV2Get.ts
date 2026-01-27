// open TicketPlaceRespArray
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTicketPlaceRespArray } from '@/readOnly/api/types/TicketPlaceRespArray.bs';
import { ticketPlaceRespArray } from '@/readOnly/api/types/TicketPlaceRespArray.gen';

export type ticketPlacesV2GetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketPlacesV2Get: build.query<ticketPlaceRespArray, ticketPlacesV2GetWithParams>({
                query: () => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/ticket/places/v2' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketPlaceRespArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketPlaceRespArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketPlacesV2GetQuery, useLazyTicketPlacesV2GetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
