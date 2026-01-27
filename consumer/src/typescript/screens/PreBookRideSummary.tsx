/* eslint-disable myCustomPlugin/no-as-in-modified-files */
import React, { useRef } from 'react';
import Animated from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import { tailwind } from '../tailwindTheme/tailwind';
import { View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { selectCompleteRouteInfo, selectSelectedPricingItems } from '../state/client/search';
import { addActiveBookingIds, createBookingId, selectBookingId, setBookingId, setSearchId } from '../state/client/user';
import {
    BottomSheetStage,
    selectDropTime,
    selectFareProductType,
    selectPickupTime,
    selectSearchedSource,
    selectSearchedStops,
    setBottomSheetStage,
    setToastProps,
    setToastVisible,
    selectRideDuration,
    setRetrySearch,
} from '../state/client/session';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useCancelBookingMutation, useGetBookingDetailsMutation } from '../state/server/bookingApi';
import Typography from '../designSystem/components/primitives/Typography';
import EditIcon from '../assets/svg/symbols/EditIcon';
import ArrowLeft from '../assets/svg/symbols/ArrowLeft';
import DropdownCard from './rideSummary/DropDownCard.tsx';
import SourceToDestination from '../designSystem/components/SourceToDestination.tsx';
import { RideSummaryCardV2, ScheduledRideType } from './rideSummary/RideSummaryCard.tsx';
import Parking from '../assets/svg/symbols/Parking';
import Doc from '../assets/svg/symbols/Doc';
import Toll from '../assets/svg/symbols/Toll';
import { InfoIcon } from '../assets/svg/symbols/InfoIcon.tsx';
import { formatSecondsToTime, getDistanceWithUnit } from '../utils/common.ts';
import { selectToken } from '../state/client/auth.ts';
import { getCurrency } from '../utils/getCurrency.ts';
import { gotoLookingForRides } from '../state/sharedReducer.ts';
import { CurrencyText } from '../components/CurrencyText.tsx';
import { isUpcomingBooking } from '@/src-v2/utils/Booking.ts';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen.tsx';
import { EventName, logEvent } from '@/typescript/utils/logger';
import dayjs from 'dayjs';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRideSearchQuotesQuoteIdConfirmPostMutation } from '@/api/integrations/rtk/RideSearchQuotesQuoteIdConfirmPost.ts';
import colors from '../designSystem/colorPalette/index.ts';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common.ts';

// Debug logging flag - set to true to enable click tracking logs
const ENABLE_CLICK_LOGGING = false;

// Helper function for logging clicks
const logClick = (eventName: string) => {
    if (ENABLE_CLICK_LOGGING) {
        console.info(`[PreBookRideSummary] Click Event: ${eventName}`);
    }
};

