// open APISuccess
// open SafetyCheckSupportReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { safetyCheckSupportReq } from '../../../readOnly/api/types/SafetyCheckSupportReq.gen';

export type supportSafetyCheckSupportPostWithParams = {
    body: safetyCheckSupportReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            supportSafetyCheckSupportPost: build.mutation<aPISuccess, supportSafetyCheckSupportPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/support/safetyCheckSupport' + '?';
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

export const { useSupportSafetyCheckSupportPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
