// open ServiceabilityReq
// open ServiceabilityRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeServiceabilityRes } from '../../../readOnly/api/types/ServiceabilityRes.bs';
import { serviceabilityRes } from '../../../readOnly/api/types/ServiceabilityRes.gen';
import { serviceabilityReq } from '../../../readOnly/api/types/ServiceabilityReq.gen';

export type serviceabilityOriginPostWithParams = {
    body: serviceabilityReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            serviceabilityOriginPost: build.mutation<serviceabilityRes, serviceabilityOriginPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/serviceability/origin' + '?';
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

export const { useServiceabilityOriginPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
