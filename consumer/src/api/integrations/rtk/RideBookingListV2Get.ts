// open BookingListResV2
// open Enums
import { api, RtkExtraOptions } from '../../../typescript/state/api';
import {
    RideBookingListV2BillingCategory,
    RideBookingListV2BookingRequestType,
    RideBookingListV2JourneyStatus,
    RideBookingListV2RideStatus,
    RideBookingListV2RideType,
} from '@/readOnly/api/types/Enums.bs';
import {
    RideBookingListV2BillingCategory_rideBookingListV2BillingCategory,
    RideBookingListV2BookingRequestType_rideBookingListV2BookingRequestType,
    RideBookingListV2JourneyStatus_rideBookingListV2JourneyStatus,
    RideBookingListV2RideStatus_rideBookingListV2RideStatus,
    RideBookingListV2RideType_rideBookingListV2RideType,
} from '@/readOnly/api/types/Enums.gen';
import { decodeBookingListResV2 } from '@/readOnly/api/types/BookingListResV2.bs';
import { bookingListResV2 } from '@/readOnly/api/types/BookingListResV2.gen';

export type rideBookingListV2GetWithParams = {
    limit: number | undefined;
    offset: number | undefined;
    bookingOffset: number | undefined;
    journeyOffset: number | undefined;
    fromDate: number | undefined;
    toDate: number | undefined;
    billingCategory: RideBookingListV2BillingCategory_rideBookingListV2BillingCategory | undefined;
    rideType: RideBookingListV2RideType_rideBookingListV2RideType[] | undefined;
    rideStatus: RideBookingListV2RideStatus_rideBookingListV2RideStatus[] | undefined;
    journeyStatus: RideBookingListV2JourneyStatus_rideBookingListV2JourneyStatus[] | undefined;
    isPaymentSuccess: boolean | undefined;
    bookingRequestType: RideBookingListV2BookingRequestType_rideBookingListV2BookingRequestType | undefined;
};

export const apiCall = (rtkExtraOptions: RtkExtraOptions) =>
    api.injectEndpoints({
        endpoints: build => ({
            rideBookingListV2Get: build.query<bookingListResV2, rideBookingListV2GetWithParams>({
                query: ({
                    limit,
                    offset,
                    bookingOffset,
                    journeyOffset,
                    fromDate,
                    toDate,
                    billingCategory,
                    rideType,
                    rideStatus,
                    journeyStatus,
                    isPaymentSuccess,
                    bookingRequestType,
                }) => ({
                    url: (function () {
                        /* eslint-disable functional/no-let */
                        // eslint-disable-next-line prefer-const
                        let url = '/rideBooking/listV2' + '?';
                        url += limit ? 'limit=' + limit + '&' : '';
                        url += offset ? 'offset=' + offset + '&' : '';
                        url += bookingOffset ? 'bookingOffset=' + bookingOffset + '&' : '';
                        url += journeyOffset ? 'journeyOffset=' + journeyOffset + '&' : '';
                        url += fromDate ? 'fromDate=' + fromDate + '&' : '';
                        url += toDate ? 'toDate=' + toDate + '&' : '';
                        url += billingCategory
                            ? 'billingCategory=' +
                              JSON.stringify(
                                  RideBookingListV2BillingCategory.rideBookingListV2BillingCategoryToString(
                                      billingCategory,
                                  ),
                              ) +
                              '&'
                            : '';
                        url += rideType
                            ? 'rideType=' +
                              rideType
                                  .map(str =>
                                      JSON.stringify(RideBookingListV2RideType.rideBookingListV2RideTypeToString(str)),
                                  )
                                  .join('&rideType=') +
                              '&'
                            : '';
                        url += rideStatus
                            ? 'rideStatus=' +
                              rideStatus
                                  .map(str =>
                                      JSON.stringify(
                                          RideBookingListV2RideStatus.rideBookingListV2RideStatusToString(str),
                                      ),
                                  )
                                  .join('&rideStatus=') +
                              '&'
                            : '';
                        url += journeyStatus
                            ? 'journeyStatus=' +
                              journeyStatus
                                  .map(str =>
                                      JSON.stringify(
                                          RideBookingListV2JourneyStatus.rideBookingListV2JourneyStatusToString(str),
                                      ),
                                  )
                                  .join('&journeyStatus=') +
                              '&'
                            : '';
                        url += isPaymentSuccess ? 'isPaymentSuccess=' + isPaymentSuccess + '&' : '';
                        url += bookingRequestType
                            ? 'bookingRequestType=' +
                              JSON.stringify(
                                  RideBookingListV2BookingRequestType.rideBookingListV2BookingRequestTypeToString(
                                      bookingRequestType,
                                  ),
                              ) +
                              '&'
                            : '';
                        return url;
                    })(),
                    method: 'GET',
                }),
                // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
                transformResponse(baseQueryReturnValue: any, _meta, _arg) {
                    const res = decodeBookingListResV2(baseQueryReturnValue);
                    if (res.TAG === 'Error') {
                        throw new Error(res._0);
                    }
                    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                    return res._0 as bookingListResV2;
                },
                ...rtkExtraOptions,
            }),
        }),
        overrideExisting: false,
    });

export const { useRideBookingListV2GetQuery, useLazyRideBookingListV2GetQuery } = apiCall({
    onQueryStarted: undefined,
    keepUnusedDataFor: undefined,
});
