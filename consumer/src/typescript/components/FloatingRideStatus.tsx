import mtIcDriverAssigned from '../assets/mt-ic-driver-assigned.webp';
import mtIcDriverAssignedCab from '../assets/mt_ic_driver_assigned_cab.webp';
import { isUndefined } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { ImageBackground } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    interpolateColor,
    SharedValue,
    SlideInDown,
    SlideOutDown,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { tailwind } from '../tailwindTheme/tailwind';
import { useDynamicIsland } from '../hooks/useDynamicIsland';
import { RideStatus } from '@/typescript/hooks/types.ts';
import { BookingId } from '../state/client/user';
import LottieView from 'lottie-react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import tripStartedBg from '../assets/mt-ic-trip-started-bg.webp';
import tripStartedLottie from '../assets/ny-service/mt_ic_trip_started.json';
import autoTripStarted from '../assets/mt-ic-auto-trip-started.webp';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { FloatingView } from './FloatingView';
import {
    selectDriverAssignedShown,
    selectTripStartedLottieShown,
    setDriverAssignedShown,
    setTripStartedLottieShown,
} from '../state/client/booking';
import { useAppSelector, useAppDispatch } from '../state/hooks';
import { selectSelectedPricingItems, PricingItemType } from '../state/client/search';
// We don't need this import anymore
import { useConfigContext } from '../context/ConfigContext';
import { strings as StringsType } from 'config-types/src/domain/results/strings';
import { selectAppConfig } from '../state/client/session';
import { DismissibleSwipe } from '@/src-v2/components/DismissibleSwipe';

interface FloatingRideStatusProps {
    status: 'DriverArrived' | 'TripStarted' | 'DriverAssigned' | undefined;
    bookingId: BookingId | null;
    sheetAnimatedPosition?: SharedValue<number>;
    verticalPosition: number | undefined;
}

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

// Wrapper component to handle the dynamic FREE_WAITING_TIME_IN_MINUTES value
const DriverArrivedWrapper = ({
    displayIconValue,
    displayIconColor,
    currentVehicleServiceTier,
    strings,
}: {
    displayIconValue: string;
    displayIconColor: string | undefined;
    currentVehicleServiceTier: string;
    strings: StringsType;
}) => {
    // Get the selected pricing items which contain the FREE_WAITING_TIME_IN_MINUTES
    // We'll use selectSelectedPricingItems directly in the getFreeWaitingTimeInMinutes function

    // Find FREE_WAITING_TIME_IN_MINUTES from pricing items
    const getFreeWaitingTimeInMinutes = (pricingItems: PricingItemType[]) => {
        try {
            if (pricingItems && pricingItems.length > 0) {
                const pricingItem = pricingItems[0];

                // Check if fareBreakup exists and contains FREE_WAITING_TIME_IN_MINUTES
                if (pricingItem?.fareBreakup && Array.isArray(pricingItem.fareBreakup)) {
                    // Look for title === 'FREE_WAITING_TIME_IN_MINUTES'
                    for (const item of pricingItem.fareBreakup) {
                        // Safely access properties without type assertions
                        if (item.title === 'FREE_WAITING_TIME_IN_MINUTES') {
                            // Check if price property exists and is a valid number
                            // Use unknown instead of any to satisfy the lint rule
                            //eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
                            const price = (item as unknown as { price: string | number | undefined }).price;
                            if (price !== undefined && !isNaN(Number(price))) {
                                // Found FREE_WAITING_TIME_IN_MINUTES
                                return Number(price);
                            }
                        }
                    }
                }
            }
        } catch {
            // Error getting FREE_WAITING_TIME_IN_MINUTES
        }

        // Default to 5 minutes if not found
        return 5;
    };

    // Get the pricing items from the Redux store
    const pricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const freeWaitingTimeInMinutes = getFreeWaitingTimeInMinutes(pricingItems);

    // Parse the displayIconValue (MM:SS format) to check if we've exceeded the free waiting time
    // Get the color based on waiting time
    const getUpdatedDisplayIconColor = (): string | undefined => {
        if (displayIconValue) {
            const parts = displayIconValue.split(':');
            if (parts.length === 2) {
                const minutes = Number(parts[0]) || 0;
                // We're using seconds in the total calculation below
                const seconds = Number(parts[1]) || 0;

                // Calculate total seconds for more accurate comparison
                const totalWaitingSeconds = minutes * 60 + seconds;
                const freeWaitingSeconds = freeWaitingTimeInMinutes * 60;

                // Only show "Charges Apply" if waiting time exceeds the free waiting time
                if (totalWaitingSeconds > freeWaitingSeconds) {
                    return '#FF8B61'; // Color for "Charges Apply"
                }
            }
        }
        // Use the theme color from useDynamicIsland.ts for consistency
        return displayIconColor;
    };

    // Get the updated color
    const updatedColor = getUpdatedDisplayIconColor();

    return (
        <DriverArrived
            displayIconValue={displayIconValue}
            displayIconColor={updatedColor}
            currentVehicleServiceTier={currentVehicleServiceTier}
            strings={strings}
        />
    );
};

