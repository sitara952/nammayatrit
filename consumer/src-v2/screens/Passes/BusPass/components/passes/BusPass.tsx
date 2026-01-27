import mtIcMtcPlatinumLogo from '../../../../../assets/mt_ic_mtc_platinum_logo.webp';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import MaskedView from '@react-native-masked-view/masked-view';
import { useEffect, useRef, useState, useCallback } from 'react';
import { ImageBackground, Text, View, Modal, Platform, ActivityIndicator } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { default as FallbackQRCode } from 'react-native-qrcode-svg';
import Animated, {
    Easing,
    SensorType,
    useAnimatedSensor,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import Svg, { Line, Path } from 'react-native-svg';
import mtIcBusFrameGold from '../../../../../assets/mt_ic_bus_frame.webp';
import mtIcBusPassDiamond from '../../../../../assets/mt_ic_bus_pass_diamond.webp';
import mtIcBusPassGold from '../../../../../assets/mt_ic_bus_pass_gold.webp';
import mtIcBusPassGradientMask from '../../../../../assets/mt_ic_bus_pass_gradient_mask.webp';
import mtIcBusPassSilverMask from '../../../../../assets/mt_ic_silver_mask_bg.webp';
import PassSvgNew from './PassSvgNew';
import mtIcBusPassStampGold from '../../../../../assets/mt_ic_bus_pass_stamp.webp';
import mtIcBusPassBGStamp from '../../../../../assets/mt_ic_bus_pass_stamp_bg.webp';
import mtIcChennaiDotsMap from '../../../../../assets/mt_ic_chennai_dots_map.webp';
import mtIcBusFrameDiamond from '../../../../../assets/mt_ic_diamond_bus_frame.webp';
import mtIcBusPassStampDiamond from '../../../../../assets/mt_ic_diamond_pass_approved_stamp.webp';
import mtIcMTCStampDiamond from '../../../../../assets/mt_ic_mtc_diamond_stamp.webp';
import mtIcMTCStampGold from '../../../../../assets/mt_ic_mtc_stamp.webp';
import BusPassTermsAndConditionsSheet from '../BusPassTermsAndConditionsSheet';
import { DeviceSwitchFlow } from '../DeviceSwitchFlow';
import { PreBookedPassCard } from '../PreBookedPassCard';
import type { purchasedPassTransactionAPIEntity } from '@/readOnly/api/types/PurchasedPassTransactionAPIEntity.gen';
const AnimatedMaskedView = Animated.createAnimatedComponent(MaskedView);
import { logEvent, EventName } from '@/typescript/utils/logger';
import { UlaaActiveTicket } from '@/src-v2/multimodal/components/UlaaActiveTicket';

export interface BusPassProps {
    passNo: string;
    passCode: string;
    profileImageUri: string;
    isGoldPass: boolean;
    daysToExpire: number;
    fleetNo: string;
    amount: number;
    validTill: Date | number;
    qrValue: string | undefined;
    isPreBooked: boolean;
    isExpired: boolean;
    onVerifyPress: () => void;
    onRefetchPassData: () => void;
    onRenewPress: () => void;
    validFrom: Date | number;
    showDeviceSwitchFlow?: boolean;
    onDeviceSwitchComplete?: () => void;
    onBuyNewPass: () => void;
    onSwitchConfirm: () => Promise<void>;
    deviceSwitchAllowed: boolean;
    isDeviceSwitchPolling?: boolean;
    futureRenewals?: purchasedPassTransactionAPIEntity[];
    onPreBookedPassPress: () => void;
    isVerifyLoading?: boolean;
    isPhotoPending?: boolean;
    onUploadPhotoPress?: () => void;
    purchasedPassId?: string;
    useNewSvg?: boolean;
    isAutoVerified?: boolean;
    onActivateTodayPress: () => void;
}

const BackgroundMasked = ({
    shouldAnimate = true,
    isGoldPass = true,
}: {
    shouldAnimate: boolean;
    isGoldPass: boolean;
}) => {
    const rotate = useSharedValue(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [isMaskLoaded, setIsMaskLoaded] = useState(false);

    // Use gyroscope sensor - only instantiate after image loads
    const { sensor, isAvailable } = useAnimatedSensor(SensorType.ROTATION, {
        interval: 'auto',
    });

    const reduceMotion = useReducedMotion();
    //
    // Now inside useAnimatedStyle (or rendering logic):
    const useSensor = isAvailable && !reduceMotion && shouldAnimate;

    useEffect(() => {
        if (!useSensor) {
            rotate.value = withRepeat(withTiming(360, { duration: 7500, easing: Easing.inOut(Easing.ease) }), -1, true);
        }
    }, [useSensor]);

    const sensorAnimatedStyle = useAnimatedStyle(() => {
        // Only use sensor if image is loaded, sensor is available, and motion is not reduced
        const shouldUseSensor = isAvailable && !reduceMotion && shouldAnimate;
        if (!shouldUseSensor) {
            return {
                transform: [{ rotate: `${rotate.value}deg` }],
            };
        }
        const { qw, qx, qy, qz } = sensor.value;
        // Roll (left/right tilt)
        const sinr_cosp = 2 * (qw * qy + qz * qx);
        const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);

        // Pitch (up/down tilt)
        const sinp = 2 * (qw * qx - qy * qz);
        const pitch = Math.abs(sinp) >= 1 ? (Math.sign(sinp) * Math.PI) / 2 : Math.asin(sinp);

        // Combine both into a single Z rotation
        const combined = (roll - pitch) * (180 / Math.PI); // scale down if needed
        return {
            transform: [{ rotate: `${combined + 1080}deg` }],
        };
    }, [isImageLoaded, shouldAnimate, isAvailable, reduceMotion]);

    return (
        <AnimatedMaskedView
            key={`${isMaskLoaded}-${isImageLoaded}`}
            style={tailwind.style('w-full absolute inset-0 w-full z-10 overflow-hidden')}
            maskElement={
                <Animated.Image
                    resizeMode="cover"
                    source={mtIcChennaiDotsMap}
                    onLoad={() => setIsMaskLoaded(true)}
                    style={[tailwind.style('absolute inset-0 z-0', `h-full w-full`)]}
                />
            }>
            <Animated.Image
                source={isGoldPass ? mtIcBusPassGradientMask : mtIcBusPassSilverMask}
                style={[
                    tailwind.style('h-[540px] w-[540px] absolute inset-0 z-0'),
                    { marginLeft: -75, marginTop: 0 },
                    sensorAnimatedStyle,
                ]}
                resizeMode="cover"
                onLoad={() => setIsImageLoaded(true)}
            />
        </AnimatedMaskedView>
    );
};

export const BusPass = ({
    passNo,
    passCode,
    profileImageUri,
    amount,
    validTill,
    daysToExpire,
    isGoldPass,
    fleetNo,
    qrValue,
    isPreBooked,
    isExpired,
    onVerifyPress,
    onRefetchPassData,
    onRenewPress,
    validFrom,
    showDeviceSwitchFlow = false,
    onDeviceSwitchComplete,
    onBuyNewPass,
    onSwitchConfirm,
    deviceSwitchAllowed: DeviceSwitchAllowed,
    isDeviceSwitchPolling = false,
    futureRenewals = [],
    onPreBookedPassPress,
    isVerifyLoading = false,
    isPhotoPending = false,
    onUploadPhotoPress,
    onActivateTodayPress,
}: BusPassProps) => {
    // Check if this is an Ulaa pass
    const isUlaaPass = passCode === 'ULLA1DAY';
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [visible, setVisible] = useState(false);
    const [showDeviceSwitch, setShowDeviceSwitch] = useState(showDeviceSwitchFlow);
    const [showImageZoom, setShowImageZoom] = useState(false);
    const [showBannerZoom, setShowBannerZoom] = useState(false);
    const [showQRZoom, setShowQRZoom] = useState(false);
    const [showDateTimeZoom, setShowDateTimeZoom] = useState(false);
    const expiredDays = daysToExpire * -1;

    useEffect(() => {
        setShowDeviceSwitch(showDeviceSwitchFlow);
    }, [showDeviceSwitchFlow]);
    // Format validTill timestamp to "DD.MM.YYYY" format
    const validTillDate = typeof validTill === 'number' ? new Date(validTill) : validTill;
    const validTillFormatted = `${String(validTillDate.getDate()).padStart(2, '0')}/${String(validTillDate.getMonth() + 1).padStart(2, '0')}/${validTillDate.getFullYear()}`;

    const validFromDate = typeof validFrom === 'number' ? new Date(validFrom) : validFrom;
    const validFromFormatted = `${String(validFromDate.getDate()).padStart(2, '0')}/${String(validFromDate.getMonth() + 1).padStart(2, '0')}/${validFromDate.getFullYear()}`;

    const remainingDaysText = null;

    const handleOpenTermsAndConditions = useCallback(() => {
        setVisible(true);
    }, [setVisible]);

    const handleDeviceSwitchClose = () => {
        setShowDeviceSwitch(false);
    };

    const handleDeviceSwitchComplete = () => {
        onDeviceSwitchComplete?.();
    };

    const handleBuyNewPass = () => {
        onBuyNewPass?.();
    };

    const renderPassCard = () => (
        <ImageBackground
            source={isGoldPass ? mtIcBusFrameGold : mtIcBusFrameDiamond}
            resizeMode="contain"
            style={tailwind.style('flex-col items-center justify-center mt-[40px] w-[160px] h-[290px]')}>
            {isPreBooked || isPhotoPending ? (
                <View style={tailwind.style('absolute z-20 inset-0 bg-[#141414] opacity-60 rounded-[45px]')} />
            ) : null}
            {!isPreBooked && !isPhotoPending ? (
                <Animated.View style={tailwind.style('items-center justify-center')}>
                    <Pressable
                        testID="profile-image-zoom"
                        onPress={() => setShowImageZoom(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Zoom profile image">
                        <View
                            style={tailwind.style(
                                'w-[108px] h-[108px] bg-gray-200 rounded-[20px] overflow-hidden mt-3',
                            )}>
                            <Animated.Image
                                source={{ uri: profileImageUri }}
                                style={tailwind.style('w-full h-full')}
                                resizeMode="cover"
                            />
                        </View>
                    </Pressable>
                    <Animated.View style={tailwind.style('items-center justify-center pt-[14px]')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[#313131] text-center text-[26px] leading-[28px] font-areaNormal-extrabold',
                            )}>
                            <Animated.Text style={tailwind.style('font-inter-semibold')}>₹</Animated.Text>
                            {amount}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={tailwind.style('w-[125px] pt-2.5')}>
                        <Svg height={1}>
                            <Line
                                strokeDasharray="5.2, 7"
                                x1={0}
                                x2={SCREEN_WIDTH}
                                y1={1}
                                y2={1}
                                stroke="#EDEDED"
                                strokeWidth="2"
                            />
                        </Svg>
                    </Animated.View>
                    <Animated.View style={tailwind.style('pt-[14px]')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[#969696] text-center text-[12px] leading-[15px] uppercase tracking-[2px] font-areaNormal-extrabold',
                            )}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}>
                            {userLanguageStrings.ValidForTill(remainingDaysText || '')}
                        </Animated.Text>
                    </Animated.View>
                    <Animated.View style={tailwind.style('pt-2.5')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[#313131] text-center text-[18px] leading-[24px] tracking-[0.42px] font-areaNormal-extrabold pb-3',
                            )}
                            adjustsFontSizeToFit={true}
                            numberOfLines={1}>
                            {validTillFormatted}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            ) : null}
            {isPreBooked || isPhotoPending ? (
                <Animated.View style={tailwind.style('items-center justify-center px-5')}>
                    <Animated.View style={tailwind.style('items-center justify-center')}>
                        <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                            <Path
                                d="M10.3984 14.4008V10.4008C10.3984 7.30798 12.9056 4.80078 15.9984 4.80078C19.0912 4.80078 21.5984 7.30798 21.5984 10.4008V14.4008"
                                stroke="#3B3A3C"
                                strokeWidth="3.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <Path
                                d="M22.3969 12.8008H9.59688C6.95 12.8008 4.79688 14.9539 4.79688 17.6008V24.0008C4.79688 26.6477 6.95 28.8008 9.59688 28.8008H22.3969C25.0438 28.8008 27.1969 26.6477 27.1969 24.0008V17.6008C27.1969 14.9539 25.0438 12.8008 22.3969 12.8008ZM17.5969 21.6008C17.5969 22.4843 16.8812 23.2008 15.9969 23.2008C15.1126 23.2008 14.3969 22.4843 14.3969 21.6008V20.0008C14.3969 19.1173 15.1126 18.4008 15.9969 18.4008C16.8812 18.4008 17.5969 19.1173 17.5969 20.0008V21.6008Z"
                                fill="#3B3A3C"
                            />
                        </Svg>
                    </Animated.View>
                    <Text
                        style={tailwind.style(
                            'text-[#313131] text-center text-[18px] leading-[21px] tracking-[0.42px] font-areaNormal-extrabold pt-3',
                        )}>
                        {isPhotoPending ? userLanguageStrings.UploadPhoto : userLanguageStrings.UpcomingPass}
                    </Text>
                    <Text
                        style={tailwind.style(
                            'text-[#969696] text-center text-[12px] leading-[15px] uppercase tracking-[2px] font-areaNormal-extrabold pt-7',
                        )}>
                        {userLanguageStrings.ValidOnlyFrom}
                    </Text>
                    <Animated.View style={tailwind.style('pt-2.5')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[#F73812] text-center text-[20px] leading-[24px] tracking-[0.42px] font-areaNormal-extrabold',
                            )}>
                            {validFromFormatted}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            ) : null}
        </ImageBackground>
    );

    const handleVerifyOrRefresh = () => {
        if (isPhotoPending) {
            onUploadPhotoPress?.();
        } else if (isPreBooked) {
            onRefetchPassData();
        } else {
            onVerifyPress();
        }
    };

    // Render UlaaActiveTicket for Ulaa passes
    if (isUlaaPass) {
        const validTillDateForUlaa = typeof validTill === 'number' ? new Date(validTill) : validTill;
        const ulaaDate = `${String(validTillDateForUlaa.getDate()).padStart(2, '0')}'${validTillDateForUlaa.toLocaleString('en-US', { month: 'short' }).toUpperCase()}`;
        const ulaaTime = validTillDateForUlaa.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        });

        return (
            <View style={tailwind.style('h-full items-center bg-[#060606] pt-6')}>
                <UlaaActiveTicket date={ulaaDate} time={ulaaTime} price={amount} ticketName="Chennai Ula Ticket" />
            </View>
        );
    }

    return (
        <>
            <View style={tailwind.style('flex-row justify-center items-center bg-[#060606] h-[540px] overflow-hidden')}>
                <ImageBackground
                    source={isGoldPass ? mtIcBusPassGold : mtIcBusPassDiamond}
                    resizeMode="cover"
                    style={[tailwind.style('h-[540px] relative overflow-hidden', { aspectRatio: 0.6694 })]}>
                    <Animated.View
                        style={tailwind.style('absolute inset-0  items-center justify-center overflow-hidden')}>
                        <BackgroundMasked shouldAnimate={!isPreBooked && !isPhotoPending} isGoldPass={isGoldPass} />
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex-1 justify-between')}>
                        <View style={tailwind.style('flex-col items-center justify-center')}>
                            <Text
                                style={tailwind.style(
                                    'text-[#262626] text-center text-[18px] font-led-dot-matrix pt-1.5 mt-4',
                                )}>
                                {userLanguageStrings.PassNo}: {passNo}
                            </Text>
                            <Text
                                style={tailwind.style(
                                    'text-[#262626] text-center text-[12px] font-anekTamil-regular mt-1',
                                )}>
                                விருப்பம் போல் பயணம் {'\n'}செய்ய மாதச்சலுகை சீட்டு
                            </Text>
                            {isPreBooked || isPhotoPending ? (
                                <View
                                    style={tailwind.style(
                                        'flex-col items-center justify-center mt-[40px] w-[160px] h-[290px]',
                                    )}
                                />
                            ) : (
                                renderPassCard()
                            )}
                            <Stamp isGoldPass={isGoldPass} shouldAnimate={!isPreBooked && !isPhotoPending} />
                        </View>
                        {!isPreBooked && !isPhotoPending ? (
                            <Animated.View style={tailwind.style('flex-row items-center justify-between px-5 pb-12')}>
                                <Pressable
                                    testID="datetime-zoom"
                                    onPress={() => setShowDateTimeZoom(true)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Zoom datetime">
                                    <CurrentDateTime isZoomed={false} />
                                </Pressable>
                                <Pressable
                                    testID="qr-zoom"
                                    onPress={() => setShowQRZoom(true)}
                                    accessibilityRole="button"
                                    accessibilityLabel="Zoom QR code">
                                    <BusQR passNo={passNo} passId={qrValue} />
                                </Pressable>
                            </Animated.View>
                        ) : null}
                    </Animated.View>

                    <Animated.View style={tailwind.style('items-center justify-center z-30')}>
                        {fleetNo ? (
                            <Pressable
                                testID="banner-zoom"
                                onPress={() => setShowBannerZoom(true)}
                                accessibilityRole="button"
                                accessibilityLabel="Zoom activated banner"
                                style={tailwind.style('absolute bottom-5 left-1/3 z-50 rotate-[-10deg]')}>
                                <PassSvgNew
                                    width={150}
                                    height={100}
                                    rotation={5}
                                    fleetNo={fleetNo || undefined}
                                    showBig={false}
                                />
                            </Pressable>
                        ) : (
                            <Animated.Image
                                source={isGoldPass ? mtIcMTCStampGold : mtIcMTCStampDiamond}
                                style={tailwind.style('h-[104px] w-[105px] absolute bottom-[33px]')}
                            />
                        )}
                    </Animated.View>

                    {/* Expired Pass Overlay */}
                    {isExpired || isPreBooked || isPhotoPending ? (
                        <>
                            {Platform.OS === 'android' ? (
                                <Animated.View
                                    style={tailwind.style('absolute inset-0 rounded-[36px] bg-[#141414] opacity-90 ')}
                                    testID="android-blur-view"
                                    accessibilityLabel="Android Blur View"
                                />
                            ) : (
                                <BlurView
                                    style={tailwind.style('absolute inset-0 rounded-[36px] bg-[#A2A2A2]/30')}
                                    blurAmount={65}
                                    blurType="dark"
                                />
                            )}
                        </>
                    ) : null}

                    {/* Platinum Logo Overlay */}
                    {!isGoldPass ? (
                        <Animated.View style={tailwind.style('absolute top-4 left-4 z-20')}>
                            <Animated.Image
                                source={mtIcMtcPlatinumLogo}
                                style={[tailwind.style('h-[53px]'), { aspectRatio: 1.2326 }]}
                            />
                        </Animated.View>
                    ) : null}

                    {/* PreBooked Pass Card Overlay */}
                    {(isPreBooked || isPhotoPending) && !showDeviceSwitchFlow ? (
                        <View style={tailwind.style('absolute inset-0 z-20')} pointerEvents="box-none">
                            <View style={tailwind.style('flex-1 justify-between')} pointerEvents="box-none">
                                <View
                                    style={tailwind.style('flex-col items-center justify-center')}
                                    pointerEvents="box-none">
                                    <Text
                                        style={tailwind.style(
                                            'text-transparent text-center text-[18px] font-led-dot-matrix pt-1.5 mt-4',
                                        )}>
                                        {userLanguageStrings.PassNo}: {passNo}
                                    </Text>
                                    <Text
                                        style={tailwind.style(
                                            'text-transparent text-center text-[12px] font-anekTamil-regular mt-1',
                                        )}>
                                        விருப்பம் போல் பயணம் {'\n'}செய்ய மாதச்சலுகை சீட்டு
                                    </Text>
                                    {renderPassCard()}
                                </View>
                            </View>
                        </View>
                    ) : null}

                    {/* Terms and Conditions Overlay */}
                    <Animated.View
                        style={tailwind.style(
                            `absolute left-0 right-0 bottom-[10px] items-center ${(isPreBooked || isPhotoPending) && !showDeviceSwitchFlow ? 'z-20 ' : 'z-0'}`,
                        )}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Open Terms and Conditions"
                            onPress={handleOpenTermsAndConditions}
                            testID="open_bus_pass_terms_and_conditions">
                            <Text
                                style={tailwind.style(
                                    `${isPreBooked || isPhotoPending ? 'text-[#d5d5d5]' : 'text-[#3B3A3C]'} text-center text-[12px] font-areaNormal-extrabold underline`,
                                )}
                                numberOfLines={1}
                                adjustsFontSizeToFit={true}>
                                {userLanguageStrings.TermsandConditions}
                            </Text>
                        </Pressable>
                    </Animated.View>

                    {isExpired ? (
                        <Animated.View style={tailwind.style('absolute inset-0 rounded-[36px] z-20 p-5')}>
                            <Animated.View style={tailwind.style('items-center justify-center flex-1')}>
                                <Animated.View
                                    style={tailwind.style('justify-center rounded-[20px] bg-[#FFFFFF] p-[20px]')}>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[#313131] text-center text-[20px] font-areaNormal-extrabold',
                                        )}>
                                        {userLanguageStrings.PassExpired}
                                    </Animated.Text>
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[#313131] text-center text-[14px] font-areaNormal-extrabold px-6 text-[#7E7E7E] pt-[18px]',
                                        )}>
                                        {userLanguageStrings.YourPassHasExpiredPleaseRenewForUninterruptedService(
                                            expiredDays,
                                        )}
                                    </Animated.Text>
                                    <Pressable
                                        testID="renew-now-button"
                                        onPress={onRenewPress}
                                        accessibilityRole="button"
                                        accessibilityLabel="Renew Now"
                                        style={tailwind.style(
                                            'bg-[#047AEA] rounded-[10px] mt-5 min-h-[50px] items-center justify-center',
                                        )}>
                                        <Text
                                            style={tailwind.style(
                                                'text-white text-center text-[14px] font-areaNormal-extrabold',
                                            )}>
                                            {userLanguageStrings.RenewNow}
                                        </Text>
                                    </Pressable>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>
                    ) : null}

                    <DeviceSwitchFlow
                        isVisible={showDeviceSwitch}
                        onClose={handleDeviceSwitchClose}
                        onSwitchComplete={handleDeviceSwitchComplete}
                        onBuyNewPass={handleBuyNewPass}
                        onSwitchConfirm={onSwitchConfirm}
                        deviceSwitchAllowed={DeviceSwitchAllowed}
                        isPolling={isDeviceSwitchPolling}
                        showTerms={setVisible}
                    />
                </ImageBackground>
            </View>

            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Verify Bus Pass button"
                testID="bus_pass_verify_button"
                disabled={showDeviceSwitchFlow || isExpired || isVerifyLoading}
                onPress={handleVerifyOrRefresh}
                style={tailwind.style(`mt-6 justify-center items-center`)}>
                <Animated.View
                    style={tailwind.style(
                        `bg-[#313131] w-[${SCREEN_WIDTH - 48}px] rounded-[16px] h-[56px] flex-row items-center justify-center`,
                        showDeviceSwitchFlow || (isExpired && 'opacity-50'),
                    )}>
                    {isVerifyLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Animated.Text
                            style={tailwind.style('text-[#FFFFFF] text-center text-[16px] font-areaNormal-extrabold')}>
                            {isPhotoPending
                                ? userLanguageStrings.UploadPhoto
                                : isPreBooked || isExpired
                                  ? userLanguageStrings.Refresh
                                  : userLanguageStrings.VerifyThroughBusOTPQR}
                        </Animated.Text>
                    )}
                </Animated.View>
            </Pressable>
            {isPreBooked && !showDeviceSwitchFlow && (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Activate Bus Pass button"
                    testID="bus_pass_activation_button"
                    onPress={onActivateTodayPress}
                    style={tailwind.style(`mt-[10px] justify-center items-center`)}>
                    <Animated.View
                        style={tailwind.style(
                            `w-[${SCREEN_WIDTH - 48}px] rounded-[16px] h-[56px] flex-row items-center justify-center`,
                        )}>
                        <Animated.Text
                            style={tailwind.style('text-[#FFFFFF] text-center text-[16px] font-areaNormal-extrabold')}>
                            Activate Today
                        </Animated.Text>
                    </Animated.View>
                </Pressable>
            )}
            {futureRenewals && futureRenewals.length > 0 && futureRenewals[0]?.startDate ? (
                <View style={tailwind.style('mt-5')}>
                    <PreBookedPassCard
                        activeFrom={new Date(futureRenewals[0].startDate)}
                        isGoldenPass={futureRenewals[0].passCode === 'GOLD1000'}
                        handleOnPress={onPreBookedPassPress}
                    />
                </View>
            ) : (
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Renew Bus Pass button"
                    testID="bus_pass_renew_button"
                    onPress={() => {
                        logEvent(EventName.USER_CLICKED_RENEW_BUS_PASS);
                        onRenewPress();
                    }}
                    style={tailwind.style(`justify-center items-center`)}>
                    <Animated.View
                        style={tailwind.style(
                            `w-[${SCREEN_WIDTH - 48}px] rounded-[16px] h-[56px] flex-row items-center justify-center`,
                        )}>
                        <Animated.Text
                            style={tailwind.style('text-[#FFFFFF] text-center text-[16px] font-areaNormal-extrabold')}>
                            {userLanguageStrings.Renew}
                        </Animated.Text>
                    </Animated.View>
                </Pressable>
            )}

            <BusPassTermsAndConditionsSheet visible={visible} setVisible={setVisible} isGoldPass={isGoldPass} />
            {/* Image Zoom Modal */}
            <Modal
                visible={showImageZoom}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowImageZoom(false)}>
                <Pressable
                    testID="image-zoom-backdrop"
                    style={tailwind.style('flex-1 bg-black/90 items-center justify-center')}
                    onPress={() => setShowImageZoom(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close zoomed image">
                    <View style={tailwind.style('w-[90%] aspect-square bg-white rounded-[20px] overflow-hidden')}>
                        <Animated.Image
                            source={{ uri: profileImageUri }}
                            style={tailwind.style('w-full h-full')}
                            resizeMode="contain"
                        />
                    </View>
                </Pressable>
            </Modal>

            {/* Banner Zoom Modal */}
            <Modal
                visible={showBannerZoom}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowBannerZoom(false)}>
                <Pressable
                    testID="banner-zoom-backdrop"
                    style={tailwind.style('flex-1 bg-black/90 items-center justify-center')}
                    onPress={() => setShowBannerZoom(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close zoomed banner">
                    <PassSvgNew
                        width={400}
                        height={150}
                        rotation={undefined}
                        fleetNo={fleetNo || undefined}
                        showBig={true}
                    />
                </Pressable>
            </Modal>

            {/* DateTime Zoom Modal */}
            <Modal
                visible={showDateTimeZoom}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDateTimeZoom(false)}>
                <Pressable
                    testID="datetime-zoom-backdrop"
                    style={tailwind.style('flex-1 bg-black/90 items-center justify-center')}
                    onPress={() => setShowDateTimeZoom(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close zoomed datetime">
                    <View style={tailwind.style('bg-white rounded-[20px] p-6')}>
                        <CurrentDateTime isZoomed={true} />
                    </View>
                </Pressable>
            </Modal>

            {/* QR Zoom Modal */}
            <Modal
                visible={showQRZoom}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowQRZoom(false)}>
                <Pressable
                    testID="qr-zoom-backdrop"
                    style={tailwind.style('flex-1 bg-black/90 items-center justify-center')}
                    onPress={() => setShowQRZoom(false)}
                    accessibilityRole="button"
                    accessibilityLabel="Close zoomed QR">
                    <View style={tailwind.style('bg-[#E6DDC1] rounded-[20px] p-2')}>
                        <BusQR passNo={passNo} passId={qrValue} size={250} />
                    </View>
                </Pressable>
            </Modal>
        </>
    );
};

const Stamp = ({ isGoldPass = true, shouldAnimate = true }: { isGoldPass: boolean; shouldAnimate: boolean }) => {
    const rotate = useSharedValue(0);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Use gyroscope sensor - only instantiate after image loads
    const { sensor, isAvailable } = useAnimatedSensor(SensorType.ROTATION, {
        interval: 'auto',
    });

    const reduceMotion = useReducedMotion();
    //
    // Now inside useAnimatedStyle (or rendering logic):
    const useSensor = isAvailable && !reduceMotion && shouldAnimate;
    useEffect(() => {
        if (!useSensor) {
            rotate.value = withRepeat(withTiming(360, { duration: 7500, easing: Easing.inOut(Easing.ease) }), -1, true);
        }
    }, [useSensor]);

    const sensorAnimatedStyle = useAnimatedStyle(() => {
        // Only use sensor if image is loaded, sensor is available, and motion is not reduced
        const shouldUseSensor = isAvailable && !reduceMotion && shouldAnimate;
        if (!shouldUseSensor) {
            return {
                transform: [{ rotate: `${rotate.value}deg` }],
            };
        }
        const { qw, qx, qy, qz } = sensor.value;
        // Roll (left/right tilt)
        const sinr_cosp = 2 * (qw * qy + qz * qx);
        const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);

        // Pitch (up/down tilt)
        const sinp = 2 * (qw * qx - qy * qz);
        const pitch = Math.abs(sinp) >= 1 ? (Math.sign(sinp) * Math.PI) / 2 : Math.asin(sinp);

        // Combine both into a single Z rotation
        const combined = (roll - pitch) * (180 / Math.PI); // scale down if needed
        return {
            transform: [{ rotate: `${combined + 360}deg` }],
        };
    }, [isImageLoaded, shouldAnimate, isAvailable, reduceMotion]);

    return (
        <Animated.View
            style={[tailwind.style('h-[110px] w-[110px] absolute right-4 top-[95px] -z-10 overflow-hidden')]}>
            {isGoldPass ? (
                <Animated.Image
                    source={mtIcBusPassBGStamp}
                    style={[tailwind.style('h-[110px] w-[110px]'), sensorAnimatedStyle]}
                    resizeMode="contain"
                    onLoad={() => setIsImageLoaded(true)}
                />
            ) : null}
            <Animated.Image
                source={isGoldPass ? mtIcBusPassStampGold : mtIcBusPassStampDiamond}
                style={tailwind.style('h-full w-full absolute')}
                resizeMode="contain"
            />
        </Animated.View>
    );
};

