// open Enums
// open FRFSRouteAPIArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';

import {
    FrfsRoutesCity_frfsRoutesCity,
    FrfsRoutesVehicleType_frfsRoutesVehicleType,
} from '../../../readOnly/api/types/Enums.gen';
import { decodeFRFSRouteAPIArray } from '../../../readOnly/api/types/FRFSRouteAPIArray.bs';
import { fRFSRouteAPIArray } from '../../../readOnly/api/types/FRFSRouteAPIArray.gen';

export type frfsRoutesGetWithParams = {
    endStationCode: string | undefined;
    startStationCode: string | undefined;
    city: FrfsRoutesCity_frfsRoutesCity;
    vehicleType: FrfsRoutesVehicleType_frfsRoutesVehicleType;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsRoutesGet: build.query<fRFSRouteAPIArray, frfsRoutesGetWithParams>({
                query: ({ endStationCode, startStationCode, city, vehicleType }) => ({
                    url: (function () {
                        const url =
                            '/frfs/routes' +
                            '?' +
                            (endStationCode ? 'endStationCode=' + endStationCode + '&' : '') +
                            (startStationCode ? 'startStationCode=' + startStationCode + '&' : '') +
                            'city=' +
                            city +
                            '&' +
                            'vehicleType=' +
                            vehicleType +
                            '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSRouteAPIArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSRouteAPIArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsRoutesGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
