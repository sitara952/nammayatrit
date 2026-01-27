import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetAllActiveTicketsRes } from '@/readOnly/api/types/GetAllActiveTicketsRes.bs';
import { getAllActiveTicketsRes } from '@/readOnly/api/types/GetAllActiveTicketsRes.gen';

export type getAllActiveTicketsGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            getAllActiveTicketsGet: build.query<getAllActiveTicketsRes, getAllActiveTicketsGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/getAllActiveTickets' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetAllActiveTicketsRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as getAllActiveTicketsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useGetAllActiveTicketsGetQuery, useLazyGetAllActiveTicketsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
