// open APISuccess
// open SosUpdateReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { sosUpdateReq } from '../../../readOnly/api/types/SosUpdateReq.gen';

export type sosSosIdStatusPostWithParams = {
    sosId: string;
    body: sosUpdateReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosSosIdStatusPost: build.mutation<aPISuccess, sosSosIdStatusPostWithParams>({
                query: ({ sosId, body }) => ({
                    url: (function () {
                        const url = '/sos' + '/' + sosId + '/' + 'status' + '?';
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

export const { useSosSosIdStatusPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
