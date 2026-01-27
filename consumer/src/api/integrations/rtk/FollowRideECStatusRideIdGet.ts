// open EmergencyContactsStatusRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeEmergencyContactsStatusRes } from '../../../readOnly/api/types/EmergencyContactsStatusRes.bs';
import { emergencyContactsStatusRes } from '../../../readOnly/api/types/EmergencyContactsStatusRes.gen';

export type followRideECStatusRideIdGetWithParams = {
    rideId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            followRideECStatusRideIdGet: build.query<emergencyContactsStatusRes, followRideECStatusRideIdGetWithParams>(
                {
                    query: ({ rideId }) => ({
                        url: (function () {
                            const url = '/followRide/ECStatus' + '/' + rideId + '/' + '' + '?';
                            return url;
                        })(),
                        method: 'GET',
                    }),
                    transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                        const res = decodeEmergencyContactsStatusRes(baseQueryReturnValue);
                        if (res.TAG === 'Error') {
                            throw new Error(res._0);
                        }
                        return res._0 as emergencyContactsStatusRes;
                    },
                    ...rtkExtraOptions,
                },
            ),
        }),
        overrideExisting: false,
    });

export const { useFollowRideECStatusRideIdGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
