// open TicketPlaceArray
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTicketPlaceArray } from '../../../readOnly/api/types/TicketPlaceArray.bs';
import { ticketPlaceArray } from '../../../readOnly/api/types/TicketPlaceArray.gen';

export type ticketPlacesGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketPlacesGet: build.mutation<ticketPlaceArray, ticketPlacesGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/ticket/places' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketPlaceArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketPlaceArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketPlacesGetMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
