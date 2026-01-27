import { api } from './../api';
import { decodeSavedReqLocationsListRes } from '../../../readOnly/api/types/SavedReqLocationsListRes.bs';
import { savedReqLocationAPIEntity } from '../../../readOnly/api/types/SavedReqLocationAPIEntity.gen';

export const savedLocationListApi = api.injectEndpoints({
    endpoints: build => ({
        savedLocations: build.query<savedReqLocationAPIEntity[], object>({
            query: () => ({
                url: '/savedLocation/list',
                method: 'GET',
            }),
            // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
            transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                return decodeSavedReqLocationsListRes(baseQueryReturnValue)._0.list;
            },
            keepUnusedDataFor: 0,
            merge: undefined,
            forceRefetch: undefined,
            onCacheEntryAdded: undefined,
            onQueryStarted: undefined,
        }),
    }),
    overrideExisting: false,
});
export const { useSavedLocationsQuery, useLazySavedLocationsQuery } = savedLocationListApi;
