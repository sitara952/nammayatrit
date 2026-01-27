import { api } from './../api';

export const authApi = api.injectEndpoints({
    endpoints: build => ({
        auth: build.mutation({
            query: req => ({
                url: '/auth',
                method: 'POST',
                body: req,
                headers: req.senderHash ? { 'x-sender-hash': req.senderHash } : {},
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        authVerify: build.mutation({
            query: ({ authId, data }) => ({
                url: `/auth/${authId}/verify`,
                method: 'POST',
                body: data,
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        authResendOtp: build.mutation({
            query: ({ authId, senderHash }) => ({
                url: `/auth/otp/${authId}/resend`,
                method: 'POST',
                headers: senderHash
                    ? {
                          'x-sender-hash': senderHash,
                      }
                    : {},
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        logOut: build.mutation({
            query: () => ({
                url: `/auth/logout`,
                method: 'POST',
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useAuthMutation, useAuthVerifyMutation, useAuthResendOtpMutation, useLogOutMutation } = authApi;
