import { selectToken } from '../client/auth';
import { setFollowers } from '../client/user';
import { RootState } from '../store';
import { api } from './../api';

export const followRideApi = api.injectEndpoints({
    endpoints: build => ({
        followRide: build.mutation({
            query: () => ({
                url: '/follow/ride',
                method: 'GET',
            }),
            onQueryStarted: async (_arg, { queryFulfilled, dispatch, getState }) => {
                try {
                    const { data } = await queryFulfilled;
                    const followRides = data;
                    const state = getState() as RootState;
                    const userToken = selectToken(state);
                    dispatch(setFollowers({ id: userToken, payload: followRides }));
                } catch (err) {
                    console.error('follow/ride api failed', err);
                }
            },
            onCacheEntryAdded: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useFollowRideMutation } = followRideApi;
