import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { deletedPersonReq } from '@/readOnly/api/types/DeletedPersonReq.gen';

export type deletedPersonPostWithParams = {
    body: deletedPersonReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            deletedPersonPost: build.mutation<aPISuccess, deletedPersonPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/deleted/person' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useDeletedPersonPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
