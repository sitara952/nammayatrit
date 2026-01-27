import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import NamasteCallout from '@/typescript/screens/home/homeComponents/NamasteCallout';
import { HomeScreenFragmentProps } from './Types';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useAnimatedContextValues } from '@/typescript/context/AnimatedValuesContext';
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { useDeepLinking } from '@/typescript/screens/home/hooks/useDeepLinking';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import TripDetailsBottomSheetModal, {
    TripDetailsBottomSheetModalProps,
} from '@/typescript/screens/lookingForRides/TripDetailsBottomSheetModal';
import TryBoostedSearchModal from '@/typescript/screens/lookingForRides/TryBoostedSearchModal';
import LocationPermission from '@/typescript/components/LocationPermission';
import { Platform } from 'react-native';
import { ReferralModalFlow } from '@/src-v2/components/ReferralModal/Flow';
import SpecialAssistance from '@/typescript/components/SpecialAssistance';
import SpecialPickUpZoneInfo from '@/typescript/components/SpecialPickUpZoneInfo';
import LogoutModal from '@/typescript/components/LogOut';
import {
    BottomSheetStage,
    selectOperatingCity,
    selectCurrentLocation,
    selectCurrentLocationCoords,
    selectSearchedSource,
    selectGreetedUser,
    selectIsPickup,
} from '@/typescript/state/client/session';
import BottomSheet, { BottomSheetScrollView, SCREEN_HEIGHT, WINDOW_HEIGHT } from '@gorhom/bottom-sheet';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import HomeSheetComponent from './homeComponents/HomeSheetComponent';
import ConfirmPickup from '../ConfirmPickup/Flow';
import LookingForRidesFlow from '../LookingForRides/Flow';
import RetryBoostedSearch from '@/typescript/screens/retryBoostedSearch';
import { MemoizedChooseRideFlow } from '../ChooseRide/Flow';
import { MapContext } from '@/typescript/Maps/MapContext';
import NavigationButtonOverlay from '@/typescript/screens/home/homeComponents/overlayViews/NavigationButtonOverlay';
import HomeOverlay from '@/typescript/screens/home/homeComponents/overlayViews/HomeOverlay';
import ConfirmPickupOverlay from '@/typescript/screens/home/homeComponents/overlayViews/ConfirmPickupOverlay';
import { ChooseRideFooter } from '@/typescript/designSystem/components/ChooseRideFooter';
import { ConfirmPickupFooter } from '@/typescript/designSystem/components/ConfirmPickupFooter';
import { BottomSheetDefaultHandleProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetHandle/types';
import MultimodalHome from '@/src-v2/multimodal/screens/Home/Flow';
import {
    BottomSheetTopBanner,
    BottomSheetTopBannerType,
    getEstimatesBottomSheetTopBannerType,
} from '@/typescript/designSystem/components/BottomSheetTopBanner';
import ErrorStates from '@/typescript/screens/ErrorStates';

import { IntercitySearchDetails } from '../Search/components/IntercitySearchDetails';
import { SearchModalFlow } from '../Search/Flow';
import { Profiler } from '@/typescript/hooks/useComponentProfiler.tsx';
import SelectFollower from '../FollowRide/components/SelectFollower';
import {
    selectIsEditClicked,
    selectIsSearchBoosted,
    TripCategory,
    selectIsPetRide,
    selectTripTypeSelection,
} from '@/typescript/state/client/search';
import InsuranceCard from '@/src-v2/components/BannerPopups/InsuranceCard';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import LookingForRidesOverlay from '@/typescript/screens/home/homeComponents/overlayViews/LookingForRidesOverlay';
import { useFetchFareCache } from '@/src-v2/hooks/useFetchFareCache';
import colors from '@/typescript/designSystem/colorPalette';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { BookingId, selectSearchId } from '@/typescript/state/client/user';
import { selectNewFeatureFlags } from '@/typescript/state/client/session';
import {
    selectBusOtpLastClickLocation,
    setBusOtpLastClickLocation as setBusOtpLastClickLocationAction,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { selectSelectedPricingItems } from '@/typescript/state/client/search';

import { RecentTransitList } from './homeComponents/RecentTransitList';
import { useRecentMultimodalTrips } from '@/src-v2/multimodal/hooks/useRecentMultimodalTrips';
import BookBusButton from '@/src-v2/multimodal/screens/BusOtpFlow/BookBusButton';
import { logEvent, EventName } from '@/typescript/utils/logger';

export const HomeScreenFragment: React.FC<HomeScreenFragmentProps> = ({
    bottomSheetStage,
    profile,
    navigation,
    screenReaderEnabled,
    specialAssistance,
    hideAccessibility,
    setHideAccessibility,
    isMultimodal,
    locationGranted,
    checkingForGps,
    sourceData,
    progress,
    searchPollingInterval,
    stopSearch,
    resetSearch,
    recenterLocation,
    setLocationGranted,
    navigateToSearch,
    retryBoostSearchBackPress,
    setIsTryBoostedSearchModalOpen,
    isTryBoostedSearchModalOpen,
    multimodalProps,
}: HomeScreenFragmentProps) => {
    // To trigger useEffects which are depends on currentLocationCoords.
    // @TODO: Find a better way to trigger useEffects.
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const searchId = useAppSelector(state => selectSearchId(state, null));
    const { top, bottom } = useSafeAreaInsets();
    const [isErrorStateModalVisible, setIsErrorStateModalVisible] = useState(false);

    const {
        newBookingFlowSheetRef,
        locationPermissionModalRef,
        tripDetailsBottomSheetModalRef,
        logoutModalRef,
        specialPickUpInfoBottomSheetModalRef,
        rideInsuranceBottomSheetModalRef,
        bottomSheetTopBannerRef,
        followRideModalRef,
        chatFooterTextRef,
        specialAssistanceBottomSheetModalRef,
    } = useRefsContext();

    const isSearchBoosted = useAppSelector(state => selectIsSearchBoosted(state, null));
    const isEditClicked = useAppSelector(state => selectIsEditClicked(state, null));
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues(undefined);
    const { referralModalRef, utmReferralCode } = useDeepLinking();
    const cancellationBannerHeight = useSharedValue(0);
    const { mapRef } = useContext(MapContext);
    const selectedPricingItem = useAppSelector(state => selectSelectedPricingItems(state, null)).at(0);
    const [height, setHeight] = useState(0);
    const isPetRide = useAppSelector(state => selectIsPetRide(state, null));
    const selectedTripType = useAppSelector(state => selectTripTypeSelection(state, searchId));
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const dispatch = useAppDispatch();

    const [isReferralApplied, setReferralApplied] = useState(false);
    const [errorStateBookingId, setErrorStateBookingId] = useState<BookingId | null>(null);
    const [tripDetailsBottomSheetModalProps] = useState<TripDetailsBottomSheetModalProps>({ bookingId: null });
    const operatingCity = useAppSelector(selectOperatingCity);
    const currentLocation = useAppSelector(selectCurrentLocation);
    const currentLocationCoords = useAppSelector(selectCurrentLocationCoords);
    const existingBusOtpLastClick = useAppSelector(selectBusOtpLastClickLocation);
    const [isScrolled, setIsScrolled] = useState(false);
    const pricingItems = useAppSelector(state => selectSelectedPricingItems(state, null));
    const isInsured = pricingItems.some(item => item.isInsured);
    const lookingForRidesTipEnabled = useAppSelector(selectNewFeatureFlags).lookingForRidesTipEnabled;
    const { recentMultimodalTrips: recentTrips } = useRecentMultimodalTrips(!isMultimodal);
    const [isLiveBusTracking, setIsLiveBusTracking] = useState(false);
    const appConfig = useAppSelector(selectAppConfig);

    const showErrorStatesModal = useCallback((bookingId: BookingId | null) => {
        setErrorStateBookingId(bookingId);
        setIsErrorStateModalVisible(true);
    }, []);

    const followModalOnDismiss = () => {
        chatFooterTextRef?.current?.focus();
        chatFooterTextRef?.current?.clear();
    };

    const handleIndicatorAnimatedStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(sheetAnimatedIndex.value, [0, 1], ['#dedee0', '#fff']);
        return { backgroundColor };
    });
    // todo - moving it to HomeOverlay
    // const buttonPositionUpwards = useMemo(() => {
    //     if (
    //         customerCancellationBannerConfig.showBanner &&
    //         profile?.cancellationRate &&
    //         profile?.cancellationRate > customerCancellationBannerConfig.percentage
    //     ) {
    //         return true;
    //     } else {
    //         cancellationBannerHeight.value = 0;
    //         return false;
    //     }
    // }, [profile?.cancellationRate]);

    // const handleAnimatedStyle = useAnimatedStyle(() => {
    //     const borderTopLeftRadius = interpolate(sheetAnimatedIndex.value, [0, 1], [32, 0]);
    //     const borderTopRightRadius = interpolate(sheetAnimatedIndex.value, [0, 1], [32, 0]);

    //     const backgroundColor = interpolateColor(sheetAnimatedIndex.value, [0, 1], [homeSheetBg, '#ffffff']);

    //     const height =
    //         sheetAnimatedIndex.value > 0
    //             ? interpolate(sheetAnimatedIndex.value, [0, 1], [10, hasDynamicIslandSV.value ? 15 : 0])
    //             : 15;

    //     if (Platform.OS === 'ios') {
    //         return {
    //             borderTopLeftRadius,
    //             borderTopRightRadius,
    //             backgroundColor,
    //             height,
    //         };
    //     }
    //     return { backgroundColor, height, borderTopLeftRadius: undefined };
    // });

    const snapPoints = useMemo(() => {
        switch (bottomSheetStage) {
            case BottomSheetStage.Home: {
                if (isMultimodal && height > 0 && WINDOW_HEIGHT) {
                    // const bottomTabBarHeight = 90 + bottom + 250;
                    // const availableHeight = WINDOW_HEIGHT - bottomTabBarHeight;
                    // const snapPercent = Math.min(100, Math.round((height / availableHeight) * 100));
                    return appConfig.uiConfig.homeScreenSnapPoints;
                }
                return appConfig.uiConfig.homeScreenSnapPoints;
            }
            case BottomSheetStage.Search:
                return ['100%'];
            case BottomSheetStage.IntercitySearchDetails:
                return ['100%'];
            case BottomSheetStage.ConfirmPickup:
                return undefined;
            case BottomSheetStage.LookingForRides:
                if (isSearchBoosted) {
                    if (isEditClicked)
                        return [
                            Math.min(
                                SCREEN_HEIGHT - top - (Platform.OS === 'ios' ? 45 : 95),
                                (lookingForRidesTipEnabled ? 530 : 430) + height + bottom,
                            ),
                        ];
                    return [450 + bottom];
                }
                return selectedPricingItem?.tripCategory === TripCategory.OneWay
                    ? [
                          190 + bottom,
                          Math.min((lookingForRidesTipEnabled ? 470 : 380) + height + bottom, SCREEN_HEIGHT - top - 45),
                      ]
                    : [190 + bottom];
            case BottomSheetStage.ChooseRide:
                return screenReaderEnabled ? ['90%'] : ['68%', SCREEN_HEIGHT - (top || 12)];
            case BottomSheetStage.RetryBoostedSearch:
                return [
                    Math.min(
                        (lookingForRidesTipEnabled ? 485 : 385) +
                            bottom +
                            height +
                            (selectedPricingItem ? 60 : 0) +
                            (Platform.OS === 'ios' ? 50 : 0),
                        SCREEN_HEIGHT - top - (Platform.OS === 'ios' ? 45 : 95),
                    ),
                ];
            case BottomSheetStage.SearchErrorStates:
                return undefined;
        }
    }, [bottomSheetStage, isSearchBoosted, isEditClicked, selectedPricingItem, height]);

    const enableDynamicSizing = useMemo(() => {
        switch (bottomSheetStage) {
            case BottomSheetStage.Home:
                return false;
            case BottomSheetStage.Search:
                return false;
            case BottomSheetStage.IntercitySearchDetails:
                return false;
            case BottomSheetStage.ConfirmPickup:
                return true;
            case BottomSheetStage.LookingForRides:
                return false;
            case BottomSheetStage.RetryBoostedSearch:
                return false;
            case BottomSheetStage.ChooseRide:
                return false;
            case BottomSheetStage.SearchErrorStates:
                return true;
        }
    }, [bottomSheetStage]);

    const onBottomSheetTopBannerPress = useCallback(
        (type: BottomSheetTopBannerType | undefined) => {
            switch (type) {
                case BottomSheetTopBannerType.SpecialPickUpLocation:
                    specialPickUpInfoBottomSheetModalRef?.current?.present();
                    return;
                case BottomSheetTopBannerType.RideInsurance:
                    rideInsuranceBottomSheetModalRef?.current?.present();
                    return;
                case BottomSheetTopBannerType.PetRide:
                    // Pet ride toggle is now handled in TripTypeSelectorModal only
                    return;
                case BottomSheetTopBannerType.BusinessRide:
                    return;
                default:
                    if (screenReaderEnabled) {
                        setHideAccessibility(true);
                    }
                    specialAssistanceBottomSheetModalRef?.current?.present();
            }
        },
        [screenReaderEnabled, specialPickUpInfoBottomSheetModalRef, specialAssistanceBottomSheetModalRef],
    );
    const isPickup = useAppSelector(selectIsPickup);
    const source = useAppSelector(selectSearchedSource);
    const greetedUser = useAppSelector(selectGreetedUser);
    const [isPickupSpecialLocation, setIsPickupSpecialLocation] = useState(false);

    useEffect(() => {
        if (isPickup)
            setIsPickupSpecialLocation(prevState => {
                const newState = !!source?.specialLocation;
                return prevState !== newState ? newState : prevState;
            });
        else {
            setIsPickupSpecialLocation(false);
        }
    }, [source?.specialLocation, isPickup]);

    const renderHandleComponent = useCallback(
        (props: BottomSheetDefaultHandleProps) => {
            // handling Bottom sheet top banner
            switch (bottomSheetStage) {
                case BottomSheetStage.ChooseRide:
                    bottomSheetTopBannerRef.current = true;
                    break;
                case BottomSheetStage.Search:
                    bottomSheetTopBannerRef.current = false;
                    break;
                case BottomSheetStage.LookingForRides:
                    bottomSheetTopBannerRef.current = false;
                    break;
                case BottomSheetStage.RetryBoostedSearch:
                    bottomSheetTopBannerRef.current = false;
                    break;
                case BottomSheetStage.ConfirmPickup:
                    bottomSheetTopBannerRef.current = isPickupSpecialLocation;
                    break;
                default:
                    bottomSheetTopBannerRef.current = false;
                    break;
            }
            if (bottomSheetStage == BottomSheetStage.LookingForRides) {
                return (
                    <Animated.View
                        style={[
                            {
                                width: '100%',
                                paddingTop: 14,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                backgroundColor: '#F8F8F8',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            },
                        ]}>
                        {selectedPricingItem?.tripCategory === TripCategory.OneWay && !isSearchBoosted ? (
                            <Animated.View
                                style={[
                                    {
                                        height: 4,
                                        width: 44,
                                        borderRadius: 4,
                                        backgroundColor: colors.primitive.gray[2],
                                    },
                                ]}
                            />
                        ) : null}
                    </Animated.View>
                );
            }
            return bottomSheetStage === BottomSheetStage.Home ? (
                <Animated.View
                    style={[
                        {
                            width: '100%',
                            paddingTop: 10,
                            paddingBottom: 9,
                            borderTopStartRadius: 24,
                            borderTopRightRadius: 24,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: 15,
                            overflow: 'visible',
                        },
                    ]}>
                    {appConfig.uiConfig.showNamasteCallout && greetedUser === true ? (
                        <NamasteCallout />
                    ) : (
                        <Animated.View
                            style={[
                                handleIndicatorAnimatedStyle,
                                {
                                    height: 4,
                                    width: 50,
                                    borderRadius: 1.5,
                                    backgroundColor: '#dedee0',
                                },
                            ]}
                        />
                    )}
                </Animated.View>
            ) : (
                <BottomSheetTopBanner
                    hideAccessibility={hideAccessibility}
                    {...props}
                    onBannerPress={onBottomSheetTopBannerPress}
                    bannerType={getEstimatesBottomSheetTopBannerType(
                        profile?.hasDisability,
                        specialAssistance,
                        bottomSheetStage,
                        isInsured && featureFlags.showInsurancePolicy,
                        isPetRide && featureFlags.enablePetRide,
                        selectedTripType,
                    )}
                    showInfo={bottomSheetStage !== BottomSheetStage.ConfirmPickup}
                    showCircleInfo={bottomSheetStage === BottomSheetStage.ChooseRide}
                    showHandle={
                        bottomSheetStage !== BottomSheetStage.IntercitySearchDetails &&
                        bottomSheetStage !== BottomSheetStage.Search &&
                        bottomSheetStage !== BottomSheetStage.ConfirmPickup &&
                        bottomSheetStage !== BottomSheetStage.RetryBoostedSearch
                    }
                    handlerBGColor={themeColors.Fill_neutralUltraLow}
                />
            );
        },
        [
            isPickupSpecialLocation,
            bottomSheetStage,
            onBottomSheetTopBannerPress,
            handleIndicatorAnimatedStyle,
            hideAccessibility,
            profile?.hasDisability,
            specialAssistance,
            isSearchBoosted,
            isInsured,
            isPetRide,
            featureFlags.enablePetRide,
            selectedTripType,
            appConfig.uiConfig.showNamasteCallout,
            greetedUser,
        ],
    );

    const maxDynamicContentSize = useMemo(() => {
        switch (bottomSheetStage) {
            case BottomSheetStage.ConfirmPickup:
                return SCREEN_HEIGHT * 0.46;
            default:
                return undefined;
        }
    }, [bottomSheetStage]);

    useFetchFareCache(operatingCity, currentLocation, isMultimodal);

    // Calculate border radius based on banner type
    const currentBannerType = getEstimatesBottomSheetTopBannerType(
        profile?.hasDisability,
        specialAssistance,
        bottomSheetStage,
        isInsured && featureFlags.showInsurancePolicy,
        isPetRide && featureFlags.enablePetRide,
        selectedTripType,
    );

    const bottomSheetBorderRadius =
        currentBannerType === BottomSheetTopBannerType.PetRide ||
        currentBannerType === BottomSheetTopBannerType.RideConfirmedPetRide
            ? 34
            : 32;

    return (
        <>
            <BottomSheet
                index={isLiveBusTracking ? -1 : 0}
                accessible={false}
                animationConfigs={{ duration: 150 }}
                ref={newBookingFlowSheetRef}
                animatedIndex={sheetAnimatedIndex}
                animatedPosition={sheetAnimatedPosition}
                backgroundStyle={[
                    {
                        backgroundColor: homeSheetBg,
                        shadowColor: '#000',
                        shadowOffset: {
                            width: 0,
                            height: 0,
                        },
                        shadowOpacity: 0.1,
                        shadowRadius: 50,
                        borderTopLeftRadius: bottomSheetBorderRadius,
                        borderTopRightRadius: bottomSheetBorderRadius,
                        elevation: Platform.OS === 'android' && Platform.Version >= 29 ? 50 : undefined,
                    },
                ]}
                topInset={0}
                handleComponent={bottomSheetStage !== BottomSheetStage.Search ? renderHandleComponent : null}
                enableOverDrag={bottomSheetStage === BottomSheetStage.Home && isMultimodal}
                enableDynamicSizing={enableDynamicSizing}
                maxDynamicContentSize={maxDynamicContentSize}
                handleStyle={[tailwind.style('h-[26px]')].concat(
                    bottomSheetStage === BottomSheetStage.ChooseRide
                        ? [{ backgroundColor: themeColors.Fill_neutralUltraLow }]
                        : [],
                    // bottomSheetStage === BottomSheetStage.Home ? [tailwind.style(handleAnimatedStyle)] : [],
                )}
                style={{
                    borderTopLeftRadius: bottomSheetBorderRadius,
                    borderTopRightRadius: bottomSheetBorderRadius,
                    zIndex: 1,
                    backgroundColor: homeSheetBg,
                }}
                snapPoints={snapPoints}>
                {isMultimodal && bottomSheetStage === BottomSheetStage.Home ? (
                    <BottomSheetScrollView
                        style={tailwind.style(` pb-[${bottom || 12}]px`)}
                        accessible={false}
                        showsVerticalScrollIndicator={false}>
                        <MultimodalHome
                            recenterLocation={recenterLocation}
                            addStaticMapPadding={mapRef.current?.addStaticMapPadding}
                            isVisible={true}
                            onHeightChange={setHeight}
                            isLiveBusTracking={isLiveBusTracking}
                        />
                    </BottomSheetScrollView>
                ) : (
                    <>
                        {bottomSheetStage === BottomSheetStage.Home && !isMultimodal ? (
                            <Profiler componentName="HomeSheetComponent">
                                <HomeSheetComponent
                                    recenterLocation={recenterLocation}
                                    addStaticMapPadding={mapRef.current?.addStaticMapPadding}
                                    isVisible={bottomSheetStage === BottomSheetStage.Home}
                                />
                            </Profiler>
                        ) : null}
                        <ConditionalWrapper stage={bottomSheetStage} currentStage={BottomSheetStage.Search}>
                            <Profiler componentName="SearchModal">
                                <SearchModalFlow sourceData={sourceData} isMultimodal={isMultimodal} />
                            </Profiler>
                        </ConditionalWrapper>
                        <ConditionalWrapper
                            stage={bottomSheetStage}
                            currentStage={BottomSheetStage.IntercitySearchDetails}>
                            <IntercitySearchDetails backPress={navigateToSearch} />
                        </ConditionalWrapper>
                        <ConditionalWrapper stage={bottomSheetStage} currentStage={BottomSheetStage.ConfirmPickup}>
                            <Profiler componentName="ConfirmPickup">
                                <ConfirmPickup
                                    addStaticMapPadding={mapRef.current?.addStaticMapPadding}
                                    isMultimodal={isMultimodal}
                                />
                            </Profiler>
                        </ConditionalWrapper>
                        <ConditionalWrapper stage={bottomSheetStage} currentStage={BottomSheetStage.LookingForRides}>
                            <Profiler componentName="LookingForRides">
                                <LookingForRidesFlow
                                    progressRef={progress}
                                    searchPollingInterval={searchPollingInterval}
                                    stopSearch={stopSearch}
                                    showErrorStatesModal={showErrorStatesModal}
                                    resetSearch={resetSearch}
                                    setHeight={setHeight}
                                    multimodalProps={multimodalProps}
                                    setIsTryBoostedSearchModalOpen={setIsTryBoostedSearchModalOpen}
                                />
                            </Profiler>
                        </ConditionalWrapper>
                        <ConditionalWrapper stage={bottomSheetStage} currentStage={BottomSheetStage.RetryBoostedSearch}>
                            <RetryBoostedSearch
                                retryBoostSearchBackPress={retryBoostSearchBackPress}
                                resetSearch={resetSearch}
                                setHeight={setHeight}
                            />
                        </ConditionalWrapper>
                        {bottomSheetStage === BottomSheetStage.SearchErrorStates ? <></> : null}
                    </>
                )}
                <ConditionalWrapper stage={bottomSheetStage} currentStage={BottomSheetStage.ChooseRide}>
                    <Profiler componentName="ChooseRide">
                        <MemoizedChooseRideFlow
                            navigation={navigation}
                            showErrorStatesModal={showErrorStatesModal}
                            hideAccessibility={hideAccessibility}
                            setHideAccessibility={setHideAccessibility}
                            setIsScrolled={setIsScrolled}
                            searchId={searchId}
                            bookAnyVisible={true}
                            selectedMultimodalLeg={null}
                        />
                    </Profiler>
                </ConditionalWrapper>
            </BottomSheet>

            {bottomSheetStage === BottomSheetStage.Home && appConfig.uiConfig.showOtpBusButton && (
                <Animated.View
                    style={[
                        tailwind.style('flex-row items-center justify-center mb-4 absolute bottom-0'),
                        {
                            alignSelf: 'center',
                            shadowColor: '#000000',
                            shadowOffset: {
                                width: 1,
                                height: -4,
                            },
                            shadowOpacity: 0.2,
                            shadowRadius: 20,
                            elevation: 4,
                        },
                    ]}>
                    <BookBusButton
                        onPress={() => {
                            logEvent(EventName.MT_HOME_BUS_OTP);
                            // If we already have a stored click location for bus otp, do not overwrite it
                            if (existingBusOtpLastClick && Date.now() - existingBusOtpLastClick.ts <= 5 * 60 * 1000) {
                                navigation.navigate(
                                    'HomeTab',
                                    {
                                        screen: 'busOtpFlow',
                                        params: {
                                            state: 'Booking',
                                            params: undefined,
                                            displaySearchBar: false,
                                            activePassId: undefined,
                                            locationData: undefined,
                                        },
                                    },
                                    { pop: true },
                                );
                                return;
                            }

                            const coords = currentLocationCoords?.coords
                                ? {
                                      latitude: currentLocationCoords.coords.latitude,
                                      longitude: currentLocationCoords.coords.longitude,
                                  }
                                : undefined;
                            if (coords && typeof coords.latitude === 'number' && typeof coords.longitude === 'number') {
                                dispatch(
                                    setBusOtpLastClickLocationAction({
                                        latitude: coords.latitude,
                                        longitude: coords.longitude,
                                    }),
                                );
                            }
                            navigation.navigate(
                                'HomeTab',
                                {
                                    screen: 'busOtpFlow',
                                    params: {
                                        state: 'Booking',
                                        params: undefined,
                                        displaySearchBar: false,
                                        activePassId: undefined,
                                        locationData: undefined,
                                    },
                                },
                                { pop: true },
                            );
                        }}
                    />
                </Animated.View>
            )}

            {/* {bottomSheetStage === BottomSheetStage.Home && isMultimodal && <FloatingMascot />} */}
            {bottomSheetStage === BottomSheetStage.LookingForRides && <LookingForRidesOverlay />}
            {
                <NavigationButtonOverlay
                    hideAccessibility={hideAccessibility}
                    navigateToSearch={navigateToSearch}
                    setIsTryBoostedSearchModalOpen={setIsTryBoostedSearchModalOpen}
                    multimodalProps={multimodalProps}
                />
            }
            {bottomSheetStage === BottomSheetStage.Home && (
                <HomeOverlay
                    onRecenterPress={recenterLocation}
                    buttonPositionUpwardsBy={cancellationBannerHeight}
                    isMultimodal={isMultimodal}
                    additionalOffset={isMultimodal && recentTrips.length > 0 ? 65 : 0}
                    setIsLiveBusTracking={setIsLiveBusTracking}
                    isLiveBusTracking={isLiveBusTracking}
                    mapRef={mapRef}
                />
            )}
            {isMultimodal &&
            recentTrips.length > 0 &&
            bottomSheetStage === BottomSheetStage.Home &&
            !isLiveBusTracking ? (
                <RecentTransitList journeyIncludes={recentTrips} />
            ) : null}

            {/* // todo - moving it to HomeOverlay */}
            {/* {bottomSheetStage === BottomSheetStage.Home && buttonPositionUpwards ? (
                <CancellationHighBanner
                    onLayout={event => {
                        cancellationBannerHeight.value = event.nativeEvent.layout.height;
                    }}
                    sheetAnimatedIndex={sheetAnimatedIndex}
                    sheetAnimatedPosition={sheetAnimatedPosition}
                    bannerPosition={cancellationBannerHeight}
                />
            ) : null} */}
            {bottomSheetStage === BottomSheetStage.ConfirmPickup && (
                <ConfirmPickupOverlay
                    onRecenterPress={recenterLocation}
                    buttonPositionUpwardsBy={cancellationBannerHeight}
                />
            )}
            {bottomSheetStage === BottomSheetStage.ChooseRide && (
                <>
                    <ChooseRideFooter
                        multimodalProps={multimodalProps}
                        hideAccessibility={hideAccessibility}
                        isScrolled={isScrolled}
                        searchId={searchId}
                    />
                </>
            )}
            {bottomSheetStage === BottomSheetStage.ConfirmPickup && <ConfirmPickupFooter />}
            <PopUpModal
                sheetRef={tripDetailsBottomSheetModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <TripDetailsBottomSheetModal {...tripDetailsBottomSheetModalProps} />
            </PopUpModal>
            <AnimatedModal
                visible={isTryBoostedSearchModalOpen}
                setVisible={setIsTryBoostedSearchModalOpen}
                animationDuration={300}>
                <TryBoostedSearchModal
                    resetSearch={resetSearch}
                    retryCancelClicked={retryBoostSearchBackPress}
                    setIsTryBoostedSearchModalOpen={setIsTryBoostedSearchModalOpen}
                    multimodalProps={multimodalProps}
                />
            </AnimatedModal>
            <ErrorStates
                bookingId={errorStateBookingId}
                visible={isErrorStateModalVisible}
                setVisible={setIsErrorStateModalVisible}
            />
            <PopUpModal
                enablePanDownToClose={false}
                sheetRef={locationPermissionModalRef}
                showBackdrop={undefined}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <LocationPermission
                    locationGranted={locationGranted}
                    setLocationGranted={setLocationGranted}
                    checkingForGps={checkingForGps}
                />
            </PopUpModal>
            {/* Referral Modal View with API Status Component */}
            {!isReferralApplied && (
                <PopUpModal
                    sheetRef={referralModalRef}
                    enableDynamicSizing={true}
                    keyboardBlurBehavior="restore"
                    onHardwareBackPress={undefined}
                    isScrollable={false}
                    activeOffsetX={undefined}
                    showBackdrop={undefined}
                    activeOffsetY={undefined}
                    failOffsetY={undefined}
                    failOffsetX={undefined}
                    simultaneousHandlers={undefined}
                    waitFor={undefined}>
                    <ReferralModalFlow setReferralApplied={setReferralApplied} utmReferralCode={utmReferralCode} />
                </PopUpModal>
            )}
            <PopUpModal
                sheetRef={specialAssistanceBottomSheetModalRef}
                showBackdrop={undefined}
                onDismiss={() => {
                    if (screenReaderEnabled) {
                        setHideAccessibility(false);
                    }
                }}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <SpecialAssistance />
            </PopUpModal>
            <PopUpModal
                sheetRef={specialPickUpInfoBottomSheetModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <SpecialPickUpZoneInfo />
            </PopUpModal>
            <PopUpModal
                sheetRef={rideInsuranceBottomSheetModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <InsuranceCard rideAssigned={false} policyGenerated={false} policyDetails={null} insuredAmount={''} />
            </PopUpModal>
            <PopUpModal
                sheetRef={logoutModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <LogoutModal buttonColor={undefined} navigateBack={undefined} closeModal={undefined} />
            </PopUpModal>

            <PopUpModal
                showBackdrop={undefined}
                onDismiss={followModalOnDismiss}
                sheetRef={followRideModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                isScrollable={false}>
                <SelectFollower />
            </PopUpModal>
        </>
    );
};

const ConditionalWrapper = ({
    currentStage,
    stage,
    children,
}: {
    currentStage: BottomSheetStage;
    stage: BottomSheetStage;
    children: React.ReactNode;
}) => {
    return currentStage === stage ? children : null;
};

export const homeSheetBg = '#F8F8F8';
