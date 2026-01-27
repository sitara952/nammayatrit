// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type issueIssueIdDeleteDeleteWithParams = {
    issueId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueIssueIdDeleteDelete: build.mutation<aPISuccess, issueIssueIdDeleteDeleteWithParams>({
                query: ({ issueId }) => ({
                    url: (function () {
                        const url = '/issue' + '/' + issueId + '/' + 'delete' + '?';
                        return url;
                    })(),
                    method: 'DELETE',
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

export const { useIssueIssueIdDeleteDeleteMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
