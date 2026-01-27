import { strings } from 'config-types';
import { convertSecondsToUTCCurrentDate } from './time';
import { getFormattedNumberInString } from './common';
import { fareBreakupAPIEntity } from '@/readOnly/api/types/FareBreakupAPIEntity.gen';
import { getCurrency } from './getCurrency';
import { ServiceTierType_serviceTierType } from '@/readOnly/api/types/Enums.gen';
import { getFreeWaitingMinutes } from './vehicleServiceTierMapping';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';
import { businessDiscountInfoAPIEntity } from '@/readOnly/api/types/BusinessDiscountInfoAPIEntity.gen';

export enum FareTypes {
    MIN_FARE,
    PLANNED_PER_KM_CHARGE,
    PLANNED_PER_KM_CHARGE_ROUND_TRIP,
    UNPLANNED_PER_KM_CHARGE,
    PER_MINUTE_CHARGE,
    PER_HOUR_CHARGE,
    BASE_FARE,
    CONGESTION_CHARGE,
    BASE_DISTANCE,
    EXTRA_PER_KM_STEP_FARE,
    DEAD_KILOMETER_FARE,
    PARKING_CHARGE,
    PER_STOP_CHARGES,
    TOLL_CHARGES,
    WAITING_CHARGE_RATE_PER_MIN,
    FREE_WAITING_TIME_IN_MINUTES,
    CONGESTION_CHARGE_PERCENTAGE,
    GOVERNMENT_CHARGE,
    NIGHT_SHIFT_CHARGE,
    NIGHT_SHIFT_START_TIME_IN_SECONDS,
    NIGHT_SHIFT_END_TIME_IN_SECONDS,
    DRIVER_MAX_EXTRA_FEE,
    EXTRA_DISTANCE_FARE,
    DRIVER_SELECTED_FARE,
    TOTAL_FARE,
    PICKUP_CHARGES,
    CUSTOMER_SELECTED_FARE,
    WAITING_CHARGES,
    EARLY_END_RIDE_PENALTY,
    WAITING_OR_PICKUP_CHARGES,
    SERVICE_CHARGE,
    FIXED_GOVERNMENT_RATE,
    PLATFORM_FEE,
    SGST,
    CUSTOMER_CANCELLATION_DUES,
    DIST_BASED_FARE,
    TIME_BASED_FARE,
    EXTRA_TIME_FARE,
    DISTANCE_FARE,
    NONE,
    PET_CHARGES,
    PRIORITY_CHARGES,
    CANCELLATION_CHARGES,
    BUSINESS_DISCOUNT,
    BUSINESS_DISCOUNT_PERCENTAGE,
}

type fareTypeObj = {
    name: FareTypes;
    order: number;
    invoiceOrder: number;
};

