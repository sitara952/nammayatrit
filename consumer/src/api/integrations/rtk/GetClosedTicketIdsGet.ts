import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetClosedTicketIdsRes } from '@/readOnly/api/types/GetClosedTicketIdsRes.bs';
import { getClosedTicketIdsRes } from '@/readOnly/api/types/GetClosedTicketIdsRes.gen';

export type getClosedTicketIdsGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            getClosedTicketIdsGet: build.query<getClosedTicketIdsRes, getClosedTicketIdsGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/getClosedTicketIds' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetClosedTicketIdsRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as getClosedTicketIdsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useGetClosedTicketIdsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
