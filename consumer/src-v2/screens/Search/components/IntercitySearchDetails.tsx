import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import Button from '@/src-v2/primitives/Button';
import ArrowLeft from '@/typescript/assets/svg/symbols/ArrowLeft.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import {
    BottomSheetStage,
    clearDropTime,
    clearPickupTime,
    setBottomSheetStage,
    setDropTime,
    setPickupTime,
    clearRideDuration,
    setRideDuration,
    setFareProductType,
} from '@/typescript/state/client/session.ts';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import { selectSearchedSource, selectSearchedStops } from '@/typescript/state/client/session.ts';
import SourceToDestination from '@/typescript/designSystem/components/SourceToDestination.tsx';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import DatePicker from 'react-native-date-picker';
import dayjs from 'dayjs';
import { Calendar } from '@/typescript/assets/svg/symbols/Calendar.tsx';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { usePickupRoutePostMutation } from '@/api/integrations/rtk/PickupRoutePost.ts';
import { TravelMode_travelMode } from '@/readOnly/api/types/Enums.gen.tsx';
import { selectActiveBookingIds } from '@/typescript/state/client/user.ts';
import { checkOverlap } from '@/typescript/utils/bookingUtils.ts';
import { selectAllBooking } from '@/typescript/state/client/booking.ts';
import { OverLapBanner } from '@/typescript/screens/rideSummary/overlapBanner.tsx';
import { isNull } from 'lodash';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { getDiffBetweenTimes } from '../../../../../consumer/src/typescript/utils/common';
const SCREEN_WIDTH = Dimensions.get('screen').width;

export type IntercitySearchDetailsProps = {
    backPress: () => void;
};

