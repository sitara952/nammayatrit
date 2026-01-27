import { useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import {
    useGetBookingStatusQuery,
    useGetBookingDetailsMutation,
    useGetBookingStatusByIdMutation,
} from '../state/server/bookingApi';
import { bookingStatusAPIEntity } from '../../readOnly/api/types/BookingStatusAPIEntity.gen';
import { stopInformation } from '../../readOnly/api/types/StopInformation.gen';
import { isUndefined } from 'lodash';
import { defaultPayloadData, NotificationContext } from '@/typescript/context/NotificationContext.tsx';
import { setStopInfo, StopInfo, StopStatus } from '../state/client/ride';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { BookingId } from '../state/client/user';
import { createRideId, RideId, selectBookingDetailsWithId } from '../state/client/booking';
import { NotificationData } from '@/typescript/context/NotificationContext.tsx';
import { setRideCheckType } from '../state/client/session';
import { RideChecksType } from '../screens/SafetyModal';
import { useRefsContext } from '../context/RefsContext';
import { usePolling } from './usePolling';

/**
 * Custom hook for polling booking status and fetching booking details on change.
 * @param {string} bookingId - The unique ID of the booking.
 * @param {number} pollingInterval - Optional polling interval in milliseconds (default is 5000ms).
 * @returns {object} - Booking status, booking details, and loading states.
 */
const useBookingDetailsOnStatusChange = (
    bookingId: BookingId | null,
    rideId: RideId | null,
    pollingInterval = 2000,
    isUpdateRequired = false,
    isScreenFocused: boolean | undefined,
) => {
    const [fetchBookingStatus, { data, isLoading: isFetching }] = useGetBookingStatusByIdMutation();
    const [notificationData, setNotificationData] = useContext(NotificationContext);
    const dispatch = useAppDispatch();
    const { rideSafetyModalRef } = useRefsContext();
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));

    const [fetchBookingDetails, { data: detailsData, isLoading: isDetailsLoading }] = useGetBookingDetailsMutation();

    const previousStatusData = useRef<bookingStatusAPIEntity | undefined>(undefined);

    const handlePostBooking = useCallback(
        async (data: { TAG: string; _0: bookingStatusAPIEntity | undefined }) => {
            const newStatusData = data._0;
            if (
                (newStatusData && checkIfBookingChanged(previousStatusData.current, newStatusData)) ||
                isUpdateRequired
            ) {
                previousStatusData.current = newStatusData;
                // Trigger details fetch on any change in status data
                if (bookingId) {
                    fetchBookingDetails(bookingId);
                }
                if (newStatusData?.stopInfo && newStatusData.stopInfo[0]?.rideId) {
                    dispatch(
                        setStopInfo({
                            id: createRideId(newStatusData.stopInfo[0]?.rideId),
                            payload: getCurrentStopCondition(newStatusData?.stopInfo ?? []),
                        }),
                    );
                }
            }
        },
        [isUpdateRequired, rideId, bookingId],
    );

    const useFullBookingApi = bookingDetails && bookingDetails.bookingDetails.TAG === 'RENTAL';

    // Check if booking is completed to stop polling
    const isBookingCompleted = useCallback(() => {
        const statusData = data?._0;
        if (!statusData) return false;

        // Check if booking status is completed or cancelled
        return statusData.bookingStatus === 'COMPLETED' || statusData.bookingStatus === 'CANCELLED';
    }, [data]);

    usePolling({
        callApiFn: useFullBookingApi ? fetchBookingDetails : fetchBookingStatus,
        params: bookingId,
        pollingInterval,
        conditionToCall: () => {
            const shouldPoll = (isScreenFocused ?? true) && bookingId !== null && !isBookingCompleted();
            return shouldPoll;
        },
        postApiCall: useFullBookingApi ? async () => {} : handlePostBooking,
        postApiCallError: async () => {},
        cause: 'Booking Details',
        forceRefetchDeps: undefined,
        enable: true,
    });

    useEffect(() => {
        console.info('Notification data updated, fetching booking details...', notificationData, bookingId);
        const notificationType = notificationData && notificationData?.notification_type;
        if (
            bookingId &&
            notificationType &&
            notificationType !== '' &&
            ['DRIVER_ASSIGNMENT', 'TRIP_STARTED', 'TRIP_FINISHED', 'TRIP_UPDATED'].includes(
                notificationData.notification_type,
            )
        ) {
            fetchBookingDetails(bookingId);
        }
        handleNotifications(notificationData);
    }, [notificationData?.notification_type, bookingId]);

    const handleNotifications = useCallback(
        (notification: NotificationData) => {
            switch (notification?.notification_type) {
                case 'SAFETY_ALERT_DEVIATION': {
                    dispatch(setRideCheckType(RideChecksType.RideDeviation));
                    rideSafetyModalRef.current?.present();
                    setNotificationData(defaultPayloadData);
                    break;
                }
                case 'SAFETY_ALERT_RIDE_STOPPAGE': {
                    dispatch(setRideCheckType(RideChecksType.RideStoppage));
                    rideSafetyModalRef.current?.present();
                    setNotificationData(defaultPayloadData);
                    break;
                }
                default:
                    break;
            }
        },
        [dispatch],
    );

    const result = useMemo(() => {
        return {
            statusData: data?._0,
            detailsData,
            isStatusLoading: isFetching,
            isDetailsLoading,
        };
    }, [data, detailsData, isFetching, isDetailsLoading]);

    return result;
};

