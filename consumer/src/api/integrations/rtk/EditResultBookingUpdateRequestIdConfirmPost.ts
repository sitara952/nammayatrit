// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type editResultBookingUpdateRequestIdConfirmPostWithParams = {
    bookingUpdateRequestId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            editResultBookingUpdateRequestIdConfirmPost: build.mutation<
                aPISuccess,
                editResultBookingUpdateRequestIdConfirmPostWithParams
            >({
                query: ({ bookingUpdateRequestId }) => ({
                    url: (function () {
                        const url = '/edit/result' + '/' + bookingUpdateRequestId + '/' + 'confirm' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { useEditResultBookingUpdateRequestIdConfirmPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
