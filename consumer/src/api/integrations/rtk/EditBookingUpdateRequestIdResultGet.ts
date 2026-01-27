// open EditLocationResultAPIResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeEditLocationResultAPIResp } from '../../../readOnly/api/types/EditLocationResultAPIResp.bs';
import { editLocationResultAPIResp } from '../../../readOnly/api/types/EditLocationResultAPIResp.gen';

export type editBookingUpdateRequestIdResultGetWithParams = {
    bookingUpdateRequestId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            editBookingUpdateRequestIdResultGet: build.query<
                editLocationResultAPIResp,
                editBookingUpdateRequestIdResultGetWithParams
            >({
                query: ({ bookingUpdateRequestId }) => ({
                    url: (function () {
                        const url = '/edit' + '/' + bookingUpdateRequestId + '/' + 'result' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeEditLocationResultAPIResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as editLocationResultAPIResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useEditBookingUpdateRequestIdResultGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
