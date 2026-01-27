// open APISuccess
// open SocialUpdateProfileReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { socialUpdateProfileReq } from '../../../readOnly/api/types/SocialUpdateProfileReq.gen';

export type socialUpdateProfilePostWithParams = {
    body: socialUpdateProfileReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            socialUpdateProfilePost: build.mutation<aPISuccess, socialUpdateProfilePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/social/update/profile' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
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

export const { useSocialUpdateProfilePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
