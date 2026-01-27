// open AddSosVideoRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAddSosVideoRes } from '../../../readOnly/api/types/AddSosVideoRes.bs';
import { addSosVideoRes } from '../../../readOnly/api/types/AddSosVideoRes.gen';

export type sosSosIdUploadPostWithParams = {
    sosId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosSosIdUploadPost: build.mutation<addSosVideoRes, sosSosIdUploadPostWithParams>({
                query: ({ sosId }) => ({
                    url: (function () {
                        const url = '/sos' + '/' + sosId + '/' + 'upload' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAddSosVideoRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as addSosVideoRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useSosSosIdUploadPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
