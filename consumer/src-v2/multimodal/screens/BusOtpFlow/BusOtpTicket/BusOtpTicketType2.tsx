import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { forwardRef, useEffect, useState } from 'react';
import { Image, Modal, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import Svg, { Defs, G, Path } from 'react-native-svg';
import { useConfigContext } from '@/typescript/context/ConfigContext';
// Use JSON format for better compatibility
const confettiAnimation = require('../../../../assets/lottie/confetti.lottie');
import { TicketData } from '../utils';
import crutLogo from '@/typescript/assets/ny-service/crutLogo.webp';

interface ConfettiConfig {
    colors?: string[];
    particleCount?: number;
    duration?: number;
}

interface BusOtpTicketOdishaModalProps {
    onGoBack: () => void;
    ticketData: TicketData;
    headerText?: string;
    subtitleText?: string;
    buttonText?: string;
    confettiConfig?: ConfettiConfig;
    isTicketVisible: boolean;
}

export const BusOtpTicketModalType2 = forwardRef<BottomSheetModal, BusOtpTicketOdishaModalProps>(
    ({ onGoBack, ticketData, headerText, subtitleText, buttonText, confettiConfig, isTicketVisible }, _ref) => {
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');

        const defaultSubtitleText = userLanguageStrings.YouCanViewYourTicketByClicking;
        const defaultButtonText = userLanguageStrings.GoBack;
        const defaultHeaderText = userLanguageStrings.TicketForBusIsActivated(ticketData.busNumber);

        const finalHeaderText = headerText || defaultHeaderText;
        const finalSubtitleText = subtitleText || defaultSubtitleText;
        const finalButtonText = buttonText || defaultButtonText;
        const { bottom, top } = useSafeAreaInsets();

        // State for confetti animation
        const [showConfetti, setShowConfetti] = useState(false);

        // Handle modal presentation changes and confetti
        const [modalKey, setModalKey] = useState(0);

        // Reset confetti and increment key when modal is presented
        const handleModalChange = () => {
            setModalKey(prev => prev + 1);
            setShowConfetti(true);
        };

        // Auto-hide confetti after duration
        useEffect(() => {
            if (showConfetti) {
                const hideTimer = setTimeout(() => {
                    setShowConfetti(false);
                }, confettiConfig?.duration || 3000);

                return () => {
                    clearTimeout(hideTimer);
                };
            }

            return undefined;
        }, [showConfetti, confettiConfig?.duration]);

        if (!ticketData) {
            return null;
        }

        // Calculate totals from fare data
        const initialTotal = ticketData.fare.reduce((sum, f) => sum + f.categoryInitialPrice * f.quantity, 0);
        const paidAmount = ticketData.fare.reduce((sum, f) => sum + f.total, 0);
        const discount = initialTotal - paidAmount;

        return (
            <Modal visible={isTicketVisible} onShow={handleModalChange} animationType="slide">
                <Animated.ScrollView
                    showsVerticalScrollIndicator={false}
                    horizontal={false}
                    style={tailwind.style(`h-full bg-[#047AEA] pt-[${top}px] `)}>
                    <Animated.View style={tailwind.style(' px-5 relative flex justify-between h-full items-center')}>
                        {/* Header Text */}
                        {showConfetti && <ConfettiAnimation key={modalKey} config={confettiConfig} />}
                        <Animated.View
                            style={tailwind.style('items-center  mb-4 pt-2')}
                            entering={FadeInUp.delay(100).duration(500)}>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-white text-[24px] font-areaNormal-extrabold text-center mb-5 max-w-[247px] leading-[24px]',
                                )}>
                                {finalHeaderText}
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[#F4F4F4]  text-[14px] mb-2 text-center font-areaNormal-bold leading-[23px] px-4  max-w-[284px]',
                                )}>
                                {finalSubtitleText}
                            </Animated.Text>
                        </Animated.View>

                        {/* Ticket Card */}
                        <Animated.View
                            style={tailwind.style('relative mb-8 z-20 mx-auto w-full')}
                            entering={FadeInDown.delay(100).duration(300)}>
                            {/* Ticket Content */}
                            <Animated.View style={tailwind.style(' items-center relative z-30')}>
                                <View style={tailwind.style(`absolute w-full h-full mx-auto`)}>
                                    <ModernTicketSvg />
                                </View>
                                <View style={tailwind.style('absolute mt-8 w-full h-full items-center justify-center')}>
                                    <Image
                                        source={crutLogo}
                                        style={tailwind.style('opacity-90')}
                                        resizeMode="contain"
                                    />
                                </View>
                                {/* Header */}
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-azeretMono-regular tracking-[0.22px] text-center mb-2 pt-9',
                                    )}>
                                    Capital Region Urban Transport
                                </Animated.Text>

                                {/* Ticket Details Row */}
                                <Animated.View style={tailwind.style('w-full px-10 mt-1 flex-row justify-between')}>
                                    <Animated.Text style={tailwind.style('text-[12px] font-azeretMono-regular')}>
                                        T No: {ticketData.ticketNumber}
                                    </Animated.Text>
                                    <Animated.Text style={tailwind.style('text-[12px] font-azeretMono-regular')}>
                                        {ticketData.date}
                                    </Animated.Text>
                                    <Animated.Text style={tailwind.style('text-[12px] font-azeretMono-regular')}>
                                        {ticketData.time}
                                    </Animated.Text>
                                </Animated.View>

                                {/* Route Number */}
                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[12px] font-azeretMono-regular text-center leading-[32px]',
                                    )}>
                                    {ticketData.busNumber}
                                </Animated.Text>

                                {/* Route Information */}
                                <Animated.View style={tailwind.style('items-center mb-4')}>
                                    <Animated.Text
                                        numberOfLines={2}
                                        style={tailwind.style(
                                            'text-[14px] mb-4 font-azeretMono-bold tracking-[0.22px] text-center max-w-[287px]',
                                        )}>
                                        {ticketData.route.sourceInEnglish.toUpperCase()}
                                    </Animated.Text>
                                    <Animated.Text
                                        numberOfLines={2}
                                        style={tailwind.style(
                                            'text-[14px] font-azeretMono-bold leading-[14px] tracking-[0.40px] text-center max-w-[287px]',
                                        )}>
                                        {ticketData.route.destinationInEnglish.toUpperCase()}
                                    </Animated.Text>
                                </Animated.View>

                                {/* Fare Details */}
                                <Animated.View style={tailwind.style('items-center mb-4')}>
                                    {ticketData.fare.length > 0 &&
                                        ticketData.fare.map(fare => (
                                            <Animated.Text
                                                key={fare.name}
                                                style={tailwind.style(
                                                    'text-[14px] font-azeretMono-regular text-center',
                                                )}>
                                                {fare.name} : {fare.quantity} X {fare.categoryInitialPrice.toFixed(2)} =
                                                ₹{(fare.categoryInitialPrice * fare.quantity).toFixed(2)}
                                            </Animated.Text>
                                        ))}
                                </Animated.View>

                                {/* Total */}
                                <Animated.Text
                                    style={tailwind.style('font-azeretMono-bold text-[20px] text-center mb-2')}>
                                    Total ₹{initialTotal.toFixed(2)}
                                </Animated.Text>

                                {/* Discount */}
                                {discount > 0 && (
                                    <Animated.Text
                                        style={tailwind.style(
                                            'text-[#656565] text-[12px] font-azeretMono-regular text-center mb-3',
                                        )}>
                                        Discount ₹ {discount}
                                    </Animated.Text>
                                )}

                                {/* Paid Amount */}
                                <Animated.Text
                                    style={tailwind.style(
                                        'font-azeretMono-bold text-[20px] text-center leading-[26px] mb-5',
                                    )}>
                                    Paid Amt ₹{paidAmount.toFixed(2)}
                                </Animated.Text>

                                <Animated.Text
                                    style={tailwind.style(
                                        'text-[14px] font-azeretMono-regular text-center leading-[15px] mb-2',
                                    )}>
                                    Payment Mode: M-Ticket
                                </Animated.Text>

                                {/* Service Type - Extract from first fare category if available */}
                                {ticketData.serviceTierType && (
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-azeretMono-regular text-center mb-2')}>
                                        Service Type: {ticketData.serviceTierType}
                                    </Animated.Text>
                                )}

                                <Animated.View style={tailwind.style('items-center mb-6')}>
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-azeretMono-regular text-center mb-2')}>
                                        Captain Id: {ticketData.busDriverId}
                                    </Animated.Text>
                                    <Animated.Text
                                        style={tailwind.style('text-[14px] font-azeretMono-regular text-center')}>
                                        Guide Id: {ticketData.busConductorId}
                                    </Animated.Text>
                                </Animated.View>
                            </Animated.View>
                        </Animated.View>

                        <Animated.View
                            entering={FadeInDown.delay(100).duration(500)}
                            style={tailwind.style('w-full z-40 mt-14')}>
                            <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`${finalButtonText} button`}
                                testID="go-back-button"
                                onPress={onGoBack}
                                style={tailwind.style(
                                    'bg-white rounded-[18px]  py-[23px] w-full',
                                    `mb-[${bottom || 16}px] z-40`,
                                )}>
                                <Animated.Text
                                    style={tailwind.style('text-[#3B3A3C] text-[16px] font-bold text-center')}>
                                    {finalButtonText}
                                </Animated.Text>
                            </Pressable>
                        </Animated.View>
                    </Animated.View>
                </Animated.ScrollView>
            </Modal>
        );
    },
);

