// open FRFSCancelStatus
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSCancelStatus } from '../../../readOnly/api/types/FRFSCancelStatus.bs.js';
import { fRFSCancelStatus } from '../../../readOnly/api/types/FRFSCancelStatus.gen.tsx';
import { BookingId } from '@/typescript/state/client/user';

export type frfsBookingCancelBookingIdStatusGetWithParams = {
    bookingId: BookingId;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsBookingCancelBookingIdStatusGet: build.query<
                fRFSCancelStatus,
                frfsBookingCancelBookingIdStatusGetWithParams
            >({
                query: ({ bookingId }) => ({
                    url: (function () {
                        const url = '/frfs/booking/cancel' + '/' + bookingId + '/' + 'status' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSCancelStatus(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSCancelStatus;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsBookingCancelBookingIdStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
