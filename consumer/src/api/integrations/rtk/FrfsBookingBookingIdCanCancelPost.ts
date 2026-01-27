// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { BookingId } from '@/typescript/state/client/user';

export type frfsBookingBookingIdCanCancelPostWithParams = {
    bookingId: BookingId;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsBookingBookingIdCanCancelPost: build.mutation<aPISuccess, frfsBookingBookingIdCanCancelPostWithParams>({
                query: ({ bookingId }) => ({
                    url: (function () {
                        const url = '/frfs/booking' + '/' + bookingId + '/' + 'canCancel' + '?';
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

export const { useFrfsBookingBookingIdCanCancelPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