export const getFareType = (fareName: string): fareTypeObj => {
    switch (fareName) {
        case 'MIN_FARE':
            return { name: FareTypes.MIN_FARE, order: 0, invoiceOrder: 99 };
        case 'PLANNED_PER_KM_CHARGE':
            return { name: FareTypes.PLANNED_PER_KM_CHARGE, order: 1, invoiceOrder: 99 };
        case 'PLANNED_PER_KM_CHARGE_ROUND_TRIP':
            return { name: FareTypes.PLANNED_PER_KM_CHARGE_ROUND_TRIP, order: 2, invoiceOrder: 99 };
        case 'PER_HOUR_CHARGE':
            return { name: FareTypes.PER_HOUR_CHARGE, order: 3, invoiceOrder: 99 };
        case 'BASE_FARE':
            return { name: FareTypes.BASE_FARE, order: 4, invoiceOrder: 0 };
        case 'CONGESTION_CHARGE':
            return { name: FareTypes.CONGESTION_CHARGE, order: 19, invoiceOrder: 14 };
        case 'BASE_DISTANCE':
            return { name: FareTypes.BASE_DISTANCE, order: 5, invoiceOrder: 99 };
        case 'DEAD_KILOMETER_FARE':
            return { name: FareTypes.DEAD_KILOMETER_FARE, order: 7, invoiceOrder: 6 };
        case 'PARKING_CHARGE':
            return { name: FareTypes.PARKING_CHARGE, order: 8, invoiceOrder: 10 };
        case 'PER_STOP_CHARGES':
            return { name: FareTypes.PER_STOP_CHARGES, order: 9, invoiceOrder: 99 };
        case 'TOLL_CHARGES':
            return { name: FareTypes.TOLL_CHARGES, order: 10, invoiceOrder: 11 };
        case 'WAITING_CHARGE_RATE_PER_MIN':
            return { name: FareTypes.WAITING_CHARGE_RATE_PER_MIN, order: 11, invoiceOrder: 99 };
        case 'FREE_WAITING_TIME_IN_MINUTES':
            return { name: FareTypes.FREE_WAITING_TIME_IN_MINUTES, order: 12, invoiceOrder: 99 };
        case 'CONGESTION_CHARGE_PERCENTAGE':
            return { name: FareTypes.CONGESTION_CHARGE_PERCENTAGE, order: 13, invoiceOrder: 99 };
        case 'GOVERNMENT_CHARGE':
            return { name: FareTypes.GOVERNMENT_CHARGE, order: 14, invoiceOrder: 99 };
        case 'NIGHT_SHIFT_CHARGE':
            return { name: FareTypes.NIGHT_SHIFT_CHARGE, order: 23, invoiceOrder: 99 };
        case 'NIGHT_SHIFT_START_TIME_IN_SECONDS':
            return { name: FareTypes.NIGHT_SHIFT_START_TIME_IN_SECONDS, order: 16, invoiceOrder: 99 };
        case 'NIGHT_SHIFT_END_TIME_IN_SECONDS':
            return { name: FareTypes.NIGHT_SHIFT_END_TIME_IN_SECONDS, order: 17, invoiceOrder: 99 };
        case 'DRIVER_MAX_EXTRA_FEE':
            return { name: FareTypes.DRIVER_MAX_EXTRA_FEE, order: 24, invoiceOrder: 99 };
        case 'UNPLANNED_PER_KM_CHARGE':
            return { name: FareTypes.UNPLANNED_PER_KM_CHARGE, order: 21, invoiceOrder: 99 };
        case 'PER_MINUTE_CHARGE':
            return { name: FareTypes.PER_MINUTE_CHARGE, order: 22, invoiceOrder: 99 };
        case 'EXTRA_DISTANCE_FARE':
            return { name: FareTypes.EXTRA_DISTANCE_FARE, order: 99, invoiceOrder: 1 };
        case 'DISTANCE_FARE':
            return { name: FareTypes.DISTANCE_FARE, order: 99, invoiceOrder: 2 };
        case 'DIST_BASED_FARE':
            return { name: FareTypes.DIST_BASED_FARE, order: 99, invoiceOrder: 3 };
        case 'TIME_BASED_FARE':
            return { name: FareTypes.TIME_BASED_FARE, order: 99, invoiceOrder: 4 };
        case 'EXTRA_TIME_FARE':
            return { name: FareTypes.EXTRA_TIME_FARE, order: 99, invoiceOrder: 5 };
        case 'WAITING_CHARGES':
            return { name: FareTypes.WAITING_CHARGES, order: 99, invoiceOrder: 7 };
        case 'WAITING_OR_PICKUP_CHARGES':
            return { name: FareTypes.WAITING_OR_PICKUP_CHARGES, order: 99, invoiceOrder: 8 };
        case 'PICKUP_CHARGES':
            return { name: FareTypes.PICKUP_CHARGES, order: 99, invoiceOrder: 9 };
        case 'DRIVER_SELECTED_FARE':
            return { name: FareTypes.DRIVER_SELECTED_FARE, order: 99, invoiceOrder: 12 };
        case 'CUSTOMER_SELECTED_FARE':
            return { name: FareTypes.CUSTOMER_SELECTED_FARE, order: 99, invoiceOrder: 13 };
        case 'EARLY_END_RIDE_PENALTY':
            return { name: FareTypes.EARLY_END_RIDE_PENALTY, order: 99, invoiceOrder: 15 };
        case 'SERVICE_CHARGE':
            return { name: FareTypes.SERVICE_CHARGE, order: 99, invoiceOrder: 16 };
        case 'FIXED_GOVERNMENT_RATE':
            return { name: FareTypes.FIXED_GOVERNMENT_RATE, order: 99, invoiceOrder: 17 };
        case 'SGST':
            return { name: FareTypes.SGST, order: 99, invoiceOrder: 18 };
        case 'PLATFORM_FEE':
            return { name: FareTypes.PLATFORM_FEE, order: 99, invoiceOrder: 19 };
        case 'CUSTOMER_CANCELLATION_DUES':
            return { name: FareTypes.CUSTOMER_CANCELLATION_DUES, order: 99, invoiceOrder: 20 };
        case 'TOTAL_FARE':
            return { name: FareTypes.TOTAL_FARE, order: 99, invoiceOrder: 21 };
        case 'PET_CHARGES':
            return { name: FareTypes.PET_CHARGES, order: 99, invoiceOrder: 22 };
        case 'PRIORITY_CHARGES':
            return { name: FareTypes.PRIORITY_CHARGES, order: 99, invoiceOrder: 23 };
        case 'CANCELLATION_CHARGES':
            return { name: FareTypes.CANCELLATION_CHARGES, order: 99, invoiceOrder: 24 };
        case 'BUSINESS_DISCOUNT':
            return { name: FareTypes.BUSINESS_DISCOUNT, order: 23, invoiceOrder: 25 };
        case 'BUSINESS_DISCOUNT_PERCENTAGE':
            return { name: FareTypes.BUSINESS_DISCOUNT_PERCENTAGE, order: 23, invoiceOrder: 25 };
        default: {
            if (fareName.startsWith('EXTRA_PER_KM_STEP_FARE_'))
                return { name: FareTypes.EXTRA_PER_KM_STEP_FARE, order: 6, invoiceOrder: 99 };
            return { name: FareTypes.NONE, order: 99, invoiceOrder: 99 };
        }
    }
};

