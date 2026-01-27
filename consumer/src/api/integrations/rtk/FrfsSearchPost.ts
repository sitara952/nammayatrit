/* eslint-disable myCustomPlugin/no-any-in-modified-files */
/* eslint-disable myCustomPlugin/no-as-in-modified-files */
// open Enums
// open FRFSSearchAPIReq
// open FRFSSearchAPIRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { FrfsSearchVehicleType_frfsSearchVehicleType } from '../../../readOnly/api/types/Enums.gen';
import { decodeFRFSSearchAPIRes } from '../../../readOnly/api/types/FRFSSearchAPIRes.bs';
import { fRFSSearchAPIRes } from '../../../readOnly/api/types/FRFSSearchAPIRes.gen';
import { fRFSSearchAPIReq } from '../../../readOnly/api/types/FRFSSearchAPIReq.gen';

export type frfsSearchPostWithParams = {
    vehicleType: FrfsSearchVehicleType_frfsSearchVehicleType;
    body: fRFSSearchAPIReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsSearchPost: build.mutation<fRFSSearchAPIRes, frfsSearchPostWithParams>({
                query: ({ vehicleType, body }) => ({
                    url: (function () {
                        const url = '/frfs/search' + '?' + 'vehicleType=' + JSON.stringify(vehicleType) + '&';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSSearchAPIRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSSearchAPIRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsSearchPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
