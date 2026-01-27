import { Pressable } from '@/src-v2/primitives/Pressable';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
    Extrapolation,
    interpolate,
    useDerivedValue,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { tailwind } from '../../../../../../src/typescript/tailwindTheme/tailwind';
import { Icon } from '../../../../components/common/Icon';
import { ChevronRight } from '@/src-v2/multimodal/components/svg/ChevronRight';
import { MultimodalConfirmationModal } from './MultimodalConfirmationModal';
import { JourneyFooter } from './JourneyFooter';
import { JourneyOptionsPopup } from './JourneyOptionsPopup';
import { MapPreview } from './MapPreview';
import { MuteJourneyConfirmModal } from './MuteJourneyConfirmModal';
import { StatusBadge } from './StatusBadge';
import { TimelineCard } from './TimelineCard';
import { ItineraryCardProps } from './types';
import Shimmer from '../../../Search/components/SearchSectionListItem/Shimmer';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import { useJourneyActions } from '@/src-v2/multimodal/hooks/useJourneyActions';
import { setLegIsLoading } from '@/typescript/state/client/journey';
import { selectNewFeatureFlags, setToastProps, selectAppConfig } from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { colors as ThemeColor } from 'config-types/src/domain/default/themes/colors';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useMetroTicketCancellation } from '@/src-v2/multimodal/hooks/useMetroTicketCancellation';
import { CancelTicketConfirmationModal } from '../../../Ticket/SingleTicket/components/CancelTicketConfirmationModal';
import { SmartTicketButton } from '@/src-v2/multimodal/components/SmartTicketButton';
import { createJourneyId } from '@/typescript/state/client/user';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { BusOtpTicketModalType1 } from '../../../BusOtpFlow/BusOtpTicket/BusOtpTicketType1';
import { BusOtpTicketModalType2 } from '../../../BusOtpFlow/BusOtpTicket/BusOtpTicketType2';
import { createTicketDataFromProcessedLegInfo } from '../../../BusOtpFlow/utils';
import { checkTaxiLeg } from '@/typescript/utils/common';

type ExtendedItineraryCardProps = ItineraryCardProps;
const cardStyles = {
    container: tailwind.style('bg-white rounded-[30px] pt-7 pb-5 px-[30px] mx-8 w-full'),
    shadow: {
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.13,
        shadowRadius: 20,
        shadowColor: '#000',
    },
};

