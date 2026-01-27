// open MultimodalUserPreferences
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeMultimodalUserPreferences } from '@/readOnly/api/types/MultimodalUserPreferences.bs';
import { multimodalUserPreferences } from '@/readOnly/api/types/MultimodalUserPreferences.gen';

export type multimodalUserPreferencesGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalUserPreferencesGet: build.query<
                multimodalUserPreferences,
                multimodalUserPreferencesGetWithParams
            >({
                query: () => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal/user/preferences' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeMultimodalUserPreferences(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as multimodalUserPreferences;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalUserPreferencesGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
