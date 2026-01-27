// open RiderLocationRequest
// open RiderLocationResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeRiderLocationResponse } from '@/readOnly/api/types/RiderLocationResponse.bs';
import { riderLocationResponse } from '@/readOnly/api/types/RiderLocationResponse.gen';
import { riderLocationRequest } from '@/readOnly/api/types/RiderLocationRequest.gen';

export type identifyNearByBusPostWithParams = {
    body: riderLocationRequest;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            identifyNearByBusPost: build.mutation<riderLocationResponse, identifyNearByBusPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/identifyNearByBus' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeRiderLocationResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as riderLocationResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useIdentifyNearByBusPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
