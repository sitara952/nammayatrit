// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type multimodalSearchRequestIdSwitchEstimateIdTaxiGetWithParams = {
    searchRequestId: string;
    estimateId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalSearchRequestIdSwitchEstimateIdTaxiGet: build.query<
                aPISuccess,
                multimodalSearchRequestIdSwitchEstimateIdTaxiGetWithParams
            >({
                query: ({ searchRequestId, estimateId }) => ({
                    url: (function () {
                        const url =
                            '/multimodal' +
                            '/' +
                            searchRequestId +
                            '/' +
                            'switch' +
                            '/' +
                            estimateId +
                            '/' +
                            'taxi' +
                            '?';
                        return url;
                    })(),
                    method: 'GET',
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

export const { useMultimodalSearchRequestIdSwitchEstimateIdTaxiGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
