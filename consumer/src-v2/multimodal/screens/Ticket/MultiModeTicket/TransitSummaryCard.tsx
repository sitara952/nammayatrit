import blurBg from '../../../../../src-v2/assets/blur_bg.webp';
import React, { useState, useCallback, useMemo } from 'react';
import { ImageBackground, Platform, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { TransitCost } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/TransitCost';
import { getColor, getIcon } from '@/src-v2/multimodal/screens/NewLiveJourney/utils/getIternaryUtils';
import Svg, { Line } from 'react-native-svg';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { TransitArrowRight } from '../../../components/svg/Arrows';
import { Icon } from '@/typescript/components/Icon';
import { Pressable } from '@/src-v2/primitives/Pressable';
import TicketIcon from '@/src-v2/assets/svg/TIcketIcon';
import { ShuffleHorizontal } from '@/src-v2/multimodal/components/svg/ShuffleHorizontal';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import mtIcAcService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ac_service.webp';
import mtIcDeluxeService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_deluxe_service.webp';
import mtIcExpressService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_express_service.webp';
import mtIcOrdinaryBusService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import busTransit from '@/src-v2/assets/3D-assets/full-asset/bus_transit.webp';
import metroTransit from '@/src-v2/assets/3D-assets/full-asset/metro_transit.webp';
import subwayTransit from '@/src-v2/assets/3D-assets/full-asset/suburban_transit.webp';
import { BusOtpTicketModalType1 } from '../../BusOtpFlow/BusOtpTicket/BusOtpTicketType1';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { BusOtpActivateFlowProps } from '../../BusOtpFlow/Types';
import { getSubLegOrder } from '@/typescript/utils/MultiModal';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BusOTPIndicator } from '../Components/BusOTPIndicator';
import { ActivatedTicketBanner } from '../Components/ActivatedTicketBanner';
import { useAppSelector } from '@/typescript/state/hooks';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { BookingPaymentStatus } from '../SingleTicket/components/TransitInfoCard/TransitInfoCard';
import { isBookingStatusFailed } from '@/typescript/utils/LegStatusUtils';
import { isUndefined } from 'lodash';
import { createTicketDataFromLegInfo } from '../../BusOtpFlow/utils';
import { getTransitMetaInfoLabel } from '../TicketUtils/utils';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { selectAppConfig } from '@/typescript/state/client/session';

type BusTransitMetaInfo =
    | 'ORDINARY'
    | 'AC'
    | 'NON_AC'
    | 'EXPRESS'
    | 'SPECIAL'
    | 'EXECUTIVE'
    | 'FIRST_CLASS'
    | 'SECOND_CLASS'
    | 'THIRD_CLASS';

interface TransitInfoCardHeaderProps {
    mode: 'METRO' | 'BUS' | 'SUBWAY';
    transitMetaInfoDisplayName: string;
    transitCost: number;
    busNo?: string;
    fleetNo: string | undefined;
}

export interface TransitSummaryCardProps {
    fromLocation: string;
    fromLocationSubText?: string;
    destinationLocation: string;
    transitCost: number;
    mode: 'METRO' | 'BUS' | 'SUBWAY';
    transitMetaInfoDisplayName: string;
    busNo: string | undefined;
    busType: BusTransitMetaInfo | undefined;
    arrivalTime: string;
    validity: string;
    platform: string;
    onDetailsPress: () => void;
    legInfo: legInfo;
    journeyId: string;
    setTicketUIModalClosed: React.Dispatch<React.SetStateAction<boolean>> | undefined;
    refundAmount: number | undefined;
    navigation: NativeStackNavigationProp<MainNavigationParamList> | undefined;
}