type priceWithCurrency = {
    price: number;
    currency: string;
};

export type fareEntity = {
    title: string;
    fare: priceWithCurrency;
};

export type fareDetail = {
    title: string;
    key: string;
    amountText: string;
    extraDetail: string;
    extraOrder: number | undefined;
};

const emptyFare: fareDetail = {
    title: '',
    key: '',
    amountText: '',
    extraDetail: '',
    extraOrder: undefined,
};

const getKey = (fareType: FareTypes, userLanguageStrings: strings) => {
    switch (fareType) {
        case FareTypes.MIN_FARE:
            return userLanguageStrings.BaseFare;
        case FareTypes.PLANNED_PER_KM_CHARGE:
            return userLanguageStrings.Perkmcharges;
        case FareTypes.PLANNED_PER_KM_CHARGE_ROUND_TRIP:
            return userLanguageStrings.PerkmchargesRoundTrip;
        case FareTypes.PER_HOUR_CHARGE:
            return userLanguageStrings.Perhourcharges;
        case FareTypes.DEAD_KILOMETER_FARE:
            return userLanguageStrings.PickupCharges;
        case FareTypes.PARKING_CHARGE:
            return userLanguageStrings.ParkingCharges;
        case FareTypes.PER_STOP_CHARGES:
            return userLanguageStrings.PerStopCharges;
        case FareTypes.TOLL_CHARGES:
            return userLanguageStrings.TollChargesStr;
        case FareTypes.PET_CHARGES:
            return userLanguageStrings.PetCharges;
        case FareTypes.PRIORITY_CHARGES:
            return 'Priority Charges';
        case FareTypes.BUSINESS_DISCOUNT:
        case FareTypes.BUSINESS_DISCOUNT_PERCENTAGE:
            return userLanguageStrings.BusinessDiscount;
        default:
            return '';
    }
};

