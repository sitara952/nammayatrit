import React from 'react';
import { useAppDispatch, useAppSelector } from '../../../src/typescript/state/hooks';
import { useRefsContext } from '../../../src/typescript/context/RefsContext';
import { selectAllBooking } from '../../../src/typescript/state/client/booking';
import { selectActiveBookingIds } from '../../../src/typescript/state/client/user';
import { getFormattedLocalDate, getTripCategory } from '../../utils/common';
import { createDispatcher, Resolver } from '../../../src/typescript/utils/common';
import RideScheduledBottomSheetUI from './UI';
import { ScheduledRideComponentAction, ScheduledRideProps } from './types';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { capitalize, isNull } from 'lodash';
import { handleBookingNavigation } from '@/src-v2/utils/Booking';
import { selectToken } from '@/typescript/state/client/auth';
import { useConfigContext } from '@/typescript/context/ConfigContext';

function RideScheduledBottomSheet(): React.JSX.Element {
    const { scheduledCardModalRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const activeBookingIds = useAppSelector(selectActiveBookingIds);
    const allBookings = useAppSelector(selectAllBooking);
    const userToken = useAppSelector(selectToken);
    const bookingDetails = allBookings
        ? activeBookingIds.map(id => (allBookings[id] ? allBookings[id] : null)).filter(booking => !isNull(booking))
        : [];
    const dispatch = useAppDispatch();

    const scheduledRideList = bookingDetails
        .filter(
            bd => bd.bookingDetails?.serviceTierName && bd.bookingDetails?.rideScheduledTime && bd.bookingDetails?.id,
        )
        .map(bd => {
            // the filter above is ensuing below things are not empty.
            const rideDetails = bd.bookingDetails?.rideList[0];
            const driverAssginedText =
                userLanguageStrings.DriverAssigned + (rideDetails?.driverName ? ' • ' + rideDetails?.driverName : '');
            const [date, time] = getFormattedLocalDate(bd.bookingDetails?.rideScheduledTime);
            const tripCategoryWithTime = `${capitalize(getTripCategory(userLanguageStrings, bd?.bookingDetails))} ${
                userLanguageStrings.Ride
            } • ${time}`;
            const type =
                (bd.bookingDetails?.tripCategory?.TAG ?? '') + ' ' + (bd.bookingDetails?.serviceTierName ?? '');
            const destination = bd.bookedStops.findLast(last => last.address)?.address;
            return {
                id: bd.bookingDetails?.id || '',
                type: rideDetails ? driverAssginedText : type,
                image: bd.bookingDetails?.vehicleIconUrl || '',
                date: rideDetails ? tripCategoryWithTime : `${date} - ${time}`,
                destination,
            };
        });

    const resolver: Resolver<ScheduledRideComponentAction> = async action => {
        switch (action.type) {
            case 'CLOSE':
                scheduledCardModalRef?.current?.close();
                break;
            case 'CLICKED': {
                const booking = bookingDetails.find(b => b.bookingDetails?.id === action.payload?.id);
                if (booking?.bookingDetails) {
                    handleBookingNavigation(userToken, booking?.bookingDetails, navigation, dispatch);
                }
                scheduledCardModalRef?.current?.close();
                break;
            }
        }
    };

    const schRideDispatch = createDispatcher(resolver);

    const schRideState: ScheduledRideProps = {
        scheduledRideList,
        schRideDispatch,
    };

    return <RideScheduledBottomSheetUI {...schRideState} />;
}

export default RideScheduledBottomSheet;
