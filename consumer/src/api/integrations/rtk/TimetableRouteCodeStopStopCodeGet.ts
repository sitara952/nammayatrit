// open Enums
// open TimetableResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeTimetableResponse } from '@/readOnly/api/types/TimetableResponse.bs';
import { timetableResponse } from '@/readOnly/api/types/TimetableResponse.gen';
import { VehicleCategory_vehicleCategory } from '../../../readOnly/api/types/Enums.gen';

export type timetableRouteCodeStopStopCodeGetWithParams = {
    routeCode: string;
    stopCode: string;
    destinationStopCode: string | undefined;
    vehicleType: VehicleCategory_vehicleCategory | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            timetableRouteCodeStopStopCodeGet: build.query<
                timetableResponse,
                timetableRouteCodeStopStopCodeGetWithParams
            >({
                query: ({ routeCode, stopCode, vehicleType, destinationStopCode }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/timetable' + '/' + routeCode + '/' + 'stop' + '/' + stopCode + '/' + '' + '?';
                        url += vehicleType ? 'vehicleType=' + JSON.stringify(vehicleType) + '&' : '';
                        url += destinationStopCode ? 'toCode=' + destinationStopCode + '&' : '';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTimetableResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as timetableResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTimetableRouteCodeStopStopCodeGetQuery, useLazyTimetableRouteCodeStopStopCodeGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
