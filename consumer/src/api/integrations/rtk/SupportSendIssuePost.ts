// open APISuccess
// open SendIssueReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { sendIssueReq } from '../../../readOnly/api/types/SendIssueReq.gen';

export type supportSendIssuePostWithParams = {
    body: sendIssueReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            supportSendIssuePost: build.mutation<aPISuccess, supportSendIssuePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/support/sendIssue' + '?';
                        return url;
                    })(),
                    method: 'POST',
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

export const { useSupportSendIssuePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
