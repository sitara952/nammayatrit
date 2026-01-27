// open APISuccess
// open UpdateProfileDefaultEmergencyNumbersReq
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';
import { updateProfileDefaultEmergencyNumbersReq } from '../../../readOnly/api/types/UpdateProfileDefaultEmergencyNumbersReq.gen';

export type profileDefaultEmergencyNumbersPostWithParams = {
    body: updateProfileDefaultEmergencyNumbersReq;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            profileDefaultEmergencyNumbersPost: build.mutation<
                aPISuccess,
                profileDefaultEmergencyNumbersPostWithParams
            >({
                query: ({ body }) => ({
                    url: (function () {
                        const url = '/profile/defaultEmergencyNumbers' + '?';
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

export const { useProfileDefaultEmergencyNumbersPostMutation } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