const DriverArrived = ({
    displayIconValue,
    displayIconColor,
    currentVehicleServiceTier,
    strings,
}: {
    displayIconValue: string;
    displayIconColor: string | undefined;
    currentVehicleServiceTier: string;
    strings: StringsType;
}) => {
    const imgSrc = currentVehicleServiceTier === 'AUTO_RICKSHAW' ? mtIcDriverAssigned : mtIcDriverAssignedCab;
    const rideWaitingStatus = useSharedValue(0);

    // Update animation based on displayIconColor
    React.useEffect(() => {
        if (displayIconColor === '#FF8B61') {
            rideWaitingStatus.value = withTiming(1);
        }
    }, [displayIconColor]);

    const animatedBgStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                rideWaitingStatus.value,
                [0, 1],
                [displayIconColor ?? '#FFD255', displayIconColor ?? '#FFD255'],
            ),
        };
    });
    const [showDriverImg, setShowDriverImg] = React.useState(true);

    React.useEffect(() => {
        const delay = setTimeout(() => {
            setShowDriverImg(false);
        }, 2500);

        return () => clearTimeout(delay);
    }, []);
    return (
        <Animated.View
            style={[tailwind.style('h-[240px] w-[240px] rounded-full z-[99]', `self-center`), animatedBgStyle]}>
            {!showDriverImg ? (
                <Animated.View entering={FadeIn.delay(1000)}>
                    <Animated.Text
                        style={tailwind.style(
                            `text-[${colors.gray200}] text-center text-[18px] font-extrabold z-10 pt-4`,
                        )}>
                        {displayIconValue}
                    </Animated.Text>

                    {displayIconColor === '#FF8B61' ? (
                        <Animated.Text
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style(
                                `text-[14px] text-[${colors.gray200}] font-areaNormal-bold text-center`,
                            )}>
                            {strings.ChargesApply}
                        </Animated.Text>
                    ) : null}
                    {displayIconColor == colors.red500 ? (
                        <Animated.Text
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style(
                                `text-[14px] text-[${colors.gray200}] font-areaNormal-bold text-center`,
                            )}>
                            {strings.ExpiringIn}
                        </Animated.Text>
                    ) : null}
                    {displayIconColor !== '#FF8B61' && displayIconColor !== colors.red500 ? (
                        <Animated.Text
                            entering={FadeIn}
                            exiting={FadeOut}
                            style={tailwind.style(
                                `text-[14px] text-[${colors.gray200}] font-areaNormal-bold text-center`,
                            )}>
                            {strings.WaitingTime}
                        </Animated.Text>
                    ) : null}
                </Animated.View>
            ) : null}
            {showDriverImg ? (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="driver assigned image"
                    key={'driver-assigned'}
                    entering={SlideInDown.springify().damping(50).stiffness(400)}
                    exiting={SlideOutDown.duration(1000)}
                    source={imgSrc}
                    style={tailwind.style('h-[200px] w-[200px] absolute bottom-[125px] self-center', `z-[99]`)}
                />
            ) : null}
        </Animated.View>
    );
};

const TripStarted: React.FC<{ bookingId: BookingId | null; strings: StringsType }> = ({ bookingId, strings }) => {
    const lottieRef = useRef<LottieView>(null);
    const [showDriverImg, setShowDriverImg] = useState(true);
    const dispatch = useAppDispatch();
    const tripLottieShown = useAppSelector(s => selectTripStartedLottieShown(s, bookingId));

    const lottieFinished = () => {
        dispatch(setTripStartedLottieShown({ id: bookingId, payload: true }));
        setShowDriverImg(false);
    };

    useEffect(() => {
        lottieRef.current?.play();
    }, []);

    useEffect(() => {
        if (tripLottieShown) setShowDriverImg(false);
    }, [tripLottieShown]);

    useEffect(() => {
        if (!showDriverImg) return;
        const id = setTimeout(() => {
            dispatch(setTripStartedLottieShown({ id: bookingId, payload: true }));
            setShowDriverImg(false);
        }, 7000);
        return () => clearTimeout(id);
    }, [showDriverImg, bookingId, dispatch]);

    if (!showDriverImg || tripLottieShown) return null;

    return (
        <DismissibleSwipe direction="down" onDismiss={lottieFinished}>
            <Animated.View
                entering={SlideInDown.duration(1000)}
                exiting={SlideOutDown.duration(1000)}
                style={tailwind.style('h-[240px] w-[240px] rounded-full self-center')}>
                <AnimatedImageBackground
                    accessible={true}
                    accessibilityLabel="trip started background image"
                    source={tripStartedBg}
                    resizeMode="contain"
                    style={tailwind.style('h-[300px] w-[300px] absolute bottom-7 self-center z-[99]')}>
                    <Animated.View style={tailwind.style('w-full flex-row items-center justify-center relative pt-7')}>
                        <Animated.Text
                            entering={FadeIn}
                            style={tailwind.style('text-white text-center text-[21px] font-extrabold z-10')}>
                            {strings.TripStarted}
                        </Animated.Text>
                    </Animated.View>
                </AnimatedImageBackground>

                <LottieWithFallback
                    fallback={undefined}
                    lottieRef={lottieRef}
                    source={tripStartedLottie}
                    loop={false}
                    autoPlay={false}
                    style={tailwind.style('h-[160px] w-[160px] absolute bottom-[100px] self-center')}
                    onAnimationFinish={lottieFinished}
                />
            </Animated.View>
        </DismissibleSwipe>
    );
};

