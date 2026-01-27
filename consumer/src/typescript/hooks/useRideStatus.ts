import { useContext, useState, useEffect } from 'react';
import { calculateTimeDifference } from '@/screens/ongoingRideFlow/components/RideStatusPill.bs.js';
import { RideStatus } from './types';
import { FormatedLocation } from '../utils/placeUtils';
import { StopInfo, StopStatus } from '../state/client/ride';
import { NotificationContext } from '../context/NotificationContext';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { tripCategory } from '@/readOnly/api/types/TripCategory.gen';

/**
 * Hook to determine the current stage of a ride
 *
 * @param rideDetails The details of the current ride
 * @param bookingDetails The details of the current booking
 * @param stops The list of stops for the ride
 * @param stopInfo Information about the current stop
 * @returns The current stage of the ride as a RideStatus enum
 */
export const useRideStatus = (
    rideDetails: rideAPIEntity | null | undefined,
    bookingDetails: bookingAPIEntity | null | undefined,
    stops: FormatedLocation[],
    stopInfo: StopInfo | null,
) => {
    const [notificationData] = useContext(NotificationContext);
    const [currentStage, setCurrentStage] = useState<RideStatus>(RideStatus.IS_YOUR_DRIVER);
    const stopWaitTimeInSeconds = calculateTimeDifference(stopInfo?.waitingTimeStart);
    useEffect(() => {
        const newStage = determineRideStage(
            rideDetails,
            bookingDetails?.bookingDetails?.TAG,
            stops,
            stopInfo,
            currentStage,
            notificationData?.notification_type,
            bookingDetails,
        );

        setCurrentStage(newStage);
    }, [rideDetails, bookingDetails, notificationData?.notification_type, stops, stopInfo, stopWaitTimeInSeconds]);

    return currentStage;
};

const isRideOtpForBooking = (tripCategory: tripCategory | undefined): boolean => {
    switch (tripCategory?.TAG) {
        case 'OneWay':
            return tripCategory._0 == 'OneWayRideOtp';
        case 'Rental':
            return tripCategory._0 == 'RideOtp';
        case 'RideShare':
            return tripCategory._0 == 'RideOtp';
        case 'InterCity':
            return tripCategory._0.contents == 'OneWayRideOtp';
        case 'CrossCity':
            return tripCategory._0.contents == 'OneWayRideOtp';
        case 'Ambulance':
            return tripCategory._0 == 'OneWayRideOtp';
        case 'Delivery':
            return tripCategory._0 == 'OneWayRideOtp';
        default:
            return false;
    }
};

/**
 * Determine the current stage of a ride based on various factors
 */
const determineRideStage = (
    rideDetails: rideAPIEntity | null | undefined,
    TAG: string | undefined,
    stops: FormatedLocation[],
    stopInfo: StopInfo | null,
    currentStage: RideStatus,
    notification_type: string | undefined,
    bookingDetails: bookingAPIEntity | null | undefined,
): RideStatus => {
    if (!rideDetails) {
        if (bookingDetails && isRideOtpForBooking(bookingDetails?.tripCategory)) return RideStatus.OTP_RIDE_ASSIGNED;
        else return RideStatus.NONE;
    }

    const isDriverAtPickup = rideDetails.driverArrivalTime !== undefined && rideDetails.driverArrivalTime !== '';

    if (rideDetails.status === 'INPROGRESS') {
        return handleRideInProgressStages(stops, stopInfo, rideDetails.rideStartTime, TAG);
    } else if (isDriverAtPickup) {
        return handleDriverAtPickupStages(rideDetails.driverArrivalTime);
    } else {
        return handleDriverToPickupStages(currentStage, notification_type || '');
    }
};

const handleRideInProgressStages = (
    stops: FormatedLocation[],
    stopInfo: StopInfo | null,
    rideStartTime: string | undefined,
    TAG: string | undefined,
): RideStatus => {
    if (stopInfo && stopInfo.status === StopStatus.OnStop) {
        const stopWaitTimeInSeconds = calculateTimeDifference(stopInfo.waitingTimeStart);
        const stageMap = new Map<number, RideStatus>([
            [3 * 60, RideStatus.STOP_WAITING_CHARGE_APPLY_NOW], // if wait is more than 3 mins
            [1 * 60, RideStatus.WAITING_AT_STOP], // if wait is more than 1 min
        ]);
        for (const [time, stage] of stageMap) {
            if (stopWaitTimeInSeconds > time) {
                return stage;
            }
        }
        return RideStatus.STOP_ARRIVED;
    } else {
        const rideStartedSecondsAgo = calculateTimeDifference(rideStartTime);
        const onWayToStop = stops.length > 1 && stops.length - 1 > (stopInfo?.stop ?? -1);
        const isInterCity = TAG === 'INTER_CITY';
        const isRentals = TAG === 'RENTAL';
        // count < 4 to make sure if it renders again, first we should show ride started lottie then only the distance
        // TODO : check why this rideStartedSeconds was negative for Intercity : Dhruv-Singh
        const newStage =
            rideStartedSecondsAgo > 4 || isInterCity || isRentals || stops.length > 1
                ? onWayToStop
                    ? RideStatus.WAY_TO_STOP
                    : isInterCity
                      ? RideStatus.INTER_CITY
                      : isRentals
                        ? RideStatus.RENTAL
                        : RideStatus.BRIDGE_TO_DESTINATION
                : RideStatus.RIDE_STARTED;
        return newStage;
    }
};

const handleDriverAtPickupStages = (driverArrivalTime: string | undefined): RideStatus => {
    const driverWaitTimeInSeconds = calculateTimeDifference(driverArrivalTime);
    const stageMap = new Map<number, RideStatus>([
        [4 * 60, RideStatus.CAB_IS_LEAVING_SOON], // if wait is more than 4 mins
        [3 * 60, RideStatus.WAITING_CHARGES_APPLY_NOW], // if wait is more than 3 mins
        [1 * 60, RideStatus.CAB_IS_WAITING_FOR_YOU], // if wait is more than 1 min
    ]);
    for (const [time, stage] of stageMap) {
        if (driverWaitTimeInSeconds > time) {
            return stage;
        }
    }
    return RideStatus.CAB_HAS_ARRIVED;
};

const handleDriverToPickupStages = (currentStage: RideStatus, notification_type: string): RideStatus => {
    const notificationStageMap: Record<string, RideStatus> = {
        DRIVER_ON_THE_WAY: RideStatus.IS_ON_THE_WAY,
        DRIVER_REACHING: RideStatus.CAB_IS_ARRIVING,
    };
    const priorityOrder: RideStatus[] = [
        RideStatus.YOUR_RIDE_IS_ASSIGNED,
        RideStatus.IS_YOUR_DRIVER,
        RideStatus.IS_ON_THE_WAY,
        RideStatus.CAB_IS_ARRIVING,
    ];

    const newStage = notificationStageMap[notification_type] ?? RideStatus.IS_YOUR_DRIVER;

    if (priorityOrder.indexOf(newStage) > priorityOrder.indexOf(currentStage)) {
        return newStage;
    }
    return currentStage;
};