/**
 * Custom hook for polling booking status and fetching booking details on change.
 * @param {string} bookingId - The unique ID of the booking.
 * @param {number} pollingInterval - Optional polling interval in milliseconds (default is 5000ms).
 * @returns {object} - Booking status
 */
export const useBookingStatus = (bookingId: BookingId | null, pollingInterval = 2000) => {
    const { data, refetch, isUninitialized, isFetching } = useGetBookingStatusQuery(bookingId, {
        pollingInterval,
        skip: !bookingId,
        skipPollingIfUnfocused: true,
    });
    const newStatusData: bookingStatusAPIEntity | undefined = data?._0;
    const [notificationData, _] = useContext(NotificationContext);

    useEffect(() => {
        const notificationType = notificationData && notificationData?.notification_type;
        if (!isUninitialized && refetch && notificationType && notificationType !== '' && !isFetching) {
            refetch();
        }
    }, [notificationData?.notification_type]);

    return {
        bookingStatus: newStatusData?.bookingStatus,
    };
};

/* Check if any of the status field changed or old status was nothing*/
const checkIfBookingChanged = (
    oldStatusData: bookingStatusAPIEntity | undefined,
    newStatusData: bookingStatusAPIEntity,
) => {
    if (isUndefined(oldStatusData)) {
        return true;
    }

    const changes = {
        bookingStatus: newStatusData.bookingStatus !== oldStatusData.bookingStatus,
        driverArrivalTime: newStatusData.driverArrivalTime !== oldStatusData.driverArrivalTime,
        driversPreviousRideDropLocLat:
            newStatusData.driversPreviousRideDropLocLat !== oldStatusData.driversPreviousRideDropLocLat,
        driversPreviousRideDropLocLon:
            newStatusData.driversPreviousRideDropLocLon !== oldStatusData.driversPreviousRideDropLocLon,
        id: newStatusData.id !== oldStatusData.id,
        rideStatus: newStatusData.rideStatus !== oldStatusData.rideStatus,
        sosStatus: newStatusData.sosStatus !== oldStatusData.sosStatus,
        stopInfo: !areStopInformationArraysEqual(newStatusData.stopInfo, oldStatusData.stopInfo),
    };

    return Object.values(changes).some(hasChanged => hasChanged);
};

export default useBookingDetailsOnStatusChange;

function areStopInformationArraysEqual(
    array1: stopInformation[] | undefined,
    array2: stopInformation[] | undefined,
): boolean {
    if (array1 === undefined && array2 === undefined) {
        return true;
    }

    if (array1 === undefined || array2 === undefined) {
        return false;
    }

    if (array1.length !== array2.length) {
        return false;
    }
    return array1.every((stop1, index) => {
        const stop2 = array2[index];
        return (
            stop1.stopOrder === stop2?.stopOrder &&
            stop1.rideId === stop2.rideId &&
            stop1.waitingTimeStart === stop2.waitingTimeStart &&
            stop1.waitingTimeEnd === stop2.waitingTimeEnd
        );
    });
}

/**
 * Determines the current condition at a stop.
 * stopInformation - Array of stop information.
 * The condition and details about the current stop or next stop.
 */
function getCurrentStopCondition(stopInformation: stopInformation[] | undefined): StopInfo {
    // Sort stops by stopOrder to ensure they are in the correct sequence
    if (!stopInformation || stopInformation.length === 0) {
        return { status: StopStatus.Approaching, stop: 0, waitingTimeStart: undefined }; // Approaching first stop
    }

    // Create a sorted copy instead of mutating
    const sortedStops = [...stopInformation].sort((a, b) => a.stopOrder - b.stopOrder);

    const matchingStop = sortedStops.find(
        (stop, index) =>
            stop?.waitingTimeStart &&
            !stop.waitingTimeEnd &&
            index === sortedStops.findIndex(s => s.stopOrder === stop.stopOrder),
    );

    return matchingStop
        ? {
              status: StopStatus.OnStop,
              stop: sortedStops.indexOf(matchingStop),
              waitingTimeStart: matchingStop.waitingTimeStart,
          }
        : {
              status: StopStatus.Approaching,
              stop: sortedStops.length,
              waitingTimeStart: undefined,
          };
}
