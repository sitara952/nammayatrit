/* eslint-disable functional/no-let */
// open Enums
// open IssueReportReq
// open IssueReportRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeIssueReportRes } from '../../../readOnly/api/types/IssueReportRes.bs';
import { issueReportRes } from '../../../readOnly/api/types/IssueReportRes.gen';
import { issueReportReq } from '../../../readOnly/api/types/IssueReportReq.gen';

export type issuePostWithParams = {
    language: string;
    body: issueReportReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issuePost: build.mutation<issueReportRes, issuePostWithParams>({
                query: ({ language, body }) => ({
                    url: (function () {
                        let url = '/issue' + '?';
                        url += language ? 'language=' + language + '&' : '';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: unknown) {
                    const res = decodeIssueReportRes(baseQueryReturnValue);
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

export const { useIssuePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
