import {
    SERVICE_TYPE_MAP,
    SERVICE_TYRE_VEHICLE_MAPPING,
    VEHICLE_MODEL_MAP,
    VEHICLE_TYPE_AC_MAP,
} from './vehicleImagesMapping';
import { ImageSourcePropType } from 'react-native';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import mtIcAuto from '../assets/vehicleImages/mt_ic_auto_real.webp';
import { getDiffBetweenTimes } from './common';

const DEFAULT_ICON = mtIcAuto;

export const getVehicleImage = (
    type: ServiceTierType_serviceTierType,
    vehicleModel: string | undefined,
): ImageSourcePropType => {
    if (!vehicleModel || vehicleModel.trim() === '') {
        return getVehicleFromType(type);
    }
    const matchImageFromServiceTier = getVehicleFromServiceTierAndModel(type, vehicleModel);
    const modelKey = vehicleModel.toLowerCase().trim();
    const matchedImage = Object.entries(VEHICLE_MODEL_MAP).find(([key]) => modelKey.includes(key))?.[1];

    return matchImageFromServiceTier ?? matchedImage ?? getVehicleFromType(type);
};

const getVehicleFromType = (type: ServiceTierType_serviceTierType): ImageSourcePropType => {
    return SERVICE_TYPE_MAP[type] || DEFAULT_ICON;
};

export const getVehicleFromServiceTierAndModel = (
    vehicleServiceTierType: ServiceTierType_serviceTierType | undefined,
    vehicleModel: string,
): ImageSourcePropType | undefined => {
    if (!vehicleServiceTierType) {
        return undefined;
    }
    const modelKey = vehicleModel.toLowerCase().trim();
    const vehicleMapping = SERVICE_TYRE_VEHICLE_MAPPING[vehicleServiceTierType];
    if (vehicleMapping && vehicleMapping[modelKey]) {
        return vehicleMapping[modelKey];
    }
    return undefined;
};
export const getVehicleFromVehicleType = (
    vehicleServiceTierType: ServiceTierType_serviceTierType | undefined,
    isAcRide: boolean | undefined = false,
): ImageSourcePropType => {
    if (!vehicleServiceTierType) {
        return DEFAULT_ICON;
    }

    return VEHICLE_TYPE_AC_MAP[vehicleServiceTierType]?.[isAcRide ? 'ac' : 'nonAc'] ?? DEFAULT_ICON;
};

type OverlappingResult = {
    overLapping: boolean;
    overLappedBookingTime: string | undefined;
};

type CheckOverlapProps = {
    rideStartTime: string;
    rideEndTime: string;
    activeBookingDetails: Array<bookingAPIEntity>;
    overlappingPollingTime: number | undefined;
};

const getUTCAfterNSeconds = (time: string, seconds: number): string => {
    const date = new Date(time);
    const resultDate = new Date(date.getTime() + seconds * 1000);
    return resultDate.toISOString();
};

const getUTCBeforeNSeconds = (time: string, seconds: number): string => {
    const date = new Date(time);
    const resultDate = new Date(date.getTime() - seconds * 1000);
    return resultDate.toISOString();
};

// Core overlap checker
const checkForNotPossible = (
    searchStartTime: string,
    searchEndTime: string,
    bookingStartTime: string,
    bookingEndTime: string,
): boolean => {
    return (
        (bookingStartTime <= searchStartTime && searchStartTime <= bookingEndTime) ||
        (bookingStartTime <= searchEndTime && searchEndTime <= bookingEndTime) ||
        (searchStartTime <= bookingStartTime && bookingEndTime <= searchEndTime) ||
        (bookingStartTime <= searchStartTime && searchEndTime <= bookingEndTime)
    );
};

const checkOverLapUtil = (
    itemBookingDetails: bookingAPIEntity,
    itemStartTime: string,
    itemEndTime: string,
    overlappingPollingTime: number = 30 * 60,
): boolean => {
    const rideScheduledTime = itemBookingDetails.rideScheduledTime
        ? getUTCBeforeNSeconds(itemBookingDetails.rideScheduledTime, overlappingPollingTime)
        : new Date().toISOString();
    const getWaitingTime = () => {
        if (itemBookingDetails.rideList[0]) {
            const driverArrivalTime = itemBookingDetails.rideList[0].driverArrivalTime;
            if (driverArrivalTime) {
                if (
                    itemBookingDetails.rideList[0].status === 'INPROGRESS' &&
                    itemBookingDetails.rideList[0].rideStartTime
                ) {
                    return getDiffBetweenTimes(driverArrivalTime, itemBookingDetails.rideList[0].rideStartTime);
                }
                return getDiffBetweenTimes(driverArrivalTime, new Date().toISOString());
            }
        }
        return 0;
    };
    const waitingTime = getWaitingTime();
    const rideEndTimeIfPresent = itemBookingDetails.returnTime;
    const rideEstimatedDuration = itemBookingDetails.estimatedDuration ?? 0;
    const rideEstimatedEndTime = rideEndTimeIfPresent
        ? rideEndTimeIfPresent
        : getUTCAfterNSeconds(
              itemBookingDetails.rideScheduledTime ?? new Date().toISOString(),
              rideEstimatedDuration + waitingTime,
          );
    const result = checkForNotPossible(itemStartTime, itemEndTime, rideScheduledTime, rideEstimatedEndTime);
    return result;
};

export const checkOverlap = ({
    rideStartTime,
    rideEndTime,
    activeBookingDetails,
    overlappingPollingTime = 30 * 60,
}: CheckOverlapProps): OverlappingResult => {
    if (activeBookingDetails?.length > 0) {
        const overLappingRide = activeBookingDetails.find(activeBookingDetail =>
            checkOverLapUtil(activeBookingDetail, rideStartTime, rideEndTime, overlappingPollingTime),
        );

        if (overLappingRide) {
            return { overLapping: true, overLappedBookingTime: overLappingRide.rideScheduledTime };
        }
    }

    return { overLapping: false, overLappedBookingTime: undefined };
};
