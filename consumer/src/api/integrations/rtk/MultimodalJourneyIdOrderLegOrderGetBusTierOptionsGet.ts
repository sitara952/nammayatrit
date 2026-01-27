// open LegServiceTierOptionsResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeLegServiceTierOptionsResp } from '@/readOnly/api/types/LegServiceTierOptionsResp.bs';
import { legServiceTierOptionsResp } from '@/readOnly/api/types/LegServiceTierOptionsResp.gen';

export type multimodalJourneyIdOrderLegOrderGetBusTierOptionsGetWithParams = {
    journeyId: string;
    legOrder: number;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderGetBusTierOptionsGet: build.query<
                legServiceTierOptionsResp,
                multimodalJourneyIdOrderLegOrderGetBusTierOptionsGetWithParams
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
                            'getLegTierOptions' +
                            '?';
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeLegServiceTierOptionsResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as legServiceTierOptionsResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderGetBusTierOptionsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: 60,
});
//
