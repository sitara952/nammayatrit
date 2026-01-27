// open GetPickupRoutesReq
// open RouteInfoArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeRouteInfoArray } from '../../../readOnly/api/types/RouteInfoArray.bs';
import { routeInfoArray } from '../../../readOnly/api/types/RouteInfoArray.gen';
import { getPickupRoutesReq } from '../../../readOnly/api/types/GetPickupRoutesReq.gen';

export type pickupRoutePostWithParams = {
    body: getPickupRoutesReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            pickupRoutePost: build.mutation<routeInfoArray, pickupRoutePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/pickup/route' + '?';
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

export const { usePickupRoutePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
