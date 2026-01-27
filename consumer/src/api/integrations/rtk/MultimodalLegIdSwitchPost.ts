// open APISuccess
// open SwitchLegReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { switchLegReq } from '../../../readOnly/api/types/SwitchLegReq.gen';

export type multimodalLegIdSwitchPostWithParams = {
    legId: string;
    body: switchLegReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalLegIdSwitchPost: build.mutation<aPISuccess, multimodalLegIdSwitchPostWithParams>({
                query: ({ legId, body }) => ({
                    url: (function () {
                        const url = '/multimodal' + '/' + legId + '/' + 'switch' + '?';
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

export const { useMultimodalLegIdSwitchPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
