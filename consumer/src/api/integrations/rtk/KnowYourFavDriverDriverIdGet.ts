// open DriverProfileResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeDriverProfileResponse } from '../../../readOnly/api/types/DriverProfileResponse.bs';
import { driverProfileResponse } from '../../../readOnly/api/types/DriverProfileResponse.gen';

export type knowYourFavDriverDriverIdGetWithParams = {
    driverId: string;
    isImages: boolean | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            knowYourFavDriverDriverIdGet: build.query<driverProfileResponse, knowYourFavDriverDriverIdGetWithParams>({
                query: ({ driverId, isImages }) => ({
                    url: (function () {
                        const url =
                            '/knowYourFavDriver' +
                            '/' +
                            driverId +
                            '/' +
                            '' +
                            '?' +
                            (isImages ? 'isImages=' + isImages + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
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

export const { useKnowYourFavDriverDriverIdGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
