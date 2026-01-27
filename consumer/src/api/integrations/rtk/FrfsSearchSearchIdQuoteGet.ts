/* eslint-disable myCustomPlugin/no-any-in-modified-files */
/* eslint-disable myCustomPlugin/no-as-in-modified-files */
// open FRFSQuoteAPIResArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSQuoteAPIResArray } from '../../../readOnly/api/types/FRFSQuoteAPIResArray.bs';
import { fRFSQuoteAPIResArray } from '../../../readOnly/api/types/FRFSQuoteAPIResArray.gen';

export type frfsSearchSearchIdQuoteGetWithParams = {
    searchId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsSearchSearchIdQuoteGet: build.query<fRFSQuoteAPIResArray, frfsSearchSearchIdQuoteGetWithParams>({
                query: ({ searchId }) => ({
                    url: (function () {
                        const url = '/frfs/search' + '/' + searchId + '/' + 'quote' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSQuoteAPIResArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSQuoteAPIResArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsSearchSearchIdQuoteGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
