// open Enums
// open TrackingResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { TrackVehiclesPlatformType, TrackVehiclesVehicleType } from '@/readOnly/api/types/Enums.bs';
import {
    TrackVehiclesPlatformType_trackVehiclesPlatformType,
    TrackVehiclesVehicleType_trackVehiclesVehicleType,
} from '@/readOnly/api/types/Enums.gen';
import { decodeTrackingResp } from '@/readOnly/api/types/TrackingResp.bs';
import { trackingResp } from '@/readOnly/api/types/TrackingResp.gen';

export type trackVehiclesGetWithParams = {
    routeCode: string;
    platformType: TrackVehiclesPlatformType_trackVehiclesPlatformType | undefined;
    vehicleType: TrackVehiclesVehicleType_trackVehiclesVehicleType | undefined;
    currentLat: number | undefined;
    currentLon: number | undefined;
    selectedSourceStopCode: string | undefined;
    selectedDestinationStopCode: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            trackVehiclesGet: build.query<trackingResp, trackVehiclesGetWithParams>({
                query: ({
                    routeCode,
                    platformType,
                    vehicleType,
                    currentLat,
                    currentLon,
                    selectedSourceStopCode,
                    selectedDestinationStopCode,
                }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/track' + '/' + routeCode + '/vehicles' + '?';
                        url += platformType
                            ? 'platformType=' +
                              JSON.stringify(
                                  TrackVehiclesPlatformType.trackVehiclesPlatformTypeToString(platformType),
                              ) +
                              '&'
                            : '';
                        url += vehicleType
                            ? 'vehicleType=' +
                              JSON.stringify(TrackVehiclesVehicleType.trackVehiclesVehicleTypeToString(vehicleType)) +
                              '&'
                            : '';
                        url += currentLat !== undefined ? 'currentLat=' + currentLat + '&' : '';
                        url += currentLon !== undefined ? 'currentLon=' + currentLon + '&' : '';
                        url +=
                            selectedSourceStopCode !== undefined
                                ? 'selectedSourceStopCode=' + selectedSourceStopCode + '&'
                                : '';
                        url +=
                            selectedDestinationStopCode !== undefined
                                ? 'selectedDestinationStopCode=' + selectedDestinationStopCode + '&'
                                : '';
                        return url;
                    })(),
                    method: 'GET',
                }),

                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTrackingResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as trackingResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useTrackVehiclesGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
