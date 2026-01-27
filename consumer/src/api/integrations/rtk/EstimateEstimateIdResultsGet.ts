// open QuotesResultResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeQuotesResultResponse } from '../../../readOnly/api/types/QuotesResultResponse.bs';
import { quotesResultResponse } from '../../../readOnly/api/types/QuotesResultResponse.gen';

export type estimateEstimateIdResultsGetWithParams = {
    estimateId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            estimateEstimateIdResultsGet: build.query<quotesResultResponse, estimateEstimateIdResultsGetWithParams>({
                query: ({ estimateId }) => ({
                    url: (function () {
                        const url = '/estimate' + '/' + estimateId + '/' + 'results' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeQuotesResultResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as quotesResultResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useEstimateEstimateIdResultsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
