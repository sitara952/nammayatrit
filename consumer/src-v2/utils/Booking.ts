import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen.tsx';
import { calculateTimeDifference } from '@/screens/ongoingRideFlow/components/RideStatusPill.bs';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { getOtpCode } from '@/typescript/state/client/booking';
import { BottomSheetStage, setBottomSheetStage } from '@/typescript/state/client/session';
import { createBookingId, setBookingId } from '@/typescript/state/client/user';
import { setLookingForDriversDataInBooking } from '@/typescript/state/sharedReducer';
import { AppDispatch } from '@/typescript/state/store';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { isNull } from 'lodash';

export const isUpcomingBooking = (booking: bookingAPIEntity, timeInMinutes: number) => {
    const rideStartsIn =
        booking.isScheduled && booking.rideScheduledTime ? -1 * calculateTimeDifference(booking.rideScheduledTime) : 0;
    const showingRideTrackingScreenByDefaultConfig = timeInMinutes * 60;
    return rideStartsIn > showingRideTrackingScreenByDefaultConfig;
};

export const handleBookingNavigation = (
    userToken: string | null,
    booking: bookingAPIEntity,
    navigation: NativeStackNavigationProp<MainNavigationParamList>,
    dispatch: AppDispatch,
) => {
    const bookingId = createBookingId(booking.id);
    const isDriverAssignedOrOtp = booking.rideList?.length > 0 || !isNull(getOtpCode(booking.bookingDetails));
    const isUpcoming = isUpcomingBooking(booking, isDriverAssignedOrOtp ? 30 : 2);
    if (isUpcoming) {
        navigation.navigate(
            'ServicesTab',
            {
                screen: 'extendedBookingNavigator',
                params: {
                    screen: 'scheduleRideSummary',
                    params: {
                        bookingId: booking?.id,
                        fareBreakups: undefined, // to be fixed from backend
                    },
                },
            },
            { pop: true },
        );
    } else {
        dispatch(setBookingId({ id: userToken, payload: bookingId ?? null }));
        if (isDriverAssignedOrOtp) {
            switch (booking.bookingDetails.TAG) {
                case 'DELIVERY':
                    navigation.popTo('deliveryScreen');
                    break;
                default:
                    navigation.navigate('LiveTab', {
                        screen: 'taxiRideTracking',
                        params: {
                            bookingId: bookingId,
                            multimodalProps: undefined,
                        },
                    });
                    break;
            }
        } else {
            if (booking.bookingDetails.TAG === 'DELIVERY' || booking.bookingDetails.TAG === 'AMBULANCE') {
                navigation.popTo('continueBooking');
            } else {
                setLookingForDriversDataInBooking(booking, dispatch);
                dispatch(setBottomSheetStage({ stage: BottomSheetStage.LookingForRides, src: 'booking_hndlBkngNav' }));
                navigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
            }
        }
    }
};

export const formatPhone = (phone: string | undefined) => {
    if (!phone) return '';
    // Don't add leading '0' if phone already starts with '0' and is less than 5 digits
    if (phone[0] === '1' && phone.length < 5) {
        return phone;
    }
    // Otherwise follow the original logic
    return phone[0] === '0' ? phone : `0${phone}`;
};
