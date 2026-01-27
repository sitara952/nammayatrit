import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { BannerConfig } from '../components/BannerPopups/types';
import { defaultBannerConfig } from '../components/BannerPopups/index';
import { merge } from 'lodash';

export const bannerIdToRideChecksTypeMap: Record<string, RideChecksType> = {
    tollIncludedBanner: RideChecksType.TollIncluded,
    tollAndParkingIncludedBanner: RideChecksType.TollAndParkingIncluded,
    acPreferenceBanner: RideChecksType.AcVehicle,
    parkingBanner: RideChecksType.Parking,
    driverDemandExtraBanner: RideChecksType.DriverDemandExtra,
    sorryActionBannerExtraFare: RideChecksType.DriverDemandExtra,
    thankyouRideBannerExtraFare: RideChecksType.DriverDemandExtra,
    sorryActionBanner: RideChecksType.AcVehicle,
    thankyouRideBanner: RideChecksType.AcVehicle,
    vehicleCleanlinessBanner: RideChecksType.VehicleCleanliness,
};

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export const createBannerConfig = (customConfig: DeepPartial<BannerConfig>): BannerConfig => {
    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    return merge({}, defaultBannerConfig, customConfig) as BannerConfig;
};
