import { selectToken } from '../client/auth';
import { setEmergencyContacts } from '../client/user';
import { RootState } from '../store';
import { api } from './../api';

export const emergencyContactsApi = api.injectEndpoints({
    endpoints: build => ({
        emergencyContacts: build.query({
            query: () => ({
                url: 'profile/defaultEmergencyNumbers',
                method: 'GET',
            }),
            onQueryStarted: async (_arg, { queryFulfilled, dispatch, getState }) => {
                try {
                    const { data } = await queryFulfilled;
                    const emergencyContacts = data.defaultEmergencyNumbers;
                    const state = getState() as RootState;
                    const userToken = selectToken(state);
                    dispatch(setEmergencyContacts({ id: userToken, payload: emergencyContacts }));
                } catch (err) {
                    console.error('profile/defaultEmergencyNumbers api failed', err);
                }
            },
            merge: undefined,
            forceRefetch: undefined,
            onCacheEntryAdded: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useLazyEmergencyContactsQuery, useEmergencyContactsQuery } = emergencyContactsApi;
