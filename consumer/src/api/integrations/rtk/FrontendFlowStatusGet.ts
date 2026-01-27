// open GetPersonFlowStatusRes
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetPersonFlowStatusRes } from '../../../readOnly/api/types/GetPersonFlowStatusRes.bs';
import { getPersonFlowStatusRes } from '../../../readOnly/api/types/GetPersonFlowStatusRes.gen';

export type frontendFlowStatusGetWithParams = {
    isPolling: boolean | undefined;
    checkForActiveBooking: boolean | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frontendFlowStatusGet: build.query<getPersonFlowStatusRes, frontendFlowStatusGetWithParams>({
                query: ({ isPolling, checkForActiveBooking }) => ({
                    url: (function () {
                        const url =
                            '/frontend/flowStatus' +
                            '?' +
                            (isPolling ? 'isPolling=' + isPolling + '&' : '') +
                            (checkForActiveBooking ? 'checkForActiveBooking=' + checkForActiveBooking + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetPersonFlowStatusRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getPersonFlowStatusRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrontendFlowStatusGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
