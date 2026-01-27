import {
    InDestinationStationZone,
    InStationBackground,
} from '@/src-v2/multimodal/screens/NewLiveJourney/components/InZoneExperience/InDestinationStationZone';
import { SwitchToAutoConfirmationModal } from '@/src-v2/multimodal/screens/NewLiveJourney/components/StatusPopUpModal/SwitchToAutoConfirmationModal';
import { InTransitState } from '@/src-v2/multimodal/screens/NewLiveJourney/molecules/InTransitState';
import { PreboardingState } from '@/src-v2/multimodal/screens/NewLiveJourney/molecules/PreboardingState';
import { DetailedTransitTrackingUI } from '@/src-v2/multimodal/screens/NewLiveJourney/screens/TransitTracking/DetailedTransitTrackingUI';
import { MemoizedNewTimeTableUI as NewTimeTableUI } from '@/src-v2/multimodal/screens/NewTimeTable/UI';
import { useTicketUIProps } from '@/src-v2/multimodal/screens/Ticket/Hooks/useTicketUIProps';
import TicketUI from '@/src-v2/multimodal/screens/Ticket/UI';
import Button from '@/src-v2/primitives/Button';
import { ChooseRideFlow } from '@/src-v2/screens/ChooseRide/Flow';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { formatPhone } from '@/src-v2/utils/Booking';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { ChooseRideFooter } from '@/typescript/designSystem/components/ChooseRideFooter';
import RecenterButton from '@/typescript/designSystem/components/RecenterButton';
import useDebounceBackPress from '@/typescript/hooks/useDebounceBackPress';
import CallDriver from '@/typescript/screens/CallDriver';
import { openGoogleMapsWalking } from '@/typescript/utils/common';
import { OriginAndDestinationLatLng } from '@/typescript/utils/placeUtils';
import BottomSheet, { BottomSheetModal, BottomSheetView, SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { isEqual } from 'lodash';
import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Keyboard, Platform, Text, View } from 'react-native';
import Animated, { interpolate, SharedValue, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CallDriverProps } from '../LiveJourneyOverview/UI';
import { ExitButton } from '../NewLiveJourney/components/DetailedLiveJourney/Exit';
import { LocationRefreshBadge } from '../NewLiveJourney/components/LocationRefreshBadge';
import { TransitCheckIn } from '../NewLiveJourney/components/StatusPopUpModal/TransitCheckIn/TransitCheckIn';
import JourneyListBottomSheet from '../NewLiveJourney/components/UpdateJourney/JourneyListBottomSheet';
import { LiveJourneyDetailUIProps, LiveJourneyDetailViewData } from './Types';
import { MarkCompleteContext } from '@/src-v2/multimodal/screens/NewLiveJourney/molecules/InTransitState';
import {
    BottomSheetTopBanner,
    BottomSheetTopBannerType,
} from '@/typescript/designSystem/components/BottomSheetTopBanner';
import { BottomSheetDefaultHandleProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetHandle/types';
import { BetaDetailPopUp } from '../NewLiveJourney/components/Iternary/BetaDetailPopUp';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import { useLocationStatusContext } from '@/typescript/context/LocationStatusContext';
import { JourneyId } from '@/typescript/state/client/user';
import { strings } from 'config-types';
import { Icon } from '@/typescript/components/Icon';
import GoogleNavigation from '@/typescript/assets/svg/symbols/GoogleNavigation';

export const LiveJourneyHeader = ({
    onPressExit,
    onPressStatusBadge,
}: {
    onPressExit: (() => void) | undefined;
    onPressStatusBadge: () => void;
}) => {
    const { top } = useSafeAreaInsets();

    const { locationStatus } = useLocationStatusContext();

    return (
        <Animated.View
            style={tailwind.style(
                'absolute top-0 left-0 right-0 z-10 flex-row justify-between px-4 bg-transparent',
                `pt-[${top + 8}px]`,
            )}>
            <ExitButton onPressExit={() => onPressExit?.()} />
            <Animated.View
                style={{
                    shadowOffset: { width: 2, height: 2 },
                    shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
                    shadowOpacity: 0.08,
                    shadowRadius: 5,
                    elevation: 3,
                    zIndex: 1,
                }}>
                {locationStatus === 'success' ? (
                    <LocationRefreshBadge status="success" />
                ) : locationStatus === 'refreshing' ? (
                    <LocationRefreshBadge status="refreshing" />
                ) : (
                    <LocationRefreshBadge status="error" handleOnPress={onPressStatusBadge} />
                )}
            </Animated.View>
        </Animated.View>
    );
};

// Google Maps Button Component
const GoogleMapsButton = ({
    sheetAnimatedIndex,
    sheetAnimatedPosition,
    onPress,
    additionalOffset = 0,
    userLanguageStrings,
}: {
    sheetAnimatedIndex: SharedValue<number>;
    sheetAnimatedPosition: SharedValue<number>;
    onPress: () => void;
    additionalOffset: number | undefined;
    userLanguageStrings: strings;
}) => {
    const floatingButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - 72 - additionalOffset, // Position below RecenterButton
                },
            ],
            opacity: interpolate(sheetAnimatedIndex.value, [0.8, 1], [1, 0]),
        };
    });

    return (
        <Animated.View
            pointerEvents="box-none"
            style={[tailwind.style('px-4 absolute w-full items-start'), floatingButtonStyle]}>
            <Button
                testID="google-maps-button"
                size="md"
                type="secondary"
                text={userLanguageStrings.Directions}
                accessibilityLabel="Open in Google Maps"
                accessibilityRole="button"
                prefix={<Icon icon={<GoogleNavigation fill={'#0077ff'} />} color="#0077ff" size={16} />}
                onPress={onPress}
            />
        </Animated.View>
    );
};

