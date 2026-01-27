import { api } from './../api';
import { decodeQuotesResultResponse } from '../../../readOnly/api/types/QuotesResultResponse.bs';
import { quotesResultResponse } from '../../../readOnly/api/types/QuotesResultResponse.gen';
import { dSelectReq } from '../../../readOnly/api/types/DSelectReq.gen';
import { createBookingId, setBookingId } from '../client/user';
import { RootState } from '../store';
import { selectToken } from '../client/auth';

export const searchApi = api.injectEndpoints({
    endpoints: build => ({
        estimateResults: build.query({
            keepUnusedDataFor: 0,
            query: estimateId => ({
                url: `/estimate/${estimateId}/results`,
            }),
            transformResponse(baseQueryReturnValue, _meta, _arg) {
                const resp: { TAG: string; _0: quotesResultResponse } =
                    decodeQuotesResultResponse(baseQueryReturnValue);
                return resp;
            },
            onQueryStarted: async (_estimateId, { queryFulfilled, dispatch, getState }) => {
                const { data } = await queryFulfilled;
                const estimateResults = data._0 as quotesResultResponse;
                const state = getState() as RootState;
                const userToken = selectToken(state);
                if (estimateResults.bookingIdV2) {
                    const bookingId = createBookingId(estimateResults.bookingIdV2);
                    dispatch(setBookingId({ id: userToken, payload: bookingId })); // Token is added by middleware
                }
            },
            onCacheEntryAdded: undefined,
            merge: undefined,
            forceRefetch: undefined,
        }),
        cancelEstimate: build.mutation({
            query: estimateId => ({
                url: `/estimate/${estimateId}/cancel`,
                method: 'POST',
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
        postSelect2: build.mutation({
            query: ({ estimateId, body }: { estimateId: string; body: dSelectReq }) => ({
                url: `/estimate/${estimateId}/select2`,
                method: 'POST',
                body: body,
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useEstimateResultsQuery, usePostSelect2Mutation, useCancelEstimateMutation } = searchApi;
