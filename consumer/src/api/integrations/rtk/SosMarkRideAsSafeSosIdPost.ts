// open APISuccess
// open MarkAsSafeReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { markAsSafeReq } from '../../../readOnly/api/types/MarkAsSafeReq.gen';

export type sosMarkRideAsSafeSosIdPostWithParams = {
    sosId: string;
    body: markAsSafeReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosMarkRideAsSafeSosIdPost: build.mutation<aPISuccess, sosMarkRideAsSafeSosIdPostWithParams>({
                query: ({ sosId, body }) => ({
                    url: (function () {
                        const url = '/sos/markRideAsSafe' + '/' + sosId + '/' + '' + '?';
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

export const { useSosMarkRideAsSafeSosIdPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
