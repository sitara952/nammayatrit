// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';

export type multimodalJourneyJourneyIdLegLegOrderSkipPostWithParams = {
    journeyId: string;
    legOrder: number;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyJourneyIdLegLegOrderSkipPost: build.mutation<
                aPISuccess,
                multimodalJourneyJourneyIdLegLegOrderSkipPostWithParams
            >({
                query: ({ journeyId, legOrder }) => ({
                    url: (function () {
                        const url =
                            '/multimodal/journey' + '/' + journeyId + '/' + 'leg' + '/' + legOrder + '/' + 'skip' + '?';
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

export const { useMultimodalJourneyJourneyIdLegLegOrderSkipPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
