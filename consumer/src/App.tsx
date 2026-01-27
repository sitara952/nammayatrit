import React, { memo, useEffect, useRef } from 'react';
import { LogBox, Platform, NativeModules, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PortalProvider } from '@gorhom/portal';
import Toast from './typescript/designSystem/components/primitives/Toast';
import SnackbarRoot from '../src-v2/primitives/Snackbar';
import { log } from './helpers/utils/Logger/Logger.bs';
import { Provider as SessionContext } from './Hooks/SessionContext.bs';
import { make as InitialPayloadContext } from './context/InitialPayloadContext.bs';
import { make as PermissionsContext } from './state/context/PermissionsContext.bs';
import { make as BottomSheetModalContext } from './state/context/BottomSheetModalContext.bs';
import { make as UserProfileContext } from './state/context/UserProfileContext.bs';
import { RootAppNavigation } from './typescript/navigation/RootNavigation.tsx';
import { Provider } from 'react-redux';
import '@/typescript/state/server/feedbackApi.ts';
import { OfflineSyncProvider } from './typescript/context/OfflineSyncContext';
import { persistor, store } from './typescript/state/store';
import { permissionManager } from './typescript/utils/PermissionManager';
import { PersistGate } from 'redux-persist/integration/react';
import { ReactNotificationContext } from '@/typescript/context/NotificationContext.tsx';
import * as Sentry from '@sentry/react-native';
import {
    getRemoteConfig,
    fetchAndActivate,
    setDefaults,
    activate,
    onConfigUpdated,
} from '@react-native-firebase/remote-config';
import defaultRemoteConfigs from '../src-v2/systems/configs/defaultRemoteConfig.json';
import { getAuth, signInAnonymously } from '@react-native-firebase/auth';
import { useAppDispatch, useAppSelector } from './typescript/state/hooks';
import {
    selectAppThemeName,
    selectOperatingCity,
    selectUserLanguage,
    setAppName,
    setAppState,
} from './typescript/state/client/session';
import Config from 'react-native-config';
import { getStringItem, setBoolItem, MMKVKey, setStringItem } from './typescript/utils/MMKV.ts';
import { VERSION } from './version';
import { appNameEnabled } from 'config-types';
import { getEnvironmentName } from '@/src-v2/systems/logger/index.ts';
import CleverTap from 'clevertap-react-native';
import * as MoEngage from '@/typescript/utils/moengage';
import AccessibilityContext from './typescript/context/AccessibilityContext.tsx';
import { ConfigProvider } from './typescript/context/ConfigContext.tsx';
import { configManager } from '../src-v2/systems/configs/configManager.ts';
import { appName } from 'config-types';
import { AppState, AppStateStatus } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { FlowStatusContextProvider, FlowStatusContext } from './typescript/context/FlowStatusContext.tsx';
import { events } from '@/src-v2/systems/events/events.ts';
import { enableScreens } from 'react-native-screens';
import { setFlowStatusContextRef } from './typescript/state/middleware';
import { FallbackUI } from './FallbackUI';
import { LocationStatusProvider } from './typescript/context/LocationStatusContext';
import AppMonitor from '@/src-v2/modules/AppMonitor/AppMonitor';
import 'react-native-devsettings';
import { getAnalytics, setUserProperties } from '@react-native-firebase/analytics';
import { selectToken, setToken } from './typescript/state/client/auth.ts';
import { loggingOutUser } from './typescript/utils/common.ts';
import { setProfile } from './typescript/state/client/user.ts';
import { setAppMonitorConfig } from './typescript/state/client/appMonitorConfig';
import { setAdConfig } from './typescript/state/client/adConfig';
import { useLazyGetAdConfigQuery, isWrappedResponse } from './typescript/state/server/adConfigApi';
import { parseAppMonitorConfig } from './typescript/utils/appMonitorConfigParser';
import { KeyboardProvider } from 'react-native-keyboard-controller';

enableScreens();

