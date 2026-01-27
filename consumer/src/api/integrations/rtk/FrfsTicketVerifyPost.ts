// open APISuccess
// open Enums
// open FRFSTicketVerifyReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import {
    FrfsTicketVerifyCity,
    FrfsTicketVerifyPlatformType,
    FrfsTicketVerifyVehicleType,
} from '@/readOnly/api/types/Enums.bs';
import {
    FrfsTicketVerifyCity_frfsTicketVerifyCity,
    FrfsTicketVerifyPlatformType_frfsTicketVerifyPlatformType,
    FrfsTicketVerifyVehicleType_frfsTicketVerifyVehicleType,
} from '@/readOnly/api/types/Enums.gen';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { fRFSTicketVerifyReq } from '@/readOnly/api/types/FRFSTicketVerifyReq.gen';

export type frfsTicketVerifyPostWithParams = {
    platformType: FrfsTicketVerifyPlatformType_frfsTicketVerifyPlatformType | undefined;
    city: FrfsTicketVerifyCity_frfsTicketVerifyCity;
    vehicleType: FrfsTicketVerifyVehicleType_frfsTicketVerifyVehicleType;
    body: fRFSTicketVerifyReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsTicketVerifyPost: build.mutation<aPISuccess, frfsTicketVerifyPostWithParams>({
                query: ({ platformType, city, vehicleType, body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/frfs/ticket/verify' + '?';
                        url += platformType
                            ? 'platformType=' +
                              JSON.stringify(
                                  FrfsTicketVerifyPlatformType.frfsTicketVerifyPlatformTypeToString(platformType),
                              ) +
                              '&'
                            : '';
                        url += 'city=' + JSON.stringify(FrfsTicketVerifyCity.frfsTicketVerifyCityToString(city)) + '&';
                        url +=
                            'vehicleType=' +
                            JSON.stringify(
                                FrfsTicketVerifyVehicleType.frfsTicketVerifyVehicleTypeToString(vehicleType),
                            ) +
                            '&';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsTicketVerifyPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
