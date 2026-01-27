import React, { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard } from 'react-native';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import CancellationReason from '@/typescript/screens/CancellationReason.tsx';
import GenericSearchModal from '@/typescript/components/common/GenericSearchModal.tsx';
import TripDetailsModal from '@/typescript/components/TripDetailsModal.tsx';
import LiveTrackingModal from '@/typescript/designSystem/components/LiveTrackingModal.tsx';
import SafetyModal, { RideChecksType } from '@/typescript/screens/SafetyModal.tsx';
import MultiChatSheet from '@/typescript/screens/chat/MultiChatSheet.tsx';
import LogoutModal from '@/typescript/components/LogOut.tsx';
import SelectFollower from '../../FollowRide/components/SelectFollower.tsx';
import DisabilityPopUp from '../../MyProfile/components/DisabilityPopUp.tsx';
import { createAction, Resolver } from '@/typescript/utils/common.ts';
import { location } from '@/helpers/utils/Location/LocationTypes.gen.tsx';
import { BookingId, createBookingId } from '@/typescript/state/client/user.ts';
import { createRideId } from '@/typescript/state/client/booking.ts';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { TextInput as TextInputGesture } from 'react-native-gesture-handler';
import { FormatedLocation } from '@/typescript/utils/placeUtils.ts';
import { bookingAPIEntity } from '@/readOnly/api/types/BookingAPIEntity.gen.tsx';
import { getDriverLocResp } from '@/readOnly/api/types/GetDriverLocResp.gen.tsx';
import { rideAPIEntity } from '@/readOnly/api/types/RideAPIEntity.gen.tsx';
import { useAppSelector } from '@/typescript/state/hooks.ts';
import { selectFeatureFlags } from '@/typescript/state/client/session.ts';
import { RideConfirmedScreenAction } from '../Types.tsx';
import { SharedValue } from 'react-native-reanimated';
import { strings } from 'config-types';
import CallDriver from '@/typescript/screens/CallDriver.tsx';
import { formatPhone } from '@/src-v2/utils/Booking.ts';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal.tsx';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import CancelRide from '@/typescript/screens/CancelRide.tsx';
import { RideCancelModalFlow } from '@/src-v2/components/RideCancelModal/Flow';
import { WaitTimerModal } from './WaitTimerModal.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, MultimodalTaxiTrackingProps } from '@/typescript/navigation/globalParamList.tsx';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

interface RideConfirmedModalsProps {
    // General refs
    cancellationReasonBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    tripDetailsRef: React.RefObject<BottomSheetModal | null>;
    genericSearchModalRef: React.RefObject<BottomSheetModal | null>;
    liveSharingRef: React.RefObject<BottomSheetModal | null>;
    rideSafetyModalRef: React.RefObject<BottomSheetModal | null>;
    multiChatRef: React.RefObject<BottomSheetModal | null>;
    logoutModalRef: React.RefObject<BottomSheetModal | null>;
    followRideModalRef: React.RefObject<BottomSheetModal | null>;
    disabilityPopUp: React.RefObject<BottomSheetModal | null>;
    chatFooterTextRef: React.RefObject<TextInputGesture | null>;
    callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    trustedContactsBottomSheetModalRef: React.RefObject<BottomSheetModal | null>;

