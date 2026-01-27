import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen';
import { followers } from '@/readOnly/api/types/Followers.gen';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen';
import { RideId } from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { Action, Resolver } from '@/typescript/utils/common';
import { FormatedLocation } from '@/typescript/utils/placeUtils';
import { SharedValue } from 'react-native-reanimated';

export enum FollowRideSosOptions {
    NOT_TRIGGERED,
    TRIGGERED,
    SAFE,
    HIDDEN,
}

type CompletedPayload = {
    originTitle: string;
    originAddress: string;
    destinationStops: { area: string; address: string }[];
};
export type FollowRideScreenAction =
    | Action<'BACK_BUTTON_CLICKED'>
    | Action<'NOT_FOUND'>
    | Action<'COMPLETED', CompletedPayload>
    | Action<'SET_FOLLOW_RIDE_STATUS', FollowRideOptions>
    | Action<'SET_FOLLOW_RIDE_SOS_STATUS', FollowRideSosOptions>
    | Action<'CHAT_ON_BACK'>;

export type FollowRideViewProps = {
    bookedSource: FormatedLocation | null;
    stops: FormatedLocation[];
    bookingDetails: bookingAPIEntity | null;
    rideId: RideId | null;
    rideDetails: rideAPIEntity | null;
    bookingId: BookingId;
    currentFollower: followers;
    bookedDestination: FormatedLocation | undefined;
    currentFollowerName: string;
    followRideSosStatus: FollowRideSosOptions;
    followRideStatus: FollowRideOptions;
    rcsDispatch: Resolver<FollowRideScreenAction>;
    sheetAnimatedPosition: SharedValue<number>;
};

export enum FollowRideOptions {
    NORMAL,
    CHAT,
    COMPLETED,
    NOT_FOUND,
    HIDDEN,
}
