import { Pressable } from '@/src-v2/primitives/Pressable';
import { useRefsContext } from '@/typescript/context/RefsContext';
// import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useShowUTSTicket } from '@/src-v2/hooks/useShowUTSTicket';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useAppSelector } from '@/typescript/state/hooks';
import BottomSheet, {
    BottomSheetModal,
    BottomSheetScrollView,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Text, View, ImageSourcePropType } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { ClipPath, Defs, Path, Rect, Mask } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import { getShowTicketRequest } from '../../../utils/SubwayUtils';
import CrossIcon from '../../Search/components/svg/CloseIcon';
import AnimatedTimer from '../Components/AnimatedTimer';
import CustomBackground from './components/CustomBackground';
import { MaskedAnimatingIcon } from './components/MaskedAnimatingIcon';
import { TicketHeader } from './components/TicketHeader';
import { TicketSplit } from './components/TicketSplit';
import { TransitInfoCard } from './components/TransitInfoCard/TransitInfoCard';
import { NewTicketUIProps, TransitInfoCardProps } from './types';
import { QRCodeCarousel } from './components/QRCodeCarousel';
import { CancelTicketConfirmationModal } from './components/CancelTicketConfirmationModal';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useMetroTicketCancellation } from '@/src-v2/multimodal/hooks/useMetroTicketCancellation';
import blur_qr from '@/typescript/assets/blur_qr2.png';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
// import bluredQRTicketWithTimer from '@/typescript/assets/bluredQRTicketWithTimer.png';
import bluredQRTicketBookingfailed from '@/typescript/assets/bluredQRTicketBookingfailed.webp';
import blurQRWithTicketValidatedText from '@/typescript/assets/blurQRWithTicketValidatedText.webp';
import SuburbanInfoCard from './components/SuburbanInfoCard';
import AnimatedInfo from './components/AnimatedInfo';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useAccessibilityFocus } from '@/src-v2/hooks/useAccessibilityFocus';
import { isBookingStatusCompleted } from '@/typescript/utils/LegStatusUtils';
import TicketIcon from '@/src-v2/assets/svg/TIcketIcon';
// import { DoubleArrowsWhite } from '@/src-v2/assets/svg/DopubleArrowWhite';
import { BusOtpTicketModalType2 } from '../../BusOtpFlow/BusOtpTicket/BusOtpTicketType2';
import { BusOtpTicketModalType1 } from '../../BusOtpFlow/BusOtpTicket/BusOtpTicketType1';
import { createTicketDataFromLegInfo } from '../../BusOtpFlow/utils';
import ScreenGuard from 'react-native-screenguard';
import { Platform } from 'react-native';
import Config from 'react-native-config';

interface NotchedHandleProps {
    onClose: (() => void) | undefined;
}
const NotchedHandle = ({ onClose }: NotchedHandleProps) => {
    // Calculate center point for the notch using screen width minus margins
    const horizontalMargin = 16;
    const componentWidth = SCREEN_WIDTH - horizontalMargin * 2;
    const centerX = componentWidth / 2;
    // Set dimensions
    const notchWidth = 68;
    const notchHeight = 20;
    const handleHeight = onClose ? 43 : 32;
    const cornerRadius = 34; // Matches the tailwind rounded-t-[34px]

    return (
        <View
            style={[
                tailwind.style('w-full z-10'),
                {
                    marginHorizontal: horizontalMargin,
                    height: handleHeight,
                },
            ]}>
            {onClose ? (
                <Pressable
                    accessibilityRole="button"
                    onPress={onClose}
                    testID="close-button"
                    accessibilityLabel="Close"
                    style={tailwind.style(
                        'h-9 w-9 absolute top-1.5 left-5 bg-[#E5E5E5] justify-center items-center rounded-full z-11',
                    )}>
                    <Icon icon={<CrossIcon />} size={16} color="#525461" />
                </Pressable>
            ) : null}
            <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <Defs>
                    <ClipPath id="notchPath">
                        <Path
                            d={`
                            M0,${cornerRadius}
                            A${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},0
                            H${centerX - notchWidth / 2}
                            C${centerX - notchWidth / 3},0 ${centerX - notchWidth / 6},${notchHeight} ${centerX},${notchHeight}
                            C${centerX + notchWidth / 6},${notchHeight} ${centerX + notchWidth / 3},0 ${centerX + notchWidth / 2},0
                            H${componentWidth - cornerRadius}
                            A${cornerRadius},${cornerRadius} 0 0 1 ${componentWidth},${cornerRadius}
                            V${handleHeight}
                            H0
                            Z
                            `}
                        />
                    </ClipPath>
                </Defs>
                <Rect x="0" y="0" width="100%" height={handleHeight} fill="#FBFBFB" clipPath="url(#notchPath)" />
            </Svg>
        </View>
    );
};