const getBus3DAsset = (busType: BusTransitMetaInfo) => {
    switch (busType) {
        case 'AC':
            return (
                <Animated.Image
                    accessible={false}
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] right-0'),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcAcService}
                />
            );
        case 'SPECIAL':
            return (
                <Animated.Image
                    accessible={false}
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] right-0'),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcDeluxeService}
                />
            );
        case 'EXPRESS':
            return (
                <Animated.Image
                    accessible={false}
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] right-0'),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcExpressService}
                />
            );
        case 'ORDINARY':
            return (
                <Animated.Image
                    accessible={false}
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] right-0'),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcOrdinaryBusService}
                />
            );
        default:
            return (
                <Animated.Image
                    accessible={false}
                    style={[
                        tailwind.style('absolute h-[285px] w-[285px] -top-[100px] -right-[130px]'),
                        { transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="cover"
                    source={busTransit}
                />
            );
    }
};

const TransitInfoCardHeader = (props: TransitInfoCardHeaderProps) => {
    const { mode, transitMetaInfoDisplayName, transitCost } = props;
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind.style('')}>
            {/* <Animated.View style={tailwind.style('py-4 flex-row items-center gap-[3px]')}>
                {['METRO', 'BUS'].map(item => (
                    <Animated.View style={tailwind.style('flex-row items-center gap-[3px]')}>
                        {getIcon(item, 13, '#7E7E7E', undefined)}
                        <Animated.Text style={tailwind.style('text-[12px] font-areaNormal-extrabold text-[#7E7E7E]')}>
                            {item} +
                        </Animated.Text>
                    </Animated.View>
                ))}
            </Animated.View> */}
            <View style={tailwind.style('flex-row justify-between')}>
                <Animated.View>
                    <View style={tailwind.style('flex-row items-center')}>
                        <View
                            style={tailwind.style(
                                'h-[24px] w-[24px] rounded-[10px] justify-center items-center',
                                `bg-[${getColor(mode, undefined)}]`,
                            )}>
                            {getIcon(mode, 13, undefined, undefined, mode)}
                        </View>
                        <Text
                            style={tailwind.style(
                                'font-areaNormal-extrabold text-[15px] max-h-[22px] leading-[22px] tracking-[0.3px] text-[#313131] pl-2.5',
                                mode === 'METRO' || mode === 'SUBWAY' ? 'capitalize' : 'uppercase',
                            )}>
                            {mode === 'METRO'
                                ? userLanguageStrings.Metro
                                : mode === 'SUBWAY'
                                  ? userLanguageStrings.SubUrban
                                  : props.busNo}
                        </Text>
                        <Text
                            style={tailwind.style(
                                'text-[15px] font-departureMono-regular text-[#7E7E7E] max-h-[22px] leading-[22px] tracking-[0.2px] pl-0.5',
                            )}>
                            {'|'}
                            {getTransitMetaInfoLabel(
                                mode === 'METRO'
                                    ? transitMetaInfoDisplayName
                                    : transitMetaInfoDisplayName.replace('_', ' '),
                                userLanguageStrings,
                            )}
                        </Text>
                    </View>
                    <View style={tailwind.style('flex-row items-center pt-4')}>
                        <TransitCost
                            rupeeColor="#3B3A3C"
                            numberColor="#3B3A3C"
                            textSize="text-[24px]"
                            cost={transitCost}
                        />
                    </View>
                </Animated.View>
            </View>
            {appConfig.flowConfig.busTicketActivationFlow && mode === 'BUS' && props.fleetNo && (
                <Animated.View style={tailwind.style('mt-6')}>
                    <ActivatedTicketBanner busFleetID={props.fleetNo} size="md" isPass={false} />
                </Animated.View>
            )}
            <Svg height={1} style={tailwind.style('mt-4')}>
                <Line strokeDasharray="5, 10" x1={0} x2={SCREEN_WIDTH} y1={1} y2={1} stroke="#E5E5E5" strokeWidth="2" />
            </Svg>
        </View>
    );
};

