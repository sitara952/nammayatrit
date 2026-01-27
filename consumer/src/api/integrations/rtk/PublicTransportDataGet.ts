// open Enums
// open PublicTransportData
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { PublicTransportDataCity, PublicTransportDataVehicleType } from '@/readOnly/api/types/Enums.bs';
import {
    PublicTransportDataCity_publicTransportDataCity,
    PublicTransportDataVehicleType_publicTransportDataVehicleType,
} from '@/readOnly/api/types/Enums.gen';
import { decodePublicTransportData } from '@/readOnly/api/types/PublicTransportData.bs';
import { publicTransportData } from '@/readOnly/api/types/PublicTransportData.gen';

export type publicTransportDataGetWithParams = {
    city: PublicTransportDataCity_publicTransportDataCity | undefined;
    publicTransportConfigVersion: string | undefined;
    vehicleNumber: string | undefined;
    vehicleType: PublicTransportDataVehicleType_publicTransportDataVehicleType | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            publicTransportDataGet: build.query<publicTransportData, publicTransportDataGetWithParams>({
                query: ({ city, publicTransportConfigVersion, vehicleNumber, vehicleType }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/publicTransport/data' + '?';
                        url += city
                            ? 'city=' +
                              JSON.stringify(PublicTransportDataCity.publicTransportDataCityToString(city)) +
                              '&'
                            : '';
                        url += publicTransportConfigVersion
                            ? 'publicTransportConfigVersion=' + publicTransportConfigVersion + '&'
                            : '';
                        url += vehicleNumber ? 'vehicleNumber=' + vehicleNumber + '&' : '';
                        url += vehicleType
                            ? 'vehicleType=' +
                              JSON.stringify(
                                  PublicTransportDataVehicleType.publicTransportDataVehicleTypeToString(vehicleType),
                              ) +
                              '&'
                            : '';
                        url += 'enableSwitchRoute=true';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue, _meta, _arg) {
                    const res = decodePublicTransportData(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as publicTransportData;
                },
                // Cache lifelong - data will be invalidated only when explicitly triggered
                providesTags: ['PublicTransportData'],
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePublicTransportDataGetQuery, useLazyPublicTransportDataGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: 0,
});

//
