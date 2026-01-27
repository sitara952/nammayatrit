// open APISuccess
// open UpdateProfileReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { updateProfileReq } from '../../../readOnly/api/types/UpdateProfileReq.gen';

export type profilePostWithParams = {
    body: updateProfileReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            profilePost: build.mutation<aPISuccess, profilePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/profile' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue, _meta, _arg) {
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

// Do not use this api, use the one in userApi.ts to maintain consistency
// export const { useProfilePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
