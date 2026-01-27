// open SavedReqLocationsListRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSavedReqLocationsListRes } from '../../../readOnly/api/types/SavedReqLocationsListRes.bs';
import { savedReqLocationsListRes } from '../../../readOnly/api/types/SavedReqLocationsListRes.gen';

export type savedLocationListGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            savedLocationListGet: build.query<savedReqLocationsListRes, savedLocationListGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/savedLocation/list' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeSavedReqLocationsListRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as savedReqLocationsListRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useSavedLocationListGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
