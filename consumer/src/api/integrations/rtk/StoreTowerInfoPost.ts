// open APISuccess
// open TowerInfoReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '@/readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '@/readOnly/api/types/APISuccess.gen';
import { towerInfoReq } from '@/readOnly/api/types/TowerInfoReq.gen';

export type storeTowerInfoPostWithParams = {
    body: towerInfoReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            storeTowerInfoPost: build.mutation<aPISuccess, storeTowerInfoPostWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/storeTowerInfo' + '?';
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAPISuccess(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as aPISuccess;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useStoreTowerInfoPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
