import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import React, { memo, useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform, View } from 'react-native';
import { navigationRouts } from '../../navigation/AppRoutes.bs.js';
import { AnimatedValuesProvider } from '../context/AnimatedValuesContext.tsx';
import { RefsProvider } from '../context/RefsContext.tsx';
import { navigationRef } from './RootNavigation.tsx';

import {
    useLazyRideBookingListGetQuery,
    useRideBookingListGetLazyQueryWithAppName,
} from '@/api/integrations/rtk/RideBookingListGet.ts';
import { updateSuggestedTripFromMyRides } from '@/src-v2/helpers/location/utils/LocationCaching.ts';
import AddFavourite from '@/src-v2/multimodal/screens/Favourites/Flow/AddFavourite.tsx';
import { ChooseCategoriesScreen } from '@/src-v2/screens/Ticketing/ChooseCategories/Flow.tsx';
import { TicketingScreen } from '@/src-v2/screens/Ticketing/ChooseEventScreen/Flow.tsx';
import { EventDetailsScreen } from '@/src-v2/screens/Ticketing/EventDetailsScreen/Flow.tsx';
import { PaymentStatusScreen } from '@/src-v2/screens/Ticketing/PaymentStatusScreen/Flow.tsx';
import { ReviewBookingScreen } from '@/src-v2/screens/Ticketing/ReviewBooking/Flow.tsx';
import { useDeepLinkHandler } from '@/src-v2/utils/deepLinkHandler.ts';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import HyperSdkReact from 'hyper-sdk-react';
import 'react-native-url-polyfill/auto';
import { HyperView, HyperViewStackNavigator } from '../components/hyperView.tsx';
import { useFlowStatusHandler } from '../hooks/useFlowStatusHandler.tsx';
import { createSdkPayload } from '../hybrid/hybridSDK.tsx';
import { logOut, selectToken } from '../state/client/auth.ts';
import {
    selectAppName,
    selectAppReadableName,
    selectIsOneClickFetched,
    selectNewFeatureFlags,
    selectUtmParams,
    setHideLoader,
    setIsOneClickFetched,
    setToastProps,
    setUtmParams,
} from '../state/client/session.ts';
import {
    PaymentSources,
    selectCachedDestinations,
    selectPaymentInfo,
    selectUserId,
    setPaymentInfo,
    setPayoutVpa,
    setReferralAmountToCollect,
    setReferralApplied,
} from '../state/client/user.ts';
import { useAppDispatch, useAppSelector } from '../state/hooks.ts';
import { initialUpdateProfileReq, useLazyGetProfileQuery, useUpdateProfileMutation } from '../state/server/userApi.ts';
import { firstRideCompletedEvent } from '../utils/common.ts';
import { getBoolItem, getStringItem, MMKVKey, setBoolItem, setStringItem } from '../utils/MMKV.ts';
import { MainNavigationParamList } from './globalParamList.tsx';
import { MainTabNavigation } from './mainTabNavigation.tsx';

import { MultimodalPaymentStatus } from '@/src-v2/multimodal/screens/PaymentStatus/Flow.tsx';
import DriverProfileFlow from '@/src-v2/screens/DriverProfile/Flow.tsx';
import { FollowRideWrapper } from '@/src-v2/screens/FollowRide/index.tsx';
import { SafetyTools } from '@/src-v2/screens/SafetyModule/UI.tsx';
import PickLocFromMap from '../components/common/PickLocFromMap';
import EditDestination from '../screens/editLocation/EditDestination.tsx';
import EditPickup from '../screens/editLocation/EditPickup';
import EndInfoScreen from '../screens/EndInfoScreen.tsx';
import SafetyCardModal from '../screens/SafetyCardModal';
import WebViewScreen from '../screens/WebViewScreen.tsx';

