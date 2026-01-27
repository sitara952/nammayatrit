// open JourneyInfoResp
// open OnboardedVehicleDetailsReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.bs';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { onboardedVehicleDetailsReq } from '@/readOnly/api/types/OnboardedVehicleDetailsReq.gen';

export type multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetOnboardedVehicleDetailsPostWithParams = {
    journeyId: string;
    legOrder: number;
    subLegOrder: number;
    body: onboardedVehicleDetailsReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetOnboardedVehicleDetailsPost: build.mutation<
                journeyInfoResp,
                multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetOnboardedVehicleDetailsPostWithParams
            >({
                query: ({ journeyId, legOrder, subLegOrder, body }) => ({
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
                            'subleg' +
                            '/' +
                            subLegOrder +
                            '/' +
                            'setOnboardedVehicleDetails' +
                            '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue, _meta, _arg) {
                    const res = decodeJourneyInfoResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as journeyInfoResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetOnboardedVehicleDetailsPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: 0,
});
//
