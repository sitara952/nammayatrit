// open Enums
// open IssueStatusUpdateReq
// open IssueStatusUpdateRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeIssueStatusUpdateRes } from '../../../readOnly/api/types/IssueStatusUpdateRes.bs';
import { issueStatusUpdateRes } from '../../../readOnly/api/types/IssueStatusUpdateRes.gen';
import { issueStatusUpdateReq } from '../../../readOnly/api/types/IssueStatusUpdateReq.gen';

export type issueIssueIdUpdateStatusPutWithParams = {
    issueId: string;
    language: string | undefined;
    body: issueStatusUpdateReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueIssueIdUpdateStatusPut: build.mutation<issueStatusUpdateRes, issueIssueIdUpdateStatusPutWithParams>({
                query: ({ issueId, language, body }) => ({
                    url: (function () {
                        const url =
                            '/issue' +
                            '/' +
                            issueId +
                            '/' +
                            'updateStatus' +
                            '?' +
                            (language ? 'language=' + language + '&' : '');
                        return url;
                    })(),
                    method: 'PUT',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeIssueStatusUpdateRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as issueStatusUpdateRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useIssueIssueIdUpdateStatusPutMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
