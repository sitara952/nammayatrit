// open TicketServiceRespArray
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTicketServiceRespArray } from '../../../readOnly/api/types/TicketServiceRespArray.bs';
import { ticketServiceRespArray } from '../../../readOnly/api/types/TicketServiceRespArray.gen';

export type ticketPlacesPlaceIdServicesGetWithParams = {
    placeId: string;
    date: string | undefined;
    subPlaceId: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketPlacesPlaceIdServicesGet: build.mutation<
                ticketServiceRespArray,
                ticketPlacesPlaceIdServicesGetWithParams
            >({
                query: ({ placeId, date, subPlaceId }) => ({
                    url: (function () {
                        const baseUrl = '/ticket/places' + '/' + placeId + '/' + 'services' + '?';
                        const url =
                            baseUrl +
                            (date ? 'date=' + date + '&' : '') +
                            (subPlaceId ? 'subPlaceId=' + subPlaceId + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketServiceRespArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketServiceRespArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketPlacesPlaceIdServicesGetMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
