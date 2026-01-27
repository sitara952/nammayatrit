import { FC, memo, useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeOut, interpolate, LinearTransition, useAnimatedStyle } from 'react-native-reanimated';
import {
    selectReferralAmountToCollect,
    selectReferralApplied,
    selectUserProfile,
    selectPayoutVpa,
} from '@/typescript/state/client/user';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { ReferralButton } from '@/src-v2/screens/Referral/components/ReferralButton.tsx';
import { useAnimatedContextValues } from '../../../../context/AnimatedValuesContext';
import RecenterButton from '@/typescript/designSystem/components/RecenterButton';
import { SharedValue } from 'react-native-reanimated';
import { GeolocationResponse } from '@/typescript/utils/location';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { FloatingView } from '@/typescript/components/FloatingView';
import mt_say_hi_lottie_v2 from '@/typescript/assets/ny-service/mt_ic_hi_lottie2.lottie';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import {
    selectGreetedUser,
    setGreetedUser,
    selectNewFeatureFlags,
    selectReferralYouGet,
    selectReferralPayoutConfigV2,
    lottieConfigs,
    selectCityConfig,
    selectAppConfig,
} from '@/typescript/state/client/session';
import { FloatingHeader } from '@/typescript/designSystem/FloatingHeader';
import { MoneyIcon } from '@/typescript/assets/svg/symbols/MoneyIcon';
import Button from '@/src-v2/primitives/Button';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { CollectReferralEarningFlow } from '@/src-v2/components/CollectReferralEarning/Flow';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { ReferralInfoModalFlow } from '@/src-v2/components/ReferralInfoModal/Flow';
import { getStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import { logger } from '@/src-v2/systems/logger';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';
import { CancellationWarningBanner } from '@/typescript/components/CancellationWarningBanner';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { selectShowNearbyLiveTrack, setShowNearbyLiveTrack } from '@/typescript/state/client/maps';
import { shallowEqual } from 'react-redux';
import { MapRef } from '@/typescript/Maps/MapComponent';
import { debounce } from 'lodash';
import { Pulse } from '@/src-v2/multimodal/screens/NewLiveJourney/components/LocationRefreshBadge';
import { Icon } from '@/typescript/components/Icon';
import { LiveOff } from '@/typescript/components/svg/search/LiveOff';
import CrossIcon from '@/src-v2/assets/svg/CrossIcon';
import { colors } from 'config-types/src/domain/default/themes/colors';

type HomeOverlayProps = {
    onRecenterPress: (zoomLevel?: number, position?: GeolocationResponse) => void;
    buttonPositionUpwardsBy: SharedValue<number>;
    isMultimodal: boolean;
    additionalOffset: number | undefined;
    setIsLiveBusTracking: (value: boolean) => void;
    isLiveBusTracking: boolean;
    mapRef: React.RefObject<MapRef | null>;
};

export const HomeOverlay: FC<HomeOverlayProps> = ({
    onRecenterPress,
    buttonPositionUpwardsBy,
    isMultimodal,
    additionalOffset = 0,
    setIsLiveBusTracking,
    isLiveBusTracking,
    mapRef,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { sheetAnimatedIndex, sheetAnimatedPosition } = useAnimatedContextValues(undefined);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const {
        referralModalRef,
        collectReferralEarningModalRef,
        newBookingFlowSheetRef,
        referralInfoModalRef,
        referralModalAfterOnboardingRef,
    } = useRefsContext();
    const referralAppliedFromStore = useAppSelector(selectReferralApplied);
    const userProfile = useAppSelector(selectUserProfile);
    const greetedUser = useAppSelector(selectGreetedUser);
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const referralAmountToCollect = useAppSelector(selectReferralAmountToCollect);
    const referralYouGet = useAppSelector(selectReferralYouGet);
    const referralPayoutConfigV2 = useAppSelector(selectReferralPayoutConfigV2);
    const payoutVpa = useAppSelector(selectPayoutVpa);
    const isFirstRideTaken = getStringItem(MMKVKey.CUSTOMER_FIRST_RIDE);
    const customerCancellationBannerConfig = useAppSelector(state =>
        selectCityConfig(state, 'customer_cancellation_banner_threshold'),
    );
    const dispatch = useAppDispatch();
    const cancellationBannerTexts = useAppSelector(state => selectCityConfig(state, 'cancellation_banner_texts'));
    const appConfig = useAppSelector(selectAppConfig);

    // State for cancellation warning banner
    const [showCancellationWarning, setShowCancellationWarning] = useState(true);

    // Determine if banner should be visible based on config and user's cancellation rate
    const shouldShowCancellationBanner = useMemo(
        () =>
            showCancellationWarning &&
            customerCancellationBannerConfig?.showBanner &&
            userProfile?.cancellationRate !== undefined &&
            userProfile?.cancellationRate > customerCancellationBannerConfig?.percentage,
        [
            showCancellationWarning,
            customerCancellationBannerConfig?.showBanner,
            customerCancellationBannerConfig?.percentage,
            userProfile?.cancellationRate,
        ],
    );
    const animatedHamburgerOpacity = useAnimatedStyle(() => {
        const opacity = interpolate(sheetAnimatedIndex.value, [0, 1], [1, 0]);
        return { opacity };
    });

    const showNearbyLiveTrack = useAppSelector(
        state => selectShowNearbyLiveTrack(state, 'MapBeforeRide'),
        shallowEqual,
    );

    const toggleLiveTracking = useCallback(() => {
        if (!isLiveBusTracking) {
            newBookingFlowSheetRef?.current?.close();
            mapRef?.current?.addStaticMapPadding({ top: 0, bottom: 0, left: 0, right: 0 });
        } else {
            newBookingFlowSheetRef?.current?.snapToIndex(0);
            mapRef?.current?.addStaticMapPadding({ top: 0, bottom: 300, left: 0, right: 0 });
        }
        setTimeout(() => {
            if (Platform.OS == 'android') onRecenterPress();
        }, 500);
        dispatch(setShowNearbyLiveTrack({ id: 'MapBeforeRide', payload: !showNearbyLiveTrack }));
        setIsLiveBusTracking(!isLiveBusTracking);
    }, [newBookingFlowSheetRef, mapRef, showNearbyLiveTrack, isLiveBusTracking, setIsLiveBusTracking]);

    const onLiveTrackingToggle = useMemo(
        () => debounce(toggleLiveTracking, 300, { leading: false, trailing: true }),
        [toggleLiveTracking],
    );

    const getSuffixButtons = useCallback(() => {
        if (isMultimodal) return [];
        else if (!referralAppliedFromStore && !isFirstRideTaken) {
            return [
                <ReferralButton
                    key="referral"
                    onPress={() => referralModalRef?.current?.present()}
                    style={undefined}
                />,
            ];
        } else if (
            userProfile?.isPayoutEnabled &&
            referralAppliedFromStore &&
            !isFirstRideTaken &&
            (referralPayoutConfigV2?.theyGet ?? 0) > 0
        ) {
            return [
                <Animated.View style={[animatedHamburgerOpacity]}>
                    <Button
                        testID="home_overlay_take_ride_and_earn"
                        size="md"
                        type="primary"
                        showLoader={false}
                        onPress={() => {
                            referralModalAfterOnboardingRef.current?.present();
                        }}
                        prefix={<MoneyIcon fill={themeColors.Fill_neutralMin} />}
                        text={`${userLanguageStrings.TakeRideAndEarn} ${CURRENCY_SYMBOL.value}${referralYouGet}`}
                        style={{ maxWidth: 300 }}
                        textColor={themeColors.Fill_neutralMin}
                        bgColor={themeColors.Icon_positive}></Button>
                </Animated.View>,
            ];
        } else if (userProfile?.isPayoutEnabled && !payoutVpa && referralAmountToCollect > 0) {
            return [
                <Animated.View style={[animatedHamburgerOpacity]}>
                    <Button
                        testID="home_overlay_collect_referral_earnings"
                        size="md"
                        type="primary"
                        showLoader={false}
                        onPress={() => {
                            collectReferralEarningModalRef.current?.present();
                        }}
                        prefix={<MoneyIcon fill={themeColors.Fill_neutralMin} />}
                        text={`${userLanguageStrings.Collect} ${CURRENCY_SYMBOL.value}${referralAmountToCollect}`}
                        textColor={themeColors.Fill_neutralMin}
                        bgColor={themeColors.Icon_positive}></Button>
                </Animated.View>,
            ];
        } else if (userProfile?.isPayoutEnabled && isFirstRideTaken) {
            return [
                <Animated.View style={[animatedHamburgerOpacity, { height: 40 }]}>
                    <Button
                        testID="home_overlay_refer_and_earn"
                        size="md"
                        type="secondary"
                        onPress={() => {
                            navigation.navigate(
                                'ProfileTab',
                                { screen: 'referralNavigator', params: { screen: 'referralScreen' } },
                                { pop: true },
                            );
                        }}>
                        <MoneyIcon />
                        <Typography
                            type="body-7"
                            style={[tailwind.style('ml-1')]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.ReferAndEarnAmount(referralYouGet, CURRENCY_SYMBOL.value)}
                        </Typography>
                    </Button>
                </Animated.View>,
            ];
        }

        return [];
    }, [
        userProfile,
        referralAppliedFromStore,
        referralModalRef,
        animatedHamburgerOpacity,
        referralAmountToCollect,
        referralYouGet,
        referralPayoutConfigV2?.theyGet,
        payoutVpa,
        isFirstRideTaken,
        isMultimodal,
    ]);

    return (
        <View style={styles.container}>
            {appConfig.flowConfig.nearByBusConfig.showNearbyBus && (
                <>
                    <View style={{ position: 'absolute', top: 50, left: 10 }}>
                        <Pressable
                            accessibilityRole="button"
                            testID="live-toggle-badge"
                            accessibilityLabel={isLiveBusTracking ? 'Live on button' : 'Live off button'}
                            style={tailwind.style('items-end')}
                            onPress={onLiveTrackingToggle}>
                            <Animated.View
                                entering={FadeIn.springify().damping(30).stiffness(400)}
                                exiting={FadeOut.duration(100)}
                                layout={LinearTransition.springify().damping(30).stiffness(400)}
                                style={tailwind.style(
                                    'flex-row justify-center min-h-10 items-center gap-2 rounded-[22px] px-4 py-2',
                                    isLiveBusTracking
                                        ? 'bg-white border border-gray-200'
                                        : 'bg-white border border-gray-200',
                                )}>
                                {isLiveBusTracking ? <Pulse /> : <Icon icon={<LiveOff />} size={16} />}

                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-areaNormal-extrabold',
                                        isLiveBusTracking ? 'text-emerald-700' : 'text-gray-700',
                                    )}>
                                    {'Live Track'}
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </View>
                    {isLiveBusTracking && (
                        <View style={{ position: 'absolute', top: 48, right: 20 }}>
                            <Animated.View style={tailwind.style('flex-row items-center justify-center')}>
                                <Button
                                    accessibilityRole="imagebutton"
                                    accessibilityLabel={`Close button`}
                                    size="md"
                                    type="secondary"
                                    prefix={
                                        <Icon
                                            icon={<CrossIcon fill={colors.neutral900} />}
                                            color={colors.neutral800}
                                            size={16}
                                        />
                                    }
                                    onPress={onLiveTrackingToggle}
                                    testID={'Live Bus Tracking Close'}
                                />
                            </Animated.View>
                        </View>
                    )}
                </>
            )}
            <View>
                <FloatingHeader
                    animatedStyle={animatedHamburgerOpacity}
                    prefixButton={undefined}
                    suffixButtons={getSuffixButtons()}
                />
            </View>

            <PopUpModal
                sheetRef={collectReferralEarningModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}
                keyboardBlurBehavior="restore"
                activeOffsetX={undefined}
                activeOffsetY={undefined}
                failOffsetY={undefined}
                failOffsetX={undefined}
                simultaneousHandlers={undefined}
                waitFor={undefined}>
                <CollectReferralEarningFlow setIsCollectEarningsPressed={undefined} />
            </PopUpModal>

            <PopUpModal
                sheetRef={referralInfoModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}
                keyboardBlurBehavior="restore"
                activeOffsetX={undefined}
                activeOffsetY={undefined}
                failOffsetY={undefined}
                stackBehavior="push"
                failOffsetX={undefined}
                simultaneousHandlers={undefined}
                waitFor={undefined}>
                <ReferralInfoModalFlow
                    onClose={() => {
                        referralInfoModalRef.current?.close();
                    }}
                />
            </PopUpModal>

            {(!featureFlags.enableGreeting || greetedUser) && (
                <>
                    <RecenterButton
                        onPress={() => {
                            onRecenterPress(undefined);
                        }}
                        sheetAnimatedIndex={sheetAnimatedIndex}
                        sheetAnimatedPosition={sheetAnimatedPosition}
                        buttonPositionUpwardsBy={buttonPositionUpwardsBy}
                        additionalOffset={shouldShowCancellationBanner ? additionalOffset + 60 : additionalOffset}
                    />

                    <CancellationWarningBanner
                        visible={shouldShowCancellationBanner}
                        onDismiss={() => setShowCancellationWarning(false)}
                        sheetAnimatedIndex={sheetAnimatedIndex}
                        sheetAnimatedPosition={sheetAnimatedPosition}
                        additionalOffset={additionalOffset - 95}
                        bannerTexts={cancellationBannerTexts}
                    />
                </>
            )}
            {!greetedUser && featureFlags.enableGreeting && <DriverGreeting />}
        </View>
    );
};

