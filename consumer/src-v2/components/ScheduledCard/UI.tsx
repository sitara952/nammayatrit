import React from 'react';
import { selectActiveBookingIds } from '@/typescript/state/client/user';

import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { selectAllBooking, selectBookingWithId, selectRideIdWithBookingId } from '@/typescript/state/client/booking';
import { getFormattedLocalDate, getTripCategory, isToday } from '../../utils/common';

import { useIsFocused, useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useBookingDetailsOnStatusChange from '@/typescript/hooks/useBookingDetailsOnStatusChange';
import { handleBookingNavigation } from '@/src-v2/utils/Booking';
import { selectToken } from '@/typescript/state/client/auth';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { capitalize, isNull } from 'lodash';
import ActivityCard from '@/typescript/screens/home/homeComponents/homeScreenActivities/ActivityCard';
import { StyleSheet, View } from 'react-native';
const RideScheduled = () => {
    const activeBookingIds = useAppSelector(selectActiveBookingIds);
    const userToken = useAppSelector(selectToken);

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const firstActiveBookingId = activeBookingIds.at(0) ?? null;
    const bookingDetails = useAppSelector(state => selectBookingWithId(state, firstActiveBookingId));
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, firstActiveBookingId));
    const dispatch = useAppDispatch();
    const isScreenFocused = useIsFocused();
    useBookingDetailsOnStatusChange(firstActiveBookingId, rideId, 5000, false, isScreenFocused);
    const onPress = (id: string) => {
        const booking = allBookingDetails.find(b => b.bookingDetails?.id === id);
        if (booking?.bookingDetails) {
            handleBookingNavigation(userToken, booking?.bookingDetails, navigation, dispatch);
        }
    };

    const allBookings = useAppSelector(selectAllBooking);
    const allBookingDetails = allBookings
        ? activeBookingIds.map(id => (allBookings[id] ? allBookings[id] : null)).filter(booking => !isNull(booking))
        : [];

    const scheduledRideList = allBookingDetails
        .filter(
            bd => bd.bookingDetails?.serviceTierName && bd.bookingDetails?.rideScheduledTime && bd.bookingDetails?.id,
        )
        .map(bd => {
            // the filter above is ensuing below things are not empty.
            const rideDetails = bd.bookingDetails?.rideList[0];
            const driverAssginedText =
                userLanguageStrings.DriverAssigned + (rideDetails?.driverName ? ' • ' + rideDetails?.driverName : '');
            const [date, time] = getFormattedLocalDate(bd.bookingDetails?.rideScheduledTime);
            const selectedValue = isToday(bd.bookingDetails?.rideScheduledTime) ? time : date;
            const tripCategoryWithTime = `${capitalize(getTripCategory(userLanguageStrings, bd?.bookingDetails))} ${
                userLanguageStrings.Ride
            } • ${selectedValue}`;
            const type =
                'Scheduled ' +
                (bd.bookingDetails?.tripCategory?.TAG ?? '') +
                '・' +
                (bd.bookingDetails?.serviceTierName ?? '');
            const destination = bd.bookedStops.findLast(last => last.address)?.address;
            return {
                id: bd.bookingDetails?.id || '',
                type: rideDetails ? driverAssginedText : type,
                image: bd.bookingDetails?.vehicleIconUrl || '',
                date: rideDetails ? tripCategoryWithTime : `${date} - ${time}`,
                destination,
            };
        });

    return activeBookingIds.length > 0 && bookingDetails?.bookingDetails?.tripCategory?.TAG != 'Delivery' ? (
        <View style={styles.container}>
            {scheduledRideList.map(ride => (
                <ActivityCard
                    key={ride.id}
                    title={ride.type}
                    subtitle={ride.date}
                    onPress={() => onPress(ride.id)}
                    testID={`schedule_ride_card_press_${ride.id}`}
                    activityStatus={undefined}
                />
            ))}
        </View>
    ) : null;
};

export default RideScheduled;

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 16,
    },
});
