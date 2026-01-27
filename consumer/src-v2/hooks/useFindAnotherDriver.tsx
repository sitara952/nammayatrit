import React, { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { useCancelBookingMutation } from '@/typescript/state/server/bookingApi';
import {
    selectNewFeatureFlags,
    setFindAnotherDriver,
    setFindAnotherDriverContext,
    setToastProps,
} from '@/typescript/state/client/session';
import {
    selectInitialDriverETAWithId,
    selectInitialPickupDistanceWithId,
    selectPickupDistanceWithid,
    selectRideDetailsWithId,
} from '@/typescript/state/client/ride';
import { setBookingId } from '@/typescript/state/client/user';
import { selectToken } from '@/typescript/state/client/auth';
import { setLegIsLoading } from '@/typescript/state/client/journey';
import Danger from '@/typescript/components/svg/Danger';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BookingId } from '@/typescript/state/client/user';
import { RideId } from '@/typescript/state/client/booking';
import { MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import { EventName, logEvent } from '@/typescript/utils/logger';

interface UseFindAnotherDriverParams {
    bookingId: BookingId | null;
    rideId: RideId | null;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
    onSuccess: () => void;
    cancellationFee: number | undefined;
    imageKey: string | undefined;
    onClose: (show: boolean) => void;
}

interface UseFindAnotherDriverReturn {
    findAnotherDriver: () => Promise<void>;
    isLoading: boolean;
}

export const useFindAnotherDriver = ({
    bookingId,
    rideId,
    multimodalProps,
    onSuccess,
    cancellationFee,
    imageKey,
    onClose,
}: UseFindAnotherDriverParams): UseFindAnotherDriverReturn => {
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const [isLoading, setIsLoading] = useState(false);
    const [cancelBooking] = useCancelBookingMutation();

    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const pickupDistance = useAppSelector(state => selectPickupDistanceWithid(state, rideId));
    const rideEntity = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const userToken = useAppSelector(selectToken);
    const initialDriverETA = useAppSelector(state => selectInitialDriverETAWithId(state, rideId));
    const initialPickupDistance = useAppSelector(state => selectInitialPickupDistanceWithId(state, rideId));

    const showErrorToast = useCallback(
        (message: string, showLogo: boolean = true) => {
            dispatch(
                setToastProps({
                    visible: true,
                    message,
                    backgroundColor: `${themeColors.Fill_negativeHigh}`,
                    autoDismissAfter: showLogo ? 2100 : 2500,
                    logo: showLogo ? <Danger /> : undefined,
                    buttons: [],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    customToast: undefined,
                    margin: undefined,
                }),
            );
        },
        [dispatch, themeColors.Fill_negativeHigh],
    );

    const findAnotherDriver = useCallback(async () => {
        // Check if reallocation is allowed
        const allowReallocation =
            (pickupDistance ?? 0) > (newFeatureFlags.pickupThresholdForReallocation ?? 0) ||
            rideEntity?.driverArrivalTime === undefined;

        if (!allowReallocation) {
            onClose(false);
            setTimeout(() => {
                showErrorToast(userLanguageStrings.DriverIsAlreadyAtPickupPointThisOptionIsntAvailable, false);
            }, 400);
            return;
        }

        setIsLoading(true);

        try {
            await cancelBooking({
                bookingId,
                data: {
                    additionalInfo: 'Change driver',
                    reasonCode: 'CHANGE_DRIVER',
                    reasonStage: 'OnAssign',
                    reallocate: true,
                },
            }).unwrap();

            logEvent(EventName.NY_USER_FIND_ANOTHER_DRIVER, {
                CancellationFee: cancellationFee,
                PickupETA: initialDriverETA,
                PickupDistance: initialPickupDistance,
                imageKey: imageKey,
                RideId: rideId,
                VehicleVariant: rideEntity?.vehicleVariant,
            });

            dispatch(
                setFindAnotherDriverContext({
                    rideId: rideId,
                }),
            );

            // Clear booking ID
            dispatch(setBookingId({ id: userToken, payload: null }));

            // Handle multimodal props if present
            if (multimodalProps) {
                dispatch(
                    setLegIsLoading({
                        id: multimodalProps.journeyId,
                        payload: {
                            legOrder: multimodalProps.currentLegOrder,
                            journeyRefresh: true,
                        },
                    }),
                );
            }

            // Delay to show success state
            setTimeout(() => {
                dispatch(setFindAnotherDriver(true));
                setIsLoading(false);
                onSuccess();
            }, 2000);
        } catch (error) {
            console.error('Find another driver error:', error);
            showErrorToast(userLanguageStrings.RidecancellationfailednPleaseretry, true);
            setIsLoading(false);
        }
    }, [
        pickupDistance,
        newFeatureFlags.pickupThresholdForReallocation,
        rideEntity?.driverArrivalTime,
        bookingId,
        userToken,
        multimodalProps,
        onSuccess,
        cancelBooking,
        dispatch,
        showErrorToast,
        userLanguageStrings.Driverisveryclosecancellationisnotallowed,
        userLanguageStrings.RidecancellationfailednPleaseretry,
    ]);

    return {
        findAnotherDriver,
        isLoading,
    };
};