(async () => {
    Sentry.init({
        dsn: Config['SENTRY_DNS'],
        debug: false,
        tracesSampleRate: 0.2, // Sample 20% of transactions for performance monitoring
        sendDefaultPii: false, // Set to true if you need user IP addresses
        enableNative: false,
        environment: getEnvironmentName(),
        release: DeviceInfo.getApplicationName() + '@' + DeviceInfo.getVersion(),
        dist: DeviceInfo.getBuildNumber(),
        enableAutoSessionTracking: true,
        sessionTrackingIntervalMillis: 30000,
        maxBreadcrumbs: 50,
        attachStacktrace: true,
    });
})();

// Ignore specific logs
// LogBox.ignoreLogs(['new NativeEventEmitter', 'Warning']);
LogBox.ignoreAllLogs(); // Uncomment to ignore all warnings and errors

// Note: Uncomment this to get details on Firebase Deprecation strict warnings
// globalThis.RNFB_MODULAR_DEPRECATION_STRICT_MODE = true;
export interface NotificationData {
    entity_type: string;
    notification_json: string;
    entity_ids: string;
    entity_data: string;
    notification_type: string;
    show_notification: string;
    driver_notification_payload: string;
}

export interface InitialPayload {
    appId: string;
    baseUrl: string;
    navBarHeight: number | undefined;
}

const { MainAppUtils, OTABridge } = NativeModules;

const ContextWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useAppDispatch();
    const logTheUserOut = () => {
        loggingOutUser(dispatch, undefined);
        MainAppUtils.updateSharedPreferences({
            REGISTERATION_TOKEN: '__failed',
            CUSTOMER_ID: 'NO_CUSTOMER_ID',
            SUGGESTIONS_MAP: '__failed',
            RECENT_SEARCHES: '__failed',
            CUSTOMER_FIRST_RIDE: '__failed',
        });
    };

    interface ErrorType {
        _1?: {
            errorType: string | undefined;
        };
    }

    const onError = (err: unknown) => {
        if (typeof err === 'object' && err !== null && '_1' in err) {
            // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
            const typedError = err as ErrorType;
            if (typedError._1?.errorType === 'Unauthorized') {
                log.error(typedError);
                logTheUserOut();
                return;
            }
        }
        log.error(err);
    };

    const queryClient = new QueryClient({
        queryCache: new QueryClient().getQueryCache(),
        mutationCache: new QueryClient().getMutationCache(),
        defaultOptions: {
            mutations: { onError },
        },
    });

    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <SafeAreaProvider>
                    <SessionContext.make>
                        <InitialPayloadContext>
                            <QueryClientProvider client={queryClient}>
                                <GestureHandlerRootView style={{ flex: 1 }}>
                                    <PermissionsContext>
                                        <ReactNotificationContext>
                                            <BottomSheetModalContext>
                                                <AccessibilityContext>
                                                    <OfflineSyncProvider>
                                                        <UserProfileContext>
                                                            <LocationStatusProvider>
                                                                <KeyboardProvider
                                                                    preserveEdgeToEdge={true}
                                                                    navigationBarTranslucent={true}
                                                                    statusBarTranslucent={true}>
                                                                    <PortalProvider>
                                                                        <SnackbarRoot>{children}</SnackbarRoot>
                                                                    </PortalProvider>
                                                                </KeyboardProvider>
                                                            </LocationStatusProvider>
                                                        </UserProfileContext>
                                                    </OfflineSyncProvider>
                                                </AccessibilityContext>
                                            </BottomSheetModalContext>
                                        </ReactNotificationContext>
                                    </PermissionsContext>
                                </GestureHandlerRootView>
                            </QueryClientProvider>
                        </InitialPayloadContext>
                    </SessionContext.make>
                </SafeAreaProvider>
            </PersistGate>
        </Provider>
    );
};