const ReverseNotchedHandle = () => {
    // Calculate center point for the notch using screen width minus margins
    const horizontalMargin = 16;
    const componentWidth = SCREEN_WIDTH - horizontalMargin * 2;
    const centerX = componentWidth / 2;
    // Set dimensions
    const notchWidth = 68;
    const notchHeight = 20;
    const handleHeight = 56;
    const cornerRadius = 34; // Matches the tailwind rounded-b-[34px]

    return (
        <View
            style={[
                tailwind.style('w-full overflow-hidden z-0 bottom-0'),
                {
                    marginHorizontal: horizontalMargin,
                    height: handleHeight,
                    width: componentWidth,
                },
            ]}>
            <Svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <Defs>
                    <ClipPath id="reverseNotchPath">
                        <Path
                            d={`
                            M0,0
                            H${componentWidth}
                            V${handleHeight - cornerRadius}
                            A${cornerRadius},${cornerRadius} 0 0 1 ${componentWidth - cornerRadius},${handleHeight}
                            H${centerX + notchWidth / 2}
                            C${centerX + notchWidth / 3},${handleHeight} ${centerX + notchWidth / 6},${handleHeight - notchHeight} ${centerX},${handleHeight - notchHeight}
                            C${centerX - notchWidth / 6},${handleHeight - notchHeight} ${centerX - notchWidth / 3},${handleHeight} ${centerX - notchWidth / 2},${handleHeight}
                            H${cornerRadius}
                            A${cornerRadius},${cornerRadius} 0 0 1 0,${handleHeight - cornerRadius}
                            Z
                            `}
                        />
                    </ClipPath>
                </Defs>
                <Rect x="0" y="0" width="100%" height={handleHeight} fill="#FBFBFB" clipPath="url(#reverseNotchPath)" />
            </Svg>
        </View>
    );
};

const InfoIcon = () => (
    <Svg width={12} height={12} viewBox="0 0 12 12" fill="none">
        <Mask id="mask0" maskUnits="userSpaceOnUse" x={0.25} y={0.25} width={12} height={12}>
            <Rect fill="white" x={0.25} y={0.25} width={12} height={12} />
            <Path d="M6 11.25C3.10725 11.25 0.75 8.89275 0.75 6C0.75 3.10725 3.10725 0.75 6 0.75C8.89275 0.75 11.25 3.10725 11.25 6C11.25 8.89275 8.89275 11.25 6 11.25ZM6 10.2002C8.31525 10.2002 10.2002 8.31525 10.2002 6C10.2002 3.68475 8.31525 1.7998 6 1.7998C3.68475 1.7998 1.7998 3.68475 1.7998 6C1.7998 8.31525 3.68475 10.2002 6 10.2002ZM5.47363 3.00684H6.52344V7.10156H5.47363V3.00684ZM5.47363 8.99219V7.94238L6.52344 7.94238V8.99219H5.47363Z" />
        </Mask>
        <Path
            d="M6 11.25C3.10725 11.25 0.75 8.89275 0.75 6C0.75 3.10725 3.10725 0.75 6 0.75C8.89275 0.75 11.25 3.10725 11.25 6C11.25 8.89275 8.89275 11.25 6 11.25ZM6 10.2002C8.31525 10.2002 10.2002 8.31525 10.2002 6C10.2002 3.68475 8.31525 1.7998 6 1.7998C3.68475 1.7998 1.7998 3.68475 1.7998 6C1.7998 8.31525 3.68475 10.2002 6 10.2002ZM5.47363 3.00684H6.52344V7.10156H5.47363V3.00684ZM5.47363 8.99219V7.94238L6.52344 7.94238V8.99219H5.47363Z"
            fill="#3B3A3C"
        />
    </Svg>
);

interface BlurredQRTicketProps {
    source: ImageSourcePropType;
}

export const BlurredQRTicket = ({ source }: BlurredQRTicketProps) => (
    <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        layout={LinearTransition.springify()}
        style={tailwind.style('bg-[#FBFBFB] w-[290px] h-[290px] rounded-[32px] mx-auto overflow-hidden')}>
        <Animated.Image
            accessible={true}
            accessibilityLabel="blur qr"
            source={source}
            style={tailwind.style('w-full h-full')}
        />
    </Animated.View>
);

