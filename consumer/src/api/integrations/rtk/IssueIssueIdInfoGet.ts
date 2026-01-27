// open Enums
// open IssueInfoRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeIssueInfoRes } from '../../../readOnly/api/types/IssueInfoRes.bs';
import { issueInfoRes } from '../../../readOnly/api/types/IssueInfoRes.gen';

export type issueIssueIdInfoGetWithParams = {
    issueId: string;
    language: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueIssueIdInfoGet: build.query<issueInfoRes, issueIssueIdInfoGetWithParams>({
                query: ({ issueId, language }) => ({
                    url: (function () {
                        const url =
                            '/issue' +
                            '/' +
                            issueId +
                            '/' +
                            'info' +
                            '?' +
                            (language ? 'language=' + language + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue, _meta, _arg) {
                    const res = decodeIssueInfoRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as issueInfoRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useIssueIssueIdInfoGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
