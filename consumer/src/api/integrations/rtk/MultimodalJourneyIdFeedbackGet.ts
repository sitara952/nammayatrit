// open JourneyFeedBackForm
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyFeedBackForm } from '@/readOnly/api/types/JourneyFeedBackForm.bs';
import { journeyFeedBackForm } from '@/readOnly/api/types/JourneyFeedBackForm.gen';

export type multimodalJourneyIdFeedbackGetWithParams = {
    journeyId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdFeedbackGet: build.mutation<
                journeyFeedBackForm,
                multimodalJourneyIdFeedbackGetWithParams
            >({
                query: ({ journeyId }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + journeyId + '/' + 'feedback' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    try {
                        const res = decodeJourneyFeedBackForm(baseQueryReturnValue);
                        if (res.TAG === 'Error') {
                            console.warn('Journey feedback decode error:', res._0);
                            return {
                                additionalFeedBack: undefined,
                                rateTravelMode: [],
                                rating: undefined,
                            };
                        }
                        return res._0;
                    } catch (error) {
                        console.warn('Journey feedback transform error:', error);
                        return {
                            additionalFeedBack: undefined,
                            rateTravelMode: [],
                            rating: undefined,
                        };
                    }
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdFeedbackGetMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