export const IternaryCard: React.FC<ExtendedItineraryCardProps> = ({
    twoTransits = [],
    entireJourney = ['WALK', 'BUS', 'SUBWAY', 'WALK'],
    currentStatus = 'OFFTRACK',
    onPressStatusBadge,
    onPressDetails,
    onPressViewTicket,
    onPressSwitchToWalk,
    onPressCallRide,
    onPressBoostRide,
    onPressMarkLegComplete,
    onPressViewTimetable,
    onPressCheckIn,
    onRetryBooking,
    onMuteJourney,
    onCompleteJourney,
    onDirectRidePress,
    onViewJourneyPlan,
    destination,
    isLoading = false,
    journeyId,
    currentLegBookingId,
    currentLegStatus,
    currentLegMode,
    currentLegOrder,
    onPressSafety,
    locationStatus = 'success',
    currentLegBookingStatus,
    busFleetNumber,
    busLegData,
}) => {
    const [isOptionsVisible, setIsOptionsVisible] = useState(false); // this is the state for the options popup
    const [shouldRenderCancelModal, setShouldRenderCancelModal] = useState(false);
    const [isBusTicketVisible, setIsBusTicketVisible] = useState(false);
    const { completeJourneyModalRef, cancelTicketConfirmationRef, ticketUIRef } = useRefsContext();
    const completeLegModalRef = useRef<BottomSheetModal>(null);
    const muteJourneyModalRef = useRef<BottomSheetModal>(null);
    const appConfig = useAppSelector(selectAppConfig);
    const progress = useSharedValue(-1);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const showBetaTag = useAppSelector(selectNewFeatureFlags).showBetaTag;

    const {
        metroLegInfo,
        setCancellationStep,
        metroTicketCancellationStep: cancellationStep,
    } = useMetroTicketCancellation(journeyId || undefined);
    const isLive = locationStatus === 'success' && currentStatus === 'LIVE';

    useEffect(() => {
        progress.value = withSpring(0, {
            damping: 15,
            stiffness: 100,
        });
    }, []);

    useEffect(() => {
        progress.value = withSpring(isOptionsVisible ? 1 : 0, {
            damping: 15,
            stiffness: 100,
        });
    }, [isOptionsVisible]);

    const scale = useDerivedValue(() => {
        return interpolate(progress.value, [-1, 0, 1], [1, 1, 0.94], Extrapolation.CLAMP);
    });

    const [multimodalConfirmationModalOpen, setMultimodalConfirmationModalOpen] = useState(false);
    const { skipJourneyLeg } = useJourneyActions(journeyId ?? null);
    const dispatch = useAppDispatch();

    // Accessibility focus management
    const mainContentRef = useRef<View | null>(null);
    const optionsPopupRef = useRef<View | null>(null);
    const completeJourneyModalContentRef = useRef<View | null>(null);
    const completeLegModalContentRef = useRef<View | null>(null);
    const muteJourneyModalContentRef = useRef<View | null>(null);

    const accessibilityManager = useAccessibilityFocus({
        mainContentRef,
        focusDelay: 10,
        accessibilityDelay: 50,
        maxStackSize: 50,
    });

    useDebounceBackPress(() => {
        if (multimodalConfirmationModalOpen) {
            completeJourneyModalRef?.current?.dismiss();
            completeLegModalRef?.current?.dismiss();
            setMultimodalConfirmationModalOpen(false);
        } else if (isOptionsVisible) {
            handleCloseOptions();
        }
        return true;
    });

    const handleOptionsPress = useCallback(() => {
        setIsOptionsVisible(true);
    }, []);

    const handleCloseOptions = useCallback(() => {
        setIsOptionsVisible(false);
    }, []);

    const handleViewJourneyPlan = useCallback(() => {
        handleCloseOptions();
        onViewJourneyPlan();
    }, [handleCloseOptions, onViewJourneyPlan]);

    const handleViewTicketPress = useCallback(() => {
        handleCloseOptions();
        onPressViewTicket();
    }, [handleCloseOptions, onPressViewTicket]);

    const handleBusTicketClose = useCallback(() => {
        setIsBusTicketVisible(false);
    }, []);

    const handleViewTicketButtonPress = useCallback(() => {
        if (busFleetNumber) {
            setIsBusTicketVisible(true);
        } else {
            ticketUIRef.current?.present();
        }
    }, [ticketUIRef, busFleetNumber]);

    const handleCompleteJourneyPress = useCallback(() => {
        if (
            journeyId &&
            currentLegBookingId &&
            checkTaxiLeg(currentLegMode) &&
            currentLegStatus &&
            ['RIDESTARTED'].includes(currentLegStatus)
        ) {
            dispatch(
                setToastProps({
                    message: 'Cannot cancel journey while you have an active ride in progress',
                    bottomSpanDescription: undefined,
                    useSpannedToast: false,
                    visible: true,
                    spannerType: 'top',
                    backgroundColor: `${ThemeColor.red800}`,
                    buttons: [],
                    logo: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    autoDismissAfter: 2000,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
            handleCloseOptions();
            return;
        }
        handleCloseOptions();
        setMultimodalConfirmationModalOpen(true);
        completeJourneyModalRef.current?.present();
    }, []);

    const handleMuteJourneyPress = useCallback(() => {
        muteJourneyModalRef.current?.present();
    }, []);

    const handleDirectRidePress = useCallback(() => {
        handleCloseOptions();
        onDirectRidePress();
    }, [onDirectRidePress, handleCloseOptions]);

    const handleCancelTicket = useCallback(() => {
        handleCloseOptions();
        setShouldRenderCancelModal(true);
        if (metroLegInfo.hasStarted) {
            setCancellationStep('journeyStarted');
        } else {
            setCancellationStep('initial');
        }
        setTimeout(() => {
            cancelTicketConfirmationRef.current?.present();
        }, 0);
    }, [handleCloseOptions, metroLegInfo, setCancellationStep]);

    const handlePressStatusBadge = useCallback(() => {
        handleCloseOptions();
        setTimeout(() => {
            onPressStatusBadge();
        }, 0);
    }, [handleCloseOptions, onPressStatusBadge]);

    const handleConfirmCompleteJourney = useCallback(async () => {
        await onCompleteJourney();
        setMultimodalConfirmationModalOpen(false);
        completeJourneyModalRef.current?.dismiss();
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [onCompleteJourney, accessibilityManager]);

    const handleCancelCompleteJourney = useCallback(() => {
        setMultimodalConfirmationModalOpen(false);
        completeJourneyModalRef.current?.dismiss();
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [accessibilityManager]);
    const handleMarkLegComplete = useCallback(() => {
        if (
            journeyId &&
            currentLegBookingId &&
            checkTaxiLeg(currentLegMode) &&
            currentLegStatus &&
            ['RIDESTARTED'].includes(currentLegStatus)
        ) {
            dispatch(
                setToastProps({
                    message: 'Cannot skip journey while you have an active ride in progress',
                    bottomSpanDescription: undefined,
                    useSpannedToast: false,
                    visible: true,
                    spannerType: 'top',
                    backgroundColor: `${ThemeColor.red800}`,
                    buttons: [],
                    logo: undefined,
                    dismissButton: undefined,
                    onSpannedToastLoad: undefined,
                    autoDismissAfter: 2000,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
            handleCloseOptions();
            return;
        }
        handleCloseOptions();
        setMultimodalConfirmationModalOpen(true);
        completeLegModalRef?.current?.present();
    }, []);

    const handleConfirmMarkLegComplete = useCallback(async () => {
        if (journeyId && checkTaxiLeg(currentLegMode)) {
            await skipJourneyLeg(currentLegOrder, journeyId);
            dispatch(setLegIsLoading({ id: journeyId, payload: { legOrder: currentLegOrder, journeyRefresh: true } }));
        }
        await onPressMarkLegComplete();
        setMultimodalConfirmationModalOpen(false);
        completeLegModalRef.current?.dismiss();
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [onPressMarkLegComplete, accessibilityManager]);

    const handleCancelMarkLegComplete = useCallback(() => {
        console.info('handleCancelMarkLegComplete for skip leg');
        setMultimodalConfirmationModalOpen(false);
        completeLegModalRef.current?.dismiss();
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [accessibilityManager]);

    const handleConfirmMuteJourney = useCallback(() => {
        muteJourneyModalRef.current?.dismiss();
        onMuteJourney();
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [onMuteJourney, accessibilityManager]);

    const handleCancelMuteJourney = useCallback(() => {
        muteJourneyModalRef.current?.dismiss();
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();
    }, [accessibilityManager]);

    useEffect(() => {
        if (isOptionsVisible && optionsPopupRef.current) {
            accessibilityManager.setFocus(optionsPopupRef);
        }
    }, [isOptionsVisible, accessibilityManager.setFocus]);

    const noPublicTransportJourney = useMemo(() => {
        return entireJourney.length === 1 && entireJourney[0] && checkTaxiLeg(entireJourney[0], true);
    }, [entireJourney]);

    const busTicketModalProps = useMemo(() => {
        if (!busFleetNumber) return null;

        return {
            isTicketVisible: isBusTicketVisible,
            onGoBack: handleBusTicketClose,
            ticketData: createTicketDataFromProcessedLegInfo(busLegData),
            headerText: userLanguageStrings.BusTicketActivated(busFleetNumber),
            subtitleText: userLanguageStrings.ViewOriginalTicketInfo,
            buttonText: userLanguageStrings.GoBack,
        };
    }, [busFleetNumber, isBusTicketVisible, handleBusTicketClose, busLegData, userLanguageStrings]);

    const handleCompleteJourneyModalReady = useCallback(() => {
        accessibilityManager.pushToFocusStack(completeJourneyModalContentRef, 'CompleteJourneyModal');
        accessibilityManager.setFocus(completeJourneyModalContentRef);
        accessibilityManager.hideAccessibility(mainContentRef);
    }, [accessibilityManager]);
    const handleCompleteLegModalReady = useCallback(() => {
        accessibilityManager.pushToFocusStack(completeLegModalContentRef, 'CompleteLegModal');
        accessibilityManager.setFocus(completeLegModalContentRef);
        accessibilityManager.hideAccessibility(mainContentRef);
    }, [accessibilityManager]);
    const handleMuteJourneyModalReady = useCallback(() => {
        accessibilityManager.pushToFocusStack(muteJourneyModalContentRef, 'MuteJourneyModal');
        accessibilityManager.setFocus(muteJourneyModalContentRef);
        accessibilityManager.hideAccessibility(mainContentRef);
    }, [accessibilityManager]);

    return (
        <Animated.View ref={mainContentRef} style={tailwind.style('flex items-center justify-center h-full')}>
            <Animated.View style={tailwind.style(`bg-[${colors.CrossButton_bg}] absolute inset-0 opacity-85`)} />
            <Animated.View
                style={[
                    tailwind.style('px-8 w-full flex items-center justify-center mt-10'),
                    { transform: [{ scale: scale }] },
                ]}>
                <Animated.View style={[cardStyles.container, cardStyles.shadow]}>
                    {/* Header */}
                    <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                        <Animated.View style={{ flexDirection: 'row' }} accessible>
                            <StatusBadge
                                onPress={() => (isLive ? undefined : onPressStatusBadge())}
                                isLive={isLive}
                                currentStatus={currentStatus}
                                locationStatus={locationStatus}
                            />
                            {showBetaTag ? (
                                <Animated.View
                                    style={tailwind.style(
                                        `bg-[#E8F1FF] rounded-[11px] px-[10px] mr-2 flex-row justify-center items-center gap-[5px] h-5`,
                                    )}>
                                    <Text
                                        style={tailwind.style(
                                            'text-[#1370FA] font-bold text-[12px] font-departureMono-regular leading-[14px]',
                                        )}>
                                        BETA
                                    </Text>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                        <Pressable
                            accessibilityLabel="Options button"
                            accessibilityRole="button"
                            testID="options-button"
                            disabled={isLoading}
                            onPress={handleOptionsPress}
                            style={({ pressed }) => [
                                tailwind.style('flex-row justify-center items-center'),
                                pressed && { opacity: 0.9 },
                            ]}>
                            {({ pressed }) => (
                                <>
                                    <Text
                                        style={tailwind.style(
                                            `text-[${
                                                pressed ? '#000000' : '#656565'
                                            }] text-[13px] font-areaNormal-extrabold leading-[18px]`,
                                            isLoading && { opacity: 0.5 },
                                        )}>
                                        {userLanguageStrings.Options}
                                    </Text>
                                    <Icon
                                        icon={<ChevronRight />}
                                        size={14}
                                        color={pressed ? '#000000' : '#5A5A5A'}
                                        style={tailwind.style('mt-0.5', isLoading && { opacity: 0.5 })}
                                    />
                                </>
                            )}
                        </Pressable>
                    </Animated.View>

                    {/* Journey Details */}
                    <Animated.View style={tailwind.style('pt-5')}>
                        {!isLoading ? (
                            <Text
                                accessible={true}
                                accessibilityLabel={destination}
                                style={tailwind.style(
                                    'text-[21px] leading-[25px] text-[#3B3A3C] font-areaNormal-extrabold',
                                )}
                                numberOfLines={1}>
                                {destination}
                            </Text>
                        ) : (
                            <Shimmer width={'100%'} height={25} borderRadius={7} />
                        )}

                        {!isLoading ? (
                            <>
                                {!noPublicTransportJourney ? (
                                    currentStatus === 'LIVE' && journeyId ? (
                                        <SmartTicketButton
                                            journeyId={createJourneyId(journeyId)}
                                            onPressViewTicket={handleViewTicketButtonPress}
                                            wrapperStyle="text-[#026FD7] text-[15px] mt-2 font-areaNormal-extrabold leading-[19px] tracking-[0.25px]"
                                            ticketText={userLanguageStrings.ViewTicket}
                                            componentType="hyperlink"
                                            includePriceInButtonText={false}
                                        />
                                    ) : (
                                        <Text
                                            accessible={true}
                                            accessibilityLabel={
                                                currentStatus === 'OFFTRACK' ? 'You are far-away' : 'You are not moving'
                                            }
                                            style={tailwind.style(
                                                'text-[#969696] text-[15px] mt-2 font-areaNormal-extrabold leading-[15px] tracking-[0.25px]',
                                            )}>
                                            {currentStatus === 'OFFTRACK' ? 'You are far-away' : 'You are not moving'}
                                        </Text>
                                    )
                                ) : null}
                            </>
                        ) : (
                            <Shimmer width={'20%'} height={15} wrapperStyle={'mt-2'} borderRadius={7} />
                        )}
                    </Animated.View>

                    <MapPreview journeyId={journeyId} />

                    {/* Timeline */}
                    <Animated.View style={tailwind.style('pl-2')}>
                        {currentStatus === 'LIVE' && !twoTransits[0]?.isFirstLeg && (
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0.5)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={tailwind.style('w-10 h-7 absolute top-0 z-1')}
                            />
                        )}
                        {twoTransits?.map((item, index) => (
                            <TimelineCard
                                isJourneyStatus={false}
                                onUpdateTransit={undefined}
                                key={index}
                                transits={item}
                                isFirstLeg={item?.isFirstLeg}
                                isLastLeg={item?.isLastLeg}
                                currentIndex={index}
                                currentStatus={currentStatus}
                                isCurrentLeg={index.toString() === currentLegOrder}
                                switchToWalk={onPressSwitchToWalk}
                                onCall={onPressCallRide}
                                onBoost={onPressBoostRide}
                                onRetryBooking={onRetryBooking}
                                onMarkComplete={handleCompleteJourneyPress}
                                onPressOtherOptions={handleOptionsPress}
                                onViewTimetable={onPressViewTimetable}
                                onCheckIn={onPressCheckIn}
                                isLoading={isLoading}
                                onSafety={onPressSafety}
                            />
                        ))}
                        <LottieView
                            style={[tailwind.style('w-[15px] h-[120px] top-[46px] absolute left-4.4 '), { zIndex: 0 }]}
                            speed={1.2}
                            source={require('../../../../../../src-v2/assets/lottie/iternary-lottie.lottie')}
                            autoPlay
                            loop
                        />

                        {currentStatus === 'LIVE' && (
                            <LinearGradient
                                colors={['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 1)']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 0, y: 1 }}
                                style={tailwind.style('w-10 h-15 absolute bottom-0 z-1')}
                            />
                        )}
                    </Animated.View>

                    <JourneyFooter
                        currentStatus={currentStatus}
                        entireJourney={entireJourney}
                        onPressDetails={onPressDetails}
                        isLoading={isLoading}
                        firstTransit={twoTransits[0]}
                        isJourneyLive={currentStatus === 'LIVE'}
                        onPressStatusBadge={onPressStatusBadge}
                    />
                </Animated.View>
            </Animated.View>

            <JourneyOptionsPopup
                visible={isOptionsVisible}
                onMuteJourney={handleMuteJourneyPress}
                onViewJourneyPlan={handleViewJourneyPlan}
                onMarkLegCompletePress={handleMarkLegComplete}
                onClose={handleCloseOptions}
                onCompleteJourneyPress={handleCompleteJourneyPress}
                onDirectRidePress={handleDirectRidePress}
                currentLegMode={currentLegMode}
                currentLegBookingId={currentLegBookingId}
                currentLegStatus={currentLegStatus}
                currentLegBookingStatus={currentLegBookingStatus}
                onViewTicketPress={handleViewTicketPress}
                onCancelTicketPress={handleCancelTicket}
                isTicketCancelled={cancellationStep === 'cancelled'}
                onPressStatusBadge={handlePressStatusBadge}
                accessibilityRef={optionsPopupRef}
            />

            <MultimodalConfirmationModal
                ref={completeJourneyModalRef}
                onConfirm={handleConfirmCompleteJourney}
                onCancel={handleCancelCompleteJourney}
                heading={userLanguageStrings.CompleteJourney}
                description={userLanguageStrings.TicketExpiresIfCompleteConfirm}
                primaryButtonText={userLanguageStrings.Complete}
                secondaryButtonText={userLanguageStrings.Cancel}
                accessibilityRef={completeJourneyModalContentRef}
                onModalContentReady={handleCompleteJourneyModalReady}
            />

            <MultimodalConfirmationModal
                ref={completeLegModalRef}
                onConfirm={handleConfirmMarkLegComplete}
                onCancel={handleCancelMarkLegComplete}
                heading={userLanguageStrings.SkipCurrentMode}
                description={userLanguageStrings.SkipCurrentModeConfirm}
                primaryButtonText={userLanguageStrings.Skip}
                secondaryButtonText={userLanguageStrings.Cancel}
                accessibilityRef={completeLegModalContentRef}
                onModalContentReady={handleCompleteLegModalReady}
            />
            {appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable && shouldRenderCancelModal && (
                <CancelTicketConfirmationModal
                    journeyId={journeyId}
                    primaryButtonText={userLanguageStrings.CancelTicket}
                    secondaryButtonText={userLanguageStrings.Close}
                    isTicketCancellable={true}
                />
            )}

            <MuteJourneyConfirmModal
                ref={muteJourneyModalRef}
                onConfirmMute={handleConfirmMuteJourney}
                onCancel={handleCancelMuteJourney}
                accessibilityRef={muteJourneyModalContentRef}
                onModalContentReady={handleMuteJourneyModalReady}
            />

            {busTicketModalProps &&
                (() => {
                    const modalType = appConfig.uiConfig?.busOtpTicketModalType;

                    if (modalType === 'Type1') {
                        return <BusOtpTicketModalType1 {...busTicketModalProps} />;
                    }

                    if (modalType === 'Type2') {
                        return <BusOtpTicketModalType2 {...busTicketModalProps} />;
                    }

                    return null;
                })()}
        </Animated.View>
    );
};
