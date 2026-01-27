import { RatingScreenType } from '@/typescript/state/client/ride';
import BottomSheet, {
    BottomSheetBackdropProps,
    BottomSheetFooter,
    BottomSheetScrollView,
    BottomSheetScrollViewMethods,
    BottomSheetView,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Keyboard, Platform, SafeAreaView, Text, View } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Animated, { FadeIn, LinearTransition, withDelay, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { fareBreakupAPIEntity } from '@/readOnly/api/types/FareBreakupAPIEntity.gen';
import DashedLine from '@/typescript/components/DashedLine';
import { Icon } from '@/typescript/components/Icon';
import BusIcon from '@/typescript/components/svg/BusIcon';
import { Headphone } from '@/typescript/components/svg/HeadPhone';
import { useRefsContext } from '@/typescript/context/RefsContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import token from '@/typescript/designSystem/tokens';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { getCurrency } from '@/typescript/utils/getCurrency';
import Review from '../reviewAndFeedback/components/Review';
import RideCompletedBottomSheetContent from '../reviewAndFeedback/components/RideCompletedBottomSheetContent';
import { CollectReferralEarningFlow } from '@/src-v2/components/CollectReferralEarning/Flow';

import { RideCompletedView } from '@/typescript/screens/RideCompletedScreen';
import ChevronRight from '@/typescript/assets/svg/symbols/ChevronRight';

import SafetyModal from '@/typescript/screens/SafetyModal';

import { CurrencyText } from '@/typescript/components/CurrencyText';

import { createAction, minimizeApp } from '@/typescript/utils/common';
import SafetyTools from '@/typescript/assets/svg/symbols/SafetyTools';
import FareDecrease from '@/typescript/components/svg/FareDecrease';
import FareIncrease from '@/typescript/components/svg/FareIncrease';
import Button from '@/src-v2/primitives/Button';

import { BottomSheetDefaultFooterProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetFooter/types';
import ArrowRight from '@/typescript/assets/svg/symbols/ArrowRight';

import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { FinalFareViewProps, ReviewAndFeedbackProps, SosOrCallPoliceButtonProps } from './Types';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import ny_ic_wheelchair_circle_bg from '@/resources/assets/png/ny_ic_wheelchair_circle_bg.webp';
import { events, EventType } from '@/src-v2/systems/events/events';
import { Profiler } from '@/typescript/hooks/useComponentProfiler';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import { SheetBackdrop } from '../reviewAndFeedback/components/SheetBackdrop';
import { strings } from 'config-types';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCityConfig, selectAppConfig } from '@/typescript/state/client/session';
import { useAutoClearTimeout } from '@/src-v2/hooks/useAutoClearTimeout';

export const roundIfDecimal = (num: number) => {
    // Check if the number has a decimal part
    return num % 1 !== 0 ? parseFloat(num?.toFixed(1)) : num;
};

type TollBreakupViewProps = {
    fareBreakup: fareBreakupAPIEntity[] | undefined;
    priceSymbol: string;
    estimateTollFare: fareBreakupAPIEntity[] | undefined;
};

const TollBreakupView: React.FC<TollBreakupViewProps> = ({ fareBreakup, priceSymbol, estimateTollFare }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Build the maps immutably from the arrays.
    const fareBreakupMap =
        fareBreakup && fareBreakup.length > 0
            ? new Map(fareBreakup.map(item => [item.description, item.amountWithCurrency.amount]))
            : new Map<string, number>();

    const estimateFareBreakupMap =
        estimateTollFare && estimateTollFare.length > 0
            ? new Map(estimateTollFare.map(item => [item.description, item.amountWithCurrency.amount]))
            : new Map<string, number>();

    // Instead of mutating the prop, create a new constant for priceSymbol.
    const calculatedPriceSymbol =
        fareBreakup?.[0]?.amountWithCurrency.currency ??
        estimateTollFare?.[0]?.amountWithCurrency.currency ??
        priceSymbol;

    const currencySymbol = getCurrency(calculatedPriceSymbol);

    const tollChargeValue = fareBreakupMap.get('TOLL_CHARGES') ?? estimateFareBreakupMap.get('TOLL_CHARGES');
    const isFareIncluded = fareBreakupMap.has('TOLL_CHARGES');

    return tollChargeValue !== undefined ? (
        <View style={tailwind.style('flex-row justify-start items-center mb-2')}>
            <Icon style={tailwind.style('ml-1')} icon={<BusIcon />} size={20} />
            <CurrencyText
                textType="body-2"
                currencyStyle={tailwind.style('font-inter-bold ')}
                textStyle={tailwind.style('text-black flex-1 ml-2 pr-4 ')}
                text={
                    `${currencySymbol}${roundIfDecimal(tollChargeValue)} ` +
                    (isFareIncluded ? userLanguageStrings.tollchargesincluded : userLanguageStrings.tollchargesexcluded)
                }
            />
        </View>
    ) : null;
};

export type FareUpdateViewProps = {
    actualDistance: number;
    estimatedDistance: number;
    distanceFareDiff: number | undefined;
    waitingCharges: number | undefined;
    fullFareDifference: number;
    isFareIncreased: boolean;
    isFareDecreased: boolean;
    // Fields for rentals
    fareProductType: string;
    extraTimeFare: number | undefined;
    extraTime: number;
    extraDistanceFare: number | undefined;
    userLanguageStrings: strings;
};

export const fareUpdatedText = (props: FareUpdateViewProps): string => {
    const distanceDiff = Math.abs(props.estimatedDistance - props.actualDistance);
    const roundedDistance = distanceDiff >= 1000 ? `${(distanceDiff / 1000).toFixed(1)} km` : `${distanceDiff} m`;
    const { userLanguageStrings } = props;
    const parsedExtraTime = () => {
        const extraMinutes = Math.floor(props.extraTime / 60);
        if (extraMinutes >= 60) {
            const hours = Math.floor(extraMinutes / 60);
            const minutes = extraMinutes % 60;
            return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
        } else {
            return `${extraMinutes} min`;
        }
    };
    const isLonger = props.actualDistance > props.estimatedDistance;
    const hasWaitingCharges = props.waitingCharges && props.waitingCharges > 0;
    const hasExtraTime = props.extraTimeFare && props.extraTimeFare > 0 && props.extraTime && props.extraTime > 0;
    const hasExtraDistance = props.extraDistanceFare && props.extraDistanceFare > 0 && distanceDiff > 0;
    const fareUpdateItems = [
        ...(props.fullFareDifference > 0
            ? [
                  userLanguageStrings.Fare_increased_reduced_by_asthe(
                      props.isFareIncreased,
                      roundIfDecimal(props.fullFareDifference),
                  ),
              ]
            : []),
        ...(props.fareProductType !== 'RENTAL'
            ? [
                  ...(distanceDiff > 0
                      ? [
                            `${userLanguageStrings.ridewas} ${roundedDistance} ${
                                isLonger ? userLanguageStrings.longer : userLanguageStrings.shorter
                            }`,
                        ]
                      : []),
                  ...(hasWaitingCharges
                      ? [
                            `${distanceDiff > 0 ? userLanguageStrings.and + ' ' : ''}${
                                userLanguageStrings.waittimewaslonger
                            }`,
                        ]
                      : []),
              ]
            : []),
        ...(props.fareProductType === 'RENTAL'
            ? [
                  ...(hasExtraDistance && hasExtraTime
                      ? [
                            `${userLanguageStrings.ridewas} ${roundedDistance} ${userLanguageStrings.and} ${parsedExtraTime} ${userLanguageStrings.longer}`,
                        ]
                      : []),
                  ...((hasExtraDistance || hasExtraTime) && !(hasExtraDistance && hasExtraTime)
                      ? [
                            `${userLanguageStrings.ridewas} ${hasExtraDistance ? roundedDistance : parsedExtraTime} ${
                                userLanguageStrings.longer
                            }`,
                        ]
                      : []),
                  ...(props.isFareDecreased ? [`${userLanguageStrings.ridewas} ${userLanguageStrings.shorter}`] : []),
                  ...(hasWaitingCharges && !(hasExtraDistance && hasExtraTime)
                      ? [
                            `${!(hasExtraDistance && hasExtraTime) ? userLanguageStrings.and + ' ' : ''}${
                                userLanguageStrings.waittimewaslonger
                            }`,
                        ]
                      : []),
              ]
            : []),
    ];

    return fareUpdateItems.join(' ');
};

const FareUpdateView: React.FC<FareUpdateViewProps> = props => {
    const fareDifferenceDesc = fareUpdatedText(props);

    return props.fullFareDifference > 0 ? (
        <View style={tailwind.style('flex-row mb-3 items-center')}>
            <Icon
                icon={props.isFareIncreased ? <FareIncrease fill={undefined} /> : <FareDecrease fill={undefined} />}
                size={22}
                style={tailwind.style('mt-1')}
            />
            <CurrencyText
                textType="body-2"
                currencyStyle={[tailwind.style('font-inter-bold')]}
                textStyle={[tailwind.style('text-black ml-2 pr-4 w-3/4 text-left leading-[24px]')]}
                text={fareDifferenceDesc}
            />
        </View>
    ) : null;
};

const ReviewAndFeedback: React.FC<ReviewAndFeedbackProps> = ({
    rating,
    rideId,
    bookingId,
    showLogo,
    navigateToHome,
    featureFlags,
    absFareDifference,
    rideDetails,
    distanceFareDiff,
    waitingCharges,
    specialAssistance,
    bookingDetails,
    extraTimeFare,
    fareDifference,
    extraTime,
    appName,
    extraDistanceFare,
    rcsDispatch,
    reviewAndFeedbackApiCall,
    ratingScreen,
    transportAvatarUri,
    estimatedPriceWidth,
    rideCompleteBgUri,
    initiallyFavorite,
    setinitiallyFavorite,
    multimodalProps,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const appConfig = useAppSelector(selectAppConfig);
    // const avatarHeight = 74;
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { rideSafetyModalRef, collectReferralEarningModalRef } = useRefsContext();
    const { reviewModalRef } = useRefsContext();
    const { top, bottom } = useSafeAreaInsets();
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues(undefined);
    const scrollSheetRef = useRef<BottomSheetScrollViewMethods>(null);
    const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
    const { setAutoClearTimeout } = useAutoClearTimeout();

    const [isCollectEarningsPressed, setIsCollectEarningsPressed] = useState(false);
    const cityBaseAdImageConfig = useAppSelector(state => selectCityConfig(state, 'city_base_ad_image'));
    const snapPoints = useMemo(() => {
        const isIOS = Platform.OS === 'ios';

        const minHeight = 0.3 * SCREEN_HEIGHT + bottom;
        const feedbackHeights = {
            low: isIOS ? 0.8 * SCREEN_HEIGHT : 0.74 * SCREEN_HEIGHT + bottom,
            mid: isIOS ? 0.85 * SCREEN_HEIGHT : 0.76 * SCREEN_HEIGHT + bottom,
            high: isIOS ? 0.85 * SCREEN_HEIGHT : 0.76 * SCREEN_HEIGHT + bottom,
        };

        if (ratingScreen === RatingScreenType.Review) {
            // Only increase height when banner is enabled to accommodate banner space
            if (cityBaseAdImageConfig?.enabled) {
                if (SCREEN_HEIGHT < 700) {
                    return [0.52 * SCREEN_HEIGHT + bottom, 0.52 * SCREEN_HEIGHT + bottom];
                }
                return [0.44 * SCREEN_HEIGHT + bottom, 0.44 * SCREEN_HEIGHT + bottom];
            }

            // Original heights when banner is not enabled
            if (SCREEN_HEIGHT < 700) {
                return [0.41 * SCREEN_HEIGHT + bottom, 0.41 * SCREEN_HEIGHT + bottom];
            }
            return [minHeight, minHeight];
        }

        if (ratingScreen === RatingScreenType.Feedback) {
            const maxHeight =
                rating < 3 ? feedbackHeights.low : rating === 4 ? feedbackHeights.mid : feedbackHeights.high;

            return [0.4 * SCREEN_HEIGHT, maxHeight];
        }

        return [];
    }, [rating, ratingScreen, cityBaseAdImageConfig?.enabled]);

    const suffixIcon = useMemo(
        () => (
            <Icon
                style={{
                    marginLeft: -4,
                    marginTop: 2,
                }}
                icon={<ArrowRight fill="black" bold={undefined} />}
                size={13}
            />
        ),
        [],
    );

    const CustomEnteringAnimation = () => {
        'worklet';
        const animations = {
            // your animations
            transform: [
                {
                    translateX: withDelay(100, withTiming(SCREEN_WIDTH, { duration: 1000 })),
                },
            ],
        };
        const initialValues = {
            transform: [{ translateX: 0 }],
        };

        return {
            initialValues,
            animations,
        };
    };

    const backdropComponent = useCallback(
        (props: BottomSheetBackdropProps) => {
            switch (ratingScreen) {
                case RatingScreenType.Feedback:
                    return <SheetBackdrop onBackdropPress={() => reviewModalRef.current?.snapToIndex(0)} {...props} />;
                case RatingScreenType.Review:
                default:
                    return undefined;
            }
        },
        [ratingScreen],
    );

    useEffect(() => {
        events.markFirstScreenRender(EventType.ON_CREATE_TO_REVIEW);
    }, []);

    const renderFooter = useCallback(
        (props: React.JSX.IntrinsicAttributes & BottomSheetDefaultFooterProps) => (
            <BottomSheetFooter {...props} bottomInset={bottom}>
                <Animated.View
                    layout={LinearTransition.springify().damping(24).stiffness(200)}
                    style={[
                        tailwind.style(rating > 0 ? `bg-[${colors.neutral200}]` : 'bg-white'),
                        tailwind.style(`px-[${token?.spacing?.[16]}]`),
                    ]}
                    accessible={true}>
                    {ratingScreen === RatingScreenType.Feedback && (
                        <Button
                            testID="review_feedback_submit"
                            accessibilityElementsHidden={true}
                            importantForAccessibility={'no-hide-descendants'}
                            style={[
                                tailwind.style('text-extrabold justify-center'),
                                { marginBottom: isKeyboardVisible ? (Platform.OS === 'android' ? bottom : 10) : 0 },
                            ]}
                            text={
                                multimodalProps && !multimodalProps.isLastMile
                                    ? userLanguageStrings.SubmitAndGoToNextTransit
                                    : userLanguageStrings.SubmitFeedback
                            }
                            type="primary"
                            onPress={() => {
                                rcsDispatch(createAction('REVIEW_AND_FEED_BACK_API_CALL', undefined));
                            }}
                            accessibilityLabel="Submit Feedback"
                            accessibilityRole="button"
                        />
                    )}
                    {ratingScreen === RatingScreenType.Review && (
                        <Button
                            testID="review_feedback_skip_to_home"
                            style={({ pressed }) => [
                                tailwind.style('bg-white justify-center'),
                                tailwind.style(pressed && 'bg-[#e0e3e8]'),
                            ]}
                            text={
                                multimodalProps && !multimodalProps.isLastMile
                                    ? userLanguageStrings.SkipAndGoToNextTransit
                                    : `${userLanguageStrings.SkiptoHome} →`
                            }
                            type="secondary-inverse"
                            suffix={suffixIcon}
                            onPress={() => {
                                if (multimodalProps && !multimodalProps.isLastMile) {
                                    rcsDispatch(createAction('GO_TO_JOURNEY_OVERVIEW', undefined));
                                } else {
                                    navigateToHome(true);
                                }
                            }}
                        />
                    )}
                </Animated.View>
            </BottomSheetFooter>
        ),
        [rating, reviewAndFeedbackApiCall, isKeyboardVisible],
    );

    const isRideCompletedSectionFlexRow = absFareDifference > 0 && featureFlags.endRideShowFareSplit;

    const backPress = useCallback(() => {
        minimizeApp();
    }, []);

    const bg_color = themeColors.Review_and_feed_back_bg_color;
    const ride_details_text_color = themeColors.Review_and_feed_back_ride_details_text_color;

    useEffect(() => {
        const keyboardShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setAutoClearTimeout(() => scrollSheetRef.current?.scrollToEnd(), Platform.OS === 'ios' ? 200 : 0);
                setIsKeyboardVisible(true);
            },
        );
        const keyboardHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setIsKeyboardVisible(false);
            },
        );
        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
        };
    }, []);

    return (
        <Profiler componentName="ReviewAndFeedback">
            <HardwareBackpressHandler onHardwareBackPress={backPress}>
                <Animated.View style={[tailwind.style(`h-full bg-[${bg_color}]`), { paddingTop: top }]}>
                    {showLogo ? (
                        <RideCompletedView
                            rideId={rideId}
                            showLogo={showLogo}
                            mainText={userLanguageStrings.Thanksforsharing + '!'}
                            subTitleText={
                                userLanguageStrings.Welovehearingfromyouandwilluseyourfeedbacktoimprovewhatwedo
                            }
                            logoCenter={50}
                            showButton={true}
                            goBackHome={() => navigateToHome(false)}
                        />
                    ) : null}
                    {!showLogo ? (
                        <Animated.View entering={FadeIn} style={[tailwind.style('flex-1 justify-between mt-4')]}>
                            <Animated.Image
                                accessible={false}
                                source={{ uri: rideCompleteBgUri }}
                                style={tailwind.style('absolute h-full w-full')}
                                resizeMode="contain"
                            />
                            <Animated.View
                                entering={CustomEnteringAnimation}
                                style={[tailwind.style('absolute h-full w-full bg-[#EBEBEB]')]}
                            />

                            <SafeAreaView>
                                <Animated.View>
                                    <View style={tailwind.style('flex-row justify-end mr-4 mt-20 items-end mt-2')}>
                                        {featureFlags.showNeedHelpInFeedback ? (
                                            <NeedHelpButton />
                                        ) : (
                                            <SosOrCallPoliceButton bookingId={bookingId} rcsDispatch={rcsDispatch} />
                                        )}
                                    </View>
                                    <Animated.View>
                                        <View
                                            style={[
                                                tailwind.style('items-center px-5 '),
                                                tailwind.style(
                                                    isRideCompletedSectionFlexRow
                                                        ? 'flex-row justify-between items-center'
                                                        : 'flex-col justify-center items-center',
                                                ),
                                            ]}>
                                            <View>
                                                <Animated.Image
                                                    accessible={false}
                                                    resizeMode={'contain'}
                                                    style={[
                                                        { marginTop: 10 },
                                                        tailwind.style(
                                                            `${
                                                                rideDetails?.vehicleServiceTierType === 'AUTO_RICKSHAW'
                                                                    ? `w-[210px] h-[128px] ${
                                                                          isRideCompletedSectionFlexRow ? '-ml-13' : ''
                                                                      }`
                                                                    : 'w-[140px] -ml-3'
                                                            } `,
                                                        ),
                                                    ]}
                                                    source={transportAvatarUri}
                                                />
                                                {specialAssistance ? (
                                                    <Image
                                                        accessible={false}
                                                        style={{
                                                            position: 'absolute',
                                                            height: 50,
                                                            width: 40,
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            marginLeft: 20,
                                                        }}
                                                        source={ny_ic_wheelchair_circle_bg}
                                                    />
                                                ) : null}
                                            </View>
                                            {featureFlags.endRideShowFareSplit ? (
                                                <FinalFareView
                                                    isRideCompletedSectionFlexRow={isRideCompletedSectionFlexRow}
                                                    fareDifference={absFareDifference}
                                                    estimatedTotalFare={bookingDetails?.estimatedTotalFare}
                                                    computedPrice={rideDetails?.computedPrice}
                                                    currency={getCurrency(
                                                        bookingDetails?.estimatedTotalFareWithCurrency?.currency,
                                                    )}
                                                    specialAssistance={specialAssistance}
                                                    rcsDispatch={rcsDispatch}
                                                    estimatedPriceWidth={estimatedPriceWidth}
                                                />
                                            ) : (
                                                <Animated.View style={[tailwind.style('flex-1')]}>
                                                    <Typography
                                                        type="body-1"
                                                        style={tailwind.style(' text-[15px] text-right')}
                                                        numberOfLines={undefined}
                                                        isAnimate={undefined}
                                                        accessible={undefined}
                                                        accessibilityLabel={undefined}
                                                        accessibilityRole={undefined}>
                                                        {userLanguageStrings.YourRideIsComplete}.
                                                    </Typography>
                                                    <Typography
                                                        type="body-1"
                                                        style={tailwind.style('text-[15px] text-right')}
                                                        numberOfLines={undefined}
                                                        isAnimate={undefined}
                                                        accessible={undefined}
                                                        accessibilityLabel={undefined}
                                                        accessibilityRole={undefined}>
                                                        {userLanguageStrings.PleasePayTheFinalFareToDriver}.
                                                    </Typography>
                                                </Animated.View>
                                            )}
                                        </View>

                                        {/* Charges Section */}
                                        {featureFlags.endRideShowFareSplit ? (
                                            <View style={tailwind.style('bg-transparent rounded-lg pt-4 px-5 pb-2')}>
                                                <TollBreakupView
                                                    fareBreakup={bookingDetails?.fareBreakup}
                                                    priceSymbol="INR"
                                                    estimateTollFare={bookingDetails?.estimatedFareBreakup}
                                                />
                                                <FareUpdateView
                                                    actualDistance={rideDetails?.chargeableRideDistance ?? 0}
                                                    estimatedDistance={bookingDetails?.estimatedDistance ?? 0}
                                                    distanceFareDiff={distanceFareDiff}
                                                    waitingCharges={waitingCharges}
                                                    fullFareDifference={absFareDifference}
                                                    isFareIncreased={fareDifference > 0}
                                                    isFareDecreased={fareDifference < 0}
                                                    extraTimeFare={extraTimeFare}
                                                    extraTime={extraTime}
                                                    fareProductType={bookingDetails?.bookingDetails.TAG ?? ''}
                                                    extraDistanceFare={extraDistanceFare}
                                                    userLanguageStrings={userLanguageStrings}
                                                />
                                                <DashedLine color="#D5C285" />
                                            </View>
                                        ) : (
                                            <View style={tailwind.style('bg-transparent rounded-lg pb-4 px-8 my-4')}>
                                                <Typography
                                                    type="subhead-800"
                                                    style={{ textAlign: 'center' }}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {userLanguageStrings.PayfinalfaretothedriverasshownonDriverapp(
                                                        appName,
                                                    )}
                                                </Typography>
                                            </View>
                                        )}
                                        {/* Ride details */}
                                        <TouchableOpacity
                                            accessibilityRole="button"
                                            testID="review_feedback_view_ride_details"
                                            onPress={() => {
                                                rcsDispatch(createAction('ON_PRESS_RIDE_DETAILS', undefined));
                                            }}>
                                            <View
                                                accessible={true}
                                                accessibilityLabel="View ride details"
                                                accessibilityRole="button"
                                                style={tailwind.style('flex-row justify-between items-center px-5')}>
                                                <Typography
                                                    type="body-1"
                                                    style={[{ color: ride_details_text_color, flex: 1 }]}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {featureFlags.endRideShowFareSplit
                                                        ? userLanguageStrings.Ridedetails
                                                        : userLanguageStrings.Bookingdetails}
                                                </Typography>

                                                <Typography
                                                    type="body-1"
                                                    style={[{ color: ride_details_text_color, paddingBottom: 4 }]}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {userLanguageStrings.view}
                                                </Typography>
                                            </View>
                                        </TouchableOpacity>
                                        <Animated.View style={tailwind.style('px-5 pt-2')}>
                                            <DashedLine color="#D5C285" />
                                        </Animated.View>
                                        {appConfig.uiConfig.thankYouMsgRideEnd && (
                                            <Animated.View
                                                style={tailwind.style(
                                                    'px-8 pt-2 flex-col items-center justify-center',
                                                )}>
                                                <Typography
                                                    type="subhead-700"
                                                    style={[{ color: ride_details_text_color, paddingBottom: 4 }]}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {userLanguageStrings.ThankYouForChoosing(appName)}
                                                </Typography>
                                                <Typography
                                                    type="subhead-700"
                                                    style={[
                                                        {
                                                            color: ride_details_text_color,
                                                            paddingBottom: 4,
                                                            fontSize: 14,
                                                            textAlign: 'center',
                                                        },
                                                    ]}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {userLanguageStrings.EveryRideHelpsADriverLiveADignifiedLife}
                                                </Typography>
                                            </Animated.View>
                                        )}
                                    </Animated.View>
                                </Animated.View>
                            </SafeAreaView>
                        </Animated.View>
                    ) : null}
                    <BottomSheet
                        backdropComponent={backdropComponent}
                        ref={reviewModalRef}
                        topInset={top}
                        animatedIndex={sheetAnimatedIndex}
                        animatedPosition={sheetAnimatedPosition}
                        enableOverDrag={false}
                        keyboardBehavior="interactive"
                        keyboardBlurBehavior="restore"
                        index={0}
                        footerComponent={renderFooter}
                        backgroundStyle={[
                            tailwind.style(`bg-[${colors.neutral100}] rounded-[24px]`),
                            {
                                shadowColor: '#000',
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                shadowOpacity: 0.05,
                                shadowRadius: 12,
                            },
                        ]}
                        handleComponent={null}
                        enableDynamicSizing={false}
                        snapPoints={snapPoints}
                        activeOffsetX={undefined}
                        activeOffsetY={undefined}
                        failOffsetY={undefined}
                        failOffsetX={undefined}
                        simultaneousHandlers={undefined}
                        waitFor={undefined}>
                        {ratingScreen === RatingScreenType.Review && (
                            <BottomSheetView accessibilityElementsHidden={true}>
                                <Review
                                    rateRide={rating => rcsDispatch(createAction('RATE_RIDE', { rating }))}
                                    bookingDetails={bookingDetails}
                                    alternateNavigateToHome={undefined}
                                />
                            </BottomSheetView>
                        )}

                        {ratingScreen === RatingScreenType.Feedback && (
                            <BottomSheetScrollView
                                style={{ borderRadius: 24 }}
                                scrollEnabled={true}
                                ref={scrollSheetRef}
                                contentContainerStyle={undefined}
                                accessibilityLabel={'Feedback screen'}>
                                <RideCompletedBottomSheetContent
                                    bookingDetails={bookingDetails}
                                    showBlacklist={undefined}
                                    alternateNavigateToHome={undefined}
                                    onSubmit={undefined}
                                    bookingDetailsFeedbackRef={undefined}
                                    initiallyFavorite={initiallyFavorite}
                                    setinitiallyFavorite={setinitiallyFavorite}
                                />
                            </BottomSheetScrollView>
                        )}
                    </BottomSheet>
                    <PopUpModal
                        sheetRef={rideSafetyModalRef}
                        enableDynamicSizing={true}
                        onHardwareBackPress={undefined}
                        showBackdrop={undefined}
                        isScrollable={false}>
                        <SafetyModal
                            onClose={type => {
                                rcsDispatch(createAction('HANDLE_RIDE_CHECK_POP_UP', { type }));
                            }}
                            bookingId={bookingId}
                            navigation={navigation}
                        />
                    </PopUpModal>
                    <PopUpModal
                        sheetRef={collectReferralEarningModalRef}
                        enableDynamicSizing={true}
                        onHardwareBackPress={undefined}
                        isScrollable={false}
                        keyboardBlurBehavior="restore"
                        activeOffsetX={undefined}
                        activeOffsetY={undefined}
                        showBackdrop={undefined}
                        failOffsetY={undefined}
                        failOffsetX={undefined}
                        simultaneousHandlers={undefined}
                        waitFor={undefined}
                        onDismiss={() => {
                            if (!isCollectEarningsPressed) {
                                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
                            }
                        }}>
                        <CollectReferralEarningFlow setIsCollectEarningsPressed={setIsCollectEarningsPressed} />
                    </PopUpModal>
                </Animated.View>
            </HardwareBackpressHandler>
        </Profiler>
    );
};

