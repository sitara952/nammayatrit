// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';

export type authBusinessemailSendverificationPostWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            authBusinessemailSendverificationPost: build.mutation<
                aPISuccess,
                authBusinessemailSendverificationPostWithParams
            >({
                query: () => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/auth/business-email/send-verification' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { useAuthBusinessemailSendverificationPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: 0,
});
//
