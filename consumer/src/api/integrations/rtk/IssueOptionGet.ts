// open Enums
// open IssueOptionListRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeIssueOptionListRes } from '../../../readOnly/api/types/IssueOptionListRes.bs';
import { issueOptionListRes } from '../../../readOnly/api/types/IssueOptionListRes.gen';

export type issueOptionGetWithParams = {
    categoryId: string;
    optionId: string | undefined;
    issueReportId: string | undefined;
    rideId: string | undefined;
    language: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueOptionGet: build.query<issueOptionListRes, issueOptionGetWithParams>({
                query: ({ categoryId, optionId, issueReportId, rideId, language }) => ({
                    url: (function () {
                        const url =
                            '/issue/option' +
                            '?' +
                            'categoryId=' +
                            categoryId +
                            '&' +
                            (optionId ? 'optionId=' + optionId + '&' : '') +
                            (issueReportId ? 'issueReportId=' + issueReportId + '&' : '') +
                            (rideId ? 'rideId=' + rideId + '&' : '') +
                            (language ? 'language=' + language + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: unknown) {
                    const res = decodeIssueOptionListRes(baseQueryReturnValue);
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

export const { useIssueOptionGetQuery, useLazyIssueOptionGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
