// open ServiceabilityReq
// open ServiceabilityRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeServiceabilityRes } from '../../../readOnly/api/types/ServiceabilityRes.bs';
import { serviceabilityRes } from '../../../readOnly/api/types/ServiceabilityRes.gen';
import { serviceabilityReq } from '../../../readOnly/api/types/ServiceabilityReq.gen';

export type serviceabilityDestinationPostWithParams = {
    body: serviceabilityReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            serviceabilityDestinationPost: build.mutation<serviceabilityRes, serviceabilityDestinationPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/serviceability/destination' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeServiceabilityRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as serviceabilityRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useServiceabilityDestinationPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
