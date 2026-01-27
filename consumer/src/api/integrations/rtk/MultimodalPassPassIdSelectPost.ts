// open PassSelectionAPIEntity
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodePassSelectionAPIEntity } from '@/readOnly/api/types/PassSelectionAPIEntity.bs';
import { passSelectionAPIEntity } from '@/readOnly/api/types/PassSelectionAPIEntity.gen';

export type PassSelectReq = {
    startDate: string | undefined;
    imeiNumber: string | undefined;
    profilePicture: string | undefined;
};

export type multimodalPassPassIdSelectPostWithParams = {
    passId: string;
    body: PassSelectReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalPassPassIdSelectPost: build.mutation<
                passSelectionAPIEntity,
                multimodalPassPassIdSelectPostWithParams
            >({
                query: ({ passId, body }) => ({
                    url: (function () {
                        const url = '/multimodal/pass/v2/' + passId + '/select';
                        return url;
                    })(),
                    method: 'POST',
                    body,
                }),
                // eslint-disable-next-line
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePassSelectionAPIEntity(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line
                    return res._0 as passSelectionAPIEntity;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalPassPassIdSelectPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
