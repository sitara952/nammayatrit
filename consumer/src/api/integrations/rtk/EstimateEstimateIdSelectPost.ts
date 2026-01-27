// open DSelectReq
// open DSelectResultRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeDSelectResultRes } from '../../../readOnly/api/types/DSelectResultRes.bs';
import { dSelectResultRes } from '../../../readOnly/api/types/DSelectResultRes.gen';
import { dSelectReq } from '../../../readOnly/api/types/DSelectReq.gen';

export type estimateEstimateIdSelectPostWithParams = {
    estimateId: string;
    body: dSelectReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            estimateEstimateIdSelectPost: build.mutation<dSelectResultRes, estimateEstimateIdSelectPostWithParams>({
                query: ({ estimateId, body }) => ({
                    url: (function () {
                        const url = '/estimate' + '/' + estimateId + '/' + 'select' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeDSelectResultRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as dSelectResultRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useEstimateEstimateIdSelectPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
