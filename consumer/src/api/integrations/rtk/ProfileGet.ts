// open ProfileRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeProfileRes } from '../../../readOnly/api/types/ProfileRes.bs';
import { profileRes } from '../../../readOnly/api/types/ProfileRes.gen';

export type profileGetWithParams = {
    toss: number | undefined;
    tenant: string | undefined;
    context: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            profileGet: build.query<profileRes, profileGetWithParams>({
                query: ({ toss, tenant, context }) => ({
                    url: (function () {
                        const url = '/profile' + '?';
                        return (
                            url +
                            (toss ? 'toss=' + toss + '&' : '') +
                            (tenant ? 'tenant=' + tenant + '&' : '') +
                            (context ? 'context=' + context + '&' : '')
                        );
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue, _meta, _arg) {
                    const res = decodeProfileRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as profileRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });
// Do not use this api, use the one in userApi.ts to maintain consistency
// export const { useProfileGetQuery, useLazyProfileGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
