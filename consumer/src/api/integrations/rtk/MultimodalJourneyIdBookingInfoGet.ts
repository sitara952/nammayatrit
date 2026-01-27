// open JourneyInfoResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyInfoResp } from '../../../readOnly/api/types/JourneyInfoResp.bs';
import { journeyInfoResp } from '../../../readOnly/api/types/JourneyInfoResp.gen';

export type multimodalJourneyIdBookingInfoGetWithParams = {
    journeyId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdBookingInfoGet: build.mutation<
                journeyInfoResp,
                multimodalJourneyIdBookingInfoGetWithParams
            >({
                query: ({ journeyId }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + journeyId + '/' + 'booking/info' + '?';
                        return url;
                    })(),
                    method: 'GET',
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

export const { useMultimodalJourneyIdBookingInfoGetMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
