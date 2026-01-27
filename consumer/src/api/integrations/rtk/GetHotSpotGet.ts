// open HotSpotResponse
// open LatLong
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeHotSpotResponse } from '../../../readOnly/api/types/HotSpotResponse.bs';
import { hotSpotResponse } from '../../../readOnly/api/types/HotSpotResponse.gen';
import { latLong } from '../../../readOnly/api/types/LatLong.gen';

export type getHotSpotGetWithParams = {
    body: latLong;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            getHotSpotGet: build.query<hotSpotResponse, getHotSpotGetWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/getHotSpot' + '?';
                        return url;
                    })(),
                    method: 'GET',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeHotSpotResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as hotSpotResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useGetHotSpotGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
