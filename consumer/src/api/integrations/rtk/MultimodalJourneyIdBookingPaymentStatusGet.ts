// open JourneyBookingPaymentStatus
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyBookingPaymentStatus } from '@/readOnly/api/types/JourneyBookingPaymentStatus.bs';
import { journeyBookingPaymentStatus } from '@/readOnly/api/types/JourneyBookingPaymentStatus.gen';

export type multimodalJourneyIdBookingPaymentStatusGetWithParams = {
    journeyId: string;
};

export const apiCall = (rtkExtraOptions: Partial<RtkExtraOptions>) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalJourneyIdBookingPaymentStatusGet: build.query<
                journeyBookingPaymentStatus,
                multimodalJourneyIdBookingPaymentStatusGetWithParams
            >({
                query: ({ journeyId }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + journeyId + '/' + 'booking/paymentStatus' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    console.info('baseQueryReturnValue Response', baseQueryReturnValue);
                    const res = decodeJourneyBookingPaymentStatus(baseQueryReturnValue);
                    console.info('baseQueryReturnValue res', res);

                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as journeyBookingPaymentStatus;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalJourneyIdBookingPaymentStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
