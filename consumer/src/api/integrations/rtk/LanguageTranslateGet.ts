// open Enums
// open TranslateResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { LanguageTranslateSource_languageTranslateSource } from '../../../readOnly/api/types/Enums.gen';
import { decodeTranslateResp } from '../../../readOnly/api/types/TranslateResp.bs';
import { translateResp } from '../../../readOnly/api/types/TranslateResp.gen';

export type languageTranslateGetWithParams = {
    source: LanguageTranslateSource_languageTranslateSource;
    target: LanguageTranslateSource_languageTranslateSource;
    q: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            languageTranslateGet: build.query<translateResp, languageTranslateGetWithParams>({
                query: ({ source, target, q }) => ({
                    url: (function () {
                        const url =
                            '/language/translate' +
                            '?' +
                            'source=' +
                            source +
                            '&' +
                            'target=' +
                            target +
                            '&' +
                            'q=' +
                            q +
                            '&';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeTranslateResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as translateResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useLanguageTranslateGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