import BusTrackingScreen from '@/src-v2/multimodal/screens/BusTrackingScreen/index.tsx';
import MyTicketScreenFlow from '@/src-v2/screens/Ticketing/MyTicketScreen/Flow.tsx';
import { PaymentView } from '@/src-v2/screens/Ticketing/utils/PaymentView';
import { logger } from '@/src-v2/systems/logger/index.ts';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { store } from '../state/store.ts';
import { EventName, logEvent, LogInterface } from '@/typescript/utils/logger';
import { extractSdkId, parseHyperEventData } from '@/src-v2/utils/common.ts';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ServicesStackNavigator } from './servicesStackNavigator.tsx';
import { useAppLaunchVideoPopup } from '../hooks/useAppLaunchVideoPopup.tsx';
import { AppLaunchVideoBottomSheet } from '../components/ny-service/AppLaunchVideoBottomSheet.tsx';
import { HomeStackNavigator } from './homeStackNavigator.tsx';
import { TicketsStackNavigator } from './ticketsStackNavigator.tsx';
import { PassesStackNavigator } from './passesStackNavigator.tsx';
import { ProfileStackNavigator } from './profileStackNavigator.tsx';
import { LiveStackNavigator } from './liveStackNavigator.tsx';
import { RouteProp, StackActions, useRoute } from '@react-navigation/native';
import { ProfiledRideConfirmed } from '@/src-v2/screens/RideConfirmed/Flow.tsx';
import Config from 'react-native-config';

const Stack = createNativeStackNavigator<MainNavigationParamList>();

const Main: React.FC = () => {
    // const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const [rideBookingTrigger] = useRideBookingListGetLazyQueryWithAppName();
    const customerFirstRide = getBoolItem(MMKVKey.FIRST_RIDE_COMPLETE) ?? false;
    // const slowNetworkToastThreshHold = featureFlags.slowNetworkToastThreshHold;
    // Use the custom hook that encapsulates flow status handling logic with autoTrigger set to true
    const { AppUpdate } = NativeModules;

    useFlowStatusHandler({ autoTrigger: true });
    const checkForUpdates = async (appUpdateMethod: string) => {
        try {
            AppUpdate.checkAndUpdateApp(appUpdateMethod);
        } catch (error) {
            console.warn('AppUpdate: Error checking for updates:', error);
        }
    };
    React.useEffect(() => {
        if (Platform.OS == 'android') checkForUpdates(featureFlags.appUpdateMethod);
        const checkForFirstRide = async () => {
            if (customerFirstRide === false) {
                rideBookingTrigger({
                    limit: 2,
                    offset: 0,
                    status: 'COMPLETED',
                    clientId: undefined,
                    onlyActive: undefined,
                }).then(response => {
                    const responseData = response;
                    if (responseData) {
                        firstRideCompletedEvent(responseData);
                    }
                });
            }
        };
        checkForFirstRide();
    }, []);

    return null;
};

