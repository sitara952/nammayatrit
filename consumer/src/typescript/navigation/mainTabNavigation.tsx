import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BottomTabBarButtonProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import TabHomeIcon from '@/typescript/assets/svg/symbols/TabHomeIcon.tsx';
import TabServicesIcon from '@/typescript/assets/svg/symbols/TabServicesIcon.tsx';
import TabLiveIcon from '@/typescript/assets/svg/symbols/TabLiveIcon.tsx';
import TabTicketsIcon from '@/typescript/assets/svg/symbols/TabTicketsIcon.tsx';
import TabProfileIcon from '@/typescript/assets/svg/symbols/TabProfileIcon.tsx';
import TabPassesIcon from '@/typescript/assets/svg/symbols/TabPassesIcon.tsx';
import { useConfigContext } from '../context/ConfigContext.tsx';
import Typography from '../designSystem/components/primitives/Typography.tsx';
import { tailwind } from '../tailwindTheme/tailwind';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import * as Haptics from 'react-native-haptic-feedback';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import {
    setBottomSheetStage,
    BottomSheetStage,
    selectBottomSheetStage,
    selectTabScreensConfig,
    setCurrentTab,
    selectHasPurchasedPasses,
    selectLiveJourneyId,
    selectAppConfig,
} from '../state/client/session';
import {
    createBookingId,
    createJourneyId,
    JourneyId,
    selectActiveBookingIds,
    selectUserProfileLanguage,
    setSearchId,
} from '../state/client/user';
import { EventName, logEvent } from '../utils/logger';
import {
    RouteProp,
    useRoute,
    getFocusedRouteNameFromRoute,
    ParamListBase,
    useNavigation,
} from '@react-navigation/native';
import { MainNavigationParamList, MainTabParamList } from './globalParamList.tsx';
import { selectLatestInprogressJourney, selectLatestInprogressJourneyId } from '../state/client/journey.ts';
import { isNull } from 'lodash';
import { ViewStyle } from 'react-native';
import { selectToken } from '../state/client/auth.ts';
import ServicesTab from '@/src-v2/multimodal/screens/ServicesTab/Flow.tsx';
import { ProfiledHomeScreen } from '@/src-v2/screens/HomeScreen/index.tsx';
import { LiveJourneyOverviewFlow } from '@/src-v2/multimodal/screens/LiveJourneyOverview/Flow.tsx';
import { LiveTicketFlow } from '@/src-v2/multimodal/screens/LiveTicket/Flow.tsx';
import { BusPassFlow } from '@/src-v2/screens/Passes/BusPass/Flow.tsx';
import ProfileTabFlow from '@/src-v2/screens/ProfileTab/Flow.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getOtpCode, selectAllBooking } from '../state/client/booking.ts';
import { isUpcomingBooking } from '@/src-v2/utils/Booking.ts';
import { useSafeAreaInsets } from '../hooks/safeAreaInsets.ts';

const Tab = createBottomTabNavigator<MainTabParamList>();

const getDefaultInitialRoute = (tabName: string, passEnabled: boolean) => {
    switch (tabName) {
        case 'HomeTab':
            return 'homeTab_homeScreen';
        case 'ServicesTab':
            if (passEnabled) {
                return 'passesTab_homeScreen';
            } else {
                return 'serviceTab_homeScreen';
            }
        case 'LiveTab':
            return 'liveTab_homeScreen';
        case 'TicketsTab':
            return 'ticketsTab_homeScreen';
        case 'PassesTab':
            return 'passesTab_homeScreen';
        case 'ProfileTab':
            return 'profileTab_homeScreen';
        default:
            return 'homeTab_homeScreen';
    }
};

