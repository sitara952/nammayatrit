// open Enums
// open FRFSStationAPIArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';

import {
    FrfsAutocompletePlatformType_frfsAutocompletePlatformType,
    FrfsStationsCity_frfsStationsCity,
    FrfsStationsVehicleType_frfsStationsVehicleType,
} from '../../../readOnly/api/types/Enums.gen';
import { decodeFRFSStationAPIArray } from '../../../readOnly/api/types/FRFSStationAPIArray.bs';
import { fRFSStationAPIArray } from '../../../readOnly/api/types/FRFSStationAPIArray.gen';
import { FrfsAutocompletePlatformType, FrfsStationsVehicleType } from '@/readOnly/api/types/Enums.bs';

export type frfsStationsGetWithParams = {
    city: FrfsStationsCity_frfsStationsCity | undefined;
    startStationCode: string | undefined;
    vehicleType: FrfsStationsVehicleType_frfsStationsVehicleType;
    minimalData: boolean;
    platformType: FrfsAutocompletePlatformType_frfsAutocompletePlatformType | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsStationsGet: build.query<fRFSStationAPIArray, frfsStationsGetWithParams>({
                query: ({ city, startStationCode, vehicleType, minimalData, platformType }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        let url = '/frfs/stations' + '?';
                        url += vehicleType
                            ? 'vehicleType=' +
                              JSON.stringify(FrfsStationsVehicleType.frfsStationsVehicleTypeToString(vehicleType)) +
                              '&'
                            : '';
                        url += city ? 'city=' + city + '&' : '';
                        url += startStationCode ? 'startStationCode=' + startStationCode + '&' : '';
                        url += platformType
                            ? 'platformType=' +
                              JSON.stringify(
                                  FrfsAutocompletePlatformType.frfsAutocompletePlatformTypeToString(platformType),
                              ) +
                              '&'
                            : '';
                        url += 'minimalData=' + minimalData;
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSStationAPIArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSStationAPIArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsStationsGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
