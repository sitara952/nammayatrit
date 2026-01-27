// open JourneyStatusResp
// open RiderLocationReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.bs';
import { journeyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.gen.tsx';
import { riderLocationReq } from '@/readOnly/api/types/RiderLocationReq.gen';

export type multimodalJourneyIdRiderLocationPostWithParams = {
    journeyId: string;
    body: riderLocationReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdRiderLocationPost: build.mutation<
                journeyStatusResp,
                multimodalJourneyIdRiderLocationPostWithParams
            >({
                query: ({ journeyId, body }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + journeyId + '/' + 'rider/location' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeJourneyStatusResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as journeyStatusResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdRiderLocationPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
