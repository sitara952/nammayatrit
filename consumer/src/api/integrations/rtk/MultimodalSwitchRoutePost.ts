// open JourneyInfoResp
// open SwitchRouteReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeJourneyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.bs';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { switchRouteReq } from '@/readOnly/api/types/SwitchRouteReq.gen';

export type multimodalSwitchRoutePostWithParams = {
    body: switchRouteReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalSwitchRoutePost: build.mutation<journeyInfoResp, multimodalSwitchRoutePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/multimodal/switch/route' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeJourneyInfoResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as journeyInfoResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalSwitchRoutePostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