export const MainNavigation: React.FC = () => {
    const [getProfileTrigger] = useLazyGetProfileQuery();
    const appName = useAppSelector(selectAppName);
    const appReadableName = useAppSelector(selectAppReadableName);
    const [updateProfile] = useUpdateProfileMutation();
    const userToken = useAppSelector(selectToken);
    const dispatch = useAppDispatch();
    const cachedLocationObjects = useAppSelector(selectCachedDestinations);
    const isOneClickFetched = useAppSelector(selectIsOneClickFetched);
    const [trigger] = useLazyRideBookingListGetQuery();
    const utmParams = useAppSelector(selectUtmParams);
    const isUtmDataSend = getBoolItem(MMKVKey.UTM_DATA_SEND) ?? false;

    // App launch video popup (featureFlags are already city-specific from selectNewFeatureFlags)
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const { sheetRef: appLaunchPopupRef } = useAppLaunchVideoPopup({
        config: featureFlags.appLaunchPopupConfig,
        autoShowOnMount: true,
        delayMs: featureFlags.appLaunchPopupConfig.showDelayMs,
    });

    // Handle deep linking anytime whether closed or opened
    useDeepLinkHandler();

    useEffect(() => {
        if (
            utmParams !== null &&
            (utmParams.gclid || (utmParams.utm_medium !== 'organic' && utmParams.utm_source !== 'google-play'))
        ) {
            try {
                updateProfile({
                    ...initialUpdateProfileReq,
                    marketingParams: {
                        gclId: utmParams.gclid,
                        userType: isUtmDataSend ? 'OLD' : 'NEW',
                        utmCampaign: utmParams.utm_campaign,
                        utmContent: utmParams.utm_content,
                        utmCreativeFormat: utmParams.utm_creative_format,
                        utmMedium: utmParams.utm_medium,
                        utmSource: utmParams.utm_source,
                        utmTerm: utmParams.utm_term,
                        appName: appName,
                    },
                }).then(() => {
                    dispatch(setUtmParams(null));
                    setBoolItem(MMKVKey.UTM_DATA_SEND, true);
                });
            } catch (err) {
                console.error('sending MarketingParams failed in HomeScreen:', err);
            }
        }
    }, []);

    useEffect(() => {
        if (!isOneClickFetched) {
            trigger({
                limit: 30,
                offset: 0,
                status: undefined,
                clientId: undefined,
                onlyActive: undefined,
            }).then(data => {
                updateSuggestedTripFromMyRides(data.data?.list ?? [], dispatch, userToken, cachedLocationObjects);
                dispatch(setIsOneClickFetched(true));
            });
        }
    }, []);

    const [_initiate, setInitiate] = useState(false);
    const personId = useAppSelector(selectUserId);

    React.useEffect(() => {
        const initializeHyperSDK = () => {
            try {
                console.info('[HyperEvent] Initializing Hyper SDK');

                // Create HyperServices before calling initiate
                HyperSdkReact.createHyperServices('hyperKey');

                const sdkPayload = createSdkPayload({
                    environment: Config['PRESTO_ENV'] || 'production',
                    purpose: 'initiate',
                    readableAppName: appReadableName,
                    service: Config['PRESTO_ENV'] === 'sandbox' ? 'in.yatri.consumer' : 'in.juspay.hyperpay',
                    viewParam: undefined,
                    appToken: undefined,
                    customerId: personId || '',
                });

                logger.logDebug(`Payment initiate payload: ${JSON.stringify(sdkPayload)}`, 'PaymentSDKFlow');
                HyperSdkReact.initiate(JSON.stringify(sdkPayload), 'hyperKey');

                logEvent(EventName.HYPERSDK_INITIATE, {
                    payload: sdkPayload,
                });
                logEvent(
                    EventName.HYPERSDK_LOG,
                    {
                        ppEvent: 'initiate_called',
                        payload: sdkPayload,
                    },
                    [LogInterface.CleverTap, LogInterface.NammaYatri],
                );
            } catch (error) {
                console.error('[HyperEvent] Error initializing Hyper SDK:', error);
            }
        };

        initializeHyperSDK();

        getProfileTrigger()
            .unwrap()
            .then(async data => {
                const amountToCollect =
                    (data?.referralEarnings ?? 0) + (data?.referredByEarnings ?? 0) - (data?.referralAmountPaid ?? 0);

                dispatch(setReferralAmountToCollect({ id: userToken, payload: amountToCollect }));

                if (data?.referralCode) {
                    dispatch(setReferralApplied({ id: userToken, payload: true }));
                }
                if (data?.payoutVpa) {
                    dispatch(setPayoutVpa({ id: userToken, payload: data.payoutVpa }));
                }
                const isFirstRideTaken = getStringItem(MMKVKey.CUSTOMER_FIRST_RIDE);
                if (!isFirstRideTaken && data?.hasTakenRide) {
                    setStringItem(MMKVKey.CUSTOMER_FIRST_RIDE, 'true');
                }
                const messagingInstance = getMessaging();
                const token = await getToken(messagingInstance);
                const maskedDeviceToken = data.maskedDeviceToken;

                if (maskedDeviceToken) {
                    const firstThree = maskedDeviceToken.slice(0, 3);
                    const lastThree = maskedDeviceToken.slice(-3);

                    if (!token.startsWith(firstThree) || !token.endsWith(lastThree)) {
                        updateProfile({ ...initialUpdateProfileReq, deviceToken: token });
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching profile or token:', error);
            });
    }, []);

    React.useEffect(() => {
        // NOTE:: This useEffect register an event listener for hybridFlow, events can be called on any occasion -
        //        currently being used to exit the app by calling terminate action.
        const eventEmitter = new NativeEventEmitter(NativeModules['HyperSdkReact']);
        const eventListener = eventEmitter.addListener('HyperEvent', resp => {
            console.info('HyperEvent', resp);
            const data = parseHyperEventData(resp, 'hyperEvent');

            if (!data || typeof data !== 'object') {
                console.error('[HyperEvent] Failed to parse HyperEvent data');
                return;
            }

            const event = data.event || '';
            console.info('[HyperEvent] Received event data:', data);
            switch (event) {
                case 'initiate_result':
                    console.info('[HyperEvent] Initiate result received:', data);
                    logEvent(
                        EventName.HYPERSDK_LOG,
                        {
                            ppEvent: data.event,
                            value: data.payload,
                            orderId: data.orderId,
                        },
                        [LogInterface.CleverTap, LogInterface.NammaYatri],
                    );
                    break;
                case 'initiatePP': {
                    logEvent(EventName.NY_USER_INITIATED_PAYMENT_PAGE, undefined, [
                        LogInterface.CleverTap,
                        LogInterface.NammaYatri,
                    ]);
                    break;
                }
                case 'process_result':
                    logEvent(
                        EventName.HYPERSDK_LOG,
                        {
                            ppEvent: data.event,
                            payload: data.payload,
                            orderId: data.orderId,
                        },
                        [LogInterface.CleverTap, LogInterface.NammaYatri],
                    );
                    console.info('[HyperEvent] Process result received:', data);
                    if (data !== undefined && data.payload) {
                        switch (data.payload.action) {
                            case 'terminate': {
                                if (data.payload.screen === 'Profile') getProfileTrigger();
                                if (navigationRef.current && navigationRef.current.canGoBack()) {
                                    navigationRef.current?.goBack();
                                } else {
                                    navigationRef.current?.navigate(navigationRouts.homeTypeScript);
                                }
                                if (data.payload.delete_account_req === true) {
                                    dispatch(logOut());
                                }
                                break;
                            }
                            case 'paymentPage': {
                                logger.logError(
                                    `[HyperEvent] Received Process Result Status ${data.payload.status}`,
                                    'PaymentSDKFlow',
                                );
                                setInitiate(prev => !prev);
                                const currentPaymentInfo = selectPaymentInfo(store.getState());
                                switch (data.payload.status) {
                                    case 'charged': {
                                        if (
                                            currentPaymentInfo?.paymentSource === PaymentSources.YatriSathiTicketing ||
                                            currentPaymentInfo?.paymentSource === PaymentSources.OdishaYatriTicketing
                                        ) {
                                            dispatch(setPaymentInfo({ id: userToken, payload: null }));
                                            navigationRef.current?.dispatch(StackActions.pop(4));
                                            navigationRef.current?.navigate('YatriSathiPaymentStatusScreen', {
                                                orderId: currentPaymentInfo.paymentOrderId,
                                                sdkStatus: data.payload.status,
                                            });
                                        } else {
                                            navigationRef.current?.navigate(navigationRouts.multimodalPaymentStatus, {
                                                processResultStatus: 'charged',
                                                paymentOrderId: data.orderId,
                                            });
                                        }
                                        break;
                                    }
                                    case 'pending_vbv': {
                                        if (
                                            currentPaymentInfo?.paymentSource === PaymentSources.YatriSathiTicketing ||
                                            currentPaymentInfo?.paymentSource === PaymentSources.OdishaYatriTicketing
                                        ) {
                                            dispatch(setPaymentInfo({ id: userToken, payload: null }));
                                            navigationRef.current?.dispatch(StackActions.pop(4));
                                            navigationRef.current?.navigate('YatriSathiPaymentStatusScreen', {
                                                orderId: currentPaymentInfo.paymentOrderId || '',
                                                sdkStatus: data.payload.status,
                                            });
                                        } else {
                                            navigationRef.current?.navigate(navigationRouts.multimodalPaymentStatus, {
                                                processResultStatus: 'pending_vbv',
                                                paymentOrderId: data.orderId,
                                            });
                                        }
                                        break;
                                    }
                                    case 'backpressed': {
                                        if (
                                            currentPaymentInfo?.paymentSource === PaymentSources.YatriSathiTicketing ||
                                            currentPaymentInfo?.paymentSource === PaymentSources.OdishaYatriTicketing
                                        ) {
                                            dispatch(setPaymentInfo({ id: userToken, payload: null }));
                                            navigationRef.current?.goBack();
                                        }
                                        break;
                                    }
                                    default:
                                        logger.logError(
                                            `[HyperEvent] Received Default Process Result Status ${data.payload.status}`,
                                            'PaymentSDKFlow',
                                        );
                                        dispatch(
                                            setToastProps({
                                                visible: true,
                                                message: `Default Process result -> ${data.payload.status}`,
                                                backgroundColor: `${colors?.primitive?.black?.[2]}`,
                                                autoDismissAfter: 2000,
                                                logo: undefined,
                                                buttons: [],
                                                useSpannedToast: undefined,
                                                bottomSpanDescription: undefined,
                                                spannerType: undefined,
                                                dismissButton: undefined,
                                                onSpannedToastLoad: undefined,
                                                customToast: undefined,
                                                margin: undefined,
                                            }),
                                        );
                                        if (currentPaymentInfo?.paymentSource === PaymentSources.YatriSathiTicketing) {
                                            dispatch(setPaymentInfo({ id: userToken, payload: null }));
                                            navigationRef.current?.dispatch(StackActions.pop(4));
                                            navigationRef.current?.navigate('YatriSathiPaymentStatusScreen', {
                                                orderId: currentPaymentInfo.paymentOrderId || '',
                                                sdkStatus: data.payload.status,
                                            });
                                        } else {
                                            navigationRef.current?.navigate(navigationRouts.multimodalPaymentStatus, {
                                                processResultStatus: data.payload.status,
                                                paymentOrderId: data.orderId,
                                            });
                                        }

                                        break;
                                }
                                break;
                            }
                            case 'paymentManagement': {
                                switch (data.payload.status) {
                                    case 'backpressed': {
                                        if (navigationRef.current?.canGoBack()) {
                                            navigationRef.current?.goBack();
                                        } else {
                                            navigationRef.current?.navigate(navigationRouts.homeTypeScript);
                                        }
                                        break;
                                    }
                                    default:
                                        navigationRef.current?.navigate(navigationRouts.homeTypeScript);
                                }
                                break;
                            }
                        }
                    }
                    break;
                case 'hide_loader': {
                    dispatch(setHideLoader(false));
                    logEvent(
                        EventName.NY_USER_ENTERED_PAYMENT_PAGE,
                        {
                            orderId: data.orderId,
                        },
                        [LogInterface.CleverTap, LogInterface.NammaYatri],
                    );
                    logEvent(
                        EventName.HYPERSDK_LOG,
                        {
                            data,
                            ppEvent: data.event,
                            ppSessionId: extractSdkId(data.life_cycle_id ?? ''),
                            orderId: data.orderId,
                        },
                        [LogInterface.CleverTap, LogInterface.NammaYatri],
                    );
                    break;
                }
                case 'log_stream': {
                    logEvent(
                        EventName.HYPERSDK_LOG,
                        {
                            ppEvent: data.event,
                            payload: data.payload,
                            value: data.payload?.value,
                            orderId: data.orderId,
                        },
                        [LogInterface.CleverTap, LogInterface.NammaYatri],
                    );
                    break;
                }
                default:
                    console.info('Reached here: ', data);
                    console.info('data------>', data?.payload?.value);
            }
        });

        return () => {
            eventListener.remove();
        };
    }, []);

    return (
        <RefsProvider
            tipsBottomSheetModalRef={undefined}
            changeVehicleBottomsheetModalRef={undefined}
            tripDetailsBottomSheetModalRef={undefined}
            tryBoostedSearchModalRef={undefined}
            retryBoostedSearchModalRef={undefined}
            disabilityScreenBottomSheetModalRef={undefined}
            callDriverBottomsheetModalRef={undefined}
            cancelRideBottomsheetRideConfirmedModalRef={undefined}
            cancellationReasonBottomsheetModalRef={undefined}
            errorStateBottomsheetModalRef={undefined}
            startLocationTextInputRef={undefined}
            stopLocationsTextInputRef={undefined}
            newBookingFlowSheetRef={undefined}
            chatBottomsheetModalRef={undefined}
            multiChatRef={undefined}
            rideConfirmedBottomsheetModalRef={undefined}
            rideSafetyModalRef={undefined}
            reviewModalRef={undefined}
            genericSearchModalRef={undefined}
            followRideModalRef={undefined}
            locationPermissionModalRef={undefined}
            dateTimePickerBottomSheetModalRef={undefined}
            rideSummaryScreenCancelButtonRef={undefined}
            scheduledCardModalRef={undefined}
            overlappingRideExistModalRef={undefined}
            rentalPolicyModalRef={undefined}
            bookingDetailsFeedbackRef={undefined}
            redbusWebviewRef={undefined}
            redbusStateWebviewRef={undefined}
            turnOffSpecialAssistanceBottomSheetModalRef={undefined}
            rateCardRef={undefined}
            logoutModalRef={undefined}
            specialPickUpInfoBottomSheetModalRef={undefined}
            rideInsuranceBottomSheetModalRef={undefined}
            chatFooterTextRef={undefined}
            bottomSheetTopBannerRef={undefined}
            disabilityPopUp={undefined}
            addContactManuallyRef={undefined}
            manageContactsRef={undefined}
            deleteContactConfirmationRef={undefined}
            specialAssistanceBottomSheetModalRef={undefined}>
            <AnimatedValuesProvider
                sheetAnimatedIndex={undefined}
                sheetAnimatedPosition={undefined}
                circularSliderParentScroll={undefined}>
                <BottomSheetModalProvider>
                    <Stack.Navigator
                        initialRouteName={'main'}
                        screenOptions={{
                            headerShown: false,
                            presentation: 'card',
                            animation: 'default',
                            statusBarStyle: 'dark',
                            statusBarAnimation: 'fade',
                        }}>
                        <Stack.Screen name={'main'} component={Main} />
                        <Stack.Screen
                            name={'mainTabNavigation'}
                            options={{ animation: 'none' }}
                            component={MainTabNavigation}
                        />
                        <Stack.Screen name={'HomeTab'} component={HomeStackNavigator} />
                        <Stack.Screen name={'ServicesTab'} component={ServicesStackNavigator} />
                        <Stack.Screen name={'TicketsTab'} component={TicketsStackNavigator} />
                        <Stack.Screen name={'PassesTab'} component={PassesStackNavigator} />
                        <Stack.Screen name={'ProfileTab'} component={ProfileStackNavigator} />
                        <Stack.Screen name={'LiveTab'} component={LiveStackNavigator} />
                        <Stack.Screen
                            name={'taxiRideTracking'}
                            options={{ animation: 'none' }}
                            component={MemoizedProfiledRideConfirmed}
                        />
                        {/* <Stack.Screen name={'main'} component={Main}></Stack.Screen> */}
                        <Stack.Group>
                            <Stack.Screen name={'ambulanceScreen'}>
                                {() => <HyperView viewParam="rideConfirmed" />}
                            </Stack.Screen>
                            <Stack.Screen name={'deliveryScreen'}>
                                {() => <HyperView viewParam="rideConfirmed" />}
                            </Stack.Screen>
                            <Stack.Screen name={'continueBooking'}>
                                {() => <HyperView viewParam="waitingFordriver" />}
                            </Stack.Screen>
                            <Stack.Screen name={'tripDetail'}>
                                {() => (
                                    <HyperView
                                        viewParam={'tripDetail$$' + ''} // TODO: remove this once Jayanth PR is merged
                                    />
                                )}
                            </Stack.Screen>
                            <Stack.Screen name={'reportIssue'} component={HyperViewStackNavigator} />
                            <Stack.Screen
                                name={'help'}
                                component={HelpStackNavigator}
                                options={{ headerShown: false }}
                            />

                            <Stack.Screen name={'followRide'} component={FollowRideWrapper} />
                            <Stack.Screen
                                name="EndInfoScreen"
                                component={EndInfoScreen}
                                options={{ headerShown: false }}
                            />

                            <Stack.Screen name={'driverProfile'} component={DriverProfileFlow} />
                            <Stack.Screen name={'webView'} component={WebViewScreen} />
                            <Stack.Screen name={'safetyTools'} component={SafetyTools} />
                            <Stack.Screen name={'multimodalPaymentStatus'} component={MultimodalPaymentStatus} />
                            <Stack.Screen name={'editPickup'} component={EditPickup} />
                            <Stack.Screen name={'editDestination'} component={EditDestination} />
                            <Stack.Screen name={'locateOnMap'} component={PickLocFromMap} />

                            <Stack.Screen name={'busTracking'} component={BusTrackingScreen} />
                        </Stack.Group>
                        <Stack.Group screenOptions={{ presentation: 'transparentModal' }}>
                            <Stack.Screen name="safetyCard" component={SafetyCardModal} />
                        </Stack.Group>
                        <Stack.Screen name={'Ticketing'} component={TicketingScreen} />
                        <Stack.Screen name={'EventDetails'} component={EventDetailsScreen} />
                        <Stack.Screen name={'ChooseCategories'} component={ChooseCategoriesScreen} />
                        <Stack.Screen name={'ReviewBooking'} component={ReviewBookingScreen} />
                        <Stack.Screen name={'PaymentView'} component={PaymentView} />
                        <Stack.Screen
                            name="YatriSathiPaymentStatusScreen"
                            component={PaymentStatusScreen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen name={'MyTicketScreen'} component={MyTicketScreenFlow} />
                        <Stack.Screen name={'addFavourite'} component={AddFavourite} />
                    </Stack.Navigator>
                    <AppLaunchVideoBottomSheet
                        sheetRef={appLaunchPopupRef}
                        config={featureFlags.appLaunchPopupConfig}
                    />
                </BottomSheetModalProvider>
            </AnimatedValuesProvider>
        </RefsProvider>
    );
};

const MemoizedProfiledRideConfirmed = memo(() => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'taxiRideTracking'>>();
    return (
        <ProfiledRideConfirmed
            bookingId={route.params.bookingId}
            hideSideDrawer={false}
            multimodalProps={route.params.multimodalProps}
        />
    );
});

const HelpScreen = () => {
    return (
        <View style={{ flex: 1 }}>
            <HyperView viewParam="help" />
        </View>
    );
};

const HelpStackNavigator = () => {
    const HelpStack = createNativeStackNavigator();

    return Platform.OS === 'android' ? (
        <SafeAreaView style={{ flex: 1 }}>
            <HelpStack.Navigator screenOptions={{ headerShown: false }}>
                <HelpStack.Screen
                    name={'helpScreen'}
                    component={HelpScreen}
                    options={{ animation: 'ios_from_right' }}
                />
            </HelpStack.Navigator>
        </SafeAreaView>
    ) : (
        <HelpStack.Navigator screenOptions={{ headerShown: false }}>
            <HelpStack.Screen name={'helpScreen'} component={HelpScreen} options={{ animation: 'ios_from_right' }} />
        </HelpStack.Navigator>
    );
};
