import React from 'react';
import Animated from 'react-native-reanimated';
import Button from '@/src-v2/primitives/Button';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets';
import { tailwind } from '../tailwindTheme/tailwind';
import { View } from 'react-native';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { BookingId, removeActiveBookingId } from '../state/client/user';
import { BottomSheetStage, setBottomSheetStage, setToastProps } from '../state/client/session';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useCancelBookingMutation } from '../state/server/bookingApi';
import Typography from '../designSystem/components/primitives/Typography';
import ArrowLeft from '../assets/svg/symbols/ArrowLeft';
import colors from '../designSystem/colorPalette';
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
import Scheduled from '../assets/svg/symbols/Scheduled.tsx';
import { useRefsContext } from '../context/RefsContext';
import Danger from '../components/svg/Danger';
import {
    selectBookedSourceWithId,
    selectBookedStopsWithId,
    selectBookingDetailsWithId,
    selectRideIdWithBookingId,
} from '../state/client/booking.ts';
import { estimateFares } from '@/api/apiTypes/SearchResults.gen.tsx';
import { selectRideDetailsWithId } from '../state/client/ride.ts';
import CardDriver from '../designSystem/components/CardDriver.tsx';
import { useDriverPhotoUri } from '@/typescript/hooks/useDriverPhotoUri';
import CallDriver from './CallDriver.tsx';
import { CallIcon } from '../components/svg/CallIcon.tsx';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler.tsx';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import { formatPhone } from '../../../src-v2/utils/Booking.ts';
import useBookingDetailsOnStatusChange from '../hooks/useBookingDetailsOnStatusChange.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MainNavigationParamList } from '../navigation/globalParamList.tsx';
import { clearSession } from '../state/client/session';
import { resetIds } from '../state/sharedReducer';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity.tsx';

export type ScheduleRideSummaryProps = {
    bookingId: BookingId;
    fareBreakups: estimateFares[] | undefined;
};

