import { api, RtkExtraOptions } from '../../../typescript/state/api';

export type issueMediaGetWithParams = {
    filePath: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            issueMediaGet: build.query<string, issueMediaGetWithParams>({
                query: ({ filePath }) => ({
                    url: (function () {
                        const url = '/issue/media' + '?' + 'filePath=' + filePath + '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    return baseQueryReturnValue as string;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useIssueMediaGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