// interface BusActivationUIProps {
//     onActivate: () => void;
//     animatedStyle: {
//         transform: {
//             scale: number;
//         }[];
//     };
//     handlers: { onPressIn: () => void; onPressOut: () => void };
// }

// const BusActivationUI = ({ onActivate, animatedStyle, handlers }: BusActivationUIProps) => (
//     <Animated.View
//         entering={FadeIn}
//         exiting={FadeOut}
//         layout={LinearTransition.springify()}
//         style={tailwind.style('relative items-center')}>
//         {/* Blurred QR Code Background */}
//         <BlurredQRTicket source={blur_qr} />

//         {/* Overlay Content */}
//         <Animated.View style={tailwind.style('absolute inset-0 justify-center items-center px-6')}>
//             {/* Activation Text */}
//             <Animated.View style={tailwind.style('w-full max-w-[200px] mb-4')}>
//                 <Animated.Text
//                     style={tailwind.style(
//                         'text-[16px] font-areaNormal-extrabold text-[#3B3A3C] text-center leading-[22px] tracking-[0.2px]',
//                     )}>
//                     Activate after getting into the bus
//                 </Animated.Text>
//             </Animated.View>

//             {/* Activation Button */}
//             <Animated.View style={tailwind.style('w-full max-w-[200px]')}>
//                 <Pressable
//                     accessibilityRole="button"
//                     onPress={onActivate}
//                     testID="activate-ticket-button"
//                     {...handlers}
//                     style={tailwind.style('w-full')}>
//                     <Animated.View
//                         style={[
//                             tailwind.style('bg-[#047AEA] h-[58px] justify-center items-center rounded-[16px]'),
//                             animatedStyle,
//                         ]}>
//                         <Animated.View style={tailwind.style('flex-row items-center gap-2')}>
//                             <Animated.Text
//                                 style={tailwind.style(
//                                     'text-[15px] font-areaNormal-extrabold text-white leading-[19px]',
//                                 )}>
//                                 Activate Ticket
//                             </Animated.Text>
//                             <Icon
//                                 color="white"
//                                 style={tailwind.style('ml-0 mb-[2px]')}
//                                 icon={<DoubleArrowsWhite fill={'white'} />}
//                                 size={12}
//                             />
//                         </Animated.View>
//                     </Animated.View>
//                 </Pressable>
//             </Animated.View>
//         </Animated.View>
//     </Animated.View>
// );

