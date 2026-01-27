// open JourneyInfoResp
// open SwitchLegReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.bs';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { switchLegReq } from '@/readOnly/api/types/SwitchLegReq.gen';

export type multimodalJourneyIdSwitchPostWithParams = {
    journeyId: string;
    body: switchLegReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdSwitchPost: build.mutation<journeyInfoResp, multimodalJourneyIdSwitchPostWithParams>({
                query: ({ journeyId, body }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + journeyId + '/' + 'switch' + '?';
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

export const { useMultimodalJourneyIdSwitchPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
