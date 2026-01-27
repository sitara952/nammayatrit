// open SosReq
// open SosRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSosRes } from '../../../readOnly/api/types/SosRes.bs';
import { sosRes } from '../../../readOnly/api/types/SosRes.gen';
import { sosReq } from '../../../readOnly/api/types/SosReq.gen';

export type sosCreatePostWithParams = {
    body: sosReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosCreatePost: build.mutation<sosRes, sosCreatePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/sos/create' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: {
                        ...body,
                        flow: {
                            tag: body.flow,
                        },
                    },
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    console.info('Inside transform response', baseQueryReturnValue);
                    const res = decodeSosRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        console.error('Inside error: printing error');
                        throw new Error(res._0);
                    }
                    // console.log("REsponse received : ", res._0 )
                    return res._0 as sosRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useSosCreatePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