const MemoizedCallDriverModal = memo(
    ({
        callDriverProps,
        callDriverBottomsheetModalRef,
    }: {
        callDriverProps: CallDriverProps;
        callDriverBottomsheetModalRef: React.RefObject<BottomSheetModal | null>;
    }) => (
        <PopUpModal
            sheetRef={callDriverBottomsheetModalRef}
            onAnimate={() => Keyboard.dismiss()}
            onDismiss={() => {}}
            showBackdrop={undefined}
            stackBehavior="replace"
            onHardwareBackPress={undefined}
            isScrollable={false}>
            <CallDriver
                driverNumber={formatPhone(callDriverProps.driverNumber)}
                exoNumber={callDriverProps.exoNumber}
                onClose={undefined}
                bookingId={callDriverProps.bookingId}
                rideId={null}
            />
        </PopUpModal>
    ),
);

const LiveJourneyDetailUIComponent: React.FC<LiveJourneyDetailUIProps> = ({
    viewData,
    journeyId,
}: {
    viewData: LiveJourneyDetailViewData;
    journeyId: JourneyId;
}) => {
    const { onPressExit } = viewData;
    const mapSharedVal = useSharedValue(0);
    const bottomSheetRef = useRef<BottomSheet>(null);
    const { switchToAutoConfirmationModalRef } = useRefsContext();
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues('liveJourneyDetailedView');
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { bottom, top } = useSafeAreaInsets();

    const bottomSheetProps =
        viewData.viewMode === 'chooseRide'
            ? { index: 0, snapPoints: ['40%', '80%'] }
            : viewData.viewMode === 'waitingStation'
              ? { index: 0, snapPoints: [SCREEN_HEIGHT - 140 - (top ? top : 16)] }
              : viewData.viewMode === 'preboarding' && viewData.preboardingProps?.status !== 'transitArrived'
                ? { index: 0, snapPoints: ['45%', '80%', SCREEN_HEIGHT - (top ? top : 16) - (bottom ? bottom : 16)] }
                : viewData.viewMode === 'intransit' &&
                    viewData.backgroundMode === 'map' &&
                    viewData?.currentLeg?.transitMode !== 'WALK'
                  ? { index: 0, snapPoints: [260, '80%'] }
                  : { enableDynamicSizing: true };

    useEffect(() => {
        if (
            viewData.viewMode === 'intransit' &&
            viewData.backgroundMode === 'map' &&
            viewData?.currentLeg?.transitMode !== 'WALK'
        )
            setTimeout(() => {
                bottomSheetRef.current?.snapToIndex(1);
            }, 100);
    }, [viewData.viewMode, viewData.backgroundMode, viewData.currentLeg?.transitMode]);

    const backgroundStyle = useMemo(
        () => [
            tailwind.style(`bg-white rounded-20px`),
            {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: 0,
                },
                shadowOpacity: 0.3,
                shadowRadius: 15,
                elevation: Platform.OS === 'android' && Platform.Version >= 29 ? 50 : undefined,
            },
        ],
        [],
    );

    const showBetaTag = useAppSelector(selectNewFeatureFlags).showBetaTag;
    const { betaDetailRef, bottomSheetTopBannerRef } = useRefsContext();

    const clickOnBetaBanner = useCallback(() => {
        betaDetailRef.current?.present();
    }, []);

    const renderHandleComponent = useCallback(
        (props: BottomSheetDefaultHandleProps) => {
            if (!showBetaTag || viewData.viewMode === 'chooseRide') bottomSheetTopBannerRef.current = false;
            else bottomSheetTopBannerRef.current = true;
            return (
                <BottomSheetTopBanner
                    {...props}
                    onBannerPress={clickOnBetaBanner}
                    showHandle={true}
                    postIcon={true}
                    bannerType={BottomSheetTopBannerType.BETA}
                    handlerBGColor={
                        viewData.viewMode === 'chooseRide' ? colors.Fill_neutralUltraLow : colors.Fill_neutralMin
                    }
                />
            );
        },
        [showBetaTag, viewData.viewMode],
    );

    useDebounceBackPress(
        () => {
            if (viewData.showDetailedTransitTracking && viewData.detailedTransitTrackingComponentProps) {
                viewData.onHideDetailedTransitTracking();
            } else {
                onPressExit?.();
                return true;
            }
            return true;
        },
        1000,
        [viewData.showDetailedTransitTracking, viewData.detailedTransitTrackingComponentProps],
    );

    const renderSwitchToAutoConfirmationModal = useCallback(() => {
        if (viewData.preboardingProps?.status === 'starting' || viewData.preboardingProps?.status === 'walking') {
            const { onPressBookRide } = viewData.preboardingProps;
            return (
                <SwitchToAutoConfirmationModal
                    ref={switchToAutoConfirmationModalRef}
                    description={userLanguageStrings.DistanceLessThan500Meters}
                    primaryButtonText={userLanguageStrings.SwitchToAuto}
                    secondaryButtonText={userLanguageStrings.StayInWalkMode}
                    onConfirm={async () => {
                        onPressBookRide();
                        switchToAutoConfirmationModalRef.current?.dismiss();
                    }}
                    onCancel={() => {
                        switchToAutoConfirmationModalRef.current?.dismiss();
                    }}
                />
            );
        }
        return null;
    }, [viewData.preboardingProps]);

    if (
        viewData.showDetailedTransitTracking &&
        viewData.detailedTransitTrackingComponentProps &&
        viewData.detailedTransitTrackingComponentProps.hasLiveTracking
    ) {
        return <DetailedTransitTrackingUI {...viewData.detailedTransitTrackingComponentProps} />;
    }

    const renderBottomSheetContent = () => {
        if (viewData.viewMode === 'preboarding' && viewData.preboardingProps) {
            return (
                <BottomSheetView style={tailwind.style(`pt-[18px] pb-[${bottom}px]`)}>
                    <PreboardingState {...viewData.preboardingProps} journeyId={journeyId} />
                    {viewData.isLastMile && (
                        <MarkCompleteContext
                            hasNextLeg={false}
                            onCompleteJourney={viewData.onCompleteJourney || (async () => {})}
                            onExitStation={viewData.onMarkLegComplete || (async () => {})}
                        />
                    )}
                </BottomSheetView>
            );
        }

        if (viewData.viewMode === 'intransit' && viewData.inTransitProps) {
            return (
                <BottomSheetView style={tailwind.style(` pt-[18px] pb-[${bottom}px]`)}>
                    <InTransitState {...viewData.inTransitProps} />
                </BottomSheetView>
            );
        }

        if (viewData.viewMode === 'chooseRide' && viewData.chooseRideProps) {
            return (
                <ChooseRideFlow
                    navigation={viewData.chooseRideProps.navigation}
                    showErrorStatesModal={() => {}}
                    hideAccessibility={true}
                    setHideAccessibility={() => {}}
                    searchId={viewData.chooseRideProps.rideOptionsLeg?.staticInfo.searchId ?? null}
                    bookAnyVisible={false}
                    selectedMultimodalLeg={{
                        pricingId: viewData.chooseRideProps.rideOptionsLeg?.staticInfo.selectedQuoteId,
                        distance: viewData.chooseRideProps.rideOptionsLeg?.staticInfo.distance,
                        duration: viewData.chooseRideProps.rideOptionsLeg?.staticInfo.duration,
                    }}
                    setIsScrolled={() => {}}
                />
            );
        }

        return (
            <BottomSheetView style={tailwind.style('flex-1 justify-center items-center p-4')}>
                <Text>{userLanguageStrings.CouldNotDetermineViewState}</Text>
            </BottomSheetView>
        );
    };

    if (viewData.backgroundMode === 'inTransitBackground' && viewData.inTransitProps) {
        const destinationStationZoneProps =
            viewData.inTransitProps?.status === 'exitStation'
                ? {
                      mode: viewData.inTransitProps.mode,
                      status: 'transitArrived' as const,
                      gateInfo: {
                          gateNo: viewData.inTransitProps?.exitGateNo ?? '',
                          gateSide: viewData.inTransitProps?.exitGateSide ?? 'Take Available Exit Gate',
                      },
                      onPressExit: viewData.onPressExit ?? (() => {}),
                      locationHistory: viewData.riderLocationHistory,
                      onPressStatusBadge: viewData.onPressStatusBadge,
                  }
                : {
                      mode: viewData.inTransitProps.mode,
                      status: 'transitIsOneStopAway' as const,
                      onPressExit: viewData.onPressExit ?? (() => {}),
                      locationHistory: viewData.riderLocationHistory,
                      onPressStatusBadge: viewData.onPressStatusBadge,
                  };
        return (
            <View style={tailwind.style('flex-1')}>
                <InDestinationStationZone {...destinationStationZoneProps} />
                {viewData.shouldShowBottomSheet && (
                    <BottomSheet
                        handleComponent={renderHandleComponent}
                        animatedIndex={sheetAnimatedIndex}
                        animatedPosition={sheetAnimatedPosition}
                        handleIndicatorStyle={tailwind.style(`h-1 w-[46px] bg-[${colors.CrossButton_bg}]`)}
                        backgroundStyle={backgroundStyle}
                        enablePanDownToClose={false}
                        {...bottomSheetProps}
                        style={tailwind.style('bg-white rounded-[36px]')}
                        ref={bottomSheetRef}>
                        {renderBottomSheetContent()}
                    </BottomSheet>
                )}
            </View>
        );
    }

    if (viewData.backgroundMode === 'inStationBackground' && viewData.waitingStationProps) {
        return (
            <View style={tailwind.style('flex-1')}>
                <InStationBackground
                    onPressExit={viewData.onPressExit ?? (() => {})}
                    metroPreboardingProps={viewData.waitingStationProps}
                    onPressStatusBadge={viewData.onPressStatusBadge}
                    journeyId={journeyId}
                />
                {viewData.transitCheckInProps ? <TransitCheckIn {...viewData.transitCheckInProps} /> : null}
            </View>
        );
    }

    // Default to map background
    return (
        <>
            {viewData.backgroundMode === 'map' && (
                <>
                    <RecenterButton
                        onPress={viewData.recenterMap}
                        sheetAnimatedIndex={sheetAnimatedIndex}
                        sheetAnimatedPosition={sheetAnimatedPosition}
                        buttonPositionUpwardsBy={mapSharedVal}
                        additionalOffset={0}
                    />
                    {(viewData.preboardingProps?.status === 'walking' ||
                        viewData.preboardingProps?.status === 'starting' ||
                        (viewData.preboardingProps?.status === 'transitArrived' &&
                            viewData?.currentLeg?.transitMode === 'WALK') ||
                        (viewData.inTransitProps?.status === 'inTransit' &&
                            viewData?.currentLeg?.transitMode === 'WALK')) &&
                        viewData.googleMapsButtonProps && (
                            <GoogleMapsButton
                                sheetAnimatedIndex={sheetAnimatedIndex}
                                sheetAnimatedPosition={sheetAnimatedPosition}
                                onPress={() => {
                                    if (
                                        viewData.googleMapsButtonProps?.riderLocation &&
                                        viewData.googleMapsButtonProps?.destination
                                    ) {
                                        const location: OriginAndDestinationLatLng = {
                                            originLat: viewData.googleMapsButtonProps.riderLocation.lat,
                                            originLng: viewData.googleMapsButtonProps.riderLocation.lon,
                                            destinationLat: viewData.googleMapsButtonProps.destination.latLong.lat,
                                            destinationLng: viewData.googleMapsButtonProps.destination.latLong.lon,
                                        };
                                        openGoogleMapsWalking(location);
                                    }
                                }}
                                additionalOffset={viewData.googleMapsButtonProps.additionalOffset}
                                userLanguageStrings={userLanguageStrings}
                            />
                        )}
                </>
            )}
            {viewData.viewMode === 'chooseRide' ? (
                <LiveJourneyHeader onPressExit={onPressExit} onPressStatusBadge={viewData.onPressStatusBadge} />
            ) : (
                <LiveJourneyHeader onPressExit={onPressExit} onPressStatusBadge={viewData.onPressStatusBadge} />
            )}
            {viewData.shouldShowBottomSheet && (
                <BottomSheet
                    animatedIndex={sheetAnimatedIndex}
                    animatedPosition={sheetAnimatedPosition}
                    handleComponent={renderHandleComponent}
                    handleIndicatorStyle={tailwind.style(`h-1 w-[46px] bg-[${colors.CrossButton_bg}]`)}
                    backgroundStyle={backgroundStyle}
                    enablePanDownToClose={false}
                    {...bottomSheetProps}
                    ref={bottomSheetRef}>
                    {renderBottomSheetContent()}
                </BottomSheet>
            )}
            {viewData.viewMode === 'chooseRide' &&
                viewData.chooseRideProps &&
                viewData.chooseRideProps.rideOptionsLeg?.currentLeg && (
                    <ChooseRideFooter
                        multimodalProps={{
                            journeyId: journeyId,
                            isLastMile: viewData.isLastMile,
                            currentLegOrder: viewData.chooseRideProps.rideOptionsLeg?.currentLeg,
                            previousLegOrderTravelMode: viewData.chooseRideProps.rideOptionsLeg?.previousTravelMode,
                            previousLegOrderTravelModeStatusConfirmed:
                                viewData.chooseRideProps.rideOptionsLeg?.previousTravelModeStatusConfirmed,
                        }}
                        hideAccessibility={true}
                        searchId={viewData.chooseRideProps.rideOptionsLeg?.staticInfo.searchId ?? null}
                        isScrolled={false}
                    />
                )}
            {viewData.transitCheckInProps ? <TransitCheckIn {...viewData.transitCheckInProps} /> : null}
            {renderSwitchToAutoConfirmationModal()}
            {viewData.callDriverProps ? (
                <MemoizedCallDriverModal
                    callDriverProps={viewData.callDriverProps}
                    callDriverBottomsheetModalRef={viewData.callDriverBottomsheetModalRef}
                />
            ) : null}
        </>
    );
};

