import { decodeGetPersonFlowStatusRes } from '@/readOnly/api/types/GetPersonFlowStatusRes.bs';
import { api } from './../api';

export type FlowStatusReq = {
    isPolling: boolean | undefined;
    checkForActiveBooking: boolean | undefined;
};

export const flowStatusApi = api.injectEndpoints({
    endpoints: build => ({
        flowStatus: build.query({
            keepUnusedDataFor: 0,
            query: request => {
                const queryParams = new URLSearchParams();
                request.isPolling !== undefined && queryParams.append('isPolling', request.isPolling.toString());
                request.checkForActiveBooking !== undefined &&
                    queryParams.append('checkForActiveBooking', request.checkForActiveBooking.toString());
                const url = `/frontend/flowStatus?${queryParams.toString()}`;
                return {
                    url,
                    method: 'GET',
                };
            },
            transformResponse(baseQueryReturnValue, _meta, _arg) {
                return decodeGetPersonFlowStatusRes(baseQueryReturnValue);
            },
        }),
        skipFeedback: build.mutation({
            query: () => ({
                url: 'frontend/notifyEvent',
                method: 'POST',
                body: { event: 'RATE_DRIVER_SKIPPED' },
            }),
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});

export const { useFlowStatusQuery, useLazyFlowStatusQuery, useSkipFeedbackMutation } = flowStatusApi;
