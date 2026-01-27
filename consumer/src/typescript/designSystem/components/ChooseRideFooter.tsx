import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    LinearTransition,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { MovingButtonSlide } from '../../components/common/MovingButtonSlide';
import { Icon } from '../../components/Icon';
import colors from '../colorPalette';
import token from '../tokens';
import Typography from './primitives/Typography';
import { useCallSelectPricingItemAPI } from '../../utils/useCallSelectEsimateApi';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import {
    selectCompleteRouteInfo,
    selectCustomerTip,
    selectEstimatesStarted,
    selectIsAddTipSelected,
    selectJourneys,
    selectPricingItems,
    selectSelectedJourney,
    selectSelectedPricingItems,
    selectIsPetRide,
    setCustomerTip,
    setEstimatesStarted,
    setIsAddTipSelected,
    setIsSearchBoosted,
    setSelectedJourney,
    TripCategory,
    TripMode,
    selectTripTypeSelection,
    type PricingItemType,
} from '../../state/client/search';
import { selectActiveBookingIds, selectSearchId, setBookingId, createBookingId } from '@/typescript/state/client/user';
import { gotoLookingForRides } from '@/typescript/state/sharedReducer';
import { selectToken } from '@/typescript/state/client/auth';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { selectLatestInprogressJourney } from '@/typescript/state/client/journey';

import { CurrencyText } from '../../components/CurrencyText';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { getAvailableTipOptions, adjustPriceForPetRide } from '@/src-v2/utils/common';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import SvgGift from '@/typescript/components/svg/Gift';
import { logger } from '@/src-v2/systems/logger';
import { SHOW_PRIMARY_CTA } from '@/typescript/constants/common';
import {
    selectDropTime,
    selectNewFeatureFlags,
    selectPickupTime,
    setRetrySearch,
    setToastProps,
    setToastVisible,
    selectAppConfig,
    selectFareProductType,
    selectAmbulanceServiceClicked,
} from '@/typescript/state/client/session';
import { selectAllBooking } from '@/typescript/state/client/booking';
import { isNull, isUndefined } from 'lodash';
import { checkOverlap } from '@/typescript/utils/bookingUtils';
import { OverLapBanner } from '@/typescript/screens/rideSummary/overlapBanner';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import ChevronDown from '@/typescript/assets/svg/symbols/ChevronDown';
import PetRideConfirmationModal from '@/src-v2/components/PetRideConfirmationModal';
import AmbulanceConfirmationModal from '@/src-v2/components/AmbulanceConfirmationModal';
import { FareTypes, getFareType } from '@/typescript/utils/fareEntityHelper';
import BoostSearchTipsModal from '@/typescript/screens/lookingForRides/BoostSearchTipsModal';
import { colors as configColors } from 'config-types/src/domain/default/themes/colors.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList';
import { emptyJourneyDetailsProps } from '@/src-v2/multimodal/screens/JourneyInfoScreen';
import { InProgressJourneyModal } from '@/typescript/components/InProgressJourneyModal';
import { CancellationInfoModal } from '@/typescript/designSystem/components/CancellationInfoModal';
import { InfoIcon } from '@/typescript/assets/svg/symbols/InfoIcon';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

interface ChooseRideFooterProps {
    hideAccessibility: boolean;
    isScrolled: boolean;
    searchId: string | null;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
}

