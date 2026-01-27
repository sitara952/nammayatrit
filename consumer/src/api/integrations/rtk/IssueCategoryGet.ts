// open Enums
// open IssueCategoryListRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';

import { decodeIssueCategoryListRes } from '../../../readOnly/api/types/IssueCategoryListRes.bs';
import { issueCategoryListRes } from '../../../readOnly/api/types/IssueCategoryListRes.gen';

export type issueCategoryGetWithParams = {
    language: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueCategoryGet: build.query<issueCategoryListRes, issueCategoryGetWithParams>({
                query: ({ language }) => ({
                    url: (function () {
                        const url = '/issue/category' + '?' + (language ? 'language=' + language + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: unknown) {
                    const res = decodeIssueCategoryListRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useIssueCategoryGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
