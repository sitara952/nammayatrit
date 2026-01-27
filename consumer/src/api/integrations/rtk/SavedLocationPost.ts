// open APISuccess
// open CreateSavedReqLocationReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { createSavedReqLocationReq } from '../../../readOnly/api/types/CreateSavedReqLocationReq.gen';

export type savedLocationPostWithParams = {
    body: createSavedReqLocationReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            savedLocationPost: build.mutation<aPISuccess, savedLocationPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/savedLocation' + '?';
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

export const { useSavedLocationPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
