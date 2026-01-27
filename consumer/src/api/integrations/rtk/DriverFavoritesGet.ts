// open FavouriteDriverRespArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFavouriteDriverRespArray } from '../../../readOnly/api/types/FavouriteDriverRespArray.bs';
import { favouriteDriverRespArray } from '../../../readOnly/api/types/FavouriteDriverRespArray.gen';

export type driverFavoritesGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            driverFavoritesGet: build.query<favouriteDriverRespArray, driverFavoritesGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/driver/favorites' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFavouriteDriverRespArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as favouriteDriverRespArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useDriverFavoritesGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
