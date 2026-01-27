import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { updatePayoutVpaReq } from '@/readOnly/api/types/UpdatePayoutVpaReq.gen';

export type payoutVpaUpsertPostWithParams = {
    body: updatePayoutVpaReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            payoutVpaUpsertPost: build.mutation<aPISuccess, payoutVpaUpsertPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/payoutVpa/upsert' + '?';
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

export const { usePayoutVpaUpsertPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
