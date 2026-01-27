// open SosDetailsRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSosDetailsRes } from '../../../readOnly/api/types/SosDetailsRes.bs';
import { sosDetailsRes } from '../../../readOnly/api/types/SosDetailsRes.gen';

export type sosGetDetailsRideIdGetWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosGetDetailsRideIdGet: build.query<sosDetailsRes, sosGetDetailsRideIdGetWithParams>({
                query: ({ rideId }) => ({
                    url: (function () {
                        const url = '/sos/getDetails' + '/' + rideId + '/' + '' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeSosDetailsRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as sosDetailsRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useSosGetDetailsRideIdGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
