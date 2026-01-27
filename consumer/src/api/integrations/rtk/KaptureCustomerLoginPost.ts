import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { KaptureCustomerLoginTicketType_kaptureCustomerLoginTicketType } from '@/readOnly/api/types/Enums.gen';
import { decodeTicketKaptureResp } from '@/readOnly/api/types/TicketKaptureResp.bs';
import { ticketKaptureResp } from '@/readOnly/api/types/TicketKaptureResp.gen';

export type kaptureCustomerLoginPostWithParams = {
    ticketType: KaptureCustomerLoginTicketType_kaptureCustomerLoginTicketType;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            kaptureCustomerLoginPost: build.mutation<ticketKaptureResp, kaptureCustomerLoginPostWithParams>({
                query: ({ ticketType }) => ({
                    url: (function () {
                        // eslint-disable-next-line functional/no-let
                        let url = '/kaptureCustomerLogin' + '?';
                        url += 'ticketType=' + ticketType + '&';
                        return url;
                    })(),
                    method: 'POST',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTicketKaptureResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as ticketKaptureResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useKaptureCustomerLoginPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
