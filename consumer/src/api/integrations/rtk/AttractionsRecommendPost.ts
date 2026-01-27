// open AttractionRecommendReq
// open AttractionRecommendResp
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAttractionRecommendResp } from '@/readOnly/api/types/AttractionRecommendResp.bs';
import { attractionRecommendResp } from '@/readOnly/api/types/AttractionRecommendResp.gen';
import { attractionRecommendReq } from '@/readOnly/api/types/AttractionRecommendReq.gen';

export type attractionsRecommendPostWithParams = {
    body: attractionRecommendReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            attractionsRecommendPost: build.mutation<attractionRecommendResp, attractionsRecommendPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/attractions/recommend' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAttractionRecommendResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as attractionRecommendResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useAttractionsRecommendPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
