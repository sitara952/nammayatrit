// open FRFSTicketBookingStatusAPIResArray
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import { decodeFRFSTicketBookingStatusAPIResArray } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIResArray.bs';
import { fRFSTicketBookingStatusAPIResArray } from '../../../readOnly/api/types/FRFSTicketBookingStatusAPIResArray.gen';

export type frfsBookingListGetWithParams = {};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            frfsBookingListGet: build.query<fRFSTicketBookingStatusAPIResArray, frfsBookingListGetWithParams>({
                query: () => ({
                    url: (function () {
                        const url = '/frfs/booking/list' + '?';
                        return url;
                    })(),
                    method: 'GET',
                }),
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeFRFSTicketBookingStatusAPIResArray(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    return res._0 as fRFSTicketBookingStatusAPIResArray;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useFrfsBookingListGetQuery } = apiCall({ onQueryStarted: undefined, keepUnusedDataFor: undefined });
//
