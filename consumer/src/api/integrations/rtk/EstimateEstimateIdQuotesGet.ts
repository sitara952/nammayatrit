// open SelectListRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSelectListRes } from '../../../readOnly/api/types/SelectListRes.bs';
import { selectListRes } from '../../../readOnly/api/types/SelectListRes.gen';

export type estimateEstimateIdQuotesGetWithParams = {
    estimateId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            estimateEstimateIdQuotesGet: build.query<selectListRes, estimateEstimateIdQuotesGetWithParams>({
                query: ({ estimateId }) => ({
                    url: (function () {
                        const url = '/estimate' + '/' + estimateId + '/' + 'quotes' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeSelectListRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as selectListRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useEstimateEstimateIdQuotesGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