export const ScheduleRideSummary = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { top, bottom } = useSafeAreaInsets();
    const route: RouteProp<{ params: ScheduleRideSummaryProps }, 'params'> = useRoute();

    const userToken = useAppSelector(selectToken);
    const bookingId = route.params.bookingId;
    const fareBreakups = route.params.fareBreakups;
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const isScreenFocused = useIsFocused();
    useBookingDetailsOnStatusChange(bookingId, rideId, 5000, false, isScreenFocused);
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const pickupTime = bookingDetails?.rideScheduledTime;
    const dropTime = bookingDetails?.returnTime;
    const searchedSource = useAppSelector(state => selectBookedSourceWithId(state, bookingId));
    const searchedStops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { rideSummaryScreenCancelButtonRef } = useRefsContext();
    const driverPhotoUri = useDriverPhotoUri(rideDetails?.driverImage);
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
    const fareBreakup = fareBreakups || [];
    const [perKmCharge, perMinCharge] = [
        fareBreakup.find(item => item.title === 'UNPLANNED_PER_KM_CHARGE'),
        fareBreakup.find(item => item.title === 'PER_MINUTE_CHARGE'),
    ];

    const extraDistanceFareVal = perKmCharge?.priceWithCurrency?.amount?.toString();
    const extraTimeFareVal = perMinCharge?.priceWithCurrency?.amount?.toString();
    const currencyValue = perKmCharge?.priceWithCurrency?.currency
        ? getCurrency(perKmCharge.priceWithCurrency.currency)
        : '₹';

    const resetSearchStageData = () => {
        dispatch(clearSession(['currentLocation']));
        resetIds(userToken, null, dispatch);
    };

    const navigateToHome = () => {
        resetSearchStageData();
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'sr_gotoHome' }));
        navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
    };

    const cancelScheduledRide = () => {
        resetSearchStageData();
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'sr_cancelScheduledRide' }));
        navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
    };

    const { callDriverBottomsheetModalRef } = useRefsContext();
    const exophone = formatPhone(bookingDetails?.merchantExoPhone);
    return (
        <HardwareBackpressHandler onHardwareBackPress={navigateToHome}>
            <Animated.View style={tailwind.style('h-full')}>
                <Animated.View style={tailwind.style(`mt-${top - 16}px flex-1 bg-gray-100`)}>
                    {/* Header Section */}
                    <View style={tailwind.style(`px-16px`)}>
                        <View style={tailwind.style(`flex-row justify-between items-center`)}>
                            <View style={tailwind.style(`flex-row justify-left items-center py-16px`)}>
                                <Button
                                    testID="schedule_summary_back"
                                    size="md"
                                    type="secondary"
                                    prefix={<ArrowLeft />}
                                    onPress={navigateToHome}
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
                            {rideDetails ? (
                                <Button
                                    testID="schedule_summary_call_driver"
                                    size="md"
                                    type="secondary"
                                    prefix={<CallIcon />}
                                    text=" Driver"
                                    onPress={() => callDriverBottomsheetModalRef.current?.present()}
                                />
                            ) : null}
                        </View>
                    </View>
                    {/* Header End */}
                    {/* Main Section */}
                    <Animated.ScrollView
                        style={tailwind.style('px-4 w-full flex-grow')}
                        contentContainerStyle={tailwind.style('pb-40')}>
                        {/* rideDetailsCard */}
                        {/* <RideSummaryCard config={rideSummaryCardConfig} /> */}
                        {/* ride Confirmed Card */}
                        {rideDetails ? (
                            <CardDriver
                                vehicleServiceType={bookingDetails?.vehicleServiceTierType}
                                serviceTierName={bookingDetails?.serviceTierName}
                                isAirConditioned={bookingDetails?.isAirConditioned}
                                avatarUri={driverPhotoUri}
                                driverName={rideDetails?.driverName}
                                vehicleModel={rideDetails?.vehicleModel}
                                vehicleColor={rideDetails?.vehicleColor}
                                rideId={rideId}
                                vehicleNumber={rideDetails?.vehicleNumber}
                                rating={rideDetails?.driverRatings}
                                capacity={bookingDetails?.vehicleServiceTierSeatingCapacity || 3}
                            />
                        ) : (
                            <Animated.View
                                style={tailwind.style(
                                    'w-full my-2 bg-white border border-gray-100 rounded-2xl shadow-sm p-4',
                                )}>
                                {/*  */}
                                <View style={tailwind.style('flex-row items-center')}>
                                    <Scheduled height={57} width={61} />
                                    <View style={tailwind.style('flex-column')}>
                                        <Typography
                                            type="subhead-800"
                                            style={undefined}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {userLanguageStrings.RideScheduled}
                                        </Typography>
                                        <Typography
                                            type="body-7"
                                            style={tailwind.style(`text-[${colors.primitive.gray[12]}] pr-12`)}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {userLanguageStrings.DriverWillBeAssigned}
                                        </Typography>
                                    </View>
                                </View>
                            </Animated.View>
                        )}
                        <RideSummaryCardV2
                            vehicleIconUrl={bookingDetails?.vehicleIconUrl}
                            serviceTierName={bookingDetails?.serviceTierName}
                            serviceTierShortDesc={bookingDetails?.serviceTierShortDesc}
                            maxVehicleServiceTierSeatingCapacity={bookingDetails?.vehicleServiceTierSeatingCapacity}
                            estimatedFareWithCurrency={bookingDetails?.estimatedFareWithCurrency}
                            fareBreakup={fareBreakups}
                            startTimeUTC={pickupTime ?? null}
                            returnTimeUTC={dropTime ?? null}
                            scheduledRideType={
                                bookingDetails?.tripCategory?.TAG === 'Rental'
                                    ? ScheduledRideType.Rental
                                    : ScheduledRideType.Intercity
                            }
                        />
                        {bookingDetails?.tripCategory?.TAG === 'Rental' ? null : (
                            <DropdownCard
                                testID="schedule_summary_pickup_and_drop"
                                onToggle={undefined}
                                title={userLanguageStrings.PickupAndDrop}
                                initialState={false}
                                titleStyle={undefined}
                                enableAnimation={undefined}>
                                <Animated.View>
                                    <SourceToDestination
                                        stops={searchedStops.map(stop => ({
                                            area: stop?.area,
                                            address: stop?.address,
                                            editable: false,
                                        }))}
                                        originEditable={false}
                                        originTitle={searchedSource?.area}
                                        originAddress={searchedSource?.address}
                                        onEditPickupClick={undefined}
                                        onEditDestinationClick={undefined}
                                    />
                                </Animated.View>
                            </DropdownCard>
                        )}
                        <DropdownCard
                            testID="schedule_summary_trip_fare_includes"
                            onToggle={undefined}
                            title={userLanguageStrings.TripFareIncludes}
                            initialState={false}
                            titleStyle={undefined}
                            enableAnimation={false}>
                            <Animated.View>
                                <Animated.View style={tailwind.style('w-full flex flex-col mt-2')}>
                                    <View>
                                        <View style={tailwind.style('w-full flex flex-row')}>
                                            <View style={tailwind.style('w-1/2 flex flex-col')}>
                                                <ChargesTile
                                                    label="Distance"
                                                    value={
                                                        bookingDetails?.estimatedDistance
                                                            ? getDistanceWithUnit(bookingDetails?.estimatedDistance)
                                                            : '--'
                                                    }
                                                />
                                            </View>
                                            <View style={tailwind.style('flex-1')} />
                                            <View style={tailwind.style('w-1/2 flex flex-col')}>
                                                <ChargesTile
                                                    label="Time"
                                                    value={formatSecondsToTime(bookingDetails?.estimatedDuration)}
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
                                                <Typography
                                                    type="body-2"
                                                    style={tailwind.style('text-gray-400')}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {`${currencyValue}${extraDistanceFareVal} per km and ${currencyValue}${extraTimeFareVal} per min`}
                                                    {/* to be fetched from backend */}
                                                </Typography>
                                            </View>
                                        </View>
                                    ) : null}
                                </Animated.View>
                            </Animated.View>
                        </DropdownCard>
                        <DropdownCard
                            testID="schedule_summary_trip_fare_excludes"
                            onToggle={undefined}
                            title={userLanguageStrings.TripFareExcludes}
                            initialState={false}
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
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="schedule_summary_cancel_booking"
                            style={tailwind.style('items-center')}
                            onPress={() => {
                                rideSummaryScreenCancelButtonRef?.current?.present();
                            }}>
                            <Typography
                                type="body-2"
                                style={tailwind.style(`text-[${colors.primitive.gray[12]}] mt-2 underline`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.CancelScheduledBooking}
                            </Typography>
                        </TouchableOpacity>
                    </Animated.ScrollView>
                    <CancelButtonView bookingId={bookingId} onCancellationSuccess={cancelScheduledRide} />
                    {/* Main Section End */}
                    {/* Footer Section */}
                    <Animated.View
                        style={tailwind.style(`absolute bottom-0 left-0 w-full bg-white pb-[${bottom}px]px pt-4 px-4`)}>
                        <Button testID="schedule_summary_done" type="primary" text={'Done'} onPress={navigateToHome} />
                    </Animated.View>
                    {/* Footer ENd*/}
                </Animated.View>
                <PopUpModal
                    sheetRef={callDriverBottomsheetModalRef}
                    enableDynamicSizing={true}
                    onHardwareBackPress={undefined}
                    showBackdrop={undefined}
                    isScrollable={false}>
                    <CallDriver
                        driverNumber={formatPhone(rideDetails?.driverNumber)}
                        exoNumber={exophone}
                        onClose={undefined}
                        bookingId={bookingId}
                        rideId={rideId}
                    />
                </PopUpModal>
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

type CancelButtonProps = {
    bookingId: BookingId | null;
    onCancellationSuccess: () => void;
};

const CancelButtonView: React.FC<CancelButtonProps> = ({ bookingId, onCancellationSuccess }) => {
    const { rideSummaryScreenCancelButtonRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const [cancelBooking, { isLoading }] = useCancelBookingMutation();
    const dispatch = useAppDispatch();
    const userToken = useAppSelector(selectToken);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <PopUpModal
            sheetRef={rideSummaryScreenCancelButtonRef}
            enableDynamicSizing={true}
            onHardwareBackPress={undefined}
            showBackdrop={undefined}
            isScrollable={false}>
            <Animated.View style={tailwind.style(`items-center pb-[${bottom}]px rounded-2xl bg-gray-100`)}>
                <Animated.View style={tailwind.style(`m-4 p-4 w-full space-y-4`)}>
                    <Animated.View style={tailwind.style('m-2')}>
                        <Typography
                            type="body-1"
                            style={undefined}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.AreYouSureWantToCancel}
                        </Typography>
                    </Animated.View>
                    <Animated.View style={tailwind.style('gap-y-4')}>
                        <Button
                            testID="schedule_summary_cancel_go_back"
                            type="primary"
                            text={userLanguageStrings.GoBack}
                            onPress={() => {
                                rideSummaryScreenCancelButtonRef?.current?.close();
                            }}
                        />
                        <Button
                            testID="schedule_summary_cancel_confirm"
                            type="secondary-danger"
                            text={userLanguageStrings.CancelScheduledBooking}
                            isLoading={isLoading}
                            onPress={() => {
                                if (bookingId && bookingId != null) {
                                    const cancelBookingReq = {
                                        bookingId,
                                        data: {
                                            additionalInfo: 'Others',
                                            reasonCode: '',
                                            reasonStage: 'OnSearch',
                                            reallocate: false,
                                        },
                                    };
                                    cancelBooking(cancelBookingReq)
                                        .unwrap()
                                        .then(() => {
                                            dispatch(
                                                removeActiveBookingId({
                                                    id: userToken,
                                                    payload: bookingId,
                                                }),
                                            );
                                            onCancellationSuccess();
                                        })
                                        .catch(error => {
                                            dispatch(
                                                setToastProps({
                                                    visible: true,
                                                    message: userLanguageStrings.RidecancellationfailednPleaseretry,
                                                    backgroundColor: `${themeColors.Fill_negativeHigh}`,
                                                    autoDismissAfter: 2100,
                                                    logo: <Danger />,
                                                    buttons: [],
                                                    useSpannedToast: undefined,
                                                    bottomSpanDescription: undefined,
                                                    spannerType: undefined,
                                                    dismissButton: undefined,
                                                    onSpannedToastLoad: undefined,
                                                    margin: undefined,
                                                    customToast: undefined,
                                                }),
                                            );
                                            console.error('cancel ride error', error);
                                        })
                                        .finally(() => {
                                            rideSummaryScreenCancelButtonRef?.current?.close();
                                        });
                                }
                            }}
                        />
                    </Animated.View>
                </Animated.View>
            </Animated.View>
        </PopUpModal>
    );
};