const App: React.FC<{ initialPayload: InitialPayload }> = ({ initialPayload }) => {
    const dispatch = useAppDispatch();
    const language = useAppSelector(selectUserLanguage) ?? 'ENGLISH';
    const city = useAppSelector(selectOperatingCity);
    const theme = useAppSelector(selectAppThemeName);
    const appToken = useAppSelector(selectToken);
    const mmkvToken = getStringItem(MMKVKey.REGISTRATION_TOKEN);
    const mmkvFirstName = getStringItem(MMKVKey.USER_NAME);
    const [triggerAdConfigFetch] = useLazyGetAdConfigQuery();

    useEffect(() => {
        events.markOnCreateToApp();
        if (!appToken && mmkvToken && mmkvToken !== '') {
            dispatch(setToken(mmkvToken));
            dispatch(
                setProfile({
                    id: mmkvToken,
                    payload: {
                        aadhaarVerified: false,
                        androidId: undefined,
                        bundleVersion: undefined,
                        cancellationRate: undefined,
                        clientVersion: undefined,
                        customerReferralCode: undefined,
                        deviceId: undefined,
                        disability: undefined,
                        email: undefined,
                        firstName: mmkvFirstName,
                        followsRide: false,
                        frontendConfigHash: undefined,
                        gender: 'UNKNOWN',
                        hasCompletedMockSafetyDrill: undefined,
                        hasCompletedSafetySetup: false,
                        hasDisability: undefined,
                        hasTakenRide: false,
                        hasTakenValidAmbulanceRide: false,
                        hasTakenValidAutoRide: false,
                        hasTakenValidBikeRide: false,
                        hasTakenValidBusRide: false,
                        hasTakenValidCabRide: false,
                        hasTakenValidRide: false,
                        hasTakenValidTruckRide: false,
                        id: '',
                        isBlocked: false,
                        isMultimodalRider: false,
                        isPayoutEnabled: undefined,
                        isSafetyCenterDisabled: false,
                        language: undefined,
                        lastName: undefined,
                        maskedDeviceToken: undefined,
                        maskedMobileNumber: undefined,
                        middleName: undefined,
                        payoutVpa: undefined,
                        publicTransportVersion: undefined,
                        referralAmountPaid: undefined,
                        referralCode: undefined,
                        referralEarnings: undefined,
                        referredByEarnings: undefined,
                        whatsappNotificationEnrollStatus: undefined,
                        customerTags: undefined,
                        profilePicture: undefined,
                        businessEmail: undefined,
                        businessProfileVerified: undefined,
                    },
                }),
            );
        }
    }, []);

    useEffect(() => {
        const fetchAdConfig = async () => {
            try {
                const result = await triggerAdConfigFetch().unwrap();
                console.info('[AdConfig] Raw API response:', result);
                const unwrappedData = isWrappedResponse(result) ? result.data : result;
                const adConfigArray = Array.isArray(unwrappedData) ? unwrappedData : [unwrappedData];
                dispatch(setAdConfig(adConfigArray));
                console.info('[AdConfig] Processed ad configuration:', adConfigArray);
            } catch (error) {
                console.warn('[AdConfig] Failed to fetch ad configuration:', error);
            }
        };

        // Delay fetch to not impact boot time
        const timeoutId = setTimeout(fetchAdConfig, 1000);
        return () => clearTimeout(timeoutId);
    }, []);

    // Note:: Primary AppState event listener, please don't create a new one anywhere but use useAppStateChange
    const appState = useRef(AppState.currentState);
    useEffect(() => {
        if (Platform.OS === 'android') {
            OTABridge.markCurrentBundleAsStable();
            console.info('JS Bundle Version:', VERSION);
            setStringItem(MMKVKey.OTA_VERSION, VERSION);
        }
        const handleAppStateChange = (appStateNew: AppStateStatus) => {
            if (appStateNew === 'active' && appState.current !== 'active') {
                dispatch(setAppState('active'));
            } else if (appStateNew === 'background' && appState.current !== 'background') {
                dispatch(setAppState('background'));
            } else if (appStateNew === 'inactive') {
                dispatch(setAppState('inactive'));
            }
            appState.current = appStateNew;
        };
        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, []);

    // eslint-disable-next-line myCustomPlugin/no-as-in-modified-files
    const appId = initialPayload.appId as appName;
    useEffect(() => {
        CleverTap.profileSet({
            key: 'App Version',
            value: DeviceInfo.getVersion(),
        });
        CleverTap.profileSet({ key: 'Platform', value: Platform.OS });
        logEvent(EventName.NY_USER_ENTERED_APP);

        if (initialPayload.appId in appNameEnabled) {
            setUserProperties(getAnalytics(), { app_name: appId });
            dispatch(setAppName(appId));
        }
    }, []);

    // TODO: Remove this once we have a new snackbar implementation
    // const { show } = useSnackbar();
    // useEffect(() => {
    //     show({
    //         message: 'This is a snackbar messasage',
    //         duration: undefined, // Optional: Auto-dismiss after 3 seconds
    //         persist: true,
    //         backgroundColor: undefined, // Optional: Custom background color
    //         action: {
    //             // Optional: Action button
    //             label: 'UNDO',
    //             onPress: () => console.info('Action pressed'),
    //         },
    //     });
    // }, []);

    return (
        <ConfigProvider
            factors={{ appName: appId, language, city, theme }}
            get={undefined}
            updateFactors={undefined}
            updateCacheDetails={undefined}
            updateConfigFromRemote={undefined}>
            <RootAppNavigation />
        </ConfigProvider>
    );
};

const initializeAppMonitorConfig = (): (() => void) => {
    const loadConfig = async (): Promise<void> => {
        try {
            const configString = await NativeModules.AppMonitor.getCurrentConfiguration();
            const parsedEventLoggingConfig = parseAppMonitorConfig(configString);

            const fullConfig = await AppMonitor.getCurrentConfiguration();

            store.dispatch(
                setAppMonitorConfig({
                    config: fullConfig,
                    eventLoggingConfig: parsedEventLoggingConfig,
                }),
            );

            console.info('[App] AppMonitor config initialized', fullConfig);
        } catch (error) {
            console.error('[App] Failed to load AppMonitor config:', error);
        }
    };

    setTimeout(loadConfig, 1000);
    return () => {};
};

const Main = React.memo((props: InitialPayload) => {
    const initialPayload = props;
    useEffect(() => {
        permissionManager.initialize(store.dispatch);

        // Initialize MoEngage SDK (async - fetches App ID from native config)
        void MoEngage.initialize();

        const auth = getAuth();
        signInAnonymously(auth);

        const remoteConfig = getRemoteConfig();
        setDefaults(remoteConfig, defaultRemoteConfigs).then(() => {
            fetchAndActivate(remoteConfig);
            configManager.clearCache();
            console.info('Default values set.');
        });

        onConfigUpdated(remoteConfig, event => {
            console.info('remote-config updated keys: ' + JSON.stringify(event));
            activate(remoteConfig);
        });
        logEvent(EventName.NY_APP_STARTED);
        logEvent(EventName.APP_LAUNCHED);
        logEvent(EventName.NY_USER_APP_VERSION, { version: DeviceInfo.getVersion() });

        // Initialize AppMonitor config and get cleanup function
        const cleanupAppMonitorConfig = initializeAppMonitorConfig();
        const setIsGesture = async () => {
            if (Platform.OS === 'android' && NativeModules.MainAppUtils.isGestureNavigationEnabled) {
                const isGesture = await NativeModules.MainAppUtils.isGestureNavigationEnabled();
                setBoolItem(MMKVKey.IS_GESTURE_ENABLE, isGesture ?? true);
            }
        };
        setIsGesture();
        return () => {
            cleanupAppMonitorConfig();
        };
    }, []);
    return (
        <FlowStatusContextProvider>
            <FlowStatusContext.Consumer>
                {context => {
                    setFlowStatusContextRef(context);
                    return (
                        <Provider store={store}>
                            <PersistGate loading={null} persistor={persistor}>
                                <ContextWrapper>
                                    <App initialPayload={initialPayload} />
                                    <Toast />
                                </ContextWrapper>
                            </PersistGate>
                        </Provider>
                    );
                }}
            </FlowStatusContext.Consumer>
        </FlowStatusContextProvider>
    );
});

const MainWithFallbackUI = Sentry.withErrorBoundary(Main, {
    fallback: ({ error }) => <FallbackUI error={error} />,
});

export const NavigationBarBG = memo(
    ({
        isGestureEnable = true,
        navBarHeight = 0,
    }: {
        isGestureEnable: boolean | undefined;
        navBarHeight: number | undefined;
    }) => {
        return Platform.OS === 'android' && !isGestureEnable ? (
            <View
                style={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    height: navBarHeight,
                    backgroundColor: '#000000',
                    zIndex: 999,
                }}
            />
        ) : (
            <></>
        );
    },
);

export default MainWithFallbackUI;
