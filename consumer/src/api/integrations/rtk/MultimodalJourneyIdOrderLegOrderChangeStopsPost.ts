// open ChangeStopsReq
// open ChangeStopsResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeChangeStopsResp } from '@/readOnly/api/types/ChangeStopsResp.bs.js';
import { changeStopsResp } from '@/readOnly/api/types/ChangeStopsResp.gen.tsx';
import { changeStopsReq } from '@/readOnly/api/types/ChangeStopsReq.gen.tsx';

export type multimodalJourneyIdOrderLegOrderChangeStopsPostWithParams = {
    journeyId: string;
    legOrder: number;
    body: changeStopsReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderChangeStopsPost: build.mutation<
                changeStopsResp,
                multimodalJourneyIdOrderLegOrderChangeStopsPostWithParams
            >({
                query: ({ journeyId, legOrder, body }) => ({
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
                            'changeStops' +
                            '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeChangeStopsResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }

                    return res._0 as changeStopsResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderChangeStopsPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
