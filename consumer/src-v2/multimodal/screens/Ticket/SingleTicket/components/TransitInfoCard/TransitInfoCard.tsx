import blurBg from '../../../../../../assets/blur_bg.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { isUndefined } from 'lodash';
import { useCallback, useState } from 'react';
import { ImageBackground, Platform, Text, View } from 'react-native';
import Animated, {
    FadeInUp,
    FadeOut,
    LinearTransition,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from 'react-native-reanimated';
import Svg, { ClipPath, Defs, G, Line, Path, Rect } from 'react-native-svg';
import mtIcAcService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ac_service.webp';
import mtIcDeluxeService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_deluxe_service.webp';
import mtIcExpressService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_express_service.webp';
import mtIcOrdinaryBusService from '@/src-v2/assets/3D-assets/bus-tier/mt_ic_ordinary_bus_service.webp';
import busTransit from '@/src-v2/assets/3D-assets/full-asset/bus_transit.webp';
import metroTransit from '@/src-v2/assets/3D-assets/full-asset/metro_transit.webp';
import subwayTransit from '@/src-v2/assets/3D-assets/full-asset/suburban_transit.webp';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/src-v2/multimodal/components/common/Icon';
import { TransitCost } from '../../../../JourneyInfoScreen/components/TransitCost';
import { getColor, getIcon } from '../../../../NewLiveJourney/utils/getIternaryUtils';
import BusList from '../../../../SingleModeSearch/Components/BusList';
import { TicketIcon } from '../../../Components/TrainTransitCell';
import { BusTransitMetaInfo, TransitInfoCardHeaderProps, TransitInfoCardProps } from '../../types';
import { PlaceCard } from './atoms/PlaceCard';
import { TransformedText } from './TransformedText';
import { Spinner } from '@/src-v2/multimodal/components/common/Spinner/UI';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { useRefsContext } from '@/typescript/context/RefsContext';
import React from 'react';
import { ActivatedTicketBanner } from '../../../Components/ActivatedTicketBanner';
import { BusOTPIndicator } from '../../../Components/BusOTPIndicator';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { getTransitMetaInfoLabel } from '../../../TicketUtils/utils';
import { getUserLanguageStringsForMetroLine } from '@/src-v2/multimodal/utils/journeyTrackingUtils';
import { BlurView } from '@sbaiahmed1/react-native-blur';

const WarningIcon = () => {
    return (
        <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <Path
                d="M13.998 2.46875C20.3507 2.46881 25.5273 7.64542 25.5273 13.998C25.5273 20.3507 20.3507 25.5273 13.998 25.5273C7.64538 25.5273 2.46881 20.3507 2.46875 13.998C2.46879 7.64538 7.64537 2.46875 13.998 2.46875ZM13.998 4.77441C8.9136 4.77441 4.77446 8.91361 4.77441 13.998C4.77448 19.0825 8.91361 23.2217 13.998 23.2217C19.0824 23.2216 23.2216 19.0824 23.2217 13.998C23.2216 8.91365 19.0824 4.77448 13.998 4.77441ZM15.1836 17.6504V20.1211H12.7129V17.6504H15.1836ZM15.1836 16.0039H12.7129V7.76855H15.1836V16.0039Z"
                fill="#E97F06"
            />
        </Svg>
    );
};

const ErrorIcon = () => {
    return (
        <Svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <Path
                d="M13.998 2.46875C20.3507 2.46881 25.5273 7.64538 25.5273 13.998C25.5273 20.3507 20.3507 25.5273 13.998 25.5273C7.64538 25.5273 2.46881 20.3507 2.46875 13.998C2.46875 7.64534 7.64534 2.46875 13.998 2.46875ZM13.998 4.77441C8.91358 4.77441 4.77441 8.91358 4.77441 13.998C4.77448 19.0825 8.91361 23.2217 13.998 23.2217C19.0824 23.2216 23.2216 19.0824 23.2217 13.998C23.2217 8.91362 19.0825 4.77448 13.998 4.77441ZM18.9326 10.6895L15.627 14.0049L18.9229 17.3115L17.2607 18.9434L13.9824 15.6543L10.7148 18.9336L9.05371 17.3018L12.3389 14.0059L9.04297 10.6992L10.7041 9.06738L13.9824 12.3564L17.2715 9.05762L18.9326 10.6895Z"
                fill="#E94A06"
            />
        </Svg>
    );
};

const AccordionIcon = () => {
    return (
        <Svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <Path
                d="M1.96875 4.57812L7.12453 9.7339L12.2803 4.57813"
                stroke="#3B3A3C"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </Svg>
    );
};

const ShuffleHorizontal = () => {
    return (
        <Svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <Path
                d="M6.40918 1.62695L4.80176 2.89844C5.93914 3.88247 6.59764 5.3138 6.59766 6.8252H5.59766C5.59764 5.54364 5.0116 4.33261 4.00684 3.53711L4.00195 3.5332L3.99707 3.53711C2.99231 4.33261 2.40627 5.54364 2.40625 6.8252H1.40625C1.40627 5.31404 2.06413 3.88245 3.20117 2.89844L1.59473 1.62695L2.21582 0.84375L4.00195 2.25684L5.78809 0.84375L6.40918 1.62695Z"
                fill="white"
            />
        </Svg>
    );
};

const padNumber = (num: number): string => (num < 10 ? `0${num}` : `${num}`);

const TransitInfoCardHeader = (props: TransitInfoCardHeaderProps) => {
    const { mode, transitMetaInfoDisplayName, transitCost } = props;
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={tailwind.style('')}>
            <View style={tailwind.style('flex-row justify-between')}>
                <Animated.View>
                    <View style={tailwind.style('flex-row items-center')}>
                        <View
                            style={tailwind.style(
                                'h-7 w-7 rounded-[10px] justify-center items-center',
                                `bg-[${getColor(mode, undefined)}]`,
                            )}>
                            {getIcon(mode, 16, undefined, undefined, undefined)}
                        </View>
                        <Text
                            style={tailwind.style(
                                'font-areaNormal-extrabold text-[17px] max-h-[22px] leading-[22px] tracking-[0.3px] text-[#313131] pl-2.5',
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
                                'text-[17px] font-departureMono-regular text-[#7E7E7E] max-h-[22px] leading-[22px] tracking-[0.2px] pl-0.5',
                            )}>
                            {'|'}
                            {getTransitMetaInfoLabel(
                                mode === 'METRO'
                                    ? transitMetaInfoDisplayName
                                    : transitMetaInfoDisplayName?.replace('_', ' '),
                                userLanguageStrings,
                            )}
                        </Text>
                    </View>
                    <View style={tailwind.style('flex-row items-center pt-4')}>
                        <TransitCost
                            rupeeColor="#3B3A3C"
                            numberColor="#3B3A3C"
                            textSize="text-[32px] max-h-[32px] leading-[36px]"
                            cost={transitCost}
                        />
                    </View>
                    {/* Add anna app check */}
                    {/* <View style={tailwind.style('pt-2')}>
                        <Animated.Text style={tailwind.style('text-[11px] font-areaNormal-extrabold text-[#969696]')}>
                            மோட்டார் வாகன விதிகளுக்கு உட்பட்டது
                        </Animated.Text>
                    </View> */}
                </Animated.View>
            </View>
            {(appConfig.flowConfig.busTicketActivationFlow || appConfig.assets?.activatedTicketLayoutLogo) &&
                mode === 'BUS' &&
                props.fleetNo && (
                    <View style={tailwind.style('mt-4')}>
                        <ActivatedTicketBanner busFleetID={props.fleetNo} size="md" isPass={false} />
                    </View>
                )}
            <Svg height={1} style={tailwind.style('mt-4')}>
                <Line strokeDasharray="5, 10" x1={0} x2={SCREEN_WIDTH} y1={1} y2={1} stroke="#E5E5E5" strokeWidth="2" />
            </Svg>
        </View>
    );
};

