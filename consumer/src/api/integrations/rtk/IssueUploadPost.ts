// open IssueMediaUploadRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeIssueMediaUploadRes } from '../../../readOnly/api/types/IssueMediaUploadRes.bs';
import { issueMediaUploadRes } from '../../../readOnly/api/types/IssueMediaUploadRes.gen';

export type issueUploadPostWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueUploadPost: build.mutation<issueMediaUploadRes, issueUploadPostWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/issue/upload' + '?';
                        return url;
                    })(),
                    method: 'POST',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeIssueMediaUploadRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as issueMediaUploadRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useIssueUploadPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
