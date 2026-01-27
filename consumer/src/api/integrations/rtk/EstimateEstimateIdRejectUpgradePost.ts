// open CancelAPIResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCancelAPIResponse } from '../../../readOnly/api/types/CancelAPIResponse.bs';
import { cancelAPIResponse } from '../../../readOnly/api/types/CancelAPIResponse.gen';

export type estimateEstimateIdRejectUpgradePostWithParams = {
    estimateId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            estimateEstimateIdRejectUpgradePost: build.mutation<
                cancelAPIResponse,
                estimateEstimateIdRejectUpgradePostWithParams
            >({
                query: ({ estimateId }) => ({
                    url: (function () {
                        const url = '/estimate' + '/' + estimateId + '/' + 'rejectUpgrade' + '?';
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

export const { useEstimateEstimateIdRejectUpgradePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