interface BusQRProps {
    passNo: string;
    passId?: string;
    size?: number;
}

export const BusQR = ({ passNo, passId, size = 46 }: BusQRProps) => {
    const [currentTimestamp, setCurrentTimestamp] = useState(Date.now());

    // Set up timestamp refresh mechanism
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTimestamp(Date.now());
        }, 5000); // refresh every second

        return () => clearInterval(interval);
    }, []);

    const qrCodeValue = passId ? `${passId}_${currentTimestamp}` : JSON.stringify({ passNo });

    return (
        <Animated.View
            style={tailwind.style(
                `h-[${size + 16}px] w-[${size + 16}px] bg-[#E6DDC1] rounded-[10px] items-center justify-center`,
            )}>
            <FallbackQRCode backgroundColor="#E6DDC1" value={qrCodeValue} size={size} />
        </Animated.View>
    );
};

interface CurrentDateTimeProps {
    isZoomed: boolean;
}

export const CurrentDateTime = ({ isZoomed = false }: CurrentDateTimeProps) => {
    const [currentDateTime, setCurrentDateTime] = useState<Date>(new Date());
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        const updateDateTime = () => {
            setCurrentDateTime(new Date());
        };

        // Update immediately
        updateDateTime();

        // Set up interval to update every second
        intervalRef.current = setInterval(updateDateTime, 1000);

        // Cleanup interval on unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };
    }, []);

    const formattedDate = currentDateTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    const formattedTime = currentDateTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const containerStyle = isZoomed ? 'bg-white w-[184px] h-[108px]' : 'bg-white w-[92px] h-13.5';
    const dateStyle = isZoomed ? 'text-[24px]' : 'text-[12px]';
    const timeStyle = isZoomed ? 'text-[34px]' : 'text-[15px]';

    return (
        <Animated.View style={tailwind.style(`${containerStyle} items-center justify-center rounded-[10px]`)}>
            <Animated.Text style={tailwind.style(`text-[#262626] text-center ${dateStyle} font-departureMono-regular`)}>
                {formattedDate}
            </Animated.Text>
            <Animated.Text
                style={tailwind.style(`text-[#262626] text-center ${timeStyle} font-departureMono-regular pt-0.5`)}
                numberOfLines={1}
                adjustsFontSizeToFit={true}>
                {formattedTime}
            </Animated.Text>
        </Animated.View>
    );
};
