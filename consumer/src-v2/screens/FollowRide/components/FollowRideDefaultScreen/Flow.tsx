import React, { useCallback, useMemo } from 'react';
import FollowRideDefaultScreenUI from './UI';
import { FollowRideDefaultScreenProps } from '@/src-v2/screens/FollowRide/components/FollowRideDefaultScreen/Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { FollowRideOptions } from '../../Types';

const FollowRideDefaultScreen: React.FC<FollowRideDefaultScreenProps> = ({
    bookedSource,
    stops,
    bookingDetails,
    rideId,
    rideDetails,
    bookingId,
    currentFollower,
    bookedDestination,
    sheetAnimatedPosition,
    followRideStatus,
    followRideSosStatus,
    rcsDispatch,
}) => {
    // Fixed message count for demo - in a real app, this would come from a message store/service
    const messageCount = 0;

    const chatOnPress = useCallback(() => {
        // Dispatch action to switch to chat screen
        rcsDispatch({ type: 'SET_FOLLOW_RIDE_STATUS', payload: FollowRideOptions.CHAT });
    }, []);

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const followRideTitleText = useMemo(() => {
        if (rideDetails?.status === 'NEW') {
            return `${currentFollower.name ?? ''} ${userLanguageStrings.IsWaitingForPickup}`;
        }
        if (rideDetails?.status === 'INPROGRESS') {
            return `${userLanguageStrings.Following} ${currentFollower.name ?? ''} ${
                userLanguageStrings.ToTheirDestination
            }`;
        }
        return userLanguageStrings.Following;
    }, [rideDetails?.status, currentFollower.name, userLanguageStrings]);

    return (
        <FollowRideDefaultScreenUI
            followRideSosStatus={followRideSosStatus}
            followRideStatus={followRideStatus}
            rcsDispatch={rcsDispatch}
            bookedSource={bookedSource}
            bookedDestination={bookedDestination}
            stops={stops}
            rideId={rideId}
            bookingDetails={bookingDetails}
            bookingId={bookingId}
            currentFollower={currentFollower}
            rideDetails={rideDetails}
            sheetAnimatedPosition={sheetAnimatedPosition}
            chatOnPress={chatOnPress}
            followRideTitleText={followRideTitleText}
            messageCount={messageCount}
        />
    );
};

export default React.memo(FollowRideDefaultScreen);
