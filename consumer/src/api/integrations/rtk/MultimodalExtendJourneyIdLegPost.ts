// open APISuccess
// open ExtendLegReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { extendLegReq } from '../../../readOnly/api/types/ExtendLegReq.gen';

export type multimodalExtendJourneyIdLegPostWithParams = {
    journeyId: string;
    body: extendLegReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalExtendJourneyIdLegPost: build.mutation<aPISuccess, multimodalExtendJourneyIdLegPostWithParams>({
                query: ({ journeyId, body }) => ({
                    url: (function () {
                        const url = '/multimodal/extend' + '/' + journeyId + '/' + 'leg' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: {
                        ...body,
                        startLocation: {
                            tag: body.startLocation.TAG,
                            contents:
                                body.startLocation.TAG === 'StartLegOrder'
                                    ? (body.startLocation._0?.contents ?? null)
                                    : body.startLocation._0, // Updated logic to support one of
                        },
                    },
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

export const { useMultimodalExtendJourneyIdLegPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
