import {
    getIconBGFromType,
    getIconFromType,
} from '@/src-v2/multimodal/components/PublicTransportCard/PublicTransportCardUtils';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React from 'react';
import { Text, Image } from 'react-native';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';
import { useScaleAnimation } from '../../../../../src/typescript/utils/useScaleAnimation';
import mtIcBusPassBg from '../../../../assets/mt_ic_bus_pass_bg.webp';
import mtIcBusSticker from '../../../../assets/mt_ic_bus_sticker.webp';
import mtIcMtcMockTicket from '../../../../assets/mt_ic_bus_pass_gold.webp';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import transitMetro from '../../../../assets/3D-assets/live-journey/metro-side-view.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import helpSupportIcon from '@/resources/assets/png/help-support-icon.webp';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { OfferCard } from '@/src-v2/multimodal/components/offers/OfferCard';
import { cumulativeOfferResp } from '@/readOnly/api/types/CumulativeOfferResp.gen';

const SparkleIcon = () => {
    return (
        <Svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <Path
                d="M9.79003 4.74108L6.50163 4.04135C6.22934 3.98358 6.01589 3.77066 5.95811 3.49783L5.25839 0.209437C5.19901 -0.0698122 4.80046 -0.0698122 4.74054 0.209437L4.04082 3.49783C3.98304 3.77013 3.77013 3.98358 3.4973 4.04135L0.209437 4.74108C-0.0698122 4.80046 -0.0698122 5.199 0.209437 5.25892L3.49783 5.95865C3.77013 6.01642 3.98358 6.22934 4.04135 6.50217L4.74108 9.79056C4.80046 10.0698 5.199 10.0698 5.25892 9.79056L5.95865 6.50217C6.01642 6.22987 6.22934 6.01642 6.50217 5.95865L9.79056 5.25892C10.0698 5.19954 10.0698 4.80099 9.79056 4.74108H9.79003Z"
                fill="#7D5AF9"
            />
        </Svg>
    );
};

const SparkleYellow = () => {
    return (
        <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <Path
                d="M14.2959 2.37695C14.6887 0.546356 17.3089 0.535862 17.7012 2.37793L19.6611 11.5859V11.5869C19.7409 11.9631 20.0356 12.258 20.4121 12.3379H20.4131L29.5195 14.2754L29.623 14.2969C31.4538 14.6897 31.4637 17.3103 29.6211 17.7021L20.4141 19.6621H20.4131C20.0839 19.7318 19.8172 19.9667 19.7021 20.2764L19.6621 20.4141L17.7031 29.6221V29.623C17.3103 31.4537 14.6891 31.4642 14.2969 29.6221L12.3379 20.4141V20.4131C12.2682 20.0839 12.0333 19.8172 11.7236 19.7021L11.5859 19.6621L2.37793 17.7031H2.37695C0.546321 17.3103 0.535772 14.689 2.37793 14.2969L11.584 12.3379H11.585C11.9612 12.2582 12.256 11.9625 12.3359 11.5859L14.2959 2.37793V2.37695Z"
                fill="#F9CC22"
                stroke="#FFFFFF"
                strokeWidth="2"
            />
        </Svg>
    );
};

const CirclePurple = () => {
    return (
        <Svg width="37" height="37" viewBox="0 0 37 37" fill="none">
            <Circle cx="18.5" cy="18.5" r="16" fill="#BF83FF" stroke="white" strokeWidth="5" />
        </Svg>
    );
};

const SparkleBlue = () => {
    return (
        <Svg width="7" height="7" viewBox="0 0 7 7" fill="none">
            <Path
                d="M6.85302 3.31876L4.55114 2.82895C4.36054 2.7885 4.21112 2.63946 4.17068 2.44848L3.68087 0.146606C3.6393 -0.0488685 3.36032 -0.0488685 3.31838 0.146606L2.82857 2.44848C2.78813 2.63909 2.63909 2.7885 2.44811 2.82895L0.146606 3.31876C-0.0488685 3.36032 -0.0488685 3.6393 0.146606 3.68124L2.44848 4.17105C2.63909 4.2115 2.7885 4.36054 2.82895 4.55152L3.31876 6.85339C3.36032 7.04887 3.6393 7.04887 3.68124 6.85339L4.17105 4.55152C4.2115 4.36091 4.36054 4.2115 4.55152 4.17105L6.85339 3.68124C7.04887 3.63968 7.04887 3.3607 6.85339 3.31876H6.85302Z"
                fill="#128BFD"
            />
        </Svg>
    );
};

