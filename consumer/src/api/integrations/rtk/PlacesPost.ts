// open PlacesRequest
// open PlacesResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePlacesResponse } from '@/readOnly/api/types/PlacesResponse.bs';
import { placesResponse } from '@/readOnly/api/types/PlacesResponse.gen';
import { placesRequest } from '@/readOnly/api/types/PlacesRequest.gen';

export type placesPostWithParams = {
    body: placesRequest;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            placesPost: build.mutation<placesResponse, placesPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/places' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePlacesResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as placesResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePlacesPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
