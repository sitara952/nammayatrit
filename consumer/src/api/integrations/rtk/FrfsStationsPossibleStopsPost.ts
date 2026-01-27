// open Enums
// open FRFSPossibleStopsReq
// open FRFSStationAPIArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { FrfsAutocompletePlatformType, FrfsStationsVehicleType } from '@/readOnly/api/types/Enums.bs';

import {
    FrfsAutocompletePlatformType_frfsAutocompletePlatformType,
    FrfsStationsCity_frfsStationsCity,
    FrfsStationsVehicleType_frfsStationsVehicleType,
} from '../../../readOnly/api/types/Enums.gen';
import { decodeFRFSStationAPIArray } from '@/readOnly/api/types/FRFSStationAPIArray.bs';
import { fRFSStationAPIArray } from '@/readOnly/api/types/FRFSStationAPIArray.gen';
import { fRFSPossibleStopsReq } from '@/readOnly/api/types/FRFSPossibleStopsReq.gen';

export type frfsStationsPossibleStopsPostWithParams = {
    city: FrfsStationsCity_frfsStationsCity | undefined;
    platformType: FrfsAutocompletePlatformType_frfsAutocompletePlatformType | undefined;
    vehicleType: FrfsStationsVehicleType_frfsStationsVehicleType;
    body: fRFSPossibleStopsReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsStationsPossibleStopsPost: build.mutation<fRFSStationAPIArray, frfsStationsPossibleStopsPostWithParams>(
                {
                    query: ({ city, platformType, vehicleType, body }) => ({
                        url: (function () {
                            /* eslint-disable functional/no-let */

                            let url = '/frfs/stations/possibleStops' + '?';
                            url += city ? 'city=' + city + '&' : '';
                            url += platformType
                                ? 'platformType=' +
                                  JSON.stringify(
                                      FrfsAutocompletePlatformType.frfsAutocompletePlatformTypeToString(platformType),
                                  ) +
                                  '&'
                                : '';
                            url +=
                                'vehicleType=' +
                                JSON.stringify(FrfsStationsVehicleType.frfsStationsVehicleTypeToString(vehicleType)) +
                                '&';
                            return url;
                        })(),
                        method: 'POST',
                        body: body,
                    }),
                    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                    transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                        const res = decodeFRFSStationAPIArray(baseQueryReturnValue);
                        if (res.TAG === 'Error') {
                            throw new Error(res._0);
                        }
                        // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                        return res._0 as fRFSStationAPIArray;
                    },
                    ...rtkExtraOptions,
                },
            ),
        }),
        overrideExisting: false,
    });

export const { useFrfsStationsPossibleStopsPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
