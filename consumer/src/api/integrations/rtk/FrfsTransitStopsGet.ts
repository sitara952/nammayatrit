// open Enums
// open FRFSTransitStopsCache
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { FrfsTransitStopsPlatformType } from '@/readOnly/api/types/Enums.bs';
import { FrfsTransitStopsPlatformType_frfsTransitStopsPlatformType } from '@/readOnly/api/types/Enums.gen';
import { decodeFRFSTransitStopsCache } from '@/readOnly/api/types/FRFSTransitStopsCache.bs';
import { fRFSTransitStopsCache } from '@/readOnly/api/types/FRFSTransitStopsCache.gen';

export type frfsTransitStopsGetWithParams = {
    platformType: FrfsTransitStopsPlatformType_frfsTransitStopsPlatformType | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsTransitStopsGet: build.query<fRFSTransitStopsCache, frfsTransitStopsGetWithParams>({
                query: ({ platformType }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/frfs/transitStops' + '?';
                        url += platformType
                            ? 'platformType=' +
                              JSON.stringify(
                                  FrfsTransitStopsPlatformType.frfsTransitStopsPlatformTypeToString(platformType),
                              ) +
                              '&'
                            : '';
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSTransitStopsCache(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSTransitStopsCache;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsTransitStopsGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