const DriverGreeting = memo(() => {
    const dispatch = useAppDispatch();
    const [useFallbackAnimation, setUseFallbackAnimation] = useState(false);
    const lottieConfigsRemote = useAppSelector(lottieConfigs);

    const handleAnimationFinish = () => {
        dispatch(setGreetedUser(true));
    };

    const handleLottieLoadError = (error: string) => {
        console.info('[LottieLoad]: Lottie Load Error:', error);
        logger.logDebug('Failed to load remote config driver greeting Lottie animation', 'ConfigFetch');
        setUseFallbackAnimation(true);
    };

    const lottieBottomOffset =
        Platform.OS === 'ios'
            ? (lottieConfigsRemote?.homeScreenLottieUrl?.iosBottomOffset ?? 450)
            : (lottieConfigsRemote?.homeScreenLottieUrl?.androidBottomOffset ?? 450);

    // Calculate resized dimensions and adjust offset so mascot stays anchored visually
    const getLottieDimensions = () => {
        const baseWidth = lottieConfigsRemote?.homeScreenLottieUrl?.customWidth ?? 940;
        const baseHeight = lottieConfigsRemote?.homeScreenLottieUrl?.customHeight ?? 940;
        const zoomPercent = lottieConfigsRemote?.homeScreenLottieUrl?.zoomPercent ?? 100;
        const zoom = zoomPercent / 100;
        const width = baseWidth * zoom;
        const height = baseHeight * zoom;
        const extraHeight = height - baseHeight;
        const adjustedBottom = lottieBottomOffset + extraHeight / 1.7; //as per ratio

        return {
            width,
            height,
            adjustedBottom,
        };
    };

    const dimensions = getLottieDimensions();

    return (
        <FloatingView verticalPosition={Platform.OS === 'ios' ? 130 : 110} style={styles.floatingView}>
            <Animated.View>
                <LottieWithFallback
                    fallback={undefined}
                    style={[
                        {
                            height: dimensions.height,
                            width: dimensions.width,
                            alignSelf: 'center',
                            bottom: dimensions.adjustedBottom,
                        },
                    ]}
                    autoPlay={true}
                    loop={false}
                    source={
                        useFallbackAnimation || !lottieConfigsRemote?.homeScreenLottieUrl?.lottieUrl
                            ? mt_say_hi_lottie_v2
                            : { uri: lottieConfigsRemote?.homeScreenLottieUrl?.lottieUrl }
                    }
                    onAnimationFinish={handleAnimationFinish}
                    onAnimationFailure={handleLottieLoadError}
                />
            </Animated.View>
        </FloatingView>
    );
});

export default HomeOverlay;

const styles = StyleSheet.create({
    floatingView: {
        pointerEvents: 'none',
    },
    container: {
        zIndex: -10,
        pointerEvents: 'box-none',
    },
    referralButtonShadow: {
        shadowOffset: { width: 0, height: 4 },
        shadowColor: 'black',
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
    },
});
