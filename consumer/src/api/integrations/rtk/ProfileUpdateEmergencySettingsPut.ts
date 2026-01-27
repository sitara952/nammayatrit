// open APISuccess
// open UpdateEmergencySettingsReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { updateEmergencySettingsReq } from '../../../readOnly/api/types/UpdateEmergencySettingsReq.gen';

export type profileUpdateEmergencySettingsPutWithParams = {
    body: updateEmergencySettingsReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            profileUpdateEmergencySettingsPut: build.mutation<aPISuccess, profileUpdateEmergencySettingsPutWithParams>({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/profile/updateEmergencySettings' + '?';
                        return url;
                    })(),
                    method: 'PUT',
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

export const { useProfileUpdateEmergencySettingsPutMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
