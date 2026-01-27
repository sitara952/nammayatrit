import { RideId } from '@/typescript/state/client/booking';
import dayjs from 'dayjs';

export const epochToHumanTime = (time: number, format: string) => {
    return dayjs(time).format(format);
};

export const getVehicleNumber = (vehicleNumber: string): string => {
    if (vehicleNumber) {
        const formatted =
            vehicleNumber.length === 10
                ? vehicleNumber
                      .split('')
                      .reduce((acc, val, index) => acc + val + (index <= 5 && index % 2 !== 0 ? ' ' : ''), '')
                : vehicleNumber
                      .split('')
                      .reduce(
                          (acc, val, index, original) =>
                              acc +
                              val +
                              (((index !== 0 && index <= 3) || index === original.length - 5) &&
                              (index % 2 !== 0 || index === original.length - 5)
                                  ? ' '
                                  : ''),
                          '',
                      );
        return formatted;
    }
    return vehicleNumber;
};

export const getChannelId = (priority: number, rideId: RideId | null, appendId: string | undefined) => {
    return priority == 0 ? rideId : rideId + '$' + appendId;
};
