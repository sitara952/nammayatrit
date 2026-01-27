import React, { useMemo, useCallback, useEffect, useContext, useState } from 'react';
import TicketValidIn from '../NewLiveJourney/components/TicketValidIn';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Animated, { useSharedValue, useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import CrossIcon from '../Search/components/svg/CloseIcon';
import { BusTrackingScreenProps, BusTrackingAction } from './Types';
import BottomSheet, { BottomSheetFlatList, BottomSheetModal, SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { MiniBusTracking } from '../NewLiveJourney/components/DetailedLiveJourney/MiniBusTracking';
import { DetailedTransitTrackingModal } from './components/DetailedTransitTrackingModal';
import Button from '@/src-v2/primitives/Button';
import RecenterButton from '@/typescript/designSystem/components/RecenterButton';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import { View, ListRenderItem, StyleSheet, Platform } from 'react-native';
import BusTrackingHeader from './components/BusTrackingHeader';
import { NextBusesListSection } from '@/src-v2/multimodal/screens/NewLiveJourney/molecules/NextBusesList';
import { BusConfirmModal } from './components/BusConfirmModal';
import { MapContext } from '@/typescript/Maps/MapContext';
import { strings } from 'config-types';
import { removeWordBuses } from '../JourneyInfoScreen/DirectBooking/components/BusTransitCard';
import { isUndefined } from 'lodash';
import { openGoogleMapsWalking } from '@/typescript/utils/common';
import { OriginAndDestinationLatLng } from '@/typescript/utils/placeUtils';
import GoogleNavigation from '@/typescript/assets/svg/symbols/GoogleNavigation';
import { Icon } from '@/typescript/components/Icon';

interface ListItem {
    type: 'header' | 'progress' | 'otherBuses';
}

const BusTrackingRouteToggleButton = React.memo(
    ({
        onBackPress,
        confirmModalRef,
        mainSheetRef,
        isConfirmModalOpen,
        setIsConfirmModalOpen,
        detailedTrackingModalRef,
        mpDispatch,
        isDetailedTrackingOpen,
        setIsDetailedTrackingOpen,
        userLanguageStrings,
    }: {
        onBackPress: () => void;
        confirmModalRef: React.RefObject<BottomSheetModal | null>;
        mainSheetRef: React.RefObject<BottomSheet | null>;
        isConfirmModalOpen: boolean;
        setIsConfirmModalOpen: (open: boolean) => void;
        detailedTrackingModalRef: React.RefObject<BottomSheetModal | null>;
        mpDispatch: (action: BusTrackingAction) => void;
        isDetailedTrackingOpen: boolean;
        setIsDetailedTrackingOpen: (open: boolean) => void;
        userLanguageStrings: strings;
    }) => {
        return useMemo(
            () => (
                <Animated.View style={tailwind.style('flex-row')}>
                    <Button
                        accessibilityRole="imagebutton"
                        size="md"
                        type="secondary"
                        prefix={<CrossIcon fill="#ffffff" />}
                        suffix={
                            <Animated.Text style={tailwind.style('text-[16px] font-areaNormal-bold text-white')}>
                                {userLanguageStrings.Exit}
                            </Animated.Text>
                        }
                        onPress={() => {
                            if (isDetailedTrackingOpen) {
                                mpDispatch({ type: 'VIEW_DETAILS', payload: { show: false } });
                                setIsDetailedTrackingOpen(false);
                            } else if (isConfirmModalOpen) {
                                confirmModalRef.current?.close();
                                mainSheetRef.current?.expand();
                                setIsConfirmModalOpen(false);
                            } else {
                                onBackPress();
                            }
                        }}
                        testID={'back-button:bus-tracking-header'}
                        style={tailwind.style('bg-[#3B3A3C]')}
                        accessibilityLabel="Go back"
                    />
                </Animated.View>
            ),
            [
                onBackPress,
                confirmModalRef,
                mainSheetRef,
                detailedTrackingModalRef,
                isConfirmModalOpen,
                setIsConfirmModalOpen,
                mpDispatch,
                isDetailedTrackingOpen,
                setIsDetailedTrackingOpen,
            ],
        );
    },
);

const BusTrackingScreen = React.memo((props: BusTrackingScreenProps) => {
    const {
        onBackPress,
        currentSelectedRoute,
        mpDispatch,
        bottomSheetFlatListRef,
        fromJourneyInfoScreen,
        minUpcomingStops,
        routeShortName,
        destinationTime,
        destinationStopName,
        availableRoutes,
        sourceStopCode: _sourceStopCode,
        vehiclePositions: _vehiclePositions,
        setCurrentSelectedRoute,
        showBusConfirmPopup,
        setShowBusConfirmPopup,
        routeStops,
        closestBusStopName,
        noOfStops,
        allBusesEtaInfo,
        detailedTrackingModalRef,
        mainSheetRef,
        confirmModalRef,
        busConfirmInfo,
        setBusConfirmInfo,
        isDetailedTrackingOpen,
        setIsDetailedTrackingOpen,
        isPreBooking,
        appName,
    } = props;

    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues('journeyDetails');
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const fallBackToSchedule = useMemo(
        () =>
            !isUndefined(availableRoutes) &&
            availableRoutes.length !== 0 &&
            (currentSelectedRoute?.source === 'GTFS' ||
                isUndefined(currentSelectedRoute) ||
                (allBusesEtaInfo ?? []).length === 0),
        [currentSelectedRoute, allBusesEtaInfo, availableRoutes],
    );

    const { mapRef } = useContext(MapContext);
    useEffect(() => {
        mapRef.current?.setCurrentLocationMarkerVisibility(true);
        if (mapRef.current) {
            mapRef.current?.addStaticMapPadding({
                left: 10,
                top: 100,
                right: 10,
                bottom: 420,
            });
        }
        return () => {
            mapRef.current?.setCurrentLocationMarkerVisibility(false);
        };
    }, []);

    const validRoutes = useMemo(() => {
        if (availableRoutes && Array.isArray(availableRoutes) && availableRoutes.length > 0) {
            return availableRoutes.map(route => ({
                busNumber: route.routeShortName,
                isActive: route.source === 'LIVE',
                routeCode: route.routeCode,
                serviceTierName: route.serviceTierName,
            }));
        }
        return [];
    }, [availableRoutes, currentSelectedRoute]);
    const handleRecenter = () => {
        mpDispatch({ type: 'RECENTER', payload: undefined });
    };
    const listData = useMemo<ListItem[]>(() => [{ type: 'header' }, { type: 'progress' }, { type: 'otherBuses' }], []);

    // Convert ETA data to seconds format for BusTrackingHeader
    const arrivalTimeInSeconds = useMemo(() => {
        return allBusesEtaInfo?.map(busInfo => busInfo.etaSeconds).filter(seconds => seconds > 0);
    }, [allBusesEtaInfo]);

    // Memoize scheduled time calculation
    const scheduledAt = useMemo(() => {
        if (
            currentSelectedRoute?.source === 'GTFS' &&
            Number.isFinite(currentSelectedRoute?.routeTimings?.[0]) &&
            Array.isArray(currentSelectedRoute?.routeTimings)
        ) {
            return new Date(Date.now() + (currentSelectedRoute.routeTimings?.[0] ?? 0) * 1000)
                .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
                .toLowerCase();
        }
        return undefined;
    }, [currentSelectedRoute?.source, currentSelectedRoute?.routeTimings]);

    // Memoize book ticket handler
    const handleBookTicket = useCallback(() => {
        if (!fromJourneyInfoScreen) {
            mpDispatch({ type: 'BOOK_TICKET', payload: undefined });
        } else {
            mpDispatch({ type: 'GO_BACK', payload: undefined });
        }
    }, [fromJourneyInfoScreen, mpDispatch]);

    // Memoize view details handler
    const handleViewDetails = useCallback(() => {
        mpDispatch({ type: 'VIEW_DETAILS', payload: { show: true } });
        setIsDetailedTrackingOpen(true);
    }, [mpDispatch]);

    const renderItem: ListRenderItem<ListItem> = useCallback(
        ({ item }) => {
            if (item.type === 'header') {
                return (
                    <View style={styles.headerContainer}>
                        <BusTrackingHeader
                            routeShortName={currentSelectedRoute?.routeShortName || routeShortName}
                            destinationStopName={destinationStopName || ''}
                            arrivalTimeInSeconds={arrivalTimeInSeconds}
                            userLanguageStrings={userLanguageStrings}
                            scheduledAt={scheduledAt}
                            onBookTicket={handleBookTicket}
                        />
                    </View>
                );
            }
            if (item.type === 'progress') {
                const isLoading = !closestBusStopName || destinationTime === '-:--pm';
                // If live data is not available, do not render the live progress component
                if (fallBackToSchedule) {
                    return (
                        <View style={[styles.otherBusesContainer]}>
                            {fallBackToSchedule && availableRoutes && availableRoutes.length > 0 && (
                                <>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[14px] mx-5 font-areaNormal-extrabold text-[#7E7E7E] capitalize',
                                        )}>
                                        {userLanguageStrings.NextBusesTo + ' '}
                                        {destinationStopName || userLanguageStrings.YourStop}
                                    </Animated.Text>
                                    <NextBusesListSection
                                        durationInMins={null}
                                        nextBusesList={(availableRoutes
                                            ? // sort it by time
                                              [...availableRoutes].sort((a, b) => {
                                                  const ta = Number(a.routeTimings?.[0] ?? Infinity);
                                                  const tb = Number(b.routeTimings?.[0] ?? Infinity);
                                                  return ta - tb;
                                              })
                                            : []
                                        ).map((i, index) => ({
                                            routeCode: i.routeCode,
                                            busNumber: i.routeShortName,
                                            timeInMins:
                                                i.routeTimings?.[0] && Number(i.routeTimings?.[0]) >= 3600
                                                    ? `${Math.round(Number(i.routeTimings?.[0]) / 3600)} ${userLanguageStrings.Hour}`
                                                    : i.routeTimings?.[0] && Number(i.routeTimings?.[0]) >= 60
                                                      ? `${Math.round(Number(i.routeTimings?.[0]) / 60)} ${userLanguageStrings.Minutes}`
                                                      : userLanguageStrings.Now,
                                            handleOnSwitch: () => {
                                                mpDispatch({
                                                    type: 'SHOW_SWITCH_BUS_ROUTE_MODAL',
                                                    payload: { routeIndex: index },
                                                });
                                            },
                                            source: i.source,
                                            serviceTierName: removeWordBuses(i?.serviceTierName),
                                        }))}
                                    />
                                </>
                            )}
                        </View>
                    );
                }
                return (
                    <View style={styles.progressContainer}>
                        <MiniBusTracking
                            mode={'Bus'}
                            currentStop={closestBusStopName || userLanguageStrings.CurrentStop}
                            destination={destinationStopName || ''}
                            destinationTime={destinationTime ? destinationTime : undefined}
                            noOfStops={noOfStops ?? 0}
                            handleOnPressViewDetails={handleViewDetails}
                            destinationTitle={userLanguageStrings.BoardingPoint}
                            currentStopTitle={userLanguageStrings.CurrentStop}
                            isLoading={isLoading}
                            nextLegMetroLineColor={undefined}
                            addTopPadding={false}
                        />
                    </View>
                );
            }
            if (item.type === 'otherBuses' && appName !== 'odishaYatri') {
                return (
                    <View style={[styles.otherBusesContainer]}>
                        {validRoutes.length > 0 && (
                            <View
                                style={tailwind.style(
                                    `${currentSelectedRoute?.source !== 'LIVE' ? 'mb-6 px-5' : ''} mt-4`,
                                )}>
                                <TicketValidIn
                                    validRoutes={validRoutes?.map(route => ({
                                        ...route,
                                        serviceTierName: removeWordBuses(route?.serviceTierName),
                                    }))}
                                    isExpandable={currentSelectedRoute?.source === 'LIVE'}
                                    onRoutePress={routeIndex => {
                                        mpDispatch({
                                            type: 'SHOW_SWITCH_BUS_ROUTE_MODAL',
                                            payload: { routeIndex: routeIndex },
                                        });
                                    }}
                                />
                            </View>
                        )}
                    </View>
                );
            }
            return null;
        },
        [
            currentSelectedRoute,
            userLanguageStrings,
            destinationTime,
            destinationStopName,
            currentSelectedRoute?.source,
            closestBusStopName,
            noOfStops,
            arrivalTimeInSeconds,
            scheduledAt,
            handleBookTicket,
            handleViewDetails,
            validRoutes,
            mpDispatch,
            setBusConfirmInfo,
            setCurrentSelectedRoute,
            mainSheetRef,
            confirmModalRef,
            setIsConfirmModalOpen,
        ],
    );
    const keyExtractor = useCallback((item: ListItem) => item.type, []);

    // Google Maps Button Component
    const GoogleMapsButton = ({
        sheetAnimatedIndex,
        sheetAnimatedPosition,
        onPress,
        additionalOffset = 0,
    }: {
        sheetAnimatedIndex: SharedValue<number>;
        sheetAnimatedPosition: SharedValue<number>;
        onPress: () => void;
        additionalOffset: number | undefined;
    }) => {
        const floatingButtonStyle = useAnimatedStyle(() => {
            return {
                transform: [
                    {
                        translateY: sheetAnimatedPosition.value - 72 - additionalOffset,
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
                    text="Directions"
                    accessibilityLabel="Open in Google Maps"
                    accessibilityRole="button"
                    prefix={<Icon icon={<GoogleNavigation fill={'#0077ff'} />} color="#0077ff" size={16} />}
                    onPress={onPress}
                />
            </Animated.View>
        );
    };

    return (
        <>
            <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                <Animated.View style={tailwind.style(`top-[${top ? top : 12}px] flex-1 px-[16px]`)}>
                    <BusTrackingRouteToggleButton
                        onBackPress={onBackPress}
                        confirmModalRef={confirmModalRef}
                        mainSheetRef={mainSheetRef}
                        isConfirmModalOpen={isConfirmModalOpen}
                        setIsConfirmModalOpen={setIsConfirmModalOpen}
                        detailedTrackingModalRef={detailedTrackingModalRef}
                        mpDispatch={mpDispatch}
                        isDetailedTrackingOpen={isDetailedTrackingOpen}
                        setIsDetailedTrackingOpen={setIsDetailedTrackingOpen}
                        userLanguageStrings={userLanguageStrings}
                    />
                </Animated.View>
                <RecenterButton
                    onPress={handleRecenter}
                    sheetAnimatedIndex={sheetAnimatedIndex}
                    sheetAnimatedPosition={sheetAnimatedPosition}
                    buttonPositionUpwardsBy={useSharedValue(0)}
                    additionalOffset={-20}
                />
                {props.googleMapsButtonProps?.userLocation && props.googleMapsButtonProps?.nearestBusStop && (
                    <GoogleMapsButton
                        sheetAnimatedIndex={sheetAnimatedIndex}
                        sheetAnimatedPosition={sheetAnimatedPosition}
                        onPress={() => {
                            const { googleMapsButtonProps } = props;
                            if (googleMapsButtonProps?.userLocation && googleMapsButtonProps?.nearestBusStop) {
                                const location: OriginAndDestinationLatLng = {
                                    originLat: googleMapsButtonProps.userLocation.lat,
                                    originLng: googleMapsButtonProps.userLocation.lon,
                                    destinationLat: googleMapsButtonProps.nearestBusStop.lat,
                                    destinationLng: googleMapsButtonProps.nearestBusStop.lon,
                                };
                                openGoogleMapsWalking(location);
                            }
                        }}
                        additionalOffset={-20}
                    />
                )}
            </Animated.View>
            <BottomSheet
                snapPoints={[Platform.OS == 'ios' ? '50%' : '60%']}
                enablePanDownToClose={false}
                style={styles.bottomSheet}
                maxDynamicContentSize={SCREEN_HEIGHT * 0.9}
                animatedIndex={sheetAnimatedIndex}
                animatedPosition={sheetAnimatedPosition}
                ref={mainSheetRef}
                handleComponent={null}
                backgroundStyle={tailwind.style('rounded-[36px] bg-white overflow-hidden')}>
                <View style={styles.bottomSheetContent}>
                    <BottomSheetFlatList
                        windowSize={1}
                        initialNumToRender={1}
                        maxToRenderPerBatch={1}
                        ref={bottomSheetFlatListRef}
                        data={listData}
                        renderItem={renderItem}
                        keyExtractor={keyExtractor}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={[
                            {
                                paddingBottom: bottom - 20,
                            },
                        ]}
                        style={styles.list}
                    />
                    {minUpcomingStops !== undefined && (
                        <View style={[styles.staticFooter, { paddingBottom: bottom }]}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] text-[#656565] text-center leading-[18px] mb-4 tracking-[0.2px]',
                                )}>
                                {minUpcomingStops > 0
                                    ? userLanguageStrings.NextBusIsStopsAwayFromYourPlace(minUpcomingStops)
                                    : minUpcomingStops === 0 && userLanguageStrings.NextBusArrivingToYourPlace}
                            </Animated.Text>
                        </View>
                    )}
                </View>
            </BottomSheet>
            {/* Bus Confirm Popup as modal */}
            <BusConfirmModal
                confirmModalRef={confirmModalRef}
                mainSheetRef={mainSheetRef}
                showBusConfirmPopup={showBusConfirmPopup}
                setShowBusConfirmPopup={setShowBusConfirmPopup}
                busConfirmInfo={busConfirmInfo}
                mpDispatch={mpDispatch}
                animatedIndex={sheetAnimatedIndex}
                animatedPosition={sheetAnimatedPosition}
                availableRoutes={availableRoutes}
                userLanguageStrings={userLanguageStrings}
                onDismiss={() => {
                    setIsConfirmModalOpen(false);
                    mainSheetRef?.current?.expand?.();
                }}
            />
            <DetailedTransitTrackingModal
                modalRef={detailedTrackingModalRef}
                mpDispatch={mpDispatch}
                mode={null}
                detailedLiveHeaderProps={{
                    title: currentSelectedRoute?.routeShortName || '',
                    icon: 'Bus',
                    isInTransitHeader: true,
                    info: `${userLanguageStrings?.ToPrefix} ${destinationStopName}`,
                    isLoading: !closestBusStopName || destinationTime === '-:--pm',
                    noOfStops: noOfStops ?? 0,
                }}
                transitTrackingProps={{
                    routeStops:
                        routeStops?.map(stop => ({
                            stopName: stop.stopName || '',
                            distance: stop.distance || 0,
                            lat: stop.lat || 0,
                            lon: stop.lon || 0,
                            stopCode: stop.stopCode,
                        })) || [],
                    boardingStopIndex: 0,
                    currentLocationStopIndex: routeStops?.findIndex(stop => stop.stopName === closestBusStopName) ?? 0,
                    approachingDestinationStopIndex: Math.max(
                        (routeStops?.findIndex(stop => stop.stopCode === _sourceStopCode) ?? 0) - 1,
                        0,
                    ),
                    finalDestinationStopIndex: routeStops?.findIndex(stop => stop.stopCode === _sourceStopCode) ?? 0,
                    boardingStopTitle: 'Starting Point',
                    boardingStopSubtitle: '',
                    destinationStopTitle: userLanguageStrings.PickupStop,
                    destinationStopSubtitle: '',
                    preDestinationMessage: isPreBooking
                        ? userLanguageStrings.YouWillBeNotifiedWhenBusReachesHere
                        : undefined,
                    isPreboarding: true,
                    mode: 'Bus',
                    nextLegMetroLineColor: undefined,
                }}
                miniTransitInfoProps={{
                    mode: 'Bus',
                    info: destinationTime ? userLanguageStrings.NextBusIn(destinationTime) : undefined,
                }}
                hasLiveTracking={currentSelectedRoute?.source === 'LIVE'}
                animatedIndex={sheetAnimatedIndex}
                animatedPosition={sheetAnimatedPosition}
            />
        </>
    );
});

const styles = StyleSheet.create({
    bottomSheet: {
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: -4,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    handleIndicator: {
        backgroundColor: '#D1D5DB',
        width: 48,
    },
    bottomSheetBackground: {
        backgroundColor: '#F4F4F4',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
    },
    list: {},
    headerContainer: {},
    progressContainer: {
        flex: 1,
    },
    otherBusesContainer: {
        marginVertical: 8,
    },
    bottomSheetContent: {
        flex: 1,
        flexDirection: 'column',
        paddingBottom: Platform.OS === 'android' ? 30 : 0,
    },
    scrollableContent: {
        flex: 1,
    },
    staticFooter: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: '#F4F4F4',
        borderTopWidth: 1,
        borderTopColor: '#E5E5E5',
    },
});

export default BusTrackingScreen;
