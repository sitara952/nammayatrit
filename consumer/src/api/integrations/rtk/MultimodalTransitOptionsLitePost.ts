// open MultimodalTransitOptionsReq
// open MultimodalTransitOptionsResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeMultimodalTransitOptionsResp } from '@/readOnly/api/types/MultimodalTransitOptionsResp.bs';
import { multimodalTransitOptionsResp } from '@/readOnly/api/types/MultimodalTransitOptionsResp.gen';
import { multimodalTransitOptionsReq } from '@/readOnly/api/types/MultimodalTransitOptionsReq.gen';

export type multimodalTransitOptionsLitePostWithParams = {
    body: multimodalTransitOptionsReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalTransitOptionsLitePost: build.mutation<
                multimodalTransitOptionsResp,
                multimodalTransitOptionsLitePostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal/transitOptions/lite' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeMultimodalTransitOptionsResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as multimodalTransitOptionsResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalTransitOptionsLitePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
