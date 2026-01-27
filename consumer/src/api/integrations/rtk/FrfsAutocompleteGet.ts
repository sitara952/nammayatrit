// open AutocompleteRes
// open Enums
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { FrfsAutocompletePlatformType, FrfsAutocompleteVehicleType } from '@/readOnly/api/types/Enums.bs';
import {
    FrfsAutocompleteCity_frfsAutocompleteCity,
    FrfsAutocompletePlatformType_frfsAutocompletePlatformType,
    FrfsAutocompleteVehicleType_frfsAutocompleteVehicleType,
} from '@/readOnly/api/types/Enums.gen';
import { decodeAutocompleteRes } from '@/readOnly/api/types/AutocompleteRes.bs.js';
import { autocompleteRes } from '@/readOnly/api/types/AutocompleteRes.gen.tsx';
import { isNull } from 'lodash';

export type frfsAutocompleteGetWithParams = {
    input: string | undefined;
    limit: number | undefined;
    offset: number | undefined;
    platformType: FrfsAutocompletePlatformType_frfsAutocompletePlatformType | undefined;
    city: FrfsAutocompleteCity_frfsAutocompleteCity;
    location: string;
    vehicleType: FrfsAutocompleteVehicleType_frfsAutocompleteVehicleType;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsAutocompleteGet: build.query<autocompleteRes, frfsAutocompleteGetWithParams>({
                query: ({ input, limit, offset, platformType, city, location, vehicleType }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */

                        let url = '/frfs/autocomplete' + '?';
                        url += input ? 'input=' + input + '&' : '';
                        url += limit ? 'limit=' + limit + '&' : '';
                        url += !isNull(offset) ? 'offset=' + offset + '&' : '';

                        url += platformType
                            ? 'platformType=' +
                              JSON.stringify(
                                  FrfsAutocompletePlatformType.frfsAutocompletePlatformTypeToString(platformType),
                              ) +
                              '&'
                            : '';
                        url += 'city=' + city + '&';
                        url += 'location=' + location + '&';
                        url +=
                            'vehicleType=' +
                            JSON.stringify(
                                FrfsAutocompleteVehicleType.frfsAutocompleteVehicleTypeToString(vehicleType),
                            ) +
                            '&';
                        return url;
                    })(),
                    method: 'GET',
                }),

                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeAutocompleteRes(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as autocompleteRes;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsAutocompleteGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
