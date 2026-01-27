// open RouteAvailabilityReq
// open RouteAvailabilityResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeRouteAvailabilityResp } from '@/readOnly/api/types/RouteAvailabilityResp.bs';
import { routeAvailabilityResp } from '@/readOnly/api/types/RouteAvailabilityResp.gen';
import { routeAvailabilityReq } from '@/readOnly/api/types/RouteAvailabilityReq.gen';

export type multimodalRouteAvailabilityPostWithParams = {
    body: routeAvailabilityReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalRouteAvailabilityPost: build.mutation<
                routeAvailabilityResp,
                multimodalRouteAvailabilityPostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal/routeAvailability' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeRouteAvailabilityResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }

                    return res._0 as routeAvailabilityResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalRouteAvailabilityPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
