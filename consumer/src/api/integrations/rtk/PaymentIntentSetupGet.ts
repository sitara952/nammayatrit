// open SetupIntentResponse
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeSetupIntentResponse } from '../../../readOnly/api/types/SetupIntentResponse.bs';
import { setupIntentResponse } from '../../../readOnly/api/types/SetupIntentResponse.gen';

export type paymentIntentSetupGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            paymentIntentSetupGet: build.query<setupIntentResponse, paymentIntentSetupGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/payment/intent/setup' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeSetupIntentResponse(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as setupIntentResponse;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { usePaymentIntentSetupGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
