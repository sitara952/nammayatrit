// open SimilarJourneyLegsResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSimilarJourneyLegsResp } from '@/readOnly/api/types/SimilarJourneyLegsResp.bs';
import { similarJourneyLegsResp } from '@/readOnly/api/types/SimilarJourneyLegsResp.gen';

export type multimodalJourneyIdOrderLegOrderSimilarJourneyLegsGetWithParams = {
    journeyId: string;
    legOrder: number;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderSimilarJourneyLegsGet: build.query<
                similarJourneyLegsResp,
                multimodalJourneyIdOrderLegOrderSimilarJourneyLegsGetWithParams
            >({
                query: ({ journeyId, legOrder }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url =
                            '/multimodal' +
                            '/' +
                            journeyId +
                            '/' +
                            'order' +
                            '/' +
                            legOrder +
                            '/' +
                            'similarJourneyLegs' +
                            '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeSimilarJourneyLegsResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as similarJourneyLegsResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderSimilarJourneyLegsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
