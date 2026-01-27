import { useConfigContext } from '@/typescript/context/ConfigContext';
import React, { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '../state/client/session';
import {
    selectDistanceMovedWithRideId,
    selectDriverETAWithId,
    selectPickupDistanceWithid,
    selectRideDetailsWithId,
    selectStopInfoWithId,
} from '@/typescript/state/client/ride';
import {
    selectBookedStopsWithId,
    selectBookingDetailsWithId,
    selectRideIdWithBookingId,
} from '@/typescript/state/client/booking';
import { strings } from 'config-types';
import { BookingId } from '../state/client/user';
import { getExpiryTime, getWaitingTime } from '../utils/common';
import token from '../designSystem/tokens';
import { getCurrency } from '../utils/getCurrency';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { PricingItemType, selectSelectedPricingItems } from '../state/client/search';
import { useRefsContext } from '../context/RefsContext';
import { RideChecksType } from '@/typescript/screens/SafetyModal';
import { setRideCheckType } from '../state/client/session';
import { ThemeTokens } from 'config-types';
import { useFocusEffect } from '@react-navigation/native';
import { AnimationObject } from 'lottie-react-native';
import { RideStatus } from './types.ts';
import { useRideStatus } from './useRideStatus';

export const buildDynamicIslandText = (
    texts: strings,
    stage: RideStatus,
    getWaitingCharges: () => string,
    mbStop: number | undefined,
): string => {
    const stop = (mbStop ?? 0) + 1;
    const stopText = stop === 1 ? `1st` : stop === 2 ? '2nd' : stop === 3 ? '3rd' : stop + 'th';
    switch (stage) {
        case RideStatus.CAB_IS_ARRIVING:
            return texts.Driver + ' ' + texts.CabIsArriving;
        case RideStatus.CAB_IS_WAITING_FOR_YOU:
            return texts.Driver + ' ' + texts.CabIsWaitingForYou;
        case RideStatus.CAB_HAS_ARRIVED:
            return texts.Driver + ' ' + texts.CabHasArrived;
        case RideStatus.CAB_IS_LEAVING_SOON:
            return texts.Driver + ' ' + texts.CabIsLeavingSoon;
        case RideStatus.STOP_ARRIVED:
            return stopText + ' ' + texts.StopArrived;
        case RideStatus.WAITING_AT_STOP:
            return texts.WaitingAt + ' ' + stopText + ' ' + texts.Stop;
        case RideStatus.STOP_WAITING_CHARGE_APPLY_NOW:
            return getWaitingCharges() + ' ' + texts.StopWaitingChargesApplyNow;
        case RideStatus.WAY_TO_STOP:
            return texts.OnYourWayToStop + ' ' + stopText + ' ' + texts.Stop;
        case RideStatus.WAITING_CHARGES_APPLY_NOW:
            return getWaitingCharges() + ' ' + texts.WaitingChargesApplyNow;
        case RideStatus.RIDE_STARTED:
            return texts.BridgeToDestination;
        case RideStatus.BRIDGE_TO_DESTINATION:
            return texts.BridgeToDestination;
        case RideStatus.YOUR_RIDE_IS_ASSIGNED:
            return texts.Driver + ' ' + texts.CabIsAssigned;
        case RideStatus.IS_ON_THE_WAY:
            return texts.Driver + ' ' + texts.IsOnTheWay;
        case RideStatus.IS_YOUR_DRIVER:
            return texts.Driver + ' ' + texts.IsOnTheWay;
        case RideStatus.OTP_RIDE_ASSIGNED:
            return texts.Getintothefirstcabinthepickupzone;
        case RideStatus.INTER_CITY:
            return texts.Intercity;
        case RideStatus.RENTAL:
            return texts.Rentals;
        default:
            return '';
    }
};

export type DynamicIslandDisplayProps = {
    stage: RideStatus;
    displayIconValue: string;
    displayIconUnit: string;
    displayIconColor: string | undefined;
    titleText: string;
    lottieUrl: string | AnimationObject | { uri: string } | undefined; // Supports local, remote, and JSON animations
    isLottie: boolean;
    currentVehicleServiceTier: string;
};

const defaultProps = {
    stage: RideStatus.YOUR_RIDE_IS_ASSIGNED,
    displayIconValue: '',
    displayIconUnit: '',
    displayIconColor: token?.default?.others?.accent?.primary,
    titleText: '',
    lottieUrl: require('../assets/ny-service/mt_ic_ride_assign.lottie'),
    isLottie: false,
    currentVehicleServiceTier: '',
};

const getWaitingChargesConstructor =
    (selectedPricingItems: PricingItemType[], bookingDetails: bookingAPIEntity | null) => (): string => {
        const priceSymbol = getCurrency('INR');
        const matchingServiceTier = selectedPricingItems.find(item =>
            bookingDetails?.serviceTierName ? item.serviceTierName === bookingDetails.serviceTierName : true,
        );
        const waitingCharges = matchingServiceTier?.fareBreakup?.find(
            item => item.title === 'WAITING_CHARGE_RATE_PER_MIN',
        );
        return waitingCharges?.priceWithCurrency?.amount
            ? `${priceSymbol}${waitingCharges.priceWithCurrency.amount}/min`
            : '';
    };

export const useDynamicIsland = (bookingId: BookingId | null) => {
    const [count, setCount] = useState(0);
    const bookingExpiredPopup = useRef(false);
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const stops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    const stopInfo = useAppSelector(state => selectStopInfoWithId(state, rideId));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const dispatch = useAppDispatch();
    const pickupDistance = useAppSelector(state => selectPickupDistanceWithid(state, rideId));
    const distanceMoved = useAppSelector(state => selectDistanceMovedWithRideId(state, rideId));
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const islandDisplayProps = useRef<DynamicIslandDisplayProps>(defaultProps);
    const { rideSafetyModalRef } = useRefsContext();
    // const [notificationData, _] = useContext(NotificationContext);
    const getWaitingCharges = getWaitingChargesConstructor(selectedPricingItems, bookingDetails);

    const currentVehicleServiceTier = bookingDetails?.vehicleServiceTierType ?? '';
    // Use the useRideStatus hook to determine the current stage
    const stage = useRideStatus(rideDetails, bookingDetails, stops, stopInfo);

    useEffect(() => {
        const interval = setInterval(() => {
            setCount(prevCount => prevCount + 1);
        }, 1000); // increments every second

        return () => clearInterval(interval); // cleanup interval on component unmount
    }, []);

    const handleOtpRideExpiry = () => {
        if (bookingDetails?.createdAt && !bookingExpiredPopup.current) {
            const expiryTime = getExpiryTime(bookingDetails?.createdAt, 3600);
            const [minutes, _] = expiryTime.split(':').map(Number);
            if (minutes != undefined && minutes < 0) {
                bookingExpiredPopup.current = true;
                dispatch(setRideCheckType(RideChecksType.OtpRideExpired));
                rideSafetyModalRef.current?.present();
            }
        }
    };

    useEffect(() => {
        const islandText = buildDynamicIslandText(userLanguageStrings, stage, getWaitingCharges, stopInfo?.stop);
        const { displayIconValue, displayIconColor, displayIconUnit, lottieUrl, isLottie } = getDisplayIconData(
            themeColors,
            stage,
            distanceMoved,
            pickupDistance,
            rideDetails?.driverArrivalTime,
            bookingDetails?.createdAt,
            stopInfo?.waitingTimeStart,
        );
        islandDisplayProps.current = {
            stage,
            displayIconValue,
            displayIconColor,
            displayIconUnit,
            titleText: islandText,
            lottieUrl,
            isLottie,
            currentVehicleServiceTier,
        };
    }, [bookingDetails, rideDetails, stage, count, distanceMoved, pickupDistance, stopInfo, currentVehicleServiceTier]);

    useFocusEffect(
        React.useCallback(() => {
            if (!rideDetails) handleOtpRideExpiry();
        }, [count]),
    );
    return islandDisplayProps.current;
};

const getDisplayIconData = (
    themeColors: ThemeTokens,
    islandStage: RideStatus,
    distanceMoved: number,
    pickupDistance: number,
    driverArrivalTime: string | undefined,
    bookingStartTime: string | undefined,
    stopArrivalTime: string | undefined,
) => {
    const initialValues = {
        displayIconValue: '',
        displayIconUnit: '',
        displayIconColor: themeColors.APP_THEME_COLOR,
        lottieUrl: require('../assets/ny-service/mt_ic_ride_assign.lottie'),
        isLottie: false,
    };

    return (() => {
        switch (islandStage) {
            case RideStatus.WAY_TO_STOP:
            case RideStatus.INTER_CITY:
            case RideStatus.RENTAL:
            case RideStatus.BRIDGE_TO_DESTINATION: {
                const isLottieVal = distanceMoved === 0;
                const lottieUrlVal = require('../../../src/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie');
                return {
                    ...initialValues,
                    isLottie: isLottieVal,
                    lottieUrl: lottieUrlVal,
                    displayIconValue:
                        distanceMoved > 1000
                            ? (distanceMoved / 1000).toFixed(1)
                            : parseFloat(distanceMoved.toFixed(0)).toString(),
                    displayIconUnit: distanceMoved > 1000 ? 'km' : 'meter',
                };
            }
            case RideStatus.CAB_IS_LEAVING_SOON:
            case RideStatus.WAITING_CHARGES_APPLY_NOW:
            case RideStatus.CAB_IS_WAITING_FOR_YOU:
            case RideStatus.CAB_HAS_ARRIVED: {
                if (driverArrivalTime) {
                    const waitTime = getWaitingTime(driverArrivalTime);
                    // We don't need to extract minutes anymore since we're not using them for comparison

                    // The FREE_WAITING_TIME_IN_MINUTES is now handled in FloatingRideStatus.tsx
                    // We'll set the color there based on the dynamic FREE_WAITING_TIME_IN_MINUTES value
                    return {
                        ...initialValues,
                        displayIconValue: waitTime,
                        displayIconUnit: 'mins',
                        // We'll let FloatingRideStatus.tsx handle the color change based on FREE_WAITING_TIME_IN_MINUTES
                        displayIconColor: initialValues.displayIconColor,
                    };
                } else {
                    return {
                        ...initialValues,
                        lottieUrl: require('../assets/ny-service/mt_ic_ride_waiting.lottie'),
                        isLottie: true,
                        displayIconValue: '0:00',
                        displayIconUnit: 'mins',
                    };
                }
            }
            case RideStatus.STOP_ARRIVED:
            case RideStatus.WAITING_AT_STOP:
            case RideStatus.STOP_WAITING_CHARGE_APPLY_NOW: {
                if (stopArrivalTime) {
                    const waitTime = getWaitingTime(stopArrivalTime);
                    // We don't need to extract minutes anymore since we're not using them for comparison

                    // The FREE_WAITING_TIME_IN_MINUTES is now handled in FloatingRideStatus.tsx
                    // We'll set the color there based on the dynamic FREE_WAITING_TIME_IN_MINUTES value
                    return {
                        ...initialValues,
                        displayIconValue: waitTime,
                        displayIconUnit: 'mins',
                        // We'll let FloatingRideStatus.tsx handle the color change based on FREE_WAITING_TIME_IN_MINUTES
                        displayIconColor: initialValues.displayIconColor,
                    };
                } else {
                    return {
                        ...initialValues,
                        lottieUrl: require('../assets/ny-service/mt_ic_ride_waiting.lottie'),
                        isLottie: true,
                    };
                }
            }
            case RideStatus.CAB_IS_ARRIVING:
            case RideStatus.IS_ON_THE_WAY:
            case RideStatus.IS_YOUR_DRIVER: {
                const isLottieVal = pickupDistance === 0;
                const lottieUrlVal = require('../../../src/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie');
                return {
                    ...initialValues,
                    isLottie: isLottieVal,
                    lottieUrl: lottieUrlVal,
                    displayIconValue:
                        pickupDistance > 1000 ? (pickupDistance / 1000).toFixed(1) : pickupDistance.toFixed(0),
                    displayIconUnit: pickupDistance > 1000 ? 'km' : 'meter',
                };
            }
            case RideStatus.OTP_RIDE_ASSIGNED: {
                if (bookingStartTime) {
                    const expiryTime = getExpiryTime(bookingStartTime, 3600);
                    const [minutes] = expiryTime.split(':').map(Number);
                    return {
                        ...initialValues,
                        displayIconValue: minutes !== undefined && minutes < 0 ? '00:00' : expiryTime,
                        displayIconUnit: 'mins',
                        displayIconColor:
                            minutes !== undefined && minutes < 2 ? '#FF8B61' : initialValues.displayIconColor,
                    };
                } else {
                    return {
                        ...initialValues,
                        lottieUrl: require('../assets/ny-service/mt_ic_ride_assign.lottie'),
                        isLottie: true,
                    };
                }
            }
            case RideStatus.YOUR_RIDE_IS_ASSIGNED:
                return {
                    ...initialValues,
                    lottieUrl: require('../assets/ny-service/mt_ic_ride_assign.lottie'),
                    isLottie: true,
                };
            case RideStatus.RIDE_STARTED:
                return {
                    ...initialValues,
                    lottieUrl: require('../assets/ny-service/mt_ic_bridge_to_destination.lottie'),
                    isLottie: true,
                };
            default:
                return {
                    ...initialValues,
                    lottieUrl: require('../assets/ny-service/mt_ic_ride_assign.lottie'),
                    isLottie: true,
                };
        }
    })();
};

export const useRideHeaderTitleText = (
    bookingId: BookingId | null,
): { stage: RideStatus; titleText: string; etaMinutes: number | undefined } => {
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const stops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    const stopInfo = useAppSelector(state => selectStopInfoWithId(state, rideId));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const stage = useRideStatus(rideDetails, bookingDetails, stops, stopInfo);
    const driverETA = useAppSelector(state => selectDriverETAWithId(state, rideId));

    const getWaitingCharges = (): string => {
        const currency = getCurrency('INR');
        const tierMatch = selectedPricingItems.find(item =>
            bookingDetails?.serviceTierName ? item.serviceTierName === bookingDetails.serviceTierName : true,
        );
        const charge = tierMatch?.fareBreakup?.find(item => item.title === 'WAITING_CHARGE_RATE_PER_MIN');
        return charge?.priceWithCurrency?.amount ? `${currency}${charge.priceWithCurrency.amount}/min` : '';
    };

    const titleText = buildDynamicIslandText(userLanguageStrings, stage, getWaitingCharges, stopInfo?.stop);

    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const enableDriverPickupETA = featureFlags.enableDriverPickupETA;

    const shouldShowETA =
        driverETA !== undefined &&
        [RideStatus.IS_ON_THE_WAY, RideStatus.IS_YOUR_DRIVER, RideStatus.CAB_IS_ARRIVING].includes(stage);

    return {
        stage,
        titleText: titleText,
        etaMinutes: enableDriverPickupETA && shouldShowETA ? driverETA : undefined,
    };
};
