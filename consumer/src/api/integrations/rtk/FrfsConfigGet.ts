// open Enums
// open FRFSConfigAPIRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { FrfsConfigCity_frfsConfigCity } from '../../../readOnly/api/types/Enums.gen';
import { decodeFRFSConfigAPIRes } from '../../../readOnly/api/types/FRFSConfigAPIRes.bs';
import { fRFSConfigAPIRes } from '../../../readOnly/api/types/FRFSConfigAPIRes.gen';

export type frfsConfigGetWithParams = {
    city: FrfsConfigCity_frfsConfigCity;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsConfigGet: build.query<fRFSConfigAPIRes, frfsConfigGetWithParams>({
                query: ({ city }) => ({
                    url: (function () {
                        const url = '/frfs/config' + '?' + 'city=' + city + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSConfigAPIRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSConfigAPIRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsConfigGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
