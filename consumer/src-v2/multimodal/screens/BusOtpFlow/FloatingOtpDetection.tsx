import BusOtpCard from '@/src-v2/assets/mt_ic_bus_otp_card.webp';
import BusOtpScreen from './BusOtpScreen';
import { Icon } from '@/typescript/components/Icon';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import React, { useEffect, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import CrossIcon from '../../../assets/svg/CrossIcon';
import { BusOtpAction } from './Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

interface FloatingOtpDetectionProps {
    visible?: boolean;
    isAutoDetect: boolean;
    mpDispatch: (action: BusOtpAction) => void;
}

const FloatingOtpDetection: React.FC<FloatingOtpDetectionProps> = ({
    visible = true,
    isAutoDetect = false,
    mpDispatch,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [isVisible, setIsVisible] = useState(true);
    const translateX = useSharedValue(-100);
    const opacity = useSharedValue(1);
    const [showBusOtpScreen, setShowBusOtpScreen] = useState(false);
    const scanOtpRef = useRef(true);

    useEffect(() => {
        setTimeout(() => {
            isAutoDetect && setShowBusOtpScreen(true);
        }, 3000);
    }, []);

    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const animatedProgressStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    useEffect(() => {
        if (!visible || !isVisible) return;

        translateX.value = withRepeat(
            withSequence(withTiming(SCREEN_WIDTH - 60, { duration: 1500 }), withTiming(-140, { duration: 0 })),
            -1, // infinite repeat
            false,
        );

        return () => {
            translateX.value = -100;
        };
    }, [visible, isVisible]);

    const onClose = () => {
        opacity.value = withTiming(0, { duration: 300 }, () => {
            runOnJS(setIsVisible)(false);
        });
    };

    if (!visible || !isVisible) return null;

    return (
        <View style={tailwind.style('w-full px-4')}>
            <Animated.View
                style={[
                    tailwind.style(
                        `absolute bottom-0 right-4 z-50 w-full ${isAutoDetect ? 'bg-[#3B3A3C]' : 'bg-[#FFE486]'} rounded-[24px]  pt-[14px] pl-[14px] pb-[14px] pr-[18px]`,
                    ),
                    animatedContainerStyle,
                ]}>
                {/* Close button */}
                {isAutoDetect ? (
                    <TouchableOpacity
                        testID="close-button"
                        accessibilityRole="button"
                        onPress={onClose}
                        style={tailwind.style('absolute top-0 right-1 z-10  items-center justify-center p-1')}>
                        <Icon icon={<CrossIcon />} size={13} color="white" />
                    </TouchableOpacity>
                ) : (
                    ''
                )}
                <View style={tailwind.style(' flex-row items-center  gap-[10px]')}>
                    {/* Credit card icon with blue background */}
                    <View style={tailwind.style('')}>
                        <Animated.Image
                            accessible={false}
                            source={BusOtpCard}
                            style={tailwind.style('w-[73px] h-[43px] ')}
                        />
                    </View>

                    {/* Text content */}
                    <View style={tailwind.style('flex-1 max-w-[197px]')}>
                        <Text
                            style={tailwind.style(
                                `${isAutoDetect ? 'text-white' : 'text-[#3B3A3C]'}  text-[13px] font-areaNormal-extrabold leading-[20px]`,
                            )}>
                            {isAutoDetect
                                ? userLanguageStrings.AutoDetectingBusOTP
                                : userLanguageStrings.EnterBusOTPToActivateTicket}
                        </Text>
                    </View>
                    {!isAutoDetect ? (
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Activate button"
                            testID="auto-detect-button"
                            onPress={() => setShowBusOtpScreen(true)}
                            style={tailwind.style('bg-[#F6F6F6] rounded-[13px] px-[16px] py-[13px]')}>
                            <Text style={tailwind.style('text-[#047AEA] font-areaNormal-extrabold text-[13px]')}>
                                {userLanguageStrings.Activate}
                            </Text>
                        </Pressable>
                    ) : (
                        ''
                    )}
                </View>
                {isAutoDetect ? (
                    <View style={tailwind.style('rounded-b-2xl mt-4')}>
                        <View style={tailwind.style('bg-gray-600 h-[7px] rounded-full overflow-hidden')}>
                            <Animated.View
                                style={[tailwind.style('bg-white h-full w-2/5 rounded-full'), animatedProgressStyle]}
                            />
                        </View>
                    </View>
                ) : (
                    ''
                )}
            </Animated.View>
            {showBusOtpScreen && (
                <BusOtpScreen
                    onScanQrPress={() => {}}
                    isError={false}
                    onOtpComplete={() => {}}
                    autoFillOtp={undefined}
                    autoFillOtpFromDeepLink={undefined}
                    isScanOtp={false}
                    type="Activate"
                    legInfo={undefined}
                    journeyId=""
                    legOrder={0}
                    subLegOrder={0}
                    mpDispatch={mpDispatch}
                    isLoading={undefined}
                    setIsWrongOtp={undefined}
                    isOtpScreen={true}
                    setIsSuccess={undefined}
                    isSuccess={undefined}
                    scanOtpRef={scanOtpRef}
                    displaySearchBar={false}
                    recentSearches={undefined}
                    suggestions={undefined}
                    loadingSuggestions={false}
                    searchPublicTransport={undefined}
                    onRecentSearchPress={undefined}
                    currentOtp={''}
                    isTouristBus={false}
                    clearTouristBusPassData={undefined}
                    onBuyTouristBusTicket={undefined}
                    onSearchTouristBusDestination={undefined}
                    availablePasses={undefined}
                    isProcessingPayment={undefined}
                />
            )}
        </View>
    );
};

export default FloatingOtpDetection;
