import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePayoutHistory } from '@/readOnly/api/types/PayoutHistory.bs';
import { payoutHistory } from '@/readOnly/api/types/PayoutHistory.gen';

export type referralPayoutHistoryGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            referralPayoutHistoryGet: build.query<payoutHistory, referralPayoutHistoryGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/referralPayout/history' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePayoutHistory(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as payoutHistory;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useReferralPayoutHistoryGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
