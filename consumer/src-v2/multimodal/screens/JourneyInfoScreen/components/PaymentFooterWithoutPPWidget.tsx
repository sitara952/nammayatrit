import { TransitType } from '@/src-v2/multimodal/components/PublicTransportCard/types';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import React, { useState, useRef } from 'react';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Animated from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useScaleAnimation } from '../../../../../src/typescript/utils/useScaleAnimation';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { selectCityConfig, setHideLoader, selectAppConfig } from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import Button from '@/src-v2/primitives/Button';
import { getVehicleImageForTransit } from '@/typescript/utils/MultiModal';
import { View, Image } from 'react-native';
import { strings } from 'config-types';
import { skipAndStartJourneyConfig } from '@/src-v2/systems/configs/types.ts';
import { SkipAndStartJourneyModal } from './SkipAndStartJourneyModal';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { OfferCard } from '@/src-v2/multimodal/components/offers/OfferCard';
import { cumulativeOfferResp } from '@/readOnly/api/types/CumulativeOfferResp.gen';
import PlusIcon from '@/typescript/assets/svg/symbols/PlusIcon';

export const UPIIcon = () => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <Path d="M10.7075 0L6.41602 15.4296L14.6838 7.71478L10.7075 0Z" fill="#249345" />
            <Path d="M7.36863 0L3.07715 15.4296L11.3449 7.71478L7.36863 0Z" fill="#F16411" />
        </Svg>
    );
};

export const ChevronRight = ({ color = '#5A5A5A' }) => {
    return (
        <Svg width="100%" height="100%" viewBox="0 0 16 16" fill="none">
            <Path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.19526 4.19526C6.45561 3.93491 6.87772 3.93491 7.13807 4.19526L10.1381 7.19526C10.3984 7.45561 10.3984 7.87772 10.1381 8.13807L7.13807 11.1381C6.87772 11.3984 6.45561 11.3984 6.19526 11.1381C5.93491 10.8777 5.93491 10.4556 6.19526 10.1953L8.72386 7.66667L6.19526 5.13807C5.93491 4.87772 5.93491 4.45561 6.19526 4.19526Z"
                fill={color}
            />
        </Svg>
    );
};
interface PaymentFooterWithoutPPWidgetProps {
    totalFare: number;
    totalPayableFare: number;
    journeyModes: TransitType[];
    offer: cumulativeOfferResp | undefined;
    handleOnPress: ({ viaOfferButton, skipPayment }: { viaOfferButton: boolean; skipPayment: boolean }) => void;
    isLoading: boolean;
    ticketSelectorModalRef: React.RefObject<BottomSheetModal | null>;
    isSwitchPopupOpen: boolean | undefined;
    setIsTicketModalOpen: (isOpen: boolean) => void | undefined;
    totalTicketCount: number;
    originalTicketValue?: number;
    discountText?: string;
}

export type JourneyBookStage = 'Book' | 'Skip';

