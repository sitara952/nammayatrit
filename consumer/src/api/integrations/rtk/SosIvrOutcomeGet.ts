// open APISuccess
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeAPISuccess } from '../../../readOnly/api/types/APISuccess.bs';
import { aPISuccess } from '../../../readOnly/api/types/APISuccess.gen';

export type sosIvrOutcomeGetWithParams = {
    callFrom: string | undefined;
    callSid: string | undefined;
    callStatus: string | undefined;
    digits: string | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            sosIvrOutcomeGet: build.query<aPISuccess, sosIvrOutcomeGetWithParams>({
                query: ({ callFrom, callSid, callStatus, digits }) => ({
                    url: (function () {
                        const url =
                            '/sos/IvrOutcome' +
                            '?' +
                            (callFrom ? 'callFrom=' + callFrom + '&' : '') +
                            (callSid ? 'callSid=' + callSid + '&' : '') +
                            (callStatus ? 'callStatus=' + callStatus + '&' : '') +
                            (digits ? 'digits=' + digits + '&' : '');
                        return url;
                    })(),
                    method: 'GET',
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

export const { useSosIvrOutcomeGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