const LiveJourneyDetailUIWithTicket: React.FC<LiveJourneyDetailUIProps> = (props: LiveJourneyDetailUIProps) => {
    const ticketUIProps = useTicketUIProps(props.journeyId, 'bottomSheetModal');
    const { liveJourneyListDetailBottomSheetRef } = useRefsContext();

    return (
        <>
            {ticketUIProps ? <TicketUI {...ticketUIProps} /> : null}
            {props.viewData.timeTableProps ? <NewTimeTableUI {...props.viewData.timeTableProps} /> : null}
            <JourneyListBottomSheet
                sheetRef={liveJourneyListDetailBottomSheetRef}
                onClosePress={() => {
                    liveJourneyListDetailBottomSheetRef.current?.dismiss();
                }}
                onLegUpdate={props.viewData.locationRefreshViewData.onLegUpdate}
                journeySteps={props.viewData.locationRefreshViewData.trackLostJourneyProps}
                allLegs={props.viewData.metroConfirmProps?.allLegs ?? []}
                onMetroStationConfirm={props.viewData.metroConfirmProps?.onMetroStationConfirm ?? (() => {})}
                predictedLeg={props.viewData.predictedLeg}
                shouldAutoOpenUpdateTransit={props.viewData.shouldAutoOpenUpdateTransit}
                setShouldAutoOpenUpdateTransit={props.viewData.setShouldAutoOpenUpdateTransit}
            />
            <BetaDetailPopUp />
            <LiveJourneyDetailUIComponent {...props} />
        </>
    );
};

export const LiveJourneyDetailUI = memo(
    LiveJourneyDetailUIWithTicket,
    (prev, next) => prev.journeyId === next.journeyId && isEqual(prev.viewData, next.viewData),
);
