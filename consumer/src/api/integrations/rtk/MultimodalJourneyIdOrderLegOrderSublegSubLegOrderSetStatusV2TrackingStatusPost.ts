// open Enums
// open JourneyStatusResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus_multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus } from '@/readOnly/api/types/Enums.gen';
import { decodeJourneyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.bs';
import { journeyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.gen';

export type multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPostWithParams = {
    journeyId: string;
    legOrder: number;
    subLegOrder: number;
    trackingStatus: MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus_multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusTrackingStatus;
    trackingStatusLastUpdatedAt: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPost: build.mutation<
                journeyStatusResp,
                multimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPostWithParams
            >({
                query: ({ journeyId, legOrder, subLegOrder, trackingStatus, trackingStatusLastUpdatedAt }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

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
                            'setTrackingStatus' +
                            '/' +
                            trackingStatus +
                            '/' +
                            '' +
                            '?';
                        url += trackingStatusLastUpdatedAt
                            ? 'trackingStatusLastUpdatedAt=' + trackingStatusLastUpdatedAt + '&'
                            : '';
                        return url;
                    })(),
                    method: 'POST',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeJourneyStatusResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as journeyStatusResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetStatusV2TrackingStatusPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
