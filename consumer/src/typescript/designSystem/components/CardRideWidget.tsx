import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    FlipInXDown,
    FlipOutXUp,
    interpolate,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
} from 'react-native-reanimated';
import token from '../tokens';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Typography from './primitives/Typography';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectRideDetailsWithId, selectStopInfoWithId } from '@/typescript/state/client/ride';
import {
    RideId,
    selectBookedStopsWithId,
    selectBookingDetailsWithId,
    selectOtpCodeWithBookingId,
    selectRideIdWithBookingId,
} from '@/typescript/state/client/booking';
import { getVehicleNumber } from '@/typescript/screens/chat/utils';
import { BookingId } from '@/typescript/state/client/user';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { useDynamicIsland } from '@/typescript/hooks/useDynamicIsland';
import { RideStatus } from '@/typescript/hooks/types.ts';
import { View } from 'react-native';
import { Icon } from '../../components/Icon';
import ArrowRight from '../../assets/svg/symbols/ArrowRight';
import colors from '../../designSystem/colorPalette';
import { CurrencyText } from '../../components/CurrencyText';
import { setFocus } from '@/typescript/utils/Accessibility';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { EventName, logEvent } from '@/typescript/utils/logger';

type CardRideWidgetProps = {
    bookingId: BookingId | null;
};

