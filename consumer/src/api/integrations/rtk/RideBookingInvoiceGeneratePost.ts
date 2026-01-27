// open GenerateInvoiceReq
// open GenerateInvoiceRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGenerateInvoiceRes } from '../../../readOnly/api/types/GenerateInvoiceRes.bs';
import { generateInvoiceRes } from '../../../readOnly/api/types/GenerateInvoiceRes.gen';
import { generateInvoiceReq } from '../../../readOnly/api/types/GenerateInvoiceReq.gen';

export type rideBookingInvoiceGeneratePostWithParams = {
    body: generateInvoiceReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingInvoiceGeneratePost: build.mutation<
                generateInvoiceRes,
                rideBookingInvoiceGeneratePostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/rideBooking/invoice/generate' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGenerateInvoiceRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as generateInvoiceRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideBookingInvoiceGeneratePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
