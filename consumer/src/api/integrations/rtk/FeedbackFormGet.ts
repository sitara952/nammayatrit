import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFeedbackFormList } from '../../../readOnly/api/types/FeedbackFormList.bs';
import { feedbackFormList } from '../../../readOnly/api/types/FeedbackFormList.gen';

export type feedbackFormGetWithParams = void;

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            feedbackFormGet: build.query<feedbackFormList, feedbackFormGetWithParams>({
                query: () => ({
                    url: '/feedback/form',
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: unknown, _meta, _arg): feedbackFormList {
                    const res = decodeFeedbackFormList(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

// usage: useFeedbackFormGetQuery();
export const { useFeedbackFormGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
