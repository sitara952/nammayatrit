import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { BusOtpAction } from './Types';
import { BusOtpUI } from './UI';
import { useBusOtpFlow } from './useBusOtpFlow';
import { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import Danger from '@/typescript/components/svg/Danger';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { setToastProps, selectIsMetroServiceable, setHideLoader } from '@/typescript/state/client/session';
import { RouteProp, useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BusOtpActivateUI } from './BusOtpActivateUI';
import { BusOtpFlowParams, MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { logEvent, EventName, EventPrefix, logPrefixEvent } from '@/typescript/utils/logger';
import { useMultimodalPassPurchasedPassIdVerifyPostMutation } from '@/api/integrations/rtk/MultimodalPassPurchasedPassIdVerifyPost';
import { useMultimodalPassAvailablePassesGetQuery } from '@/api/integrations/rtk/MultimodalPassAvailablePassesGet';
import { useMultimodalPassPassIdSelectPostMutation } from '@/api/integrations/rtk/MultimodalPassPassIdSelectPost';
import { useCachedPurchasedPasses } from '@/src-v2/hooks/useCachedPurchasedPasses';
import { selectUserLanguage } from '@/typescript/state/client/session';
import { languageToCode } from '@/src-v2/utils/common';
import { useRefsContext } from '@/typescript/context/RefsContext';
import {
    clearBusOtpData,
    selectIsTouristBus,
    selectEligiblePassIds,
    selectDetectedRouteCode,
    clearTouristBusPassData as clearTouristBusPassDataAction,
} from './busOtp';
import { useRecentSearches } from '../../hooks/useRecentSearches';
import { useSuggestions } from '../SingleModeSearch/hooks/useSuggestions';
import { SearchResultItem } from '../Search/components/SearchSectionListItem/types';
import { Keyboard, NativeModules, Platform } from 'react-native';
import { useSuggestedBusData } from './hooks/useSuggestedBusData';
import { usePublicTransportUtils } from '../../utils/PublicTransportUtils';
import { goToJourneyDetails } from '@/typescript/state/sharedReducer';
import { selectToken } from '@/typescript/state/client/auth';
// Payment imports
import HyperSdkReact from 'hyper-sdk-react';
import { checkAndInitiatePayment } from '@/src-v2/utils/Payment';
import { selectAppReadableName, selectNewFeatureFlags } from '@/typescript/state/client/session';
import { selectUserId } from '@/typescript/state/client/user';
import { setStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import { useKeyboardController } from 'react-native-keyboard-controller';

// const queryParams = useMemo(
//     () => ({
//         city: undefined,
//         publicTransportConfigVersion: cachedVersion || undefined,
//         vehicleType: undefined,
//         vehicleNumber: undefined,
//     }),
//     [cachedVersion],
// );

// // RTK Query for fetching data
// const [
//     triggerPublicTransportDataGet,
//     { data: queryData, error: queryError, isLoading: queryLoading, isSuccess: querySuccess },
// ] = useLazyPublicTransportDataGetQuery();

// Trigger data fetch when shouldFetchData becomes true
// useEffect(() => {
//     triggerPublicTransportDataGet(queryParams);
// }, []);

export const BusOtpFlow = () => {
    const route: RouteProp<{ params: BusOtpFlowParams }, 'params'> = useRoute();
    const [isWrongOtp, setIsWrongOtp] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isVerifyingPass, setIsVerifyingPass] = useState(false);
    const [verificationErrorMessage, setVerificationErrorMessage] = useState<string>('');
    const dispatch = useAppDispatch();
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const scanOtpRef = useRef(true);
    const flowState = route.params.state;
    const userToken = useAppSelector(selectToken);
    const isMetroServiceable = useAppSelector(selectIsMetroServiceable);

    // Payment selectors
    const appReadableName = useAppSelector(selectAppReadableName);
    const userId = useAppSelector(selectUserId);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);

    // Device IMEI for pass selection
    const [imeiNumber, setImeiNumber] = useState<string | null>(null);
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    const { AppInfoModule } = NativeModules;
    const { setEnabled } = useKeyboardController();

    // Fetch device IMEI number
    useEffect(() => {
        const fetchDeviceId = async () => {
            try {
                const id = await AppInfoModule.getUTSId();
                setImeiNumber(id);
            } catch (error) {
                console.error('Error fetching device ID:', error);
                setImeiNumber(null);
            }
        };
        fetchDeviceId();
    }, [AppInfoModule]);

    // Search functionality for wrong OTP flow
    const { recentSearches, addSearch } = useRecentSearches();
    const { suggestions, suggestionsLoading, searchPublicTransport } = useSuggestions(
        'Bus',
        undefined,
        undefined,
        false,
        false,
    );
    const { getStationByCode } = usePublicTransportUtils({
        maxStopDistance: 1000,
        enabled: true,
    });

    // Pass verification API and data
    const [verifyPassMutation] = useMultimodalPassPurchasedPassIdVerifyPostMutation();
    const userLanguage = useAppSelector(selectUserLanguage);
    const { data: availablePassesData } = useMultimodalPassAvailablePassesGetQuery({
        language: languageToCode(userLanguage),
    });
    const [selectPassMutation] = useMultimodalPassPassIdSelectPostMutation();

    const { refetch } = useCachedPurchasedPasses(flowState === 'Pass');
    const { passVerificationFailedModalRef, busOtpSearchBottomSheetRef, touristBusPassBottomSheetRef } =
        useRefsContext();

    // Get activePassId and locationData from route params
    const activePassId = route.params?.activePassId;
    const locationData = route.params?.locationData || {
        currentLat: undefined,
        currentLon: undefined,
    };

    const handlePassVerification = useCallback(
        async (otp: string) => {
            console.info('Pass flow: verifying OTP with pass:', otp);

            if (!activePassId) {
                console.error('No active pass ID found for verification');
                dispatch(
                    setToastProps({
                        message: 'No active pass found. Please purchase a pass first.',
                        backgroundColor: `${themeColors.Fill_negativeHigh}`,
                        autoDismissAfter: 1500,
                        buttons: [],
                        visible: true,
                        logo: <Danger />,
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
                return;
            }

            setIsVerifyingPass(true);

            try {
                const result = await verifyPassMutation({
                    purchasedPassId: activePassId,
                    body: {
                        vehicleNumber: otp,
                        currentLat: locationData.currentLat,
                        currentLon: locationData.currentLon,
                        stopId: undefined,
                        autoActivated: false,
                    },
                });
                if ('error' in result) {
                    logPrefixEvent(EventPrefix.NY_BUS_OTP_PASS, 'failure_' + otp);
                    console.error('Error verifying pass:', result.error);
                    const errorMsg =
                        // @ts-expect-error - RTK Query error type doesn't expose data.errorMessage properly
                        result.error?.data?.errorMessage ||
                        "We couldn't verify your pass. Please try again or contact support if the issue persists.";

                    setVerificationErrorMessage(errorMsg);
                    passVerificationFailedModalRef.current?.present();
                } else {
                    console.info('Pass verified successfully');
                    logPrefixEvent(EventPrefix.NY_BUS_OTP_PASS, 'success_' + otp);
                    // Refresh pass data to get updated status
                    await refetch();

                    navigation.goBack();
                }
            } catch (error) {
                logPrefixEvent(EventPrefix.NY_BUS_OTP_PASS, 'failure_' + otp);
                console.error('Error verifying pass:', error);
                const errorMsg =
                    // @ts-expect-error - RTK Query error type doesn't expose data.errorMessage properly
                    error?.data?.errorMessage || userLanguageStrings.SomethingWentWrongPleaseTryAgain;

                setVerificationErrorMessage(errorMsg);
                passVerificationFailedModalRef.current?.present();
            } finally {
                setIsVerifyingPass(false);
            }
        },
        [
            activePassId,
            dispatch,
            themeColors.Fill_negativeHigh,
            userLanguageStrings.SomethingWentWrongPleaseTryAgain,
            verifyPassMutation,
            refetch,
            navigation,
            passVerificationFailedModalRef,
            locationData,
        ],
    );

    const onCompleteCallback = () => {
        setTimeout(() => (scanOtpRef.current = true), 200);
    };
    const isFocused = useIsFocused();
    useSuggestedBusData(isFocused, false);
    const onError = () => {
        dispatch(
            setToastProps({
                message: userLanguageStrings.SomethingWentWrongPleaseTryAgain,
                backgroundColor: `${themeColors.Fill_negativeHigh}`,
                autoDismissAfter: 1500,
                buttons: [],
                visible: true,
                logo: <Danger />,
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                margin: undefined,
                customToast: undefined,
            }),
        );
    };
    const onWrongOtp = () => {
        dispatch(
            setToastProps({
                message: userLanguageStrings.WrongOTPEnteredPleasetryagain,
                backgroundColor: `${themeColors.Fill_negativeHigh}`,
                autoDismissAfter: 1500,
                buttons: [],
                visible: true,
                logo: <Danger />,
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                margin: undefined,
                customToast: undefined,
            }),
        );
    };

    const onFleetRouteMapMissing = (otp: string) => {
        dispatch(
            setToastProps({
                message: "Can't detect the bus route. Please enter the bus route number manually.",
                backgroundColor: `${themeColors.Fill_negativeHigh}`,
                autoDismissAfter: 1500,
                buttons: [],
                visible: true,
                logo: <Danger />,
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                margin: undefined,
                customToast: undefined,
            }),
        );
        navigation.navigate('ServicesTab', {
            screen: 'singleModeBookingNavigator',
            params: {
                screen: 'singleModeSearch',
                params: { bookingType: 'Bus', sourceStop: undefined, fallbackView: true, otp: otp },
            },
        });
    };

    const { fetchBusData, isPublicTransportDataLoading } = useBusOtpFlow(
        setIsWrongOtp,
        setIsSuccess,
        onError,
        onWrongOtp,
        onFleetRouteMapMissing,
        onCompleteCallback,
    );

    const [currentOtp, setCurrentOtp] = useState<string>('');

    const isTouristBus = useAppSelector(state => selectIsTouristBus(state, currentOtp));

    const eligiblePassIds = useAppSelector(state => selectEligiblePassIds(state, currentOtp));
    const detectedRouteCode = useAppSelector(state => selectDetectedRouteCode(state, currentOtp));

    const clearTouristBusPassData = useCallback(() => {
        if (currentOtp) {
            dispatch(clearTouristBusPassDataAction(currentOtp));
        }
    }, [currentOtp, dispatch]);

    const handleProceed = (otp: string) => {
        console.info('Proceeding with OTP:', otp);
        logEvent(EventName.NY_BUS_OTP_TYPED);
        setCurrentOtp(otp);
        dispatch(clearBusOtpData(otp));
        fetchBusData(otp);
    };

    const bookingResolver: Resolver<BusOtpAction> = async action => {
        switch (action.type) {
            case 'PROCEED': {
                handleProceed(action.payload?.otp ?? '');
                break;
            }
            default:
                break;
        }
    };

    const passResolver: Resolver<BusOtpAction> = async action => {
        switch (action.type) {
            case 'PROCEED': {
                const otp = action.payload?.otp ?? '';
                await handlePassVerification(otp);
                break;
            }
            default:
                break;
        }
    };

    const handleCloseVerificationFailedModal = () => {
        passVerificationFailedModalRef.current?.dismiss();
        setVerificationErrorMessage('');
    };

    // Handle when user selects a bus route/stop from the search bottomsheet
    const handleRecentSearchPress = useCallback(
        (item: SearchResultItem, otp: string) => {
            Keyboard.dismiss();
            // Add to recent searches
            addSearch(item);

            // Close the search bottomsheet
            busOtpSearchBottomSheetRef.current?.dismiss();

            // Navigate to the booking flow
            if (item.routeCode) {
                navigation.navigate(
                    'HomeTab',
                    {
                        screen: 'busOTPViaTicketBookingFlow',
                        params: {
                            otp: otp ?? '',
                            routeCode: item.routeCode,
                            resetKey: Date.now().toString(),
                        },
                    },
                    { pop: true },
                );
            } else if (item.stopCode) {
                // Stop selected - navigate to journey details
                const destinationStop = getStationByCode(item.stopCode);
                goToJourneyDetails({
                    userToken,
                    dispatch,
                    navigation,
                    destinationStop,
                    originStop: undefined,
                    recentLocationId: undefined,
                    routeCode: undefined,
                    startTime: undefined,
                    vehicleType: 'BUS',
                    serviceableStartTime: undefined,
                    otp: undefined,
                    isSingleModeMetro: false,
                });
            }
        },
        [addSearch, navigation, busOtpSearchBottomSheetRef, getStationByCode, userToken, dispatch, isMetroServiceable],
    );

    const handleBuyTouristBusTicket = useCallback(async () => {
        if (!isTouristBus || !availablePassesData || !currentOtp) return;

        if (!imeiNumber) {
            console.error('Device ID not available yet');
            return;
        }

        // Flatten passes from all categories
        const availablePasses = availablePassesData.flatMap(category => category?.passes || []);
        const activePass = availablePasses.find(pass => pass.id && eligiblePassIds.includes(pass.id));

        if (!activePass) return;

        console.info('Buying ticket with pass:', activePass.id);
        setIsProcessingPayment(true);

        try {
            const result = await selectPassMutation({
                passId: activePass.id,
                body: {
                    startDate: new Date().toISOString().split('T')[0],
                    imeiNumber: imeiNumber,
                    profilePicture: '',
                },
            }).unwrap();

            console.info('Pass selected successfully:', result);

            const { paymentOrder, purchasedPassId: _purchasedPassId } = result;

            if (paymentOrder && paymentOrder.sdk_payload) {
                // Use sdk_payload directly (it's already an object)
                const sdkPayload = paymentOrder.sdk_payload;
                const processPayload = {
                    ...sdkPayload,
                    allowedAccountTypes: ['SAVINGS', 'CURRENT', 'SAVINGS||LITE', 'CURRENT||LITE'],
                    payload: {
                        ...sdkPayload.payload,
                        action: 'paymentPage',
                        udf1: newFeatureFlags?.enableHyperUPI ? 'hyperupi' : '',
                    },
                };

                console.info('Initiating payment with HyperSDK');

                dispatch(setHideLoader(true));
                if (Platform.OS === 'ios') setEnabled(false);
                setIsProcessingPayment(false);
                await checkAndInitiatePayment(appReadableName, userId || '');
                HyperSdkReact.process(JSON.stringify(processPayload), 'paymentPage');
                setStringItem(MMKVKey.PAYMENT_PAGE_PAYLOAD, JSON.stringify(processPayload));

                logEvent(EventName.HYPERSDK_PROCESS, {
                    processPayload: processPayload,
                    orderId: paymentOrder.order_id,
                });

                // Dismiss bottomsheet after initiating payment
                touristBusPassBottomSheetRef.current?.dismiss();
            } else {
                console.warn('No payment order or SDK payload found');
                setIsProcessingPayment(false);
                touristBusPassBottomSheetRef.current?.dismiss();
            }
        } catch (error) {
            console.error('Error selecting pass:', error);
            setIsProcessingPayment(false);
            dispatch(setHideLoader(false));
            touristBusPassBottomSheetRef.current?.dismiss();
        }
    }, [
        isTouristBus,
        currentOtp,
        eligiblePassIds,
        availablePassesData,
        selectPassMutation,
        touristBusPassBottomSheetRef,
        imeiNumber,
        appReadableName,
        userId,
        newFeatureFlags,
        dispatch,
        setEnabled,
    ]);

    const handleSearchTouristBusDestination = useCallback(() => {
        touristBusPassBottomSheetRef.current?.dismiss();
        navigation.navigate('HomeTab', {
            screen: 'busOTPViaTicketBookingFlow',
            params: {
                otp: currentOtp ?? '',
                routeCode: detectedRouteCode ?? undefined,
                resetKey: undefined,
            },
        });
    }, [navigation, currentOtp, detectedRouteCode, touristBusPassBottomSheetRef]);

    const mpDispatch = createDispatcher(
        flowState === 'Booking' ? bookingResolver : flowState === 'Pass' ? passResolver : bookingResolver,
    );

    const availablePasses = useMemo(() => {
        if (!availablePassesData) return [];
        return availablePassesData.flatMap(category => category?.passes || []);
    }, [availablePassesData]);

    const viewState = {
        autoFillOtp: route.params.params?.autoFillOtp,
        mpDispatch,
        isPublicTransportDataLoading: route.params.state === 'Pass' ? isVerifyingPass : isPublicTransportDataLoading,
        isWrongOtp,
        setIsWrongOtp,
        isPublicTransportDataSuccess: isSuccess,
        setIsSuccess,
        scanOtpRef,
        displaySearchBar: route.params.displaySearchBar,
        recentSearches,
        suggestions,
        loadingSuggestions: suggestionsLoading,
        searchPublicTransport,
        onRecentSearchPress: handleRecentSearchPress,
        currentOtp,
        isTouristBus,
        clearTouristBusPassData,
        onBuyTouristBusTicket: handleBuyTouristBusTicket,
        onSearchTouristBusDestination: handleSearchTouristBusDestination,
        availablePasses,
        isProcessingPayment,
    };

    // For now, returning null as the UI component doesn't exist yet.
    return route.params.state === 'Booking' ? (
        <BusOtpUI {...viewState} />
    ) : route.params.params !== undefined ? (
        <BusOtpActivateUI
            {...route.params.params}
            mpDispatch={mpDispatch}
            displaySearchBar={route.params.displaySearchBar}
            verificationErrorMessage={verificationErrorMessage}
            onCloseVerificationFailedModal={handleCloseVerificationFailedModal}
        />
    ) : (
        <></>
    );
};
