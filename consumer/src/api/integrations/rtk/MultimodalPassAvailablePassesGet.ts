// open PassInfoAPIEntityArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePassInfoAPIEntityArray } from '@/readOnly/api/types/PassInfoAPIEntityArray.bs';
import { passInfoAPIEntityArray } from '@/readOnly/api/types/PassInfoAPIEntityArray.gen';

export type multimodalPassAvailablePassesGetWithParams = {
    language: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalPassAvailablePassesGet: build.query<
                passInfoAPIEntityArray,
                multimodalPassAvailablePassesGetWithParams
            >({
                query: ({ language }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/multimodal/pass/availablePasses' + '?';
                        url += language ? 'language=' + language + '&' : '';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePassInfoAPIEntityArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line
                    return res._0 as passInfoAPIEntityArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalPassAvailablePassesGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
