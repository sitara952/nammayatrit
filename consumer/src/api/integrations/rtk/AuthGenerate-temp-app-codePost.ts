// open TempCodeRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTempCodeRes } from '@/readOnly/api/types/TempCodeRes.bs';
import { tempCodeRes } from '@/readOnly/api/types/TempCodeRes.gen';

export type authGeneratetempappcodePostWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authGeneratetempappcodePost: build.mutation<tempCodeRes, authGeneratetempappcodePostWithParams>({
                query: () => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/auth/generate-temp-app-code' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTempCodeRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as tempCodeRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useAuthGeneratetempappcodePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
