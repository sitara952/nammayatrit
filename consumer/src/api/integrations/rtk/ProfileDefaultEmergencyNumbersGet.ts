/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetProfileDefaultEmergencyNumbersResp } from '../../../readOnly/api/types/GetProfileDefaultEmergencyNumbersResp.bs';
import { getProfileDefaultEmergencyNumbersResp } from '../../../readOnly/api/types/GetProfileDefaultEmergencyNumbersResp.gen';
import { selectToken } from '@/typescript/state/client/auth';
import { setEmergencyContacts } from '@/typescript/state/client/user';
import { RootState } from '@/typescript/state/store';

export type profileDefaultEmergencyNumbersGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            profileDefaultEmergencyNumbersGet: build.query<
                getProfileDefaultEmergencyNumbersResp,
                profileDefaultEmergencyNumbersGetWithParams
            >({
                query: () => ({
                    url: (function () {
                        const url = '/profile/defaultEmergencyNumbers' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetProfileDefaultEmergencyNumbersResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getProfileDefaultEmergencyNumbersResp;
                },
                ...rtkExtraOptions,
                onQueryStarted: async (_arg, { queryFulfilled, dispatch, getState }) => {
                    try {
                        const { data } = await queryFulfilled;
                        const emergencyContacts = data.defaultEmergencyNumbers;
                        const state = getState() as RootState;
                        const userToken = selectToken(state);
                        dispatch(setEmergencyContacts({ id: userToken, payload: emergencyContacts }));
                    } catch (err) {
                        console.error('profile/defaultEmergencyNumbers api failed', err);
                    }
                },
            }),
        }),
        overrideExisting: false,
    });

export const { useProfileDefaultEmergencyNumbersGetQuery, useLazyProfileDefaultEmergencyNumbersGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
