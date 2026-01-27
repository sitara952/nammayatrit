// open CancellationReasonAPIEntityArray
// open Enums
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { CancellationReasonListCancellationStage_cancellationReasonListCancellationStage } from '../../../readOnly/api/types/Enums.gen';
import { decodeCancellationReasonAPIEntityArray } from '../../../readOnly/api/types/CancellationReasonAPIEntityArray.bs';
import { cancellationReasonAPIEntityArray } from '../../../readOnly/api/types/CancellationReasonAPIEntityArray.gen';

export type cancellationReasonListGetWithParams = {
    cancellationStage: CancellationReasonListCancellationStage_cancellationReasonListCancellationStage;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            cancellationReasonListGet: build.query<
                cancellationReasonAPIEntityArray,
                cancellationReasonListGetWithParams
            >({
                query: ({ cancellationStage }) => ({
                    url: (function () {
                        const url = '/cancellationReason/list' + '?' + 'cancellationStage=' + cancellationStage + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCancellationReasonAPIEntityArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as cancellationReasonAPIEntityArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useCancellationReasonListGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
