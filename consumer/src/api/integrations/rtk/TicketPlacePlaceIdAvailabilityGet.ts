// open TicketPlaceAvailabilityArray
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTicketPlaceAvailabilityArray } from '@/readOnly/api/types/TicketPlaceAvailabilityArray.bs';
import { ticketPlaceAvailabilityArray } from '@/readOnly/api/types/TicketPlaceAvailabilityArray.gen';

export type ticketPlacePlaceIdAvailabilityGetWithParams = {
    placeId: string;
    forceFresh: boolean | undefined;
    isClosed: boolean | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            ticketPlacePlaceIdAvailabilityGet: build.query<
                ticketPlaceAvailabilityArray,
                ticketPlacePlaceIdAvailabilityGetWithParams
            >({
                query: ({ placeId, forceFresh, isClosed }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/ticket/place' + '/' + placeId + '/' + 'availability' + '?';
                        url += forceFresh ? 'forceFresh=' + forceFresh + '&' : '';
                        url += isClosed ? 'isClosed=' + isClosed + '&' : '';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketPlaceAvailabilityArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as ticketPlaceAvailabilityArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTicketPlacePlaceIdAvailabilityGetQuery, useLazyTicketPlacePlaceIdAvailabilityGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
