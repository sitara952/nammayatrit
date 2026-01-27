// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type savedLocationTagDeleteWithParams = {
    tag: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            savedLocationTagDelete: build.mutation<aPISuccess, savedLocationTagDeleteWithParams>({
                query: ({ tag }) => ({
                    url: (function () {
                        const url = '/savedLocation' + '/' + tag + '/' + '' + '?';
                        return url;
                    })(),
                    method: 'DELETE',
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

export const { useSavedLocationTagDeleteMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
