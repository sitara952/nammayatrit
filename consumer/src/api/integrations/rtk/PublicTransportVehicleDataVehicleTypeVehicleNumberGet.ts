// open Enums
// open PublicTransportData
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { PublicTransportVehicleDataVehicleTypeVehicleNumberVehicleType_publicTransportVehicleDataVehicleTypeVehicleNumberVehicleType } from '@/readOnly/api/types/Enums.gen';
import { decodePublicTransportData } from '@/readOnly/api/types/PublicTransportData.bs';
import { publicTransportData } from '@/readOnly/api/types/PublicTransportData.gen';

export type publicTransportVehicleDataVehicleTypeVehicleNumberGetWithParams = {
    vehicleType: PublicTransportVehicleDataVehicleTypeVehicleNumberVehicleType_publicTransportVehicleDataVehicleTypeVehicleNumberVehicleType;
    vehicleNumber: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            publicTransportVehicleDataVehicleTypeVehicleNumberGet: build.query<
                publicTransportData,
                publicTransportVehicleDataVehicleTypeVehicleNumberGetWithParams
            >({
                query: ({ vehicleType, vehicleNumber }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/publicTransport/vehicleData' + '/"' + vehicleType + '"/' + vehicleNumber;
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodePublicTransportData(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }

                    return res._0 as publicTransportData;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const {
    usePublicTransportVehicleDataVehicleTypeVehicleNumberGetQuery,
    useLazyPublicTransportVehicleDataVehicleTypeVehicleNumberGetQuery,
} = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
