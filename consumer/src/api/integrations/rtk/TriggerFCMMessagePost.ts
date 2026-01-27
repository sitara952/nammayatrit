// open APISuccess
// open TriggerFcmReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { triggerFcmReq } from '../../../readOnly/api/types/TriggerFcmReq.gen';

export type triggerFCMMessagePostWithParams = {
    body: triggerFcmReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            triggerFCMMessagePost: build.mutation<aPISuccess, triggerFCMMessagePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/triggerFCM/message' + '?';
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

export const { useTriggerFCMMessagePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
