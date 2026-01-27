// open APISuccess
// open JourneyFeedBackForm
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { journeyFeedBackForm } from '@/readOnly/api/types/JourneyFeedBackForm.gen';

export type multimodalJourneyIdJourneyFeedbackPostWithParams = {
    journeyId: string;
    body: journeyFeedBackForm;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdJourneyFeedbackPost: build.mutation<
                aPISuccess,
                multimodalJourneyIdJourneyFeedbackPostWithParams
            >({
                query: ({ journeyId, body }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + journeyId + '/' + 'journeyFeedback' + '?';
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

export const { useMultimodalJourneyIdJourneyFeedbackPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
