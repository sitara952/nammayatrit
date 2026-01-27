import React, { useState, useEffect } from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LogBox, View, NativeModules, ActivityIndicator, Text } from 'react-native';
import { OnboardingNavigation } from './onboardingNavigation.tsx';
import { useHandleNotifications } from '../hooks/useHandleNotification.tsx';
import { useNetworkHealthCheck } from '../hooks/useNetworkHealthCheck.tsx';
import { selectToken } from '../state/client/auth.ts';
import { selectUserId, selectUserProfile } from '../state/client/user.ts';
import * as Clarity from '@microsoft/react-native-clarity';
import { useAppSelector } from '../state/hooks.ts';
import { RootNavigationParamList } from './globalParamList.tsx';
import Config from 'react-native-config';
import {
    selectBottomSheetStage,
    selectCityConfig,
    BottomSheetStage,
    selectAppConfig,
} from '../state/client/session.ts';
import { logScreenEvent, ScreenRoute } from '@/typescript/utils/logger';
import { setArrayItem, MMKVKey, setStringItem } from '../utils/MMKV.ts';
import { MainNavigation } from './mainNavigation.tsx';
import screenTimeTracker from '@/typescript/utils/screenTimeTracker';
import { AsyncStorageWrapper, createMMKV } from '@/utils/mmkvUtils.ts';
import { MMKV } from 'react-native-mmkv';
import { getBottomSheetStageName, getScreenNameWithContext } from '@/src-v2/utils/common.ts';
LogBox.ignoreLogs(['new NativeEventEmitter']);

const Stack = createNativeStackNavigator<RootNavigationParamList>();

const clarityProjectId = Config['CLARITY_PROJECT_ID'] || '';

// eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
export const navigationRef = createNavigationContainerRef<any>();

// Custom hook for retrying accessToken
// eslint-disable-next-line unused-imports/no-unused-vars
const useRetryAccessToken = () => {
    const [isRetrying, setIsRetrying] = useState(true);
    const [retryCount, setRetryCount] = useState(0);
    const storage = createMMKV();
    const retryDelay = 1000; // ms

    // Use the hook to get accessToken
    const accessToken = useAppSelector(selectToken);

    useEffect(() => {
        if (accessToken !== null && accessToken !== undefined) {
            // Token is available, stop retrying
            setIsRetrying(false);
            return;
        }

        if (storage instanceof AsyncStorageWrapper && storage.isInitialized()) {
            setIsRetrying(false);
            return;
        } else if (storage instanceof MMKV) {
            setIsRetrying(false);
            return;
        }

        // Schedule next retry
        const timeoutId = setTimeout(() => {
            setRetryCount(prev => prev + 1);
            console.info(`AccessToken retry attempt ${retryCount + 1}`);
        }, retryDelay);

        return () => clearTimeout(timeoutId);
    }, [accessToken, retryCount]);

    return { accessToken, isRetrying };
};

const initializeClarity = (personId: string | undefined) => {
    Clarity.setCustomUserId(personId || 'LOGGER_BEFORE_USER_IDENTIFICATION');
    Clarity.initialize(clarityProjectId, { logLevel: Clarity.LogLevel.Verbose });
};

/**
 * Helper function to convert route name string to ScreenRoute enum
 * Falls back to HOME_TAB_HOME_SCREEN if route is not found
 */
const getScreenRouteFromName = (routeName: string): ScreenRoute => {
    const screenRoute = Object.values(ScreenRoute).find(route => route === routeName);

    if (!screenRoute) {
        console.warn(
            `[Navigation] Route '${routeName}' not found in ScreenRoute enum, falling back to HOME_TAB_HOME_SCREEN`,
        );
        return ScreenRoute.HOME_TAB_HOME_SCREEN;
    }

    return screenRoute;
};

const screenNameEventHandler = (
    screenRoute: ScreenRoute,
    bottomSheetStage: BottomSheetStage | undefined,
    previousRoute: string | undefined,
): void => {
    const composedScreenName = getScreenNameWithContext(screenRoute, bottomSheetStage);
    logScreenEvent(
        screenRoute,
        bottomSheetStage,
        {
            previousRoute: previousRoute || 'unknown',
            currentRoute: composedScreenName,
        },
        undefined,
    );
};

