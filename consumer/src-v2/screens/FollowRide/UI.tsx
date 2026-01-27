import Button from '@/src-v2/primitives/Button';
import token from '@/typescript/designSystem/tokens';
import Animated, { SlideInUp, SlideOutUp } from 'react-native-reanimated';
import { FollowRideOptions, FollowRideSosOptions, FollowRideViewProps } from './Types';
import React from 'react';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { SafetyToolsModal } from '@/typescript/designSystem/components/SafetyToolsModal';
import CloseIcon from '@/typescript/components/svg/CloseIcon';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import FollowRideDefaultScreen from './components/FollowRideDefaultScreen/Flow';
import FollowRideChat from './components/FollowRideChat/Flow';
import { FloatingRideStatus } from '@/typescript/components/FloatingRideStatus';

const FollowRideView: React.FC<FollowRideViewProps> = ({
    bookedSource,
    stops,
    bookingDetails,
    rideId,
    rideDetails,
    bookingId,
    currentFollower,
    currentFollowerName,
    bookedDestination,
    followRideSosStatus,
    followRideStatus,
    rcsDispatch,
    sheetAnimatedPosition,
}) => {
    const { top } = useSafeAreaInsets();

    return (
        <HardwareBackpressHandler
            onHardwareBackPress={
                followRideStatus === FollowRideOptions.CHAT
                    ? () => rcsDispatch({ type: 'CHAT_ON_BACK', payload: undefined })
                    : undefined
            }>
            <>
                {(followRideStatus === FollowRideOptions.NORMAL ||
                    followRideSosStatus === FollowRideSosOptions.TRIGGERED) && (
                    <Animated.View
                        entering={SlideInUp.duration(400)}
                        exiting={SlideOutUp.duration(400)}
                        style={{ position: 'absolute', top: top + 5, left: 16 }}>
                        <Button
                            testID="FollowRideGoBackbtn"
                            accessibilityLabel={'Go Back'}
                            accessibilityRole="imagebutton"
                            size="md"
                            type="secondary"
                            prefix={<CloseIcon color={token?.text['text-base']} height={16} width={25} />}
                            onPress={() => {
                                rcsDispatch({ type: 'BACK_BUTTON_CLICKED', payload: undefined });
                            }}
                        />
                    </Animated.View>
                )}
                <FloatingRideStatus
                    sheetAnimatedPosition={sheetAnimatedPosition}
                    status={'DriverArrived'}
                    bookingId={bookingId}
                    verticalPosition={100}
                />

                {followRideSosStatus === FollowRideSosOptions.TRIGGERED ? (
                    <SafetyToolsModal
                        currentFollower={currentFollower}
                        followRideSosStatus={followRideSosStatus}
                        followRideStatus={followRideStatus}
                        rcsDispatch={rcsDispatch}
                        sheetAnimatedPosition={sheetAnimatedPosition}
                        bookingId={bookingId}
                    />
                ) : (
                    <>
                        {followRideStatus === FollowRideOptions.NORMAL && (
                            <FollowRideDefaultScreen
                                bookedSource={bookedSource}
                                bookedDestination={bookedDestination}
                                stops={stops}
                                rideId={rideId}
                                bookingDetails={bookingDetails}
                                bookingId={bookingId}
                                currentFollower={currentFollower}
                                rideDetails={rideDetails}
                                followRideSosStatus={followRideSosStatus}
                                followRideStatus={followRideStatus}
                                rcsDispatch={rcsDispatch}
                                sheetAnimatedPosition={sheetAnimatedPosition}
                            />
                        )}

                        {followRideStatus === FollowRideOptions.CHAT && (
                            <>
                                <FollowRideChat
                                    rideId={rideId}
                                    bookingId={bookingId}
                                    currentFollowerName={currentFollowerName}
                                    sheetAnimatedPosition={sheetAnimatedPosition}
                                    rcsDispatch={rcsDispatch}
                                />
                            </>
                        )}
                    </>
                )}
            </>
        </HardwareBackpressHandler>
    );
};

export default React.memo(FollowRideView);