function ModernTicketSvg() {
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 327 408" fill="none" style={tailwind.style('mx-auto')}>
            <G filter="url(#filter0_n_3371_1633)">
                <Path
                    d="M327 407.444H320.291C319.802 402.649 315.752 398.908 310.828 398.908C305.904 398.908 301.853 402.649 301.364 407.444H295.736C295.247 402.649 291.197 398.908 286.273 398.908C281.349 398.908 277.299 402.649 276.81 407.444H271.182C270.693 402.649 266.643 398.908 261.719 398.908C256.794 398.908 252.744 402.649 252.255 407.444H246.627C246.138 402.649 242.088 398.908 237.164 398.908C232.24 398.908 228.189 402.649 227.7 407.444H222.072C221.583 402.649 217.533 398.908 212.609 398.908C207.685 398.908 203.634 402.649 203.146 407.444H197.518C197.029 402.649 192.979 398.908 188.055 398.908C183.13 398.908 179.08 402.649 178.591 407.444H172.963C172.474 402.649 168.424 398.908 163.5 398.908C158.576 398.908 154.525 402.649 154.036 407.444H148.408C147.919 402.649 143.869 398.908 138.945 398.908C134.021 398.908 129.97 402.649 129.481 407.444H123.854C123.365 402.649 119.315 398.908 114.391 398.908C109.466 398.908 105.416 402.649 104.927 407.444H99.2988C98.8099 402.649 94.76 398.908 89.8359 398.908C84.9117 398.908 80.8611 402.649 80.3721 407.444H74.7441C74.2552 402.649 70.2053 398.908 65.2812 398.908C60.357 398.908 56.3064 402.649 55.8174 407.444H50.1895C49.7005 402.649 45.6506 398.908 40.7266 398.908C35.8023 398.908 31.7517 402.649 31.2627 407.444H25.6348C25.1458 402.649 21.0959 398.908 16.1719 398.908C11.2476 398.908 7.19699 402.649 6.70801 407.444H0V0H6.65918C6.65944 5.25376 10.9181 9.5127 16.1719 9.5127C21.2616 9.5127 25.418 5.51565 25.6729 0.489258L25.6855 0H31.2139C31.2141 5.25376 35.4727 9.5127 40.7266 9.5127C45.8163 9.5127 49.9727 5.51565 50.2275 0.489258L50.2402 0H55.7686C55.7688 5.25376 60.0274 9.5127 65.2812 9.5127C70.371 9.5127 74.5273 5.51565 74.7822 0.489258L74.7949 0H80.3232C80.3235 5.25376 84.5821 9.5127 89.8359 9.5127C94.9257 9.5127 99.082 5.51565 99.3369 0.489258L99.3496 0H104.878C104.878 5.25376 109.137 9.5127 114.391 9.5127C119.48 9.5127 123.637 5.51565 123.892 0.489258L123.904 0H129.433C129.433 5.25376 133.691 9.5127 138.945 9.5127C144.035 9.5127 148.191 5.51565 148.446 0.489258L148.459 0H153.987C153.988 5.25376 158.246 9.5127 163.5 9.5127C168.59 9.5127 172.746 5.51565 173.001 0.489258L173.014 0H178.542C178.542 5.25376 182.801 9.5127 188.055 9.5127C193.144 9.5127 197.301 5.51565 197.556 0.489258L197.568 0H203.097C203.097 5.25376 207.356 9.5127 212.609 9.5127C217.699 9.5127 221.855 5.51565 222.11 0.489258L222.123 0H227.651C227.652 5.25376 231.91 9.5127 237.164 9.5127C242.254 9.5127 246.41 5.51565 246.665 0.489258L246.678 0H252.206C252.206 5.25376 256.465 9.5127 261.719 9.5127C266.808 9.5127 270.965 5.51565 271.22 0.489258L271.232 0H276.761C276.761 5.25376 281.02 9.5127 286.273 9.5127C291.363 9.5127 295.52 5.51565 295.774 0.489258L295.787 0H301.315C301.316 5.25376 305.574 9.5127 310.828 9.5127C315.918 9.5127 320.074 5.51565 320.329 0.489258L320.342 0H327V407.444Z"
                    fill="#F9F9F9"
                />
            </G>
            <Defs></Defs>
        </Svg>
    );
}

// Confetti Animation Component
interface ConfettiAnimationProps {
    config?: ConfettiConfig;
}

function ConfettiAnimation({ config }: ConfettiAnimationProps) {
    const duration = config?.duration || 3000; // Default 3 seconds

    return (
        <View style={tailwind.style('absolute top-0 left-0 right-0 bottom-0 z-30 pointer-events-none bg-transparent')}>
            <LottieWithFallback
                fallback={undefined}
                source={confettiAnimation}
                autoPlay={true}
                loop={false}
                style={tailwind.style('w-full h-full')}
                resizeMode="cover"
                speed={duration === 3000 ? 1 : 3000 / duration} // Adjust speed based on duration
                onAnimationFinish={() => {}}
            />
        </View>
    );
}