const one_hour = 60 * 60 * 1000;
export const IntercitySearchDetails: React.FC<IntercitySearchDetailsProps> = ({ backPress }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();
    const { top, bottom } = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const activeBookingIds = useAppSelector(selectActiveBookingIds);
    const allBookings = useAppSelector(selectAllBooking);
    const activeBookingDetails = allBookings
        ? activeBookingIds
              .map(id => (allBookings[id] ? allBookings[id].bookingDetails : null))
              .filter(booking => !isNull(booking))
        : [];

    const selectedSource = useAppSelector(selectSearchedSource);
    const selectedStops_verified = useAppSelector(selectSearchedStops);
    const searchedStops_back = useAppSelector(selectSearchedStops);
    const selectedStops = selectedStops_verified ? selectedStops_verified : searchedStops_back;
    const [estimatedDuration, setEstimatedDuration] = useState(0);
    const [pickupDate, setPickupDate] = useState(new Date());
    // return Date = Drop back at Source
    const [returnDate, setReturnDate] = useState(new Date());
    const [isRoundTrip, setIsRoundTrip] = useState(false);
    const [currentDateType, setCurrentDateType] = useState<'pickup' | 'return' | null>('pickup');

    useEffect(() => {
        dispatch(clearDropTime());
        dispatch(clearPickupTime());
        dispatch(clearRideDuration());
    }, [dispatch]);

    const [overLappingPollingTime, setOverLappingPollingTime] = useState('');
    const onViewFares = () => {
        const result = checkOverlap({
            rideStartTime: pickupDate.toISOString(),
            rideEndTime: (isRoundTrip ? returnDate : new Date(pickupDate.getTime() + estimatedDuration)).toISOString(),
            activeBookingDetails,
            overlappingPollingTime,
        });
        if (result.overLapping) {
            callOverLapBanner();
        } else {
            dispatch(setFareProductType('INTERCITY'));
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.ChooseRide, src: 'intercty_detls_onViewFares' }));
            dispatch(setPickupTime(pickupDate.toISOString()));
            if (returnDate > pickupDate && isRoundTrip) {
                dispatch(setDropTime(returnDate.toISOString()));
                dispatch(setRideDuration(getDiffBetweenTimes(pickupDate.toISOString(), returnDate.toISOString())));
            } else {
                const rideEndTime_ = new Date(pickupDate.getTime() + estimatedDuration).toISOString();
                dispatch(setRideDuration(getDiffBetweenTimes(pickupDate.toISOString(), rideEndTime_)));
            }
            navigation.navigate('mainTabNavigation', { screen: 'homeTab_homeScreen' }, { pop: true });
        }
    };

    const overlappingPollingTime = 30 * 60;
    const { overlappingRideExistModalRef, dateTimePickerBottomSheetModalRef } = useRefsContext();
    const callOverLapBanner = () => {
        dateTimePickerBottomSheetModalRef.current?.dismiss();
        overlappingRideExistModalRef.current?.present();
    };
    const handleDateChange = (date: Date) => {
        if (currentDateType === 'pickup') {
            const computedReturnDate = new Date(date.getTime() + (2 * estimatedDuration + one_hour));
            const result = checkOverlap({
                rideStartTime: date.toISOString(),
                rideEndTime: computedReturnDate.toISOString(),
                activeBookingDetails,
                overlappingPollingTime,
            });
            if (result.overLapping && result.overLappedBookingTime) {
                setOverLappingPollingTime(result.overLappedBookingTime);
                callOverLapBanner();
            } else {
                setPickupDate(date);
                setReturnDate(computedReturnDate);
            }
        } else if (currentDateType === 'return') {
            const result = checkOverlap({
                rideStartTime: pickupDate.toISOString(),
                rideEndTime: date.toISOString(),
                activeBookingDetails,
                overlappingPollingTime,
            });
            if (result.overLapping && result.overLappedBookingTime) {
                setOverLappingPollingTime(result.overLappedBookingTime);
                callOverLapBanner();
            } else {
                setReturnDate(date);
            }
        }
    };

    return (
        <Animated.View style={tailwind.style(`flex-column h-full bg-[${colors.primitive.gray[11]}]`)}>
            <Animated.View style={tailwind.style('flex-1')}>
                {/* Header Section */}
                <View style={tailwind.style(`px-16px pt-[${top - 16}]`)}>
                    <View style={tailwind.style(`flex-row justify-between items-center`)}>
                        <View style={tailwind.style(`flex-row items-center`)}>
                            <Button
                                testID="search_intercity_back"
                                size="md"
                                type="secondary"
                                prefix={<ArrowLeft />}
                                onPress={backPress}
                            />
                            <Typography
                                type="subhead-700"
                                style={tailwind.style(`pl-12px`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.IntercityRideDetails}
                            </Typography>
                        </View>
                    </View>
                </View>
                {/* Header End */}
                {/* Main Section */}
                <Animated.ScrollView
                    style={tailwind.style('px-4 h-full w-full')}
                    contentContainerStyle={tailwind.style(`pb-4`)}>
                    {/* content */}
                    <Animated.View
                        style={tailwind.style('w-full my-2 bg-white border border-gray-100 rounded-2xl shadow-sm')}>
                        <SelectorComponent
                            pickupDate={pickupDate}
                            setPickupDate={setPickupDate}
                            setReturnDate={setReturnDate}
                            returnDate={returnDate}
                            estimatedDuration={estimatedDuration}
                            setEstimatedDuration={setEstimatedDuration}
                            currentDateType={currentDateType}
                            setCurrentDateType={setCurrentDateType}
                            isRoundTrip={isRoundTrip}
                            setIsRoundTrip={setIsRoundTrip}
                            handleDateChange={handleDateChange}
                        />
                    </Animated.View>
                </Animated.ScrollView>
                {/* Main Section End */}
                <OverLapBanner overLapBookingTime={overLappingPollingTime} />
                {/* Footer Section */}
                <Animated.View style={tailwind.style(` w-full bg-white pt-4 px-4 pb-[${bottom || 12}]`)}>
                    <Animated.View>
                        <SourceToDestination
                            stops={selectedStops.map(stop => ({
                                area: stop?.title,
                                address: stop?.subtitle,
                                editable: false,
                            }))}
                            originEditable={false}
                            originTitle={selectedSource?.title}
                            originAddress={selectedSource?.subtitle}
                            onEditPickupClick={undefined}
                            onEditDestinationClick={undefined}
                        />
                    </Animated.View>
                    <Button
                        testID="search_intercity_view_fares"
                        type="primary"
                        showLoader={true}
                        text={userLanguageStrings.ViewFares}
                        onPress={onViewFares}
                    />
                </Animated.View>
                {/* footer view */}
            </Animated.View>
        </Animated.View>
    );
};

