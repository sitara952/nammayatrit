// open NearbyDriverReq
// open NearbyDriverRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeNearbyDriverRes } from '@/readOnly/api/types/NearbyDriverRes.bs';
import { nearbyDriverRes } from '@/readOnly/api/types/NearbyDriverRes.gen';
import { nearbyDriverReq } from '@/readOnly/api/types/NearbyDriverReq.gen';

export type nearbyDriversPostWithParams = {
    body: nearbyDriverReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            nearbyDriversPost: build.mutation<nearbyDriverRes, nearbyDriversPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/nearbyDrivers' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeNearbyDriverRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as nearbyDriverRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useNearbyDriversPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
