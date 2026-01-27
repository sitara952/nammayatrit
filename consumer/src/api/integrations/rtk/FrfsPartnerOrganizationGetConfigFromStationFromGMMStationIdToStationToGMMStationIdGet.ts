// open GetConfigResp
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeGetConfigResp } from '../../../readOnly/api/types/GetConfigResp.bs';
import { getConfigResp } from '../../../readOnly/api/types/GetConfigResp.gen';

export type frfsPartnerOrganizationGetConfigFromStationFromGMMStationIdToStationToGMMStationIdGetWithParams = {
    fromGMMStationId: string;
    toGMMStationId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsPartnerOrganizationGetConfigFromStationFromGMMStationIdToStationToGMMStationIdGet: build.query<
                getConfigResp,
                frfsPartnerOrganizationGetConfigFromStationFromGMMStationIdToStationToGMMStationIdGetWithParams
            >({
                query: ({ fromGMMStationId, toGMMStationId }) => ({
                    url: (function () {
                        const url =
                            '/frfs/partnerOrganization/getConfig/fromStation' +
                            '/' +
                            fromGMMStationId +
                            '/' +
                            'toStation' +
                            '/' +
                            toGMMStationId +
                            '/' +
                            '' +
                            '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeGetConfigResp(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as getConfigResp;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsPartnerOrganizationGetConfigFromStationFromGMMStationIdToStationToGMMStationIdGetQuery } =
    apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
