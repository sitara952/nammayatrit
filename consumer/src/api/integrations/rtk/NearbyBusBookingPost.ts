// open NearbyBusesRequest
// open NearbyBusesResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeNearbyBusesResponse } from '@/readOnly/api/types/NearbyBusesResponse.bs';
import { nearbyBusesResponse } from '@/readOnly/api/types/NearbyBusesResponse.gen';
import { nearbyBusesRequest } from '@/readOnly/api/types/NearbyBusesRequest.gen';

export type nearbyBusBookingPostWithParams = {
    body: nearbyBusesRequest;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            nearbyBusBookingPost: build.mutation<nearbyBusesResponse, nearbyBusBookingPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/nearbyBusBooking' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: nearbyBusesResponse, _meta, _arg) {
                    const res = decodeNearbyBusesResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as nearbyBusesResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useNearbyBusBookingPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
