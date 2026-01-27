// open APISuccess
// open IssueUpdateReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { issueUpdateReq } from '../../../readOnly/api/types/IssueUpdateReq.gen';

export type issueIssueIdOptionPutWithParams = {
    issueId: string;
    body: issueUpdateReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueIssueIdOptionPut: build.mutation<aPISuccess, issueIssueIdOptionPutWithParams>({
                query: ({ issueId, body }) => ({
                    url: (function () {
                        const url = '/issue' + '/' + issueId + '/' + 'option' + '?';
                        return url;
                    })(),
                    method: 'PUT',
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

export const { useIssueIssueIdOptionPutMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
