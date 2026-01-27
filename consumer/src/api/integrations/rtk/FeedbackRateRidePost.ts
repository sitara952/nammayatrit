// open APISuccess
// open FeedbackReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { feedbackReq } from '../../../readOnly/api/types/FeedbackReq.gen';

export type feedbackRateRidePostWithParams = {
    body: feedbackReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            feedbackRateRidePost: build.mutation<aPISuccess, feedbackRateRidePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/feedback/rateRide' + '?';
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

export const { useFeedbackRateRidePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