const getTabBarDisplay = (
    route: RouteProp<ParamListBase, string>,
    visibleScreens: string[],
    currentBottomSheetStage: BottomSheetStage,
    tabName: string,
    initialRouteName: string | undefined,
    passEnabled: boolean,
): 'flex' | 'none' => {
    const routeName =
        getFocusedRouteNameFromRoute(route) ?? initialRouteName ?? getDefaultInitialRoute(tabName, passEnabled);
    const shouldShowForScreen = visibleScreens.some(screen => routeName.includes(screen) || screen.includes(routeName));
    if (tabName === 'HomeTab') {
        return shouldShowForScreen && currentBottomSheetStage === BottomSheetStage.Home ? 'flex' : 'none';
    }
    return shouldShowForScreen ? 'flex' : 'none';
};

export const MainTabNavigation: React.FC = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'mainTabNavigation'>>();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { params } = route;
    const targetTab = params?.screen;
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const { bottom } = useSafeAreaInsets();
    const hapticFeedback = useHaptic(Haptics.HapticFeedbackTypes.impactMedium, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    const [activeLottieTab, setActiveLottieTab] = useState<string | null>(null);
    const timeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});
    const dispatch = useAppDispatch();
    const currentBottomSheetStage = useAppSelector(selectBottomSheetStage);
    const tabScreensConfig = useAppSelector(selectTabScreensConfig);
    const currentLanguage = useAppSelector(selectUserProfileLanguage);
    const enabledTabs = tabScreensConfig.tabs;
    const userToken = useAppSelector(selectToken);
    const hasPurchasedPasses = useAppSelector(selectHasPurchasedPasses);
    const appSystemConfig = useAppSelector(selectAppConfig);
    const liveJourneyIdFromStore = useAppSelector(selectLiveJourneyId);
    const latestInProgressJourneyId = useAppSelector(selectLatestInprogressJourneyId);
    const liveJourneyId = liveJourneyIdFromStore ? createJourneyId(liveJourneyIdFromStore) : null;

    const fallbackJourneyId = useMemo(
        () => (latestInProgressJourneyId ? createJourneyId(latestInProgressJourneyId) : null),
        [latestInProgressJourneyId],
    );

    const journeyId = useMemo(() => {
        return liveJourneyId ?? fallbackJourneyId;
    }, [liveJourneyId, fallbackJourneyId]);

    const activeBookingIds = useAppSelector(selectActiveBookingIds);

    const allBookings = useAppSelector(selectAllBooking);
    const allBookingDetails = useMemo(
        () =>
            allBookings
                ? activeBookingIds
                      .map(id => (allBookings[id] ? allBookings[id] : null))
                      .filter(booking => !isNull(booking))
                : [],
        [allBookings],
    );

    const firstActiveBookingDetails = useMemo(
        () =>
            activeBookingIds
                .map(v => allBookingDetails.find(v1 => v1.bookingDetails?.id === v)?.bookingDetails)
                .filter(v => v != null && v !== undefined)
                .find(v => {
                    const isDriverAssignedOrOtp = v.rideList?.length > 0 || !isNull(getOtpCode(v.bookingDetails));
                    return !isUpcomingBooking(v, isDriverAssignedOrOtp ? 30 : 2);
                }),
        [allBookingDetails, activeBookingIds],
    );

    // Clear all timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(timeoutsRef.current).forEach(timeout => clearTimeout(timeout));
        };
    }, []);

    // Function to get translated label from existing language strings
    // Re-evaluate when currentLanguage changes to get updated translations
    const getTabLabel = useCallback(
        (tabId: string): string => {
            const tabLabels: Record<string, string> = {
                HomeTab: userLanguageStrings.AnnaHome || 'Home',
                ServicesTab: appConfig.uiConfig.passTabEnabled
                    ? userLanguageStrings.Pass || 'Passes'
                    : userLanguageStrings.Services || 'Services',
                LiveTab: userLanguageStrings.Live || 'Live',
                TicketsTab: userLanguageStrings.Ticket || 'Tickets',
                PassesTab: userLanguageStrings.Pass || 'Passes',
                ProfileTab: userLanguageStrings.Profile || 'Profile',
            };
            return tabLabels[tabId] || tabId;
        },
        [currentLanguage, userLanguageStrings, appConfig.uiConfig.passTabEnabled],
    );

    const getServicesColorFilters = () => {
        return [
            // Vehicle bodies - make red
            { keypath: 'Comp 1.Metro.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: 'Comp 1.Bus.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },

            // Windows and headlights - keep white
            { keypath: 'Comp 1.MetroParts.Group 1.Fill 1', color: '#FFFFFF' },
            { keypath: 'Comp 1.BusParts.Group 1.Fill 1', color: '#FFFFFF' },

            // Shape elements - make red
            { keypath: 'Comp 1.TriangleOne.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: 'Comp 1.TriangleTwo.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: 'Comp 1.CircleOne.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: 'Comp 1.CircleTwo.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: 'Comp 1.RoundedDiamond.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: 'Comp 1.Square.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
        ];
    };

    const getHomeTabColorFilters = () => {
        return [
            { keypath: 'Shape Layer 1.Rectangle 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: 'HomeIconAnimatioMainComp.**.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
        ];
    };

    const getTicketTabColorFilters = () => {
        return [
            { keypath: 'Ticket*.Group 1.Fill 1', color: themeColors.NavBarItem_active_color },
            { keypath: '**.Ellipse 1.Fill 1', color: themeColors.NavBarItem_active_color },
        ];
    };

    const inProgressJourney = useAppSelector(selectLatestInprogressJourney);
    const isActiveJourneyPresent = !isNull(inProgressJourney);

    const getColorFilters = () => {
        if (isActiveJourneyPresent) {
            // When journey is active, use special colors
            return [
                { keypath: 'EllipseOne', color: '#FFFFFF' },
                { keypath: 'EllipseTwo', color: themeColors.LiveTabEllipse_color },
                { keypath: 'EllipseThree', color: themeColors.LiveTabEllipse_color },
            ];
        } else {
            // When no journey, use default colors
            return [
                { keypath: 'EllipseOne', color: '#FFFFFF' },
                { keypath: 'EllipseTwo', color: themeColors.NavBarItem_active_color },
                { keypath: 'EllipseThree', color: themeColors.NavBarItem_active_color },
            ];
        }
    };

    const iconMap: Record<string, (color: string, pressed: boolean, tabName: string) => React.ReactElement> = {
        HomeTab: (color, pressed, tabName) => {
            return (
                <>
                    {pressed && activeLottieTab === tabName ? (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <LottieWithFallback
                                fallback={undefined}
                                source={require('@/src-v2/assets/lottie/home_animation.lottie')}
                                colorFilters={getHomeTabColorFilters()}
                                autoPlay
                                loop
                                style={{ width: 36, height: 36 }}
                            />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <TabHomeIcon color={color} size={25} />
                        </Animated.View>
                    )}
                </>
            );
        },
        ServicesTab: (color, pressed, tabName) => {
            if (appConfig.uiConfig.passTabEnabled) {
                return (
                    <>
                        {pressed && activeLottieTab === tabName ? (
                            <Animated.View entering={FadeIn} exiting={FadeOut}>
                                <LottieWithFallback
                                    fallback={undefined}
                                    source={require('@/src-v2/assets/lottie/tab-pass-animation.lottie')}
                                    autoPlay
                                    loop
                                    style={{ width: 40, height: 40 }}
                                />
                            </Animated.View>
                        ) : (
                            <Animated.View entering={FadeIn} exiting={FadeOut}>
                                <TabPassesIcon color={color} />
                            </Animated.View>
                        )}
                    </>
                );
            }
            return (
                <>
                    {pressed && activeLottieTab === tabName ? (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <LottieWithFallback
                                fallback={undefined}
                                source={require('@/src-v2/assets/lottie/services.lottie')}
                                colorFilters={getServicesColorFilters()}
                                autoPlay
                                loop
                                style={{ width: 28, height: 28 }}
                            />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <TabServicesIcon color={color} size={27} />
                        </Animated.View>
                    )}
                </>
            );
        },
        LiveTab: (color, pressed, _tabName) => {
            const shouldShowLottie = (() => {
                if (isActiveJourneyPresent) {
                    return !pressed;
                } else {
                    return activeLottieTab === 'LiveTab';
                }
            })();

            return (
                <>
                    {shouldShowLottie && appSystemConfig.flowConfig.enableLiveTracking ? (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <LottieWithFallback
                                fallback={undefined}
                                source={require('@/src-v2/assets/lottie/live_action_animation.lottie')}
                                colorFilters={getColorFilters()}
                                autoPlay
                                loop={isActiveJourneyPresent} // Loop continuously only when active journey exists
                                style={{ width: 36, height: 36 }}
                            />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <TabLiveIcon color={color} size={26} />
                        </Animated.View>
                    )}
                </>
            );
        },
        TicketsTab: (color, pressed, tabName) => {
            return (
                <>
                    {pressed && activeLottieTab === tabName ? (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <LottieWithFallback
                                fallback={undefined}
                                source={require('@/src-v2/assets/lottie/ticket_animation_icon.lottie')}
                                colorFilters={getTicketTabColorFilters()}
                                autoPlay
                                loop
                                style={{ width: 32, height: 32 }}
                            />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <TabTicketsIcon color={color} size={20} />
                        </Animated.View>
                    )}
                </>
            );
        },
        PassesTab: (color, pressed, tabName) => {
            return (
                <>
                    {pressed && activeLottieTab === tabName ? (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <LottieWithFallback
                                fallback={undefined}
                                source={require('@/src-v2/assets/lottie/ticket_animation_icon.lottie')}
                                colorFilters={getTicketTabColorFilters()}
                                autoPlay
                                loop
                                style={{ width: 32, height: 32 }}
                            />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <TabPassesIcon color={color} />
                        </Animated.View>
                    )}
                </>
            );
        },
        ProfileTab: (color, pressed, tabName) => {
            return (
                <>
                    {pressed && activeLottieTab === tabName ? (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <LottieWithFallback
                                fallback={undefined}
                                source={require('@/src-v2/assets/lottie/profile_icon_animation.lottie')}
                                colorFilters={[
                                    { keypath: 'Mouth', color: '#FFFFFF' },
                                    { keypath: 'Body', color: themeColors.NavBarItem_active_color },
                                    { keypath: 'Head', color: themeColors.NavBarItem_active_color },
                                ]}
                                autoPlay
                                loop
                                style={{ width: 32, height: 32 }}
                            />
                        </Animated.View>
                    ) : (
                        <Animated.View entering={FadeIn} exiting={FadeOut}>
                            <TabProfileIcon color={color} size={20} />
                        </Animated.View>
                    )}
                </>
            );
        },
    };

    // Base tab bar style
    const getBaseTabBarStyle = (tabName: string | undefined): ViewStyle => {
        const isDark =
            (tabName === 'ServicesTab' || tabName === 'PassesTab') &&
            appConfig.uiConfig.passTabEnabled &&
            hasPurchasedPasses;

        return {
            minHeight: 55 + bottom,
            backgroundColor: isDark ? '#060606' : '#fff',
            paddingHorizontal: 10,
            paddingBottom: bottom,
            paddingTop: 4,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            elevation: isDark ? 0 : 20,
            borderTopWidth: 0,
            ...(!isDark && {
                shadowColor: '#000',
                shadowOffset: {
                    width: 0,
                    height: -5,
                },
                shadowOpacity: 0.05,
                shadowRadius: 5,
            }),
        };
    };

    const getNoneTabBarStyle = (): ViewStyle => ({
        position: 'absolute',
        bottom: -1000,
        height: 0,
        minHeight: 0,
        paddingBottom: 0,
        paddingTop: 0,
    });

    const tabVisibleScreens: Record<string, string[]> = {
        HomeTab: ['homeTab_homeScreen'],
        ServicesTab: ['serviceTab_homeScreen', 'passesTab_homeScreen'],
        LiveTab: ['liveTab_homeScreen'],
        TicketsTab: ['ticketsTab_homeScreen'],
        PassesTab: ['passesTab_homeScreen'],
        ProfileTab: ['profileTab_homeScreen'],
    };

    const getIndividualScreenOptions = (tabName: string) => {
        return ({ route }: { route: RouteProp<ParamListBase, string> }) => ({
            headerShown: false,
            tabBarStyle:
                getTabBarDisplay(
                    route,
                    tabVisibleScreens[tabName] || ['homeTab_homeScreen'],
                    currentBottomSheetStage,
                    tabName,
                    undefined,
                    appConfig.uiConfig.passTabEnabled,
                ) === 'flex'
                    ? getBaseTabBarStyle(tabName)
                    : getNoneTabBarStyle(),
            tabBarActiveTintColor:
                (tabName === 'ServicesTab' || tabName === 'PassesTab') &&
                appConfig.uiConfig.passTabEnabled &&
                hasPurchasedPasses
                    ? '#FFFFFF'
                    : '#000000',
            tabBarInactiveTintColor: '#969696',
            tabBarIcon: ({ focused }: { focused: boolean }) => {
                const color = focused ? themeColors.NavBarItem_active_color : '#969696';
                return iconMap[tabName]?.(color, focused, tabName) ?? null;
            },
            tabBarIconStyle: { marginTop: 6 },
            tabBarLabel: ({ color }: { color: string }) => (
                <Typography
                    type="subhead-1"
                    style={[tailwind`bg-transparent mb-1 text-[13px] tracking-[0.1]`, { color }]}
                    numberOfLines={1}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {getTabLabel(tabName)}
                </Typography>
            ),
            tabBarButton: (props: BottomTabBarButtonProps) => (
                <Pressable
                    testID={`4ae9cb1d-b5a6-49ab-9bb6-1fc3745b35a3-${tabName}`}
                    accessibilityRole="button"
                    accessibilityLabel={`${getTabLabel(tabName)} Tab`}
                    {...props}
                    onPress={e => {
                        hapticFeedback();
                        if (tabName === 'LiveTab' && firstActiveBookingDetails && journeyId === null) {
                            navigation.navigate(
                                'taxiRideTracking',
                                {
                                    bookingId: createBookingId(firstActiveBookingDetails.id),
                                    multimodalProps: undefined,
                                },
                                { pop: true },
                            );
                        } else {
                            props.onPress?.(e);
                        }
                        if (timeoutsRef.current[tabName]) {
                            clearTimeout(timeoutsRef.current[tabName]);
                        }

                        setActiveLottieTab(tabName);
                        dispatch(setCurrentTab(tabName));
                        if (tabName !== 'LiveTab') {
                            timeoutsRef.current[tabName] = setTimeout(() => {
                                setActiveLottieTab(prev => (prev === tabName ? null : prev));
                            }, 2000);
                        }
                        if (tabName === 'LiveTab' && !isActiveJourneyPresent) {
                            timeoutsRef.current[tabName] = setTimeout(() => {
                                setActiveLottieTab(prev => (prev === tabName ? null : prev));
                            }, 2000);
                        }
                    }}
                />
            ),
            popToTopOnBlur: tabName === 'ServicesTab',
        });
    };

    const getTabName = useCallback((tabId: string | undefined): keyof MainTabParamList => {
        switch (tabId) {
            case 'HomeTab':
                return 'homeTab_homeScreen';
            case 'LiveTab':
                return 'liveTab_homeScreen';
            case 'ServicesTab':
                if (appConfig.uiConfig.passTabEnabled) {
                    return 'passesTab_homeScreen';
                } else {
                    return 'serviceTab_homeScreen';
                }
            case 'PassesTab':
                return 'passesTab_homeScreen';
            case 'ProfileTab':
                return 'profileTab_homeScreen';
            case 'TicketsTab':
                return 'ticketsTab_homeScreen';
            default:
                return 'homeTab_homeScreen';
        }
    }, []);

    const HomeScreenFlow = useCallback(() => <MemoizedHomeScreen />, []);
    const LiveJourneyFlow = useCallback(
        () => <MemoizedLiveJourneyOverview journeyIdFromProp={journeyId} />,
        [journeyId],
    );

    // const enabledTabV2 = ['homeTab_homeScreen', 'passesTab_homeScreen', 'liveTab_homeScreen', 'ticketsTab_homeScreen', 'profileTab_homeScreen']

    return (
        <Tab.Navigator
            initialRouteName={targetTab && enabledTabs.includes(targetTab) ? targetTab : getTabName(enabledTabs[0])}>
            {/* Render tabs based on remote config */}
            {enabledTabs.map((tabId: string) => {
                const getComponent = () => {
                    switch (tabId) {
                        case 'HomeTab':
                            return HomeScreenFlow;
                        case 'ServicesTab':
                            if (appConfig.uiConfig.passTabEnabled) {
                                return BusPassFlow;
                            } else {
                                return ServicesTab;
                            }
                        case 'LiveTab':
                            return LiveJourneyFlow;
                        case 'TicketsTab':
                            return LiveTicketFlow;
                        case 'PassesTab':
                            return BusPassFlow;
                        case 'ProfileTab':
                            return ProfileTabFlow;
                        default:
                            return undefined;
                    }
                };
                const tabComponent = getComponent();
                const tabName = getTabName(tabId);

                // Make sure only valid tab components are rendered for backward compatibility
                if (!tabComponent || !tabName) {
                    return null;
                }
                return (
                    <Tab.Screen
                        key={tabId}
                        name={tabName}
                        component={tabComponent}
                        options={getIndividualScreenOptions(tabId)}
                        listeners={() => ({
                            tabPress: () => {
                                dispatch(setSearchId({ id: userToken, payload: null }));

                                if (tabId === 'HomeTab') {
                                    dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'tab_home' }));
                                }
                                if (tabId === 'LiveTab') {
                                    logEvent(EventName.USER_CLICKED_LIVE_TAB);
                                } else if (tabId === 'TicketsTab') {
                                    logEvent(EventName.USER_CLICKED_TICKET_TAB);
                                } else if (tabId === 'ServicesTab') {
                                    appConfig.uiConfig.passTabEnabled
                                        ? logEvent(EventName.USER_CLICKED_PASSES_TAB)
                                        : logEvent(EventName.USER_CLICKED_SERVICES_TAB);
                                } else if (tabId === 'PassesTab') {
                                    logEvent(EventName.USER_CLICKED_PASSES_TAB);
                                }
                            },
                        })}
                    />
                );
            })}
        </Tab.Navigator>
    );
};

const MemoizedHomeScreen = memo(() => {
    const route = useRoute<RouteProp<MainTabParamList, 'homeTab_homeScreen'>>();
    const multimodalProps =
        route.params && 'multimodalProps' in route.params ? route.params.multimodalProps : undefined;
    return <ProfiledHomeScreen multimodalProps={multimodalProps} />;
});

const MemoizedLiveJourneyOverview = memo<{ journeyIdFromProp: JourneyId | null }>(({ journeyIdFromProp }) => {
    const route = useRoute<RouteProp<MainTabParamList, 'liveTab_homeScreen'>>();
    const journeyId = route.params?.multimodalProps?.journeyId ?? route.params?.journeyId ?? journeyIdFromProp;
    return <LiveJourneyOverviewFlow journeyId={journeyId} />;
});