export const BuyBusPassCard = ({
    onBuyNow,
    offer,
}: {
    onBuyNow: () => void;
    offer: cumulativeOfferResp | undefined;
}) => {
    const { handlers, animatedStyle } = useScaleAnimation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    // const { buyBussPassOptionsSheetRef } = useRefsContext();

    const handleOnPress = () => {
        logEvent(EventName.USER_CLICKED_BUY_NOW);
        onBuyNow();
    };
    const { top } = useSafeAreaInsets();
    const navigation = useNavigation<NavigationProp<MainNavigationParamList>>();
    return (
        <HardwareBackpressHandler>
            <Animated.ScrollView contentContainerStyle={tailwind.style(`pb-[30px] pt-[${top}px]`)}>
                <Animated.View style={tailwind.style('flex-1 flex-row items-center justify-around')}>
                    <Text
                        style={tailwind.style(
                            'text-[20px] leading-[26px] font-areaNormal-extrabold text-center tracking-[-0.1px] pt-[22px] text-[#3B3A3C]',
                        )}>
                        {userLanguageStrings.ExploreCityWithPasses}
                    </Text>
                    <Pressable
                        testID="pass-help-and-support"
                        onPress={() => {
                            navigation.navigate('ProfileTab', {
                                screen: 'helpAndSupportNavigator',
                                params: {
                                    screen: 'metroIssueFaqScreen',
                                    params: { SelectedOption: 'BUS_PASS' },
                                },
                            });
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="View pass history button"
                        style={tailwind.style('flex-row items-center pt-[22px] pl-4 rounded-full')}>
                        <Image
                            accessible={true}
                            accessibilityLabel="help support icon image"
                            source={helpSupportIcon}
                            style={tailwind.style('rounded-2xl h-20px w-20px')}
                        />
                    </Pressable>
                </Animated.View>
                <Animated.View
                    style={tailwind.style(
                        'relative mx-6 items-center rounded-[36px] bg-white mt-[30px] overflow-hidden',
                    )}>
                    <Animated.View style={tailwind.style('w-full')}>
                        <Animated.Image
                            source={mtIcBusPassBg}
                            style={tailwind.style('absolute top-0 w-full h-[340px]')}
                            resizeMode="cover"
                            accessible={false}
                        />
                        <Sparkles />
                    </Animated.View>
                    <Animated.View
                        style={tailwind.style(
                            'h-8 w-8 items-center justify-center rounded-[12px] mt-[200px]',
                            `bg-[${getIconBGFromType('bus')}]`,
                        )}>
                        {getIconFromType('bus', 18, '#470F2D')}
                    </Animated.View>
                    <Text
                        style={tailwind.style(
                            'text-[18px] leading-[24px] font-areaNormal-extrabold text-center text-[#3B3A3C] pt-2',
                        )}>
                        {userLanguageStrings.BusPass}
                    </Text>
                    <Text
                        style={tailwind.style(
                            'text-[14px] leading-[24px] font-areaNormal-extrabold text-center text-[#656565] pt-1',
                        )}>
                        {userLanguageStrings.UnlimitedBusTravelForOneMonth}
                    </Text>
                    <Animated.View>
                        <Pressable
                            {...handlers}
                            accessibilityRole="button"
                            accessibilityLabel="Buy Now button"
                            onPress={handleOnPress}
                            testID="bus_pass_buy_now_button">
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        'bg-[#047AEA] flex-row gap-x-2 min-h-[58px] items-center justify-center rounded-[16px] mt-[18px]',
                                        `w-[${SCREEN_WIDTH - 48 - 60}px]`,
                                        offer ? '' : 'mb-[32px]',
                                    ),
                                    animatedStyle,
                                ]}>
                                <Svg width="17" height="18" viewBox="0 0 17 18" fill="none">
                                    <Path
                                        d="M16.509 14.6984L16.6016 3.30138C16.6016 1.47808 15.1235 0 13.3002 0L3.39604 0C1.57274 0 0.0946617 1.47808 0.0946617 3.30138L0.00208282 14.6984C0.00208282 16.5217 1.48016 17.9998 3.30346 17.9998H13.2076C15.0309 17.9998 16.509 16.5217 16.509 14.6984Z"
                                        fill="white"
                                    />
                                    <Path
                                        d="M8.58959 4.5054L9.58682 7.16988C9.61799 7.26337 9.71148 7.3257 9.80497 7.3257L12.6408 7.45035C12.8746 7.45035 12.9836 7.76199 12.7967 7.9178L10.5685 9.67854C10.4906 9.74086 10.4594 9.84994 10.4906 9.94343L11.2541 12.6858C11.3164 12.9195 11.0671 13.1065 10.8645 12.9663L8.4961 11.3925C8.41819 11.3302 8.30912 11.3302 8.21563 11.3925L5.84721 12.9663C5.64465 13.1065 5.39534 12.9195 5.45767 12.6858L6.22117 9.94343C6.25233 9.84994 6.22117 9.74086 6.14326 9.67854L3.89949 7.90222C3.71251 7.7464 3.806 7.45035 4.05531 7.43477L6.89118 7.31012C6.98467 7.31012 7.07817 7.24779 7.10933 7.1543L8.10656 4.5054C8.18447 4.28726 8.51168 4.28726 8.58959 4.5054Z"
                                        fill="#016ACD"
                                    />
                                </Svg>
                                <Text
                                    style={tailwind.style(
                                        'text-center text-white font-areaNormal-extrabold text-[15px] leading-[19px] tracking-[-0.1px]',
                                    )}>
                                    {userLanguageStrings.BuyNow}
                                </Text>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>
                    {offer ? (
                        <Animated.View style={tailwind.style('w-full px-6 mt-3 ')}>
                            <OfferCard variant="ghost" offer={offer} onPress={() => {}} />
                        </Animated.View>
                    ) : null}
                </Animated.View>
                <Animated.View>
                    <Animated.Text
                        style={tailwind.style(
                            'text-[16px] leading-[21px] font-areaNormal-extrabold tracking-[-0.1px] pt-[22px] text-[#7E7E7E] pl-6',
                        )}>
                        {userLanguageStrings.OtherPasses}
                    </Animated.Text>
                </Animated.View>
                <Animated.View
                    style={tailwind.style(
                        'flex-row items-center gap-x-2 bg-white min-h-[100px] mx-6 rounded-[24px] overflow-hidden mt-3',
                    )}>
                    <Animated.View>
                        <Animated.View>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[18px] leading-[22px] font-areaNormal-extrabold tracking-[-0.1px] text-[#3B3A3C] pl-[18px]',
                                )}>
                                {userLanguageStrings.MetroPass}
                            </Animated.Text>
                        </Animated.View>
                        <Animated.View
                            style={tailwind.style(
                                'flex-row items-center gap-x-1 bg-[#FFE688] rounded-[8px] mt-[14px] ml-6 p-2',
                            )}>
                            <Svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <Path
                                    d="M5.625 10.625C8.38642 10.625 10.625 8.38642 10.625 5.625C10.625 2.86358 8.38642 0.625 5.625 0.625C2.86358 0.625 0.625 2.86358 0.625 5.625C0.625 8.38642 2.86358 10.625 5.625 10.625Z"
                                    stroke="#3B3A3C"
                                    strokeWidth="1.25"
                                    strokeMiterlimit="10"
                                />
                                <Path
                                    d="M5.625 2.70312V5.58312C5.625 5.58312 5.641 5.62313 5.665 5.62313H8.121"
                                    stroke="#3B3A3C"
                                    strokeWidth="1.25"
                                    strokeMiterlimit="10"
                                />
                            </Svg>

                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] leading-[16px] font-areaNormal-extrabold tracking-[-0.1px] text-[#3B3A3C]',
                                )}>
                                {userLanguageStrings.ComingSoon}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                    <Animated.Image
                        source={transitMetro}
                        style={[
                            tailwind.style('w-[105px] h-[100px] absolute right-0'),
                            { transform: [{ scaleX: -1 }] },
                        ]}
                        resizeMode="cover"
                    />
                </Animated.View>
            </Animated.ScrollView>
        </HardwareBackpressHandler>
    );
};

