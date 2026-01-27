// open MultimodalCancelStatusResp
/* eslint-disable myCustomPlugin/no-as-in-modified-files, myCustomPlugin/no-any-in-modified-files */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeMultimodalCancelStatusResp } from '@/readOnly/api/types/MultimodalCancelStatusResp.bs';
import { multimodalCancelStatusResp } from '@/readOnly/api/types/MultimodalCancelStatusResp.gen';

export type multimodalJourneyIdOrderLegOrderCancelStatusGetWithParams = {
    journeyId: string;
    legOrder: number;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdOrderLegOrderCancelStatusGet: build.query<
                multimodalCancelStatusResp,
                multimodalJourneyIdOrderLegOrderCancelStatusGetWithParams
            >({
                query: ({ journeyId, legOrder }) => {
                    const url = (function () {
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
                            'cancel/status' +
                            '?';
                        return url;
                    })();

                    return {
                        url,
                        method: 'GET',
                    };
                },
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeMultimodalCancelStatusResp(baseQueryReturnValue);

                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }

                    return res._0 as multimodalCancelStatusResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdOrderLegOrderCancelStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