const FinalFareView: React.FC<FinalFareViewProps> = ({
    fareDifference,
    estimatedTotalFare,
    computedPrice,
    currency,
    isRideCompletedSectionFlexRow,
    specialAssistance,
    rcsDispatch,
    estimatedPriceWidth,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    // const [estimatedPriceWidth, setEstimatedPriceWidth] = useState(0);

    return (
        <View
            style={tailwind.style(
                'flex-column mt-2 pr-3',
                isRideCompletedSectionFlexRow ? 'justify-end items-end' : 'justify-center items-center',
            )}>
            <Typography
                type="subhead-800"
                style={tailwind.style(`text-[${token?.text?.['text-highContrast']}] text-right`)}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {userLanguageStrings.Ridecompleted}
            </Typography>
            <View
                style={tailwind.style('flex-row items-center mt-1')}
                accessible={true}
                accessibilityLabel={`${
                    fareDifference > 0
                        ? `Ride fare updated, from ${currency}${roundIfDecimal(estimatedTotalFare ?? 0)} to ${
                              computedPrice ?? 0
                          }`
                        : `Ride fare ${computedPrice ?? 0}`
                }`}>
                {fareDifference > 0 ? (
                    <View style={tailwind.style('flex-row items-center mr-[8px] ')}>
                        <View
                            onLayout={event => {
                                rcsDispatch(createAction('HANDLE_ON_LAYOUT', { event }));
                            }}>
                            <CurrencyText
                                textType="body-4"
                                currencyStyle={tailwind.style('font-inter-bold text-[30px]')}
                                textStyle={tailwind.style('text-gray-400 text-xl font-bold leading-[40px] text-[24px]')}
                                text={`${currency}${roundIfDecimal(estimatedTotalFare ?? 0)}`}
                            />
                        </View>
                        <Animated.View style={tailwind.style('absolute flex-row items-center')}>
                            <Animated.View
                                style={tailwind.style(
                                    `w-[${estimatedPriceWidth + 10}px] h-[2px] bg-gray-400 -ml-[3px]`,
                                )}
                            />
                            <Icon icon={<ChevronRight />} style={tailwind.style('-ml-[16px]')} />
                        </Animated.View>
                    </View>
                ) : null}
                <CurrencyText
                    textType="body-4"
                    currencyStyle={tailwind.style('font-inter-bold text-[34px]')}
                    textStyle={tailwind.style(
                        'text-[#000000]  font-bold text-[30px]',
                        fareDifference > 0 ? 'ml-3' : '',
                    )}
                    text={`${currency}${roundIfDecimal(computedPrice ?? 0)}`}
                />
            </View>
            {specialAssistance ? (
                <View
                    style={{
                        backgroundColor: '#7D3986',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                        marginTop: 8,
                    }}>
                    <Typography
                        type="micro"
                        style={{ color: '#FFFFFF', fontWeight: 800 }}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.RideWithSpecialAssistance}
                    </Typography>
                </View>
            ) : null}
        </View>
    );
};

