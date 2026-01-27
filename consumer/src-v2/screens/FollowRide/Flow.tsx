import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FollowRideOptions, FollowRideScreenAction, FollowRideSosOptions, FollowRideViewProps } from './Types';
import { followers } from '@/readOnly/api/types/Followers.gen.tsx';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { createBookingId, selectBookingId, selectFollowers, selectUserId } from '@/typescript/state/client/user';
import {
    selectBookedSourceWithId,
    selectBookedStopsWithId,
    selectBookingDetailsWithId,
    selectRideIdWithBookingId,
} from '@/typescript/state/client/booking';
import { selectRideDetailsWithId, setCurrentChatSessionId } from '@/typescript/state/client/ride';
import Animated, { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';
import { MapContext } from '@/typescript/Maps/MapContext';
import useBookingDetailsOnStatusChange from '@/typescript/hooks/useBookingDetailsOnStatusChange';
import { getChannelId } from '@/typescript/screens/chat/utils';
import { addSession } from '@/typescript/state/client/chat';
import { chatHelpers } from '@/typescript/screens/chat/Hooks';
import { useFollowRideMutation } from '@/typescript/state/server/followRide';
import { useRideTracking } from '@/typescript/hooks/useRideTracking';
import FollowRideView from './UI';
import { initialFollowRideChatSession } from './components/Suggestion';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { logger } from '@/src-v2/systems/logger';
import { logEvent, EventName } from '@/typescript/utils/logger';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { CardRideDetails } from '@/typescript/designSystem/components/CardRideDetails';
import NotFound from '@/typescript/components/svg/NotFound';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import colors from '@/typescript/designSystem/colorPalette';
import { Keyboard, StyleSheet } from 'react-native';
import { BottomSheetStage, setBottomSheetStage } from '@/typescript/state/client/session';

type FollowRideProps = {
    currentFollower: followers;
    shouldOpenChat: boolean;
};
export const FollowRideScreen: React.FC<FollowRideProps> = React.memo(
    ({ currentFollower, shouldOpenChat }: FollowRideProps) => {
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const themeColors = configManager.get('themeColors');

        const followers = useAppSelector(selectFollowers);
        const sheetAnimatedPosition = useSharedValue(0);
        const bookingId = createBookingId(currentFollower.bookingId);
        const dispatch = useAppDispatch();
        const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
        const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));
        const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
        const personId = useAppSelector(selectUserId);
        const bookedSource = useAppSelector(state => selectBookedSourceWithId(state, bookingId));
        const stops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
        const currentBookingId = useAppSelector(selectBookingId);

        const bookedDestination = stops[stops.length - 1];
        const { mapRef } = useContext(MapContext);
        useEffect(() => {
            mapRef.current?.setCurrentLocationMarkerVisibility(false);
            return () => mapRef.current?.setCurrentLocationMarkerVisibility(true);
        }, []);
        const { bottomSheetTopBannerRef } = useRefsContext();
        const currentFollowerName = (currentFollower.name !== '' ? currentFollower.name : undefined) ?? 'Anonymous';
        const isScreenFocused = useIsFocused();
        useBookingDetailsOnStatusChange(bookingId, rideId, 5000, false, isScreenFocused);
        const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

        useEffect(() => {
            if (rideDetails && bookingDetails?.rideList.at(0)) {
                const createChatSession = async (item: followers) => {
                    const initialSession = {
                        ...initialFollowRideChatSession(true),
                        currentUser: personId || 'FollowRideUser',
                        channelId: getChannelId(item.priority, rideId, personId),
                    };
                    dispatch(
                        addSession({
                            id: item.bookingId + '$' + item?.personId,
                            payload: initialSession,
                        }),
                    );
                    dispatch(
                        setCurrentChatSessionId({
                            id: rideId,
                            payload: item.bookingId + '$' + item?.personId,
                        }),
                    );
                    chatHelpers(
                        [
                            {
                                channelId: initialSession.channelId,
                                sessionId: item.bookingId + '$' + item?.personId,
                                currentUser: initialSession.currentUser,
                            },
                        ],
                        dispatch,
                    );
                };
                if (currentFollower.priority !== -1) {
                    createChatSession(currentFollower);
                }
                followers.forEach(item => {
                    if (item.personId && item.personId !== '') {
                        createChatSession(item);
                    }
                });
            }
        }, [rideDetails, bookingDetails, followers]);

        const goToOnRide = useCallback(() => {
            navigation.reset({
                index: 0,
                routes: [
                    {
                        name: 'mainTabNavigation',
                        params: {
                            targetTab: 'LiveTab',
                            homeTabProps: undefined,
                            liveTabProps: {
                                bookingId: currentBookingId,
                                multimodalProps: undefined,
                                initialRouteName: 'taxiRideTracking',
                            },
                            profileTabProps: undefined,
                        },
                    },
                ],
            });
        }, [currentBookingId]);

        const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

        const [followRide] = useFollowRideMutation();

        const [followRideSosStatus, setFollowRideSosStatus] = useState(FollowRideSosOptions.NOT_TRIGGERED);
        const [followRideStatus, setFollowRideStatus] = useState(
            shouldOpenChat ? FollowRideOptions.CHAT : FollowRideOptions.NORMAL,
        );

        const resolver: Resolver<FollowRideScreenAction> = useCallback(
            async action => {
                switch (action.type) {
                    case 'NOT_FOUND':
                        followRide({});
                        navigation.navigate('EndInfoScreen', {
                            bgcolor: undefined,
                            showMainText: true,
                            mainTextColor: 'white',
                            mainText: userLanguageStrings.RideNotFound,
                            showButton: true,
                            logo: <NotFound />,
                            logoCenter: 40,
                            goTo: undefined,
                            showGoBack: false,
                            children: (
                                <Typography
                                    type="callout"
                                    style={style.notFound}
                                    numberOfLines={undefined}
                                    isAnimate={false}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Somethingwentwrong}
                                </Typography>
                            ),
                        });
                        break;

                    case 'COMPLETED': {
                        if (!action.payload) return;

                        const { originTitle, originAddress, destinationStops } = action.payload;
                        const showDetail = originTitle && originAddress && destinationStops.length > 0;
                        followRide({});
                        navigation.navigate('EndInfoScreen', {
                            bgcolor: `${colors.primitive.yellow[1]}`,
                            showMainText: true,
                            mainTextColor: 'black',
                            mainText: userLanguageStrings.Hascompletedtheirridesafely(currentFollowerName),
                            showButton: true,
                            logoCenter: 40,
                            logo: (
                                <LottieWithFallback
                                    resizeMode="cover"
                                    renderMode="AUTOMATIC"
                                    autoPlay={true}
                                    style={{ width: 200, height: 200 }}
                                    loop={false}
                                    duration={5000}
                                    source={require('@/typescript/assets/ny-service/success_lottie_v2.lottie')}
                                    fallback={undefined}
                                />
                            ),
                            goTo: currentBookingId ? goToOnRide : undefined,
                            showGoBack: currentBookingId ? true : false,
                            children: showDetail ? (
                                <Animated.View style={{ width: '100%' }}>
                                    <CardRideDetails
                                        userLanguageStrings={userLanguageStrings}
                                        showFareDetails={false}
                                        stops={destinationStops
                                            .filter(stop => stop !== null && stop !== undefined)
                                            .map(stop => ({
                                                area: stop.area,
                                                address: stop.address,
                                                editable: false,
                                            }))}
                                        originEditable={false}
                                        originTitle={originTitle}
                                        originAddress={originAddress}
                                        isRideConfirmed={true}
                                        fare={''}
                                        wrapperStyles={{
                                            backgroundColor: themeColors.Fill_neutralUltraLow,
                                        }}
                                        footerContent={null}
                                        serviceTierName={undefined}
                                        estimatedFareBreakup={undefined}
                                        onEditPickupClick={undefined}
                                        onEditDestinationClick={undefined}
                                        onRateCardPress={undefined}
                                        hideAccessibility={undefined}
                                        setHideAccessibility={undefined}
                                        isRoundTrip={false}
                                        isIntercityOrRentals={false}
                                        isRideWaitingScreen={false}
                                    />
                                </Animated.View>
                            ) : null,
                        });
                        break;
                    }

                    case 'BACK_BUTTON_CLICKED':
                        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'followRide_backBtn' }));
                        navigation.goBack();
                        break;

                    case 'SET_FOLLOW_RIDE_STATUS':
                        if (action.payload !== undefined) {
                            setFollowRideStatus(action.payload);
                        }
                        break;

                    case 'SET_FOLLOW_RIDE_SOS_STATUS':
                        if (action.payload !== undefined) {
                            setFollowRideSosStatus(action.payload);
                        }
                        break;

                    case 'CHAT_ON_BACK':
                        if (bookingDetails?.sosStatus === 'Pending') {
                            Keyboard.dismiss();
                            rcsDispatch({
                                type: 'SET_FOLLOW_RIDE_SOS_STATUS',
                                payload: FollowRideSosOptions.TRIGGERED,
                            });
                            rcsDispatch({ type: 'SET_FOLLOW_RIDE_STATUS', payload: FollowRideOptions.HIDDEN });
                        } else {
                            Keyboard.dismiss();
                            rcsDispatch({ type: 'SET_FOLLOW_RIDE_STATUS', payload: FollowRideOptions.NORMAL });
                        }
                        break;

                    default:
                        throw new Error(`Unhandled action type: ${action}`);
                }
            },
            [bookingDetails?.sosStatus],
        );

        const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

        useEffect(() => {
            if (followRideSosStatus === FollowRideSosOptions.SAFE) {
                timeoutIdRef.current = setTimeout(() => {
                    setFollowRideSosStatus(FollowRideSosOptions.NOT_TRIGGERED);
                }, 60000);
            } else if (followRideSosStatus === FollowRideSosOptions.TRIGGERED) {
                if (timeoutIdRef.current) {
                    clearTimeout(timeoutIdRef.current);
                    timeoutIdRef.current = null;
                }
            }
        }, [followRideSosStatus]);

        // useEffect(() => {
        //     if (bookingDetails?.status !== 'COMPLETED') {
        //         const hasCurrentFollower = followers.some(
        //             follower => follower.bookingId === currentFollower?.bookingId,
        //         );
        //         if (!hasCurrentFollower) {
        //             rcsDispatch({ type: 'NOT_FOUND', payload: undefined });
        //         }
        //     }
        // }, [followers]);

        useEffect(() => {
            if (!bookingId || bookingDetails?.status === 'REALLOCATED' || bookingDetails?.status === 'CANCELLED') {
                rcsDispatch({ type: 'NOT_FOUND', payload: undefined });
            } else if (bookingDetails?.status === 'COMPLETED') {
                rcsDispatch({
                    type: 'COMPLETED',
                    payload: {
                        originTitle: bookedSource?.area ?? 'Undefined',
                        originAddress: bookedSource?.address ?? 'Undefined',
                        destinationStops: stops,
                    },
                });
            } else if (bookingDetails?.sosStatus === 'Pending') {
                bottomSheetTopBannerRef.current = true;
                setFollowRideSosStatus(FollowRideSosOptions.TRIGGERED);
            } else if (
                followRideSosStatus === FollowRideSosOptions.TRIGGERED &&
                bookingDetails?.sosStatus === 'Resolved'
            ) {
                setFollowRideSosStatus(FollowRideSosOptions.SAFE);
                setFollowRideStatus(FollowRideOptions.NORMAL);
            }
        }, [bookingDetails?.sosStatus, bookingDetails?.status, bookedSource, stops]);

        const buttonPosition = useSharedValue(0);

        useAnimatedReaction(
            () => sheetAnimatedPosition.value,
            currentPosition => {
                buttonPosition.value = currentPosition - 50;
            },
        );
        useEffect(() => {
            logger.logDebug(`[FollowRide] Following Ride: ${currentFollower.bookingId}`, 'FollowRide');
            logEvent(EventName.NY_USER_FOLLOWING_RIDE, {
                BookingId: currentFollower.bookingId,
                FollowerId: personId,
            });
        }, [currentFollower.bookingId]);

        useRideTracking({
            source: bookedSource,
            destination: bookedDestination,
            stops,
            bookingId: bookingId,
            rideId: rideId,
            animatedPosition: sheetAnimatedPosition,
            showEditIcon: undefined,
            onDestClick: undefined,
            showChatBar: false,
            isScreenFocused,
            isAutoRecenterEnabled: true,
        });

        const followRideViewState: FollowRideViewProps = {
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
        };

        return <FollowRideView {...followRideViewState} />;
    },
);

const style = StyleSheet.create({
    notFound: { fontSize: 16, textAlign: 'center', color: 'white' },
});