const CardRideWidget: React.FC<CardRideWidgetProps> = ({ bookingId = null }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const otpCode = useAppSelector(state => selectOtpCodeWithBookingId(state, bookingId));
    const stops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    const destination = stops[stops.length - 1];
    const stopInfo = useAppSelector(state => selectStopInfoWithId(state, rideId));
    const { top } = useSafeAreaInsets();
    const endOTP = rideDetails?.endOtp;
    const { stage, displayIconValue, displayIconUnit, displayIconColor, titleText, lottieUrl, isLottie } =
        useDynamicIsland(bookingId);

    const offset = useSharedValue<number>(0);
    const scale = useSharedValue<number>(0);
    const animatedStyles = useAnimatedStyle(() => ({
        opacity: interpolate(offset.value, [0, 1], [0, 1]),

        transform: [
            {
                translateY: interpolate(offset.value, [0, 1], [-100, 0]),
            },
            {
                scaleX: interpolate(offset.value, [0, 0.3, 1], [0.9, 0.8, 1]),
            },
        ],
    }));
    const scaleAnimation = useAnimatedStyle(() => ({
        width: SCREEN_WIDTH - 32,
        transform: [
            {
                scale: interpolate(scale.value, [0, 0.3, 1], [0.9, 0.8, 1]),
            },
        ],
    }));
    useEffect(() => {
        hapticEffect(HapticFeedbackTypes.notificationSuccess, undefined);
        scale.value = withSpring(1.25, { damping: 24, stiffness: 100 });
        setTimeout(() => {
            scale.value = withSpring(1.0, { damping: 24, stiffness: 100 });
        }, 500);
    }, [stage]);

    useEffect(() => {
        offset.value = withDelay(1000, withSpring(1, { damping: 24, stiffness: 100 }));
    }, []);

    const ref = useRef(null);
    useEffect(() => setFocus(ref), []);

    return (rideDetails || bookingDetails) && titleText ? (
        <Animated.View
            accessible={false}
            ref={ref}
            style={tailwind.style(animatedStyles, scaleAnimation)}
            layout={LinearTransition}>
            <Animated.View
                accessibilityElementsHidden={true}
                importantForAccessibility="no-hide-descendants"
                layout={LinearTransition}
                style={tailwind.style(
                    `bg-[${themeColors.Icon_neutralUltraHigh}] left-4  mt-[${top || 8}] w-full py-[${
                        token?.spacing[6]
                    }] gap-[${token?.spacing[12]}] flex-row items-center justify-start rounded-[100px] pl-[${
                        token?.spacing[6]
                    } pr-[${token?.spacing[20]}]]`,
                )}>
                {isLottie ? (
                    <Animated.View
                        layout={LinearTransition}
                        style={tailwind.style(
                            'w-[68px] h-[56px] rounded-full justify-center items-center overflow-hidden',
                        )}>
                        <LottieWithFallback
                            fallback={undefined}
                            style={tailwind.style('w-full h-full')}
                            source={lottieUrl ?? ''}
                            autoPlay
                            loop
                        />
                    </Animated.View>
                ) : (
                    <Animated.View
                        entering={FadeIn.duration(1000)}
                        layout={LinearTransition}
                        style={tailwind.style(
                            `bg-[${displayIconColor}] px-[${token?.spacing[10]}] py-[${token?.spacing?.[8]}] w-[90px] rounded-[100px] flex-col justify-center items-center`,
                        )}>
                        <Typography
                            type="title-2"
                            style={tailwind.style('text-white')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {displayIconValue}
                        </Typography>
                        <Typography
                            type="micro"
                            style={tailwind.style('text-white pt-[4px] uppercase')}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {displayIconUnit}
                        </Typography>
                    </Animated.View>
                )}
                <Animated.View
                    style={tailwind.style('flex-1')}
                    entering={FadeIn.duration(1000)}
                    layout={LinearTransition}>
                    {/* Accessibility container for status text */}
                    <Animated.View
                        accessible={true}
                        accessibilityLabel={titleText}
                        accessibilityRole="text"
                        layout={LinearTransition}
                        entering={FadeIn}
                        exiting={FadeOut}>
                        <Animated.View layout={LinearTransition} entering={FadeIn} exiting={FadeOut}>
                            {stage === RideStatus.CAB_IS_ARRIVING ? (
                                // multiple typography tags are used for animation purpose
                                //these string comparisons will be changed to locale variables once the PR is merged
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white`)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.CAB_IS_WAITING_FOR_YOU ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white`)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.STOP_ARRIVED ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white`)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.STOP_WAITING_CHARGE_APPLY_NOW ? (
                                <CurrencyText
                                    textType="subhead"
                                    numberOfLines={1}
                                    textStyle={tailwind.style(`text-white`)}
                                    currencyStyle={tailwind.style(`font-inter-bold`)}
                                    text={titleText}
                                />
                            ) : null}
                            {stage === RideStatus.WAITING_AT_STOP ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white`)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.CAB_HAS_ARRIVED ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white`)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.CAB_IS_LEAVING_SOON ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white`)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.WAITING_CHARGES_APPLY_NOW ? (
                                <CurrencyText
                                    textType="subhead"
                                    numberOfLines={1}
                                    textStyle={tailwind.style(`text-white`)}
                                    currencyStyle={tailwind.style(`font-inter-bold`)}
                                    text={titleText}
                                />
                            ) : null}
                            {stage === RideStatus.RIDE_STARTED ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white `)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.BRIDGE_TO_DESTINATION ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white `)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.WAY_TO_STOP ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white `)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.YOUR_RIDE_IS_ASSIGNED ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white `)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.IS_ON_THE_WAY ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white `)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.IS_YOUR_DRIVER ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white `)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                            {stage === RideStatus.OTP_RIDE_ASSIGNED ? (
                                <Typography
                                    accessible={false}
                                    type="subhead"
                                    numberOfLines={1}
                                    style={tailwind.style(`text-white `)}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessibilityLabel={undefined}>
                                    {titleText}
                                </Typography>
                            ) : null}
                        </Animated.View>
                    </Animated.View>
                    {stage === RideStatus.BRIDGE_TO_DESTINATION || stage === RideStatus.RIDE_STARTED ? (
                        <Typography
                            accessible={false}
                            type="body-1"
                            numberOfLines={1}
                            style={tailwind.style(
                                `text-white mt-[${token?.spacing[6]}] w-[${
                                    SCREEN_WIDTH - 142
                                }px] text-ellipsis overflow-hidden`,
                            )}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {`to ${stops[stopInfo?.stop ?? 0]?.area}`}
                        </Typography>
                    ) : stage === RideStatus.OTP_RIDE_ASSIGNED ? (
                        <Typography
                            accessible={false}
                            type="body-1"
                            style={tailwind.style(`text-white mt-[${token?.spacing[6]}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.StartOTP(otpCode ?? '')}
                        </Typography>
                    ) : stage === RideStatus.CAB_IS_ARRIVING ||
                      stage === RideStatus.CAB_IS_WAITING_FOR_YOU ||
                      stage === RideStatus.WAITING_CHARGES_APPLY_NOW ||
                      stage === RideStatus.CAB_IS_LEAVING_SOON ||
                      stage === RideStatus.CAB_HAS_ARRIVED ? (
                        <FlippableText rideId={rideId} />
                    ) : stage === RideStatus.STOP_ARRIVED ||
                      stage === RideStatus.WAITING_AT_STOP ||
                      stage === RideStatus.WAY_TO_STOP ||
                      stage === RideStatus.STOP_WAITING_CHARGE_APPLY_NOW ? (
                        <Typography
                            accessible={false}
                            type="body-1"
                            numberOfLines={1}
                            style={tailwind.style(
                                `text-white mt-[${token?.spacing[6]}] w-[${
                                    SCREEN_WIDTH - 142
                                }px] text-ellipsis overflow-hidden`,
                            )}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {stops[stopInfo?.stop ?? 0]?.area || ''}
                        </Typography>
                    ) : stage === RideStatus.INTER_CITY || stage === RideStatus.RENTAL ? (
                        <View>
                            {stage === RideStatus.INTER_CITY ? (
                                <View style={[tailwind.style('flex-row justify-start')]}>
                                    <Typography
                                        accessible={false}
                                        type="subhead"
                                        style={tailwind.style(`text-white pr-1`)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {titleText}
                                    </Typography>
                                    <Icon
                                        color={colors?.primitive.white[10]}
                                        icon={<ArrowRight fill={undefined} bold={undefined} />}
                                        size={20}
                                    />
                                    <Typography
                                        accessible={false}
                                        type="subhead"
                                        style={tailwind.style(`text-white pl-1`)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {destination?.area || ''}
                                    </Typography>
                                </View>
                            ) : (
                                <View style={[tailwind.style('flex-row justify-start')]}>
                                    <Typography
                                        accessible={false}
                                        type="subhead"
                                        style={tailwind.style(`text-white pr-1`)}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {'Rental ride started!'}
                                    </Typography>
                                </View>
                            )}
                            <Typography
                                accessible={false}
                                type="body-1"
                                style={tailwind.style(`text-white mt-[${token?.spacing[6]}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.EndOTP + ' • ' + (endOTP ?? '')}
                            </Typography>
                        </View>
                    ) : (
                        <Typography
                            accessible={false}
                            type="body-1"
                            style={tailwind.style(`text-white mt-[${token?.spacing[6]}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {`OTP • ${rideDetails?.rideOtp}`}
                        </Typography>
                    )}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    ) : null;
};

const FlippableText = ({ rideId }: { rideId: RideId | null }) => {
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const vehicleNumber = rideDetails?.vehicleNumber || '';
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const getNumberInFormat = useMemo(() => {
        return getVehicleNumber(vehicleNumber);
    }, [vehicleNumber]);
    const otp = `OTP • ${rideDetails?.rideOtp || ''}`;
    const regNumber = `${userLanguageStrings.Vehicle} • ${getNumberInFormat}`;
    const flipTexts = [otp, regNumber];
    const [visibleIndex, setVisibleIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setVisibleIndex(visibleIndex === flipTexts.length - 1 ? 0 : visibleIndex + 1);
        }, 3000);

        return () => {
            clearInterval(interval);
        };
    }, [visibleIndex]);

    useEffect(() => {
        if (rideDetails?.rideOtp) {
            logEvent(EventName.NY_GOT_RIDE_OTP);
        }
    }, [rideDetails?.rideOtp]);

    const getAccessibilityLabel = () => {
        if (visibleIndex === 0 && rideDetails?.rideOtp) {
            return `OTP: ${String(rideDetails.rideOtp).split('').join(' ')}`;
        } else if (visibleIndex === 1) {
            return `Vehicle: ${getNumberInFormat}`;
        }
        return flipTexts[visibleIndex];
    };

    return (
        <Animated.View
            entering={FlipInXDown.duration(400).easing(Easing.inOut(Easing.quad))}
            exiting={FlipOutXUp.duration(400).easing(Easing.inOut(Easing.quad))}
            key={flipTexts[visibleIndex]}
            style={{
                backfaceVisibility: 'hidden',
                transform: [{ perspective: 1000 }],
            }}
            accessible={true}
            accessibilityLabel={getAccessibilityLabel()}>
            <Typography
                type="body-1"
                style={tailwind.style(`text-white mt-[${token?.spacing[6]}]`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={false}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {flipTexts[visibleIndex] || otp}
            </Typography>
        </Animated.View>
    );
};

export default CardRideWidget;
