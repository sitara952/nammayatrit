// open AutoCompleteReq
// open AutoCompleteResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAutoCompleteResp } from '../../../readOnly/api/types/AutoCompleteResp.bs.js';
import { autoCompleteResp } from '../../../readOnly/api/types/AutoCompleteResp.gen.tsx';
import { autoCompleteReq } from '../../../readOnly/api/types/AutoCompleteReq.gen.tsx';

export type mapsAutoCompletePostWithParams = {
    body: autoCompleteReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            mapsAutoCompletePost: build.mutation<autoCompleteResp, mapsAutoCompletePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/maps/autoComplete' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAutoCompleteResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as autoCompleteResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMapsAutoCompletePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
