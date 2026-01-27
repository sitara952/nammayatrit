// open GetClosedTicketDetailsRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetClosedTicketDetailsRes } from '@/readOnly/api/types/GetClosedTicketDetailsRes.bs';
import { getClosedTicketDetailsRes } from '@/readOnly/api/types/GetClosedTicketDetailsRes.gen';

export type getClosedTicketDetailsGetWithParams = {
    ticketId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            getClosedTicketDetailsGet: build.query<getClosedTicketDetailsRes, getClosedTicketDetailsGetWithParams>({
                query: ({ ticketId }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        let url = '/getClosedTicketDetails' + '?';
                        url += 'ticketId=' + ticketId + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetClosedTicketDetailsRes(baseQueryReturnValue);

                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as getClosedTicketDetailsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useGetClosedTicketDetailsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