const getFareDetail = (
    fares: Array<fareBreakupAPIEntity>,
    fareType: FareTypes,
    userLanguageStrings: strings,
): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == fareType).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: getKey(fareType, userLanguageStrings),
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getPerKmCharges = (
    fares: Array<fareBreakupAPIEntity>,
    roundTrip: boolean,
    userLanguageStrings: strings,
): fareDetail => {
    const targetFare = roundTrip
        ? fares.filter(v => getFareType(v.description).name == FareTypes.PLANNED_PER_KM_CHARGE_ROUND_TRIP).at(0)
        : fares.filter(v => getFareType(v.description).name == FareTypes.PLANNED_PER_KM_CHARGE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: roundTrip ? userLanguageStrings.PerkmchargesRoundTrip : userLanguageStrings.Perkmcharges,
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getBaseFare = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): fareDetail => {
    const baseFare = fares.filter(v => getFareType(v.description).name == FareTypes.BASE_FARE).at(0);
    if (baseFare != undefined && baseFare.amountWithCurrency.amount > 0) {
        return {
            title: baseFare.description,
            key: userLanguageStrings.BaseFare,
            amountText:
                getCurrency(baseFare.amountWithCurrency.currency) +
                getFormattedNumberInString(baseFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getBaseFareWithBaseDistance = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): fareDetail => {
    const baseFare = fares.filter(v => getFareType(v.description).name == FareTypes.BASE_FARE).at(0);
    const baseDistance = fares.filter(v => getFareType(v.description).name == FareTypes.BASE_DISTANCE).at(0);
    if (baseFare != undefined && baseDistance != undefined && baseFare.amountWithCurrency.amount > 0) {
        return {
            title: baseFare.description,
            key: userLanguageStrings.MinFareupto + (baseDistance.amountWithCurrency.amount / 1000.0).toString() + ' km',
            amountText:
                getCurrency(baseFare.amountWithCurrency.currency) +
                getFormattedNumberInString(baseFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

// todo - to get baseDistance

const getStepFare = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): Array<fareDetail> => {
    const EXTRA_KEY_PREFIX = 'EXTRA_PER_KM_STEP_FARE_';
    const targetFares = fares
        .filter(item => item.description.startsWith(EXTRA_KEY_PREFIX))
        .sort((allFares, b) =>
            parseInt(allFares.description.replace(EXTRA_KEY_PREFIX, '').split('_').at(0) || '0') <
            parseInt(b.description.replace(EXTRA_KEY_PREFIX, '').split('_').at(0) || '0')
                ? -1
                : 1,
        );
    if (targetFares.length != 0) {
        return targetFares.map((item, index) => {
            const limitArr = item.description.replace(EXTRA_KEY_PREFIX, '').split('_');
            const lowerLimit =
                limitArr[0] && limitArr[0] != '' ? (parseInt(limitArr[0]) / 1000).toString() + 'km' : '0km';
            const upperLimit =
                (limitArr[1] &&
                    (limitArr[1] == 'Above' ? '+' : '-' + (parseInt(limitArr[1]) / 1000).toString() + 'km')) ||
                '+';
            return {
                title: item.description,
                key: userLanguageStrings.FareFor(lowerLimit, upperLimit),
                amountText:
                    getCurrency(item.amountWithCurrency.currency) +
                    getFormattedNumberInString(item.amountWithCurrency.amount, 2) +
                    '/km',
                extraDetail: '',
                extraOrder: index + 1,
            };
        });
    }
    return [];
};

const getExtraDistanceFare = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.UNPLANNED_PER_KM_CHARGE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: userLanguageStrings.ExtraDistanceFare,
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2) +
                '/km',
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getExtraTimeFare = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.PER_MINUTE_CHARGE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: userLanguageStrings.ExtraTimeFare,
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2) +
                '/min',
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getWaitingCharges = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): fareDetail => {
    const waitingFare = fares
        .filter(v => getFareType(v.description).name == FareTypes.WAITING_CHARGE_RATE_PER_MIN)
        .at(0);
    const waitingTime = fares
        .filter(v => getFareType(v.description).name == FareTypes.FREE_WAITING_TIME_IN_MINUTES)
        .at(0);
    if (waitingFare != undefined && waitingTime != undefined && waitingFare.amountWithCurrency.amount > 0) {
        return {
            title: waitingFare.description,
            key: userLanguageStrings.WaitingChargesAfter(waitingTime.amountWithCurrency.amount),
            amountText:
                getCurrency(waitingFare.amountWithCurrency.currency) +
                getFormattedNumberInString(waitingFare.amountWithCurrency.amount, 2) +
                '/min',
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getCongestionCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.CONGESTION_CHARGE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Congestion Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getCongestionChargesPercentage = (
    fares: Array<fareBreakupAPIEntity>,
    userLanguageStrings: strings,
): fareDetail => {
    const targetFare = fares
        .filter(v => getFareType(v.description).name == FareTypes.CONGESTION_CHARGE_PERCENTAGE)
        .at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: userLanguageStrings.CongestionCharges,
            amountText: getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2) + '%',
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getBusinessDiscount = (
    fares: Array<fareBreakupAPIEntity>,
    userLanguageStrings: strings,
    businessDiscountInfo: businessDiscountInfoAPIEntity | undefined,
): fareDetail => {
    // First check if businessDiscountInfo is provided
    if (businessDiscountInfo && businessDiscountInfo.businessDiscountPercentage > 0) {
        return {
            title: 'Business Discount',
            key: getKey(FareTypes.BUSINESS_DISCOUNT_PERCENTAGE, userLanguageStrings),
            amountText: getFormattedNumberInString(businessDiscountInfo.businessDiscountPercentage, 0) + '%',
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    // Fallback to checking fares array for BUSINESS_DISCOUNT or BUSINESS_DISCOUNT_PERCENTAGE
    const businessDiscountPercentage = fares
        .filter(v => getFareType(v.description).name == FareTypes.BUSINESS_DISCOUNT_PERCENTAGE)
        .at(0);
    if (businessDiscountPercentage != undefined && businessDiscountPercentage.amountWithCurrency.amount > 0) {
        return {
            title: businessDiscountPercentage.description,
            key: getKey(FareTypes.BUSINESS_DISCOUNT_PERCENTAGE, userLanguageStrings),
            amountText: getFormattedNumberInString(businessDiscountPercentage.amountWithCurrency.amount, 0) + '%',
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    const businessDiscount = fares.filter(v => getFareType(v.description).name == FareTypes.BUSINESS_DISCOUNT).at(0);
    if (businessDiscount != undefined && businessDiscount.amountWithCurrency.amount > 0) {
        return {
            title: businessDiscount.description,
            key: getKey(FareTypes.BUSINESS_DISCOUNT, userLanguageStrings),
            amountText:
                getCurrency(businessDiscount.amountWithCurrency.currency) +
                getFormattedNumberInString(businessDiscount.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getGovernmentCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.GOVERNMENT_CHARGE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Government Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2) +
                '/min',
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getPetCharges = (
    fares: Array<fareBreakupAPIEntity>,
    userLanguageStrings: strings,
    isPetRide: boolean,
): fareDetail => {
    const petFare = fares.find(fare => getFareType(fare.description).name === FareTypes.PET_CHARGES);
    if (petFare && petFare.amountWithCurrency.amount > 0 && isPetRide) {
        return {
            title: petFare.description,
            key: userLanguageStrings.PetCharges,
            amountText:
                getCurrency(petFare.amountWithCurrency.currency) +
                getFormattedNumberInString(petFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getPriorityCharges = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.PRIORITY_CHARGES).at(0);
    if (targetFare && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: userLanguageStrings.PriorityCharges,
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};
const getNightCharges = (
    fares: Array<fareBreakupAPIEntity>,
    showNightCharges: boolean,
    userLanguageStrings: strings,
): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.NIGHT_SHIFT_CHARGE).at(0);
    const nightStartTime = fares
        .filter(v => getFareType(v.description).name == FareTypes.NIGHT_SHIFT_START_TIME_IN_SECONDS)
        .at(0);
    const nightEndTime = fares
        .filter(v => getFareType(v.description).name == FareTypes.NIGHT_SHIFT_END_TIME_IN_SECONDS)
        .at(0);
    const showDescription = nightEndTime != undefined && nightStartTime != undefined && targetFare != undefined;
    if (targetFare != undefined || showDescription) {
        const startSecond = nightStartTime?.amountWithCurrency.amount ?? 0;
        const endSecond = nightEndTime?.amountWithCurrency.amount ?? 0;
        const startTime = convertSecondsToUTCCurrentDate(startSecond);
        const endTime = convertSecondsToUTCCurrentDate(endSecond);
        const currentTime = new Date();

        if (
            showNightCharges ||
            (currentTime >= startTime && currentTime <= endTime && targetFare.amountWithCurrency.amount > 0)
        ) {
            return {
                title: targetFare.description,
                key: userLanguageStrings.NightCharge,
                amountText:
                    getCurrency(targetFare.amountWithCurrency.currency) +
                    getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
                extraDetail: showNightCharges
                    ? userLanguageStrings.NightChargesBetween(
                          startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
                          endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
                      )
                    : userLanguageStrings.NightChargesApplicable(
                          startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
                          endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }),
                      ),
                extraOrder: undefined,
            };
        }
    }
    return emptyFare;
};

const getDriverFee = (fares: Array<fareBreakupAPIEntity>, userLanguageStrings: strings): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.DRIVER_MAX_EXTRA_FEE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Driver Additions**',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: userLanguageStrings.DriverExtra,
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getDriverExtraDistanceFare = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.EXTRA_DISTANCE_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Optional Driver Request',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getDriverSelectedFare = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.DRIVER_SELECTED_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Driver Addition**',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail:
                '**Drivers may optionally request 10% of base fare (rounded to nearest Rs.10) to cover other factors like traffic, chances of return trip etc.',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};
const getTotalFare = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.TOTAL_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Total Fare',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};
const getPickupCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.PICKUP_CHARGES).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Pickup Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getUserWaitCharges = (
    fares: Array<fareBreakupAPIEntity>,
    isSpecialZone: boolean,
    vehicleServiceTier: ServiceTierType_serviceTierType,
): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.WAITING_CHARGES).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        const freeWaitingMinutes = getFreeWaitingMinutes(vehicleServiceTier);
        return {
            title: targetFare.description,
            key: isSpecialZone ? 'Pickup Charges' : 'Waiting Charges**',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail:
                isSpecialZone || !freeWaitingMinutes
                    ? ''
                    : `** Waiting charge is zero for the first ${freeWaitingMinutes} minutes`,
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getCustomerSelectedFare = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.CUSTOMER_SELECTED_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Customer Addition*',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '*Extra amount added by the customer to increase the chances of getting a ride.',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getEarlyRidePenalty = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.EARLY_END_RIDE_PENALTY).at(0);
    const currencySymbol = CURRENCY_SYMBOL.value;
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Early Ride End Charges^',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: `^Ending a ride early incurs additional charges amounting to half the fare of the untravelled distance (max. ${currencySymbol}50)`,
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getWaitOrPickupCharges = (
    fares: Array<fareBreakupAPIEntity>,
    isSpecialZone: boolean,
    vehicleServiceTier: ServiceTierType_serviceTierType,
): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.WAITING_OR_PICKUP_CHARGES).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        const freeWaitingMinutes = getFreeWaitingMinutes(vehicleServiceTier);
        return {
            title: targetFare.description,
            key: isSpecialZone ? 'Pickup Charges' : `Waiting Charges**`,
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail:
                isSpecialZone || !freeWaitingMinutes
                    ? ''
                    : `** Waiting charge is zero for the first ${freeWaitingMinutes} minutes`,
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getServiceCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.SERVICE_CHARGE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Service Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getFixedGovernmentCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.FIXED_GOVERNMENT_RATE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Ride GST (5%)',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getPlatformFee = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.PLATFORM_FEE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Platform Fee',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getSGST = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.SGST).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Taxes (GST)',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getCancellationDues = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.CUSTOMER_CANCELLATION_DUES).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Cancellation Dues',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getCancellationCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.CANCELLATION_CHARGES).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Cancellation Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getDistanceCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.DIST_BASED_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Distance Based Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getTimeCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.TIME_BASED_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Time Based Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getExtraTimeCharges = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.EXTRA_TIME_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Extra Time Charges',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getDistanceFare = (fares: Array<fareBreakupAPIEntity>): fareDetail => {
    const targetFare = fares.filter(v => getFareType(v.description).name == FareTypes.DISTANCE_FARE).at(0);
    if (targetFare != undefined && targetFare.amountWithCurrency.amount > 0) {
        return {
            title: targetFare.description,
            key: 'Distance Fare',
            amountText:
                getCurrency(targetFare.amountWithCurrency.currency) +
                getFormattedNumberInString(targetFare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

const getAnyFare = (fare: fareBreakupAPIEntity): fareDetail => {
    if (fare.amountWithCurrency.amount > 0) {
        const key = fare.description
            .split('_')
            .map(v => (v.length > 0 ? v.at(0) + v.substring(1).toLowerCase() : ''))
            .join(' ')
            .trim();
        return {
            title: fare.description,
            key,
            amountText:
                getCurrency(fare.amountWithCurrency.currency) +
                getFormattedNumberInString(fare.amountWithCurrency.amount, 2),
            extraDetail: '',
            extraOrder: undefined,
        };
    }
    return emptyFare;
};

// this method will return ab fareDetail object for any given fareType if present in given list of fareEntities
export const getFare = (
    fares: Array<fareBreakupAPIEntity>,
    fareType: FareTypes,
    isSpecialZone: boolean,
    forInvoice: boolean,
    userLanguageStrings: strings,
    isPetRide: boolean,
    vehicleServiceTier: ServiceTierType_serviceTierType,
    businessDiscountInfo: businessDiscountInfoAPIEntity | undefined,
): fareDetail => {
    switch (fareType) {
        case FareTypes.MIN_FARE:
        case FareTypes.PER_HOUR_CHARGE:
        case FareTypes.DEAD_KILOMETER_FARE:
        case FareTypes.PARKING_CHARGE:
        case FareTypes.PER_STOP_CHARGES:
        case FareTypes.TOLL_CHARGES:
            return getFareDetail(fares, fareType, userLanguageStrings);
        case FareTypes.UNPLANNED_PER_KM_CHARGE:
            return getExtraDistanceFare(fares, userLanguageStrings);
        case FareTypes.PER_MINUTE_CHARGE:
            return getExtraTimeFare(fares, userLanguageStrings);
        case FareTypes.BASE_FARE:
            return forInvoice
                ? getBaseFare(fares, userLanguageStrings)
                : getBaseFareWithBaseDistance(fares, userLanguageStrings);
        case FareTypes.WAITING_CHARGE_RATE_PER_MIN:
            return getWaitingCharges(fares, userLanguageStrings);
        case FareTypes.CONGESTION_CHARGE:
            return getCongestionCharges(fares);
        case FareTypes.CONGESTION_CHARGE_PERCENTAGE:
            return getCongestionChargesPercentage(fares, userLanguageStrings);
        case FareTypes.GOVERNMENT_CHARGE:
            return getGovernmentCharges(fares);
        case FareTypes.DRIVER_MAX_EXTRA_FEE:
            return getDriverFee(fares, userLanguageStrings);
        case FareTypes.DISTANCE_FARE:
            return getDistanceFare(fares);
        case FareTypes.EXTRA_DISTANCE_FARE:
            return getDriverExtraDistanceFare(fares);
        case FareTypes.DRIVER_SELECTED_FARE:
            return getDriverSelectedFare(fares);
        case FareTypes.TOTAL_FARE:
            return getTotalFare(fares);
        case FareTypes.PICKUP_CHARGES:
            return getPickupCharges(fares);
        case FareTypes.CUSTOMER_SELECTED_FARE:
            return getCustomerSelectedFare(fares);
        case FareTypes.WAITING_CHARGES:
            return getUserWaitCharges(fares, isSpecialZone, vehicleServiceTier);
        case FareTypes.EARLY_END_RIDE_PENALTY:
            return getEarlyRidePenalty(fares);
        case FareTypes.WAITING_OR_PICKUP_CHARGES:
            return getWaitOrPickupCharges(fares, isSpecialZone, vehicleServiceTier);
        case FareTypes.SERVICE_CHARGE:
            return getServiceCharges(fares);
        case FareTypes.FIXED_GOVERNMENT_RATE:
            return getFixedGovernmentCharges(fares);
        case FareTypes.PLATFORM_FEE:
            return getPlatformFee(fares);
        case FareTypes.SGST:
            return getSGST(fares);
        case FareTypes.CUSTOMER_CANCELLATION_DUES:
            return getCancellationDues(fares);
        case FareTypes.CANCELLATION_CHARGES:
            return getCancellationCharges(fares);
        case FareTypes.DIST_BASED_FARE:
            return getDistanceCharges(fares);
        case FareTypes.TIME_BASED_FARE:
            return getTimeCharges(fares);
        case FareTypes.EXTRA_TIME_FARE:
            return getExtraTimeCharges(fares);
        case FareTypes.PET_CHARGES:
            return getPetCharges(fares, userLanguageStrings, isPetRide);
        case FareTypes.PRIORITY_CHARGES:
            return getPriorityCharges(fares, userLanguageStrings);
        case FareTypes.BUSINESS_DISCOUNT:
        case FareTypes.BUSINESS_DISCOUNT_PERCENTAGE:
            return getBusinessDiscount(fares, userLanguageStrings, businessDiscountInfo);
        case FareTypes.NIGHT_SHIFT_END_TIME_IN_SECONDS:
        case FareTypes.NIGHT_SHIFT_START_TIME_IN_SECONDS:
        case FareTypes.BASE_DISTANCE:
        case FareTypes.FREE_WAITING_TIME_IN_MINUTES:
        case FareTypes.EXTRA_PER_KM_STEP_FARE:
        case FareTypes.NIGHT_SHIFT_CHARGE:
        case FareTypes.NONE:
        default:
            return emptyFare;
    }
};

// this method will return a list of fareDetail objects for given fareEntity objects list
export const getEstimatesFares = (
    fares: Array<fareBreakupAPIEntity>,
    userLanguageStrings: strings,
    showNightCharges: boolean,
    isRoundTrip: boolean,
    isPetRide: boolean,
    selectedTripType: 'PERSONAL' | 'BUSINESS' | undefined,
    vehicleServiceTier: ServiceTierType_serviceTierType = 'UNKNOWN_SERVICE_TYPE',
    businessDiscountInfo: businessDiscountInfoAPIEntity | undefined,
    showFareKeyList: string[] = [],
): Array<fareDetail> => {
    // Filter out BUSINESS_DISCOUNT and BUSINESS_DISCOUNT_PERCENTAGE from fare breakup when businessDiscountInfo is available
    const filteredFares = businessDiscountInfo
        ? fares.filter(
              v =>
                  getFareType(v.description).name !== FareTypes.BUSINESS_DISCOUNT &&
                  getFareType(v.description).name !== FareTypes.BUSINESS_DISCOUNT_PERCENTAGE,
          )
        : fares;

    const allFares = filteredFares
        .map(v => {
            if (!v.description.startsWith('EXTRA_PER_KM_STEP_FARE_')) {
                return getFare(
                    filteredFares,
                    getFareType(v.description).name,
                    false,
                    false,
                    userLanguageStrings,
                    isPetRide,
                    vehicleServiceTier,
                    businessDiscountInfo,
                );
            }
            return emptyFare;
        })
        .filter(v => {
            const fareType = getFareType(v.title).name;
            // Filter out business discount if trip type is not BUSINESS
            if (
                (fareType === FareTypes.BUSINESS_DISCOUNT || fareType === FareTypes.BUSINESS_DISCOUNT_PERCENTAGE) &&
                selectedTripType !== 'BUSINESS'
            ) {
                return false;
            }
            return v.key != '';
        });

    // Add business discount from businessDiscountInfo if available and trip type is BUSINESS
    const businessDiscountDetail =
        businessDiscountInfo && selectedTripType === 'BUSINESS' && businessDiscountInfo.businessDiscountPercentage > 0
            ? getBusinessDiscount(fares, userLanguageStrings, businessDiscountInfo)
            : null;
    const businessDiscountFare =
        businessDiscountDetail && businessDiscountDetail.key !== '' ? [businessDiscountDetail] : [];

    const stepFare = getStepFare(fares, userLanguageStrings);
    const nightFare = [getNightCharges(fares, showNightCharges, userLanguageStrings)];
    const Perkmcharges = [getPerKmCharges(fares, isRoundTrip, userLanguageStrings)];
    const combinedFares = [...allFares, ...businessDiscountFare, ...stepFare, ...nightFare, ...Perkmcharges];

    return combinedFares
        .slice()
        .sort((v1, v2) => {
            const order = getFareType(v1.title).order - getFareType(v2.title).order;
            const extraOrder =
                v1.extraOrder != undefined && v2.extraOrder != undefined ? v1.extraOrder - v2.extraOrder : 0;
            return order !== 0 ? order : extraOrder;
        })
        .filter(v => showFareKeyList.length === 0 || showFareKeyList.includes(v.title));
};

const getMerchantSpecificFilteredFares = (merchant: string): string[] => {
    switch (merchant) {
        case 'yatriSathi':
            return [
                'EXTRA_DISTANCE_FARE',
                'TOTAL_FARE',
                'BASE_DISTANCE_FARE',
                'NIGHT_SHIFT_CHARGE',
                'CGST',
                'PLATFORM_FEE',
                'FIXED_GOVERNMENT_RATE',
                'SERVICE_CHARGE',
                'PICKUP_CHARGES',
                'DEAD_KILOMETER_FARE',
                'PLATFORM_FEE',
                'SGST',
            ];
        default:
            return [];
    }
};

const getFilteredFares = (appName: string, fares: fareBreakupAPIEntity[]): fareBreakupAPIEntity[] => {
    const merchantSpecificFares = getMerchantSpecificFilteredFares(appName);
    if (appName === 'yatriSathi') {
        return fares
            .filter(fare => !merchantSpecificFares.includes(fare.description))
            .map(item => ({
                ...item,
                amount:
                    item.description === 'BASE_FARE'
                        ? getMerchantSpecificBaseFare(fares, appName, item.amount)
                        : item.amount,
                amountWithCurrency: {
                    amount:
                        item.description === 'BASE_FARE'
                            ? getMerchantSpecificBaseFare(fares, appName, item.amountWithCurrency.amount)
                            : item.amountWithCurrency.amount,
                    currency: item.amountWithCurrency.currency,
                },
            }));
    } else {
        return fares;
    }
};

const getMerchantSpecificBaseFare = (fares: fareBreakupAPIEntity[], appName: string, baseFare: number): number => {
    if (appName === 'yatriSathi') {
        const totalFare = fares
            .filter(item =>
                [
                    'EXTRA_DISTANCE_FARE',
                    'NIGHT_SHIFT_CHARGE',
                    'PICKUP_CHARGES',
                    'DEAD_KILOMETER_FARE',
                    'SERVICE_CHARGE',
                    'PLATFORM_FEE',
                    'CGST',
                    'SGST',
                ].includes(item.description),
            )
            .reduce((sum, item) => {
                return sum + item.amount;
            }, 0);

        return totalFare + baseFare;
    } else {
        return baseFare;
    }
};

export const getInvoiceFare = (
    fares: Array<fareBreakupAPIEntity>,
    appName: string,
    userLanguageStrings: strings,
    isSpecialZone: boolean,
    isPetRide: boolean,
    vehicleServiceTier: ServiceTierType_serviceTierType = 'UNKNOWN_SERVICE_TYPE',
) => {
    const filteredFares = getFilteredFares(appName, fares);
    const allFares = filteredFares
        .map(v => {
            if (getFareType(v.description).name !== FareTypes.NONE)
                return getFare(
                    filteredFares,
                    getFareType(v.description).name,
                    isSpecialZone,
                    true,
                    userLanguageStrings,
                    isPetRide,
                    vehicleServiceTier,
                    undefined,
                );
            else return getAnyFare(v);
        })
        .filter(v => v.key !== '');
    const nightFare = getNightCharges(filteredFares, true, userLanguageStrings);
    const combinedFares = [...allFares, nightFare];
    return combinedFares.slice().sort((v1, v2) => {
        const order = getFareType(v1.title).invoiceOrder - getFareType(v2.title).invoiceOrder;
        return order;
    });
};

export const getAccumulatedCancellationCharges = (fareBreakup: Array<fareBreakupAPIEntity> | undefined): number => {
    if (!fareBreakup || fareBreakup.length === 0) return 0;
    const cancellationFare = fareBreakup.find(
        item => getFareType(item.description).name === FareTypes.CANCELLATION_CHARGES,
    );
    return cancellationFare?.amountWithCurrency?.amount ?? 0;
};
