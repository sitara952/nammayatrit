// open Enums
// open FRFSRouteAPI
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { FrfsRouteRouteCodePlatformType, FrfsRouteRouteCodeVehicleType } from '@/readOnly/api/types/Enums.bs';
import {
    FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity,
    FrfsRouteRouteCodePlatformType_frfsRouteRouteCodePlatformType,
    FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType,
} from '@/readOnly/api/types/Enums.gen';
import { decodeFRFSRouteAPI } from '@/readOnly/api/types/FRFSRouteAPI.bs';
import { fRFSRouteAPI } from '@/readOnly/api/types/FRFSRouteAPI.gen';
import { concat } from 'lodash';
export type frfsRouteRouteCodeGetWithParams = {
    routeCode: string;
    platformType: FrfsRouteRouteCodePlatformType_frfsRouteRouteCodePlatformType | undefined;
    city: FrfsRouteRouteCodeCity_frfsRouteRouteCodeCity;
    vehicleType: FrfsRouteRouteCodeVehicleType_frfsRouteRouteCodeVehicleType;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsRouteRouteCodeGet: build.mutation<fRFSRouteAPI, frfsRouteRouteCodeGetWithParams>({
                query: ({ routeCode, platformType, city, vehicleType }) => {
                    const url = (function () {
                        const url =
                            '/frfs/route' +
                            '/' +
                            routeCode +
                            '/' +
                            '' +
                            '?' +
                            concat('city=' + city + '&') +
                            (platformType
                                ? 'platformType=' +
                                  JSON.stringify(
                                      FrfsRouteRouteCodePlatformType.frfsRouteRouteCodePlatformTypeToString(
                                          platformType,
                                      ),
                                  ) +
                                  '&'
                                : '') +
                            'vehicleType=' +
                            JSON.stringify(
                                FrfsRouteRouteCodeVehicleType.frfsRouteRouteCodeVehicleTypeToString(vehicleType),
                            ) +
                            '&';
                        return url;
                    })();

                    return {
                        url,
                        keepUnusedDataFor: 60 * 60,
                        method: 'GET',
                    };
                },

                transformResponse(baseQueryReturnValue: unknown, _meta, _arg) {
                    const res = decodeFRFSRouteAPI(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }

                    return res._0;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsRouteRouteCodeGetMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
