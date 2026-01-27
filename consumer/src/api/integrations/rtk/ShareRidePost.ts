// open APISuccess
// open ShareRideReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { shareRideReq } from '../../../readOnly/api/types/ShareRideReq.gen';

export type shareRidePostWithParams = {
    body: shareRideReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            shareRidePost: build.mutation<aPISuccess, shareRidePostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/share/ride' + '?';
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

export const { useShareRidePostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
