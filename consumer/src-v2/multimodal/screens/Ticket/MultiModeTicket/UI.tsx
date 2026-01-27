import { useMetroTicketCancellation } from '@/src-v2/multimodal/hooks/useMetroTicketCancellation';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import BottomSheet, {
    BottomSheetModal,
    BottomSheetScrollView,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
} from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Platform, Text, View } from 'react-native';
import Config from 'react-native-config';
import Animated, { FadeIn, FadeOut, LinearTransition, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ScreenGuard from 'react-native-screenguard';
import Svg, { ClipPath, Defs, Path, Rect } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';
import { Icon } from '../../../components/common/Icon';
import CustomBackground from '../SingleTicket/components/CustomBackground';
import { MaskedAnimatingIcon } from '../SingleTicket/components/MaskedAnimatingIcon';
import { TicketHeader } from '../SingleTicket/components/TicketHeader';
import { NewTicketUIProps } from '../SingleTicket/types';
import { QRCodeCarousel } from '../SingleTicket/components/QRCodeCarousel';
import CrossIcon from '../../Search/components/svg/CloseIcon';
import AnimatedTimer from '../Components/AnimatedTimer';
import TransitSummaryCard from './TransitSummaryCard';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { mapTransitDetailToBusTicketData } from '../TicketUtils/utils';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import TicketDetailsPopUp, { TicketDetailsPopUpProps } from '../TicketDetailsPopUp';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { isBookingStatusFailed } from '@/typescript/utils/LegStatusUtils';
import { BlurredQRTicket } from '../SingleTicket/UI';
import bluredQRTicketBookingfailed from '@/typescript/assets/bluredQRTicketBookingfailed.webp';

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
                    accessibilityLabel="Close button"
                    accessibilityRole="button"
                    onPress={onClose}
                    testID="close-button"
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

export interface TransitDetail {
    fromLocation: string;
    fromLocationSubText?: string;
    destinationLocation: string;
    transitCost: number;
    mode: 'METRO' | 'BUS' | 'SUBWAY';
    transitMetaInfoDisplayName: string;
    transitMetaInfo: string;
    busNo: string;
    busType:
        | 'ORDINARY'
        | 'AC'
        | 'NON_AC'
        | 'EXPRESS'
        | 'SPECIAL'
        | 'EXECUTIVE'
        | 'FIRST_CLASS'
        | 'SECOND_CLASS'
        | 'THIRD_CLASS';
    arrivalTime: string;
    validity: string;
    platform: string;
    onDetailsPress: () => void;
    gateNumber?: string;
    legInfo: legInfo;
    refundAmount: number | undefined;
}

export interface MultiTransitTicketUIProps extends Omit<NewTicketUIProps, 'ticketType' | 'ticketCreatedAt'> {
    ticketType?: 'METRO' | 'BUS' | 'SUBWAY';
    transitDetails: TransitDetail[];
}

export const MultiTransitTicketUI = ({
    ticketHeaderProps,
    onClose = () => {},
    qrCodeViewProps,
    duration,
    journeyId,
    renderType = 'bottomSheet',
    ticketType = 'METRO',
    journeyStatus,
    transitDetails = [],
    subUrbanData,
}: MultiTransitTicketUIProps) => {
    const { top } = useSafeAreaInsets();
    const { ticketUIRef } = useRefsContext();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const animatedPosition = useSharedValue(0);

    // Modal ref for  ticket details popup
    const { ticketDetailsPopupRef } = useRefsContext();
    const [selectedTicketData, setSelectedTicketData] = useState<TicketDetailsPopUpProps | null>(null);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const { cancelTicketConfirmationRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const {
        metroLegInfo,
        setCancellationStep,
        metroTicketCancellationStep: cancellationStep,
        handleSoftCancel,
    } = useMetroTicketCancellation(journeyId || undefined);

    const isProd = Config['SDK_ENV'] === 'production';

    const [isTicketinFocus, setIsTicketinFocus] = useState<boolean>(false);
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

    const handleDismiss = useCallback(() => {
        if (renderType === 'bottomSheetModal') {
            ticketUIRef.current?.dismiss();
        }
        onClose();
    }, [onClose, renderType]);

    const appConfig = useAppSelector(selectAppConfig);

    const [isTicketUIModalClosed, setTicketUIModalClosed] = useState(false);

    const isTicketCancelled = useMemo(() => {
        if (journeyStatus === 'CANCELLED') return true;
        return false;
    }, [cancellationStep]);

    const handleCancelTicket = useCallback(() => {
        ticketUIRef.current?.dismiss();

        if (metroLegInfo.hasStarted) {
            setCancellationStep('journeyStarted');
        } else {
            setCancellationStep('checking');
        }

        if (cancelTicketConfirmationRef?.current) {
            cancelTicketConfirmationRef.current.present();
        }
    }, [metroLegInfo, setCancellationStep, handleSoftCancel, cancelTicketConfirmationRef]);

    const handleCloseBusTicketScreen = useCallback(() => {
        ticketDetailsPopupRef.current?.dismiss();
        setSelectedTicketData(null);
    }, []);

    const handleShowBusTicketScreen = useCallback(
        (transitDetail: TransitDetail) => {
            const ticketData = mapTransitDetailToBusTicketData(
                transitDetail,
                subUrbanData,
                duration,
                journeyId,
                handleCloseBusTicketScreen,
                userLanguageStrings,
            );
            setSelectedTicketData(ticketData);
        },
        [duration, journeyId, handleCloseBusTicketScreen, subUrbanData, userLanguageStrings],
    );

    useEffect(() => {
        if (selectedTicketData) {
            ticketDetailsPopupRef.current?.present();
        } else {
            ticketDetailsPopupRef.current?.dismiss();
        }
    }, [selectedTicketData, ticketDetailsPopupRef.current]);

    const nonSubwayModes = transitDetails.reduce((acc: ('METRO' | 'BUS')[], transitDetail: TransitDetail) => {
        if (transitDetail.mode !== 'SUBWAY') return [...acc, transitDetail.mode];
        else return acc;
    }, []);

    const hasValidQRTickets = transitDetails.some((detail: TransitDetail) => {
        if (detail.mode === 'BUS' || detail.mode === 'METRO') {
            return !isBookingStatusFailed(detail.legInfo);
        }
        return false;
    });

    const isFocus = useIsFocused();

    const renderTicketContent = () => (
        <Animated.View
            layout={LinearTransition.springify().damping(30).stiffness(200)}
            style={tailwind.style('relative bg-[#FBFBFB] mx-4')}>
            <MaskedAnimatingIcon />
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
                {hasValidQRTickets ? (
                    <Animated.View style={[tailwind.style(' justify-center items-center pt-5')]}>
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
                                    modes={nonSubwayModes}
                                    busTicketNotActivated={false}
                                />
                            )}
                        </Animated.View>
                        <Animated.View style={tailwind.style('pt-7 my-3')}>
                            <QRCodeCarousel {...qrCodeViewProps} />
                        </Animated.View>
                    </Animated.View>
                ) : ticketType === 'BUS' || ticketType === 'METRO' ? (
                    <Animated.View style={tailwind.style('mt-4')}>
                        <BlurredQRTicket source={bluredQRTicketBookingfailed} />
                    </Animated.View>
                ) : null}
                <Animated.View
                    layout={LinearTransition.springify().damping(30).stiffness(200)}
                    style={tailwind.style('pt-[24px] px-[24px] gap-4')}>
                    {transitDetails?.map((detail, index) => (
                        <TransitSummaryCard
                            key={index}
                            {...detail}
                            journeyId={journeyId || ''}
                            onDetailsPress={() => handleShowBusTicketScreen(detail)}
                            setTicketUIModalClosed={setTicketUIModalClosed}
                            navigation={navigation}
                        />
                    ))}
                </Animated.View>

                {!isTicketCancelled && appConfig.flowConfig.ticketCancelFlowConfig.metroCancelEnable && (
                    <Animated.View style={[tailwind.style('bg-[#FBFBFB] pt-[24px]')]}>
                        <Animated.View style={[tailwind.style('mx-6')]}>
                            <Pressable
                                accessibilityRole="button"
                                onPress={handleCancelTicket}
                                testID="cancel-ticket"
                                accessibilityLabel="Cancel Ticket button">
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

                <Animated.View style={tailwind.style('pt-10 bg-[#FBFBFB]')}>
                    <Text
                        style={tailwind.style(
                            'text-center text-[12px] font-departureMono-regular text-[#7E7E7E] leading-[18px]',
                        )}>
                        THANK YOU FOR USING {'\n'}PUBLIC TRANSPORT
                    </Text>
                    {appConfig.screenConfig.ticketScreenConfig.footerRegionalText ? (
                        <Text
                            style={tailwind.style(
                                'text-center text-[15px] font-departureMono-regular text-[#7E7E7E] pt-2 max-w-[200px] mx-auto leading-[18px]',
                            )}>
                            {appConfig.screenConfig.ticketScreenConfig.footerRegionalText}
                        </Text>
                    ) : null}
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );

    const renderBottomSheetContent = () => (
        <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={tailwind.style(`pt-[${top + 52}px] pb-[${24}px] overflow-hidden`)}>
            <NotchedHandle onClose={handleDismiss} />
            {renderTicketContent()}
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
                            onClose();
                            setIsTicketinFocus(false);
                            setTicketUIModalClosed(false);
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

    const BusTicketScreenModal = useMemo(
        () => () => (
            <PopUpModal
                sheetRef={ticketDetailsPopupRef}
                enableDynamicSizing={false}
                onHardwareBackPress={handleCloseBusTicketScreen}
                showBackdrop={true}
                isScrollable={true}
                onDismiss={handleCloseBusTicketScreen}
                snapPoints={['90%']}
                enablePanDownToClose={true}
                enableContentPanningGesture={true}>
                <Animated.View style={tailwind.style('flex-1 ')} entering={FadeIn} exiting={FadeOut}>
                    <TicketDetailsPopUp
                        ticketData={selectedTicketData}
                        onDismissBusTicket={handleCloseBusTicketScreen}
                    />
                </Animated.View>
            </PopUpModal>
        ),
        [handleCloseBusTicketScreen, selectedTicketData],
    );

    return renderType === 'normal' ? (
        <Animated.View style={tailwind.style('flex-1 bg-[#313131]', 'py-4 bg-[#282729]')}>
            {renderContent()}
            <BusTicketScreenModal />
        </Animated.View>
    ) : (
        <>
            {renderContent()}
            <BusTicketScreenModal />
        </>
    );
};
