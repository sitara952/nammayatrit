import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';

export type kaptureCloseTicketPostWithParams = {
    ticketId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            kaptureCloseTicketPost: build.mutation<aPISuccess, kaptureCloseTicketPostWithParams>({
                query: ({ ticketId }) => ({
                    url: (function () {
                        // eslint-disable-next-line functional/no-let
                        let url = '/kaptureCloseTicket' + '?';
                        url += 'ticketId=' + ticketId + '&';
                        return url;
                    })(),
                    method: 'POST',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useKaptureCloseTicketPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
