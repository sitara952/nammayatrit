import { api, RtkExtraOptions } from '../../../typescript/state/api';

export type getUiConfigsPostWithParams = {
    toss: number | undefined;
    tenant: string | undefined;
    body: object;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            getUiConfigsPost: build.mutation<object, getUiConfigsPostWithParams>({
                query: ({ toss, tenant, body }) => ({
                    url: (function () {
                        const url =
                            '/getUiConfigs' +
                            '?' +
                            (toss ? 'toss=' + toss + '&' : '') +
                            (tenant ? 'tenant=' + tenant + '&' : '');
                        return url;
                    })(),
                    method: 'POST',
                    body: body,
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    return baseQueryReturnValue as object;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useGetUiConfigsPostMutation } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
