// open PersonStatsRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePersonStatsRes } from '../../../readOnly/api/types/PersonStatsRes.bs';
import { personStatsRes } from '../../../readOnly/api/types/PersonStatsRes.gen';

export type personStatsGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            personStatsGet: build.query<personStatsRes, personStatsGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/personStats' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePersonStatsRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as personStatsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePersonStatsGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
