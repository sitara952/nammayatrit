// open Enums
// open IssueReportListRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeIssueReportListRes } from '../../../readOnly/api/types/IssueReportListRes.bs';
import { issueReportListRes } from '../../../readOnly/api/types/IssueReportListRes.gen';

export type issueListGetWithParams = {
    language: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueListGet: build.query<issueReportListRes, issueListGetWithParams>({
                query: ({ language }) => ({
                    url: (function () {
                        const url = '/issue/list' + '?' + (language ? 'language=' + language + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: unknown) {
                    const res = decodeIssueReportListRes(baseQueryReturnValue);
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

export const { useIssueListGetQuery, useLazyIssueListGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
