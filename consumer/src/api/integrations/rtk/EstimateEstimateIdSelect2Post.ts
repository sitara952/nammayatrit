// open APISuccess
// open DSelectReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { dSelectReq } from '../../../readOnly/api/types/DSelectReq.gen';

export type estimateEstimateIdSelect2PostWithParams = {
    estimateId: string;
    body: dSelectReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            estimateEstimateIdSelect2Post: build.mutation<aPISuccess, estimateEstimateIdSelect2PostWithParams>({
                query: ({ estimateId, body }) => ({
                    url: (function () {
                        const url = '/estimate' + '/' + estimateId + '/' + 'select2' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useEstimateEstimateIdSelect2PostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