export const PaymentFooterWithoutPPWidget = (props: PaymentFooterWithoutPPWidgetProps) => {
    const {
        offer,
        totalPayableFare,
        journeyModes,
        handleOnPress,
        ticketSelectorModalRef,
        setIsTicketModalOpen,
        totalTicketCount,
        originalTicketValue,
        discountText,
    } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();
    const colors = configManager.get('themeColors');
    const [journeyBookStage, setJourneyBookStage] = useState<JourneyBookStage | undefined>(undefined);
    const skipAndStartModalRef = useRef<BottomSheetModal>(null);
    const skipAndStartJourneyConfig: skipAndStartJourneyConfig | null = useAppSelector(state =>
        selectCityConfig(state, 'skip_and_start_journey'),
    );
    const appConfig = useAppSelector(selectAppConfig);

    const paymentFooterRef = useRef<View>(null);

    const PersonIcon = () => {
        return (
            <Svg width="12" height="13" viewBox="0 0 12 13" fill="none">
                <Path
                    d="M5.69134 6.25768C7.42043 6.25768 8.82018 4.85793 8.82018 3.12884C8.82018 1.39974 7.41014 0 5.69134 0C3.97254 0 2.5625 1.39974 2.5625 3.12884C2.5625 4.85793 3.96224 6.25768 5.69134 6.25768Z"
                    fill="#525461"
                />
                <Path
                    d="M11.3051 10.929C10.9449 9.53956 9.82304 8.44858 8.40271 8.20157C7.51758 8.04718 6.60157 7.96484 5.67527 7.96484C4.74897 7.96484 3.84325 8.04718 2.94783 8.20157C1.5275 8.44858 0.405647 9.53956 0.0454192 10.929C-0.18101 11.7833 0.467401 12.6272 1.36282 12.6272H9.98771C10.8728 12.6272 11.5213 11.7936 11.3051 10.929Z"
                    fill="#525461"
                />
            </Svg>
        );
    };

    const getSummary = () => {
        return (
            <View style={tailwind.style('flex-row items-center')}>
                <View style={tailwind.style('flex-row items-center')}>
                    <Animated.Text style={tailwind.style('text-[15px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                        {totalTicketCount.toString().padStart(2, '0')}
                    </Animated.Text>
                    <Icon style={tailwind.style('mt-[6px] ml-[6px]')} icon={<PersonIcon />} size={18} />
                </View>
            </View>
        );
    };

    const onCtaButtonPress = () => {
        handleOnPress({ skipPayment: false, viaOfferButton: false });
        ticketSelectorModalRef.current?.dismiss();
        dispatch(setHideLoader(true));
    };

    const computedOriginalTicketValue = originalTicketValue || 0;

    const showDiscountedPrice = React.useMemo(() => {
        return computedOriginalTicketValue > 0 && computedOriginalTicketValue !== totalPayableFare;
    }, [computedOriginalTicketValue, totalPayableFare]);

    const buttonText =
        totalPayableFare === 0 ? (
            <Animated.Text
                style={tailwind.style(
                    `text-[${colors.Button_Primary_Default_Text_Base}] text-[16px] font-areaNormal-bold text-center`,
                )}>
                {userLanguageStrings.StartJourney}
            </Animated.Text>
        ) : showDiscountedPrice ? (
            <Animated.Text
                style={tailwind.style(
                    `text-[${colors.Button_Primary_Default_Text_Base}] text-[16px] font-areaNormal-bold text-center`,
                )}>
                {getCtaText(
                    journeyModes.filter(mode => !['walk', 'auto'].includes(mode)).map(getVehicleImageForTransit),
                    userLanguageStrings,
                )}{' '}
                <Animated.Text style={{ textDecorationLine: 'line-through' }}>
                    ₹{computedOriginalTicketValue}
                </Animated.Text>{' '}
                ₹{totalPayableFare}
            </Animated.Text>
        ) : (
            <Animated.Text
                style={tailwind.style(
                    `text-[${colors.Button_Primary_Default_Text_Base}] text-[16px] font-areaNormal-bold text-center`,
                )}>
                {getCtaText(
                    journeyModes.filter(mode => !['walk', 'auto'].includes(mode)).map(getVehicleImageForTransit),
                    userLanguageStrings,
                )}{' '}
                ₹{totalPayableFare}
            </Animated.Text>
        );

    const getTicketSummary = () => {
        return `${totalTicketCount.toString().padStart(2, '0')} Ticket${totalTicketCount !== 1 ? 's' : ''}`;
    };

    return (
        <Animated.View style={tailwind.style(`bg-white `)}>
            <Animated.View style={tailwind.style(`py-3 px-6 flex-row justify-between items-center gap-5 `)}>
                <Animated.Text
                    style={tailwind.style(
                        'leading-[25px] font-areaNormal tracking-[0.3px] font-areaNormal-extrabold text-[15px] text-[#969696] flex-1',
                    )}>
                    {userLanguageStrings.TicketPaymentInformation}
                </Animated.Text>
                <Pressable
                    onPress={() => {
                        if (props.isLoading) return;
                        setIsTicketModalOpen?.(true);
                        ticketSelectorModalRef.current?.present();
                    }}
                    style={tailwind.style('py-1 pl-3 pr-1 justify-center items-center rounded-[20px] bg-[#F7F7F7]')}
                    testID="ticket-summary-button"
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={getTicketSummary()}>
                    <Animated.View style={tailwind.style('flex-row items-center')} ref={paymentFooterRef}>
                        <Animated.Text style={tailwind.style('text-[15px] font-areaNormal-extrabold text-[#3B3A3C]')}>
                            {getSummary()}
                        </Animated.Text>
                        <Icon style={tailwind.style('mb-1 mr-1')} icon={<PlusIcon fillColor="black" />} size={18} />
                    </Animated.View>
                </Pressable>
            </Animated.View>

            {discountText ? (
                <Animated.View style={tailwind.style('bg-[#FFFAF1] mx-4 mb-4 p-3 rounded-[8px]')}>
                    <Animated.Text style={tailwind.style('text-[13px] ml-2 font-semibold text-[#656565]')}>
                        {discountText}
                    </Animated.Text>
                </Animated.View>
            ) : null}

            {offer ? (
                <View style={tailwind.style('px-4 pb-4')}>
                    <OfferCard
                        variant="outline"
                        offer={offer}
                        onPress={() => {
                            handleOnPress({ skipPayment: false, viaOfferButton: true });
                        }}
                    />
                </View>
            ) : null}

            <Animated.View
                style={tailwind.style(
                    'px-4 pt-0 flex-row justify-between items-center gap-[18px]',
                    appConfig.appType === 'multimodal' ? 'pb-4' : '',
                )}>
                <Animated.View style={tailwind.style('flex-1')}>
                    {appConfig.appType === 'multimodal' ? (
                        <PayButton
                            transits={journeyModes
                                .filter(mode => !['walk', 'auto'].includes(mode))
                                .map(getVehicleImageForTransit)}
                            amount={totalPayableFare}
                            originalAmount={computedOriginalTicketValue}
                            handleOnPress={() => {
                                setJourneyBookStage('Book');
                                handleOnPress({ skipPayment: false, viaOfferButton: false });
                            }}
                            isLoading={
                                (journeyBookStage === undefined || journeyBookStage === 'Book') && props.isLoading
                            }
                            ticketSelectorModalRef={ticketSelectorModalRef}
                        />
                    ) : (
                        <Button
                            testID={'journey_info_confirm'}
                            onPress={() => {
                                setJourneyBookStage('Book');
                                onCtaButtonPress();
                            }}
                            type={'primary'}
                            isLoading={
                                (journeyBookStage === undefined || journeyBookStage === 'Book') && props.isLoading
                            }>
                            {buttonText}
                        </Button>
                    )}
                </Animated.View>
            </Animated.View>

            {/* Skip & Start Journey Button */}
            {appConfig.flowConfig.multimodalTrackWithoutBooking && (
                <Animated.View style={tailwind.style('px-4 py-4')}>
                    <Pressable
                        testID={'skip_and_start_journey'}
                        onPress={() => {
                            setJourneyBookStage('Skip');
                            handleOnPress({ skipPayment: true, viaOfferButton: false });
                        }}
                        style={tailwind.style('items-center py-2 flex-1')}
                        accessible={true}
                        accessibilityRole="button"
                        accessibilityLabel="Skip payment and start journey button">
                        {journeyBookStage === 'Skip' && props.isLoading ? (
                            <LottieWithFallback
                                fallback={undefined}
                                style={tailwind.style('w-[50px] h-[50px] ml-[-15px]')}
                                source={require('../../../../../src/typescript/assets/ny-service/mt_ic_loading_dots_black.lottie')}
                                autoPlay
                                loop
                            />
                        ) : (
                            <Animated.View style={tailwind.style('flex-row flex-1 ml-8')}>
                                <Animated.Text
                                    style={tailwind.style('text-[15px] font-areaNormal-bold text-[#3B3A3C] underline')}>
                                    {userLanguageStrings.SkipAndStartJourney}
                                </Animated.Text>
                                {skipAndStartJourneyConfig?.information_button_url && (
                                    <Pressable
                                        testID={'skip_and_start_info'}
                                        onPress={() => skipAndStartModalRef.current?.present()}
                                        style={tailwind.style('p-1')}
                                        accessible={true}
                                        accessibilityRole="button"
                                        accessibilityLabel="Show journey information button">
                                        <Image
                                            accessible={true}
                                            accessibilityLabel="skip and start journey info image"
                                            source={{ uri: skipAndStartJourneyConfig.information_button_url }}
                                            style={tailwind.style('w-5 h-5')}
                                            resizeMode="contain"
                                        />
                                    </Pressable>
                                )}
                            </Animated.View>
                        )}
                    </Pressable>
                </Animated.View>
            )}

            {/* Skip and Start Journey Modal */}
            <SkipAndStartJourneyModal
                skipAndStartConfig={skipAndStartJourneyConfig}
                sheetRef={skipAndStartModalRef}
                onClose={() => skipAndStartModalRef.current?.close()}
                userLanguageStrings={userLanguageStrings}
            />
        </Animated.View>
    );
};

export type transitModes = 'bus' | 'metro' | 'train' | undefined;
interface PayButtonProps {
    amount: number;
    transits: transitModes[];
    handleOnPress: () => void;
    isLoading: boolean;
    ticketSelectorModalRef: React.RefObject<BottomSheetModal | null>;
    originalAmount: number | undefined;
}

// I want to create a function to check if out of props.transits we have the given transit method or not, so function should take input as transits and the transit type that should match

export const hasTransit = (transits: TransitType[], transit: TransitType) => {
    return transits.includes(transit);
};

export const getCtaText = (transits: transitModes[], userLanguageStrings: strings): string => {
    // Get unique transit types
    const uniqueTransits = [...new Set(transits)];

    if (uniqueTransits.length === 1) {
        const transit = uniqueTransits[0];
        switch (transit) {
            case 'bus':
                return userLanguageStrings.BookBus;
            case 'metro':
                return userLanguageStrings.BookMetro;
            case 'train':
                return userLanguageStrings.BookTrain;
            default:
                return `${userLanguageStrings.BookTickets} @`;
        }
    } else if (uniqueTransits.length > 1) {
        return `${userLanguageStrings.BookTickets} @`;
    }

    return userLanguageStrings.BookTickets;
};

export const PayButton = (props: PayButtonProps) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const dispatch = useAppDispatch();
    const themeColors = configManager.get('themeColors');

    const showDiscountedPrice = React.useMemo(() => {
        return props.amount > 0 && props.originalAmount !== props.amount;
    }, [props.originalAmount, props.amount]);

    return (
        <Animated.View style={animatedStyle}>
            <Pressable
                testID={`75c6fa66-38d6-4da8-bb98-1328288002f5`}
                {...handlers}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={`₹${props.amount} button`}
                accessibilityHint="Double tap to proceed to payment gateway"
                style={tailwind.style(
                    `flex-row  h-[64px] rounded-[18px] bg-[${themeColors.Button_primary_default_fill_base}] items-center justify-center  w-full`,
                )}
                onPress={() => {
                    if (props.isLoading) {
                        return;
                    }
                    logEvent(EventName.MT_JOURNEY_INFO_PAY);
                    props.ticketSelectorModalRef.current?.dismiss();
                    dispatch(setHideLoader(true));
                    props.handleOnPress();
                }}>
                {props.isLoading && (
                    <Animated.View
                        accessible={true}
                        accessibilityLabel="Processing payment, please wait"
                        accessibilityRole="text">
                        <LottieWithFallback
                            fallback={undefined}
                            style={tailwind.style('w-[40px] h-[50px] m-auto')}
                            source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                            autoPlay
                            loop
                        />
                    </Animated.View>
                )}
                {props.isLoading ? null : (
                    <>
                        {/* Center container - absolute positioning */}
                        <Animated.View
                            style={tailwind.style('absolute left-0 right-0 h-full items-center justify-center px-4')}>
                            {props.amount === 0 ? (
                                <Animated.Text
                                    accessible={true}
                                    accessibilityLabel="Start journey"
                                    accessibilityRole="text"
                                    style={tailwind.style(
                                        `text-[16px] font-areaNormal-extrabold leading-[22px] text-[${themeColors.Button_Primary_Default_Text_Base}]`,
                                    )}>
                                    {userLanguageStrings.StartJourney}
                                </Animated.Text>
                            ) : (
                                <Animated.Text
                                    accessible={true}
                                    accessibilityLabel={`₹${props.amount}`}
                                    accessibilityRole="text"
                                    style={tailwind.style(
                                        `text-[16px] font-areaNormal-extrabold leading-[22px] text-[${themeColors.Button_Primary_Default_Text_Base}]`,
                                    )}>
                                    {getCtaText(props.transits, userLanguageStrings)}{' '}
                                    {showDiscountedPrice ? (
                                        <Animated.Text
                                            accessible={false}
                                            style={[
                                                tailwind.style(
                                                    `text-[16px] font-inter-bold leading-[22px] text-[${themeColors.Button_Primary_Default_Text_Base}]`,
                                                ),
                                                { textDecorationLine: 'line-through' },
                                            ]}>
                                            ₹{props.originalAmount}{' '}
                                        </Animated.Text>
                                    ) : null}
                                    <Animated.Text
                                        accessible={false}
                                        style={tailwind.style(
                                            `text-[16px] font-inter-bold leading-[22px] text-[${themeColors.Button_Primary_Default_Text_Base}]`,
                                        )}>
                                        ₹{props.amount}
                                    </Animated.Text>
                                </Animated.Text>
                            )}
                        </Animated.View>
                    </>
                )}
            </Pressable>
        </Animated.View>
    );
};
