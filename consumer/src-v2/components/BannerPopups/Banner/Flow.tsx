/* eslint-disable myCustomPlugin/no-hook-dep */
import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import { LayoutChangeEvent, ViewStyle } from 'react-native';
import { PanGestureHandler, HandlerStateChangeEvent } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, runOnJS, useSharedValue, withTiming } from 'react-native-reanimated';
import { APIEndpoint, BannerActionType, BannerConfig } from '../types';
import {
    RideId,
    BannerResponse,
    BannerResponseType,
    setExtraFareConfirmationResponded,
    setAcConfirmationResponded,
    setExtraFareBannerShown,
    setAcBannerShown,
    setExtraFareFirstBannerResponse,
    setAcFirstBannerResponse,
} from '@/typescript/state/client/booking';
import { BookingId } from '@/typescript/state/client/user';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { useIssuePostMutation } from '@/api/integrations/rtk/IssuePost';
import {
    selectUserLanguage,
    selectOperatingCity,
    selectBannerPopusConfig,
    selectAppReadableName,
} from '@/typescript/state/client/session';
import { BannerContent } from './UI';
import { styles } from './styles';
import { executeBannerApi } from '../BannerApiExecutor';
import { createBannerRegistry } from '../BannerRegistry';
import { isTicketCreationEnabledForCity } from '../rideChecksPopupHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useMemo } from 'react';

/**
 * `Banner` is a reusable UI component that displays in-app notifications,
 * supporting features like swipe-to-dismiss, auto-dismiss, chained banners,
 * and contextual API calls (e.g. reporting AC issues).
 *
 * Props:
 * @param config - Configuration object containing content, styling, timing, and button behavior.
 * @param onDismiss - Callback triggered when the banner is dismissed.
 * @param style - Optional style override for the outer container.
 * @param onLayout - Optional callback for measuring layout on render.
 * @param onChainBanner - Callback to trigger the next banner in the chain, if any.
 * @param rideId - Ride identifier used for context-aware API calls.
 */
interface BannerProps {
    config: BannerConfig;
    onDismiss: (() => void) | undefined;
    style: ViewStyle | undefined;
    onLayout?: (event: LayoutChangeEvent) => void;
    onChainBanner?: (newConfig: BannerConfig, inherit: boolean) => void;
    rideId: RideId | null;
    bookingId: BookingId | null;
}