    // Data props
    bookingId: BookingId | null;
    rideId: string | null;
    currentLocation: location | null;
    stops: Array<FormatedLocation>;
    source: FormatedLocation | null;
    userLanguageStrings: strings;
    onRideConfirmedCancel: () => void;
    rideDetails: rideAPIEntity | null;
    driverLocation: getDriverLocResp | undefined;
    editLocationAttempts: number;
    editPickupAttempts: number;
    bookingDetails: bookingAPIEntity | null;
    rcsDispatch: Resolver<RideConfirmedScreenAction>;
    showDriver: boolean;
    isDriver: boolean;
    setIsDriver: Dispatch<SetStateAction<boolean>>;
    multiChatAnimatedPosition: SharedValue<number>;
    setHideAccessibility: React.Dispatch<React.SetStateAction<boolean>>;
    setIsBottomSheetChatOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleDisabilityPopUp: () => Promise<void>;
    driverImage: string | null;
    driverName: string;
    navigation: NativeStackNavigationProp<MainNavigationParamList>;
    showCancellationReasonModal: boolean;
    showCancelRideModal: boolean;
    showWaitTimerModal: boolean;
    setShowCancellationReasonModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowTripDetailsModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowCancelRideModal: React.Dispatch<React.SetStateAction<boolean>>;
    setShowWaitTimerModal: React.Dispatch<React.SetStateAction<boolean>>;
    multimodalProps: MultimodalTaxiTrackingProps | undefined;
    showCancellationChargesModal: boolean;
    setShowCancellationChargesModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const RideConfirmedModals: React.FC<RideConfirmedModalsProps> = ({
    // Refs
    genericSearchModalRef,
    liveSharingRef,
    rideSafetyModalRef,
    multiChatRef,
    logoutModalRef,
    followRideModalRef,
    disabilityPopUp,
    chatFooterTextRef,
    callDriverBottomsheetModalRef,
    tripDetailsRef,

    // Data props
    bookingId,
    rideId,
    currentLocation,
    stops,
    source,
    userLanguageStrings,
    onRideConfirmedCancel,
    rideDetails,
    driverLocation,
    editLocationAttempts,
    editPickupAttempts,
    bookingDetails,
    rcsDispatch,
    showDriver,
    isDriver,
    setIsDriver,
    multiChatAnimatedPosition,
    setHideAccessibility,
    setIsBottomSheetChatOpen,
    handleDisabilityPopUp,
    driverImage,
    driverName,
    navigation,
    showCancellationReasonModal,
    showCancelRideModal,
    showWaitTimerModal,
    setShowCancellationReasonModal,
    setShowTripDetailsModal,
    setShowCancelRideModal,
    setShowWaitTimerModal,
    multimodalProps,
    showCancellationChargesModal,
    setShowCancellationChargesModal,
}) => {
    const featureFlags = useAppSelector(selectFeatureFlags);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, []);

    const genericSearchBackPress = () => {
        genericSearchModalRef?.current?.close();
    };

    const modalOnDismiss = useCallback(() => {
        if (setHideAccessibility) {
            setHideAccessibility(false);
        }
    }, [setHideAccessibility]);

    const exophone = formatPhone(bookingDetails?.merchantExoPhone);

