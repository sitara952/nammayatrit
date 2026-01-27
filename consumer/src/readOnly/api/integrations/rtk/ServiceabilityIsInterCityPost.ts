// open IsIntercityReq
// open IsIntercityResp

import { api, RtkExtraOptions } from '../../../../typescript/state/api';
import { decodeIsIntercityResp } from '../../../../readOnly/api/types/IsIntercityResp.bs';
import { isIntercityResp } from '../../../../readOnly/api/types/IsIntercityResp.gen';
import { isIntercityReq } from '../../../../readOnly/api/types/IsIntercityReq.gen';

export type serviceabilityIsInterCityPostWithParams = {
    body: isIntercityReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            serviceabilityIsInterCityPost: build.mutation<isIntercityResp, serviceabilityIsInterCityPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/serviceability/isInterCity' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeIsIntercityResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as isIntercityResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useServiceabilityIsInterCityPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