type SelectorComponentProps = {
    pickupDate: Date;
    setPickupDate: (newDate: Date) => void;
    setReturnDate: (newDate: Date) => void;
    returnDate: Date;
    estimatedDuration: number;
    setEstimatedDuration: (newNumber: number) => void;
    currentDateType: 'pickup' | 'return' | null;
    setCurrentDateType: (newCurrentDateType: 'pickup' | 'return' | null) => void;
    isRoundTrip: boolean;
    setIsRoundTrip: (newBool: boolean) => void;
    handleDateChange: (date: Date) => void;
};

const SelectorComponent: React.FC<SelectorComponentProps> = ({
    pickupDate,
    setPickupDate,
    setReturnDate,
    returnDate,
    estimatedDuration,
    setEstimatedDuration,
    currentDateType,
    setCurrentDateType,
    isRoundTrip,
    setIsRoundTrip,
    handleDateChange,
}) => {
    const selectorPosition = useSharedValue(0);
    const selectedSource = useAppSelector(selectSearchedSource);
    const selectedStops = useAppSelector(selectSearchedStops);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const backgroundColor = useSharedValue(`bg-[${themeColors.Button_primary_default_fill_base}]`);
    const textColor = useSharedValue(`text-[${themeColors.Button_Primary_Default_Text_Base}]`);

    const [fetchTriggered, setFetchTriggered] = useState(false);
    const maxBufferDaysReturn = 2;
    const maxBufferDaysPickup = 5;
    const maxPickupDate = new Date(new Date().getTime() + maxBufferDaysPickup * 60 * 60 * 24 * 1000);
    const maxReturnDate = new Date(pickupDate.getTime() + maxBufferDaysReturn * 60 * 60 * 24 * 1000);
    const minPickupDate = new Date(new Date().getTime() + 30 * 60 * 1000);

    const mode: TravelMode_travelMode = 'CAR';
    const reqBody = {
        body: {
            calcPoints: true,
            mode,
            waypoints: [
                { lat: selectedSource?.lat ?? 0, lon: selectedSource?.lng ?? 0 },
                { lat: selectedStops[0]?.lat ?? 0, lon: selectedStops[0]?.lng ?? 0 },
            ],
            rideId: undefined,
        },
    };
    const [pickupRoutePost] = usePickupRoutePostMutation();
    useEffect(() => {
        if (!fetchTriggered) {
            const fetchData = async () => {
                try {
                    const payload = await pickupRoutePost(reqBody).unwrap();
                    const duration = payload.at(0)?.duration;
                    const durationInMillis = (duration ?? 0) * 1000;
                    setReturnDate(new Date(pickupDate.getTime() + (2 * durationInMillis + one_hour)));
                    setEstimatedDuration(durationInMillis);
                } catch (error) {
                    console.error('rejected', error);
                } finally {
                    setFetchTriggered(true);
                }
            };

            fetchData();
        }
    }, [fetchTriggered]);
    const handleSelector = async (type: string) => {
        if (type === 'oneWay') {
            selectorPosition.value = 0;
            backgroundColor.value = `bg-[${themeColors.Button_primary_default_fill_base}]`;
            textColor.value = `text-[${themeColors.Button_Primary_Default_Text_Base}]`;
            setIsRoundTrip(false);
            setReturnDate(new Date());
        } else {
            selectorPosition.value = 1;
            backgroundColor.value = 'bg-gray-100';
            textColor.value = 'text-gray-500';
            setIsRoundTrip(true);
            setPickupDate(new Date());
            setReturnDate(new Date(new Date().getTime() + (2 * estimatedDuration + one_hour)));
        }
    };
    const openDatePicker = (type: 'pickup' | 'return') => {
        setCurrentDateType(type);
        dateTimePickerBottomSheetModalRef?.current?.present();
    };

    const { dateTimePickerBottomSheetModalRef } = useRefsContext();

    const selectorStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: withTiming(selectorPosition.value * (SCREEN_WIDTH / 2 - 34)),
            },
        ],
    }));
    return (
        <View style={tailwind.style('w-full bg-white p-4 shadow-sm rounded-2xl')}>
            <View style={tailwind.style('relative flex-row items-center justify-between bg-gray-100 rounded-2xl')}>
                <Animated.View
                    style={[tailwind.style('absolute top-0 left-0 h-full w-1/2 rounded-full'), selectorStyle]}>
                    <View
                        style={tailwind.style(
                            `bg-[${themeColors.Button_primary_default_fill_base}] h-full rounded-full`,
                        )}></View>
                </Animated.View>
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="search_intercity_one_way"
                    onPress={() => handleSelector('oneWay')}
                    style={tailwind.style('flex-1 p-2')}>
                    <Typography
                        type={isRoundTrip ? 'subhead-800' : 'subhead-700'}
                        style={tailwind.style(
                            `text-center ${
                                !isRoundTrip
                                    ? `text-[${themeColors.Button_Primary_Default_Text_Base}]`
                                    : 'text-gray-600'
                            }`,
                        )}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.OneWay}
                    </Typography>
                </TouchableOpacity>

                <TouchableOpacity
                    accessibilityRole="button"
                    testID="search_intercity_round_trip"
                    onPress={() => handleSelector('roundTrip')}
                    style={tailwind.style('flex-1 p-2')}>
                    <Typography
                        type={isRoundTrip ? 'subhead-700' : 'subhead-800'}
                        style={tailwind.style(
                            `text-center ${
                                isRoundTrip ? `text-[${themeColors.Button_Primary_Default_Text_Base}]` : 'text-gray-700'
                            }`,
                        )}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.RoundTrip}
                    </Typography>
                </TouchableOpacity>
            </View>
            {!isRoundTrip ? (
                <Animated.View>
                    <Animated.View style={tailwind.style('mt-4')}>
                        <Typography
                            type="body-subtext"
                            style={tailwind.style(`text-black p-2`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.PickupDateAndTime}
                        </Typography>
                        <Animated.View>
                            <Button
                                testID="search_intercity_pickup_date_one_way"
                                type="secondary"
                                text={dayjs(pickupDate).format('DD MMM, hh:mm A')}
                                style={tailwind.style('flex-row')}
                                onPress={() => openDatePicker('pickup')}
                                suffix={
                                    <View style={tailwind.style('w-full flex-1 items-end')}>
                                        <Calendar height={20} width={20} />
                                    </View>
                                }
                            />
                        </Animated.View>
                        <Typography
                            type="body-7"
                            style={tailwind.style(`text-gray-500 mt-1 px-2`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.YouCanBookUptoFive}
                        </Typography>
                    </Animated.View>
                    {
                        <PopUpModal
                            sheetRef={dateTimePickerBottomSheetModalRef}
                            enableDynamicSizing={true}
                            onHardwareBackPress={undefined}
                            showBackdrop={undefined}
                            isScrollable={false}>
                            <DatePickerModal
                                dateTime={currentDateType === 'pickup' ? pickupDate : returnDate}
                                setDateTime={handleDateChange}
                                maxPossibleDate={maxPickupDate}
                                minPossibleDate={minPickupDate}
                                estimatedDuration={undefined}
                            />
                        </PopUpModal>
                    }
                </Animated.View>
            ) : (
                <Animated.View>
                    <Animated.View>
                        <Animated.View style={tailwind.style('mt-4')}>
                            <Typography
                                type="body-subtext"
                                style={tailwind.style(`text-black p-2`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.PickupDateAndTime}
                            </Typography>
                            <Animated.View>
                                <Button
                                    testID="search_intercity_pickup_date_round_trip"
                                    type="secondary"
                                    text={dayjs(pickupDate).format('DD MMM, hh:mm A')}
                                    style={tailwind.style('flex-row')}
                                    onPress={() => {
                                        openDatePicker('pickup');
                                    }}
                                    suffix={
                                        <View style={tailwind.style('w-full flex-1 items-end')}>
                                            <Calendar height={20} width={20} />
                                        </View>
                                    }
                                />
                            </Animated.View>
                            <Typography
                                type="body-7"
                                style={tailwind.style(`text-gray-500 mt-1 px-2`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.YouCanBookUptoFive}
                            </Typography>
                        </Animated.View>
                    </Animated.View>
                    <Animated.View>
                        <Animated.View style={tailwind.style('mt-4')}>
                            <Typography
                                type="body-subtext"
                                style={tailwind.style(`text-black p-2`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.DropBackIn} {selectedSource?.addressComponents?.city ?? 'source'}{' '}
                                at
                            </Typography>
                            <Animated.View>
                                <Button
                                    testID="search_intercity_return_date"
                                    type="secondary"
                                    text={dayjs(returnDate).format('DD MMM, hh:mm A')}
                                    style={tailwind.style('flex-row')}
                                    onPress={() => {
                                        openDatePicker('return');
                                    }}
                                    suffix={
                                        <View style={tailwind.style('w-full flex-1 items-end')}>
                                            <Calendar height={20} width={20} />
                                        </View>
                                    }
                                />
                            </Animated.View>
                            <Typography
                                type="body-7"
                                style={tailwind.style(`text-gray-500 mt-1 px-2`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.ReturnTripMustbeWithin}
                            </Typography>
                        </Animated.View>
                        {
                            <PopUpModal
                                sheetRef={dateTimePickerBottomSheetModalRef}
                                enableDynamicSizing={true}
                                onHardwareBackPress={undefined}
                                showBackdrop={undefined}
                                isScrollable={false}>
                                <DatePickerModal
                                    dateTime={currentDateType === 'pickup' ? pickupDate : returnDate}
                                    setDateTime={handleDateChange}
                                    maxPossibleDate={currentDateType === 'pickup' ? maxPickupDate : maxReturnDate}
                                    minPossibleDate={
                                        currentDateType === 'pickup'
                                            ? new Date(new Date().getTime() + 30 * 60 * 1000)
                                            : new Date(pickupDate.getTime() + 2 * estimatedDuration + one_hour)
                                    }
                                    estimatedDuration={undefined}
                                />
                            </PopUpModal>
                        }
                    </Animated.View>
                </Animated.View>
            )}
        </View>
    );
};

type DatePickerProps = {
    dateTime: Date;
    setDateTime: (newDate: Date) => void;
    maxPossibleDate: Date;
    minPossibleDate: Date;
    estimatedDuration: number | undefined;
};

const DatePickerModal: React.FC<DatePickerProps> = ({ dateTime, setDateTime, maxPossibleDate, minPossibleDate }) => {
    const { dateTimePickerBottomSheetModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [currSelectedDate, setCurrSelectedDate] = useState(dateTime);
    return (
        <Animated.View style={tailwind.style(`px-10 pb-[${bottom}]px`)}>
            <DatePicker
                date={currSelectedDate}
                onDateChange={date => {
                    setCurrSelectedDate(date);
                }}
                maximumDate={maxPossibleDate}
                minimumDate={minPossibleDate}
                theme="light"
            />
            <Button
                testID="search_intercity_date_picker_done"
                type="primary"
                text={userLanguageStrings.Done}
                onPress={() => {
                    setDateTime(currSelectedDate);
                    dateTimePickerBottomSheetModalRef?.current?.dismiss();
                }}
            />
        </Animated.View>
    );
};
/*
  logic ->
  1 . pickupDate can only be updated till 5 days from now
  2 . returnDate can only be updated till 2 days from currentPickupTime
  3 . minReturnDate = initialPickupDate + 2 * estimatedDuration + 1 hour
  4 . maxReturnDate = 2 days from currentPickupDate
  5 . minPickupDate = now + 30 mins
  6 . maxPickupDate = (now + 30 mins) + 5 days
*/
