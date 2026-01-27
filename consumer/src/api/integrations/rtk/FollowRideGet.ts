// open FollowersArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFollowersArray } from '../../../readOnly/api/types/FollowersArray.bs';
import { followersArray } from '../../../readOnly/api/types/FollowersArray.gen';

export type followRideGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            followRideGet: build.query<followersArray, followRideGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/follow/ride' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFollowersArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as followersArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFollowRideGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
