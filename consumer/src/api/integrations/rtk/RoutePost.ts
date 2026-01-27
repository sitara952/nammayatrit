// open GetRoutesReq
// open RouteInfoArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeRouteInfoArray } from '../../../readOnly/api/types/RouteInfoArray.bs';
import { routeInfoArray } from '../../../readOnly/api/types/RouteInfoArray.gen';
import { getRoutesReq } from '../../../readOnly/api/types/GetRoutesReq.gen';

export type routePostWithParams = {
    body: getRoutesReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            routePost: build.mutation<routeInfoArray, routePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/route' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeRouteInfoArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as routeInfoArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRoutePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