export const ChooseRideFooter: React.FC<ChooseRideFooterProps> = ({
    hideAccessibility,
    isScrolled,
    searchId: searchIdProp,
    multimodalProps,
}) => {
    const configManager = useConfigContext();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [isCancellationInfoVisible, setCancellationInfoVisible] = useState(false);
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom } = useSafeAreaInsets();
    const searchId = useAppSelector(state => selectSearchId(state, searchIdProp));
    const estimatesStarted = useAppSelector(state => selectEstimatesStarted(state, searchId));
    const customerTip = useAppSelector(state => selectCustomerTip(state, searchId));
    const pricingItems = useAppSelector(state => selectPricingItems(state, searchId));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, searchId));
    const enabled = pricingItems.length > 0;
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const completeRouteInfo = useAppSelector(state => selectCompleteRouteInfo(state, searchId));
    const callSelectPricingItemAPI = useCallSelectPricingItemAPI();
    const shouldShowDefaultTips = useAppSelector(selectNewFeatureFlags).shouldShowDefaultTips;
    const tipOptions = getAvailableTipOptions(shouldShowDefaultTips, selectedPricingItems);
    const isPetRide = useAppSelector(state => selectIsPetRide(state, searchId));
    const appSystemConfig = useAppSelector(selectAppConfig);
    const fareProductType = useAppSelector(state => selectFareProductType(state));
    const ambulanceServiceClicked = useAppSelector(state => selectAmbulanceServiceClicked(state));
    const isAmbulance = fareProductType === 'AMBULANCE' || ambulanceServiceClicked;

    // State for pet ride confirmation modal
    const [isPetRideModalVisible, setIsPetRideModalVisible] = useState(false);
    const pullBackSliderRef = React.useRef<(() => void) | null>(null);

    const [isAmbulanceConfirmationModalVisible, setIsAmbulanceConfirmationModalVisible] = useState(false);

    // State for InProgress journey modal
    const [isInProgressJourneyModalVisible, setIsInProgressJourneyModalVisible] = useState(false);

    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, searchId));

    const selectedJourney = useAppSelector(state => selectSelectedJourney(state, searchId));
    const journeys = useAppSelector(state => selectJourneys(state, searchId));

    // Check for any INPROGRESS journeys in the system
    const inProgressJourney = useAppSelector(selectLatestInprogressJourney);

    // Create ref to avoid stale closures
    const inProgressJourneyRef = React.useRef(inProgressJourney);
    inProgressJourneyRef.current = inProgressJourney;

    const currencySymbol = CURRENCY_SYMBOL.value;

    const selectPricingItem = useCallback(
        (onSlideError: () => void) => {
            dispatch(setEstimatesStarted({ id: searchId, payload: true }));
            callSelectPricingItemAPI({
                customerTip,
                selectedPricingItems,
                bookingId: null,
                searchId: searchId,
                onSuccess: data => {
                    logEvent(EventName.NY_USER_REQUEST_QUOTES);
                    logEvent(EventName.NY_USER_REQUEST_QUOTES_7D);
                    logEvent(EventName.NY_USER_REQUEST_QUOTES_30D);
                    const updatedParams: { [key: string]: number | string | undefined } = {
                        'Request Type': 'Auto Assign',
                        'Estimated Ride Distance': completeRouteInfo?.distance,
                        ...(selectedPricingItems.length === 1
                            ? {
                                  [`Estimate Fare (${currencySymbol})`]:
                                      selectedPricingItems.at(0)?.estimatedFareWithCurrency.amount,
                              }
                            : selectedPricingItems.length > 1
                              ? {
                                    [`Estimate Fare (${currencySymbol})`]: selectedPricingItems
                                        .map(item =>
                                            item.serviceTierName
                                                ? `${item.serviceTierName} : ${item.estimatedFareWithCurrency.amount} ,`
                                                : '',
                                        )
                                        .join(' '),
                                }
                              : {}),
                    };
                    logEvent(EventName.NY_RIDER_REQUEST_QUOTE, updatedParams);
                    logEvent(EventName.NY_RIDER_REQUEST_QUOTE_7D, updatedParams);
                    logEvent(EventName.NY_RIDER_REQUEST_QUOTE_30D, updatedParams);
                    logEvent(EventName.NY_USER_AUTO_CONFIRM);
                    logEvent(EventName.NY_USER_AUTO_CONFIRM_7D);
                    logEvent(EventName.NY_USER_AUTO_CONFIRM_30D);
                    switch (selectedPricingItems.at(0)?.tripMode) {
                        case TripMode.DynamicOffer:
                            customerTip && dispatch(setIsSearchBoosted({ id: searchId, payload: true }));
                            break;
                        case TripMode.StaticOffer:
                        case TripMode.RideOtp:
                            dispatch(setBookingId({ id: userToken, payload: createBookingId(data.bookingId) }));
                            break;
                    }
                    setTimeout(() => {
                        dispatch(setEstimatesStarted({ id: searchId, payload: false }));
                        gotoLookingForRides(
                            dispatch,
                            multimodalProps ? 'gotoLookingForRides_journey' : 'gotoLookingForRides',
                        );
                        if (multimodalProps) {
                            navigation.popTo('mainTabNavigation', {
                                screen: 'homeTab_homeScreen',
                                params: {
                                    multimodalProps,
                                    journeyDetailsProps: undefined,
                                },
                            });
                        }
                    }, 500);
                },
                onError: error => {
                    dispatch(setEstimatesStarted({ id: searchId, payload: false }));
                    if (
                        error?.data?.errorCode === 'SEARCH_REQUEST_EXPIRED' ||
                        error?.data?.errorMessage?.includes('Estimate expired')
                    ) {
                        dispatch(setRetrySearch(true));
                        dispatch(
                            setToastProps({
                                message: userLanguageStrings.Updatingfarestogetyouthelatestprices,
                                visible: true,
                                backgroundColor: colors?.recovered?.blue,
                                autoDismissAfter: 3000,
                                buttons: [],
                                useSpannedToast: false,
                                bottomSpanDescription: undefined,
                                spannerType: 'bottom',
                                logo: undefined,
                                dismissButton: () => {
                                    dispatch(setToastVisible(false));
                                },
                                onSpannedToastLoad: undefined,
                                margin: undefined,
                                customToast: undefined,
                            }),
                        );
                        dispatch(setToastVisible(true));
                    }
                    dispatch(setRetrySearch(true));
                    onSlideError();
                },
            });
        },
        [
            dispatch,
            searchId,
            callSelectPricingItemAPI,
            customerTip,
            selectedPricingItems,
            completeRouteInfo,
            currencySymbol,
            multimodalProps,
            navigation,
            userToken,
            userLanguageStrings,
        ],
    );

    const onSlideComplete = useCallback(
        (pullBackSlider: () => void) => {
            logEvent(EventName.NY_USER_QUOTE_CONFIRM);

            // Check for INPROGRESS journey first
            if (!multimodalProps && inProgressJourneyRef.current && appSystemConfig.flowConfig.enableLiveTracking) {
                setIsInProgressJourneyModalVisible(true);
                pullBackSlider();
                return;
            }

            // If pet ride is enabled, show the confirmation modal
            if (isPetRide) {
                pullBackSliderRef.current = pullBackSlider;
                setIsPetRideModalVisible(true);
                return;
            }

            if (isAmbulance) {
                setIsAmbulanceConfirmationModalVisible(true);
                pullBackSlider();
                return;
            }

            // Otherwise, proceed with normal flow
            switch (selectedPricingItems.at(0)?.tripCategory) {
                // Handle rental and ambulance once design is finalised
                case TripCategory.Ambulance:
                case TripCategory.OneWay:
                    selectPricingItem(pullBackSlider);
                    break;
                case TripCategory.Rental:
                case TripCategory.InterCity:
                    pullBackSlider();
                    navigation.navigate('ServicesTab', {
                        screen: 'extendedBookingNavigator',
                        params: {
                            screen: 'preBookRideSummary',
                        },
                    });
                    break;
            }
            logger.logInfo(`Slider.QuoteConfirm`, 'BookingFlow');
        },
        [
            multimodalProps,
            selectedPricingItems,
            navigation,
            dispatch,
            selectPricingItem,
            isPetRide,
            isAmbulance,
            appSystemConfig.flowConfig.enableLiveTracking,
        ],
    );

    // Handler for confirming pet ride from modal
    const handleConfirmPetRide = () => {
        setIsPetRideModalVisible(false);

        switch (selectedPricingItems.at(0)?.tripCategory) {
            case TripCategory.Ambulance:
            case TripCategory.OneWay:
                selectPricingItem(() => {});
                break;
            case TripCategory.Rental:
            case TripCategory.InterCity:
                navigation.navigate('ServicesTab', {
                    screen: 'extendedBookingNavigator',
                    params: {
                        screen: 'preBookRideSummary',
                    },
                });
                break;
        }
    };

    const handleConfirmAmbulanceRide = () => {
        setIsAmbulanceConfirmationModalVisible(false);
        switch (selectedPricingItems.at(0)?.tripCategory) {
            case TripCategory.Ambulance:
            case TripCategory.OneWay:
                selectPricingItem(() => {});
                break;
            case TripCategory.Rental:
            case TripCategory.InterCity:
                navigation.navigate('ServicesTab', {
                    screen: 'extendedBookingNavigator',
                    params: {
                        screen: 'preBookRideSummary',
                    },
                });
                break;
        }
    };

    const isIntercity = selectedPricingItems?.some(item => item?.tripCategory === TripCategory.InterCity);
    const isTipPossible = selectedPricingItems?.some(item => item?.tripMode === TripMode.DynamicOffer);
    const cancellationCharges = selectedPricingItems[0]?.fareBreakup?.find(
        val => getFareType(val.title).name === FareTypes.CANCELLATION_CHARGES,
    )?.priceWithCurrency?.amount;

    const getBusinessDiscountAmount = useCallback(
        (item?: PricingItemType): number => {
            if (!item || selectedTripType !== 'BUSINESS' || !item.businessDiscountInfo) {
                return 0;
            }
            return item.businessDiscountInfo.businessDiscount || 0;
        },
        [selectedTripType],
    );

    const applyBusinessDiscount = useCallback(
        (amount: number | undefined, item?: PricingItemType) => {
            if (amount === undefined || amount === null) {
                return amount;
            }
            const discountAmount = getBusinessDiscountAmount(item);
            if (!discountAmount) {
                return amount;
            }
            return Math.max(0, amount - discountAmount);
        },
        [getBusinessDiscountAmount],
    );
    const minCost = useMemo(() => {
        if (!selectedPricingItems || selectedPricingItems.length === 0) {
            return 0;
        }
        const values = selectedPricingItems
            .map(item => {
                const itemPetCharges = item?.fareBreakup?.find(
                    val => getFareType(val.title).name === FareTypes.PET_CHARGES,
                )?.priceWithCurrency?.amount;
                const baseMinCost = adjustPriceForPetRide(item?.cost, isPetRide, itemPetCharges);
                const discountedMinCost = applyBusinessDiscount(baseMinCost, item);
                return (discountedMinCost ?? 0) + (customerTip ?? 0);
            })
            .filter(value => typeof value === 'number' && !Number.isNaN(value));
        if (!values.length) {
            return 0;
        }
        return Math.min(...values);
    }, [selectedPricingItems, customerTip, isPetRide, applyBusinessDiscount]);
    const maxCost = useMemo(() => {
        if (!selectedPricingItems || selectedPricingItems.length === 0) {
            return 0;
        }
        const values = selectedPricingItems
            .map(item => {
                const itemPetCharges = item?.fareBreakup?.find(
                    val => getFareType(val.title).name === FareTypes.PET_CHARGES,
                )?.priceWithCurrency?.amount;
                const baseMaxCost = adjustPriceForPetRide(item?.toCost ?? item?.cost, isPetRide, itemPetCharges);
                const discountedMaxCost = applyBusinessDiscount(baseMaxCost, item);
                return (discountedMaxCost ?? 0) + (customerTip ?? 0);
            })
            .filter(value => typeof value === 'number' && !Number.isNaN(value));
        if (!values.length) {
            return 0;
        }
        return Math.max(...values);
    }, [selectedPricingItems, customerTip, isPetRide, applyBusinessDiscount]);
    const priceString = useMemo(
        () =>
            minCost < maxCost
                ? ` @ ${currencySymbol}${minCost}-${currencySymbol}${maxCost}`
                : ` @ ${currencySymbol}${minCost}`,
        [minCost, maxCost],
    );
    const baseText = isIntercity
        ? SHOW_PRIMARY_CTA
            ? userLanguageStrings.clicktoConfirmVehicle
            : userLanguageStrings.SlidetoConfirmVehicle
        : SHOW_PRIMARY_CTA
          ? !isNull(selectedJourney) && !isPetRide && selectedTripType !== 'BUSINESS'
              ? userLanguageStrings.PresstobookPublicTransport
              : userLanguageStrings.BookRide
          : userLanguageStrings.Slidetobookride;

    const activeBookingIds = useAppSelector(selectActiveBookingIds);
    const allBookings = useAppSelector(selectAllBooking);
    const activeBookingDetails = allBookings
        ? activeBookingIds
              .map(id => (allBookings[id] ? allBookings[id].bookingDetails : null))
              .filter(booking => !isNull(booking))
        : [];

    const overlappingPollingTime = 30 * 60;
    const searchPickupTime = useAppSelector(selectPickupTime);
    const searchDropTime = useAppSelector(selectDropTime);
    const rideEndTime_ = new Date(
        (searchPickupTime ? new Date(searchPickupTime) : new Date()).getTime() +
            (completeRouteInfo?.duration ?? overlappingPollingTime) * 1000,
    );
    const result = checkOverlap({
        rideStartTime: searchPickupTime ? searchPickupTime : new Date().toISOString(),
        rideEndTime: searchDropTime ? searchDropTime : rideEndTime_.toISOString(),
        activeBookingDetails,
        overlappingPollingTime,
    });
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const buttonTextStr = baseText + (selectedPricingItems.length !== 0 && isNull(selectedJourney) ? priceString : '');

    const multiHopReviewJourney = useCallback(() => {
        // Check for INPROGRESS journey first
        if (!multimodalProps && inProgressJourneyRef.current && appSystemConfig.flowConfig.enableLiveTracking) {
            setIsInProgressJourneyModalVisible(true);
            return;
        }
        logEvent(EventName.USER_QUOTE_REQUEST_NAMMA_TRANSIT);
        dispatch(setSelectedJourney({ id: searchId, payload: journeys[0] ?? null }));
        navigation.navigate('ServicesTab', {
            screen: 'singleModeBookingNavigator',
            params: {
                screen: 'journeyDetails',
                params: emptyJourneyDetailsProps,
            },
        });
    }, [dispatch, searchId, journeys, navigation, multimodalProps, setIsInProgressJourneyModalVisible]);

    const onBookRideButton = useCallback(
        (pullBackSlider: () => void) => {
            if (!isNull(selectedJourney) && !isPetRide && selectedTripType !== 'BUSINESS') {
                pullBackSlider();
                multiHopReviewJourney();
            } else {
                onSlideComplete(pullBackSlider);
            }
        },
        [selectedJourney, isPetRide, selectedTripType, onSlideComplete, multiHopReviewJourney],
    );

    return (
        <Animated.View
            accessibilityElementsHidden={hideAccessibility}
            importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}
            entering={FadeIn.delay(100)}
            exiting={FadeOut.duration(100)}
            layout={LinearTransition.springify().damping(30).stiffness(280)}
            style={[
                tailwind.style(
                    `bg-[${colors?.recovered?.white}] w-full absolute bottom-0 pb-[${
                        bottom || 12
                    }px] border-t border-t-[${themeColors.Fill_neutralUltraLow}]`,
                ),
                {
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 20,
                    elevation: 40,
                    zIndex: 1,
                },
            ]}
            accessible={false}>
            {featureFlags.customerCancellationConfig.enableCancellationCharges &&
                !isUndefined(cancellationCharges) &&
                cancellationCharges > 0 && (
                    <TouchableOpacity
                        testID="cancellation-info-button"
                        style={tailwind.style('flex-row items-center justify-center pt-2')}
                        onPress={() => setCancellationInfoVisible(true)}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel={userLanguageStrings.IncludesPastCancellationFeeText(
                            cancellationCharges.toString(),
                            CURRENCY_SYMBOL.value,
                        )}>
                        <View style={tailwind.style('mr-1')}>
                            <InfoIcon />
                        </View>
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[#5B6777] text-[14px]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={false}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.IncludesPastCancellationFeeText(
                                cancellationCharges.toString(),
                                CURRENCY_SYMBOL.value,
                            )}
                        </Typography>
                    </TouchableOpacity>
                )}
            {selectedPricingItems.length != 0 && !isScrolled && <ScrollArrowIndicator />}
            {featureFlags.estimatesTipEnabled &&
            isTipPossible &&
            enabled &&
            !estimatesStarted &&
            tipOptions.length > 0 ? (
                <AddTipOptionView searchId={searchId} />
            ) : null}
            <Animated.View layout={LinearTransition.springify().damping(30).stiffness(280)}>
                <MovingButtonSlide
                    disabled={!enabled}
                    buttonText={buttonTextStr}
                    validateFinalizeEvent={() => {
                        return true;
                    }}
                    failedCheckOverlap={() => result.overLapping}
                    onSlideComplete={onBookRideButton}
                    testID={isNull(selectedJourney) && !isPetRide ? 'review_journey_button' : 'book_ride_button'}
                />
            </Animated.View>
            <OverLapBanner overLapBookingTime={result.overLappedBookingTime} />

            {/* Pet Ride Confirmation Modal */}
            <PetRideConfirmationModal
                visible={isPetRideModalVisible}
                onClose={() => {
                    setIsPetRideModalVisible(false);
                    pullBackSliderRef.current?.();
                }}
                onConfirm={handleConfirmPetRide}
            />

            <AmbulanceConfirmationModal
                visible={isAmbulanceConfirmationModalVisible}
                onClose={() => setIsAmbulanceConfirmationModalVisible(false)}
                onConfirm={handleConfirmAmbulanceRide}
            />

            <CancellationInfoModal
                visible={isCancellationInfoVisible}
                onClose={() => setCancellationInfoVisible(false)}
            />

            {/* InProgress Journey Modal */}
            {inProgressJourney && inProgressJourney.journeyId && (
                <InProgressJourneyModal
                    visible={isInProgressJourneyModalVisible}
                    onClose={() => {
                        setIsInProgressJourneyModalVisible(false);
                    }}
                    onCompleteRide={() => onBookRideButton(() => {})}
                    journeyId={inProgressJourney.journeyId}
                />
            )}
        </Animated.View>
    );
};

