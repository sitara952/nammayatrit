// open JourneyInfoResp
// open SwitchTaxiReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.bs';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { switchTaxiReq } from '@/readOnly/api/types/SwitchTaxiReq.gen';

export type multimodalJourneyIdOrderLegOrderSwitchTaxiPostWithParams = {
    journeyId: string;
    legOrder: number;
    body: switchTaxiReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderSwitchTaxiPost: build.mutation<
                journeyInfoResp,
                multimodalJourneyIdOrderLegOrderSwitchTaxiPostWithParams
            >({
                query: ({ journeyId, legOrder, body }) => ({
                    url: (function () {
                        const url =
                            '/multimodal' + '/' + journeyId + '/' + 'order' + '/' + legOrder + '/' + 'switchTaxi' + '?';
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

export const { useMultimodalJourneyIdOrderLegOrderSwitchTaxiPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
