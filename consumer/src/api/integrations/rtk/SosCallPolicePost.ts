// open APISuccess
// open CallPoliceAPI
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { callPoliceAPI } from '../../../readOnly/api/types/CallPoliceAPI.gen';

export type sosCallPolicePostWithParams = {
    body: callPoliceAPI;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosCallPolicePost: build.mutation<aPISuccess, sosCallPolicePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/sos/callPolice' + '?';
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

export const { useSosCallPolicePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
