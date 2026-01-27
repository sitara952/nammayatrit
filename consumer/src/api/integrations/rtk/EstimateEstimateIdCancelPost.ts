// open CancelAPIResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCancelAPIResponse } from '../../../readOnly/api/types/CancelAPIResponse.bs';
import { cancelAPIResponse } from '../../../readOnly/api/types/CancelAPIResponse.gen';

export type estimateEstimateIdCancelPostWithParams = {
    estimateId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            estimateEstimateIdCancelPost: build.mutation<cancelAPIResponse, estimateEstimateIdCancelPostWithParams>({
                query: ({ estimateId }) => ({
                    url: (function () {
                        const url = '/estimate' + '/' + estimateId + '/' + 'cancel' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCancelAPIResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as cancelAPIResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useEstimateEstimateIdCancelPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
