import { decodeRouteInfoArray } from '@/readOnly/api/types/RouteInfoArray.bs';
import { api } from './../api';

export const tripRouteApi = api.injectEndpoints({
    endpoints: build => ({
        getTripRoute: build.mutation({
            query: req => ({
                url: '/trip/route',
                method: 'POST',
                body: req,
            }),
            transformResponse(baseQueryReturnValue, _meta, _arg) {
                return decodeRouteInfoArray(baseQueryReturnValue);
            },
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useGetTripRouteMutation } = tripRouteApi;
