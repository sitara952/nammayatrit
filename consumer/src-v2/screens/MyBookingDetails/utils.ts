import { bookingAPIDetails } from '@/readOnly/api/types/BookingAPIDetails.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { getCurrency } from '@/typescript/utils/getCurrency';
import { BusData, MetroData, TrainData } from './Types';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { DistanceUnit_distanceUnit } from '@/readOnly/api/types/Enums.gen';
import { locationAPIEntity } from '@/readOnly/api/types/LocationAPIEntity.gen';
import { formatDistanceWithUnit } from '@/src-v2/utils/common';
import { strings } from 'config-types';
import { categoryInfoResponse } from '@/readOnly/api/types/CategoryInfoResponse.gen';

export const trimAndFilterEmpty = (value: string | undefined): string | null => {
    if (typeof value === 'string') {
        const trimmed = value.trim();
        return trimmed.length > 0 ? trimmed : null;
    }
    return null;
};

export const formatLocation = (location: locationAPIEntity | null): string => {
    if (!location) {
        return '';
    }
    const addressComponents = [
        location.door,
        location.building,
        location.street,
        location.area,
        location.city,
        location.state,
        location.country,
    ]
        .map(trimAndFilterEmpty)
        .filter((value): value is string => value !== null);

    return addressComponents.join(', ');
};

export const getShortDistance = (distance: DistanceUnit_distanceUnit) => {
    if (distance === 'Kilometer') {
        return 'km';
    } else if (distance === 'Meter') {
        return 'm';
    } else if (distance === 'Yard') {
        return 'yd';
    } else if (distance === 'Mile') {
        return 'mi';
    }
    return undefined;
};

export const formatTimeDifference = (startRideTime: string | undefined, endRideTime: string | undefined): string => {
    if (!startRideTime) {
        return 'Ride not yet started';
    }
    if (!endRideTime) {
        return 'Ride currently active';
    }
    const date1 = new Date(startRideTime);
    const date2 = new Date(endRideTime);

    const diffMs = Math.abs(date2.getTime() - date1.getTime());

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return [
        ...(hours > 0 ? [`${hours} hr${hours > 1 ? 's' : ''}`] : []),
        ...(minutes > 0 ? [`${minutes} min${minutes > 1 ? 's' : ''}`] : []),
        ...(seconds > 0 || (hours === 0 && minutes === 0) ? [`${seconds} s`] : []),
    ].join(' ');
};

export const formatDurationInHoursMinutesSeconds = (rideDuration: number | undefined /* in ms */): string => {
    if (!rideDuration) {
        return 'N/A';
    }

    const diffMs = Math.abs(rideDuration * 1000);

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    return [
        ...(hours > 0 ? [`${hours} hr`] : []),
        ...(minutes > 0 ? [`${minutes} min`] : []),
        ...(seconds > 0 || (hours === 0 && minutes === 0) ? [`${seconds} s`] : []),
    ].join(' ');
};

export const getStopsWithDestination = (booking: bookingAPIDetails): locationAPIEntity[] => {
    switch (booking.TAG) {
        case 'ONE_WAY':
        case 'DRIVER_OFFER':
        case 'OneWaySpecialZoneAPIDetails':
        case 'INTER_CITY':
            return [...(booking._0.stops || []), booking._0.toLocation];
        case 'AMBULANCE':
        case 'DELIVERY':
            return [booking._0.toLocation];
        case 'RENTAL':
            return booking._0.stopLocation ? [booking._0.stopLocation] : [];
        default:
            return [];
    }
};

