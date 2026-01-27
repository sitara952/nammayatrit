// open APISuccess
// open MockSosReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { mockSosReq } from '../../../readOnly/api/types/MockSosReq.gen';

export type sosCreateMockSosPostWithParams = {
    body: mockSosReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosCreateMockSosPost: build.mutation<aPISuccess, sosCreateMockSosPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/sos/createMockSos' + '?';
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

export const { useSosCreateMockSosPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
