import BusOtpCard from '@/src-v2/assets/mt_ic_bus_otp_card.webp';
import SaintImg from '@/src-v2/assets/mt_ic_thiruvalluvar.webp';
import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import QrIcon from '@/src-v2/assets/svg/qrIcon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useEffect, useMemo, useState, useCallback } from 'react';
import BottomSheet, { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';
import Animated, {
    interpolateColor,
    LinearTransition,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import Fallback from '@/src-v2/assets/video-fallback.webp';
import { getArrayItem, MMKVKey } from '@/typescript/utils/MMKV';
import { VideoPlayer } from '@/src-v2/components/VideoPlayer';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { Image, Modal, Platform, ActivityIndicator, LayoutChangeEvent, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { CameraView } from './components/CameraView';
import { QRScannerFrame } from './components/QRScannerFrame';
import OTPComponent, { OTPComponentRef } from './OtpComponent';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { OtpKeyboard } from './components/Keypad';
import { useMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetOnboardedVehicleDetailsPostMutation } from '@/api/integrations/rtk/MultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetOnboardedVehicleDetailsPost';

import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { passAPIEntity } from '@/readOnly/api/types/PassAPIEntity.gen';
import { BusOtpAction } from './Types';
import { ProcessedLegInfo } from '../../types/journeyTracking';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    selectNewFeatureFlags,
    setToastProps,
    selectAppConfig,
    selectSuggestedBusDataCumulative,
} from '@/typescript/state/client/session';
import Danger from '@/typescript/components/svg/Danger';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { setBusFleetNumber } from '@/typescript/state/client/journey';
import { createJourneyId } from '@/typescript/state/client/user';
import OtpIcon from '@/src-v2/assets/svg/otpIcon';
import { Thirukural } from '../../components/svg/Thirukural';
import React from 'react';
import { setRefetchJourneys } from '@/typescript/state/client/session';
import { StyleProp, ViewStyle } from 'react-native';
import { BusOtpFailedSearch } from '../SingleModeSearch/Components/BusOtpFailedSearch';
import { TouristBusBottomsheet } from '../TouristBus/TouristBusBottomsheet';
import { SearchResultItem } from '../Search/components/SearchSectionListItem/types';
import { SearchTarget } from '../../utils/PublicTransportUtils';
import { LeftArrow } from '@/src-v2/multimodal/components/svg/Arrows';
import { FadeIn, FadeOut } from 'react-native-reanimated';

// Memoized Activate Button Component to prevent re-renders
const ActivateButton = React.memo<{
    type: 'Book' | 'Activate' | 'Pass';
    isDisabled: boolean;
    isLoading: boolean;
    buttonAnimatedStyle: StyleProp<ViewStyle>;
    animatedStyle: StyleProp<ViewStyle>;
    isOtpComplete: boolean;
    onActivate: () => void;
    userLanguageStrings: {
        ActivateTicket: string;
        BookTicket: (transport: string) => string;
        Bus: string;
    };
}>(
    ({ type, isDisabled, isLoading, buttonAnimatedStyle, animatedStyle, onActivate, userLanguageStrings }) => {
        const { handlers } = useScaleAnimation();

        return (
            <Animated.View style={tailwind.style('px-[24px] pt-[20px]')}>
                <Pressable
                    accessibilityLabel={type === 'Activate' ? 'Activate Ticket Button' : 'book bus ticket button'}
                    testID="activate-ticket-button"
                    accessibilityRole="button"
                    style={tailwind.style('')}
                    disabled={isDisabled}
                    {...handlers}
                    onPress={onActivate}>
                    <Animated.View
                        style={[
                            tailwind.style('h-[58px] rounded-[16px] gap-[12px] items-center justify-center flex-row'),
                            buttonAnimatedStyle,
                            animatedStyle,
                        ]}>
                        {isLoading ? (
                            <ActivityIndicator size="small" color={'#ffffff'} />
                        ) : (
                            <>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-white font-areaNormal-extrabold text-[15px] leading-[17px]',
                                    )}>
                                    {type === 'Activate'
                                        ? userLanguageStrings.ActivateTicket
                                        : type === 'Pass'
                                          ? 'Activate Pass'
                                          : userLanguageStrings.BookTicket(userLanguageStrings.Bus)}
                                </Animated.Text>
                                <Icon icon={<DoubleArrowsWhite fill="" />} size={16} />
                            </>
                        )}
                    </Animated.View>
                </Pressable>
            </Animated.View>
        );
    },
    (prevProps, nextProps) => {
        // Only re-render when OTP completion status changes or loading state changes
        return (
            prevProps.type === nextProps.type &&
            prevProps.isDisabled === nextProps.isDisabled &&
            prevProps.isLoading === nextProps.isLoading &&
            prevProps.isOtpComplete === nextProps.isOtpComplete &&
            prevProps.onActivate === nextProps.onActivate
        );
    },
);
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import MagnifyingGlass from '@/src-v2/assets/svg/MagnifyingGlass';
import { selectEligiblePassIds } from './busOtp';

