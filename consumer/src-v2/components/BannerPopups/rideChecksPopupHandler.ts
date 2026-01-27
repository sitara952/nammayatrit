import { setStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import type { RideChecks, BannerResponseType } from '@/typescript/state/client/booking';
import { BannerResponse } from '@/typescript/state/client/booking';
import type { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { BannerConfig } from './types';
import {
    driverDemandExtraBannerConfig,
    acPreferenceBannerConfig,
    driverDemandExtraConfirmationBannerConfig,
    acPreferenceConfirmationBannerConfig,
    parkingBannerConfig,
    tollIncludedBannerConfig,
    tollAndParkingBannerConfig,
    vehicleCleanlinessBannerConfig,
} from './index';
import { isVehicleTypeCab } from '@/src-v2/screens/DriverProfile/DriverProfileUtils';
import { BannerPopupsConfig } from '@/src-v2/systems/configs/types';
import { City } from 'config-types';
import type { strings } from 'config-types';

/**
 * Handles the popup dismissal for a given ride check type by updating local storage
 * and dispatching the setRideChecks action.
 *
 * @param bookingDetails - The booking details object.
 * @param currentRideChecks - The current rideChecks state.
 * @param type - The ride check type that is being dismissed.
 */
export const handleRideChecksBannerPopup = (
    bookingDetails: bookingAPIEntity,
    currentRideChecks: RideChecks,
    type: RideChecksType,
): RideChecks => {
    const payload: RideChecks =
        type === RideChecksType.TollAndParkingIncluded
            ? {
                  acVehicle: currentRideChecks.acVehicle,
                  toll: RideChecksType.Acknowledged,
                  parking: RideChecksType.Acknowledged,
                  tollAndParking: RideChecksType.Acknowledged,
                  driverDemandExtra: currentRideChecks.driverDemandExtra,
                  vehicleCleanliness: currentRideChecks.vehicleCleanliness,
              }
            : {
                  acVehicle:
                      type === RideChecksType.AcVehicle ? RideChecksType.Acknowledged : currentRideChecks.acVehicle,
                  toll: type === RideChecksType.TollIncluded ? RideChecksType.Acknowledged : currentRideChecks.toll,
                  parking: type === RideChecksType.Parking ? RideChecksType.Acknowledged : currentRideChecks.parking,
                  driverDemandExtra:
                      type === RideChecksType.DriverDemandExtra
                          ? RideChecksType.Acknowledged
                          : currentRideChecks.driverDemandExtra,
                  tollAndParking: currentRideChecks.tollAndParking,
                  vehicleCleanliness:
                      type === RideChecksType.VehicleCleanliness
                          ? RideChecksType.Acknowledged
                          : currentRideChecks.vehicleCleanliness,
              };

    const storage = { [bookingDetails.id]: payload };
    setStringItem(MMKVKey.RIDE_CHECKS, JSON.stringify(storage));
    return payload;
};

/**
determines whether a specific banner should be visible for a given city based on the banner's configuration.
 */
export const isBannerVisibleForCity = (
    city: City,
    bannerName: keyof BannerPopupsConfig,
    bannerPopupsConfig: BannerPopupsConfig,
): boolean => {
    const bannerConfig = bannerPopupsConfig[bannerName];

    if (!bannerConfig) {
        console.warn(`Banner configuration for ${bannerName} not found.`);
        return false;
    }

    if (bannerConfig.type === 'include') {
        // Check if the city is in the "include" list
        return bannerConfig.cities.includes(city);
    } else if (bannerConfig.type === 'exclude') {
        // Check if the city is NOT in the "exclude" list
        return !bannerConfig.cities.includes(city);
    }

    return false;
};

export const isTicketCreationEnabledForCity = (
    city: City,
    ticketType: string,
    bannerPopupsConfig: BannerPopupsConfig,
): boolean => {
    const ticketConfig = bannerPopupsConfig.bannerTicketCreationConfig?.[ticketType];

    if (!ticketConfig) {
        console.warn(`Ticket creation configuration for ${ticketType} not found.`);
        return false;
    }

    if (ticketConfig.type === 'include') {
        return ticketConfig.cities.includes(city);
    } else if (ticketConfig.type === 'exclude') {
        return !ticketConfig.cities.includes(city);
    }

    return false;
};

/**
 * Returns the appropriate BannerConfig based on the current rideChecks state and ride status.
 */
export const getRideChecksBannerConfig = (
    rideChecks: RideChecks | undefined,
    rideDetails: rideAPIEntity | null,
    operatingCity: City,
    bannerPopupsConfig: BannerPopupsConfig,
    hasCustomerCallOptionBeenClicked: boolean,
    hasExtraFareBannerBeenShown: boolean,
    userLanguageStrings: strings,
    hasExtraFareConfirmationBeenResponded: boolean,
    hasAcBannerBeenShown: boolean,
    hasAcConfirmationBeenResponded: boolean,
    extraFareFirstBannerResponse: BannerResponseType,
    acFirstBannerResponse: BannerResponseType,
): BannerConfig | null => {
    if (!rideChecks) return null;

    // const notInProgress = rideDetails?.status !== 'INPROGRESS';

    const shouldShowExtraFareBanner = () => {
        if (hasExtraFareBannerBeenShown) return false;
        if (hasExtraFareConfirmationBeenResponded) return false;
        return hasCustomerCallOptionBeenClicked || rideDetails?.status === 'INPROGRESS';
    };

    if (
        rideChecks.driverDemandExtra === RideChecksType.DriverDemandExtra &&
        hasExtraFareBannerBeenShown &&
        !hasExtraFareConfirmationBeenResponded &&
        extraFareFirstBannerResponse === BannerResponse.Yes &&
        isBannerVisibleForCity(operatingCity, 'driverDemandExtraBannerConfig', bannerPopupsConfig)
    ) {
        return driverDemandExtraConfirmationBannerConfig(userLanguageStrings);
    }

    if (
        rideChecks.driverDemandExtra === RideChecksType.DriverDemandExtra &&
        shouldShowExtraFareBanner() &&
        isBannerVisibleForCity(operatingCity, 'driverDemandExtraBannerConfig', bannerPopupsConfig)
    ) {
        return driverDemandExtraBannerConfig(userLanguageStrings);
    }
    if (
        rideChecks.tollAndParking === RideChecksType.TollAndParkingIncluded &&
        isBannerVisibleForCity(operatingCity, 'tollAndParkingBannerConfig', bannerPopupsConfig) &&
        isVehicleTypeCab(rideDetails?.vehicleVariant)
    ) {
        return tollAndParkingBannerConfig;
    }
    if (
        rideChecks.toll === RideChecksType.TollIncluded &&
        isBannerVisibleForCity(operatingCity, 'tollIncludedBannerConfig', bannerPopupsConfig) &&
        isVehicleTypeCab(rideDetails?.vehicleVariant)
    ) {
        return tollIncludedBannerConfig;
    }
    if (
        rideChecks.parking === RideChecksType.Parking &&
        isBannerVisibleForCity(operatingCity, 'parkingBannerConfig', bannerPopupsConfig) &&
        isVehicleTypeCab(rideDetails?.vehicleVariant)
    ) {
        return parkingBannerConfig;
    }

    if (
        rideChecks.acVehicle === RideChecksType.AcVehicle &&
        rideDetails?.status === 'INPROGRESS' &&
        hasAcBannerBeenShown &&
        !hasAcConfirmationBeenResponded &&
        acFirstBannerResponse === BannerResponse.No &&
        isBannerVisibleForCity(operatingCity, 'acPreferenceBannerConfig', bannerPopupsConfig) &&
        isVehicleTypeCab(rideDetails?.vehicleVariant)
    ) {
        return acPreferenceConfirmationBannerConfig(userLanguageStrings);
    }

    if (
        rideChecks.acVehicle === RideChecksType.AcVehicle &&
        rideDetails?.status === 'INPROGRESS' &&
        !hasAcBannerBeenShown &&
        !hasAcConfirmationBeenResponded &&
        isBannerVisibleForCity(operatingCity, 'acPreferenceBannerConfig', bannerPopupsConfig) &&
        isVehicleTypeCab(rideDetails?.vehicleVariant)
    ) {
        return acPreferenceBannerConfig(userLanguageStrings);
    }

    const acBannerCompleteOrNotNeeded =
        rideChecks.acVehicle === RideChecksType.None || rideChecks.acVehicle === RideChecksType.Acknowledged;

    if (
        rideChecks.vehicleCleanliness === RideChecksType.VehicleCleanliness &&
        rideDetails?.status === 'INPROGRESS' &&
        acBannerCompleteOrNotNeeded &&
        isBannerVisibleForCity(operatingCity, 'vehicleCleanlinessBannerConfig', bannerPopupsConfig) &&
        isVehicleTypeCab(rideDetails?.vehicleVariant)
    ) {
        return vehicleCleanlinessBannerConfig(userLanguageStrings);
    }

    return null;
};