const getBus3DAsset = (busType: BusTransitMetaInfo) => {
    switch (busType) {
        case 'AC':
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="ac bus image"
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] -right-4 -top-4'),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcAcService}
                />
            );
        case 'SPECIAL':
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="special bus image"
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] -right-4 -top-4 '),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcDeluxeService}
                />
            );
        case 'EXPRESS':
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="express bus image"
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] -right-4 -top-4 '),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcExpressService}
                />
            );
        case 'ORDINARY':
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="ordinary bus image"
                    style={[
                        tailwind.style('absolute h-[100px] w-[100px] -right-4 -top-4 '),
                        { transform: [{ scaleX: -1 }], aspectRatio: 0.64 },
                    ]}
                    resizeMode="cover"
                    source={mtIcOrdinaryBusService}
                />
            );
        default:
            return (
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="bus transit image"
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

const isSwitchMode = (mode: string, props: TransitInfoCardProps): boolean => {
    switch (mode) {
        case 'METRO':
            return 'metroTransitType' in props && props.metroTransitType === 'SWITCH';
        case 'SUBWAY':
            return 'subwayTransitType' in props && props.subwayTransitType === 'SWITCH';
        default:
            return false;
    }
};

const isDirectMode = (mode: string, props: TransitInfoCardProps): boolean => {
    switch (mode) {
        case 'METRO':
            return 'metroTransitType' in props && props.metroTransitType === 'DIRECT';
        case 'SUBWAY':
            return 'subwayTransitType' in props && props.subwayTransitType === 'DIRECT';
        default:
            return false;
    }
};

export const TransitInfoCard = (props: TransitInfoCardProps) => {
    const {
        mode,
        source,
        destination,
        regionalSourceTitle,
        regionalDestinationTitle,
        transitMetaInfo,
        transitMetaInfoDisplayName,
        transitCost,
        // handleActivateBusTicket,
    } = props;
    const appSystemConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // Extract full routeInfo for displaying all switches
    const allRoutes = React.useMemo(() => {
        if (mode !== 'METRO' && mode !== 'SUBWAY') return null;
        if (!('legInfo' in props) || !props.legInfo) return null;

        const legInfo = props.legInfo;
        if (legInfo.legExtraInfo.TAG !== 'Metro' && legInfo.legExtraInfo.TAG !== 'Subway') return null;

        const routeInfo = legInfo.legExtraInfo._0.routeInfo;
        if (!routeInfo || routeInfo.length === 0) return null;

        return [...routeInfo].sort((a, b) => (a.subOrder ?? 0) - (b.subOrder ?? 0));
    }, [mode, props]);

    const headerProps: TransitInfoCardHeaderProps =
        mode === 'BUS'
            ? {
                  mode,
                  transitMetaInfo,
                  transitMetaInfoDisplayName,
                  transitCost,
                  busNo: props.busNo,
                  fleetNo: props.fleetNo,
                  activationProps: props.activationProps,
              }
            : { mode, transitMetaInfo, transitMetaInfoDisplayName, transitCost };

    const { handlers, animatedStyle } = useScaleAnimation();
    const { ticketUIRef } = useRefsContext();
    const handleActivateBusTicket = useCallback(() => {
        if (mode === 'BUS' && props.activationProps) {
            props.setTicketUIModalClosed && props.setTicketUIModalClosed(true);
            setTimeout(() => ticketUIRef.current?.dismiss(), 200);
            props.navigation &&
                props.navigation.navigate('HomeTab', {
                    screen: 'busOtpFlow',
                    params: {
                        state: 'Activate',
                        params: props.activationProps,
                        displaySearchBar: false,
                        activePassId: undefined,
                        locationData: undefined,
                    },
                });
        }
    }, [props]);

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(30).stiffness(200)}
            style={tailwind.style('bg-[#FBFBFB]')}>
            <Animated.View
                layout={LinearTransition.springify().damping(30).stiffness(200)}
                style={tailwind.style(
                    'mt-6 pt-5 mx-5 p-4 bg-white rounded-2xl border-[1px] border-[#F1F2F2] shadow-sm overflow-hidden',
                    Platform.OS === 'android' ? 'mb-1.5' : '',
                    props.status === 'UNSUCCESSFUL' ? 'border-[#FFE688]' : '',
                    props.status === 'FAILED_PROCESSING_REFUND' ? 'border-[#FFBFBB]' : '',
                    props.status === 'ACTIVE' ? 'border-[#F1F2F2]' : '',
                )}>
                <Animated.View style={tailwind.style(props.status !== 'ACTIVE' ? 'opacity-60' : '')}>
                    {mode === 'METRO' && (
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="metro transit image"
                            style={[
                                tailwind.style('absolute -right-[110px] h-[200px] w-[200px] -top-[60px]'),
                                { transform: [{ scaleX: -1 }] },
                            ]}
                            resizeMode="cover"
                            source={metroTransit}
                        />
                    )}
                    {mode === 'SUBWAY' && (
                        <Animated.Image
                            accessible={true}
                            accessibilityLabel="suburban transit image"
                            style={[
                                tailwind.style('absolute -right-[110px] h-[200px] w-[200px] -top-[60px]'),
                                { transform: [{ scaleX: -1 }] },
                            ]}
                            resizeMode="cover"
                            source={subwayTransit}
                        />
                    )}
                    {mode === 'BUS' ? getBus3DAsset(transitMetaInfo) : null}
                    <TransitInfoCardHeader {...headerProps} />
                    {appSystemConfig.flowConfig.busTicketActivationFlow &&
                        headerProps.mode === 'BUS' &&
                        !headerProps.fleetNo &&
                        Platform.OS === 'ios' && (
                            <BlurView
                                blurAmount={10}
                                blurType="light"
                                style={tailwind.style(
                                    'absolute justify-center items-center inset-0 z-10 mt-11 -mb-4 -mx-4',
                                )}>
                                <View style={tailwind.style('w-full px-4')}>
                                    <Animated.View style={tailwind.style('items-center justify-center')}>
                                        <Animated.View
                                            style={tailwind.style(
                                                'mb-3 w-[42px] h-[41px] items-center justify-center flex-row bg-white rounded-[20px]',
                                            )}>
                                            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <G clipPath="url(#clip0_176_1233)">
                                                    <Path
                                                        d="M14.6184 8.35625L9.27843 8.40561C6.87646 8.42781 5.67548 8.43891 4.86196 9.09773C4.6919 9.23546 4.53742 9.39137 4.40127 9.5627C3.75 10.3823 3.75 11.5833 3.75 13.9854V15.9798C3.75 18.4226 3.75 19.644 4.41618 20.4688C4.55532 20.641 4.71309 20.7973 4.88663 20.9349C5.71755 21.5934 6.93889 21.5821 9.38158 21.5595L14.7216 21.5102C17.1235 21.488 18.3245 21.4769 19.138 20.8181C19.3081 20.6803 19.4626 20.5244 19.5987 20.3531C20.25 19.5335 20.25 18.3325 20.25 15.9304V13.936C20.25 11.4932 20.25 10.2718 19.5838 9.44704C19.4447 9.27478 19.2869 9.11845 19.1134 8.98092C18.2825 8.32239 17.0611 8.33367 14.6184 8.35625Z"
                                                        fill="#016ACD"
                                                    />
                                                    <Path
                                                        d="M8.04126 10.6939V6.36004C8.04126 4.17004 9.82626 2.38504 12.0163 2.38504C14.2063 2.38504 15.9913 4.17004 15.9913 6.36004V10.6939"
                                                        stroke="#016ACD"
                                                        strokeWidth="2.25"
                                                        strokeMiterlimit="10"
                                                    />
                                                    <Path
                                                        d="M12.8096 15.7409C13.1696 15.4709 13.4246 15.0659 13.4246 14.5859C13.4246 13.7759 12.7796 13.1309 11.9696 13.1309C11.1596 13.1309 10.5146 13.7759 10.5146 14.5859C10.5146 15.0359 10.7396 15.4259 11.0546 15.6959L10.7546 16.9559C10.6946 17.2259 10.8896 17.4809 11.1746 17.4809H12.6746C12.9596 17.4809 13.1546 17.2259 13.0946 16.9559L12.8096 15.7409Z"
                                                        fill="#F7F7F7"
                                                    />
                                                </G>
                                                <Defs>
                                                    <ClipPath id="clip0_176_1233">
                                                        <Rect width="24" height="24" fill="white" />
                                                    </ClipPath>
                                                </Defs>
                                            </Svg>
                                        </Animated.View>
                                    </Animated.View>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[12px] tracking-[0.1px] leading-[17px] text-[#3B3A3C] text-center',
                                        )}>
                                        {userLanguageStrings.ToBeActivatedOnlyInsideBus}
                                    </Animated.Text>
                                    <Pressable
                                        accessibilityLabel="Enter Bus OTP to Activate button"
                                        {...handlers}
                                        accessibilityRole="button"
                                        testID="enter-bus-otp-to-activate"
                                        onPress={handleActivateBusTicket}>
                                        <Animated.View
                                            style={[
                                                tailwind.style(
                                                    'min-h-[58px] bg-[#047AEA] rounded-[16px] justify-center items-center mt-4',
                                                ),
                                                animatedStyle,
                                            ]}>
                                            <Text
                                                style={tailwind.style(
                                                    'font-areaNormal-extrabold text-[15px] text-[#FFFFFF] tracking-[0.35px]',
                                                )}>
                                                {userLanguageStrings.EnterBusOTPtoActivateButton}
                                            </Text>
                                        </Animated.View>
                                    </Pressable>
                                    <Animated.View style={tailwind.style('mt-[18px]')}>
                                        <BusOTPIndicator isMultiModal={true} />
                                    </Animated.View>
                                </View>
                            </BlurView>
                        )}
                    {appSystemConfig.flowConfig.busTicketActivationFlow &&
                        headerProps.mode === 'BUS' &&
                        !headerProps.fleetNo &&
                        Platform.OS === 'android' && (
                            <ImageBackground
                                source={blurBg}
                                style={tailwind.style(
                                    'absolute justify-center items-center inset-0 z-10 mt-11 -mb-4 -mx-4 bg-white',
                                )}>
                                <Animated.View style={tailwind.style('px-4')}>
                                    <BusOTPIndicator isMultiModal={false} />
                                </Animated.View>
                                <Animated.View style={tailwind.style('w-full')}>
                                    <Pressable
                                        accessibilityLabel="Enter Bus OTP to Activate button"
                                        {...handlers}
                                        accessibilityRole="button"
                                        testID="enter-bus-otp-to-activate-android"
                                        onPress={handleActivateBusTicket}
                                        style={tailwind.style('px-4')}>
                                        <Animated.View
                                            style={[
                                                tailwind.style(
                                                    'min-h-[58px] bg-[#047AEA] rounded-[16px] justify-center items-center mt-2',
                                                ),
                                                animatedStyle,
                                            ]}>
                                            <Text
                                                style={tailwind.style(
                                                    'font-areaNormal-extrabold text-[15px] text-[#FFFFFF] tracking-[0.35px]',
                                                )}>
                                                {userLanguageStrings.EnterBusOTPtoActivateButton}
                                            </Text>
                                        </Animated.View>
                                    </Pressable>
                                </Animated.View>
                            </ImageBackground>
                        )}

                    {(mode === 'METRO' || mode === 'SUBWAY') && allRoutes && allRoutes.length > 0 ? (
                        <>
                            {allRoutes.map((route, index) => {
                                const isFirstSegment = index === 0;
                                const isLastSegment = index === allRoutes.length - 1;

                                // For first segment: use overall source, for others: use previous destination as switch/source
                                const segmentSource = isFirstSegment
                                    ? source
                                    : allRoutes[index - 1]?.destinationStop?.name;
                                const segmentSourceRegional = isFirstSegment
                                    ? regionalSourceTitle
                                    : allRoutes[index - 1]?.destinationStop?.regionalName || '';

                                // Destination for this segment
                                const segmentDestination = isLastSegment
                                    ? destination
                                    : route.destinationStop?.name || '';
                                const segmentDestinationRegional = isLastSegment
                                    ? regionalDestinationTitle
                                    : route.destinationStop?.regionalName || '';

                                const lineColor = route.lineColor;
                                const lineColorCode = route.lineColorCode;
                                const platformNo = route.platformNumber;

                                return (
                                    <View
                                        key={`segment-${route.lineColor}-${route.subOrder ?? index}`}
                                        style={tailwind.style('relative', index === 0 ? 'mt-5 pb-2.5' : 'mt-2')}>
                                        <Animated.View
                                            style={[
                                                tailwind.style(
                                                    'absolute w-2.5 rounded-[3px] overflow-hidden',
                                                    `bg-[#${lineColorCode}]`,
                                                ),
                                                {
                                                    top: 0,
                                                    bottom: 0,
                                                    left: 0,
                                                },
                                            ]}>
                                            <TransformedText
                                                text={`${lineColor} ${userLanguageStrings.Line}`}
                                                width={90}
                                            />
                                        </Animated.View>

                                        <Animated.View style={tailwind.style('pl-6')}>
                                            {isFirstSegment && segmentSource ? (
                                                <PlaceCard
                                                    type="Source"
                                                    title={segmentSource}
                                                    regionalTitle={segmentSourceRegional}
                                                    renderLine={true}
                                                    fleetNo={
                                                        'dummyTextBecauseSendingUndefinedWillRenderBlurViewForOtherModes'
                                                    }
                                                />
                                            ) : !isFirstSegment ? (
                                                <View>
                                                    <Text
                                                        style={tailwind.style(
                                                            'text-[14px] leading-[18px] font-areaNormal-extrabold text-[#7E7E7E] tracking-[0.2px]',
                                                        )}>
                                                        {userLanguageStrings.Switch}
                                                    </Text>
                                                    <Svg height={1} style={tailwind.style('mt-4')}>
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
                                                </View>
                                            ) : null}

                                            {/* Platform number */}
                                            {platformNo && (
                                                <View style={tailwind.style('flex-row pt-4')}>
                                                    {isFirstSegment && 'gateNo' in props && props.gateNo ? (
                                                        <View>
                                                            <Text
                                                                style={tailwind.style(
                                                                    'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                                                )}>
                                                                {userLanguageStrings.GateNo}
                                                            </Text>
                                                            <Text
                                                                style={tailwind.style(
                                                                    'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                                                )}>
                                                                {padNumber(props.gateNo)}
                                                            </Text>
                                                        </View>
                                                    ) : null}
                                                    <View
                                                        style={tailwind.style(
                                                            isFirstSegment && 'gateNo' in props && props.gateNo
                                                                ? 'pl-15'
                                                                : 'pl-0',
                                                        )}>
                                                        <Text
                                                            style={tailwind.style(
                                                                'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                                            )}>
                                                            {userLanguageStrings.Platform}
                                                        </Text>
                                                        <Text
                                                            style={tailwind.style(
                                                                'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                                            )}>
                                                            {padNumber(Number.parseInt(platformNo))}
                                                        </Text>
                                                    </View>
                                                </View>
                                            )}

                                            {/* Boarding instruction - show for all segments except the last */}
                                            {!isLastSegment && lineColor && platformNo && (
                                                <View style={tailwind.style('pt-4')}>
                                                    <Text
                                                        style={tailwind.style(
                                                            'font-areaNormal-extrabold text-[12px] tracking-[0.1px] leading-[17px] text-[#7E7E7E]',
                                                        )}>
                                                        {userLanguageStrings.BoardLineMetroFromPlatform(
                                                            getUserLanguageStringsForMetroLine(
                                                                lineColor,
                                                                userLanguageStrings,
                                                            ) ?? '',
                                                            platformNo || '',
                                                        )}
                                                    </Text>
                                                </View>
                                            )}

                                            {/* Destination at bottom - show for ALL segments */}
                                            {segmentDestination && (
                                                <View style={tailwind.style('pt-10')}>
                                                    {isLastSegment ? (
                                                        <PlaceCard
                                                            type="Destination"
                                                            title={segmentDestination}
                                                            regionalTitle={segmentDestinationRegional}
                                                            renderLine={false}
                                                            fleetNo={
                                                                'dummyTextBecauseSendingUndefinedWillRenderBlurViewForOtherModes'
                                                            }
                                                        />
                                                    ) : (
                                                        <View>
                                                            <Text
                                                                numberOfLines={1}
                                                                style={tailwind.style(
                                                                    'text-[15px] capitalize leading-[18px] font-areaNormal-extrabold text-[#3B3A3C]',
                                                                )}>
                                                                {segmentDestination}
                                                            </Text>
                                                            {segmentDestinationRegional ? (
                                                                <Text
                                                                    numberOfLines={1}
                                                                    style={tailwind.style(
                                                                        'text-[12px] leading-[15px] font-areaNormal-extrabold text-[#656565] tracking-[0.2px] pt-2.5',
                                                                    )}>
                                                                    {segmentDestinationRegional}
                                                                </Text>
                                                            ) : null}
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </Animated.View>
                                    </View>
                                );
                            })}
                        </>
                    ) : (
                        /* Fallback to original rendering for non-switch or when allRoutes not available */
                        <View style={tailwind.style('relative', isSwitchMode(mode, props) ? 'mt-5 pb-2.5' : 'pt-5 ')}>
                            <Animated.View style={tailwind.style(isSwitchMode(mode, props) ? 'pl-6' : '')}>
                                <PlaceCard
                                    type="Source"
                                    title={source}
                                    regionalTitle={regionalSourceTitle}
                                    renderLine={mode !== 'BUS'}
                                    fleetNo={
                                        mode === 'BUS'
                                            ? props.fleetNo
                                            : 'dummyTextBecauseSendingUndefinedWillRenderBlurViewForOtherModes'
                                    }
                                />
                            </Animated.View>
                            {(mode === 'METRO' || mode === 'SUBWAY') && (
                                <Animated.View style={tailwind.style(isSwitchMode(mode, props) ? 'pl-6' : '')}>
                                    <View style={tailwind.style('flex-row pt-4')}>
                                        {props.gateNo ? (
                                            <View>
                                                <Text
                                                    style={tailwind.style(
                                                        'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                                    )}>
                                                    {userLanguageStrings.GateNo}
                                                </Text>
                                                <Text
                                                    style={tailwind.style(
                                                        'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                                    )}>
                                                    {padNumber(props.gateNo)}
                                                </Text>
                                            </View>
                                        ) : null}
                                        {props.platformNo ? (
                                            <View style={tailwind.style(props.gateNo ? 'pl-15' : 'pl-0')}>
                                                <Text
                                                    style={tailwind.style(
                                                        'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                                    )}>
                                                    {userLanguageStrings.Platform}
                                                </Text>
                                                <Text
                                                    style={tailwind.style(
                                                        'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                                    )}>
                                                    {padNumber(props.platformNo)}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                    {isSwitchMode(mode, props) && 'sourceMessage' in props && props.sourceMessage ? (
                                        <Animated.View style={tailwind.style('pt-6')}>
                                            <Text
                                                numberOfLines={2}
                                                style={tailwind.style(
                                                    'font-areaNormal-extrabold text-[12px] tracking-[0.1px] leading-[17px] text-[#7E7E7E]',
                                                )}>
                                                {props.sourceMessage}
                                            </Text>
                                        </Animated.View>
                                    ) : null}
                                </Animated.View>
                            )}
                            {isSwitchMode(mode, props) && 'sourceLineColorCode' in props && 'sourceLine' in props ? (
                                <Animated.View
                                    style={[
                                        tailwind.style(
                                            'absolute w-2.5 rounded-[3px] overflow-hidden',
                                            `bg-[${props.sourceLineColorCode}]`,
                                        ),
                                        {
                                            top: 0,
                                            bottom: 0,
                                            left: 0,
                                        },
                                    ]}>
                                    <TransformedText
                                        text={`${props.sourceLine} ${userLanguageStrings.Line}`}
                                        width={90}
                                    />
                                </Animated.View>
                            ) : null}
                        </View>
                    )}

                    {isSwitchMode(mode, props) && !allRoutes ? (
                        <Animated.View style={tailwind.style('relative mt-2')}>
                            <Animated.View style={tailwind.style('absolute h-full w-2.5 rounded-[3px] bg-[#C9C9C9]')}>
                                <Animated.View style={[tailwind.style('absolute top-1 left-[1px]')]}>
                                    <Icon icon={<ShuffleHorizontal />} size={8} />
                                </Animated.View>
                                <Animated.View
                                    style={[
                                        tailwind.style('absolute bottom-0'),
                                        {
                                            transform: [{ rotate: '90deg' }, { translateY: 75 / 2 - 5.5 }],
                                        },
                                    ]}>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            tailwind.style(
                                                'w-[75px] font-areaNormal-extrabold text-[8px] tracking-[0.2px] leading-[12px] text-[#FFFFFF] opacity-40',
                                            ),
                                        ]}>
                                        {userLanguageStrings.Switch}
                                    </Text>
                                </Animated.View>
                            </Animated.View>
                            {isSwitchMode(mode, props) && 'switchPlatformNo' in props && props.switchPlatformNo ? (
                                <Animated.View style={tailwind.style(isSwitchMode(mode, props) ? 'pl-6 py-2.5' : '')}>
                                    <PlaceCard
                                        type="Switch"
                                        title={props.switchStation}
                                        regionalTitle={props.switchStationRegionalTitle}
                                        renderLine={true}
                                        fleetNo={'dummyTextBecauseSendingUndefinedWillRenderBlurViewForOtherModes'}
                                    />
                                    <View style={tailwind.style('flex-row pt-4')}>
                                        {props.switchPlatformNo ? (
                                            <View>
                                                <Text
                                                    style={tailwind.style(
                                                        'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                                    )}>
                                                    {userLanguageStrings.Platform}
                                                </Text>
                                                <Text
                                                    style={tailwind.style(
                                                        'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                                    )}>
                                                    {padNumber(props.switchPlatformNo)}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </Animated.View>
                            ) : null}
                        </Animated.View>
                    ) : null}
                    {(mode === 'METRO' || mode === 'SUBWAY') &&
                        !isUndefined(props.ticketNumber) &&
                        appSystemConfig.uiConfig.showTicketLabelInTransitInfoCard && (
                            <Animated.View style={tailwind.style('pt-6')}>
                                <Text
                                    style={tailwind.style(
                                        'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                    )}>
                                    {userLanguageStrings.TicketNumberLabel}
                                </Text>
                                <Text
                                    numberOfLines={2}
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[12px] tracking-[0.1px] leading-[17px] text-[#7E7E7E]',
                                    )}>
                                    {props.ticketNumber}
                                </Text>
                            </Animated.View>
                        )}
                    {/* Destination section - only for non-metro/subway modes or when allRoutes is not available */}
                    {!((mode === 'METRO' || mode === 'SUBWAY') && allRoutes && allRoutes.length > 0) && (
                        <Animated.View style={tailwind.style('relative mt-2')}>
                            {/* Use the LAST route's line color from allRoutes if available, otherwise fallback to props */}
                            {isSwitchMode(mode, props) &&
                            'destinationLineColorCode' in props &&
                            'destinationLine' in props &&
                            props.destinationLineColorCode &&
                            props.destinationLine ? (
                                <Animated.View
                                    style={tailwind.style(
                                        'absolute h-full w-2.5 rounded-[3px]',
                                        `bg-[${props.destinationLineColorCode}]`,
                                    )}>
                                    <TransformedText text={`${props.destinationLine} LINE`} width={90} />
                                </Animated.View>
                            ) : null}

                            {isSwitchMode(mode, props) &&
                            !allRoutes &&
                            'destinationMessage' in props &&
                            props.destinationMessage ? (
                                <Animated.View
                                    style={tailwind.style('pl-6', isSwitchMode(mode, props) ? 'pt-1' : 'pt-6')}>
                                    <Text
                                        numberOfLines={2}
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[12px] tracking-[0.1px] leading-[17px] text-[#7E7E7E]',
                                        )}>
                                        {props.destinationMessage}
                                    </Text>
                                </Animated.View>
                            ) : null}
                            <Animated.View
                                style={tailwind.style(
                                    isSwitchMode(mode, props) ? 'pl-6 pb-1' : '',
                                    mode === 'BUS' ? 'pt-2' : 'pt-10',
                                )}>
                                <PlaceCard
                                    type="Destination"
                                    title={destination}
                                    regionalTitle={regionalDestinationTitle}
                                    renderLine={isSwitchMode(mode, props) ? false : true}
                                    fleetNo={
                                        mode === 'BUS'
                                            ? props.fleetNo
                                            : 'dummyTextBecauseSendingUndefinedWillRenderBlurViewForOtherModes'
                                    }
                                />
                            </Animated.View>
                        </Animated.View>
                    )}
                    {isSwitchMode(mode, props) ? (
                        <Svg height={1} style={tailwind.style('mt-4')}>
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
                    ) : null}
                    {isDirectMode(mode, props) && props.transitMessage && (
                        <View style={tailwind.style('pt-4')}>
                            <Text
                                numberOfLines={2}
                                style={tailwind.style(
                                    'font-areaNormal-extrabold text-[12px] tracking-[0.1px] leading-[17px] text-[#7E7E7E]',
                                )}>
                                {props.transitMessage}
                            </Text>
                        </View>
                    )}
                    {mode === 'BUS' ? (
                        <View style={tailwind.style('pt-4')}>
                            <Text
                                accessible={false}
                                numberOfLines={2}
                                style={tailwind.style(
                                    'font-areaNormal-extrabold text-[13px] tracking-[0.1px] leading-[17px] text-[#7E7E7E]',
                                )}>
                                {props.transitMessage}
                            </Text>
                        </View>
                    ) : null}
                    {!appSystemConfig?.uiConfig.hideVehicleNextArrivalAndValidityDetails && (
                        <View style={tailwind.style('flex-row justify-between pt-5')}>
                            <View style={tailwind.style('items-start')}>
                                <Text
                                    accessible={false}
                                    style={tailwind.style(
                                        'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                    )}>
                                    {userLanguageStrings.NextArrival}
                                </Text>
                                <Text
                                    accessible={false}
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                    )}>
                                    {props.nextArrivalTime}
                                </Text>
                            </View>
                            {props.validTill && (
                                <View style={tailwind.style('items-end')}>
                                    <Text
                                        accessible={false}
                                        style={tailwind.style(
                                            'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                        )}>
                                        {userLanguageStrings.Validity}
                                    </Text>
                                    <Text
                                        accessible={false}
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                        )}>
                                        {props.validTill}
                                    </Text>
                                </View>
                            )}
                        </View>
                    )}
                </Animated.View>
                {/* Info Render for Anna when Blurred */}
                {appSystemConfig.flowConfig.busTicketActivationFlow &&
                headerProps.mode === 'BUS' &&
                !headerProps.fleetNo ? (
                    <Animated.View style={tailwind.style('pt-8')}>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'font-areaNormal-extrabold text-[12px] tracking-[0.6px] leading-[22px] text-[#7E7E7E] capitalize',
                            )}>
                            From {source}
                        </Animated.Text>
                        <Animated.Text
                            numberOfLines={1}
                            style={tailwind.style(
                                'font-areaNormal-extrabold text-[12px] tracking-[0.6px] leading-[22px] text-[#7E7E7E] capitalize',
                            )}>
                            towards {destination}
                        </Animated.Text>
                        <View style={tailwind.style('flex-row justify-between pt-5')}>
                            <View style={tailwind.style('items-start')}>
                                <Text
                                    style={tailwind.style(
                                        'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                    )}>
                                    {userLanguageStrings.NextArrival}
                                </Text>
                                <Text
                                    style={tailwind.style(
                                        'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                    )}>
                                    {props.nextArrivalTime}
                                </Text>
                            </View>
                            {props.validTill && (
                                <View style={tailwind.style('items-end')}>
                                    <Text
                                        style={tailwind.style(
                                            'font-departureMono-regular text-[11px] tracking-[0.2px] leading-[16px] text-[#7E7E7E] uppercase',
                                        )}>
                                        {userLanguageStrings.Validity}
                                    </Text>
                                    <Text
                                        style={tailwind.style(
                                            'font-areaNormal-extrabold text-[14px] tracking-[0.6px] leading-[18px] text-[#3B3A3C] pt-1',
                                        )}>
                                        {props.validTill}
                                    </Text>
                                </View>
                            )}
                        </View>
                        {props.mode === 'BUS' && props.availableBuses && props.availableBuses.length > 0 ? (
                            <View style={tailwind.style('justify-center items-center pt-4')}>
                                <Svg height={1} style={tailwind.style('mt-4')}>
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
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[#969696] text-[13px] leading-[18px] font-areaNormal-extrabold ',
                                    )}>
                                    {userLanguageStrings.ThisTicketIsAlsoValidIn}{' '}
                                </Animated.Text>
                                <BusList
                                    busList={props.availableBuses}
                                    isLoading={false}
                                    showIcon={false}
                                    isTicket={true}
                                />
                            </View>
                        ) : null}
                    </Animated.View>
                ) : null}
                {/* Info Render for Anna when Blurred */}
                {props.status === 'UNSUCCESSFUL' ? (
                    <View style={tailwind.style('mt-3 pt-4 px-4 -mx-4 -mb-4 pb-4 bg-[#FFFBEF]')}>
                        <WarningIcon />
                        <Text
                            style={tailwind.style(
                                'text-[#3B3A3C] text-[13px] leading-[18px] font-areaNormal-extrabold pt-2',
                            )}>
                            {userLanguageStrings.BookingUnsuccessfulForThisTicket}
                        </Text>
                        <Pressable
                            accessibilityLabel="Retry booking button"
                            accessibilityRole="button"
                            testID="retry-booking"
                            onPress={props.retryBooking}
                            style={tailwind.style(
                                'mt-3 min-h-[47px] flex-row justify-center items-center bg-[#3B3A3C] rounded-xl',
                            )}>
                            {!props.isRetrying ? (
                                <Animated.View
                                    style={tailwind.style('flex-row items-center justify-center')}
                                    entering={FadeInUp.springify().damping(30).stiffness(200)}
                                    exiting={FadeOut.duration(100)}>
                                    <Text
                                        style={tailwind.style(
                                            'text-[#FFFFFF] text-[13px] font-areaNormal-extrabold leading-[23px]',
                                        )}>
                                        {userLanguageStrings.RetryBooking}
                                    </Text>
                                    <Icon
                                        icon={<TicketIcon />}
                                        style={tailwind.style('ml-1.5 mt-0.5')}
                                        size={13}
                                        color="#FFFFFF"
                                    />
                                </Animated.View>
                            ) : null}
                            {props.isRetrying ? (
                                <Animated.View
                                    entering={FadeInUp.springify().damping(30).stiffness(200)}
                                    exiting={FadeOut.duration(100)}
                                    style={tailwind.style('flex-row items-center justify-center')}>
                                    <Spinner size={'md'} themeColor="default" />
                                </Animated.View>
                            ) : null}
                        </Pressable>
                    </View>
                ) : null}
                {props.status === 'FAILED_PROCESSING_REFUND' ? (
                    <BookingPaymentStatus
                        primaryText={userLanguageStrings.BookingFailed}
                        secondaryText={userLanguageStrings.ProcessingRefundOf(String(props.refundAmount))}
                        infoText={userLanguageStrings.RefundsMightTake2To5Days}
                    />
                ) : null}
                {props.status === 'FAILED_PROCESSED_REFUND' ? (
                    <View style={tailwind.style('mt-3 pt-4 px-4 -mx-4 -mb-4 pb-4 bg-[#F4F4F4]')}>
                        <ErrorIcon />
                        <Text
                            style={tailwind.style(
                                'text-[3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px] pt-2',
                            )}>
                            {userLanguageStrings.BookingFailed}
                        </Text>
                        <Animated.View style={tailwind.style('h-[1px] bg-[#E6E6E6] mt-3')} />
                        <Animated.Text
                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                            style={tailwind.style(
                                'text-[#3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px] pt-3',
                            )}>
                            {userLanguageStrings.CompletedRefundOf(String(props.refundAmount))}
                        </Animated.Text>
                    </View>
                ) : null}
                {props.status === 'CANCELLED_PROCESSED_REFUND' ? (
                    <View style={tailwind.style('mt-3 pt-4 px-4 -mx-4 -mb-4 pb-4 bg-[#F4F4F4]')}>
                        <ErrorIcon />
                        <Text
                            style={tailwind.style(
                                'text-[3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px] pt-2',
                            )}>
                            {userLanguageStrings.YourTicketHasBeenCancelled}
                        </Text>
                        <Animated.View style={tailwind.style('h-[1px] bg-[#E6E6E6] mt-3')} />
                        <Animated.Text
                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                            style={tailwind.style(
                                'text-[#3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px] pt-3',
                            )}>
                            {userLanguageStrings.CompletedRefundOf(String(props.refundAmount))}
                        </Animated.Text>
                    </View>
                ) : null}

                {props.status === 'CANCELLED_PROCESSING_REFUND' ? (
                    <BookingPaymentStatus
                        primaryText={userLanguageStrings.YourTicketHasBeenCancelled}
                        secondaryText={userLanguageStrings.ProcessingRefundOf(String(props.refundAmount))}
                        infoText={userLanguageStrings.RefundsMightTake7To14Days}
                    />
                ) : null}

                {props.status === 'CANCELLED_REFUND_FAILED' ? (
                    <View style={tailwind.style('mt-3 pt-4 px-4 -mx-4 -mb-4 pb-4 bg-[#F4F4F4]')}>
                        <ErrorIcon />
                        <Text
                            style={tailwind.style(
                                'text-[3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px] pt-2',
                            )}>
                            {userLanguageStrings.YourTicketHasBeenCancelled}
                        </Text>
                        <Animated.View style={tailwind.style('h-[1px] bg-[#E6E6E6] mt-3')} />
                        <Animated.Text
                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                            style={tailwind.style(
                                'text-[#3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px] pt-3',
                            )}>
                            {userLanguageStrings.RefundFor(String(props.refundAmount))} {userLanguageStrings.IsFailed}
                        </Animated.Text>
                    </View>
                ) : null}
            </Animated.View>
        </Animated.View>
    );
};

export const BookingPaymentStatus = ({
    primaryText,
    secondaryText,
    infoText,
}: {
    primaryText: string;
    secondaryText: string;
    infoText: string;
}) => {
    const [toggle, setToggle] = useState(false);

    const derivedSharedValue = useDerivedValue(() => {
        return toggle ? withTiming(1) : withTiming(0);
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ rotate: `${derivedSharedValue.value * 180}deg` }],
        };
    });

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(30).stiffness(200)}
            style={tailwind.style('mt-3 pt-4 px-4 -mx-4 -mb-4 pb-4 bg-[#FFF3EF]')}>
            <ErrorIcon />
            <Text style={tailwind.style('text-[#3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px] pt-2')}>
                {primaryText}
            </Text>
            <Animated.View style={tailwind.style('h-[1px] bg-[#F9E0DE] mt-3')} />
            <Animated.View layout={LinearTransition.springify().damping(30).stiffness(200)}>
                <Pressable
                    accessibilityLabel="Refund Processing button"
                    accessibilityRole="button"
                    testID="refund-processing"
                    onPress={() => setToggle(!toggle)}
                    style={tailwind.style('pt-3')}>
                    <Animated.View style={tailwind.style('flex-row items-center justify-between')}>
                        <Animated.Text
                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                            style={tailwind.style(
                                'text-[#3B3A3C] text-[13px] font-areaNormal-extrabold leading-[23px]',
                            )}>
                            {secondaryText}
                        </Animated.Text>
                        <Animated.View style={animatedStyle}>
                            <AccordionIcon />
                        </Animated.View>
                    </Animated.View>
                    {toggle ? (
                        <Animated.Text
                            layout={LinearTransition.springify().damping(30).stiffness(200)}
                            exiting={FadeOut.duration(100)}
                            entering={FadeInUp.springify().damping(30).stiffness(200)}
                            style={tailwind.style(
                                'text-[#767272] text-[13px] font-areaNormal-extrabold leading-[23px] pt-2',
                            )}>
                            {infoText}
                        </Animated.Text>
                    ) : null}
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
};