export const PreBookRideSummary = () => {
    const { top, bottom } = useSafeAreaInsets();
    const showEdit = false; //till edit got fix
    const confirmProcessingRef = useRef<boolean>(false);
    const selectedPricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const pricingId = selectedPricingItems[0]?.id;
    const completeRouteInfo = useAppSelector(state => selectCompleteRouteInfo(state, null));

    const userToken = useAppSelector(selectToken);
    const bookingId = useAppSelector(selectBookingId);
    const pickupTime = useAppSelector(selectPickupTime);
    const dropTime = useAppSelector(selectDropTime);
    const currentRideDuration = useAppSelector(selectRideDuration);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const searchedSource = useAppSelector(selectSearchedSource);
    const searchedStops = useAppSelector(selectSearchedStops);
    const dispatch = useAppDispatch();
    const [callConfirmQuote] = useRideSearchQuotesQuoteIdConfirmPostMutation(undefined);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [cancelBooking] = useCancelBookingMutation();
    const fareProductType = useAppSelector(selectFareProductType);
    const excludedFairComponents = [
        {
            id: 1,
            icon: <Toll height={20} width={20} />,
            label: userLanguageStrings.TollChargesStr,
        },
        {
            id: 2,
            icon: <Parking height={20} width={20} />,
            label: userLanguageStrings.ParkingCharges,
        },
        {
            id: 3,
            icon: <Doc height={20} width={20} color={colors?.recovered?.greyHigh} />,
            label: userLanguageStrings.StateAndPermitCharges,
        },
    ];

    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const onConfirmBookingError = () => {
        logClick('onConfirmBookingError');
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
                    logClick('toast_dismiss_button');
                    dispatch(setToastVisible(false));
                },
                onSpannedToastLoad: undefined,
                margin: undefined,
                customToast: undefined,
            }),
        );
        if (bookingId) {
            const cancelBookingReq = {
                bookingId: bookingId,
                data: {
                    additionalInfo: 'others',
                    reallocate: false,
                    reasonCode: '',
                    reasonStage: 'OnSearch',
                },
            };
            cancelBooking(cancelBookingReq);
        }
        dispatch(setBookingId({ id: userToken, payload: null }));
        dispatch(setRetrySearch(true));
        navigateToChooseRide();
    };

    const onConfirmBooking = () => {
        logClick('onConfirmBooking');
        if (confirmProcessingRef.current) {
            return; // Prevent multiple clicks
        }
        confirmProcessingRef.current = true;
        callConfirmQuote({
            paymentMethodId: undefined,
            quoteId: pricingId || '',
        })
            .then(res => {
                const extractedBooking = res.data?.bookingId;
                if (!extractedBooking) {
                    onConfirmBookingError();
                    return;
                }
                fetchBookingDetails(extractedBooking)
                    .unwrap()
                    .then(data => {
                        const bookingDetails = data._0 as bookingAPIEntity;
                        const isUpcoming = isUpcomingBooking(bookingDetails, 2);
                        const bookingId = createBookingId(extractedBooking);
                        dispatch(addActiveBookingIds({ id: userToken, payload: bookingId }));
                        if (isUpcoming) {
                            const currentDate = new Date().toISOString();
                            const cleverTapParams = {
                                'Booking Scheduled Time': dayjs(currentDate).format('hh:mm A'),
                            };
                            logEvent(EventName.USER_INTERCITY_SCHEDULED_RIDE_CONFIRMED, cleverTapParams);
                            navigation.navigate(
                                'ServicesTab',
                                {
                                    screen: 'extendedBookingNavigator',
                                    params: {
                                        screen: 'scheduleRideSummary',
                                        params: {
                                            bookingId: bookingId,
                                            fareBreakups: selectedPricingItems[0]?.fareBreakup,
                                        },
                                    },
                                },
                                { pop: true },
                            );
                        } else {
                            dispatch(setBookingId({ id: userToken, payload: bookingId }));
                            gotoLookingForRides(dispatch);
                            logClick('navigateToMainTabNavigation');
                            navigation.goBack();
                        }
                    })
                    .catch(err => {
                        console.error('Failed to fetch booking details: ', err);
                        dispatch(addActiveBookingIds({ id: userToken, payload: bookingId }));
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'pb_bookingDetailsError' }));
                        navigation.goBack();
                    })
                    .finally(() => {
                        confirmProcessingRef.current = false;
                    });
            })
            .catch(_ => {
                onConfirmBookingError();
            });
    };

    const navigateToChooseRide = () => {
        logClick('navigateToChooseRide');
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'pb_navigateToChooseRide' }));
        navigation.goBack();
    };

    const navigateToSearch = () => {
        logClick('navigateToSearch');
        dispatch(setSearchId({ id: userToken, payload: null }));
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Search, src: 'pb_navigateToSearch' }));
        navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });
    };

    // to be fetch from backend
    const fareBreakup = selectedPricingItems[0]?.fareBreakup || [];
    const perKmChargeEntity = fareBreakup.find(item => item.title === 'UNPLANNED_PER_KM_CHARGE');
    const perMinChargeEntity = fareBreakup.find(item => item.title === 'PER_MINUTE_CHARGE');

    const [extraDistanceFareVal, extraTimeFareVal, currencyValue] = [
        perKmChargeEntity?.priceWithCurrency?.amount?.toString(),
        perMinChargeEntity?.priceWithCurrency?.amount?.toString(),
        perKmChargeEntity?.priceWithCurrency?.currency
            ? getCurrency(perKmChargeEntity.priceWithCurrency.currency)
            : CURRENCY_SYMBOL.value,
    ];

    const handleHardwareBackPress = () => {
        logClick('hardware_back_press');
        navigateToChooseRide();
    };

    const handleBackButtonPress = () => {
        logClick('back_button_press');
        navigateToChooseRide();
    };

    const handleEditButtonPress = () => {
        logClick('edit_button_press');
        navigateToSearch();
    };

    return (
        <HardwareBackpressHandler onHardwareBackPress={handleHardwareBackPress}>
            <Animated.View style={tailwind.style(`mt-${top - 16}px flex-1 bg-gray-100`)}>
                {/* Header Section */}
                <View style={tailwind.style(`px-16px`)}>
                    <View style={tailwind.style(`flex-row justify-between items-center`)}>
                        <View style={tailwind.style(`flex-row justify-left items-center py-16px`)}>
                            <Button
                                testID="pre_summary_back"
                                size="md"
                                type="secondary"
                                prefix={<ArrowLeft />}
                                onPress={handleBackButtonPress}
                            />
                            <Typography
                                type="subhead-700"
                                style={tailwind.style(`pl-12px`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.RideSummary}
                            </Typography>
                        </View>
                        {showEdit ? (
                            <Button
                                testID="pre_summary_edit"
                                size="md"
                                type="secondary"
                                prefix={<EditIcon />}
                                text={userLanguageStrings.Edit}
                                onPress={handleEditButtonPress}
                            />
                        ) : null}
                    </View>
                </View>
                {/* Header End */}
                {/* Main Section */}
                <Animated.ScrollView
                    style={tailwind.style('px-4 w-full flex-grow')}
                    contentContainerStyle={tailwind.style('pb-30')}>
                    {/* rideDetailsCard */}
                    {/* <RideSummaryCard config={rideSummaryCardConfig} /> */}

                    <RideSummaryCardV2
                        vehicleIconUrl={selectedPricingItems[0]?.vehicleIconUrl}
                        serviceTierName={selectedPricingItems[0]?.serviceTierName}
                        serviceTierShortDesc={selectedPricingItems[0]?.serviceTierShortDesc}
                        maxVehicleServiceTierSeatingCapacity={
                            selectedPricingItems[0]?.maxVehicleServiceTierSeatingCapacity
                        }
                        estimatedFareWithCurrency={selectedPricingItems[0]?.estimatedFareWithCurrency}
                        fareBreakup={selectedPricingItems[0]?.fareBreakup}
                        startTimeUTC={pickupTime}
                        returnTimeUTC={dropTime}
                        scheduledRideType={
                            fareProductType === 'RENTAL' ? ScheduledRideType.Rental : ScheduledRideType.Intercity
                        }
                    />
                    {fareProductType === 'RENTAL' ? null : (
                        <DropdownCard
                            testID="pre_summary_pickup_and_drop_card"
                            onToggle={undefined}
                            title={userLanguageStrings.PickupAndDrop}
                            titleStyle={undefined}
                            initialState={true}
                            enableAnimation={undefined}>
                            <Animated.View>
                                <SourceToDestination
                                    stops={searchedStops.map(stop => ({
                                        area: stop?.title,
                                        address: stop?.subtitle,
                                        editable: false,
                                    }))}
                                    originEditable={false}
                                    originTitle={searchedSource?.title}
                                    originAddress={searchedSource?.subtitle}
                                    onEditPickupClick={undefined}
                                    onEditDestinationClick={undefined}
                                />
                            </Animated.View>
                        </DropdownCard>
                    )}
                    <DropdownCard
                        testID="pre_summary_trip_fare_includes"
                        onToggle={undefined}
                        title={userLanguageStrings.TripFareIncludes}
                        titleStyle={undefined}
                        initialState={true}
                        enableAnimation={false}>
                        <Animated.View>
                            <Animated.View style={tailwind.style('w-full flex flex-col mt-2')}>
                                <View>
                                    <View style={tailwind.style('w-full flex flex-row')}>
                                        <View style={tailwind.style('w-1/2 flex flex-col')}>
                                            <ChargesTile
                                                label={userLanguageStrings.Distance}
                                                value={
                                                    completeRouteInfo?.distance
                                                        ? getDistanceWithUnit(completeRouteInfo?.distance)
                                                        : '--'
                                                }
                                            />
                                        </View>
                                        <View style={tailwind.style('flex-1')} />
                                        <View style={tailwind.style('w-1/2 flex flex-col')}>
                                            <ChargesTile
                                                label={userLanguageStrings.Time}
                                                value={formatSecondsToTime(currentRideDuration)}
                                            />
                                        </View>
                                    </View>
                                </View>
                                {extraDistanceFareVal && extraTimeFareVal ? (
                                    <View
                                        style={tailwind.style(
                                            'w-full flex flex-row bg-slate-100 rounded-lg p-4 my-4 items-center',
                                        )}>
                                        {
                                            <View style={tailwind.style('m-1')}>
                                                <InfoIcon />
                                            </View>
                                        }
                                        <View style={tailwind.style('flex-1 flex flex-col')}>
                                            <Typography
                                                type="body-6"
                                                style={tailwind.style('text-gray-400')}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {userLanguageStrings.ExtrasWillBeChargedAt}
                                            </Typography>
                                            <CurrencyText
                                                text={`${currencyValue}${extraDistanceFareVal} per km and ${currencyValue}${extraTimeFareVal} per min`}
                                                textType="body-2"
                                                currencyStyle={[tailwind.style('font-inter-bold')]}
                                                textStyle={[tailwind.style('text-gray-400')]}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                            </Animated.View>
                            <Animated.View></Animated.View>
                            <Animated.View></Animated.View>
                        </Animated.View>
                    </DropdownCard>
                    <DropdownCard
                        testID="pre_summary_trip_fare_excludes"
                        onToggle={undefined}
                        title={userLanguageStrings.TripFareExcludes}
                        initialState={true}
                        titleStyle={undefined}
                        enableAnimation={undefined}>
                        <Animated.View>
                            <Animated.View style={tailwind.style('flex-column justify-center')}>
                                {excludedFairComponents.map(component => (
                                    <Animated.View
                                        key={component.id}
                                        style={tailwind.style('flex-row items-center mb-4')}>
                                        {component.icon}
                                        <Typography
                                            type="body-3"
                                            style={tailwind.style('ml-2')}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {component.label}
                                        </Typography>
                                    </Animated.View>
                                ))}
                                <Typography
                                    type="body-7"
                                    style={tailwind.style('text-gray-400 mb-4')}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.FareInformation}
                                </Typography>
                            </Animated.View>
                        </Animated.View>
                    </DropdownCard>
                </Animated.ScrollView>
                {/* Main Section End */}
                {/* Footer Section */}
                <Animated.View
                    style={tailwind.style(`absolute bottom-0 left-0 w-full bg-white pb-[${bottom}px]px pt-4 px-4`)}>
                    <Button
                        testID="pre_summary_confirm_booking"
                        type="primary"
                        text={userLanguageStrings.ConfirmBooking}
                        isLoading={confirmProcessingRef.current}
                        onPress={() => {
                            logClick('confirm_booking_button');
                            onConfirmBooking();
                        }}
                    />
                </Animated.View>
                {/* Footer ENd*/}
            </Animated.View>
        </HardwareBackpressHandler>
    );
};
// Define the type for props
interface TypeChargesTile {
    label?: string;
    value?: string;
}

// ChargesTile component with proper typing
const ChargesTile = ({ label, value }: TypeChargesTile) => (
    <View style={tailwind.style('mb-2')}>
        <Typography
            type="body-6"
            style={tailwind.style('text-gray-400 mb-1')}
            numberOfLines={undefined}
            isAnimate={undefined}
            accessible={undefined}
            accessibilityLabel={undefined}
            accessibilityRole={undefined}>
            {label || ''}
        </Typography>
        <Typography
            type="body-2"
            style={tailwind.style('text-gray-700')}
            numberOfLines={undefined}
            isAnimate={undefined}
            accessible={undefined}
            accessibilityLabel={undefined}
            accessibilityRole={undefined}>
            {value || ''}
        </Typography>
    </View>
);
