import { api } from './../api';
import { decodeEmergencySettingsRes } from '../../../readOnly/api/types/EmergencySettingsRes.bs';
import { decodeEmergencyContactsStatusRes } from '../../../readOnly/api/types/EmergencyContactsStatusRes.bs';

export const emergencyApi = api.injectEndpoints({
    endpoints: build => ({
        getEmergencySettings: build.query({
            query: () => ({
                url: `/profile/getEmergencySettings`,
            }),
            transformResponse(baseQueryReturnValue) {
                return decodeEmergencySettingsRes(baseQueryReturnValue);
            },
            merge: undefined,
            forceRefetch: undefined,
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        getFollowRide: build.query({
            query: rideId => ({
                url: `/followRide/ECStatus/${rideId}`,
            }),
            transformResponse(baseQueryReturnValue1) {
                return decodeEmergencyContactsStatusRes(baseQueryReturnValue1);
            },
            merge: undefined,
            forceRefetch: undefined,
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),

    overrideExisting: false,
});

export const { useGetEmergencySettingsQuery, useGetFollowRideQuery } = emergencyApi;
