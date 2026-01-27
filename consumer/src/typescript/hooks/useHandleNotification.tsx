import { useContext, useEffect } from 'react';
import { NotificationContext } from '../../typescript/context/NotificationContext.tsx';
import { strings } from 'config-types';
import { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';
import { setCurrentEmergencyContact, setToastProps } from '../state/client/session';
import { ThemeTokens } from 'config-types';
import { gotoLookingForRides } from '../state/sharedReducer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { checkNotifications, requestNotifications } from 'react-native-permissions';
import { Platform } from 'react-native';
import { getMessaging, getInitialNotification, onNotificationOpenedApp } from '@react-native-firebase/messaging';
import type { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { logger } from '@/src-v2/systems/logger';
import { RootState } from '../state/store.ts';
import { useFollowRideMutation } from '../state/server/followRide.ts';
import { followers } from '@/readOnly/api/types/Followers.gen.tsx';
import { selectEmergencyContacts, setCurrentFollower, setReferralAmountToCollect } from '../state/client/user.ts';
import { selectToken } from '../state/client/auth.ts';
import { personDefaultEmergencyNumberAPIEntity } from '@/readOnly/api/types/PersonDefaultEmergencyNumberAPIEntity.gen.tsx';
import { useLazyGetProfileQuery } from '../state/server/userApi.ts';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';

export const handleReallocation = (
    dispatch: ThunkDispatch<RootState, unknown, UnknownAction>,
    userLanguageStrings: strings,
    themeColors: ThemeTokens,
    cancelledByUser: boolean = false,
) => {
    if (!cancelledByUser) {
        dispatch(
            setToastProps({
                message: userLanguageStrings.YourdriverhascancelledPleasewaitwhilewerellocateanotherdriverforyou,
                backgroundColor: `${themeColors.Fill_negativeHigh}`,
                autoDismissAfter: 2100,
                visible: true,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                logo: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                margin: undefined,
                customToast: undefined,
            }),
        );
    }
    gotoLookingForRides(dispatch);
};

export const useHandleNotifications = () => {
    const [notificationData, _setNotificationData] = useContext(NotificationContext);
    const userToken = useAppSelector(selectToken);
    const emergencyContacts = useAppSelector(selectEmergencyContacts);
    const [followRideCall] = useFollowRideMutation();
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const [getProfileTrigger] = useLazyGetProfileQuery();

    useEffect(() => {
        if (Platform.OS === 'android') {
            checkNotifications().then(({ status }) => {
                if (status !== 'granted' && status !== 'blocked') {
                    requestNotifications(['alert', 'sound']);
                }
            });
        }
    }, []);

    const navigateToFollowRide = async (personId: string | undefined, shouldOpenChat: boolean) => {
        await followRideCall({})
            .then(follwersData => {
                const followersList: followers[] = follwersData.data ?? [];
                const follower = personId
                    ? followersList.find((v: followers) => v.personId === personId)
                    : followersList.length === 1
                      ? followersList[0]
                      : undefined;

                if (follower?.bookingId) {
                    dispatch(setCurrentFollower({ id: userToken, payload: follower }));
                    setTimeout(
                        () =>
                            navigation.navigate('followRide', {
                                defaultFollower: follower,
                                shouldOpenChat: shouldOpenChat,
                            }),
                        300,
                    );
                }
            })
            .catch(error => console.error('Notification followRideCall error:', error));
    };

    const handleNotificationTap = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        if (remoteMessage.data === undefined) {
            console.error('remoteMessage.data is undefined');
            return;
        }
        const entityData = remoteMessage.data['entity_data'];
        if (typeof entityData !== 'string') {
            console.error('entity_data is not a string');
            return;
        }
        const parsedData = safeJsonParse<{ source: string | undefined; personId: string | undefined }>(
            entityData,
            { source: undefined, personId: undefined },
            'notificationEntityData',
        );

        if (!parsedData || typeof parsedData !== 'object') {
            console.error('Failed to parse notification entity data');
            return;
        }

        switch (parsedData.source) {
            case 'USER': {
                if (parsedData.personId) {
                    navigateToFollowRide(parsedData.personId, true);
                }
                break;
            }
            case 'TRUSTED_CONTACT': {
                if (parsedData.personId) {
                    const maybeEmergencyContact = emergencyContacts.filter(
                        (v: personDefaultEmergencyNumberAPIEntity) =>
                            v.contactPersonId && v.contactPersonId === parsedData.personId,
                    )[0];
                    dispatch(setCurrentEmergencyContact(maybeEmergencyContact));
                }
                break;
            }
            default: {
                const notificationType = remoteMessage.data['notification_type'];
                if (notificationType === 'SHARE_RIDE') {
                    await navigateToFollowRide(undefined, false);
                }
                break;
            }
        }
    };

    useEffect(() => {
        // Check if the app was opened by tapping a notification
        const messagingInstance = getMessaging();
        getInitialNotification(messagingInstance)
            .then(remoteMessage => {
                if (remoteMessage?.data) {
                    handleNotificationTap(remoteMessage);
                } else {
                    console.info('No initial notification received', remoteMessage);
                }
            })
            .catch(error => console.error('getInitialNotification error:', error));

        // Listen for notification taps while the app is in the background or foreground
        const unsubscribe = onNotificationOpenedApp(messagingInstance, async remoteMessage => {
            if (remoteMessage?.data) {
                handleNotificationTap(remoteMessage);
            } else {
                console.info('Notification tapped but data is undefined');
            }
        });

        return unsubscribe;
    }, []);

    // NOTE: The logEvent function is commented out because it does not trigger when the device is locked or if the app is in background.
    // This might be needed later

    useEffect(() => {
        switch (notificationData.notification_type) {
            case 'TRIP_STARTED':
                // logEvent('ny_user_ride_started');
                try {
                    const entityData = safeJsonParse<{ tripCategory: string | undefined }>(
                        notificationData.entity_data,
                        { tripCategory: undefined },
                        'notificationTripCategory',
                    );
                    if (entityData && entityData.tripCategory === 'Delivery') {
                        navigation.popTo('continueBooking');
                    }
                } catch {
                    console.error('failed to parse or check trip category from tripAssigned FCM');
                    logger.logErrorWithPayload(
                        'failed to parse or check trip category from tripAssigned FCM',
                        'notification',
                        { notificationData: JSON.stringify(notificationData) },
                    );
                }
                break;
            // case 'TRIP_FINISHED':
            //     logEvent('ny_rider_ride_completed');
            //     break;
            // case 'DRIVER_ASSIGNMENT':
            //     logEvent('ny_fs_driver_assignment');
            //     break;
            case 'PAYOUT_REWARD': {
                const callProfileApi = async () => {
                    await getProfileTrigger()
                        .unwrap()
                        .then(profileRes => {
                            const amountToCollect =
                                (profileRes?.referralEarnings ?? 0) +
                                (profileRes?.referredByEarnings ?? 0) -
                                (profileRes?.referralAmountPaid ?? 0);
                            dispatch(setReferralAmountToCollect({ id: userToken, payload: amountToCollect }));
                        });
                };
                callProfileApi();
                break;
            }
            // Need to get personId in remoteMessage from backend
            // case 'FOLLOW_RIDE': {
            //     navigateToFollowRide(parsedData.personId, false);
            //     break;
            // }
            default:
                break;
        }
    }, [notificationData?.notification_type, notificationData?.entity_data]);
};
