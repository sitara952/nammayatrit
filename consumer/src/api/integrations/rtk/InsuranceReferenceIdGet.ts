// open InsuranceAPIEntity
/* eslint-disable */
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeInsuranceAPIEntity } from '@/readOnly/api/types/InsuranceAPIEntity.bs';
import { insuranceAPIEntity } from '@/readOnly/api/types/InsuranceAPIEntity.gen';

export type insuranceReferenceIdGetWithParams = {
    referenceId: string;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            insuranceReferenceIdGet: build.query<insuranceAPIEntity, insuranceReferenceIdGetWithParams>({
                query: ({ referenceId }) => ({
                    url: (function () {
                        const url = '/insurance' + '/' + referenceId + '/' + '' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeInsuranceAPIEntity(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as insuranceAPIEntity;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useInsuranceReferenceIdGetQuery, useLazyInsuranceReferenceIdGetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
//
