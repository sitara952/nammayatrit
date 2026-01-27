// open FollowRideCustomerDetailsRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFollowRideCustomerDetailsRes } from '../../../readOnly/api/types/FollowRideCustomerDetailsRes.bs';
import { followRideCustomerDetailsRes } from '../../../readOnly/api/types/FollowRideCustomerDetailsRes.gen';

export type followRideRideIdCustomerDetailsGetWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            followRideRideIdCustomerDetailsGet: build.query<
                followRideCustomerDetailsRes,
                followRideRideIdCustomerDetailsGetWithParams
            >({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/followRide' + '/' + rideId + '/' + 'customerDetails' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFollowRideCustomerDetailsRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as followRideCustomerDetailsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFollowRideRideIdCustomerDetailsGetQuery, useLazyFollowRideRideIdCustomerDetailsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
