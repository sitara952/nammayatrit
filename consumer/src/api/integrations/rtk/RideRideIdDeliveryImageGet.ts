import { api, RtkExtraOptions } from '../../../typescript/state/api';

export type rideRideIdDeliveryImageGetWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideRideIdDeliveryImageGet: build.query<string, rideRideIdDeliveryImageGetWithParams>({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/ride' + '/' + rideId + '/' + 'deliveryImage' + '?';
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

export const { useRideRideIdDeliveryImageGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
