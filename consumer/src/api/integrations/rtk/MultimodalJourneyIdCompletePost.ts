// open JourneyStatusResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.bs';
import { journeyStatusResp } from '@/readOnly/api/types/JourneyStatusResp.gen';

export type multimodalJourneyIdCompletePostWithParams = {
    journeyId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdCompletePost: build.mutation<
                journeyStatusResp,
                multimodalJourneyIdCompletePostWithParams
            >({
                query: ({ journeyId }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal' + '/' + journeyId + '/' + 'complete' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { useMultimodalJourneyIdCompletePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
