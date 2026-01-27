// open Enums
// open PurchasedPassAPIEntityArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { MultimodalPassListStatus } from '@/readOnly/api/types/Enums.bs';
import { MultimodalPassListStatus_multimodalPassListStatus } from '@/readOnly/api/types/Enums.gen';
import { decodePurchasedPassAPIEntityArray } from '@/readOnly/api/types/PurchasedPassAPIEntityArray.bs';
import { purchasedPassAPIEntityArray } from '@/readOnly/api/types/PurchasedPassAPIEntityArray.gen';

export type multimodalPassListGetWithParams = {
    limit: number | undefined;
    offset: number | undefined;
    status: MultimodalPassListStatus_multimodalPassListStatus | undefined;
    deviceId: string | null;
    imeiNumber: string | null;
    language: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            multimodalPassListGet: build.query<purchasedPassAPIEntityArray, multimodalPassListGetWithParams>({
                query: ({ limit, offset, status, deviceId, imeiNumber, language }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/multimodal/pass/list' + '?';
                        url += limit ? 'limit=' + limit + '&' : '';
                        url += offset ? 'offset=' + offset + '&' : '';
                        url += status
                            ? 'status=' +
                              JSON.stringify(MultimodalPassListStatus.multimodalPassListStatusToString(status)) +
                              '&'
                            : '';
                        url += deviceId ? 'deviceId=' + deviceId + '&' : '';
                        url += imeiNumber ? 'imeiNumber=' + imeiNumber + '&' : '';
                        url += language ? 'language=' + language + '&' : '';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePurchasedPassAPIEntityArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line
                    return res._0 as purchasedPassAPIEntityArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useMultimodalPassListGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
