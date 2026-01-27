import { useConfigContext } from '@/typescript/context/ConfigContext';
import {
    selectFeatureFlags,
    selectFindAnotherDriver,
    selectRideChecksType,
    setLiveSharingEmergencyContacts,
    selectLiveSharingEmergencyContacts,
    selectLastKnownLocation,
    selectCurrentLocation,
} from '@/typescript/state/client/session';
import React, { useEffect, useState, useMemo, useCallback, useRef, useContext } from 'react';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import {
    BookingId,
    createBookingId,
    removeActiveBookingId,
    selectActiveRideSearchId,
    selectEmergencyContacts,
    setBookingId,
    setSearchId,
} from '@/typescript/state/client/user.ts';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { handleReallocation } from '@/typescript/hooks/useHandleNotification.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Danger from '@/typescript/components/svg/Danger.tsx';
import { isEqual } from 'lodash';
import useBookingDetailsOnStatusChange from '@/typescript/hooks/useBookingDetailsOnStatusChange.ts';
import {
    createRideId,
    RideChecks,
    selectBookedSourceWithId,
    selectBookedStopsWithId,
    selectBookingDetailsWithId,
    selectOtpCodeWithBookingId,
    selectRideChecksWithBookingId,
    selectRideIdWithBookingId,
    setRideChecks,
} from '@/typescript/state/client/booking.ts';
import {
    selectEditLocationAttempts,
    selectEditPickupAttempts,
    selectRideDetailsWithId,
    selectStopInfoWithId,
} from '@/typescript/state/client/ride.ts';
import { resetIds, setLookingForDriversDataInBooking } from '@/typescript/state/sharedReducer.ts';
import {
    BottomSheetStage,
    clearSession,
    setBottomSheetStage,
    setRideCheckType,
    setToastProps,
} from '@/typescript/state/client/session.ts';

import { RideChecksType } from '@/typescript/screens/SafetyModal.tsx';
import { selectToken } from '@/typescript/state/client/auth.ts';
import { MMKVKey, getBoolItem, getStringItem, setStringItem } from '@/typescript/utils/MMKV.ts';
import { RideConfirmedFragmentProps, RideConfirmedScreenAction } from './Types.tsx';
import { createAction, createDispatcher, firstRideCompletedEvent, Resolver } from '@/typescript/utils/common.ts';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen.tsx';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen.tsx';
import { logEvent, EventName } from '@/typescript/utils/logger.ts';
import { PostRideStartFragmentProps } from './components/PostRideStartFragment.tsx';
import { RideConfirmedView, RideConfirmedViewProps } from './UI.tsx';
import { resetSosState } from '../../../src/typescript/state/client/sos.ts';
import { FormatedLocation, transformLocationAddressToFormatedLocation } from '@/typescript/utils/placeUtils.ts';
import { stopReq } from '@/readOnly/api/types/StopReq.gen.tsx';

import { location } from '@/helpers/utils/Location/LocationTypes.gen.tsx';
import { useRideBookingRideBookingIdEditStopPostMutation } from '@/api/integrations/rtk/RideBookingRideBookingIdEditStopPost.ts';
import { useRideBookingRideBookingIdAddStopPostMutation } from '@/api/integrations/rtk/RideBookingRideBookingIdAddStopPost.ts';
import { useRideBookingRideBookingIdSoftCancelPostMutation } from '@/api/integrations/rtk/RideBookingRideBookingIdSoftCancelPost.ts';
import { setBookedStops } from '@/typescript/state/client/booking.ts';
import { setIsSoftCancelSuccessful, selectIsSoftCancelSuccessful } from '@/typescript/state/client/ride.ts';
import { useGetBookingDetailsMutation } from '@/typescript/state/server/bookingApi.ts';
import { getDriverLocResp } from '@/readOnly/api/types/GetDriverLocResp.gen.tsx';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList.tsx';
import { useRideBookingListGetLazyQueryWithAppName } from '@/api/integrations/rtk/RideBookingListGet.ts';
import { bookingListRes } from '@/readOnly/api/types/BookingListRes.gen.tsx';
import { logger } from '@/src-v2/systems/logger';
import { Profiler } from '@/typescript/hooks/useComponentProfiler.tsx';
import { MapContext } from '@/typescript/Maps/MapContext.tsx';
import {
    updateLiveSharingWithNewEmergencyContacts,
    TransformedContact,
} from '@/typescript/designSystem/components/LiveTrackingModal.tsx';
import { getGoogleMapsURL } from '@/typescript/constants/common.ts';
import { useChatSessions } from './hooks/useChatSessions';
import { useChatMessages } from './hooks/useChatMessages';
import { selectChatSessionWithId } from '@/typescript/state/client/chat.ts';
import { selectCurrentChatSessionIdWithId } from '@/typescript/state/client/ride.ts';
import { useProfileGetEmergencySettingsGetQuery } from '@/api/integrations/rtk/ProfileGetEmergencySettingsGet.ts';
import { useShareRidePostMutation } from '@/api/integrations/rtk/ShareRidePost.ts';
import { getPickupInstructions, openGoogleMapsNavigation } from '@/src-v2/utils/common.ts';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { getRemoteConfig, getString } from '@react-native-firebase/remote-config';
import { setJourneyRefreshFlag, setLegIsLoading } from '@/typescript/state/client/journey';
import { createJourneyId } from '@/typescript/state/client/user';
import { PopupDismissalTracker } from '@/src-v2/multimodal/screens/LiveJourneyDetail/LiveJourneyPopupManager.tsx';
import { BackHandler, Keyboard } from 'react-native';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '@/typescript/utils/useHaptic.ts';