const BusOtpScreen = ({
    isError = true,
    onOtpComplete = () => {},
    autoFillOtp,
    autoFillOtpFromDeepLink,
    isScanOtp = false,
    type = 'Book',
    onScanQrPress = () => {},
    journeyId,
    legOrder,
    subLegOrder,
    mpDispatch,
    isLoading = false,
    setIsWrongOtp,
    setIsSuccess,
    isSuccess = false,
    scanOtpRef,
    displaySearchBar,
    recentSearches,
    suggestions,
    loadingSuggestions,
    searchPublicTransport,
    onRecentSearchPress,
    isTouristBus,
    currentOtp,
    clearTouristBusPassData,
    onBuyTouristBusTicket,
    onSearchTouristBusDestination,
    isProcessingPayment,
    availablePasses,
}: {
    isError: boolean;
    onOtpComplete: (otp: string) => void;
    autoFillOtpFromDeepLink: string | undefined;
    autoFillOtp: string | undefined;
    isScanOtp: boolean;
    type: 'Book' | 'Activate' | 'Pass';
    onScanQrPress: () => void;
    legInfo: legInfo | ProcessedLegInfo | undefined;
    journeyId: string;
    legOrder: number;
    subLegOrder: number;
    mpDispatch: (action: BusOtpAction) => void;
    isLoading: boolean | undefined;
    isOtpScreen: boolean;
    setIsWrongOtp: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    setIsSuccess: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    isSuccess: boolean | undefined;
    scanOtpRef: React.MutableRefObject<boolean>;
    displaySearchBar: boolean;
    recentSearches: SearchResultItem[] | undefined;
    suggestions: SearchResultItem[] | undefined;
    loadingSuggestions: boolean | undefined;
    searchPublicTransport: ((searchString: string, searchType: SearchTarget) => void) | undefined;
    onRecentSearchPress: ((item: SearchResultItem, otp: string) => void) | undefined;
    currentOtp: string;
    isTouristBus: boolean;
    clearTouristBusPassData: (() => void) | undefined;
    onBuyTouristBusTicket: (() => void) | undefined;
    onSearchTouristBusDestination: (() => void) | undefined;
    availablePasses: passAPIEntity[] | undefined;
    isProcessingPayment: boolean | undefined;
}) => {
    const [screenState, setScreenState] = useState<'camera' | 'otp'>('camera');
    const [isVideoVisible, setIsVideoVisible] = useState(false);
    const [isTypingAnimation, setIsTypingAnimation] = useState(false);
    const [otpKeyboardHeight, setOtpKeyboardHeight] = useState(0);
    const { busOtpModalRef, busOtpSearchBottomSheetRef, touristBusPassBottomSheetRef } = useRefsContext();
    const eligiblePassIds = useAppSelector(state => selectEligiblePassIds(state, currentOtp));

    // Tourist Bus Pass handling
    const activePass = useMemo(() => {
        if (!eligiblePassIds || eligiblePassIds.length === 0 || !availablePasses) return null;
        return availablePasses.find(pass => pass.id && eligiblePassIds.includes(pass.id));
    }, [currentOtp, availablePasses, eligiblePassIds]);

    const handleCloseTouristBusBottomSheet = useCallback(() => {
        touristBusPassBottomSheetRef.current?.dismiss();
        clearTouristBusPassData?.();
    }, [clearTouristBusPassData]);

    const { animatedStyle } = useScaleAnimation();
    const [setOnboardedVehicleDetails, { isLoading: isApiLoading }] =
        useMultimodalJourneyIdOrderLegOrderSublegSubLegOrderSetOnboardedVehicleDetailsPostMutation();
    const [otp, setOtp] = useState('');
    const buttonValue = useSharedValue(0);
    const wiggleOffset = useSharedValue(0);
    const { top, bottom } = useSafeAreaInsets();
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const showNearbyBusInOtpFlow = featureFlags.showNearbyBusInOtpFlow;
    const isCameraDefault = featureFlags.toggleQRtoOtpFlow;
    const [shouldRenderCamera, setShouldRenderCamera] = useState(Platform.OS === 'android' || isCameraDefault);

    const snapPoints = useMemo(() => {
        const baseHeight = 98 + 112 + 65 + bottom;
        const extendedHeight = baseHeight + (otpKeyboardHeight - 30); // Extra 30px reduction to properly adjust the kepboard height
        const expandedHeight =
            otpKeyboardHeight > 0
                ? extendedHeight + 44 > SCREEN_HEIGHT
                    ? SCREEN_HEIGHT - top
                    : extendedHeight
                : '83%';
        return [baseHeight, expandedHeight];
    }, [otpKeyboardHeight, bottom]);

    const { handlers: searchBarHandlers, animatedStyle: searchBarAnimatedStyle } = useScaleAnimation();

    // Memoize these calculations to prevent re-renders
    const isActivateButtonDisabled = useMemo(() => otp.length !== 5 || isApiLoading, [otp.length, isApiLoading]);
    const showKeyboardFirstRow = useMemo(() => otp.length > 0, [otp.length]);

    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentIndexRef = useRef(0);
    const otpComponentRef = useRef<OTPComponentRef>(null);
    const sheetAnimatedPosition = useSharedValue(0);
    const sheetAnimatedIndex = useSharedValue(0);
    const selectSuggestedBusData = useAppSelector(selectSuggestedBusDataCumulative);
    const isFocused = useIsFocused();

    // Filter suggested bus data based on typed OTP characters
    const filteredSuggestedBusData = useMemo(() => {
        if (!otp || otp.length === 0) {
            return selectSuggestedBusData;
        }
        return selectSuggestedBusData?.filter(bus => bus?.busNumber?.toLowerCase().startsWith(otp.toLowerCase()));
    }, [selectSuggestedBusData, otp]);
    const floatingHeaderStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: -(SCREEN_HEIGHT - sheetAnimatedPosition.value + (Platform.OS === 'android' ? -16 : 16)),
                },
            ],
        };
    });

    const dispatch = useAppDispatch();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const appSystemConfig = useAppSelector(selectAppConfig);
    const otpChars = appSystemConfig?.uiConfig.otpKeypadCharacters || 'IJKS';
    const touristBusPdfUrl = appSystemConfig?.constants.touristBusPdfLink;

    useAnimatedReaction(
        () => sheetAnimatedIndex.value,
        (newValue, oldValue) => {
            if (oldValue !== null && Math.round(newValue) !== Math.round(oldValue)) {
                if (Math.round(newValue) >= 1) {
                    runOnJS(setScreenState)('otp');
                } else {
                    runOnJS(setScreenState)('camera');
                }
            }
        },
    );
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();

    const triggerWiggleAnimation = () => {
        wiggleOffset.value = withSequence(
            withTiming(-5, { duration: 30 }),
            withTiming(5, { duration: 60 }),
            withTiming(-5, { duration: 60 }),
            withTiming(5, { duration: 60 }),
            withTiming(0, { duration: 30 }),
        );
    };

    const startTypingAnimation = (targetOtp: string, callHandleOtp: boolean = false) => {
        if (!targetOtp || targetOtp.length === 0) return;

        setIsTypingAnimation(true);
        setOtp(''); // Clear current OTP
        currentIndexRef.current = 0; // Reset index

        // Type each character with delay
        const typeNextCharacter = () => {
            if (currentIndexRef.current < targetOtp.length) {
                setOtp(targetOtp.slice(0, currentIndexRef.current + 1));
                currentIndexRef.current++;
                typingTimeoutRef.current = setTimeout(typeNextCharacter, 300); // 300ms delay between characters
            } else {
                setIsTypingAnimation(false);
            }
        };

        // Start typing after a short delay
        typingTimeoutRef.current = setTimeout(typeNextCharacter, 800);

        if (callHandleOtp) {
            setTimeout(
                () => {
                    handleActivateTicket(targetOtp);
                },
                800 + targetOtp.length * 300 + 200,
            );
        }
    };

    const wiggleStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: wiggleOffset.value }],
    }));

    // Memoized callbacks for keyboard interactions
    const handleNumberPress = useCallback(
        (current: string) => {
            if (!isTypingAnimation) {
                setOtp(prev => {
                    if (prev.length === 0) {
                        const letterRegex = new RegExp(`^[${otpChars}]$`);
                        if (!letterRegex.test(current)) {
                            return prev;
                        }
                    } else if (prev.length < 5) {
                        if (!/^[0-9]$/.test(current)) {
                            return prev;
                        }
                    } else {
                        return prev;
                    }

                    return prev + current;
                });
            }
        },
        [isTypingAnimation, otpChars],
    );

    const handleBackspacePress = useCallback(() => {
        if (!isTypingAnimation) {
            setOtp(prev => prev.slice(0, -1));
        }
    }, [isTypingAnimation]);

    // Stable onChange handler for OTPComponent to prevent re-renders
    const handleOtpChange = useCallback(
        (newOtp: string) => {
            if (!isTypingAnimation) {
                setOtp(newOtp);
            }
        },
        [isTypingAnimation],
    );

    const handleKeyboardLayout = useCallback((event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setOtpKeyboardHeight(height);
    }, []);

    useEffect(() => {
        // Only animate button when OTP reaches 5 characters
        // Use spring for immediate, interruptible feedback
        const springConfig = { damping: 20, stiffness: 400, mass: 0.5 };
        buttonValue.value = withSpring(otp.length === 5 ? 1 : 0, springConfig);

        if (otp.length === 5) {
            if (isError) {
                triggerWiggleAnimation();
            }
            // Only call onOtpComplete when OTP is fully entered
            onOtpComplete(otp);
        } else {
            setIsSuccess && setIsSuccess(false);
            setIsWrongOtp && setIsWrongOtp(false);
        }
    }, [otp.length, isError]);

    // Handle auto-fill OTP prop changes with typing animation
    useEffect(() => {
        if (autoFillOtp && autoFillOtp !== otp && !isTypingAnimation) {
            startTypingAnimation(autoFillOtp);
        }
    }, [autoFillOtp]);

    useEffect(() => {
        if (autoFillOtpFromDeepLink && autoFillOtpFromDeepLink !== otp && !isTypingAnimation) {
            startTypingAnimation(autoFillOtpFromDeepLink, true);
        }
    }, [autoFillOtpFromDeepLink]);

    // Set accessibility focus to OTP input when screen loads
    useEffect(() => {
        const focusTimer = setTimeout(() => {
            if (otpComponentRef.current) {
                otpComponentRef.current.focusInput();
            }
        }, 500); // Small delay to ensure UI is fully rendered

        return () => clearTimeout(focusTimer);
    }, []);

    useEffect(() => {
        if (Platform.OS === 'ios' && !isCameraDefault) {
            setTimeout(() => {
                setShouldRenderCamera(true);
            }, 500);
        }
    }, [isCameraDefault]);

    // Dismiss bottomsheet when screen loses focus (user navigates to another screen)
    useEffect(() => {
        if (!isFocused) {
            busOtpSearchBottomSheetRef.current?.dismiss();
        }
    }, [isFocused]);

    // Cleanup: Dismiss bottomsheet when component unmounts
    useEffect(() => {
        return () => {
            busOtpSearchBottomSheetRef.current?.dismiss();
        };
    }, []);

    const backgroundAnimatedStyle = useAnimatedStyle(() => {
        // Direct color assignment instead of interpolation for instant updates
        const bgColor = isError ? '#FFE9E9' : isSuccess ? '#F5FFDB' : '#FFFFFF';
        return {
            backgroundColor: bgColor,
        };
    }, [isError, isSuccess]);

    const buttonAnimatedStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(buttonValue.value, [1, 0], ['#047AEA', '#CCCCCC']),
        };
    }, []);

    useEffect(() => {
        // Start typing animation after modal opens if autoFillOtp is provided
        // if (autoFillOtp) {
        //     startTypingAnimation(autoFillOtp);
        // }

        // Cleanup timeout on unmount
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    const handleActivateTicket = async (inputOtp: string) => {
        if (type === 'Book' || type === 'Pass') {
            mpDispatch({ type: 'PROCEED', payload: { otp: inputOtp } });
        } else {
            try {
                // Make API call to set onboarded vehicle details
                const res = await setOnboardedVehicleDetails({
                    journeyId,
                    legOrder,
                    subLegOrder,
                    body: {
                        vehicleNumber: inputOtp,
                    },
                }).unwrap();

                setIsSuccess && setIsSuccess(true);
                // On success, show video and ticket
                setTimeout(() => {
                    const targetLeg = res.legs.find(leg => leg.order === legOrder);
                    const fleetNumber =
                        targetLeg?.legExtraInfo?.TAG === 'Bus' ? (targetLeg?.legExtraInfo?._0?.fleetNo ?? otp) : otp;
                    setIsVideoVisible(true);
                    dispatch(
                        setBusFleetNumber({
                            id: createJourneyId(journeyId),
                            payload: { legOrder, fleetNumber: fleetNumber },
                        }),
                    );
                    dispatch(setRefetchJourneys(true));
                    setOtp('');
                }, 0);
            } catch (error) {
                console.error('Failed to activate ticket:', error);
                //eslint-disable-next-line
                const errorPayload: any = error;
                dispatch(
                    setToastProps({
                        message: errorPayload.data.errorMessage,
                        backgroundColor: `${themeColors.Fill_negativeHigh}`,
                        autoDismissAfter: 5000,
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
                setIsWrongOtp && setIsWrongOtp(true);
            }
        }
    };

    const handleVideoEnd = () => {
        setIsVideoVisible(false);
        navigation.navigate('mainTabNavigation', { screen: 'ticketsTab_homeScreen' }, { pop: true });
    };
    // Stable callback that captures the latest OTP via ref
    const otpRef = useRef('');
    useEffect(() => {
        otpRef.current = otp;
    }, [otp]);

    const handleActivatePress = useCallback(() => {
        handleActivateTicket(otpRef.current);
    }, []);

    const handleToggleScreenState = () => {
        if (screenState === 'otp') {
            setScreenState('camera');
            busOtpModalRef.current?.snapToIndex(0);
        } else if (screenState === 'camera') {
            setScreenState('otp');
            busOtpModalRef.current?.snapToIndex(1);
        }
        onScanQrPress();
    };
    const onPressSingleModeBusSearch = () => {
        logEvent(EventName.NY_BUS_SEARCH);
        navigation.navigate('ServicesTab', {
            screen: 'singleModeBookingNavigator',
            params: {
                screen: 'singleModeSearch',
                params: { bookingType: 'Bus', sourceStop: undefined, fallbackView: false, otp: undefined },
            },
        });
    };
    const customerTags = getArrayItem(MMKVKey.CUSTOMER_NAMMA_TAGS);

    const busSuggestionsOpacity = useMemo(() => {
        return otp.length === 0 || otp === undefined ? 0.5 : 0.5 + (otp.length / 5) * 0.9;
    }, [otp]);

    return (
        <HardwareBackpressHandler>
            <Animated.View style={tailwind.style('flex-1')}>
                <Animated.View style={tailwind.style('px-4', `top-[${top}px] z-35`)}>
                    {type !== 'Pass' && displaySearchBar ? (
                        <Animated.View style={tailwind.style('w-full')}>
                            {/* <SingleModeBusSearchBar onPressSingleModeBusSearch={onPressSingleModeBusSearch} /> */}
                            <Pressable
                                onPress={onPressSingleModeBusSearch}
                                testID="singleModeBusSearchBarButton"
                                accessibilityRole="button"
                                accessibilityLabel="Single mode bus search bar button"
                                {...searchBarHandlers}>
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            'flex-row items-center gap-[10px]',
                                            'h-[50px] bg-white border border-[#EFEFEF] rounded-[16px] flex-row items-center px-[17px]',
                                        ),
                                        searchBarAnimatedStyle,
                                    ]}>
                                    <Icon icon={<MagnifyingGlass fill="#969696" />} color="#969696" size={18} />
                                    <Animated.Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[15px] leading-[18px] text-[#969696]',
                                        )}>
                                        Search Bus No. or Destination
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>
                    ) : (
                        <></>
                    )}
                </Animated.View>
                {!isScanOtp && (
                    <>
                        {shouldRenderCamera ? (
                            <CameraView
                                sheetAnimatedIndex={sheetAnimatedIndex}
                                setOtp={setOtp}
                                onCompleteOtp={handleActivateTicket}
                                beforeOtpComplete={() => {
                                    setIsSuccess && setIsSuccess(false);
                                    setIsWrongOtp && setIsWrongOtp(false);
                                }}
                                scanOtpRef={scanOtpRef}
                            />
                        ) : (
                            <View style={tailwind.style('absolute inset-0 bg-black')}>
                                <QRScannerFrame translateY={top + 100} />
                            </View>
                        )}
                        <Animated.View
                            layout={LinearTransition.springify().damping(28).stiffness(340)}
                            style={[
                                tailwind.style(
                                    'absolute  w-full flex-row items-center justify-center z-30',
                                    Platform.OS === 'android' ? 'bottom-7' : 'bottom-[-8px]',
                                ),
                                floatingHeaderStyle,
                            ]}>
                            <Pressable
                                testID="go-back-button"
                                onPress={() => navigation.goBack()}
                                accessibilityLabel="Go back to previous screen button"
                                style={tailwind.style('absolute left-3')}
                                accessibilityRole="button">
                                <Animated.View
                                    style={tailwind.style(
                                        'w-[46px] h-[46px] flex-row  items-center justify-center rounded-full bg-white',
                                    )}>
                                    <Icon icon={<LeftArrow fill="#313131" />} size={24} color="#313131" />
                                </Animated.View>
                            </Pressable>
                            <Pressable
                                accessible={false}
                                testID="scan-qr-button"
                                onPress={handleToggleScreenState}
                                accessibilityLabel={screenState === 'otp' ? 'Scan QR button' : 'Enter OTP button'}
                                accessibilityRole="button">
                                <Animated.View
                                    layout={LinearTransition.springify().damping(28).stiffness(340)}
                                    style={tailwind.style(
                                        'flex-row items-center gap-[8px] h-[44px] rounded-[20px] bg-white px-[23px]',
                                    )}>
                                    {screenState === 'otp' ? (
                                        <Icon icon={<QrIcon fill="#016ACD" />} size={24} />
                                    ) : (
                                        <Icon icon={<OtpIcon fill="#016ACD" />} size={24} color="#016ACD" />
                                    )}
                                    <Animated.Text
                                        accessible={false}
                                        style={tailwind.style(
                                            'text-[#016ACD] font-areaNormal-extrabold text-[15px] leading-[18px]',
                                        )}>
                                        {screenState === 'otp'
                                            ? userLanguageStrings.ScanQR
                                            : userLanguageStrings.EnterOTP}
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>
                    </>
                )}
                {/* {isFocus ? ( */}
                <BottomSheet
                    ref={busOtpModalRef}
                    enableOverDrag={false}
                    handleComponent={null}
                    backdropComponent={undefined}
                    onClose={() => {}}
                    index={featureFlags.toggleQRtoOtpFlow ? 0 : 1}
                    enablePanDownToClose={false}
                    enableContentPanningGesture={true}
                    enableHandlePanningGesture={false}
                    enableDynamicSizing={false}
                    snapPoints={snapPoints}
                    keyboardBlurBehavior="restore"
                    keyboardBehavior="interactive"
                    android_keyboardInputMode="adjustResize"
                    animatedPosition={sheetAnimatedPosition}
                    animatedIndex={sheetAnimatedIndex}
                    style={tailwind.style(
                        `bg-[#F2F2F2] ${!appSystemConfig.uiConfig?.showOtpCardAndSaintImage ? 'mt-14' : ''} rounded-t-[36px]`,
                    )}>
                    <Animated.View
                        layout={LinearTransition.springify().damping(28).stiffness(340)}
                        style={[tailwind.style('rounded-t-[28px]'), backgroundAnimatedStyle]}>
                        {/* Common BusOtpCard and SaintImg for both cases */}
                        {appSystemConfig?.uiConfig.showOtpCardAndSaintImage && (
                            <Animated.View
                                layout={LinearTransition.springify().damping(28).stiffness(340)}
                                style={tailwind.style(
                                    'pt-[33px] px-[30px] flex-row items-center justify-between w-full',
                                )}>
                                {/* BusOtpCard */}
                                <Animated.Image
                                    accessible={true}
                                    accessibilityLabel="bus otp card image"
                                    layout={LinearTransition.springify().damping(28).stiffness(340)}
                                    source={BusOtpCard}
                                    style={tailwind.style('w-[84px] h-[50px]')}
                                />

                                {/* SaintImg with placeholder */}
                                <Animated.View
                                    layout={LinearTransition.springify().damping(28).stiffness(340)}
                                    style={tailwind.style(
                                        'h-[51px] rounded-[12px] border border-[#969696] pl-[11px] flex-row items-center gap-2 z-[100] w-[70%]',
                                    )}>
                                    <Animated.Image
                                        accessible={false}
                                        source={SaintImg}
                                        style={tailwind.style('w-[26px] h-[30px]')}
                                    />
                                    <Animated.View style={tailwind.style('flex-1 pr-2')}>
                                        <Thirukural width={'100%'} />
                                    </Animated.View>
                                </Animated.View>
                            </Animated.View>
                        )}

                        <Animated.View
                            style={tailwind.style('')}
                            layout={LinearTransition.springify().damping(28).stiffness(340)}>
                            <Pressable
                                onPress={() => busOtpModalRef.current?.snapToIndex(1)}
                                accessibilityRole="button"
                                accessibilityLabel="OTP Input Button"
                                testID="otp-input-button">
                                <Animated.View style={[tailwind.style('mx-auto'), wiggleStyle]}>
                                    <OTPComponent
                                        ref={otpComponentRef}
                                        value={otp}
                                        onChange={handleOtpChange}
                                        error={isError}
                                        isSuccess={isSuccess}
                                    />
                                </Animated.View>
                            </Pressable>

                            <ActivateButton
                                type={type}
                                isDisabled={isActivateButtonDisabled || isLoading || isApiLoading}
                                isLoading={isLoading || isApiLoading}
                                buttonAnimatedStyle={buttonAnimatedStyle}
                                animatedStyle={animatedStyle}
                                isOtpComplete={otp.length === 5}
                                onActivate={handleActivatePress}
                                userLanguageStrings={userLanguageStrings}
                            />
                            <Animated.View onLayout={handleKeyboardLayout} layout={LinearTransition}>
                                {customerTags?.includes('FieldTest') || __DEV__ || showNearbyBusInOtpFlow ? (
                                    <Animated.View
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        style={[tailwind.style('bg-white mt-[10px] pt-[0px] h-[44px]')]}>
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            nestedScrollEnabled={true}
                                            scrollEnabled={true}
                                            contentContainerStyle={[
                                                tailwind.style('flex-row gap-[8px] px-[16px]'),
                                                { opacity: busSuggestionsOpacity },
                                            ]}
                                            style={tailwind.style('flex-1')}>
                                            {filteredSuggestedBusData.map(bus => (
                                                <Animated.View
                                                    entering={FadeIn}
                                                    exiting={FadeOut}
                                                    layout={LinearTransition}
                                                    key={bus.busNumber}>
                                                    <Pressable
                                                        key={bus.busNumber}
                                                        onPress={() => setOtp(bus.busNumber)}
                                                        accessibilityRole="button"
                                                        accessibilityLabel={`Select bus ${bus.busNumber}`}
                                                        testID={`bus-button-${bus.busNumber}`}>
                                                        <Animated.View
                                                            style={tailwind.style(
                                                                'px-[16px] py-[8px] rounded-[12px] border border-[#E0E0E0] bg-white',
                                                            )}>
                                                            <Animated.Text
                                                                style={tailwind.style(
                                                                    'text-[#313131] font-areaNormal-extrabold text-[14px] leading-[16px]',
                                                                )}>
                                                                {bus.busNumber}
                                                            </Animated.Text>
                                                        </Animated.View>
                                                    </Pressable>
                                                </Animated.View>
                                            ))}
                                        </ScrollView>
                                    </Animated.View>
                                ) : null}

                                <Animated.View layout={LinearTransition} style={tailwind.style('mb-[10px]')}>
                                    <OtpKeyboard
                                        showFirstRow={showKeyboardFirstRow}
                                        onNumberPress={handleNumberPress}
                                        onBackspacePress={handleBackspacePress}
                                        otpChars={otpChars}
                                        otp={otp}
                                    />
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    </Animated.View>
                </BottomSheet>
                {/* ) : null} */}

                {/* Full-screen video modal */}
                <Modal
                    visible={isVideoVisible}
                    transparent={true}
                    animationType="slide"
                    statusBarTranslucent={true}
                    style={tailwind.style('z-0')}>
                    <VideoPlayer
                        style={tailwind.style('w-full h-full p-0 m-0')}
                        source={{
                            uri: 'https://raw.githubusercontent.com/witcher-shailesh/github-asset-store/main/uploads/vids/vid-polam-right1-1758005983370.mp4',
                        }}
                        resizeMode="contain"
                        shouldLoop={false}
                        containerStyle={undefined}
                        fallbackElement={
                            <Image
                                source={Fallback}
                                style={tailwind.style('w-full h-full')}
                                accessible={true}
                                accessibilityLabel="video fallback image"
                            />
                        }
                        bufferingElement={
                            <Image
                                source={Fallback}
                                style={tailwind.style('w-full h-full')}
                                accessible={true}
                                accessibilityLabel="video buffering image"
                            />
                        }
                        onVideoEnd={handleVideoEnd}
                        autoPlay={undefined}
                        bufferConfig={undefined}
                        videoRef={undefined}
                        pauseVideo={undefined}
                        videoControls={undefined}
                        onStateChange={undefined}
                        onError={undefined}
                        onBuffer={undefined}
                        muted={undefined}
                        bufferingDelay={undefined}
                        enableNetworkOptimizations={undefined}
                        networkOptimizationConfig={undefined}
                        bufferingElementStyle={undefined}
                        enablePauseOnGesture={undefined}
                        showMuteControl={undefined}
                        muteControlStyle={undefined}
                        onGesturePress={undefined}
                        handleMuteToggle={undefined}
                        disableFocus={true}
                        ignoreSilentSwitch={'obey'}
                        preventsDisplaySleepDuringVideoPlayback={false}
                    />
                </Modal>

                {/* Show BusOtpFailedSearch bottomsheet when wrong OTP is entered - only when screen is focused */}

                {/* Show Tourist Bus Bottomsheet when isTouristBus flag is true */}
                {isTouristBus && activePass && (
                    <TouristBusBottomsheet
                        ref={touristBusPassBottomSheetRef}
                        busName={undefined}
                        ticketName={activePass.name}
                        ticketPrice={activePass.amount}
                        ticketValidity={activePass?.maxDays ? `${activePass.maxDays} Days` : undefined}
                        ticketDescription={activePass.description}
                        pdfUrl={touristBusPdfUrl}
                        onClose={handleCloseTouristBusBottomSheet}
                        onBuyTicket={onBuyTouristBusTicket}
                        onSearchDestination={onSearchTouristBusDestination}
                        isLoading={isProcessingPayment}
                    />
                )}
                {type === 'Book' &&
                    isError &&
                    isFocused &&
                    recentSearches !== undefined &&
                    suggestions !== undefined &&
                    searchPublicTransport !== undefined &&
                    onRecentSearchPress !== undefined && (
                        <BusOtpFailedSearch
                            recentsList={recentSearches}
                            onRecentSearchPress={item => onRecentSearchPress(item, otp)}
                            suggestions={suggestions}
                            loadingSuggestions={loadingSuggestions ?? false}
                            searchPublicTransport={searchPublicTransport}
                        />
                    )}
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

export default BusOtpScreen;
