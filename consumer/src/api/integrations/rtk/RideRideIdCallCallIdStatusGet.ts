// open CallStatusAPIEntity
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeCallStatusAPIEntity } from '../../../readOnly/api/types/CallStatusAPIEntity.bs';
import { callStatusAPIEntity } from '../../../readOnly/api/types/CallStatusAPIEntity.gen';

export type rideRideIdCallCallIdStatusGetWithParams = {
    rideId: string;
    callId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideRideIdCallCallIdStatusGet: build.query<callStatusAPIEntity, rideRideIdCallCallIdStatusGetWithParams>({
                query: ({ rideId, callId }) => ({
                    url: (function () {
                        const url = '/ride' + '/' + rideId + '/' + 'call' + '/' + callId + '/' + 'status' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeCallStatusAPIEntity(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as callStatusAPIEntity;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideRideIdCallCallIdStatusGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
