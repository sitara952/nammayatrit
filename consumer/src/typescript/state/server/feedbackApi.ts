import { api } from './../api';

export const feedbackApi = api.injectEndpoints({
    endpoints: build => ({
        rateRide: build.mutation({
            query: request => ({
                url: 'feedback/rateRide',
                method: 'POST',
                body: request,
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        submitFeedback: build.mutation({
            query: request => ({
                url: 'feedback/submit',
                method: 'POST',
                body: request,
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useRateRideMutation, useSubmitFeedbackMutation } = feedbackApi;
