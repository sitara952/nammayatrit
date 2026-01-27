// open APISuccess

/* eslint-disable myCustomPlugin/no-as-in-modified-files, myCustomPlugin/no-any-in-modified-files */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';

export type multimodalJourneyIdOrderLegOrderSoftCancelPostWithParams = {
    journeyId: string;
    legOrder: number;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderSoftCancelPost: build.mutation<
                aPISuccess,
                multimodalJourneyIdOrderLegOrderSoftCancelPostWithParams
            >({
                query: ({ journeyId, legOrder }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url =
                            '/multimodal' + '/' + journeyId + '/' + 'order' + '/' + legOrder + '/' + 'softCancel' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderSoftCancelPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