export const NewTicketUI = ({
    ticketHeaderProps,
    transitInfoCardProps,
    categories,
    onClose = () => {},
    // onPressCheckIn = () => {},
    // onPressSupport = () => {},
    qrCodeViewProps,
    duration,
    journeyId,
    renderType = 'bottomSheet',
    ticketType = 'METRO',
    singleLeg,
    journeyStatus, // Add this prop
    subUrbanData,
}: NewTicketUIProps) => {
    const { top } = useSafeAreaInsets();
    const { ticketUIRef } = useRefsContext();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const animatedPosition = useSharedValue(0);

    // Accessibility focus management
    const mainContentRef = useRef<View>(null);
    const ticketContentRef = useRef<View>(null);
    const accessibilityManager = useAccessibilityFocus({
        mainContentRef,
        focusDelay: 100,
        accessibilityDelay: 50,
        maxStackSize: 50,
    });

    //flag variable based on bookingStatus
    const isFRFSTicketUsed = useMemo(() => {
        if (!singleLeg?.bookingStatus) return false;
        return isBookingStatusCompleted(singleLeg?.bookingStatus);
    }, [singleLeg?.bookingStatus]);

    const isFRFSBookingFailed = useMemo(() => {
        return transitInfoCardProps?.status === 'FAILED_PROCESSING_REFUND';
    }, [transitInfoCardProps?.status]);

    const busInfo = useMemo(() => {
        if (singleLeg?.travelMode !== 'Bus' || singleLeg?.legExtraInfo?.TAG !== 'Bus') return null;
        return singleLeg.legExtraInfo._0;
    }, [singleLeg?.travelMode, singleLeg?.legExtraInfo]);

    const appSystemConfig = useAppSelector(selectAppConfig);

    const needsBusActivation = useMemo(() => {
        if (
            singleLeg?.travelMode !== 'Bus' ||
            singleLeg?.legExtraInfo?.TAG !== 'Bus' ||
            appSystemConfig.flowConfig?.enableTicketActivationFlowPartially
        )
            return false;
        return !singleLeg.legExtraInfo._0?.fleetNo;
    }, [singleLeg?.legExtraInfo, singleLeg?.travelMode]);

    const ticketData = useMemo(() => createTicketDataFromLegInfo(singleLeg), [busInfo, singleLeg]);

    const { cancelTicketConfirmationRef } = useRefsContext();

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { metroLegInfo, setCancellationStep, metroTicketCancellationStep, handleSoftCancel } =
        useMetroTicketCancellation(journeyId || undefined);

    const handleDismiss = useCallback(() => {
        // Accessibility: Restore focus when ticket is dismissed
        accessibilityManager.popFromFocusStack();
        accessibilityManager.showAccessibility(mainContentRef);
        accessibilityManager.restoreFocus();

        if (renderType === 'bottomSheetModal') {
            ticketUIRef.current?.dismiss();
        }
        onClose();
    }, [onClose, renderType, accessibilityManager]);

    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { showTicket } = useShowUTSTicket({ journeyId });
    const [isLoadingUTSTicket, setIsLoadingUTSTicket] = useState(false);
    const isShowingTicketRef = useRef(false);
    const handleShowUTSTicket = async () => {
        if (isShowingTicketRef.current) return;
        isShowingTicketRef.current = true;
        setIsLoadingUTSTicket(true);
        const showTickeRequest = getShowTicketRequest(singleLeg);
        await showTicket(showTickeRequest);
        setIsLoadingUTSTicket(false);
        isShowingTicketRef.current = false;
    };

    const isTicketCancellationIsInProgress = useMemo(() => {
        return metroTicketCancellationStep === 'cancelling';
    }, [metroTicketCancellationStep]);

    const isTicketCancelled = useMemo(() => {
        if (journeyStatus === 'CANCELLED') return true;
        return false;
    }, [metroTicketCancellationStep, journeyStatus]);

    // Handle accessibility focus when ticket is presented
    useEffect(() => {
        if (ticketContentRef.current) {
            accessibilityManager.pushToFocusStack(ticketContentRef, 'Ticket');
            accessibilityManager.setFocus(ticketContentRef);
        }
    }, []);

    const handleGoHome = () => {
        navigation.popTo('mainTabNavigation', {
            screen: 'homeTab_homeScreen',
            params: undefined,
        });
    };

    const [isTicketinFocus, setIsTicketinFocus] = useState<boolean>(false);
    const isProd = Config['SDK_ENV'] === 'production';

    useFocusEffect(
        useCallback(() => {
            if (isProd && (renderType === 'normal' || isTicketinFocus)) {
                if (Platform.OS === 'ios') {
                    if (appConfig.assets.screenShotGuardImageUri) {
                        ScreenGuard.registerWithImage({
                            source: { uri: appConfig.assets.screenShotGuardImageUri },
                            width: SCREEN_WIDTH,
                            height: SCREEN_HEIGHT,
                            alignment: 0,
                        });
                    } else ScreenGuard.register({ backgroundColor: '#000000' });
                } else {
                    ScreenGuard.registerWithoutEffect();
                }
            }
            return () => {
                ScreenGuard.unregister();
            };
        }, [renderType, isTicketinFocus]),
    );

    const handleCancelTicket = useCallback(() => {
        ticketUIRef.current?.dismiss();

        if (metroLegInfo.hasStarted) {
            setCancellationStep('journeyStarted');
        }
        if (cancelTicketConfirmationRef?.current) {
            setCancellationStep('initial');
            cancelTicketConfirmationRef.current.present();
        }
    }, [metroLegInfo, setCancellationStep, handleSoftCancel, cancelTicketConfirmationRef]);

    const { handlers, animatedStyle } = useScaleAnimation();

    const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
    const [isTicketUIModalClosed, setIsTicketUIModalClosed] = useState(false);

    // const handleActivateBusTicket = useCallback(() => {
    //     setIsTicketUIModalClosed(true);
    //     setTimeout(() => ticketUIRef.current?.dismiss(), 200);
    //     const navigationParams: BusOtpActivateFlowProps = {
    //         legInfo: singleLeg,
    //         journeyId: journeyId || '',
    //         legOrder: singleLeg?.order || 0,
    //         subLegOrder: getSubOrder(String(singleLeg?.order || 0)) ?? 0,
    //         autoFillOtp: undefined,
    //     };
    //     navigation.navigate('busOtpFlow', {
    //         state: 'Activate',
    //         params: navigationParams,
    //     });
    // }, [otpModalRef]);

    // const handleShowBusTicket = useCallback(() => {
    //     setIsTicketModalVisible(true);
    // }, []);

    const handleCloseTicketModal = useCallback(() => {
        setIsTicketModalVisible(false);
    }, []);

    const isFocus = useIsFocused();
    const transitFinalProps: TransitInfoCardProps | undefined = transitInfoCardProps
        ? transitInfoCardProps.mode === 'BUS'
            ? {
                  ...transitInfoCardProps,
                  setTicketUIModalClosed: setIsTicketUIModalClosed,
                  navigation: navigation,
              }
            : transitInfoCardProps
        : undefined;

    const commencingHours = subUrbanData?.commencingHours ?? 1;

    const commencingHoursStr = commencingHours < 10 ? `0${commencingHours}` : `${commencingHours}`;

    const renderTicketContent = () => (
        <Animated.View
            layout={LinearTransition.springify().damping(30).stiffness(200)}
            style={tailwind.style('relative bg-[#FBFBFB] mx-4')}>
            {!appSystemConfig?.uiConfig.hideMaskedAnimatingIcon && <MaskedAnimatingIcon />}
            <Animated.View style={tailwind.style('overflow-hidden')}>
                {/* Vertical METRO TICKET text */}
                {new Array(20).fill(1).map((_, index) => {
                    return (
                        <Animated.View
                            key={index}
                            style={[
                                tailwind.style(
                                    'absolute left-1 justify-center items-center z-10 w-3',
                                    `top-[${index * 100 + 56}px]`,
                                ),
                                { transform: [{ rotate: '90deg' }] },
                            ]}>
                            <Text
                                accessible={false}
                                style={[
                                    tailwind.style(
                                        'text-[8px] leading-3 w-[100px] font-departureMono-regular text-[#CACACA] tracking-[0.2px] uppercase',
                                    ),
                                    {
                                        writingDirection: 'ltr',
                                    },
                                ]}>
                                {ticketType} TICKET
                            </Text>
                        </Animated.View>
                    );
                })}
                {/* Vertical METRO TICKET text */}
                {new Array(20).fill(1).map((_, index) => {
                    return (
                        <Animated.View
                            key={index}
                            style={[
                                tailwind.style(
                                    'absolute right-1 justify-center items-center z-10 w-3',
                                    `top-[${index * 100 + 56}px]`,
                                ),
                                { transform: [{ rotate: '90deg' }] },
                            ]}>
                            <Text
                                accessible={false}
                                style={[
                                    tailwind.style(
                                        'text-[8px] leading-3 w-[100px] font-departureMono-regular text-[#CACACA] tracking-[0.2px] uppercase',
                                    ),
                                    {
                                        writingDirection: 'ltr',
                                    },
                                ]}>
                                {ticketType} TICKET
                            </Text>
                        </Animated.View>
                    );
                })}
                <TicketHeader {...ticketHeaderProps} />
                {ticketType !== 'TRAIN' && (
                    <Animated.View style={[tailwind.style(' justify-center items-center pt-5')]}>
                        {(isTicketCancelled || isTicketCancellationIsInProgress) &&
                            appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable && (
                                <>
                                    <Animated.View
                                        style={tailwind.style(
                                            `absolute bottom-20 z-20 flex-row items-center justify-center h-[38px] w-[${isTicketCancellationIsInProgress ? 172 : 143}px] rounded-md bg-white text-center text-lg text-black`,
                                        )}>
                                        <InfoIcon />
                                        <Animated.Text
                                            style={tailwind.style(
                                                'ml-1 font-areaNormal-extrabold text-[12px] text-[#3B3A3C]',
                                            )}>
                                            {isTicketCancellationIsInProgress
                                                ? 'Cancellation in Progress'
                                                : 'Ticket Cancelled'}
                                        </Animated.Text>
                                    </Animated.View>
                                </>
                            )}
                        {!isTicketCancelled && !isTicketCancellationIsInProgress ? (
                            isFRFSTicketUsed ? (
                                // <BlurredQRTicket source={bluredQRTicketWithTimer} />
                                <BlurredQRTicket source={blurQRWithTicketValidatedText} />
                            ) : isFRFSBookingFailed ? (
                                <BlurredQRTicket source={bluredQRTicketBookingfailed} />
                            ) : (
                                <>
                                    <Animated.View
                                        entering={FadeIn}
                                        exiting={FadeOut}
                                        layout={LinearTransition.springify()}
                                        style={tailwind.style(
                                            'bg-[#FBFBFB] w-[82%] h-[100px] rounded-[32px] mt-1 mx-auto overflow-hidden',
                                        )}>
                                        {(renderType === 'bottomSheetModal' || isFocus) && (
                                            <AnimatedTimer
                                                duration={duration}
                                                journeyId={journeyId}
                                                modes={undefined}
                                                busTicketNotActivated={needsBusActivation}
                                            />
                                        )}
                                    </Animated.View>

                                    {ticketType !== 'BUS' ||
                                    appConfig.screenConfig.ticketScreenConfig.busQrPosition === 'top' ? (
                                        <Animated.View style={tailwind.style('pt-7 my-3')}>
                                            {/* {needsBusActivation ? (
                                            <BusActivationUI
                                                onActivate={handleActivateBusTicket}
                                                animatedStyle={animatedStyle}
                                                handlers={handlers}
                                            />
                                        ) : ( */}
                                            <QRCodeCarousel {...qrCodeViewProps} />
                                            {/* )} */}
                                        </Animated.View>
                                    ) : null}
                                </>
                            )
                        ) : (
                            <Animated.View
                                entering={FadeIn}
                                exiting={FadeOut}
                                layout={LinearTransition.springify()}
                                style={tailwind.style(
                                    'bg-[#FBFBFB] w-[210px] h-[210px] rounded-[32px] mx-auto overflow-hidden mt-10',
                                )}>
                                <Animated.Image
                                    accessible={false}
                                    source={blur_qr}
                                    style={tailwind.style('w-full h-full')}
                                />
                            </Animated.View>
                        )}
                    </Animated.View>
                )}
                <Animated.View layout={LinearTransition.springify().damping(30).stiffness(200)}>
                    {ticketType === 'TRAIN' && subUrbanData ? (
                        <SuburbanInfoCard {...subUrbanData} />
                    ) : (
                        transitFinalProps && <TransitInfoCard {...transitFinalProps} />
                    )}
                </Animated.View>
                {!isTicketCancelled && (
                    <Animated.View layout={LinearTransition.springify().damping(30).stiffness(200)}>
                        <TicketSplit categories={categories} />
                    </Animated.View>
                )}

                {ticketType === 'BUS' && appConfig.screenConfig.ticketScreenConfig.busQrPosition === 'bottom' ? (
                    <Animated.View style={tailwind.style('justify-center items-center py-7')}>
                        <QRCodeCarousel {...qrCodeViewProps} />
                    </Animated.View>
                ) : null}
                {ticketType === 'TRAIN' && (
                    <>
                        <Animated.View
                            entering={FadeIn}
                            exiting={FadeOut}
                            layout={LinearTransition.springify()}
                            style={tailwind.style(
                                'bg-[#FBFBFB] mt-[31px] w-[82%] h-[100px] rounded-[32px] mx-auto overflow-hidden',
                            )}>
                            <AnimatedInfo
                                subInfo={userLanguageStrings.JourneyShouldCommenceWithin}
                                mainInfo={`${commencingHoursStr}:00${userLanguageStrings.Hour}`}
                            />
                        </Animated.View>
                        <Pressable
                            accessibilityRole="button"
                            testID={`show-ticket-press-suburban`}
                            onPress={handleShowUTSTicket}
                            disabled={isLoadingUTSTicket}
                            accessibilityLabel="Show Original Train Ticket button"
                            {...handlers}
                            style={tailwind.style(`pt-[20px] px-[20px]`)}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        `bg-[#047AEA] w-full h-[57px] w-full justify-center items-center flex-row rounded-[16px] gap-[8px]`,
                                    ),
                                    animatedStyle,
                                ]}>
                                {isLoadingUTSTicket ? (
                                    <LottieWithFallback
                                        fallback={undefined}
                                        style={tailwind.style('w-[40px] h-[50px] m-auto')}
                                        source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                                        autoPlay
                                        loop
                                    />
                                ) : (
                                    <Animated.Text
                                        style={tailwind.style(
                                            `text-[15px] font-areaNormal-extrabold text-[${colors.Button_for_modes_text}]`,
                                        )}>
                                        {userLanguageStrings.ShowOriginalTrainTicket}
                                    </Animated.Text>
                                )}
                            </Animated.View>
                        </Pressable>
                    </>
                )}
                {/* <Animated.View style={[tailwind.style('bg-[#FBFBFB] pt-[14px]')]}>
                    <Animated.View style={[tailwind.style('mx-6'), supportAnimatedStyle]}>
                        <Pressable onPress={onPressSupport} testID="support" {...supportHandlers}>
                            <Animated.View
                                style={[
                                    tailwind.style('bg-[#ECEDEF] min-h-[57px] rounded-2xl items-center justify-center'),
                                ]}>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[15px] font-areaNormal-extrabold text-[#3B3A3C] text-center leading-[20px] tracking-[0.2px]',
                                    )}>
                                    Support
                                </Animated.Text>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                </Animated.View> */}
                {!isTicketCancelled &&
                    !isTicketCancellationIsInProgress &&
                    appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable && (
                        <Animated.View style={[tailwind.style('bg-[#FBFBFB] pt-[24px]')]}>
                            <Animated.View style={[tailwind.style('mx-6')]}>
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Cancel Ticket button"
                                    onPress={handleCancelTicket}
                                    testID="cancel-ticket">
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                'bg-[#ECEDEF] min-h-[48px] rounded-2xl items-center justify-center',
                                            ),
                                        ]}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-[15px] font-areaNormal-extrabold text-[#5B6777] text-center leading-[20px] tracking-[0.2px]',
                                            )}>
                                            {userLanguageStrings.CancelTicket}
                                        </Animated.Text>
                                    </Animated.View>
                                </Pressable>
                            </Animated.View>
                        </Animated.View>
                    )}

                {isTicketCancelled && appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable && (
                    <Animated.View style={[tailwind.style('bg-[#FBFBFB] pt-[24px]')]}>
                        <Animated.View style={[tailwind.style('mx-6')]}>
                            <Pressable
                                accessibilityRole="button"
                                onPress={handleGoHome}
                                testID="cancel-ticket-go-home"
                                accessibilityLabel="Go To Home button">
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            'bg-[#ECEDEF] min-h-[48px] rounded-2xl items-center justify-center',
                                        ),
                                    ]}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[15px] font-areaNormal-extrabold text-[#5B6777] text-center leading-[20px] tracking-[0.2px]',
                                        )}>
                                        {userLanguageStrings.GoToHome}
                                    </Animated.Text>
                                </Animated.View>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                )}
                {singleLeg?.travelMode === 'Bus' && !needsBusActivation && (
                    <Animated.View style={tailwind.style('mt-4 mx-6')}>
                        <Pressable
                            onPress={() => setIsTicketModalVisible(true)}
                            accessibilityRole="button"
                            testID="activate-bus-ticket-button"
                            accessibilityLabel="Show Bus Ticket button"
                            style={tailwind.style(
                                'bg-[#047AEA] h-[48px] justify-center items-center rounded-[12px] flex-row gap-2',
                            )}>
                            <Icon icon={<TicketIcon fill={'white'} />} size={18} color={'white'} />
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[15px] font-areaNormal-extrabold text-white leading-[19px]',
                                )}>
                                {userLanguageStrings.ShowBusTicket}
                            </Animated.Text>
                        </Pressable>
                    </Animated.View>
                )}

                <Animated.View style={tailwind.style('pt-10 bg-[#FBFBFB]')}>
                    <Text
                        style={tailwind.style(
                            'text-center text-[12px] font-departureMono-regular text-[#7E7E7E] leading-[18px]',
                        )}>
                        {userLanguageStrings.ThankYouForUsingPublicTransport}
                    </Text>
                    {appConfig.screenConfig.ticketScreenConfig.footerRegionalText && (
                        <Text
                            style={tailwind.style(
                                'text-center text-[15px] font-departureMono-regular text-[#7E7E7E] pt-2 max-w-[200px] mx-auto leading-[18px]',
                            )}>
                            {appConfig.screenConfig.ticketScreenConfig.footerRegionalText}
                        </Text>
                    )}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
    const isTicketCancellable = useMemo(() => {
        if (journeyStatus === 'COMPLETED' || journeyStatus === 'CANCELLED') return false;
        return true;
    }, [journeyStatus]);

    const localCancelModal = (
        <CancelTicketConfirmationModal
            journeyId={journeyId || undefined}
            primaryButtonText={userLanguageStrings.CancelTicket}
            secondaryButtonText={userLanguageStrings.Close}
            isTicketCancellable={isTicketCancellable}
        />
    );

    const renderBottomSheetContent = () => (
        <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tailwind.style(`pt-[${top + 50}px]  pb-[${24}px] overflow-hidden`)}>
            <NotchedHandle onClose={handleDismiss} />
            <HardwareBackpressHandler onHardwareBackPress={handleDismiss}>
                {renderTicketContent()}
            </HardwareBackpressHandler>
            <ReverseNotchedHandle />
        </BottomSheetScrollView>
    );

    const renderContent = () => {
        switch (renderType) {
            case 'bottomSheetModal':
                return (
                    <BottomSheetModal
                        // backgroundStyle={tailwind.style('rounded-none bg-[#313131]')}
                        backdropComponent={CustomBackground}
                        detached
                        onChange={index => {
                            setIsTicketinFocus(index >= 0);
                        }}
                        ref={ticketUIRef}
                        snapPoints={['100%']}
                        topInset={0}
                        handleComponent={null}
                        bottomInset={0}
                        animatedPosition={animatedPosition}
                        enablePanDownToClose={true}
                        enableContentPanningGesture={true}
                        enableDynamicSizing={true}
                        style={isTicketUIModalClosed ? { pointerEvents: 'none' } : {}}
                        onDismiss={() => {
                            // Accessibility: Restore focus when modal is dismissed
                            accessibilityManager.popFromFocusStack();
                            accessibilityManager.showAccessibility(mainContentRef);
                            accessibilityManager.restoreFocus();
                            onClose();
                            setIsTicketinFocus(false);
                            setIsTicketUIModalClosed(false);
                        }}>
                        {renderBottomSheetContent()}
                    </BottomSheetModal>
                );
            case 'bottomSheet':
                return (
                    <BottomSheet
                        detached
                        ref={bottomSheetRef}
                        snapPoints={['100%']}
                        topInset={0}
                        handleComponent={null}
                        bottomInset={0}
                        animatedPosition={animatedPosition}
                        enablePanDownToClose={false}
                        enableContentPanningGesture={false}
                        enableDynamicSizing={true}>
                        {renderBottomSheetContent()}
                    </BottomSheet>
                );
            case 'normal':
                return (
                    <Animated.View style={tailwind.style('rounded-[34px] mb-16 mt-2')}>
                        <NotchedHandle onClose={undefined} />
                        {renderTicketContent()}
                        <ReverseNotchedHandle />
                    </Animated.View>
                );
            default:
                return null;
        }
    };

    return renderType === 'normal' ? (
        <Animated.View ref={mainContentRef} style={tailwind.style('flex-1 bg-[#313131]', 'py-4 bg-[#282729]')}>
            <View ref={ticketContentRef}>{renderContent()}</View>
            {!isTicketCancelled && appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable && localCancelModal}
            {appConfig.uiConfig?.busOtpTicketModalType === 'Type1' ? (
                <BusOtpTicketModalType1
                    isTicketVisible={isTicketModalVisible}
                    onGoBack={handleCloseTicketModal}
                    ticketData={ticketData}
                    headerText={userLanguageStrings.YourBusTicketForBusIsReady(busInfo?.routeName || '')}
                    subtitleText={userLanguageStrings.YouCanViewYourTicketDetailsBelow}
                    buttonText={userLanguageStrings.GoBack}
                />
            ) : (
                <BusOtpTicketModalType2
                    isTicketVisible={isTicketModalVisible}
                    onGoBack={handleCloseTicketModal}
                    ticketData={ticketData}
                    headerText={userLanguageStrings.YourBusTicketForBusIsReady(busInfo?.routeName || '')}
                    subtitleText={userLanguageStrings.YouCanViewYourTicketDetailsBelow}
                    buttonText={userLanguageStrings.GoBack}
                />
            )}
        </Animated.View>
    ) : (
        <>
            <View ref={ticketContentRef}>{renderContent()}</View>
            {!isTicketCancelled && appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable && localCancelModal}
            {appConfig.uiConfig?.busOtpTicketModalType === 'Type1' ? (
                <BusOtpTicketModalType1
                    isTicketVisible={isTicketModalVisible}
                    onGoBack={handleCloseTicketModal}
                    ticketData={ticketData}
                    headerText={userLanguageStrings.YourBusTicketForBusIsReady(busInfo?.routeName || '')}
                    subtitleText={userLanguageStrings.YouCanViewYourTicketDetailsBelow}
                    buttonText={userLanguageStrings.GoBack}
                />
            ) : (
                <BusOtpTicketModalType2
                    isTicketVisible={isTicketModalVisible}
                    onGoBack={handleCloseTicketModal}
                    ticketData={ticketData}
                    headerText={userLanguageStrings.YourBusTicketForBusIsReady(busInfo?.routeName || '')}
                    subtitleText={userLanguageStrings.YouCanViewYourTicketDetailsBelow}
                    buttonText={userLanguageStrings.GoBack}
                />
            )}
        </>
    );
};
