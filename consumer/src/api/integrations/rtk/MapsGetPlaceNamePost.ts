// open GetPlaceNameReq
// open PlaceNameArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePlaceNameArray } from '../../../readOnly/api/types/PlaceNameArray.bs';
import { placeNameArray } from '../../../readOnly/api/types/PlaceNameArray.gen';
import { getPlaceNameReq } from '../../../readOnly/api/types/GetPlaceNameReq.gen';

export type mapsGetPlaceNamePostWithParams = {
    body: getPlaceNameReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            mapsGetPlaceNamePost: build.mutation<placeNameArray, mapsGetPlaceNamePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/maps/getPlaceName' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePlaceNameArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as placeNameArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMapsGetPlaceNamePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