interface DriverAssignedProps {
    bookingId: BookingId | null;
    duration: number;
    currentVehicleServiceTier: string;
}

export const DriverAssigned = ({ bookingId, duration = 5000, currentVehicleServiceTier }: DriverAssignedProps) => {
    const dispatch = useAppDispatch();
    const alreadyPersisted = useAppSelector(s => selectDriverAssignedShown(s, bookingId));
    const [visible, setVisible] = useState(!alreadyPersisted);

    useEffect(() => {
        if (!visible || alreadyPersisted || currentVehicleServiceTier !== 'AUTO_RICKSHAW') return;
        const delay = setTimeout(() => {
            dispatch(setDriverAssignedShown({ id: bookingId, payload: true }));
            setVisible(false);
        }, duration);

        return () => clearTimeout(delay);
    }, [visible, alreadyPersisted, duration, dispatch, bookingId, currentVehicleServiceTier]);

    if (!visible) return null;

    return (
        <Animated.View
            entering={SlideInDown.springify().damping(50).stiffness(400)}
            exiting={SlideOutDown.duration(1500)}
            style={tailwind.style('h-[240px] w-[240px] rounded-full z-[99] bg-[#FFD45D] self-center')}>
            <Animated.Image
                source={autoTripStarted}
                resizeMode="contain"
                style={tailwind.style('h-[120px] w-[120px] absolute bottom-[120px] self-center')}
            />
        </Animated.View>
    );
};

export const FloatingRideStatus = React.memo(
    ({ status, bookingId, sheetAnimatedPosition, verticalPosition }: FloatingRideStatusProps) => {
        const { displayIconValue, displayIconColor, stage, currentVehicleServiceTier } = useDynamicIsland(bookingId);
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const appConfig = useAppSelector(selectAppConfig);

        const [assignBannerShouldShow, setAssignBannerShouldShow] = useState(false);

        useEffect(() => {
            if (
                (stage === RideStatus.YOUR_RIDE_IS_ASSIGNED ||
                    stage === RideStatus.IS_YOUR_DRIVER ||
                    stage === RideStatus.CAB_IS_ARRIVING) &&
                currentVehicleServiceTier === 'AUTO_RICKSHAW'
            ) {
                setAssignBannerShouldShow(true);
            }
        }, [stage, currentVehicleServiceTier]);

        if (isUndefined(status)) return null;

        return (
            <FloatingView
                verticalPosition={verticalPosition}
                sheetAnimatedPosition={sheetAnimatedPosition}
                style={undefined}>
                {(stage === RideStatus.CAB_HAS_ARRIVED ||
                    stage === RideStatus.CAB_IS_LEAVING_SOON ||
                    stage === RideStatus.CAB_IS_WAITING_FOR_YOU ||
                    stage === RideStatus.WAITING_CHARGES_APPLY_NOW ||
                    stage === RideStatus.STOP_WAITING_CHARGE_APPLY_NOW ||
                    stage === RideStatus.STOP_ARRIVED ||
                    stage === RideStatus.WAITING_AT_STOP) && (
                    <DriverArrivedWrapper
                        displayIconValue={displayIconValue}
                        displayIconColor={displayIconColor}
                        strings={userLanguageStrings}
                        currentVehicleServiceTier={currentVehicleServiceTier}
                    />
                )}
                {stage === RideStatus.OTP_RIDE_ASSIGNED && (
                    <DriverArrived
                        displayIconValue={displayIconValue}
                        displayIconColor={colors.red500}
                        strings={userLanguageStrings}
                        currentVehicleServiceTier={currentVehicleServiceTier}
                    />
                )}
                {(stage === RideStatus.RIDE_STARTED || stage === RideStatus.BRIDGE_TO_DESTINATION) &&
                    currentVehicleServiceTier === 'AUTO_RICKSHAW' &&
                    appConfig.flowConfig.showAutoTripStartedLottie && (
                        <TripStarted bookingId={bookingId} strings={userLanguageStrings} />
                    )}
                {assignBannerShouldShow && bookingId && (
                    <DriverAssigned
                        bookingId={bookingId}
                        duration={5000}
                        currentVehicleServiceTier={currentVehicleServiceTier}
                    />
                )}
            </FloatingView>
        );
    },
);
