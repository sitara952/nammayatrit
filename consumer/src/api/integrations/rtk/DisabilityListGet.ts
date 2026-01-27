// open DisabilityArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeDisabilityArray } from '../../../readOnly/api/types/DisabilityArray.bs';
import { disabilityArray } from '../../../readOnly/api/types/DisabilityArray.gen';

export type disabilityListGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            disabilityListGet: build.query<disabilityArray, disabilityListGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/disability/list' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeDisabilityArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as disabilityArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useDisabilityListGetQuery, useLazyDisabilityListGetQuery, usePrefetch } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