export const RootAppNavigation: React.FC = () => {
    const routeNameRef = React.useRef<string>('');
    const clarityRemoteConfig = useAppSelector(state => selectCityConfig(state, 'clarity_config'));
    const personId = useAppSelector(selectUserId);
    const bottomSheetStage = useAppSelector(selectBottomSheetStage);
    const bottomSheetStageName = getBottomSheetStageName(bottomSheetStage);

    // Update Clarity screen name when bottomSheetStage or currentTab changes
    React.useEffect(() => {
        if (clarityRemoteConfig && routeNameRef.current) {
            const screenRoute = getScreenRouteFromName(routeNameRef.current);
            screenNameEventHandler(screenRoute, bottomSheetStage, routeNameRef.current);
        }
    }, [bottomSheetStage, bottomSheetStageName, clarityRemoteConfig]);

    const onNavigationContainerReady = () => {
        // Initialize screen time tracker
        screenTimeTracker.initialize();

        if (clarityRemoteConfig) {
            const currentRoute = navigationRef.getCurrentRoute();
            if (currentRoute) {
                routeNameRef.current = currentRoute.name;
            }
            initializeClarity(personId);
            const screenRoute = getScreenRouteFromName(routeNameRef.current || ScreenRoute.HOME_TAB_HOME_SCREEN);
            screenNameEventHandler(screenRoute, bottomSheetStage, undefined);
        } else {
            console.info('Clarity config is disabled');
        }

        // Start tracking initial screen
        const initialScreenName = routeNameRef.current || ScreenRoute.HOME_TAB_HOME_SCREEN;
        const composedInitialScreenName = getScreenNameWithContext(
            getScreenRouteFromName(initialScreenName),
            bottomSheetStage,
        );
        screenTimeTracker.startTracking(composedInitialScreenName);
    };

    const onNavigationStateChange = () => {
        const previousRouteName = routeNameRef.current;
        const currentRoute = navigationRef.getCurrentRoute();
        const currentRouteName = currentRoute ? currentRoute.name : ScreenRoute.HOME_TAB_HOME_SCREEN;

        if (previousRouteName !== currentRouteName) {
            // Stop tracking previous screen and start tracking new screen
            const currentScreenRoute = getScreenRouteFromName(currentRouteName);
            const currentComposedScreenName = getScreenNameWithContext(currentScreenRoute, bottomSheetStage);

            // Stop tracking previous screen and log event
            screenTimeTracker.stopTrackingAndLog(currentComposedScreenName, 'navigation');

            // Start tracking new screen
            screenTimeTracker.startTracking(currentComposedScreenName);

            // Clarity logging
            if (clarityRemoteConfig) {
                screenNameEventHandler(currentScreenRoute, bottomSheetStage, previousRouteName);
            }

            routeNameRef.current = currentRouteName;
        }
    };

    return (
        <NavigationContainer
            ref={navigationRef}
            onReady={onNavigationContainerReady}
            onStateChange={onNavigationStateChange}>
            <RootNavigator />
        </NavigationContainer>
    );
};

const RootNavigator = () => {
    const { MainAppUtils } = NativeModules;
    const accessToken = useAppSelector(selectToken);
    const isRetrying = false;

    // [React Native Debugger] Comment above 2 lines `isRetrying` and `accessToken` and Uncomment this for __DEV__, required for React Native Debugger to Run.
    // const { accessToken, isRetrying } = useRetryAccessToken();

    const userProfile = useAppSelector(selectUserProfile);
    const appConfig = useAppSelector(selectAppConfig);
    const userId = userProfile?.id;
    setStringItem(MMKVKey.USER_ID, userId ?? 'USER_ID_NOT_FOUND');
    setStringItem(MMKVKey.APP_NAME, appConfig.textConfig.appReadableName);
    MainAppUtils.updateSharedPreferences({ CUSTOMER_ID: userId ?? 'NO_CUSTOMER_ID' });
    if (userProfile?.customerTags) {
        setArrayItem(MMKVKey.CUSTOMER_NAMMA_TAGS, Object.keys(userProfile?.customerTags || {}));
    }
    // const currentTags = getArrayItem(MMKVKey.CUSTOMER_NAMMA_TAGS);
    // if(currentTags?.includes('FieldTest')){
    // console.log('FieldTest SUCCESS');
    // }
    // TODO : @khuzema786 for reference
    useHandleNotifications();
    useNetworkHealthCheck();

    // Show loading while retrying
    if (__DEV__ && isRetrying) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={{ fontSize: 14, marginTop: 20, textAlign: 'center' }}>Loading authentication...</Text>
            </View>
        );
    }

    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}>
            {accessToken === null ||
            accessToken === undefined ||
            (!appConfig.flowConfig.skipProfileOnboarding &&
                (userProfile?.firstName === undefined ||
                    userProfile?.firstName === null ||
                    userProfile?.firstName === 'User')) ? (
                <Stack.Screen name={'onboardingNavigation'} component={OnboardingNavigation} />
            ) : (
                <Stack.Screen name={'mainNavigation'} component={MainNavigation} />
            )}
        </Stack.Navigator>
    );
};

export default RootAppNavigation;
