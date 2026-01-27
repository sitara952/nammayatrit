import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { followers } from '@/readOnly/api/types/Followers.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { RideId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { SharedValue } from 'react-native-reanimated';
import { FollowRideOptions, FollowRideScreenAction, FollowRideSosOptions } from '../../Types';
import { Resolver } from '@/typescript/utils/common';

export type FollowRideDefaultScreenProps = {
    bookedSource: FormatedLocation | null;
    stops: FormatedLocation[];
    bookingDetails: bookingAPIEntity | null;
    rideId: RideId | null;
    rideDetails: rideAPIEntity | null;
    bookingId: BookingId;
    currentFollower: followers;
    bookedDestination: FormatedLocation | undefined;
    sheetAnimatedPosition: SharedValue<number>;
    followRideSosStatus: FollowRideSosOptions;
    followRideStatus: FollowRideOptions;
    rcsDispatch: Resolver<FollowRideScreenAction>;
};

export type FollowRideDefaultScreenUIProps = Omit<FollowRideDefaultScreenProps, 'chatCloseRef'> & {
    chatOnPress: () => void;
    followRideTitleText: string;
    messageCount: number;
};