export const getFormattedRideDistance = (bookingDetails: bookingAPIEntity, userLanguageStrings: strings) => {
    const rideListFirstEntry = bookingDetails.rideList.at(0);

    const estimatedDistanceValue = bookingDetails.estimatedDistance || 0;
    const traveledDistanceValue = rideListFirstEntry?.traveledRideDistance?.value || 0;
    const traveledDistanceUnit = rideListFirstEntry?.traveledRideDistance?.unit || 'Meter';

    const normalizedUnit = getPreferredUnit('Meter', traveledDistanceUnit);
    const normalizedEstimatedDistance = normalizeDistance(estimatedDistanceValue, 'Meter', normalizedUnit);
    const normalizedTraveledDistance = normalizeDistance(traveledDistanceValue, traveledDistanceUnit, normalizedUnit);

    const formattedEstimatedDistance = formatDistanceWithUnit(
        normalizedEstimatedDistance,
        normalizedUnit,
        userLanguageStrings,
    );
    const formattedTraveledDistance = formatDistanceWithUnit(
        normalizedTraveledDistance,
        normalizedUnit,
        userLanguageStrings,
    );

    return [formattedEstimatedDistance, formattedTraveledDistance];
};

export const getPreferredUnit = (
    unit1: DistanceUnit_distanceUnit,
    unit2: DistanceUnit_distanceUnit,
): DistanceUnit_distanceUnit => {
    if (unit1 === 'Mile' || unit2 === 'Mile') {
        return 'Mile';
    }
    return 'Kilometer';
};

export const normalizeDistance = (
    value: number,
    fromUnit: DistanceUnit_distanceUnit,
    toUnit: DistanceUnit_distanceUnit,
): number => {
    const conversionRates: Record<DistanceUnit_distanceUnit, number> = {
        Meter: 1,
        Kilometer: 1000,
        Yard: 0.9144,
        Mile: 1609.34,
    };

    const valueInMeters = value * conversionRates[fromUnit];
    return Math.round(valueInMeters / conversionRates[toUnit]);
};

export const createBusData = (leg: legInfo, categories: categoryInfoResponse[]): BusData => {
    const busLegExtraInfo = leg?.legExtraInfo?.TAG === 'Bus' ? leg?.legExtraInfo?._0 : undefined;

    return {
        mode: 'Bus',
        header: busLegExtraInfo?.routeName ?? '',
        fare: leg?.totalFare?.amount
            ? getCurrency(leg?.totalFare?.currency) + ' ' + (leg?.totalFare?.amount?.toString() ?? '')
            : '',
        source: busLegExtraInfo?.originStop?.name ?? '',
        destination: busLegExtraInfo?.destinationStop?.name ?? '',
        categories,
    };
};

export const createMetroData = (leg: legInfo, categories: categoryInfoResponse[]): MetroData => {
    const metroLegExtraInfo = leg?.legExtraInfo?.TAG === 'Metro' ? leg?.legExtraInfo?._0 : undefined;

    return {
        mode: 'Metro',
        header: 'Metro',
        fare: leg?.totalFare?.amount
            ? getCurrency(leg?.totalFare?.currency) + ' ' + (leg?.totalFare?.amount?.toString() ?? '')
            : '',
        source: metroLegExtraInfo?.routeInfo?.[0]?.originStop?.name ?? '',
        destination: metroLegExtraInfo?.routeInfo?.[0]?.destinationStop?.name ?? '',
        categories,
    };
};

export const createTrainData = (leg: legInfo, categories: categoryInfoResponse[]): TrainData => {
    const trainLegExtraInfo = leg?.legExtraInfo?.TAG === 'Subway' ? leg?.legExtraInfo?._0 : undefined;

    return {
        fare: leg?.totalFare?.amount
            ? getCurrency(leg?.totalFare?.currency) + ' ' + (leg?.totalFare?.amount?.toString() ?? '') + '/-'
            : '',
        sourceName: trainLegExtraInfo?.routeInfo?.[0]?.originStop?.name ?? '',
        destinationName: trainLegExtraInfo?.routeInfo?.[0]?.destinationStop?.name ?? '',
        via:
            trainLegExtraInfo?.selectedServiceTier?.via === ' '
                ? '-'
                : (trainLegExtraInfo?.selectedServiceTier?.via ?? ''),
        categories,
        trainTypeCode: trainLegExtraInfo?.selectedServiceTier?.trainTypeCode ?? '',
        serviceTier: trainLegExtraInfo?.selectedServiceTier?.serviceTierName ?? '',
    };
};
