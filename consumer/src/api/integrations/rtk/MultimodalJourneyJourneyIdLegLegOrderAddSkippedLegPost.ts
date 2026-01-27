// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';

export type multimodalJourneyJourneyIdLegLegOrderAddSkippedLegPostWithParams = {
    journeyId: string;
    legOrder: number;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyJourneyIdLegLegOrderAddSkippedLegPost: build.mutation<
                aPISuccess,
                multimodalJourneyJourneyIdLegLegOrderAddSkippedLegPostWithParams
            >({
                query: ({ journeyId, legOrder }) => ({
                    url: (function () {
                        const url =
                            '/multimodal/journey' +
                            '/' +
                            journeyId +
                            '/' +
                            'leg' +
                            '/' +
                            legOrder +
                            '/' +
                            'addSkippedLeg' +
                            '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: {},
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

export const { useMultimodalJourneyJourneyIdLegLegOrderAddSkippedLegPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
