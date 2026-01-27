// open JourneyInfoResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.bs';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';

export type multimodalJourneyIdInitiatePostWithParams = {
    journeyId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdInitiatePost: build.mutation<journeyInfoResp, multimodalJourneyIdInitiatePostWithParams>(
                {
                    query: ({ journeyId }) => ({
                        url: (function () {
                            const url = '/multimodal' + '/' + journeyId + '/' + 'initiate' + '?';
                            return url;
                        })(),
                        method: 'POST',
                        body: {},
                    }),

                    transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                        const res = decodeJourneyInfoResp(baseQueryReturnValue);
                        if (res.TAG === 'Error') {
                            throw new Error(res._0);
                        }
                        return res._0 as journeyInfoResp;
                    },
                    ...rtkExtraOptions,
                },
            ),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdInitiatePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
