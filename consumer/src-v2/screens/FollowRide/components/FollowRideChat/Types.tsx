import { RideId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { SharedValue } from 'react-native-reanimated';
import { FollowRideScreenAction } from '../../Types';
import { Resolver } from '@/typescript/utils/common';

export type FollowRideChatProps = {
    rideId: RideId | null;
    bookingId: BookingId | null;
    currentFollowerName: string;
    sheetAnimatedPosition: SharedValue<number>;
    rcsDispatch: Resolver<FollowRideScreenAction>;
};
