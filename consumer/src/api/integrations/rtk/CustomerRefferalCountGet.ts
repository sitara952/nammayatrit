// open ReferredCustomers
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeReferredCustomers } from '../../../readOnly/api/types/ReferredCustomers.bs';
import { referredCustomers } from '../../../readOnly/api/types/ReferredCustomers.gen';

export type customerRefferalCountGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            customerRefferalCountGet: build.query<referredCustomers, customerRefferalCountGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/CustomerRefferal/count' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeReferredCustomers(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as referredCustomers;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useCustomerRefferalCountGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
