// open UpcomingTripInfo
import { VehicleCategory_vehicleCategory } from '@/readOnly/api/types/Enums.gen';
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeUpcomingTripInfo } from '@/readOnly/api/types/UpcomingTripInfo.bs';
import { upcomingTripInfo } from '@/readOnly/api/types/UpcomingTripInfo.gen';

export type nextBusDetailsRouteCodeStopCodeGetWithParams = {
    routeCode: string;
    stopCode: string;
    vehicleType: VehicleCategory_vehicleCategory;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            nextBusDetailsRouteCodeStopCodeGet: build.query<
                upcomingTripInfo,
                nextBusDetailsRouteCodeStopCodeGetWithParams
            >({
                query: ({ routeCode, stopCode, vehicleType }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url =
                            '/nextVehicleDetails' +
                            '/' +
                            routeCode +
                            '/' +
                            '' +
                            stopCode +
                            '/' +
                            '' +
                            '?vehicleType="' +
                            vehicleType +
                            '"'; //manually changed
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

export const { useNextBusDetailsRouteCodeStopCodeGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
