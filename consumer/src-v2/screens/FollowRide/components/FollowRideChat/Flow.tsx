import React from 'react';
import FollowRideChatUI from './UI';
import { FollowRideChatProps } from './Types';

const FollowRideChat: React.FC<FollowRideChatProps> = ({
    rideId,
    bookingId,
    currentFollowerName,
    sheetAnimatedPosition,
    rcsDispatch,
}) => {
    return (
        <FollowRideChatUI
            rideId={rideId}
            bookingId={bookingId}
            currentFollowerName={currentFollowerName}
            sheetAnimatedPosition={sheetAnimatedPosition}
            rcsDispatch={rcsDispatch}
        />
    );
};

export default FollowRideChat;
