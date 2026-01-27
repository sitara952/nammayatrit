// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type multimodalSearchRequestIdSwitchVariantEstimateIdPostWithParams = {
    searchRequestId: string;
    estimateId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalSearchRequestIdSwitchVariantEstimateIdPost: build.mutation<
                aPISuccess,
                multimodalSearchRequestIdSwitchVariantEstimateIdPostWithParams
            >({
                query: ({ searchRequestId, estimateId }) => ({
                    url: (function () {
                        const url =
                            '/multimodal' +
                            '/' +
                            searchRequestId +
                            '/' +
                            'switchVariant' +
                            '/' +
                            estimateId +
                            '/' +
                            '' +
                            '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: {},
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

export const { useMultimodalSearchRequestIdSwitchVariantEstimateIdPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
