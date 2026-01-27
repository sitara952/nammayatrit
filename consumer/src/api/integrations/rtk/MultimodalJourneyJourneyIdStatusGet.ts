// open JourneyStatusResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.bs';
import { journeyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.gen';

export type multimodalJourneyJourneyIdStatusGetWithParams = {
    journeyId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyJourneyIdStatusGet: build.query<
                journeyStatusResp,
                multimodalJourneyJourneyIdStatusGetWithParams
            >({
                query: ({ journeyId }) => ({
                    url: (function () {
                        const url = '/multimodal/journey' + '/' + journeyId + '/' + 'status' + '?';
                        return url;
                    })(),
                    method: 'GET',
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

export const { useMultimodalJourneyJourneyIdStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
