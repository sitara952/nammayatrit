// open APISuccess
// open PassUploadProfilePictureReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { passUploadProfilePictureReq } from '@/readOnly/api/types/PassUploadProfilePictureReq.gen';

export type multimodalPassUploadProfilePicturePostWithParams = {
    body: passUploadProfilePictureReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalPassUploadProfilePicturePost: build.mutation<
                aPISuccess,
                multimodalPassUploadProfilePicturePostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal/pass/uploadProfilePicture' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalPassUploadProfilePicturePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
