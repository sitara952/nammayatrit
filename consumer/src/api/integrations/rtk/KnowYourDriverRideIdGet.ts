// open DriverProfileResponse

import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeDriverProfileResponse } from '../../../readOnly/api/types/DriverProfileResponse.bs';
import { driverProfileResponse } from '../../../readOnly/api/types/DriverProfileResponse.gen';

export type knowYourDriverRideIdGetWithParams = {
    rideId: string;
    isImages: boolean | undefined;
};

export const driverProfileTags = {
    driverProfile: (rideId: string) => ({ type: 'RideBookingList' as const, id: rideId }),
} as const;
export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            knowYourDriverRideIdGet: build.query<driverProfileResponse, knowYourDriverRideIdGetWithParams>({
                query: ({ rideId, isImages }) => ({
                    url: (function () {
                        const url = '/knowYourDriver' + '/' + rideId + '/' + '' + '?';
                        return url + (isImages ? 'isImages=' + isImages + '&' : '');
                    })(),
                    method: 'GET',
                }),
                providesTags: (result, _error, arg) =>
                    result?.response ? [driverProfileTags.driverProfile(arg.rideId)] : [],
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeDriverProfileResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as driverProfileResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useKnowYourDriverRideIdGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: 3600 });
//
