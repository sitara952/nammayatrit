// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type authLogoutPostWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authLogoutPost: build.mutation<aPISuccess, authLogoutPostWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/auth/logout' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { useAuthLogoutPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