const rideCompletedDetails = (bookingDetails: bookingAPIEntity, rideDetails: rideAPIEntity | null) => {
    const toll = bookingDetails.fareBreakup.find(item => item.description === 'TOLL_CHARGES');
    return {
        'Estimate ride distance (km)': bookingDetails.estimatedDistance
            ? bookingDetails.estimatedDistance / 1000
            : undefined,
        'Actual ride distance (km)':
            rideDetails && rideDetails.chargeableRideDistance ? rideDetails.chargeableRideDistance / 1000 : undefined,
        'Difference between estimated and actual ride distance (km)':
            bookingDetails.estimatedDistance && rideDetails && rideDetails.chargeableRideDistance
                ? bookingDetails.estimatedDistance - rideDetails.chargeableRideDistance / 1000
                : undefined,
        'Total Estimated fare': bookingDetails.estimatedFare,
        'Total Actual fare': rideDetails ? rideDetails.computedPrice : undefined,
        'Difference between estimated and actual fares':
            bookingDetails.estimatedFare - (rideDetails && rideDetails.computedPrice ? rideDetails.computedPrice : 0),
        'Driver pickup charges': '10',
        'Actual Toll Charges': toll?.amount,
        'Has Toll': toll !== undefined,
        'Ride End Time': rideDetails?.rideEndTime,
    };
};

const isNightRide = (bookingDetails: bookingAPIEntity): boolean => {
    return bookingDetails.fareBreakup.some(item => item.description === 'NIGHT_SHIFT_CHARGE');
};

export type RideConfirmedProps = {
    bookingId: BookingId | null;
    hideSideDrawer: boolean | undefined;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
};

