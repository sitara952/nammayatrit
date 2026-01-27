// open APISuccess
// open FeedbackFormReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { feedbackFormReq } from '../../../readOnly/api/types/FeedbackFormReq.gen';

export type feedbackSubmitPostWithParams = {
    body: feedbackFormReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            feedbackSubmitPost: build.mutation<aPISuccess, feedbackSubmitPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/feedback/submit' + '?';
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

export const { useFeedbackSubmitPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
