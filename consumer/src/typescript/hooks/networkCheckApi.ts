import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const networkApi = createApi({
    reducerPath: 'networkApi',
    baseQuery: fetchBaseQuery({
        baseUrl: 'https://www.google.com',
        timeout: 750,
    }),
    endpoints: build => ({
        networkCheck: build.query<void, void>({
            query: () => ({
                url: '/generate_204',
                method: 'GET',
            }),
            keepUnusedDataFor: 0,
            transformErrorResponse: () => {
                return undefined;
            },
        }),
    }),
});

export const { useLazyNetworkCheckQuery } = networkApi;
