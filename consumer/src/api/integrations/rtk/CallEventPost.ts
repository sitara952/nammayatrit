// open APISuccess
// open CallEventReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { callEventReq } from '../../../readOnly/api/types/CallEventReq.gen';

export type callEventPostWithParams = {
    body: callEventReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            callEventPost: build.mutation<aPISuccess, callEventPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/callEvent' + '?';
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

export const { useCallEventPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
