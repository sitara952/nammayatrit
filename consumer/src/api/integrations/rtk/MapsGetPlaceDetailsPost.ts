// open GetPlaceDetailsReq
// open GetPlaceDetailsResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetPlaceDetailsResp } from '../../../readOnly/api/types/GetPlaceDetailsResp.bs';
import { getPlaceDetailsResp } from '../../../readOnly/api/types/GetPlaceDetailsResp.gen';
import { getPlaceDetailsReq } from '../../../readOnly/api/types/GetPlaceDetailsReq.gen';

export type mapsGetPlaceDetailsPostWithParams = {
    body: getPlaceDetailsReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            mapsGetPlaceDetailsPost: build.mutation<getPlaceDetailsResp, mapsGetPlaceDetailsPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/maps/getPlaceDetails' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetPlaceDetailsResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getPlaceDetailsResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMapsGetPlaceDetailsPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