const NeedHelpButton = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleNeedHelpPress = useCallback(() => {
        navigation.navigate('ProfileTab', {
            screen: 'helpAndSupportNavigator',
            params: { screen: 'helpAndSupportScreen' },
        });
    }, [navigation]);
    return (
        <TouchableOpacity
            accessibilityRole="button"
            testID="review_feedback_need_help"
            onPress={handleNeedHelpPress}
            style={tailwind.style('flex-row items-center bg-white px-5 py-2 rounded-full shadow-sm')}>
            <Icon style={tailwind.style('mr-2')} icon={<Headphone fill={undefined} />} size={20} />
            <Text
                style={[
                    tailwind.style('text-black'),
                    {
                        fontFamily: 'AreaNormal-Extrabold',
                        fontSize: 14,
                    },
                ]}>
                {userLanguageStrings.NeedHelp_QuestionMark}
            </Text>
        </TouchableOpacity>
    );
};

const SosOrCallPoliceButton: React.FC<SosOrCallPoliceButtonProps> = ({ rcsDispatch }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <TouchableOpacity
            accessibilityRole="button"
            testID="review_feedback_sos_call_police"
            onPress={() => {
                rcsDispatch(createAction('REVIEW_AND_FEED_BACK_API_CALL', undefined));
            }}
            style={tailwind.style('flex-row items-center bg-white px-5 py-2 rounded-full shadow-sm')}>
            <Icon style={tailwind.style('mr-2')} icon={<SafetyTools fill={undefined} />} size={20} />
            <Text
                style={[
                    tailwind.style('text-black'),
                    {
                        fontFamily: 'AreaNormal-Extrabold',
                        fontSize: 14,
                    },
                ]}>
                {userLanguageStrings.SosCallPolice}
            </Text>
        </TouchableOpacity>
    );
};

export { ReviewAndFeedback };
