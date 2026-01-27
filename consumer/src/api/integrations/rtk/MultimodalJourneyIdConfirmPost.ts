//
// open APISuccess
// open JourneyConfirmReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { journeyConfirmReq } from '@/readOnly/api/types/JourneyConfirmReq.gen';
import { isUndefined } from 'lodash';

export type multimodalJourneyIdConfirmPostWithParams = {
    journeyId: string;
    forceBookLegOrder: number | undefined;
    body: journeyConfirmReq;
};
export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdConfirmPost: build.mutation<aPISuccess, multimodalJourneyIdConfirmPostWithParams>({
                query: ({ journeyId, forceBookLegOrder, body }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + journeyId + '/' + 'confirm' + '?';
                        const params = !isUndefined(forceBookLegOrder)
                            ? 'forceBookLegOrder=' + forceBookLegOrder + '&'
                            : '';

                        return url + params;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                invalidatesTags: ['RideBookingListV2Get'],

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

export const { useMultimodalJourneyIdConfirmPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