export const Banner = memo<BannerProps>(
    ({ config, onDismiss, style, onLayout, onChainBanner, rideId, bookingId }) => {
        const [isVisible, setIsVisible] = useState(true);
        const [autoCalled, setAutoCalled] = useState(false);
        const translateX = useSharedValue(0);
        const opacity = useSharedValue(1);
        const { visibility, swipeToDismiss } = config;
        const dispatch = useAppDispatch();
        const operatingCity = useAppSelector(selectOperatingCity);
        const bannerPopUpsConfig = useAppSelector(selectBannerPopusConfig);
        const language = useAppSelector(selectUserLanguage);
        const appName = useAppSelector(selectAppReadableName);
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');
        const [issuePostMutation] = useIssuePostMutation();
        const fallbackShowUntil = config.displayTiming.showUntil;
        const computedShowUntilRef = useRef<number | null>(null);

        const bannerRegistry = useMemo(
            () => createBannerRegistry(userLanguageStrings, appName),
            [userLanguageStrings, appName],
        );

        if (config.autoDismiss && config.autoDismissDuration && computedShowUntilRef.current === null) {
            computedShowUntilRef.current = Date.now() + config.autoDismissDuration;
        }

        const animatedStyle = useAnimatedStyle(() => ({
            opacity: opacity.value,
            transform: [{ translateX: translateX.value }],
        }));

        const computeShouldCreateTicket = useCallback(
            (bannerId: string): boolean => {
                if (bannerId === 'driverDemandExtraConfirmationBanner') {
                    return isTicketCreationEnabledForCity(operatingCity, 'extraFareTicketCreation', bannerPopUpsConfig);
                }
                if (bannerId === 'acPreferenceConfirmationBanner') {
                    return isTicketCreationEnabledForCity(
                        operatingCity,
                        'acPreferenceTicketCreation',
                        bannerPopUpsConfig,
                    );
                }
                return true;
            },
            [operatingCity, bannerPopUpsConfig],
        );

        const handleGestureEvent = useCallback(
            // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
            (event: any) => {
                if (!swipeToDismiss) return;
                if (event.nativeEvent.translationX < 0) {
                    translateX.value = event.nativeEvent.translationX;
                }
            },
            [swipeToDismiss],
        );

        const handleGestureEnd = useCallback(
            (_event: HandlerStateChangeEvent<Record<string, unknown>>) => {
                if (!swipeToDismiss) return;
                if (translateX.value < -100) {
                    translateX.value = withTiming(-400, { duration: 200 }, () => {
                        runOnJS(handleDismiss)();
                    });
                } else {
                    translateX.value = withTiming(0, { duration: 200 });
                }
            },
            [swipeToDismiss],
        );

        const handleDismiss = useCallback(() => {
            if (!isVisible) return;
            try {
                if (bookingId && rideId) {
                    if (config.bannerId === 'driverDemandExtraBanner') {
                        dispatch(
                            setExtraFareBannerShown({
                                bookingId,
                                rideId,
                                payload: true,
                            }),
                        );
                    } else if (config.bannerId === 'acPreferenceBanner') {
                        dispatch(
                            setAcBannerShown({
                                bookingId,
                                rideId,
                                payload: true,
                            }),
                        );
                    }
                }

                if (bookingId && rideId && config.parentBannerId) {
                    if (config.parentBannerId === 'driverDemandExtraConfirmationBanner') {
                        dispatch(
                            setExtraFareConfirmationResponded({
                                bookingId,
                                rideId,
                                payload: true,
                            }),
                        );
                    } else if (config.parentBannerId === 'acPreferenceConfirmationBanner') {
                        dispatch(
                            setAcConfirmationResponded({
                                bookingId,
                                rideId,
                                payload: true,
                            }),
                        );
                    }
                }

                opacity.value = withTiming(0, { duration: 200 }, finished => {
                    if (finished) {
                        runOnJS(setIsVisible)(false);
                        if (onDismiss) {
                            runOnJS(onDismiss)();
                        }
                    }
                });
            } catch (error) {
                console.error('[Banner] Error during dismiss animation:', error);
                setIsVisible(false);
                onDismiss?.();
            }
        }, [isVisible, onDismiss, bookingId, rideId, config.parentBannerId, config.bannerId, dispatch]);

        const handleButtonPress = useCallback(
            async (buttonConfig: BannerConfig['primaryButton']) => {
                try {
                    // Handle undo action by showing parent banner
                    if (buttonConfig.actionType === BannerActionType.Undo && config.parentBannerId && onChainBanner) {
                        const parentConfig = bannerRegistry[config.parentBannerId];
                        if (parentConfig) {
                            onChainBanner(parentConfig, false);
                        } else {
                            console.error('[Banner] Invalid parentBannerId:', config.parentBannerId);
                        }
                        return;
                    }

                    if (bookingId && rideId && buttonConfig.nextBannerId) {
                        if (config.bannerId === 'driverDemandExtraBanner') {
                            dispatch(
                                setExtraFareBannerShown({
                                    bookingId,
                                    rideId,
                                    payload: true,
                                }),
                            );
                            const response: BannerResponseType =
                                buttonConfig.nextBannerId === 'driverDemandExtraConfirmationBanner'
                                    ? BannerResponse.Yes
                                    : BannerResponse.No;
                            dispatch(
                                setExtraFareFirstBannerResponse({
                                    bookingId,
                                    rideId,
                                    payload: response,
                                }),
                            );
                        } else if (config.bannerId === 'acPreferenceBanner') {
                            dispatch(
                                setAcBannerShown({
                                    bookingId,
                                    rideId,
                                    payload: true,
                                }),
                            );
                            const response: BannerResponseType =
                                buttonConfig.nextBannerId === 'acPreferenceConfirmationBanner'
                                    ? BannerResponse.No
                                    : BannerResponse.Yes;
                            dispatch(
                                setAcFirstBannerResponse({
                                    bookingId,
                                    rideId,
                                    payload: response,
                                }),
                            );
                        }
                    }

                    if (bookingId && rideId && buttonConfig.nextBannerId) {
                        if (config.bannerId === 'driverDemandExtraConfirmationBanner') {
                            dispatch(
                                setExtraFareConfirmationResponded({
                                    bookingId,
                                    rideId,
                                    payload: true,
                                }),
                            );
                        } else if (config.bannerId === 'acPreferenceConfirmationBanner') {
                            dispatch(
                                setAcConfirmationResponded({
                                    bookingId,
                                    rideId,
                                    payload: true,
                                }),
                            );
                        }
                    }

                    // Handle API call if any (before chaining)
                    if (buttonConfig.apiEndpoint !== APIEndpoint.None && rideId) {
                        const shouldCreateTicket = computeShouldCreateTicket(config.bannerId);
                        await executeBannerApi(
                            { ...buttonConfig, createTicket: shouldCreateTicket },
                            { rideId, language, issuePostMutation },
                        );
                    }

                    // Handle normal chaining (after API call)
                    if (buttonConfig.nextBannerId && onChainBanner) {
                        const nextConfig = bannerRegistry[buttonConfig.nextBannerId];
                        if (nextConfig) {
                            onChainBanner(nextConfig, buttonConfig.inheritParentApi);
                        } else {
                            console.error('[Banner] No banner config found for id:', buttonConfig.nextBannerId);
                        }
                        return;
                    }

                    // Handle Dismiss
                    if (buttonConfig.actionType === BannerActionType.Dismiss) {
                        handleDismiss();
                    } else if (buttonConfig.actionType !== BannerActionType.Chain) {
                        console.error('[Banner] Unknown action type:', buttonConfig.actionType);
                    }
                } catch (error) {
                    console.error('[Banner] Error in button press handler:', error);
                }
            },
            [
                handleDismiss,
                onChainBanner,
                rideId,
                bookingId,
                language,
                issuePostMutation,
                config.parentBannerId,
                config.bannerId,
                operatingCity,
                bannerPopUpsConfig,
                bannerRegistry,
                computeShouldCreateTicket,
                dispatch,
            ],
        );

        useEffect(() => {
            const shouldShow = visibility && (!fallbackShowUntil || Date.now() <= fallbackShowUntil);
            if (shouldShow) {
                setIsVisible(true);
                opacity.value = withTiming(1, { duration: 300 });
            } else {
                setIsVisible(false);
            }
        }, [visibility, fallbackShowUntil]);

        useEffect(() => {
            if (config.autoDismiss && config.autoDismissDuration) {
                if (computedShowUntilRef.current === null) {
                    computedShowUntilRef.current = Date.now() + config.autoDismissDuration;
                }
                const computedShowUntil = computedShowUntilRef.current;
                const delay = computedShowUntil - Date.now();
                if (delay > 0 && !autoCalled) {
                    const timer = setTimeout(async () => {
                        if (isVisible && !autoCalled && rideId) {
                            try {
                                if (config.primaryButton.apiEndpoint !== APIEndpoint.None) {
                                    const shouldCreateTicket = computeShouldCreateTicket(config.bannerId);
                                    const primaryWithFlag = {
                                        ...config.primaryButton,
                                        createTicket: shouldCreateTicket,
                                    };
                                    await executeBannerApi(primaryWithFlag, { rideId, language, issuePostMutation });
                                }
                            } catch (e) {
                                console.error('[Banner] Auto API call error:', e);
                            }
                            setAutoCalled(true);
                            handleDismiss();
                        }
                    }, delay);
                    return () => {
                        clearTimeout(timer);
                    };
                }
            }
            return undefined;
        }, [
            config.autoDismiss,
            config.autoDismissDuration,
            isVisible,
            autoCalled,
            handleDismiss,
            config.primaryButton.apiEndpoint,
            bannerRegistry,
        ]);

        if (!isVisible) return null;

        return (
            <PanGestureHandler enabled={swipeToDismiss} onGestureEvent={handleGestureEvent} onEnded={handleGestureEnd}>
                <Animated.View
                    style={[styles.container, { backgroundColor: config.backgroundColor }, animatedStyle, style]}
                    accessible={true}
                    accessibilityLabel={config.accessibility.accessibilityLabel}
                    accessibilityHint={config.accessibility.accessibilityHint}
                    testID={`banner-${config.bannerId}`}
                    onLayout={onLayout}>
                    <BannerContent config={config} onButtonPress={handleButtonPress} />
                </Animated.View>
            </PanGestureHandler>
        );
    },
    (prevProps, nextProps) => {
        const prev = prevProps.config;
        const next = nextProps.config;
        return (
            prev.visibility === next.visibility &&
            prev.displayTiming.showUntil === next.displayTiming.showUntil &&
            prev.swipeToDismiss === next.swipeToDismiss &&
            prevProps.style === nextProps.style
        );
    },
);
