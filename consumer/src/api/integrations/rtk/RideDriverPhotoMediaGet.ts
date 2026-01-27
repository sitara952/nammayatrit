import { api, RtkExtraOptions } from '../../../typescript/state/api';

export type rideDriverPhotoMediaGetWithParams = {
    filePath: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideDriverPhotoMediaGet: build.query<string, rideDriverPhotoMediaGetWithParams>({
                query: ({ filePath }) => ({
                    url: (function () {
                        const url = '/ride/driver/photo/media' + '?' + 'filePath=' + filePath + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    return baseQueryReturnValue as string;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideDriverPhotoMediaGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