interface AddTipOptionViewProps {
    searchId: string | null;
}
const AddTipOptionView: FC<AddTipOptionViewProps> = ({ searchId }) => {
    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const currencySymbol = CURRENCY_SYMBOL.value;
    const isAddTipSelected = useAppSelector(state => selectIsAddTipSelected(state, searchId));
    const customerTip = useAppSelector(state => selectCustomerTip(state, searchId));
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, searchId));

    const smartTipReasonFormatted = selectedPricingItems?.[0]?.smartTipSuggestion?.description?.replace(
        /\s*<br>\s*/g,
        '\n',
    );

    return (
        <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            layout={LinearTransition.springify().damping(28).stiffness(300)}
            style={tailwind.style('pt-1')}>
            <View
                style={tailwind.style(`flex-row items-center justify-between px-[${token?.spacing?.[20]}]`)}
                //layout={LinearTransition}>
            >
                <View
                    style={tailwind.style(`flex-row items-center gap-[${token?.gap.spacing[8]}] max-w-[80%]`)}
                    accessible>
                    {!isAddTipSelected ? (
                        <Animated.View style={tailwind.style('pb-0.5')}>
                            <Icon icon={<SvgGift />} color={configColors.gray650} size={16} />
                        </Animated.View>
                    ) : null}
                    <Animated.View entering={FadeIn} exiting={FadeOut.duration(100)}>
                        {smartTipReasonFormatted && isAddTipSelected ? null : (
                            <CurrencyText
                                textType="subhead-1"
                                textStyle={tailwind.style(`text-[#9392A0]`)}
                                text={
                                    isAddTipSelected
                                        ? customerTip
                                            ? userLanguageStrings.Selectedtip
                                            : userLanguageStrings.Selecttip
                                        : customerTip
                                          ? userLanguageStrings.TipAdded(customerTip, CURRENCY_SYMBOL.value)
                                          : userLanguageStrings.Wishtoaddatip
                                }
                                currencyStyle={tailwind.style(`font-inter-extrabold`)}
                            />
                        )}
                        {smartTipReasonFormatted && isAddTipSelected ? (
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[#5B677] mb-1 w-[75%]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {smartTipReasonFormatted}
                            </Typography>
                        ) : null}
                    </Animated.View>
                </View>

                {!isAddTipSelected ? (
                    <TouchableOpacity
                        testID="f5935f99-41c9-4e83-94b5-291e6a5454f0"
                        accessible
                        accessibilityRole="button"
                        style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                        accessibilityLabel={customerTip ? 'Change Tip amount' : 'Add tip'}
                        accessibilityHint={
                            `Selected items price range ${currencySymbol}` +
                            (selectedPricingItems?.[0]?.estimatedFareWithCurrency.amount
                                ? ` ${selectedPricingItems[0]?.estimatedFareWithCurrency.amount} to ${currencySymbol}`
                                : '')
                        }
                        onPress={() => {
                            dispatch(setIsAddTipSelected({ id: searchId, payload: !isAddTipSelected }));
                        }}>
                        <Typography
                            type="callout"
                            style={{ color: themeColors.Text_LinkBlue }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {customerTip ? userLanguageStrings.Change : userLanguageStrings.AddTip}
                        </Typography>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        testID="cancel-adding-tip"
                        accessible
                        accessibilityLabel={`Cancel Tip`}
                        accessibilityRole="button"
                        accessibilityHint={
                            `Selected items price range ${currencySymbol}` +
                            (selectedPricingItems?.[0]?.estimatedFareWithCurrency.amount
                                ? ` ${selectedPricingItems[0]?.estimatedFareWithCurrency.amount} to ${currencySymbol}`
                                : '')
                        }
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                        }}
                        onPress={() => {
                            dispatch(setIsAddTipSelected({ id: searchId, payload: false }));
                            dispatch(setCustomerTip({ id: searchId, payload: undefined }));
                        }}>
                        <Typography
                            type="callout"
                            style={{ color: themeColors.Text_LinkBlue }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Cancel}
                        </Typography>
                    </TouchableOpacity>
                )}
            </View>
            {isAddTipSelected ? (
                <BoostSearchTipsModal
                    selectTip={customerTip}
                    setSelectedTip={tip => {
                        if (typeof tip === 'number' || typeof tip === 'undefined') {
                            dispatch(setCustomerTip({ id: searchId, payload: tip ?? undefined }));
                        }
                        AccessibilityInfo.announceForAccessibility(`Selected tip of rupees ${tip}`);
                    }}
                    isEstimatesScreen={true}
                />
            ) : null}
        </Animated.View>
    );
};

// Animated arrow indicator component that shows users there are more options to scroll
const ScrollArrowIndicator = React.memo(() => {
    const translateY = useSharedValue(0);

    useEffect(() => {
        translateY.value = 0;

        translateY.value = withRepeat(
            withSpring(-10, {
                damping: 8,
                stiffness: 50,
                mass: 0.5,
                restDisplacementThreshold: 0.01,
                restSpeedThreshold: 0.01,
            }),
            -1,
            true,
        );
    }, []);

    const arrowAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    return (
        <Animated.View
            style={[
                {
                    position: 'absolute',
                    top: -35,
                    left: 0,
                    right: 0,
                    zIndex: 10,
                    alignItems: 'center',
                },
                arrowAnimatedStyle,
            ]}>
            <Animated.View
                style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 20,
                }}>
                <ChevronDown width={18} height={18} />
            </Animated.View>
        </Animated.View>
    );
});