const RideConfirmed: React.FC<RideConfirmedProps> = ({ bookingId, hideSideDrawer = false, multimodalProps }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const hasNavigatedToReview = useRef(false);
    const activeRideSearchId = useAppSelector(selectActiveRideSearchId);
    const { callDriverBottomsheetModalRef, ticketUIRef } = useRefsContext();
    const lastKnownLocation = useAppSelector(selectLastKnownLocation);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const rideId = useAppSelector(state => selectRideIdWithBookingId(state, bookingId));

    const bookingDetails = useAppSelector(state => selectBookingDetailsWithId(state, bookingId));
    const rideDetails = useAppSelector(state => selectRideDetailsWithId(state, rideId));
    const userToken = useAppSelector(selectToken);
    const stopInfo = useAppSelector(state => selectStopInfoWithId(state, rideId));
    const otpCode = useAppSelector(state => selectOtpCodeWithBookingId(state, bookingId));
    const rideChecks = useAppSelector(state => selectRideChecksWithBookingId(state, bookingId));
    const rideCheckType = useAppSelector(selectRideChecksType);

    const [isBottomSheetChatOpen, setIsBottomSheetChatOpen] = useState(false);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const [hideSideDrawerState, setHideSideDrawerState] = useState(hideSideDrawer);
    useFocusEffect(
        React.useCallback(() => {
            setHideSideDrawerState(hideSideDrawer);
        }, [hideSideDrawer]),
    );

    useEffect(() => {
        if (hideSideDrawerState) {
            setHideSideDrawerState(false);
        }
    }, [hideSideDrawerState]);

    const isPresented = useRef(false);
    const dispatch = useAppDispatch();
    const source = useAppSelector(state => selectBookedSourceWithId(state, bookingId));
    const stops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    const emergencyContacts = useAppSelector(selectEmergencyContacts);
    const liveSharingEmergencyContacts: TransformedContact[] | undefined = useAppSelector(
        selectLiveSharingEmergencyContacts,
    );

    const { data: emergencySettings } = useProfileGetEmergencySettingsGetQuery({
        isPolling: false,
    });
    const [shareRidePost] = useShareRidePostMutation();

    const [safetyCheckStartTime, safetyCheckEndTime] = useMemo(() => {
        const start = emergencySettings?.safetyCheckStartTime || 21 * 3600;
        const end = emergencySettings?.safetyCheckEndTime || 6 * 3600;
        return [start, end];
    }, [emergencySettings]);

    // Use the chat sessions hook
    const {
        isChatOpen,
        setIsChatOpen,
        isChatClicked,
        isDriver,
        setIsDriver,
        currentChatSessionId,
        contactWithPriorityZero,
        handleChatClick,
        handleCallClick,
        personId,
    } = useChatSessions({
        rideId: rideId,
        bookingId: bookingId ?? undefined,
        bookingDetailsId: bookingDetails?.id,
        rideStatus: rideDetails?.status,
        bppRideId: rideDetails?.bppRideId,
        bookingTag: bookingDetails?.bookingDetails?.TAG,
    });

    useEffect(() => {
        const result: TransformedContact[] = updateLiveSharingWithNewEmergencyContacts(
            emergencyContacts,
            liveSharingEmergencyContacts ?? [],
            safetyCheckStartTime,
            safetyCheckEndTime,
        );
        if (liveSharingEmergencyContacts && rideDetails?.status === 'INPROGRESS') {
            const updatedLiveContacts = result.filter(newLiveContact => {
                return (
                    !liveSharingEmergencyContacts.find(liveContact => liveContact.title === newLiveContact.title) ||
                    liveSharingEmergencyContacts.find(
                        liveContact =>
                            liveContact.title === newLiveContact.title &&
                            liveContact.isRideShared !== newLiveContact.isRideShared,
                    )
                );
            });
            updatedLiveContacts.forEach(newContact => {
                if (newContact.isRideShared) {
                    shareRidePost({
                        body: { emergencyContactNumbers: [newContact.mobileNumber] },
                    });
                }
            });
        }
        dispatch(setLiveSharingEmergencyContacts(result));
    }, [emergencyContacts, safetyCheckStartTime, safetyCheckEndTime, rideDetails?.status]);

    const destination = stops[stops.length - 1];
    const [localDestination, setLocalDestination] = useState<FormatedLocation | undefined>(undefined);
    const [isUpdateRequired, setIsUpdateRequired] = useState<boolean>(false);
    const featureFlags = useAppSelector(selectFeatureFlags);
    const editPickUpThreshold = useMemo(() => {
        const remoteConfigInstance = getRemoteConfig();
        const config = getString(remoteConfigInstance, 'edit_location_configs');
        const parsed = safeJsonParse<{ editPickUpThreshold: number }>(
            config,
            { editPickUpThreshold: 0.1 },
            'editLocationConfig',
        );
        return parsed.editPickUpThreshold ?? 0.1;
    }, []);
    const [showBottomSheet, setShowBottomSheet] = useState(
        rideDetails && rideDetails?.status !== 'NEW' && featureFlags.postRideStartFragment ? false : true,
    );
    const editPickupAttempts = useAppSelector(state => selectEditPickupAttempts(state, rideId));

    const editLocationAttempts = useAppSelector(state => selectEditLocationAttempts(state, rideId));
    const userCancelled = useAppSelector(selectFindAnotherDriver);
    const isSoftCancelSuccessful = useAppSelector(state => selectIsSoftCancelSuccessful(state, rideId));

    const [reAllocated, setReAllocated] = useState(false);
    const [isCancelled, setIsCancelled] = useState(false);

    useEffect(() => {
        if (localDestination === undefined) setLocalDestination(destination);
        console.error(
            'localDestination',
            !isEqual(destination, localDestination),
            destination,
            localDestination,
            'isUpdateRequired',
            isUpdateRequired,
        );
        if (isUpdateRequired && !isEqual(destination, localDestination)) {
            setLocalDestination(destination);
            setIsUpdateRequired(false);
        }
    }, [destination]);
    const isScreenFocused = useIsFocused();

    // the counter to trigger the mutation
    useBookingDetailsOnStatusChange(
        bookingId,
        rideId,
        reAllocated || isCancelled ? 0 : 5000,
        isUpdateRequired,
        isScreenFocused,
    );

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const [rideBookingRideBookingIdEditStopPost] = useRideBookingRideBookingIdEditStopPostMutation();
    const [rideBookingRideBookingIdAddStopPost] = useRideBookingRideBookingIdAddStopPostMutation();
    const [rideBookingRideBookingIdSoftCancelPost] = useRideBookingRideBookingIdSoftCancelPostMutation();
    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const { mapRef } = useContext(MapContext);

    useEffect(() => {
        mapRef.current?.removeNearbyMarkers();

        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, []);

    const rentalEditorAddStopApiCall = (
        apiType: 'editStop' | 'addStop',
        body: stopReq,
        location: location | undefined,
    ) => {
        const api = apiType === 'addStop' ? rideBookingRideBookingIdAddStopPost : rideBookingRideBookingIdEditStopPost;
        try {
            if (bookingId != undefined && location != undefined) {
                api({
                    rideBookingId: bookingId,
                    body: body,
                })
                    .unwrap()
                    .then(() => {
                        if (location && location.lat && location.lng) {
                            dispatch(
                                setBookedStops({
                                    id: bookingId ?? null,
                                    payload: transformLocationAddressToFormatedLocation(
                                        location,
                                        location.lat,
                                        location.lng,
                                    ),
                                }),
                            );
                            dispatch(
                                setToastProps({
                                    message:
                                        apiType === 'addStop' ? 'Stop added successfully' : 'Stop updated successfully', // TODO: add translation
                                    backgroundColor: 'green',
                                    autoDismissAfter: 1500,
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
                    })
                    .catch(err => {
                        console.error('Error during editStopApiCall:', err);
                    });
            } else {
                console.error('bookingId undefined in rentalEditorAddStopApiCall');
            }
        } catch (error) {
            dispatch(
                setToastProps({
                    message:
                        apiType === 'addStop'
                            ? 'Add stop failed due to some issue, Please try again'
                            : 'Edit stop failed due to some issue, Please try again',
                    backgroundColor: `${themeColors.Fill_negativeHigh}`,
                    autoDismissAfter: 1500,
                    buttons: [],
                    visible: true,
                    logo: <Danger />,
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
            console.error('Error during editStopApiCall:', error);
        }
    };

    const onSearchCardClick = useCallback(
        async (location?: location) => {
            const body: stopReq = {
                address: location?.addressComponents ?? {
                    area: undefined,
                    areaCode: undefined,
                    building: undefined,
                    city: undefined,
                    country: undefined,
                    door: undefined,
                    extras: undefined,
                    instructions: undefined,
                    placeId: undefined,
                    state: undefined,
                    street: undefined,
                    title: undefined,
                    ward: undefined,
                },
                gps: {
                    lat: location?.lat ?? 0,
                    lon: location?.lng ?? 0,
                },
            };
            try {
                destination === undefined
                    ? rentalEditorAddStopApiCall('addStop', body, location)
                    : rentalEditorAddStopApiCall('editStop', body, location);
                genericSearchModalRef?.current?.close();
            } catch (err) {
                console.error('Failed onSearchCardClick:--------->', err);
            }
        },
        [destination],
    );

    const onLocateOnMapClick = useCallback(() => {
        navigation.navigate('locateOnMap', {
            lat: currentLocation?.lat ?? 0,
            lng: currentLocation?.lng ?? 0,
            locationType: 'source',
            onLocationConfirm: onSearchCardClick,
            title: userLanguageStrings.EditLocation,
            subTitle: userLanguageStrings.SelectStopForYourRentalsRide,
            ctaText: userLanguageStrings.ConfirmLocation,
        });
        genericSearchModalRef?.current?.close();
    }, [currentLocation, onSearchCardClick]);

    const onSafetyBtnClick = useCallback(() => {
        logEvent(EventName.NY_IC_SAFETY_CENTER_CLICKED);
        // dispatch(resetSosState());   #Not sure why Sos state is being cleared here
        navigation.navigate('safetyTools', {
            bookingId: createBookingId(bookingDetails?.id ?? ''),
            isRideEnded: false,
        });
    }, [bookingDetails?.id, resetSosState]);

    const onEditPickupClick = useCallback(() => {
        if (editPickupAttempts <= 0) {
            dispatch(
                setToastProps({
                    message: userLanguageStrings.Youhavereachedthemaximumnumberofattemptstochangethepickuplocation,
                    backgroundColor: `${themeColors.Fill_negativeHigh}`,
                    autoDismissAfter: 1500,
                    buttons: [],
                    visible: true,
                    logo: <Danger />,
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
            return;
        }
        navigation.navigate('editPickup', {
            rideId: createRideId(rideDetails?.id ?? ''),
            bookingId: createBookingId(bookingId ?? ''),
            lat: bookingDetails?.initialPickupLocation?.lat ?? 0,
            lon: bookingDetails?.initialPickupLocation?.lon ?? 0,
            circleRadius: editPickUpThreshold,
        });
    }, [editPickupAttempts, editPickUpThreshold, rideDetails, navigation, bookingDetails?.initialPickupLocation]);

    const onEditDestinationClick = useCallback(
        (payload: getDriverLocResp | undefined) => {
            stops.map((_, index) => {
                const isDestination = index === stops.length - 1;
                if (!isDestination) return;
                if (!payload || !rideDetails) {
                    dispatch(
                        setToastProps({
                            message: userLanguageStrings.UnabletoperformtheactionPleasetryagain,
                            backgroundColor: `${themeColors.Fill_negativeHigh}`,
                            autoDismissAfter: 1500,
                            buttons: [],
                            visible: true,
                            logo: <Danger />,
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                    return;
                }
                if (editLocationAttempts > 0) {
                    navigation.navigate('editDestination', {
                        rideId: createRideId(rideDetails?.id ?? ''),
                        setIsUpdateRequired,
                        lat: source?.lat ?? 0,
                        lon: source?.lng ?? 0,
                        currentDriverLat: payload?.lat,
                        currentDriverLon: payload?.lon,
                        source: source ?? undefined,
                        multimodalExtendLegProps: undefined,
                        skipEditLocation: false,
                    });
                } else {
                    dispatch(
                        setToastProps({
                            message:
                                userLanguageStrings.Youhavereachedthemaximumnumberofattemptstochangethedroplocation,
                            backgroundColor: `${themeColors.Fill_negativeHigh}`,
                            autoDismissAfter: 1500,
                            buttons: [],
                            visible: true,
                            logo: <Danger />,
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                }
            });
        },
        [navigation, stops, rideDetails, editLocationAttempts],
    );

    const customerFirstRide = getBoolItem(MMKVKey.FIRST_RIDE_COMPLETE) ?? false;
    const [rideBookingTrigger] = useRideBookingListGetLazyQueryWithAppName();
    const hasTriggeredFirstRideEventRef = useRef(false);
    useEffect(() => {
        if (bookingDetails && bookingDetails.status === 'COMPLETED') {
            if (customerFirstRide === false) {
                rideBookingTrigger({
                    limit: 2,
                    offset: 0,
                    status: 'COMPLETED',
                    clientId: undefined,
                    onlyActive: undefined,
                }).then(response => {
                    const responseData: bookingListRes | undefined = response;
                    if (responseData != undefined) {
                        firstRideCompletedEvent(responseData);
                        hasTriggeredFirstRideEventRef.current = true;
                    }
                });
            }
        }
    }, [bookingDetails?.status]);

    const currentSessionId = useAppSelector(state => selectCurrentChatSessionIdWithId(state, rideId));
    const currentSession = useAppSelector(state => selectChatSessionWithId(state, currentSessionId));
    const messagesList = currentSession.readableMessages;

    const { showChatBar, setShowChatBar, messageCountLogic, shouldEnableAutoSendMessage } = useChatMessages({
        messagesList,
        personId,
    });

    useEffect(() => {
        if (
            bookingDetails &&
            (bookingDetails.status === 'CONFIRMED' || bookingDetails.status === 'TRIP_ASSIGNED') &&
            !isSoftCancelSuccessful
        ) {
            const handleSoftCancelAndRefetch = async () => {
                try {
                    await rideBookingRideBookingIdSoftCancelPost({ rideBookingId: bookingDetails.id }).unwrap();
                    dispatch(setIsSoftCancelSuccessful({ id: rideId, payload: true }));
                    await fetchBookingDetails(bookingId).unwrap();
                } catch (err) {
                    console.error('Error during softCancel and refetch:', err);
                }
            };
            handleSoftCancelAndRefetch();
        }
    }, [bookingDetails?.status, isSoftCancelSuccessful]);

    useEffect(() => {
        switch (rideDetails?.status) {
            case 'INPROGRESS':
                if (currentChatSessionId === bookingId) {
                    setShowChatBar(false);
                } else if (emergencyContacts.length === 0) {
                    setShowChatBar(false);
                }
                setIsBottomSheetChatOpen(false);
                rideConfirmedChatBottomsheetRef?.current?.close();
                multiChatRef.current?.dismiss();
                logEvent(EventName.NY_USER_RIDE_STARTED);
                break;
            case 'COMPLETED':
                logEvent(EventName.NY_RIDER_RIDE_COMPLETED);
                break;
            case 'NEW':
                logEvent(EventName.NY_FS_DRIVER_ASSIGNMENT);
                break;
            default:
                break;
        }
    }, [rideDetails?.status, emergencyContacts.length]);

    useEffect(() => {
        if (bookingDetails) {
            switch (bookingDetails.status) {
                case 'COMPLETED':
                    logger.logDebug(
                        `[RideConfirmed] Ride completed -> ${rideCompletedDetails(bookingDetails, rideDetails)}`,
                        'RideConfirmed',
                    );
                    logEvent(EventName.NY_RIDER_RIDE_COMPLETED, rideCompletedDetails(bookingDetails, rideDetails));
                    if (isNightRide(bookingDetails)) {
                        logEvent(
                            EventName.NY_USER_NIGHT_RIDE_COMPLETED,
                            rideCompletedDetails(bookingDetails, rideDetails),
                        );
                    }
                    if (multimodalProps) {
                        const { journeyId, currentLegOrder } = multimodalProps;
                        dispatch(
                            setLegIsLoading({
                                id: createJourneyId(journeyId),
                                payload: { legOrder: currentLegOrder, journeyRefresh: true },
                            }),
                        );
                        PopupDismissalTracker.dismiss(`${journeyId}-${currentLegOrder}-ride-complete-AutoAndCabStatus`);
                    }
                    if (!hasNavigatedToReview.current) {
                        hasNavigatedToReview.current = true;
                        if (multimodalProps && multimodalProps.isLastMile) {
                            navigation.popTo('LiveTab', {
                                screen: 'multiTransitFeedback',
                                params: {
                                    journeyId: multimodalProps.journeyId,
                                    multimodalProps: undefined,
                                },
                            });
                        } else {
                            navigation.popTo('HomeTab', {
                                screen: 'reviewAndFeedback',
                                params: {
                                    bookingId: bookingDetails?.id,
                                    multimodalProps: multimodalProps,
                                },
                            });
                        }
                    }
                    break;
                case 'REALLOCATED':
                    rcsDispatch(createAction('ON_REALLOCATION', undefined));
                    break;
                case 'CANCELLED':
                    rcsDispatch(createAction('ON_RIDE_CANCELLED', undefined));
                    break;
                default:
                    break;
            }

            const buildInitialRideChecks = (
                current: RideChecks,
                isTollIncluded: boolean,
                isParkingIncluded: boolean,
                isAcRide: boolean,
                isInProgress: boolean,
            ): RideChecks => {
                return {
                    acVehicle:
                        !isInProgress && current.acVehicle === RideChecksType.None && isAcRide
                            ? RideChecksType.AcVehicle
                            : current.acVehicle,
                    toll:
                        current.toll === RideChecksType.None && isTollIncluded
                            ? RideChecksType.TollIncluded
                            : current.toll,
                    parking:
                        current.parking === RideChecksType.None && isParkingIncluded
                            ? RideChecksType.Parking
                            : current.parking,
                    tollAndParking:
                        current.tollAndParking === RideChecksType.None && isTollIncluded && isParkingIncluded
                            ? RideChecksType.TollAndParkingIncluded
                            : current.tollAndParking,
                    driverDemandExtra:
                        !isInProgress && current.driverDemandExtra === RideChecksType.None
                            ? RideChecksType.DriverDemandExtra
                            : current.driverDemandExtra,
                    vehicleCleanliness:
                        !isInProgress && current.vehicleCleanliness === RideChecksType.None
                            ? RideChecksType.VehicleCleanliness
                            : current.vehicleCleanliness,
                };
            };

            if (bookingDetails) {
                let mutableLocalRideChecks: { [key: string]: RideChecks } | undefined;
                try {
                    const stored = getStringItem(MMKVKey.RIDE_CHECKS);
                    if (stored && stored.trim() !== '') {
                        const parsed = safeJsonParse<{ [key: string]: RideChecks }>(stored, {}, 'rideChecksStorage');
                        mutableLocalRideChecks = parsed || undefined;
                    }
                } catch (err) {
                    console.error('[RideChecksTest] Error parsing RIDE_CHECKS:', err);
                    mutableLocalRideChecks = undefined;
                }

                if (mutableLocalRideChecks && mutableLocalRideChecks[bookingDetails.id]) {
                    const rideChecksData = mutableLocalRideChecks[bookingDetails.id];
                    if (rideChecksData) {
                        dispatch(
                            setRideChecks({
                                id: bookingId,
                                payload: rideChecksData,
                            }),
                        );
                    }
                } else {
                    // Compute new rideChecks if not present in storage
                    const isTollIncluded = Boolean(
                        bookingDetails.estimatedFareBreakup?.find(item => item.description === 'TOLL_CHARGES'),
                    );
                    const isParkingIncluded = Boolean(
                        bookingDetails.estimatedFareBreakup?.find(item => item.description === 'PARKING_CHARGE'),
                    );
                    const isAcRide = Boolean(bookingDetails?.isAirConditioned);
                    const isInProgress = rideDetails?.status === 'INPROGRESS';

                    const newRideChecks = buildInitialRideChecks(
                        rideChecks,
                        isTollIncluded,
                        isParkingIncluded,
                        isAcRide,
                        isInProgress,
                    );

                    dispatch(
                        setRideChecks({
                            id: bookingId,
                            payload: newRideChecks,
                        }),
                    );
                    const storage = { [bookingDetails.id]: newRideChecks };
                    setStringItem(MMKVKey.RIDE_CHECKS, JSON.stringify(storage));
                }
            }

            if (rideDetails && rideDetails.status !== 'NEW' && featureFlags.postRideStartFragment) {
                rcsDispatch(createAction('CLOSE_BTMSHEET', undefined));
            } else if (!showBottomSheet) {
                rcsDispatch(createAction('PRESENT_BTMSHEET', undefined));
            }
        }
        /* eslint-disable myCustomPlugin/no-hook-dep */
    }, [rideDetails, bookingDetails, featureFlags]);

    useEffect(() => {
        if (
            bookingDetails &&
            rideDetails &&
            rideDetails.status !== 'INPROGRESS' &&
            (bookingDetails?.status === 'CONFIRMED' || bookingDetails?.status === 'TRIP_ASSIGNED') &&
            rideChecks.toll === RideChecksType.TollIncluded &&
            rideChecks.parking === RideChecksType.Parking
        ) {
            dispatch(setRideCheckType(RideChecksType.TollAndParkingIncluded));
        } else if (
            bookingDetails &&
            rideDetails &&
            rideDetails.status !== 'INPROGRESS' &&
            (bookingDetails?.status === 'CONFIRMED' || bookingDetails?.status === 'TRIP_ASSIGNED') &&
            rideChecks.toll === RideChecksType.TollIncluded
        ) {
            dispatch(setRideCheckType(RideChecksType.TollIncluded));
        } else if (
            bookingDetails &&
            rideDetails &&
            rideDetails.status !== 'INPROGRESS' &&
            (bookingDetails?.status === 'CONFIRMED' || bookingDetails?.status === 'TRIP_ASSIGNED') &&
            rideChecks.parking === RideChecksType.Parking
        ) {
            dispatch(setRideCheckType(RideChecksType.Parking));
        } else if (
            rideDetails &&
            rideDetails.status === 'INPROGRESS' &&
            featureFlags.showACRidePopup &&
            rideChecks.acVehicle === RideChecksType.AcVehicle
        ) {
            dispatch(setRideCheckType(RideChecksType.AcVehicle));
        } else if (
            bookingDetails &&
            rideDetails &&
            rideDetails.status !== 'INPROGRESS' &&
            (bookingDetails?.status === 'CONFIRMED' || bookingDetails?.status === 'TRIP_ASSIGNED') &&
            rideChecks.driverDemandExtra === RideChecksType.DriverDemandExtra
        ) {
            dispatch(setRideCheckType(RideChecksType.DriverDemandExtra));
        }
        return () => {};
    }, [
        rideChecks.toll,
        rideChecks.parking,
        rideChecks.acVehicle,
        rideChecks.driverDemandExtra,
        bookingDetails?.status,
        rideDetails?.status,
        featureFlags.showACRidePopup,
        dispatch,
    ]);

    // handle cancel ride
    const onRideConfirmedCancel = useCallback(() => {
        if (!isCancelled) {
            setIsCancelled(true);
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'rc_onRideConfirmedCancel' }));
            clearSession();
            resetIds(userToken, bookingId, dispatch);
            if (multimodalProps?.journeyId) {
                dispatch(setJourneyRefreshFlag({ id: multimodalProps.journeyId, payload: true }));
            }
            timeoutId.current = setTimeout(() => {
                navigation.popTo('mainTabNavigation', {
                    screen: 'homeTab_homeScreen',
                    params: {
                        multimodalProps: multimodalProps,
                        journeyDetailsProps: undefined,
                    },
                });
            }, 100);
        }
    }, [isCancelled]);

    // on-ride-cancelled
    const onFindAnotherDriver = useCallback(() => {
        if (!reAllocated) {
            setReAllocated(true);
            dispatch(setBookingId({ id: userToken, payload: null }));
            dispatch(removeActiveBookingId({ id: userToken, payload: bookingId }));
            console.info('BookingId after this: ', bookingId);
            dispatch(setSearchId({ id: userToken, payload: activeRideSearchId }));
            if (bookingDetails) {
                setLookingForDriversDataInBooking(bookingDetails, dispatch);
            }
            handleReallocation(dispatch, userLanguageStrings, themeColors, userCancelled);
            navigation.popTo('mainTabNavigation', {
                screen: 'homeTab_homeScreen',
                params: {
                    multimodalProps: multimodalProps,
                    journeyDetailsProps: undefined,
                },
            });
        }
    }, [reAllocated, activeRideSearchId, bookingDetails, setLookingForDriversDataInBooking]);

    const handleRideChecksPopup = useCallback(
        (type?: RideChecksType) => {
            if (bookingDetails) {
                const payload = {
                    acVehicle: type === RideChecksType.AcVehicle ? RideChecksType.Acknowledged : rideChecks.acVehicle,
                    toll: type === RideChecksType.TollIncluded ? RideChecksType.Acknowledged : rideChecks.toll,
                    parking: type === RideChecksType.Parking ? RideChecksType.Acknowledged : rideChecks.parking,
                    tollAndParking:
                        type === RideChecksType.TollAndParkingIncluded
                            ? RideChecksType.Acknowledged
                            : rideChecks.tollAndParking,
                    driverDemandExtra:
                        type === RideChecksType.DriverDemandExtra
                            ? RideChecksType.Acknowledged
                            : rideChecks.driverDemandExtra,
                    vehicleCleanliness:
                        type === RideChecksType.VehicleCleanliness
                            ? RideChecksType.Acknowledged
                            : rideChecks.vehicleCleanliness,
                };
                const storage: { [key: string]: RideChecks } = {
                    [bookingDetails.id]: payload,
                };
                setStringItem(MMKVKey.RIDE_CHECKS, JSON.stringify(storage));
                dispatch(
                    setRideChecks({
                        id: bookingId,
                        payload: payload,
                    }),
                );
            }
        },
        [bookingDetails, rideCheckType],
    );
    const handlePickupDirectionsPress = useCallback(() => {
        const url = getGoogleMapsURL(source, undefined, undefined);
        const instructions = getPickupInstructions(
            source,
            bookingDetails?.specialLocationName,
            bookingDetails?.fromLocation.title,
        );
        if (instructions.length > 0) {
            navigation.navigate('LiveTab', {
                screen: 'pickupInstructions',
                params: {
                    instructions: instructions,
                    openMapsUri: url,
                },
            });
        } else {
            openGoogleMapsNavigation(source, undefined, undefined);
        }
    }, [
        getGoogleMapsURL,
        source,
        bookingDetails?.specialLocationName,
        bookingDetails?.fromLocation.title,
        openGoogleMapsNavigation,
    ]);

    // Ref
    const { rideConfirmedBottomsheetModalRef, rideConfirmedChatBottomsheetRef, genericSearchModalRef, multiChatRef } =
        useRefsContext();

    const onPressMultimodalExit = useCallback(() => {
        if (multimodalProps) {
            dispatch(
                setLegIsLoading({
                    id: createJourneyId(multimodalProps.journeyId),
                    payload: { legOrder: multimodalProps.currentLegOrder, journeyRefresh: true },
                }),
            );

            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.popTo('mainTabNavigation', {
                    screen: 'liveTab_homeScreen',
                    params: {
                        multimodalProps: multimodalProps,
                        journeyId: multimodalProps.journeyId,
                    },
                });
            }
        } else {
            dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'rc_onPressExitBtn' }));
            if (navigation.canGoBack()) {
                navigation.goBack();
            } else {
                navigation.popTo('mainTabNavigation', {
                    screen: 'homeTab_homeScreen',
                });
            }
        }
    }, [navigation, multimodalProps?.journeyId]);
    const TicketButtonClicked = () => {
        ticketUIRef?.current?.present();
    };

    const resolver: Resolver<RideConfirmedScreenAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'HAMBURGER_TOGGLED':
                    {
                        if (isChatOpen) {
                            setIsChatOpen(false);
                        } else {
                            setHideSideDrawerState(false);
                        }
                    }
                    break;
                case 'EDIT_PICKUP_CLICKED':
                    onEditPickupClick();
                    break;
                case 'EDIT_DESTINATION_CLICKED':
                    onEditDestinationClick(action.payload?.driverLocation);
                    break;
                case 'ON_RIDE_CANCELLED':
                    onRideConfirmedCancel();
                    break;
                case 'ON_REALLOCATION':
                    onFindAnotherDriver();
                    break;
                case 'ON_SAFETY_MODAL_CLOSED':
                    handleRideChecksPopup(action.payload?.rideCheckType);
                    break;
                case 'BTMSHEET_ON_CHANGE': {
                    const payload = action.payload;
                    if (payload) {
                        const { index } = payload;
                        if (index === 0) {
                            isPresented.current = true;
                        } else {
                            isPresented.current = false;
                        }
                    } else {
                        throw new Error(`Payload expected: ${action}`);
                    }
                    break;
                }
                case 'CHAT_CLICKED':
                    handleChatClick();
                    break;
                case 'CALL_CLICKED':
                    handleCallClick(callDriverBottomsheetModalRef);
                    break;
                case 'POST_RIDE_BOOKING_DETAILS_CLICKED':
                    setShowBottomSheet(true);
                    break;
                case 'POST_RIDE_SOS_CLICKED':
                    dispatch(resetSosState());
                    navigation.navigate('safetyTools', {
                        bookingId: createBookingId(bookingDetails?.id ?? ''),
                        isRideEnded: true,
                    });
                    break;
                case 'BTMSHEET_BACKDROP_CLICKED':
                case 'CLOSE_BTMSHEET':
                    // close() animates the bottom sheet to its hidden state.
                    // However, to ensure bottom sheet backdrop is removed to enable click events
                    // to pass through, we need to remove the view using setShowBottomSheet(false)
                    // setTimeout is to delay the removal of the backdrop to ensure the animation completes
                    rideConfirmedBottomsheetModalRef?.current?.close();
                    setTimeout(() => setShowBottomSheet(false), 300);
                    break;
                case 'PRESENT_BTMSHEET':
                    rideConfirmedBottomsheetModalRef?.current?.present();
                    setShowBottomSheet(true);
                    break;
                case 'SEARCH_CARD_CLICKED':
                    onSearchCardClick(action.payload?.location);
                    break;
                case 'LOCATE_ON_MAP_CLICK':
                    onLocateOnMapClick();
                    break;
                case 'SAFETY_BTN_CLICKED':
                    onSafetyBtnClick();
                    break;
                case 'PICKUP_DIRECTIONS_BTN_CLICKED':
                    handlePickupDirectionsPress();
                    break;
                case 'MULTIMODAL_EXIT_CLICKED':
                    onPressMultimodalExit();
                    break;
                case 'TICKET_BUTTON_CLICKED':
                    TicketButtonClicked();
                    break;
                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [
            onLocateOnMapClick,
            onSearchCardClick,
            handleRideChecksPopup,
            onEditPickupClick,
            onEditDestinationClick,
            onRideConfirmedCancel,
            onFindAnotherDriver,
            onSafetyBtnClick,
            navigation,
            isChatOpen,
            source,
            handlePickupDirectionsPress,
            handleChatClick,
            handleCallClick,
            callDriverBottomsheetModalRef,
            TicketButtonClicked,
        ],
    );

    const rcsDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    const onBackPress = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.impactLight, undefined);
        Keyboard.dismiss();
        if (isBottomSheetChatOpen) {
            setIsBottomSheetChatOpen(false);
            rideConfirmedChatBottomsheetRef?.current?.close();
            rideConfirmedBottomsheetModalRef?.current?.snapToIndex(0);
        } else {
            BackHandler.exitApp();
        }
        return true;
    }, [rcsDispatch, isBottomSheetChatOpen]);

    const rideConfirmedFragmentState: RideConfirmedFragmentProps = {
        bookingDetails,
        rideDetails,
        stopInfo,
        otpCode,
        currentChatSessionId,
        isChatClicked,
        multiChatRef,
        isPresented,
        isDriver,
        setIsDriver,
        isChatOpen,
        setIsChatOpen,
        contactWithPriorityZero,
        source,
        stops,
        destination,
        rcsDispatch,
        showBottomSheet,
        onRideConfirmedCancel,
        personId,
        isBottomSheetChatOpen,
        setIsBottomSheetChatOpen,
        setShowChatBar,
        showChatBar,
        shouldEnableAutoSendMessage,
        messageCountLogic,
        onEditPickupClick,
        multimodalProps,
    };

    const postRideStartFragmentState: PostRideStartFragmentProps = {
        vehicleServiceTierType: rideDetails?.vehicleServiceTierType,
        bookingId: bookingId,
        rcsDispatch,
    };

    const viewState: RideConfirmedViewProps = {
        rideDetails,
        lastKnownLocation,
        featureFlags,
        rideConfirmedFragmentState,
        postRideStartFragmentState,
        onHardwareBackPress: onBackPress,
    };

    return <RideConfirmedView {...viewState} />;
};

export const ProfiledRideConfirmed: React.FC<RideConfirmedProps> = ({
    bookingId,
    hideSideDrawer = false,
    multimodalProps,
}) => {
    return (
        <Profiler componentName="RideConfirmed">
            <RideConfirmed bookingId={bookingId} hideSideDrawer={hideSideDrawer} multimodalProps={multimodalProps} />
        </Profiler>
    );
};
