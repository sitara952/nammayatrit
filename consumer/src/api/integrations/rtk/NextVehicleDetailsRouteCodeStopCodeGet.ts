// open Enums
// open UpcomingTripInfo
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { NextVehicleDetailsRouteCodeStopCodeVehicleType } from '@/readOnly/api/types/Enums.bs';
import { NextVehicleDetailsRouteCodeStopCodeVehicleType_nextVehicleDetailsRouteCodeStopCodeVehicleType } from '@/readOnly/api/types/Enums.gen';
import { decodeUpcomingTripInfo } from '@/readOnly/api/types/UpcomingTripInfo.bs';
import { upcomingTripInfo } from '@/readOnly/api/types/UpcomingTripInfo.gen';

export type nextVehicleDetailsRouteCodeStopCodeGetWithParams = {
    routeCode: string;
    stopCode: string;
    vehicleType:
        | NextVehicleDetailsRouteCodeStopCodeVehicleType_nextVehicleDetailsRouteCodeStopCodeVehicleType
        | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            nextVehicleDetailsRouteCodeStopCodeGet: build.query<
                upcomingTripInfo,
                nextVehicleDetailsRouteCodeStopCodeGetWithParams
            >({
                query: ({ routeCode, stopCode, vehicleType }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/nextVehicleDetails' + '/' + routeCode + '/' + stopCode + '/' + '' + '?';
                        url += vehicleType
                            ? 'vehicleType=' +
                              JSON.stringify(
                                  NextVehicleDetailsRouteCodeStopCodeVehicleType.nextVehicleDetailsRouteCodeStopCodeVehicleTypeToString(
                                      vehicleType,
                                  ),
                              ) +
                              '&'
                            : '';
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeUpcomingTripInfo(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as upcomingTripInfo;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useNextVehicleDetailsRouteCodeStopCodeGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
