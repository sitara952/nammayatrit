// open APISuccess
// open UpdateBusLocationReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { updateBusLocationReq } from '@/readOnly/api/types/UpdateBusLocationReq.gen';

export type multimodalUpdateBusLocationPostWithParams = {
    busOTP: string | undefined;
    body: updateBusLocationReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalUpdateBusLocationPost: build.mutation<aPISuccess, multimodalUpdateBusLocationPostWithParams>({
                query: ({ busOTP, body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal/updateBusLocation' + '?';
                        url += busOTP ? 'busOTP=' + busOTP + '&' : '';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalUpdateBusLocationPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