    const onCancelClick = useCallback(() => {
        setShowCancelRideModal?.(false);
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
            setShowCancellationReasonModal?.(true);
        }, 400);
    }, []);

    const onConfirmCancel = useCallback(() => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        setShowCancellationChargesModal(false);
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        timeoutId.current = setTimeout(() => {
            setShowCancellationReasonModal(true);
        }, 400);
    }, [setShowCancellationChargesModal, setShowCancellationReasonModal]);

    const [imageKey, setImageKey] = useState<string>('');
    const { top } = useSafeAreaInsets();

    return (
        <>
            {/* Generic Search Modal */}
            <PopUpModal
                style={{ paddingTop: Math.max(top - 10, 0) }}
                sheetRef={genericSearchModalRef}
                snapPoints={['100%']}
                showBackdrop={false}
                onHardwareBackPress={undefined}
                isScrollable={false}
                enableDynamicSizing={false}
                topInset={top - 10}>
                <GenericSearchModal
                    lat={currentLocation?.lat}
                    lon={currentLocation?.lng}
                    onCardClick={(loc: location) =>
                        rcsDispatch(
                            createAction('SEARCH_CARD_CLICKED', {
                                location: loc,
                            }),
                        )
                    }
                    placeHolderText={stops.length == 0 ? userLanguageStrings.AddStop : userLanguageStrings.EditStop}
                    onBackPress={genericSearchBackPress}
                    onLocateMapPress={() => {
                        rcsDispatch(createAction('LOCATE_ON_MAP_CLICK', undefined));
                    }}
                    locationType="destination"
                    searchedLocationText={undefined}
                />
            </PopUpModal>

            <AnimatedModal
                visible={showCancellationReasonModal}
                setVisible={setShowCancellationReasonModal}
                showCloseButton={true}>
                <KeyboardAwareScrollView style={{ width: '100%' }} keyboardShouldPersistTaps="always">
                    <CancellationReason
                        bookingId={bookingId}
                        onRideConfirmedCancel={onRideConfirmedCancel}
                        setShowCancellationReasonModal={setShowCancellationReasonModal}
                        setShowTripDetailsModal={setShowTripDetailsModal}
                        multimodalProps={multimodalProps}
                        imageKey={imageKey}
                    />
                </KeyboardAwareScrollView>
            </AnimatedModal>

            <AnimatedModal visible={showWaitTimerModal} setVisible={setShowWaitTimerModal}>
                <WaitTimerModal onClose={() => setShowWaitTimerModal(false)} />
            </AnimatedModal>

            <PopUpModal
                sheetRef={tripDetailsRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <TripDetailsModal
                    isFollowRide={false}
                    stops={stops.map((stop, index) => ({
                        area: stop.area,
                        address: stop.address,
                        editable:
                            index === stops.length - 1 &&
                            editLocationAttempts > 0 &&
                            !!rideDetails &&
                            bookingDetails?.bookingDetails?.TAG !== 'INTER_CITY' &&
                            bookingDetails?.bookingDetails?.TAG !== 'RENTAL' &&
                            bookingDetails?.tripCategory?._0 !== 'OneWayRideOtp' && //this will disable edit destination for otp rides for all city
                            featureFlags.editDestination,
                    }))}
                    originEditable={
                        (!rideDetails?.driverArrivalTime || rideDetails?.driverArrivalTime === null) &&
                        rideDetails?.status !== 'INPROGRESS' &&
                        editPickupAttempts > 0
                    }
                    originTitle={source?.area}
                    originAddress={source?.address}
                    onEditPickupClick={() => {
                        tripDetailsRef.current?.dismiss();
                        rcsDispatch(createAction('EDIT_PICKUP_CLICKED', undefined));
                        setShowTripDetailsModal(false);
                    }}
                    onEditDestinationClick={() => {
                        tripDetailsRef.current?.dismiss();
                        rcsDispatch(
                            createAction('EDIT_DESTINATION_CLICKED', {
                                driverLocation,
                            }),
                        );
                        setShowTripDetailsModal(false);
                    }}
                    hideAccessibility={undefined}
                    closeModal={undefined}
                    setShowTripDetailsModal={setShowTripDetailsModal}
                    setShowCancellationReasonModal={setShowCancellationReasonModal}
                />
            </PopUpModal>

            {/* <AnimatedModal visible={showTripDetailsModal} setVisible={setShowTripDetailsModal}>
                <TripDetailsModal
                    isFollowRide={false}
                    stops={stops.map((stop, index) => ({
                        area: stop.area,
                        address: stop.address,
                        editable:
                            index === stops.length - 1 &&
                            editLocationAttempts > 0 &&
                            !isNull(rideDetails) &&
                            bookingDetails?.bookingDetails?.TAG !== 'INTER_CITY' &&
                            bookingDetails?.bookingDetails?.TAG !== 'RENTAL' &&
                            bookingDetails?.tripCategory?._0 !== 'OneWayRideOtp' && //this will disable edit destination for otp rides for all city
                            featureFlags.editDestination,
                    }))}
                    originEditable={
                        (!rideDetails?.driverArrivalTime || rideDetails?.driverArrivalTime === null) &&
                        rideDetails?.status !== 'INPROGRESS' &&
                        editPickupAttempts > 0
                    }
                    originTitle={source?.area}
                    originAddress={source?.address}
                    onEditPickupClick={() => {
                        rcsDispatch(createAction('EDIT_PICKUP_CLICKED', undefined));
                        setShowTripDetailsModal(false);
                    }}
                    onEditDestinationClick={() => {
                        rcsDispatch(
                            createAction('EDIT_DESTINATION_CLICKED', {
                                driverLocation,
                            }),
                        );
                        setShowTripDetailsModal(false);
                    }}
                    hideAccessibility={undefined}
                    closeModal={undefined}
                    setShowTripDetailsModal={setShowTripDetailsModal}
                    setShowCancellationReasonModal={setShowCancellationReasonModal}
                />
            </AnimatedModal> */}

            {/* </PopUpModal> */}

            {/* Live Sharing Modal */}
            <PopUpModal
                sheetRef={liveSharingRef}
                snapPoints={['60%']}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <LiveTrackingModal bookingId={bookingId} setIsBottomSheetChatOpen={setIsBottomSheetChatOpen} />
            </PopUpModal>

            {/* Safety Modal */}
            <PopUpModal
                sheetRef={rideSafetyModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <SafetyModal
                    onClose={(checkType: RideChecksType) =>
                        rcsDispatch(
                            createAction('ON_SAFETY_MODAL_CLOSED', {
                                rideCheckType: checkType,
                            }),
                        )
                    }
                    bookingId={bookingId}
                    navigation={navigation}
                />
            </PopUpModal>

            {/* Multi Chat Sheet */}
            <PopUpModal
                sheetRef={multiChatRef}
                animatedIndex={multiChatAnimatedPosition}
                onAnimate={() => Keyboard.dismiss()}
                onDismiss={modalOnDismiss}
                enableDynamicSizing={true}
                showBackdrop={undefined}
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <MultiChatSheet
                    avatarUri={driverImage ?? ''}
                    driverName={driverName}
                    sheetRef={multiChatRef}
                    showDriver={showDriver}
                    bookingId={bookingId}
                    isDriver={isDriver}
                    setIsDriver={setIsDriver}
                />
            </PopUpModal>

            {/* Logout Modal */}
            <PopUpModal
                sheetRef={logoutModalRef}
                handleComponent={null}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <LogoutModal buttonColor={undefined} navigateBack={undefined} closeModal={undefined} />
            </PopUpModal>

            {/* Follow Ride Modal */}
            <PopUpModal
                onDismiss={() => {
                    chatFooterTextRef?.current?.focus();
                    chatFooterTextRef?.current?.clear();
                }}
                sheetRef={followRideModalRef}
                enableDynamicSizing={true}
                showBackdrop={undefined}
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <SelectFollower />
            </PopUpModal>

            {/* Disability PopUp */}
            <PopUpModal
                sheetRef={disabilityPopUp}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <DisabilityPopUp onClick={handleDisabilityPopUp} />
            </PopUpModal>
            <PopUpModal
                sheetRef={callDriverBottomsheetModalRef}
                onAnimate={() => Keyboard.dismiss()}
                onDismiss={modalOnDismiss}
                showBackdrop={undefined}
                stackBehavior="replace"
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <CallDriver
                    driverNumber={formatPhone(rideDetails?.driverNumber)}
                    exoNumber={exophone}
                    onClose={undefined}
                    bookingId={createBookingId(bookingId ?? '')}
                    rideId={rideId ? createRideId(rideId) : null}
                />
            </PopUpModal>

            <AnimatedModal visible={showCancelRideModal} setVisible={setShowCancelRideModal} showCloseButton={true}>
                <CancelRide
                    onClick={onCancelClick}
                    bookingId={bookingId}
                    onRideConfirmedCancel={onRideConfirmedCancel}
                    setShowCancelRideModal={setShowCancelRideModal}
                    multimodalProps={multimodalProps}
                    setImageKey={setImageKey}
                    cancellationFee={rideDetails?.cancellationFeeIfCancelled}
                    isRideOTPFlow={bookingDetails?.tripCategory?._0 === 'OneWayRideOtp'}
                />
            </AnimatedModal>

            <AnimatedModal
                visible={showCancellationChargesModal}
                setVisible={setShowCancellationChargesModal}
                showCloseButton={true}>
                <RideCancelModalFlow
                    setShowCancellationChargesModal={setShowCancellationChargesModal}
                    cancellationFee={rideDetails?.cancellationFeeIfCancelled || 0}
                    onConfirmCancel={onConfirmCancel}
                    onReallocate={() => {
                        rcsDispatch(createAction('ON_REALLOCATION', undefined));
                    }}
                    bookingId={bookingId}
                    rideId={rideId ? createRideId(rideId) : null}
                    multimodalProps={multimodalProps}
                    vehicleVariant={rideDetails?.vehicleVariant}
                    setImageKey={setImageKey}
                    imageKey={imageKey}
                />
            </AnimatedModal>
        </>
    );
};

export default RideConfirmedModals;