const TransitSummaryCard = ({
    fromLocation,
    fromLocationSubText,
    destinationLocation,
    transitCost,
    mode,
    transitMetaInfoDisplayName,
    busNo,
    busType,
    arrivalTime,
    validity,
    platform,
    onDetailsPress,
    legInfo,
    journeyId,
    setTicketUIModalClosed,
    refundAmount,
    navigation,
}: TransitSummaryCardProps) => {
    const { animatedStyle, handlers } = useScaleAnimation();
    const { animatedStyle: activationAnimatedStyle, handlers: activationHandlers } = useScaleAnimation();
    const [isTicketModalVisible, setIsTicketModalVisible] = useState(false);
    const appConfig = useAppSelector(selectAppConfig);
    const { ticketUIRef } = useRefsContext();

    const handleActivateBusTicket = useCallback(() => {
        setTimeout(() => ticketUIRef.current?.dismiss(), 200);
        setTicketUIModalClosed && setTicketUIModalClosed(true);
        const navigationParams: BusOtpActivateFlowProps = {
            legInfo: legInfo,
            journeyId: journeyId,
            legOrder: legInfo.order,
            subLegOrder: getSubLegOrder(legInfo),
            autoFillOtp: undefined,
            type: 'Activate',
        };
        navigation &&
            navigation.navigate('HomeTab', {
                screen: 'busOtpFlow',
                params: {
                    state: 'Activate',
                    params: navigationParams,
                    displaySearchBar: false,
                    activePassId: undefined,
                    locationData: undefined,
                },
            });
    }, [ticketUIRef, setTicketUIModalClosed, legInfo, journeyId, navigation]);

    const ticketData = useMemo(() => createTicketDataFromLegInfo(legInfo), [legInfo]);

    const fleetNo = React.useMemo(() => {
        if (mode !== 'BUS' || legInfo?.legExtraInfo?.TAG !== 'Bus') return false;
        return legInfo.legExtraInfo._0?.fleetNo;
    }, [mode, legInfo]);

    // const handleShowBusTicket = useCallback(() => {
    //     setIsTicketModalVisible(true);
    // }, []);

    const handleCloseTicketModal = useCallback(() => {
        setIsTicketModalVisible(false);
    }, []);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const bookingFailed = isBookingStatusFailed(legInfo);
    const commencingHours =
        legInfo?.legExtraInfo?.TAG === 'Subway' ? (legInfo?.legExtraInfo?._0?.ticketValidityHours?.at(0) ?? 1) : 1;

    const routeInfo = React.useMemo(() => {
        if (mode !== 'METRO') return null;
        if (legInfo?.legExtraInfo?.TAG !== 'Metro') return null;

        const routes = legInfo.legExtraInfo._0.routeInfo;
        if (!routes || routes.length === 0) return null;

        const sortedRoutes = [...routes].sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0));

        return sortedRoutes;
    }, [mode, legInfo]);

    const hasSwitch = routeInfo && routeInfo.length > 1;

    const switchStations = React.useMemo(() => {
        if (!hasSwitch || !routeInfo) return [];
        return routeInfo
            .slice(0, -1)
            .map(route => route.destinationStop?.name)
            .filter(Boolean);
    }, [hasSwitch, routeInfo]);

    return (
        <Animated.View
            style={tailwind.style(
                `rounded-[16px] bg-white border border-[#FFBFBB] p-[16px] relative overflow-hidden`,
                isBookingStatusFailed(legInfo) ? 'border-[#FFBFBB]' : 'border-[#F1F2F2]',
            )}>
            {mode === 'METRO' && (
                <Animated.Image
                    accessible={false}
                    style={[
                        tailwind.style('absolute right-[-160px] h-[250px] w-[250px] top-[-100px]'),
                        { transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="cover"
                    source={metroTransit}
                />
            )}
            {mode === 'SUBWAY' && (
                <Animated.Image
                    accessible={false}
                    style={[
                        tailwind.style('absolute right-[-160px] h-[250px] w-[250px] top-[-100px]'),
                        { transform: [{ scaleX: -1 }] },
                    ]}
                    resizeMode="cover"
                    source={subwayTransit}
                />
            )}
            {mode === 'BUS' && busType ? getBus3DAsset(busType) : null}

            <TransitInfoCardHeader
                mode={mode}
                transitMetaInfoDisplayName={transitMetaInfoDisplayName}
                transitCost={transitCost}
                busNo={busNo}
                fleetNo={fleetNo || undefined}
            />
            {appConfig.flowConfig.busTicketActivationFlow && mode === 'BUS' && !fleetNo && Platform.OS === 'ios' && (
                <BlurView
                    blurType="light"
                    blurAmount={10}
                    style={tailwind.style('absolute justify-center items-center inset-0 z-10 mt-11 -mb-4 -mx-4')}>
                    <View style={tailwind.style('w-full px-10')}>
                        <Animated.View style={tailwind.style('')}>
                            <BusOTPIndicator isMultiModal={false} />
                        </Animated.View>
                        <Pressable
                            {...activationHandlers}
                            accessibilityRole="button"
                            testID="enter-bus-otp-to-activate"
                            accessibilityLabel="Enter bus OTP to activate button"
                            onPress={handleActivateBusTicket}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'min-h-[58px] bg-[#047AEA] rounded-[16px] justify-center items-center mt-2',
                                    ),
                                    activationAnimatedStyle,
                                ]}>
                                <Text
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[15px] text-[#FFFFFF] tracking-[0.35px]',
                                    )}>
                                    {userLanguageStrings.EnterBusOTPtoActivateButton}
                                </Text>
                            </Animated.View>
                        </Pressable>
                    </View>
                </BlurView>
            )}
            {appConfig.flowConfig.busTicketActivationFlow &&
                mode === 'BUS' &&
                !fleetNo &&
                Platform.OS === 'android' && (
                    <ImageBackground
                        source={blurBg}
                        resizeMode="cover"
                        style={tailwind.style('absolute justify-center inset-0 z-10 mt-12 bg-white')}>
                        <Animated.View style={tailwind.style('px-4')}>
                            <BusOTPIndicator isMultiModal={false} />
                        </Animated.View>
                        <Pressable
                            {...activationHandlers}
                            accessibilityRole="button"
                            testID="enter-bus-otp-to-activate-android"
                            accessibilityLabel="Enter bus OTP to activate button"
                            onPress={handleActivateBusTicket}
                            style={tailwind.style('px-4')}>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'min-h-[58px] bg-[#047AEA] rounded-[16px] justify-center items-center mt-2',
                                    ),
                                    activationAnimatedStyle,
                                ]}>
                                <Text
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[15px] text-[#FFFFFF] tracking-[0.35px]',
                                    )}>
                                    {userLanguageStrings.EnterBusOTPtoActivateButton}
                                </Text>
                            </Animated.View>
                        </Pressable>
                    </ImageBackground>
                )}

            <Animated.View
                style={tailwind.style(`${fromLocationSubText ? 'pt-[14px]' : 'pt-[16px]'}`)}
                accessible={false}>
                <Animated.View>
                    <Animated.Text
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C] leading-[20px]')}
                        numberOfLines={1}>
                        {fromLocation}
                    </Animated.Text>
                    {fromLocationSubText && (
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'text-[12px] pt-[2px] font-areaNormal-extrabold text-[#969696] leading-[20px]',
                            )}>
                            {fromLocationSubText}
                        </Animated.Text>
                    )}
                </Animated.View>
                <Animated.View style={tailwind.style('pt-[8px] flex-row items-center gap-[4px]')}>
                    <Icon icon={<TransitArrowRight />} size={12} color="#838185" style={tailwind.style('mt-[2px]')} />
                    <Animated.Text
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#3B3A3C] leading-[20px] ')}
                        numberOfLines={1}>
                        {destinationLocation}
                    </Animated.Text>
                </Animated.View>

                {hasSwitch && switchStations.length > 0 && (
                    <Animated.View style={tailwind.style('pt-[12px]')}>
                        {switchStations.map((station, index) => (
                            <Animated.View
                                key={`switch-${index}-${station}`}
                                style={tailwind.style('flex-row items-center gap-[6px]', index > 0 ? 'pt-[6px]' : '')}>
                                <Icon icon={<ShuffleHorizontal />} color="#7E7E7E" size={12} />
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] font-areaNormal-extrabold text-[#7E7E7E] leading-[16px]',
                                    )}
                                    numberOfLines={1}>
                                    {userLanguageStrings.Switchat} {station}
                                </Animated.Text>
                            </Animated.View>
                        ))}
                    </Animated.View>
                )}

                {routeInfo && routeInfo.length > 0 && mode === 'METRO' && (
                    <Animated.View style={tailwind.style('pt-[10px] flex-row items-center flex-wrap gap-[8px]')}>
                        {routeInfo.map((route, index) => (
                            <Animated.View
                                key={`${route.lineColor}-${route.subOrder || index}`}
                                style={tailwind.style('flex-row items-center gap-[4px]')}>
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            'rounded-[4px] w-[14px] h-[14px] flex items-center justify-center',
                                        ),
                                        { backgroundColor: `#${route.lineColorCode || '7E3878'}` },
                                    ]}>
                                    <Animated.Text
                                        style={tailwind.style('text-white font-bold text-[8px] text-center')}>
                                        M
                                    </Animated.Text>
                                </Animated.View>
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] font-areaNormal-extrabold text-[#656565] leading-[16px]',
                                    )}>
                                    {getUserLanguageStringsForMetroLine(route.lineColor || '', userLanguageStrings)}{' '}
                                    {userLanguageStrings.Line}
                                </Animated.Text>
                                {route.platformNumber && (
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[11px] font-departureMono-regular text-[#969696] leading-[16px]',
                                        )}>
                                        • {userLanguageStrings.Platform} {route.platformNumber}
                                    </Animated.Text>
                                )}
                                {index < routeInfo.length - 1 && (
                                    <Icon
                                        icon={<TransitArrowRight />}
                                        size={10}
                                        color="#ABABAB"
                                        style={tailwind.style('mx-[2px]')}
                                    />
                                )}
                            </Animated.View>
                        ))}
                    </Animated.View>
                )}

                <Svg height={1} style={tailwind.style('mt-[14px]')}>
                    <Line
                        strokeDasharray="5, 10"
                        x1={0}
                        x2={SCREEN_WIDTH}
                        y1={1}
                        y2={1}
                        stroke="#E5E5E5"
                        strokeWidth="2"
                    />
                </Svg>
            </Animated.View>

            <Animated.View style={tailwind.style('pt-[16px]')}>
                <View style={tailwind.style('flex-row justify-between')}>
                    <View style={tailwind.style('items-start')}>
                        {((mode === 'BUS' && arrivalTime) || (mode !== 'BUS' && platform)) && mode !== 'SUBWAY' ? (
                            <>
                                <Text
                                    style={tailwind.style(
                                        'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                    )}>
                                    {mode === 'BUS' ? userLanguageStrings.Arrival : userLanguageStrings.Platform}
                                </Text>
                                <Text
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[14px] leading-[18px] text-[#3B3A3C] pt-1',
                                    )}>
                                    {mode === 'BUS' ? arrivalTime : platform}
                                </Text>
                            </>
                        ) : null}
                    </View>

                    {validity && mode !== 'SUBWAY' && (
                        <View style={tailwind.style('items-end')}>
                            <Text
                                style={tailwind.style(
                                    'font-departureMono-regular text-[11px]  w-full tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                )}>
                                {userLanguageStrings.Validity}
                            </Text>
                            <Text
                                style={tailwind.style(
                                    'font-areaNormal-extrabold text-[14px]  leading-[18px] text-[#3B3A3C] pt-1',
                                )}>
                                {validity}
                            </Text>
                        </View>
                    )}
                    <Pressable
                        testID="transit-summary-card-details-button"
                        accessibilityRole="button"
                        accessibilityLabel="View details"
                        {...handlers}
                        disabled={bookingFailed}
                        onPress={onDetailsPress}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    'bg-[#047AEA] rounded-[12px] h-[40px] px-[12px] justify-center items-center flex-row gap-[7px]',
                                ),
                                animatedStyle,
                                { opacity: bookingFailed ? 0.5 : 1 },
                            ]}>
                            <Icon icon={<TicketIcon fill="#fff" />} size={15} />
                            <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold text-white')}>
                                {userLanguageStrings.Details}
                            </Animated.Text>
                        </Animated.View>
                    </Pressable>
                </View>
            </Animated.View>
            {bookingFailed ? (
                <BookingPaymentStatus
                    primaryText={userLanguageStrings.BookingFailedPleasePurchaseYourTicketOnboardOrAtTheStation}
                    secondaryText={
                        isUndefined(refundAmount)
                            ? userLanguageStrings.ProcessingRefundOf('')
                            : userLanguageStrings.ProcessingRefundOf(refundAmount.toString())
                    }
                    infoText={userLanguageStrings.RefundsMightTake5To7Days}
                />
            ) : null}

            {mode === 'BUS' && fleetNo && !bookingFailed && (
                <Animated.View style={tailwind.style('mt-4')}>
                    <Pressable
                        onPress={() => setIsTicketModalVisible(true)}
                        accessibilityRole="button"
                        testID="activate-bus-ticket-button"
                        accessibilityLabel="Show Bus Ticket button"
                        style={tailwind.style('w-full')}
                        {...activationHandlers}>
                        <Animated.View
                            style={[
                                tailwind.style(
                                    'bg-[#047AEA] h-[48px] justify-center items-center rounded-[12px] flex-row gap-2',
                                ),
                                activationAnimatedStyle,
                            ]}>
                            <Icon icon={<TicketIcon fill={'white'} />} size={18} color={'white'} />
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[15px] font-areaNormal-extrabold text-white leading-[19px]',
                                )}>
                                {userLanguageStrings.ShowBusTicket}
                            </Animated.Text>
                        </Animated.View>
                    </Pressable>
                </Animated.View>
            )}

            {mode === 'SUBWAY' && !bookingFailed && (
                <Animated.Text style={tailwind.style('text-[13px] font-areaNormal-extrabold pt-1 text-[#7E7E7E]')}>
                    {userLanguageStrings.TrainJourneyShouldCommence(commencingHours)}
                </Animated.Text>
            )}
            {appConfig.flowConfig.busTicketActivationFlow && mode === 'BUS' && !fleetNo ? (
                <Animated.View style={tailwind.style('mt-18 z-30')}>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'font-areaNormal-extrabold text-[12px] tracking-[0.6px] leading-[22px] text-[#7E7E7E] capitalize',
                        )}>
                        {userLanguageStrings.FromLocation(fromLocation)}
                    </Animated.Text>
                    <Animated.Text
                        numberOfLines={1}
                        style={tailwind.style(
                            'font-areaNormal-extrabold text-[12px] tracking-[0.6px] leading-[22px] text-[#7E7E7E] capitalize',
                        )}>
                        {userLanguageStrings.TowardsLocation(destinationLocation)}
                    </Animated.Text>
                </Animated.View>
            ) : null}
            <BusOtpTicketModalType1
                isTicketVisible={isTicketModalVisible}
                onGoBack={handleCloseTicketModal}
                ticketData={ticketData}
                headerText={userLanguageStrings.BusTicketActivated(busNo || '')}
                subtitleText={userLanguageStrings.ViewOriginalTicketInfo}
                buttonText={userLanguageStrings.GoBack}
            />
        </Animated.View>
    );
};

export default TransitSummaryCard;
