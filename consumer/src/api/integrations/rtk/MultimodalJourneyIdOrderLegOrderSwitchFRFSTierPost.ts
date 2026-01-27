// open JourneyInfoResp
// open SwitchFRFSTierReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.bs';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { switchFRFSTierReq } from '@/readOnly/api/types/SwitchFRFSTierReq.gen';

export type multimodalJourneyIdOrderLegOrderSwitchFRFSTierPostWithParams = {
    journeyId: string;
    legOrder: number;
    body: switchFRFSTierReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderSwitchFRFSTierPost: build.mutation<
                journeyInfoResp,
                multimodalJourneyIdOrderLegOrderSwitchFRFSTierPostWithParams
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
                            'switchFRFSTier' +
                            '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeJourneyInfoResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as journeyInfoResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderSwitchFRFSTierPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
