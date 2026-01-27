import React, { useContext, useEffect, useState, useRef, useCallback, useMemo, memo } from 'react';
import { useRefsContext } from '@/typescript/context/RefsContext.tsx';
import { createBookingId, selectEmergencyContacts, selectFollowers } from '@/typescript/state/client/user.ts';
import BottomSheet, {
    BottomSheetBackdropProps,
    BottomSheetView,
    SCREEN_HEIGHT,
    WINDOW_HEIGHT,
} from '@gorhom/bottom-sheet';
import { AccessibilityInfo, Keyboard, Platform, View } from 'react-native';
import Animated, { FadeIn, FadeOut, interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

import { calculateTimeDifference } from '@/screens/ongoingRideFlow/components/RideStatusPill.bs.js';
import { useRideTracking } from '@/typescript/hooks/useRideTracking.tsx';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors.ts';
import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import {
    selectBannerPopusConfig,
    selectCurrentEmergencyContact,
    selectFeatureFlags,
    selectNewFeatureFlags,
    selectOperatingCity,
    selectScreenReaderEnabled,
    selectCityConfig,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { RideConfirmedFragmentProps } from './Types.tsx';
import { createAction } from '@/typescript/utils/common.ts';
import type { RideStatus_rideStatus } from '@/readOnly/api/types/Enums.gen.tsx';
import {
    selectCurrentLocation,
    selectPledgeConfig,
    setCurrentLocation,
} from '../../../src/typescript/state/client/session.ts';
import {
    BottomSheetTopBannerType,
    BottomSheetTopBanner,
    getRideConfirmedBottomSheetTopBannerType,
} from '../../../src/typescript/designSystem/components/BottomSheetTopBanner.tsx';
import { BottomSheetHandleProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetHandle/types';
import { selectUserProfile } from '../../../src/typescript/state/client/user.ts';
import { useFollowRideMutation } from '../../../src/typescript/state/server/followRide.ts';
import { setFocus } from '../../../src/typescript/utils/Accessibility.ts';
import { FloatingMenu } from '@/typescript/components/FloatingMenu.tsx';
import { FloatingRideStatus } from '@/typescript/components/FloatingRideStatus.tsx';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext.tsx';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MapContext } from '@/typescript/Maps/MapContext.tsx';
import {
    selectEditLocationAttempts,
    selectEditPickupAttempts,
    selectInsuranceData,
    selectInitialDriverETAWithId,
    selectInitialPickupDistanceWithId,
} from '@/typescript/state/client/ride.ts';
import { events, EventType } from '@/src-v2/systems/events/events.ts';

import { FloatingHeader } from '@/typescript/designSystem/FloatingHeader.tsx';
import { ShieldPlus } from '@/typescript/components/svg/ShieldPlus.tsx';
import GoogleNavigation from '@/typescript/assets/svg/symbols/GoogleNavigation.tsx';
import FloatingChatBar from '@/typescript/designSystem/components/FloatingChatBar.tsx';
import CardChat from '@/typescript/designSystem/components/CardChat.tsx';
import { formatPhone } from '@/src-v2/utils/Booking.ts';
import { logEvent, EventName } from '@/typescript/utils/logger.ts';

import RideConfirmedShimmer from './components/RideConfirmedShimmer.tsx';
import ChatSection from './components/ChatSection.tsx';
import RideInfoSection from './components/RideInfoSection.tsx';
import RideDetailsSection from './components/RideDetailsSection.tsx';
import InsuranceBanner from './components/RideInsuranceBanner.tsx';
import RideConfirmedBottomSheet from './components/RideConfirmedBottomSheet.tsx';
import Button from '@/src-v2/primitives/Button.tsx';
import Typography from '@/typescript/designSystem/components/primitives/Typography.tsx';
import RideConfirmedModals from './components/RideConfirmedModals.tsx';
import { ShareTripCard } from '@/typescript/designSystem/components/ShareTripCard.tsx';
import { getPickupInstructions, openGoogleMapsNavigation } from '@/src-v2/utils/common.ts';
import PledgeContent from '@/typescript/designSystem/components/PledgeContent';
import {
    defaultPayloadData,
    NotificationContext,
    NotificationData,
} from '@/typescript/context/NotificationContext.tsx';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation.ts';
import { RNPressable } from '@/src-v2/primitives/Pressable.tsx';
import {
    createRideId,
    selectBookedSourceWithId,
    selectBookedStopsWithId,
    selectBookingSpecialAssistance,
    selectRideChecksWithBookingId,
    selectCustomerCallOptionClicked,
    selectExtraFareBannerShown,
    selectExtraFareConfirmationResponded,
    selectAcBannerShown,
    selectAcConfirmationResponded,
    selectExtraFareFirstBannerResponse,
    selectAcFirstBannerResponse,
    setExtraFareBannerShown,
    setRideChecks,
} from '@/typescript/state/client/booking.ts';
import { RideStatus } from '@/typescript/hooks/types.ts';
import { useRideStatus } from '@/typescript/hooks/useRideStatus.ts';
import { getCurrentLocation } from '@/typescript/utils/location.ts';
import { location } from '../../../src/helpers/utils/Location/LocationTypes.gen.tsx';
import { useAppDispatch } from '../../../src/typescript/state/hooks.ts';
import CloseIcon from '@/typescript/components/svg/CloseIcon.tsx';
import { ChainedBanner, bannerIdToRideChecksTypeMap, BannerConfig } from '@/src-v2/components/BannerPopups';
import { createBannerRegistry, ValidBannerId } from '@/src-v2/components/BannerPopups/BannerRegistry';
import { RideChecksType } from '@/typescript/screens/SafetyModal.tsx';
import {
    handleRideChecksBannerPopup,
    getRideChecksBannerConfig,
} from '@/src-v2/components/BannerPopups/rideChecksPopupHandler.ts';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomSheetBackdrop } from '@/typescript/components/common/BottomSheetBackdrop.tsx';
import { getShortLanguage } from '../../utils/common.ts';
import { selectSosStage, setsosStage } from '@/typescript/state/client/sos.ts';
import { getGoogleMapsURL } from '@/typescript/constants/common.ts';
import { isStageNotInGroup } from './components/RideConfirmedHeader/Types.tsx';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { isVehicleTypeCab } from '@/src-v2/screens/DriverProfile/DriverProfileUtils';
import useDelayedRender from '@/src-v2/hooks/useDelayedRender';
import { hapticEffect } from '@/typescript/utils/useHaptic.ts';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import InsuranceCard from '@/src-v2/components/BannerPopups/InsuranceCard.tsx';
import DriverHighlightBanner from '@/src-v2/components/DriverHighlightBanner';
import { useDriverHighlightMessage } from '@/src-v2/hooks/useDriverHighlightMessage';
import { selectIsPetRide } from '@/typescript/state/client/search';
import { isNull, isUndefined } from 'lodash';
import { PopupDismissalTracker } from '@/src-v2/multimodal/screens/LiveJourneyDetail/LiveJourneyPopupManager.tsx';
import { ExitButton } from '@/src-v2/multimodal/screens/NewLiveJourney/components/DetailedLiveJourney/Exit.tsx';
import { useTicketUIProps } from '@/src-v2/multimodal/screens/Ticket/Hooks/useTicketUIProps';
import TicketUI from '@/src-v2/multimodal/screens/Ticket/UI';
import TicketIcon from '@/src-v2/assets/svg/TIcketIcon.tsx';
import { Icon } from '@/typescript/components/Icon.tsx';
import { useRideBookingRideBookingIdSoftCancelPostMutation } from '@/api/integrations/rtk/RideBookingRideBookingIdSoftCancelPost.ts';
import { selectIsSoftCancelSuccessful, setIsSoftCancelSuccessful } from '@/typescript/state/client/ride.ts';
import { useGetBookingDetailsMutation } from '@/typescript/state/server/bookingApi.ts';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import { selectCurrentRegion, selectMapIsMoved } from '@/typescript/state/client/maps.ts';
import RecenterIcon from '@/typescript/assets/svg/RecenterIcon';
// Define buttonShadow style
const styles = {
    buttonShadow: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
    },
};

const RideConfirmedFragment: React.FC<RideConfirmedFragmentProps> = ({
    bookingDetails,
    rideDetails,
    stopInfo,
    otpCode,
    currentChatSessionId,
    multiChatRef,
    isDriver,
    setIsDriver,
    isChatOpen,
    source,
    stops,
    destination,
    rcsDispatch,
    showBottomSheet,
    onRideConfirmedCancel,
    isBottomSheetChatOpen,
    setIsBottomSheetChatOpen,
    setShowChatBar,
    showChatBar,
    shouldEnableAutoSendMessage,
    messageCountLogic,
    multimodalProps,
    onEditPickupClick,
}) => {
    const bookingId = bookingDetails?.id ? createBookingId(bookingDetails?.id) : null;
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const isFollowRide = false;
    const [elapsedTime, setElapsedTime] = useState(0);
    const estimatedDistance = bookingDetails?.estimatedDistance ?? 0;
    const [notificationData, setNotificationData] =
        useContext<[NotificationData, (data: NotificationData) => void]>(NotificationContext);
    const pledgeConfig = useAppSelector(selectPledgeConfig);
    const userProfile = useAppSelector(selectUserProfile);
    const currentLanguage = userProfile?.language ?? 'ENGLISH';
    const pledgeText = pledgeConfig.pledgeText[getShortLanguage(currentLanguage)];
    const [followRide] = useFollowRideMutation();
    const currentEmergencyContact = useAppSelector(selectCurrentEmergencyContact);
    const {
        rideConfirmedBottomsheetModalRef,
        rideSafetyModalRef,
        logoutModalRef,
        chatFooterTextRef,
        followRideModalRef,
        liveSharingRef,
        rideConfirmedChatBottomsheetRef,
        callDriverBottomsheetModalRef,
        genericSearchModalRef,
        trustedContactsBottomSheetModalRef,
        cancelRideBottomsheetRideConfirmedModalRef,
        cancellationReasonBottomsheetModalRef,
        tripDetailsRef,
        bottomSheetTopBannerRef,
        rideInsuranceBottomSheetModalRef,
        disabilityPopUp,
    } = useRefsContext();
    const { mapRef } = useContext(MapContext);
    const featureFlags = useAppSelector(selectFeatureFlags);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const emergencyContacts = useAppSelector(selectEmergencyContacts);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const rentaldiffTimer = bookingDetails?.estimatedDuration ?? 0;
    const rideId = rideDetails?.id ? createRideId(rideDetails?.id) : null;
    const profile = useAppSelector(selectUserProfile);
    const bookingSpecialAssistance = useAppSelector(state => selectBookingSpecialAssistance(state, bookingId));
    const user = useAppSelector(selectUserProfile);
    const chatSheetHeight = useSharedValue(300);
    const screenReaderEnabled = useAppSelector(selectScreenReaderEnabled);
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const [hideAccessibility, setHideAccessibility] = useState(false);
    const animatedIndex = useSharedValue(0);
    const chatAnimatedPosition = useSharedValue(0);
    const chatAnimatedIndex = useSharedValue(0);
    const editPickupAttempts = useAppSelector(state => selectEditPickupAttempts(state, rideId));
    const editLocationAttempts = useAppSelector(state => selectEditLocationAttempts(state, rideId));
    const insuranceData = useAppSelector(state => selectInsuranceData(state, rideId));
    const bookedSource = useAppSelector(state => selectBookedSourceWithId(state, bookingId));
    const bookedStops = useAppSelector(state => selectBookedStopsWithId(state, bookingId));
    const initialDriverETA = useAppSelector(state => selectInitialDriverETAWithId(state, rideId));
    const initialPickupDistance = useAppSelector(state => selectInitialPickupDistanceWithId(state, rideId));
    const ticketUIProps = useTicketUIProps(multimodalProps?.journeyId ?? null, 'bottomSheetModal');
    const previousTravelMode = multimodalProps?.previousLegOrderTravelMode;
    const previousTravelModeStatusConfirmed = multimodalProps?.previousLegOrderTravelModeStatusConfirmed;

    const sosStatus = useAppSelector(selectSosStage);
    const followers = useAppSelector(selectFollowers);
    const waypoints = bookedStops
        .slice(0, -1)
        .map(stop => `${stop.lat},${stop.lng}`)
        .join('|');

    const stage = useRideStatus(rideDetails, bookingDetails, stops, stopInfo);

    const dontShowShimmer = bookingDetails && (rideDetails || otpCode);
    const dispatch = useAppDispatch();
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues('rideConfirmed');
    const isScreenFocused = useIsFocused();
    const [isManualMapControl, setIsManualMapControl] = useState(false);
    const mapIsMoved = useAppSelector(state => selectMapIsMoved(state, 'MapAfterRide'));
    const currentRegion = useAppSelector(state => selectCurrentRegion(state, 'MapAfterRide'));

    useEffect(() => {
        if ((mapIsMoved || currentRegion.isGesture) && isScreenFocused) {
            setIsManualMapControl(true);
        }
    }, [mapIsMoved, currentRegion.isGesture, isScreenFocused]);

    const handleRecenter = useCallback(() => {
        setIsManualMapControl(false);
        mapRef.current?.fitToMapElements({ duration: 500 });
    }, []);

    const driverLocation = useRideTracking({
        source,
        destination,
        stops: stops.filter((_, index) => index >= (stopInfo?.status ?? 0) + (stopInfo?.stop ?? 0)),
        bookingId: bookingId,
        rideId: rideId,
        animatedPosition: isBottomSheetChatOpen ? chatAnimatedPosition : sheetAnimatedPosition,
        showEditIcon:
            rideDetails?.status === 'NEW' &&
            editPickupAttempts < 3 &&
            (bookingDetails?.bookingDetails.TAG === 'RENTAL' ||
                bookingDetails?.bookingDetails.TAG === 'INTER_CITY' ||
                bookingDetails?.bookingDetails.TAG === 'DRIVER_OFFER' ||
                bookingDetails?.bookingDetails.TAG === 'ONE_WAY'),
        onDestClick: onEditPickupClick,
        showChatBar,
        isScreenFocused,
        isAutoRecenterEnabled: !isManualMapControl,
    });

    const { animatedStyle, handlers } = useScaleAnimation();
    const recenterButtonAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateY: sheetAnimatedPosition.value - 52,
            },
        ],
    }));

    const AnimatedPressable = Animated.createAnimatedComponent(RNPressable);

    const onEditAddStopClick = () => {
        genericSearchModalRef?.current?.present();
    };

    const onNudgePress = useCallback(() => {
        navigation.navigate(
            'ProfileTab',
            {
                screen: 'safetyScreen',
                params: {
                    safetyStageId: 'trustedContacts',
                },
            },
            { pop: true },
        );
    }, [navigation]);

    const [showCancellationReasonModal, setShowCancellationReasonModal] = useState(false);
    // eslint-disable-next-line unused-imports/no-unused-vars
    const [showTripDetailsModal, setShowTripDetailsModal] = useState(false);
    const [showCancelRideModal, setShowCancelRideModal] = useState(false);
    const [showCancellationChargesModal, setShowCancellationChargesModal] = useState(false);
    const [showWaitTimerModal, setShowWaitTimerModal] = useState(false);
    const isSoftCancelSuccessful = useAppSelector(state => selectIsSoftCancelSuccessful(state, rideId));
    const [rideBookingRideBookingIdSoftCancelPost] = useRideBookingRideBookingIdSoftCancelPostMutation();
    const [fetchBookingDetails] = useGetBookingDetailsMutation();
    const rentalCardState = (status: RideStatus_rideStatus | undefined): 'yetToStart' | 'inProgress' | 'ended' => {
        switch (status) {
            case 'INPROGRESS':
                return 'inProgress';
            case 'COMPLETED':
                return 'ended';
            case 'NEW':
                return 'yetToStart';
            default:
                return 'yetToStart';
        }
    };

    const postRideStartFragment =
        rideDetails && rideDetails?.status !== 'NEW' && featureFlags.postRideStartFragment ? true : false;

    const exophone = formatPhone(bookingDetails?.merchantExoPhone);
    const multiChatAnimatedPosition = useSharedValue(0);

    // Update elapsed time every second for rental rides
    useEffect(() => {
        if (bookingDetails?.bookingDetails?.TAG === 'RENTAL') {
            const updateElapsedTime = () => {
                if (rideDetails?.status === 'INPROGRESS' && rideDetails?.rideStartTime) {
                    const newElapsedTime = calculateTimeDifference(rideDetails.rideStartTime);
                    if (newElapsedTime > 0) {
                        setElapsedTime(newElapsedTime);
                    } else {
                        setElapsedTime(0);
                    }
                } else {
                    // If ride hasn't started or no start time, keep at 0
                    setElapsedTime(0);
                }
            };
            updateElapsedTime();

            // Using ride status to determine if timer should run
            if (rideDetails?.status === 'INPROGRESS') {
                const interval = setInterval(updateElapsedTime, 1000);
                return () => clearInterval(interval);
            }

            return () => {};
        } else {
            setElapsedTime(0);
            return () => {};
        }
    }, [rideDetails?.status, rideDetails?.rideStartTime, bookingDetails?.bookingDetails?.TAG]);

    useEffect(() => {
        if (
            ['FOLLOW_RIDE', 'SHARE_RIDE', 'SOS_RESOLVED'].includes(notificationData.notification_type) ||
            user?.followsRide
        ) {
            followRide({});
        }
    }, [notificationData.notification_type, user?.followsRide]);

    useEffect(() => {
        const notificationBookingId = notificationData.entity_ids;
        switch (notificationData.notification_type) {
            case 'REALLOCATE_PRODUCT':
                rcsDispatch(createAction('ON_REALLOCATION', undefined));
                break;
            case 'CANCELLED_PRODUCT':
                if (notificationBookingId === bookingId) {
                    rcsDispatch(createAction('ON_RIDE_CANCELLED', undefined));
                }
                break;
            default:
                break;
        }
        setNotificationData(defaultPayloadData);
    }, [notificationData.notification_type]);

    useEffect(() => {
        logEvent(EventName.NY_RIDE_ASSIGNED_SCREEN);
        events.markFirstScreenRender(EventType.ON_CREATE_TO_RIDE);
        if (!currentLocation || !currentLocation.lat || !currentLocation.lng) {
            fetchLocationAndAnimateCamera();
        } else {
            mapRef.current?.animateCamera({
                lat: currentLocation.lat,
                lon: currentLocation.lng,
                zoom: 18,
                duration: 500,
            });
        }
        return () => {
            // Dismiss modals if they are still open when the component unmounts
            bottomSheetTopBannerRef.current = false;
            cancelRideBottomsheetRideConfirmedModalRef?.current?.dismiss();
            // cancellationReasonBottomsheetModalRef?.current?.dismiss();
            rideSafetyModalRef?.current?.dismiss();
            multiChatRef.current?.dismiss();
            callDriverBottomsheetModalRef?.current?.dismiss();
            rideConfirmedChatBottomsheetRef?.current?.close();
            logoutModalRef.current?.dismiss();
            followRideModalRef.current?.dismiss();
            liveSharingRef.current?.dismiss();
            genericSearchModalRef.current?.dismiss();
            trustedContactsBottomSheetModalRef.current?.dismiss();
            tripDetailsRef.current?.dismiss();
            disabilityPopUp.current?.dismiss();
            setShowTripDetailsModal(false);
            setShowCancellationReasonModal(false);
            setShowCancelRideModal(false);
            setShowCancellationChargesModal(false);
        };
    }, []);

    const onBottomSheetTopBannerPress = useCallback((_type: BottomSheetTopBannerType | undefined) => {
        if (
            _type === BottomSheetTopBannerType.Blind ||
            _type === BottomSheetTopBannerType.Deaf ||
            _type === BottomSheetTopBannerType.Locomotor ||
            _type === BottomSheetTopBannerType.OtherDisability
        ) {
            disabilityPopUp.current?.present();
        }
    }, []);

    const handleDisabilityPopUp = async (): Promise<void> => {
        if (disabilityPopUp.current) {
            await disabilityPopUp.current.close(); // Ensure this is awaited
        }
    };

    const ref = useRef(null);
    const driverArrivedEventFired = useRef(false);
    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions(
            postRideStartFragment ? 'Ride Assigned Screen' : 'Ride Started Screen',
            {
                queue: true,
            },
        );
        setFocus(ref);
    }, []);

    useEffect(() => {
        bottomSheetTopBannerRef.current = !postRideStartFragment;
    }, [postRideStartFragment]);

    useEffect(() => {
        if (rideDetails?.driverArrivalTime && bookingDetails?.createdAt && !driverArrivedEventFired.current) {
            const createdAtMs = new Date(bookingDetails.createdAt).getTime();
            const arrivedAtMs = new Date(rideDetails.driverArrivalTime).getTime();
            const actualArrivalTimeInMinutes = Math.round((arrivedAtMs - createdAtMs) / (1000 * 60));

            logEvent(EventName.NY_USER_DRIVER_ARRIVED, {
                PickupETA: initialDriverETA,
                PickupDistance: initialPickupDistance,
                ActualArrivalTime: actualArrivalTimeInMinutes,
                RideId: rideId,
                VehicleVariant: rideDetails?.vehicleVariant,
            });
            driverArrivedEventFired.current = true; // Mark event as fired to ensure it only fires once per ride
        }
    }, [rideDetails?.driverArrivalTime, bookingDetails?.createdAt, initialDriverETA]);

    const isPetRide = useAppSelector(state => selectIsPetRide(state, null));

    const bannerType = useMemo(() => {
        if (sosStatus === 'Activated') {
            return BottomSheetTopBannerType.RideConfirmedSosOn;
        }

        // Check for disability first (highest priority)
        const disabilityBanner = getRideConfirmedBottomSheetTopBannerType(
            bookingDetails?.hasDisability,
            bookingSpecialAssistance,
            isPetRide || bookingDetails?.isPetRide,
        );

        // If disability banner is available and not "off", return it
        if (disabilityBanner !== undefined && disabilityBanner !== BottomSheetTopBannerType.SpecialAssistanceOff) {
            return disabilityBanner;
        }

        // Return undefined if no banner should be shown
        return undefined;
    }, [
        bookingDetails?.hasDisability,
        profile?.hasDisability,
        bookingSpecialAssistance,
        sosStatus,
        bookingDetails?.sosStatus,
        isPetRide,
        bookingDetails?.isPetRide,
    ]);
    const renderCustomHandle = useCallback(
        (props: BottomSheetHandleProps) => {
            if (bottomSheetTopBannerRef.current !== !postRideStartFragment) {
                bottomSheetTopBannerRef.current = !postRideStartFragment;
            }
            return (
                <BottomSheetTopBanner
                    hideAccessibility={hideAccessibility}
                    {...props}
                    onBannerPress={sosStatus !== 'Activated' ? onBottomSheetTopBannerPress : () => {}}
                    bannerType={bannerType}
                    showHandle={!postRideStartFragment}
                    showInfo={sosStatus !== 'Activated'}
                    handlerBGColor={themeColors.Fill_neutralUltraLow}
                />
            );
        },
        [hideAccessibility, bannerType, postRideStartFragment, isChatOpen, sosStatus, bookingDetails?.sosStatus],
    );

    const animatedButtonsOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(sheetAnimatedIndex.value, [1.7, 2], [1, 0]);
        return isBottomSheetChatOpen
            ? {
                  opacity: interpolate(chatAnimatedPosition.value, [SCREEN_HEIGHT / 5, SCREEN_HEIGHT / 2.5], [0, 1]),
                  zIndex: interpolate(
                      chatAnimatedPosition.value,
                      [SCREEN_HEIGHT / 5, SCREEN_HEIGHT / 2.5],
                      [-9999, 999],
                  ),
              }
            : { opacity };
    });

    const onSafetyBtnClick = useCallback(() => {
        rcsDispatch(createAction('SAFETY_BTN_CLICKED', undefined));
    }, [rcsDispatch]);

    const isInProgress = rideDetails?.status === 'INPROGRESS';
    const safetyBtnBgColor = isInProgress ? '#ff6f00' : '#ffffff';
    const safetyIconColor = isInProgress ? '#ffffff' : '#ff6f00';
    const safetyTextColor = isInProgress ? themeColors.Icon_neutralMin : themeColors.Icon_neutralMax;
    const instructions = getPickupInstructions(
        bookedSource,
        bookingDetails?.specialLocationName,
        bookingDetails?.fromLocation.title,
    );
    const handleWalkingDirectionsPress = () => {
        const url = getGoogleMapsURL(bookedSource, undefined, undefined);

        if (instructions.length > 0) {
            navigation.navigate(
                'LiveTab',
                {
                    screen: 'pickupInstructions',
                    params: {
                        instructions: instructions,
                        openMapsUri: url,
                    },
                },
                { pop: true },
            );
        }
    };

    const Buttons = useMemo(
        () => ({
            prefix: (
                <ExitButton
                    onPressExit={() => {
                        rcsDispatch(createAction('MULTIMODAL_EXIT_CLICKED', undefined));
                    }}
                />
            ),
            suffix: [
                rideDetails?.status === 'INPROGRESS' ? (
                    <Button
                        testID="ride_confirmed_open_maps"
                        key="maps"
                        size="md"
                        type="secondary"
                        accessible={true}
                        accessibilityRole="button"
                        onPress={async () => {
                            logEvent(EventName.NY_USER_RIDE_TRACK_GMAPS);
                            await openGoogleMapsNavigation(bookedStops[bookedStops.length - 1], waypoints, 'driving');
                        }}
                        style={[{ paddingVertical: 0, borderRadius: 20, borderWidth: 0 }, styles.buttonShadow]}>
                        <Animated.View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <GoogleNavigation fill={undefined} />
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[#004FB6] pl-1`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityRole={undefined}
                                accessibilityLabel={undefined}>
                                {userLanguageStrings.Maps}
                            </Typography>
                        </Animated.View>
                    </Button>
                ) : null,

                bookingDetails?.specialLocationTag !== '' &&
                instructions.length > 0 &&
                isStageNotInGroup(stage, [
                    RideStatus.RIDE_STARTED,
                    RideStatus.BRIDGE_TO_DESTINATION,
                    RideStatus.RENTAL,
                    RideStatus.INTER_CITY,
                ]) ? (
                    <Button
                        testID="ride_confirmed_walking_directions"
                        key="safety"
                        size="md"
                        type="secondary"
                        accessible={true}
                        accessibilityRole="button"
                        style={[
                            { paddingVertical: 0, borderRadius: 20, borderWidth: 0, marginRight: 10 },
                            styles.buttonShadow,
                        ]}
                        onPress={handleWalkingDirectionsPress}>
                        <LottieWithFallback
                            renderMode="AUTOMATIC"
                            autoPlay={true}
                            style={{ width: 20, height: 20 }}
                            loop={true}
                            source={require('@/typescript/assets/ny-service/mt_ic_walk_animation.lottie')}
                            fallback={undefined}
                        />
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${safetyTextColor}] pl-1`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityRole={undefined}
                            accessibilityLabel={undefined}>
                            {userLanguageStrings.Pickup}
                        </Typography>
                    </Button>
                ) : null,

                multimodalProps &&
                previousTravelMode === 'Metro' &&
                previousTravelModeStatusConfirmed &&
                (rideDetails?.status === 'UPCOMING' || rideDetails?.status === 'NEW') ? (
                    <Button
                        testID="ride_confirmed_multimodal_exit"
                        key="multimodal_exit"
                        size="md"
                        type="secondary"
                        accessible={true}
                        accessibilityRole="button"
                        onPress={() => {
                            rcsDispatch(createAction('TICKET_BUTTON_CLICKED', undefined));
                        }}>
                        <Animated.View>
                            <Icon icon={<TicketIcon fill={'#000'} />} size={19} color={'#000'} />
                        </Animated.View>
                        <Typography
                            type="body-1"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityRole={undefined}
                            accessibilityLabel={undefined}
                            style={undefined}>
                            Tickets
                        </Typography>
                    </Button>
                ) : null,

                <Button
                    testID="ride_confirmed_safety"
                    key="safety"
                    size="md"
                    type="secondary"
                    accessible={true}
                    accessibilityRole="button"
                    bgColor={safetyBtnBgColor}
                    style={[{ paddingVertical: 0, borderRadius: 20, borderWidth: 0 }, styles.buttonShadow]}
                    onPress={onSafetyBtnClick}>
                    <Animated.View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                        <ShieldPlus size={22} fill={safetyIconColor} stroke={safetyBtnBgColor} />
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${safetyTextColor}] pl-1`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityRole={undefined}
                            accessibilityLabel={undefined}>
                            {sosStatus !== 'Activated' ? userLanguageStrings.Safety : 'SOS: On'}
                        </Typography>
                    </Animated.View>
                </Button>,
            ],
        }),
        [
            safetyBtnBgColor,
            safetyIconColor,
            safetyTextColor,
            userLanguageStrings.Maps,
            userLanguageStrings.Safety,
            userLanguageStrings.Pickup,
            onSafetyBtnClick,
            handleWalkingDirectionsPress,
            multimodalProps,
            rideDetails?.status,
        ],
    );

    const rideChecks = useAppSelector(state =>
        bookingId ? selectRideChecksWithBookingId(state, bookingId) : undefined,
    );

    const operatingCity = useAppSelector(selectOperatingCity);
    const bannerPopUpsConfig = useAppSelector(selectBannerPopusConfig);
    const appConfig = useAppSelector(selectAppConfig);
    const hasCustomerCallOptionBeenClicked = useAppSelector(state =>
        bookingId && rideId ? selectCustomerCallOptionClicked(state, bookingId, rideId) : false,
    );
    const hasExtraFareBannerBeenShown = useAppSelector(state =>
        bookingId && rideId ? selectExtraFareBannerShown(state, bookingId, rideId) : false,
    );
    const hasExtraFareConfirmationBeenResponded = useAppSelector(state =>
        bookingId && rideId ? selectExtraFareConfirmationResponded(state, bookingId, rideId) : false,
    );
    const hasAcBannerBeenShown = useAppSelector(state =>
        bookingId && rideId ? selectAcBannerShown(state, bookingId, rideId) : false,
    );
    const hasAcConfirmationBeenResponded = useAppSelector(state =>
        bookingId && rideId ? selectAcConfirmationResponded(state, bookingId, rideId) : false,
    );
    const extraFareFirstBannerResponse = useAppSelector(state =>
        bookingId && rideId ? selectExtraFareFirstBannerResponse(state, bookingId, rideId) : null,
    );
    const acFirstBannerResponse = useAppSelector(state =>
        bookingId && rideId ? selectAcFirstBannerResponse(state, bookingId, rideId) : null,
    );

    const computedBannerConfig = useMemo(() => {
        const config = getRideChecksBannerConfig(
            rideChecks,
            rideDetails,
            operatingCity,
            bannerPopUpsConfig,
            hasCustomerCallOptionBeenClicked,
            hasExtraFareBannerBeenShown,
            userLanguageStrings,
            hasExtraFareConfirmationBeenResponded,
            hasAcBannerBeenShown,
            hasAcConfirmationBeenResponded,
            extraFareFirstBannerResponse,
            acFirstBannerResponse,
        );
        return config;
    }, [
        rideChecks,
        rideDetails,
        operatingCity,
        bannerPopUpsConfig,
        hasCustomerCallOptionBeenClicked,
        hasExtraFareBannerBeenShown,
        userLanguageStrings,
        hasExtraFareConfirmationBeenResponded,
        hasAcBannerBeenShown,
        hasAcConfirmationBeenResponded,
        extraFareFirstBannerResponse,
        acFirstBannerResponse,
    ]);

    const bannerRegistry = useMemo(
        () => createBannerRegistry(userLanguageStrings, appConfig.textConfig.appReadableName),
        [userLanguageStrings, appConfig.textConfig.appReadableName],
    );

    const activeBannerRef = useRef<BannerConfig | null>(null);
    const selectedBannerConfig = useMemo(() => {
        if (computedBannerConfig && !activeBannerRef.current) {
            activeBannerRef.current = computedBannerConfig;
            return computedBannerConfig;
        }
        if (activeBannerRef.current) {
            const currentBannerId = activeBannerRef.current.bannerId;
            const newBannerId = computedBannerConfig?.bannerId;
            const isExtraFareAcknowledged = rideChecks?.driverDemandExtra === RideChecksType.Acknowledged;
            const isExtraFareBanner =
                currentBannerId === 'driverDemandExtraBanner' ||
                currentBannerId === 'driverDemandExtraConfirmationBanner' ||
                currentBannerId === 'sorryActionBannerExtraFare' ||
                currentBannerId === 'thankyouRideBannerExtraFare';
            if (
                isExtraFareAcknowledged &&
                isExtraFareBanner &&
                computedBannerConfig &&
                newBannerId !== currentBannerId
            ) {
                activeBannerRef.current = computedBannerConfig;
                return computedBannerConfig;
            }

            const storedBannerId = activeBannerRef.current.bannerId;
            if (storedBannerId) {
                const isValidBannerId = (id: string): id is ValidBannerId => {
                    return id in bannerRegistry;
                };
                if (isValidBannerId(storedBannerId)) {
                    const freshConfig = bannerRegistry[storedBannerId];
                    const enrichedConfig: BannerConfig = {
                        ...freshConfig,
                        parentBannerId: activeBannerRef.current.parentBannerId,
                    };
                    activeBannerRef.current = enrichedConfig;
                    return enrichedConfig;
                }
            }
            return activeBannerRef.current;
        }
        return computedBannerConfig;
    }, [computedBannerConfig, userLanguageStrings, bannerRegistry, rideChecks?.driverDemandExtra]);

    const handleGenericBannerDismiss = (type: RideChecksType) => {
        if (bookingId && bookingDetails && rideChecks) {
            const updatedRideChecks = handleRideChecksBannerPopup(bookingDetails, rideChecks, type);
            dispatch(
                setRideChecks({
                    id: bookingId,
                    payload: updatedRideChecks,
                }),
            );

            if (type === RideChecksType.DriverDemandExtra && bookingId && rideId) {
                dispatch(
                    setExtraFareBannerShown({
                        bookingId: bookingId,
                        rideId: rideId,
                        payload: true,
                    }),
                );
            }
        }
    };

    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: chatAnimatedPosition.value - 70,
                },
            ],
        };
    });

    const onCloseChat = useCallback(() => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        Keyboard.dismiss();
        setIsBottomSheetChatOpen(false);
        rideConfirmedBottomsheetModalRef?.current?.snapToIndex(0);
        rideConfirmedChatBottomsheetRef?.current?.close();
    }, [setIsBottomSheetChatOpen, rideConfirmedBottomsheetModalRef, rideConfirmedChatBottomsheetRef]);

    const fetchLocationAndAnimateCamera = useCallback(async () => {
        const location = await getCurrentLocation();
        if (location) {
            mapRef.current?.animateCamera({
                lat: location?.coords?.latitude,
                lon: location?.coords?.longitude,
                zoom: 18,
                duration: 500,
            });
        }
        if (location) {
            const currentLocation: location = {
                lat: location.coords.latitude,
                lng: location.coords.longitude,
                placeId: undefined,
                title: undefined,
                subtitle: undefined,
                formattedAddress: undefined,
                tag: 'AUTOCOMPLETE',
                addressComponents: undefined,
                serviceable: true,
                hotSpotInfo: undefined,
                serviceabilityCity: undefined,
                specialLocation: undefined,
                locationType: undefined,
                distanceFromCurrentLocation: undefined,
            };
            dispatch(setCurrentLocation(currentLocation));
        }
    }, []);

    useEffect(() => {
        const filteredStops = stops.filter(stop => stop);
        mapRef.current?.setCurrentLocationMarkerVisibility(
            (stage === RideStatus.RENTAL && filteredStops.length === 0) ||
                !(stage === RideStatus.RIDE_STARTED || stage === RideStatus.BRIDGE_TO_DESTINATION),
        );
        if (stage === RideStatus.CAB_HAS_ARRIVED) {
            rideConfirmedBottomsheetModalRef.current?.snapToIndex(1);
        }
    }, [stage]);

    useEffect(() => {
        if (multimodalProps) {
            const { journeyId, currentLegOrder } = multimodalProps;
            switch (stage) {
                case RideStatus.OTP_RIDE_ASSIGNED:
                case RideStatus.YOUR_RIDE_IS_ASSIGNED:
                    PopupDismissalTracker.dismiss(`${journeyId}-${currentLegOrder}-driver-assigned-AutoAndCabStatus`);
                    break;
                case RideStatus.CAB_HAS_ARRIVED:
                    PopupDismissalTracker.dismiss(`${journeyId}-${currentLegOrder}-driver-arrived-AutoAndCabStatus`);
                    break;
            }
        }
    }, [stage, multimodalProps]);

    const messageCount = useMemo(() => messageCountLogic(), [messageCountLogic]);

    const handleChatBarPress = useCallback(() => {
        setShowChatBar(false);
        setIsBottomSheetChatOpen(true);
        rideConfirmedBottomsheetModalRef.current?.close();
    }, [setShowChatBar, setIsBottomSheetChatOpen, rideConfirmedBottomsheetModalRef]);

    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const renderBackdropComponent = (props: BottomSheetBackdropProps) => {
        if (isKeyboardVisible)
            return (
                <BottomSheetBackdrop
                    {...props}
                    sheetRef={rideConfirmedChatBottomsheetRef}
                    showBackdrop={undefined}
                    onHardwareBackPress={() => {
                        setIsBottomSheetChatOpen(false);
                        rideConfirmedBottomsheetModalRef?.current?.snapToIndex(0);
                    }}
                />
            );
        return undefined;
    };

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            },
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            },
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    useEffect(() => {
        if (sosStatus != 'Activating' && (!bookingDetails?.sosStatus || bookingDetails?.sosStatus === 'Resolved'))
            dispatch(setsosStage('DeActivated'));
        else if (bookingDetails?.sosStatus === 'Pending') dispatch(setsosStage('Activated'));
    }, [bookingDetails?.sosStatus]);

    // Memoize the FloatingChatBar props to prevent re-renders
    const floatingChatBarProps = useMemo(
        () => ({
            onPress: handleChatBarPress,
            sheetAnimatedIndex: animatedIndex,
            sheetAnimatedPosition: sheetAnimatedPosition,
            rideId,
            isDriver: currentChatSessionId === bookingId,
            driverImage: rideDetails?.driverImage,
            messageCount,
            showChatBar,
            setShowChatBar,
        }),
        [
            handleChatBarPress,
            animatedIndex,
            sheetAnimatedPosition,
            rideId,
            currentChatSessionId,
            bookingId,
            rideDetails?.driverImage,
            messageCount,
            showChatBar,
            setShowChatBar,
        ],
    );

    const bannerStyleRideAssigned = useMemo(() => ({ marginHorizontal: 15, marginTop: 5, marginBottom: 10 }), []);
    const bannerStyleRideStarted = useMemo(() => ({ marginHorizontal: 1, marginTop: 1, marginBottom: 10 }), []);

    const renderChainedBanner = useMemo(() => {
        if (!selectedBannerConfig) return null;

        return (
            <ChainedBanner
                key={`banner-${selectedBannerConfig.bannerId}`}
                initialConfig={selectedBannerConfig}
                style={rideDetails?.status === 'INPROGRESS' ? bannerStyleRideStarted : bannerStyleRideAssigned}
                onAllDismissed={() => {
                    const rideCheckType = bannerIdToRideChecksTypeMap[selectedBannerConfig.bannerId];
                    activeBannerRef.current = null;
                    if (rideCheckType) {
                        handleGenericBannerDismiss(rideCheckType);
                    }
                }}
                rideId={rideId}
                bookingId={bookingId}
            />
        );
    }, [selectedBannerConfig, rideDetails?.status, bannerStyleRideAssigned, bannerStyleRideStarted, rideId, bookingId]);

    const platformIOS = Platform.OS === 'ios';
    // Delayed rendering states
    const shouldRenderModals = useDelayedRender(platformIOS ? 100 : 3000);
    const shouldRenderFloatingRideStatus = useDelayedRender(platformIOS ? 500 : 5000);
    const shouldRenderFloatingHeader = useDelayedRender(platformIOS ? 200 : 2000);
    const shouldRenderFloatingMenu = useDelayedRender(platformIOS ? 400 : 4000);

    const handleCallClick = useCallback(() => {
        if (setHideAccessibility) {
            setHideAccessibility(true);
        }
        rcsDispatch(createAction('CALL_CLICKED', undefined));
    }, [rcsDispatch, setHideAccessibility]);

    const handleCancelTripPress = useCallback(async () => {
        logEvent(EventName.NY_USER_CANCEL_TRIP_CLICKED, {
            RideId: rideId,
            VehicleVariant: rideDetails?.vehicleVariant,
        });

        const fee = rideDetails?.cancellationFeeIfCancelled;
        if (!newFeatureFlags.customerCancellationConfig.enableCancellationCharges) {
            setShowCancelRideModal(true);
            return;
        }
        if (!isUndefined(fee) && fee > 0) {
            setShowCancellationChargesModal(true);
            return;
        }
        if ((!isSoftCancelSuccessful || isUndefined(fee)) && bookingDetails) {
            try {
                await rideBookingRideBookingIdSoftCancelPost({
                    rideBookingId: bookingDetails.id,
                }).unwrap();
                dispatch(setIsSoftCancelSuccessful({ id: rideId, payload: true }));
                const bookingResponse = await fetchBookingDetails(bookingId).unwrap();
                const updatedRideDetails = bookingResponse._0?.rideList?.[0];
                const updatedFee = updatedRideDetails?.cancellationFeeIfCancelled;

                if (!isUndefined(updatedFee) && updatedFee > 0) {
                    setShowCancellationChargesModal(true);
                } else {
                    setShowCancelRideModal(true);
                }
            } catch (error) {
                console.error('Error during soft cancel and refetch:', error);
                setShowCancelRideModal(true);
            }
        } else {
            setShowCancelRideModal(true);
        }
    }, [
        bookingId,
        rideDetails,
        isSoftCancelSuccessful,
        bookingDetails,
        newFeatureFlags.customerCancellationConfig.enableCancellationCharges,
    ]);

    const { message: driverHighlightMessage, conditionType: driverHighlightConditionType } = useDriverHighlightMessage(
        rideId,
        bookingId,
        rideDetails?.driverRatings,
    );

    const cityBaseAdImageConfig = useAppSelector(state => selectCityConfig(state, 'city_base_ad_image'));

    const { top } = useSafeAreaInsets();

    const bottomSheetSnapPoints = useMemo(() => {
        if (
            screenReaderEnabled ||
            (bookingDetails?.hasDisability && bookingSpecialAssistance?.tag === 'BLIND_LOW_VISION')
        ) {
            return ['85%', '85%', '85%'];
        }

        const initialSnapPoint = driverHighlightMessage ? (Platform.OS === 'ios' ? 43 : 45) : 40;

        // Original snap points calculation
        const originalFirstSnapPoint =
            (initialSnapPoint + (bookingDetails?.isInsured && newFeatureFlags.showInsurancePolicy ? 5 : 0)).toString() +
            '%';
        const originalSnapPoints = [
            originalFirstSnapPoint,
            Platform.OS === 'ios' ? Math.min(SCREEN_HEIGHT * 0.67, 580) : Math.min(SCREEN_HEIGHT * 0.66, 580),
            SCREEN_HEIGHT - top - 50 - (Platform.OS === 'ios' ? 0 : 10),
        ];

        return originalSnapPoints;
    }, [
        screenReaderEnabled,
        bookingSpecialAssistance?.tag,
        cityBaseAdImageConfig?.enabled,
        bookingDetails?.isInsured,
        bookingDetails?.hasDisability,
    ]);

    return (
        <>
            {isBottomSheetChatOpen ? (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[
                        tailwind.style(' flex-row justify-center absolute self-center'),
                        floatingHeaderStyle,
                        { zIndex: 999999 },
                    ]}>
                    <AnimatedPressable testID="close-chat-button" onPress={onCloseChat} {...handlers}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    'flex-row items-center justify-center rounded-[32px] w-[54px] h-[48px] bg-[#47454A]',
                                ),
                                {
                                    shadowColor: '#000000',
                                    shadowOffset: { width: 0, height: 2 },
                                    shadowOpacity: 0.2,
                                    shadowRadius: 11,
                                    elevation: 5, // For Android shadow
                                    padding: 20,
                                    margin: 10,
                                },
                                animatedStyle,
                            ]}>
                            <CloseIcon color="white" height={24} width={24} />
                        </Animated.View>
                    </AnimatedPressable>
                </Animated.View>
            ) : null}

            {!isBottomSheetChatOpen && showChatBar && <MemoizedFloatingChatBar {...floatingChatBarProps} />}

            {!isBottomSheetChatOpen &&
            stage !== RideStatus.RIDE_STARTED &&
            stage !== RideStatus.BRIDGE_TO_DESTINATION &&
            stage !== RideStatus.WAY_TO_STOP &&
            shouldRenderFloatingMenu ? (
                <Animated.View
                    entering={FadeIn.delay(200)}
                    exiting={FadeOut}
                    style={{
                        width: '100%',
                        position: 'absolute',
                        bottom: 0,
                        justifyContent: 'flex-end',
                        zIndex: 50,
                    }}>
                    <FloatingMenu
                        handleCancelAutoSendMessage={() => {
                            setIsBottomSheetChatOpen(true);
                            rideConfirmedBottomsheetModalRef.current?.close();
                            rideConfirmedChatBottomsheetRef?.current?.expand();
                        }}
                        handleOnPressCall={() => {
                            hapticEffect(HapticFeedbackTypes.selection, undefined);
                            handleCallClick();
                        }}
                        handleOnPressShare={() => {
                            hapticEffect(HapticFeedbackTypes.selection, undefined);
                            liveSharingRef.current?.present();
                        }}
                        handleOnPressChat={() => {
                            hapticEffect(HapticFeedbackTypes.selection, undefined);
                            setIsBottomSheetChatOpen(true);
                            setShowChatBar(false);
                            rideConfirmedBottomsheetModalRef.current?.close();
                        }}
                        handleAutoSendMessage={() => {}}
                        newMessageReceived={messageCount !== 0}
                        quickReplyMessage={''}
                        enableAutoSendMessage={shouldEnableAutoSendMessage}
                        handleOnDirectionsPress={() => {
                            hapticEffect(HapticFeedbackTypes.selection, undefined);
                            rcsDispatch(createAction('PICKUP_DIRECTIONS_BTN_CLICKED', undefined));
                        }}
                        stage={stage}
                        rideId={rideId}
                    />
                </Animated.View>
            ) : null}

            {shouldRenderFloatingHeader && (
                <FloatingHeader
                    animatedStyle={animatedButtonsOpacity}
                    prefixButton={Buttons.prefix}
                    suffixButtons={Buttons.suffix}
                    buttonZindex={999998}
                />
            )}

            {shouldRenderFloatingRideStatus && (
                <Animated.View pointerEvents={'none'} entering={FadeIn.delay(150)}>
                    <FloatingRideStatus
                        verticalPosition={73}
                        status={'DriverArrived'}
                        bookingId={bookingId}
                        sheetAnimatedPosition={sheetAnimatedPosition}
                    />
                </Animated.View>
            )}

            {isManualMapControl && (
                <Animated.View
                    entering={FadeIn}
                    exiting={FadeOut}
                    style={[tailwind.style('absolute w-full items-end pr-4'), recenterButtonAnimatedStyle]}>
                    <Button
                        testID="ride_confirmed_recenter_sticky"
                        size="md"
                        type="secondary"
                        accessible={true}
                        accessibilityRole="button"
                        style={[{ paddingVertical: 0, borderRadius: 20, borderWidth: 0 }, styles.buttonShadow]}
                        onPress={handleRecenter}>
                        <Animated.View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                            <RecenterIcon fill={'#004FB6'} />
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[#004FB6] pl-1`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityRole={undefined}
                                accessibilityLabel={undefined}>
                                {'Recenter'}
                            </Typography>
                        </Animated.View>
                    </Button>
                </Animated.View>
            )}

            {showBottomSheet ? (
                <RideConfirmedBottomSheet
                    rideConfirmedBottomsheetModalRef={rideConfirmedBottomsheetModalRef}
                    sheetAnimatedPosition={sheetAnimatedPosition}
                    animatedIndex={sheetAnimatedIndex}
                    postRideStartFragment={postRideStartFragment}
                    isChatOpen={isChatOpen}
                    screenReaderEnabled={screenReaderEnabled}
                    chatSheetHeight={chatSheetHeight}
                    renderCustomHandle={renderCustomHandle}
                    bannerType={bannerType}
                    onSheetChange={(index: number, position: number) => {
                        rcsDispatch(
                            createAction('BTMSHEET_ON_CHANGE', {
                                index: index,
                                postion: position,
                            }),
                        );
                    }}
                    rcsDispatch={rcsDispatch}
                    snapPoints={bottomSheetSnapPoints}
                    initialIndex={1}
                    themeColors={{
                        neutralMidLow: colors?.recovered?.neutralMidLow,
                        Fill_neutralUltraLow: themeColors.Fill_neutralUltraLow,
                        white100: defaultColors?.white100,
                    }}>
                    {dontShowShimmer ? (
                        <View
                            accessibilityElementsHidden={hideAccessibility}
                            importantForAccessibility={hideAccessibility ? 'no-hide-descendants' : 'yes'}>
                            <ChatSection
                                currentChatSessionId={currentChatSessionId}
                                rideDetails={rideDetails}
                                rideId={rideId}
                                emergencyContacts={emergencyContacts}
                                featureFlags={featureFlags}
                                hideAccessibility={hideAccessibility}
                            />
                            {!isChatOpen ? (
                                <>
                                    <RideInfoSection
                                        bookingDetails={bookingDetails}
                                        rideDetails={rideDetails}
                                        otpCode={otpCode}
                                        destination={destination}
                                        estimatedDistance={estimatedDistance}
                                        rentalCardState={rentalCardState}
                                        elapsedTime={elapsedTime}
                                        rentaldiffTimer={rentaldiffTimer}
                                        onEditAddStopClick={onEditAddStopClick}
                                        rideId={rideId}
                                        bookingId={bookingId}
                                        setIsBottomSheetChatOpen={setIsBottomSheetChatOpen}
                                        emergencyContacts={emergencyContacts}
                                        onNudgePress={onNudgePress}
                                        userLanguageStrings={userLanguageStrings}
                                        popupBanner={
                                            selectedBannerConfig &&
                                            rideDetails?.status === 'INPROGRESS' &&
                                            renderChainedBanner
                                        }
                                        driverHighlightMessage={
                                            rideDetails?.status === 'NEW' && driverHighlightMessage ? (
                                                <DriverHighlightBanner
                                                    message={driverHighlightMessage}
                                                    conditionType={driverHighlightConditionType}
                                                />
                                            ) : null
                                        }
                                        stage={stage}
                                        bookedSource={bookedSource}
                                        navigation={navigation}
                                        followers={followers}
                                        currentLocation={currentLocation}
                                    />
                                    {selectedBannerConfig &&
                                        rideDetails?.status !== 'INPROGRESS' &&
                                        renderChainedBanner}
                                    {bookingDetails?.isInsured && newFeatureFlags.showInsurancePolicy && (
                                        <InsuranceBanner
                                            rideId={rideDetails?.id || ''}
                                            callApi={
                                                rideDetails?.status === 'INPROGRESS' &&
                                                !isUndefined(rideDetails.id) &&
                                                isNull(insuranceData)
                                            }
                                        />
                                    )}
                                    <RideDetailsSection
                                        bookingSpecialAssistance={bookingSpecialAssistance}
                                        stops={stops}
                                        source={source}
                                        bookingDetails={bookingDetails}
                                        rideDetails={rideDetails}
                                        editLocationAttempts={editLocationAttempts}
                                        editPickupAttempts={editPickupAttempts}
                                        rcsDispatch={rcsDispatch}
                                        driverLocation={driverLocation}
                                        tripDetailsRef={tripDetailsRef}
                                        setHideAccessibility={setHideAccessibility}
                                        callDriverBottomsheetModalRef={callDriverBottomsheetModalRef}
                                        setShowTripDetailsModal={setShowTripDetailsModal}
                                        onCancelTripPress={handleCancelTripPress}
                                    />
                                    {stage === RideStatus.BRIDGE_TO_DESTINATION || stage === RideStatus.RIDE_STARTED ? (
                                        <ShareTripCard
                                            onShare={() => {
                                                liveSharingRef.current?.present();
                                            }}
                                        />
                                    ) : null}
                                    {pledgeConfig.showPledge && pledgeText ? (
                                        <PledgeContent
                                            driverAnimation={true}
                                            pledgeText={pledgeText}
                                            isCab={isVehicleTypeCab(bookingDetails.vehicleServiceTierType)}
                                            isDriverProfile={false}
                                            driverName={''}
                                        />
                                    ) : (
                                        <Animated.View
                                            style={{
                                                paddingBottom:
                                                    Platform.OS === 'ios'
                                                        ? bookingDetails?.isInsured &&
                                                          newFeatureFlags.showInsurancePolicy
                                                            ? 90
                                                            : 80
                                                        : 60,
                                            }}
                                        />
                                    )}
                                </>
                            ) : (
                                <Animated.View style={tailwind.style(``)}></Animated.View>
                            )}
                            {!isBottomSheetChatOpen &&
                                stage !== RideStatus.RIDE_STARTED &&
                                stage !== RideStatus.BRIDGE_TO_DESTINATION &&
                                WINDOW_HEIGHT < 600 && <Animated.View style={{ paddingBottom: 100 }} />}
                        </View>
                    ) : (
                        <RideConfirmedShimmer />
                        // <Animated.Text>HelloWorldIdhr</Animated.Text>
                    )}
                </RideConfirmedBottomSheet>
            ) : null}
            {ticketUIProps ? <TicketUI {...ticketUIProps} /> : null}

            <PopUpModal
                sheetRef={rideInsuranceBottomSheetModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <InsuranceCard
                    rideAssigned={true}
                    policyGenerated={rideDetails?.status === 'INPROGRESS'}
                    policyDetails={insuranceData}
                    insuredAmount={bookingDetails?.insuredAmount || ''}
                />
            </PopUpModal>

            {shouldRenderModals && (
                <RideConfirmedModals
                    // Refs
                    cancellationReasonBottomsheetModalRef={cancellationReasonBottomsheetModalRef}
                    tripDetailsRef={tripDetailsRef}
                    genericSearchModalRef={genericSearchModalRef}
                    liveSharingRef={liveSharingRef}
                    rideSafetyModalRef={rideSafetyModalRef}
                    multiChatRef={multiChatRef}
                    logoutModalRef={logoutModalRef}
                    followRideModalRef={followRideModalRef}
                    disabilityPopUp={disabilityPopUp}
                    chatFooterTextRef={chatFooterTextRef}
                    callDriverBottomsheetModalRef={callDriverBottomsheetModalRef}
                    trustedContactsBottomSheetModalRef={trustedContactsBottomSheetModalRef}
                    // Data props
                    bookingId={bookingId}
                    rideId={rideId}
                    currentLocation={currentLocation}
                    stops={stops}
                    source={source}
                    onRideConfirmedCancel={onRideConfirmedCancel}
                    rideDetails={rideDetails}
                    driverLocation={driverLocation}
                    editLocationAttempts={editLocationAttempts}
                    editPickupAttempts={editPickupAttempts}
                    bookingDetails={bookingDetails}
                    rcsDispatch={rcsDispatch}
                    showDriver={
                        stage !== RideStatus.RIDE_STARTED &&
                        stage !== RideStatus.BRIDGE_TO_DESTINATION &&
                        stage !== RideStatus.WAY_TO_STOP
                    }
                    isDriver={isDriver}
                    setIsDriver={setIsDriver}
                    multiChatAnimatedPosition={multiChatAnimatedPosition}
                    setHideAccessibility={setHideAccessibility}
                    setIsBottomSheetChatOpen={setIsBottomSheetChatOpen}
                    handleDisabilityPopUp={handleDisabilityPopUp}
                    driverImage={rideDetails?.driverImage || appConfig.assets.driverDefaultProfileUri}
                    driverName={rideDetails?.driverName || ''}
                    navigation={navigation}
                    userLanguageStrings={userLanguageStrings}
                    //new modal props
                    showCancellationReasonModal={showCancellationReasonModal}
                    showCancelRideModal={showCancelRideModal}
                    showWaitTimerModal={showWaitTimerModal}
                    setShowCancellationReasonModal={setShowCancellationReasonModal}
                    setShowTripDetailsModal={setShowTripDetailsModal}
                    setShowCancelRideModal={setShowCancelRideModal}
                    setShowWaitTimerModal={setShowWaitTimerModal}
                    multimodalProps={multimodalProps}
                    showCancellationChargesModal={showCancellationChargesModal}
                    setShowCancellationChargesModal={setShowCancellationChargesModal}
                />
            )}
            {/* Only render the bottom sheet when it needs to be shown */}
            {isBottomSheetChatOpen && (
                <BottomSheet
                    handleIndicatorStyle={tailwind.style(`hidden`)}
                    handleStyle={tailwind.style(`h-[26px] bg-[${themeColors.Fill_neutralUltraLow}] rounded-t-[15px]`)}
                    // index={-1}
                    enableOverDrag={false}
                    animatedIndex={chatAnimatedIndex}
                    animatedPosition={chatAnimatedPosition}
                    enableDynamicSizing
                    keyboardBlurBehavior="restore"
                    snapPoints={undefined}
                    ref={rideConfirmedChatBottomsheetRef}
                    backdropComponent={renderBackdropComponent}
                    onClose={() => {
                        Keyboard.dismiss();
                        setIsBottomSheetChatOpen(false);
                    }}>
                    <BottomSheetView>
                        <CardChat
                            rideId={rideId}
                            merchantExoPhone={exophone}
                            rcsDispatch={rcsDispatch}
                            isChatOpen={isBottomSheetChatOpen}
                            bookingId={bookingDetails?.id}
                            isFollowRide={isFollowRide}
                            chatPartnerName={
                                currentChatSessionId !== bookingId
                                    ? (currentEmergencyContact?.name ?? '')
                                    : rideDetails?.status === 'INPROGRESS'
                                      ? userLanguageStrings.trustedContacts
                                      : rideDetails?.driverName || ''
                            }
                            setHideAccessibility={setHideAccessibility}
                            driverPhoneNumber={rideDetails?.driverNumber}
                        />
                    </BottomSheetView>
                </BottomSheet>
            )}
        </>
    );
};

// Create a memoized version of FloatingChatBar to prevent unnecessary re-renders
const MemoizedFloatingChatBar = memo(FloatingChatBar);

export default RideConfirmedFragment;
