// open ExtendLegGetFareReq
// open ExtendLegGetFareResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeExtendLegGetFareResp } from '@/readOnly/api/types/ExtendLegGetFareResp.bs';
import { extendLegGetFareResp } from '@/readOnly/api/types/ExtendLegGetFareResp.gen';
import { extendLegGetFareReq } from '@/readOnly/api/types/ExtendLegGetFareReq.gen';

export type multimodalExtendJourneyIdLegGetfarePostWithParams = {
    journeyId: string;
    body: extendLegGetFareReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalExtendJourneyIdLegGetfarePost: build.mutation<
                extendLegGetFareResp,
                multimodalExtendJourneyIdLegGetfarePostWithParams
            >({
                query: ({ journeyId, body }) => ({
                    url: `/multimodal/extend/${journeyId}/leg/getfare?`,
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
                    const res = decodeExtendLegGetFareResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as extendLegGetFareResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalExtendJourneyIdLegGetfarePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