const Sparkles = () => {
    return (
        <>
            <Animated.View style={tailwind.style('absolute top-20 left-10 z-10')}>
                <Animated.Image
                    accessible={false}
                    resizeMode="contain"
                    source={mtIcBusSticker}
                    style={tailwind.style('w-[138px] h-[75px] shadow-md')}
                />
                <Animated.View style={tailwind.style('absolute -top-3 left-2')}>
                    <SparkleYellow />
                </Animated.View>
            </Animated.View>
            <Animated.Image
                accessible={false}
                source={mtIcMtcMockTicket}
                style={[
                    tailwind.style('absolute -z-0 h-[150px] w-[150px]'),
                    {
                        transform: [
                            { scale: 1.5 },
                            { translateX: SCREEN_WIDTH / 2 - (1.5 * 175) / 2 },
                            { translateY: -50 },
                            { rotate: '-20deg' },
                        ],
                    },
                ]}
                resizeMode="contain"
            />
            <Animated.View style={tailwind.style('absolute top-3 right-14')}>
                <SparkleYellow />
            </Animated.View>
            <Animated.View style={tailwind.style('absolute top-10 left-5')}>
                <SparkleIcon />
            </Animated.View>
            <Animated.View style={tailwind.style('absolute top-30 right-12')}>
                <SparkleBlue />
            </Animated.View>
            <Animated.View style={tailwind.style('absolute top-23 right-15')}>
                <CirclePurple />
            </Animated.View>
        </>
    );
};
