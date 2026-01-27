// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type multimodalJourneyJourneyIdLegLegIdSkipPostWithParams = {
    journeyId: string;
    legId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyJourneyIdLegLegIdSkipPost: build.mutation<
                aPISuccess,
                multimodalJourneyJourneyIdLegLegIdSkipPostWithParams
            >({
                query: ({ journeyId, legId }) => ({
                    url: (function () {
                        const url =
                            '/multimodal/journey' + '/' + journeyId + '/' + 'leg' + '/' + legId + '/' + 'skip' + '?';
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

export const { useMultimodalJourneyJourneyIdLegLegIdSkipPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
