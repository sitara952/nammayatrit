/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeEmergencySettingsRes } from '../../../readOnly/api/types/EmergencySettingsRes.bs';
import { emergencySettingsRes } from '../../../readOnly/api/types/EmergencySettingsRes.gen';
import { selectToken } from '@/typescript/state/client/auth';
import { setEmergencyContacts } from '@/typescript/state/client/user';
import { RootState } from '@/typescript/state/store';
import { setDefaultContact } from '@/typescript/state/client/sos';

export type profileGetEmergencySettingsGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            profileGetEmergencySettingsGet: build.query<emergencySettingsRes, profileGetEmergencySettingsGetWithParams>(
                {
                    query: () => ({
                        url: (function () {
                            const url = '/profile/getEmergencySettings' + '?';
                            return url;
                        })(),
                        method: 'GET',
                    }),
                    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                    transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                        const res = decodeEmergencySettingsRes(baseQueryReturnValue);
                        if (res.TAG === 'Error') {
                            throw new Error(res._0);
                        }
                        return res._0 as emergencySettingsRes;
                    },
                    ...rtkExtraOptions,
                    onQueryStarted: async (_arg, { queryFulfilled, dispatch, getState }) => {
                        try {
                            const { data } = await queryFulfilled;
                            const emergencyContacts = data.defaultEmergencyNumbers;
                            const state = getState() as RootState;
                            const userToken = selectToken(state);
                            dispatch(setEmergencyContacts({ id: userToken, payload: emergencyContacts }));
                            const defaultContact = data.defaultEmergencyNumbers.find(contact => contact.priority === 0);
                            dispatch(setDefaultContact(defaultContact));
                        } catch (err) {
                            console.error('profile/defaultEmergencyNumbers api failed', err);
                        }
                    },
                },
            ),
        }),
        overrideExisting: false,
    });

export const { useProfileGetEmergencySettingsGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
