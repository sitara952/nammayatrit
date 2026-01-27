/* eslint-disable myCustomPlugin/no-as-in-modified-files */
/* eslint-disable myCustomPlugin/no-any-in-modified-files */
// open APISuccess
// open MetricCounterReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { metricCounterReq } from '@/readOnly/api/types/MetricCounterReq.gen';

export type metricsIncrementPostWithParams = {
    body: metricCounterReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            metricsIncrementPost: build.mutation<aPISuccess, metricsIncrementPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/metrics/increment' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMetricsIncrementPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
