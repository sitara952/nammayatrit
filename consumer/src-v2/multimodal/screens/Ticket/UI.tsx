import DoubleArrows from '@/src-v2/assets/svg/DoubleArrow';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Icon } from '@/typescript/components/Icon';
import CloseIcon from '@/typescript/components/svg/CloseIcon';

import Typography from '@/typescript/designSystem/components/primitives/Typography';

import { SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { isEqual } from 'lodash';
import React, { useState } from 'react';
import { Modal, Platform, View } from 'react-native';

import { NewTicketUI } from './SingleTicket/UI';
import { MultiTransitTicketUI } from './MultiModeTicket/UI';
import Animated, {
    Extrapolation,
    interpolate,
    LinearTransition,
    SharedValue,
    useDerivedValue,
    useSharedValue,
    ZoomIn,
    ZoomOut,
} from 'react-native-reanimated';
import { Carousel } from '@/src-v2/multimodal/components/Carousel';
import { QrCodeView } from '../PaymentStatus/QrCodeView';
import { QRCarouselProps } from './Hooks/useTicketData';
import { CarouselMetroBus } from '../../components/CarouselMetroBus';
import { ScreenshotGuard } from '@/src-v2/components/ScreenShotGuard';
import { TicketUIProps } from './SingleTicket/types';
import { strings } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const QRCodeOtpCarousel: React.FC<QRCarouselProps> = ({
    qrString,
    otp,
    size = 200,
    preview = 190,
    showOtp,
    otpColor,
    legTickets,
    appName,
}) => {
    const [showFullScreenQR, setShowFullScreenQR] = useState(false);
    const [showFullScreenOTP, setShowFullScreenOTP] = useState(false);
    const viewport = Math.min(size + preview, SCREEN_WIDTH - 20);
    const itemSize = Math.min(size, viewport - preview);
    const progress = useSharedValue(0);
    const [carouselActiveIndex, setCarouselActiveIndex] = useState(0);
    const isNammaOdisha = appName === 'nammaYatri' || appName === 'odishaYatri';
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const dataSingleBooking = (legTickets || []).map((ticket, index) => {
        return {
            key: `qr${index}`,
            node: (
                <Pressable
                    onPress={() => setShowFullScreenQR(true)}
                    testID={`qr-carousel-pressable-${index}`}
                    accessibilityLabel={'Show QR code in full screen button'}
                    accessibilityRole="button">
                    <ScreenshotGuard>
                        <QrCodeView jsonString={ticket} size={itemSize} progress={progress} />
                    </ScreenshotGuard>
                </Pressable>
            ),
        };
    });

    const dataMultimodal = [
        {
            key: 'qr',
            node: (
                <Pressable
                    onPress={() => setShowFullScreenQR(true)}
                    testID="qr-carousel-pressable"
                    accessibilityLabel={'Show QR code in full screen button'}
                    accessibilityRole="button">
                    <ScreenshotGuard>
                        <QrCodeView jsonString={qrString} size={itemSize} progress={progress} />
                    </ScreenshotGuard>
                </Pressable>
            ),
        },
        ...(showOtp
            ? [
                  {
                      key: 'otp',
                      node: (
                          <OTPDisplay
                              size={itemSize}
                              otp={otp}
                              otpColor={otpColor}
                              progress={progress}
                              onPress={() => setShowFullScreenOTP(true)}
                              isInModal={false}
                              userLanguageStrings={userLanguageStrings}
                          />
                      ),
                  },
              ]
            : []),
    ];

    return (
        <View>
            {isNammaOdisha ? (
                <FullScreenModal
                    visible={showFullScreenQR}
                    onClose={() => setShowFullScreenQR(false)}
                    content={legTickets && legTickets[carouselActiveIndex]}
                    type="qr"
                    otpColor={otpColor}
                    progress={progress}
                    userLanguageStrings={userLanguageStrings}
                />
            ) : (
                <FullScreenModal
                    visible={showFullScreenQR}
                    onClose={() => setShowFullScreenQR(false)}
                    content={qrString || 'renderQR'}
                    type="qr"
                    otpColor={otpColor}
                    progress={progress}
                    userLanguageStrings={userLanguageStrings}
                />
            )}
            <FullScreenModal
                visible={showFullScreenOTP}
                onClose={() => setShowFullScreenOTP(false)}
                content={otp}
                type="otp"
                otpColor={otpColor}
                progress={progress}
                userLanguageStrings={userLanguageStrings}
            />
            {isNammaOdisha ? (
                <>
                    <View
                        style={tailwind.style(
                            'absolute top-[-170px] right-6 z-10 bg-white rounded-full px-3 py-1 flex items-center justify-center',
                        )}>
                        {dataSingleBooking.length > 1 ? (
                            <Animated.Text style={tailwind.style('text-black text-xs font-semibold')}>
                                {`${carouselActiveIndex + 1}/${dataSingleBooking.length}`}
                            </Animated.Text>
                        ) : null}
                    </View>
                    <CarouselMetroBus
                        data={dataSingleBooking}
                        renderItem={item => item.node}
                        progress={progress}
                        onIndexChange={setCarouselActiveIndex}
                        scrollEnabled={dataSingleBooking.length > 1}
                    />
                </>
            ) : (
                <Carousel data={dataMultimodal} renderItem={item => item.node} progress={progress} />
            )}
        </View>
    );
};

const TicketUI: React.FC<TicketUIProps> = props => {
    switch (props?.tag) {
        case 'SINGLEMODE':
            return <NewTicketUI {...props.data} />;
        case 'MULTIMODAL':
            return <MultiTransitTicketUI {...props.data} />;
    }
    return null;
};

export default React.memo(TicketUI, (prevProps, nextProps) => {
    return isEqual(prevProps, nextProps);
});
const OTPDisplay = ({
    otp,
    size = 171,
    otpColor,
    progress,
    onPress,
    isInModal = false,
    userLanguageStrings,
}: {
    otp: string | undefined;
    size: number;
    otpColor: string | undefined;
    progress: SharedValue<number>;
    onPress: () => void;
    isInModal: boolean | undefined;
    userLanguageStrings: strings;
}) => {
    const digits = otp ? otp.padEnd(4, '0').split('') : [];
    const opacity = useDerivedValue(() => {
        return interpolate(progress.value, [-1, 0, 1], [0, 0, 1], Extrapolation.CLAMP);
    });

    return (
        <>
            <Animated.View
                style={[
                    tailwind.style(
                        `bg-[${otpColor}] rounded-[28px] flex-row flex-wrap items-center justify-center w-[${
                            size + 8
                        }px] h-[${size}px] mt-5 ${isInModal ? '' : ' ml-20'}`,
                    ),
                ]}
                accessibilityLabel={`OTP is`}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Show OTP in full screen button"
                    onPress={onPress}
                    testID="otp-display"
                    style={tailwind.style(
                        `flex-row flex-wrap items-center justify-center w-[${size}px] h-[${size}px]`,
                    )}>
                    {digits.map((digit, idx) => (
                        <Animated.View
                            key={idx}
                            style={tailwind.style(`w-[${size / 2}px] h-[${size / 2}px] items-center justify-center`)}>
                            <Animated.Text
                                style={tailwind.style(
                                    `text-white text-[${size / 2 - 32}px] font-departureMono-regular text-center ${
                                        idx === 0 || idx === 2 ? 'pl-2' : 'pr-2'
                                    } ${idx === 0 || idx === 1 ? 'pt-3' : 'pb-3'}`,
                                )}>
                                {digit}
                            </Animated.Text>
                        </Animated.View>
                    ))}
                </Pressable>
            </Animated.View>
            {!isInModal && (
                <Animated.View
                    style={[
                        tailwind.style(`mt-3 self-center flex-row items-center gap-1.5  ${isInModal ? '' : ' ml-15'} `),
                        { opacity },
                    ]}
                    accessible={false}
                    importantForAccessibility="no-hide-descendants">
                    <Icon
                        icon={<DoubleArrows />}
                        style={tailwind.style('pt-0.2', { transform: [{ rotate: '180deg' }] })}
                    />

                    <Typography
                        type="subhead-2"
                        style={tailwind.style('text-[12px] opacity-60 text-black ')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel=""
                        accessibilityRole={undefined}>
                        {userLanguageStrings.SwipeForQRCode}
                    </Typography>
                </Animated.View>
            )}
        </>
    );
};

const ModalContent = ({
    onClose,
    content,
    type,
    otpColor,
    progress,
    userLanguageStrings,
}: {
    onClose: () => void;
    content: string | undefined;
    type: 'qr' | 'otp';
    otpColor: string | undefined;
    progress: SharedValue<number>;
    userLanguageStrings: strings;
}) => {
    const closeButtonStyle = tailwind.style('mt-10');
    const modalSize = SCREEN_WIDTH * 0.8;

    return (
        <Animated.View style={tailwind.style('flex-1 w-full h-full relative justify-center items-center')}>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel={'Close button'}
                style={{
                    flex: 1,
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                onPress={onClose}
                testID={`${type}-modal-overlay`}>
                <Typography
                    type={'body-4'}
                    style={tailwind.style('pb-6 text-[#7e7e7e] font-areaNormal-extrabold text-[30px]')}
                    numberOfLines={undefined}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={type === 'qr' ? 'Ticket QR' : 'Ticket OTP'}
                    accessibilityRole={undefined}>
                    {type === 'qr' ? userLanguageStrings.TicketQR : userLanguageStrings.TicketOTP}
                </Typography>
                <Animated.View
                    style={tailwind.style('')}
                    layout={LinearTransition}
                    entering={ZoomIn.springify().damping(40).stiffness(300)}
                    exiting={ZoomOut.springify().damping(40).stiffness(300)}>
                    <Pressable
                        accessibilityRole="button"
                        onPress={e => e.stopPropagation()}
                        testID={`${type}-content`}
                        accessibilityLabel={type === 'qr' ? 'Ticket QR' : 'Ticket OTP'}>
                        {type === 'qr' ? (
                            <ScreenshotGuard>
                                <QrCodeView jsonString={content} size={modalSize} isInModal={true} />
                            </ScreenshotGuard>
                        ) : (
                            <OTPDisplay
                                size={modalSize}
                                otp={content}
                                progress={progress}
                                otpColor={otpColor}
                                onPress={() => {}}
                                isInModal={true}
                                userLanguageStrings={userLanguageStrings}
                            />
                        )}
                    </Pressable>
                </Animated.View>
                <Animated.View
                    style={closeButtonStyle}
                    layout={LinearTransition}
                    entering={ZoomIn.springify().damping(40).stiffness(300)}
                    exiting={ZoomOut.springify().damping(40).stiffness(300)}>
                    <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Close button`}
                        style={tailwind.style('px-4 py-4 bg-[#656565] rounded-full')}
                        onPress={onClose}
                        testID={`fullscreen-${type}-dismiss`}>
                        <Icon icon={<CloseIcon color="#FFFFFF" />} />
                    </Pressable>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};

const FullScreenModal = ({
    visible,
    onClose,
    content,
    type,
    otpColor,
    progress,
    userLanguageStrings,
}: {
    visible: boolean;
    onClose: () => void;
    content: string | undefined;
    type: 'qr' | 'otp';
    otpColor: string | undefined;
    progress: SharedValue<number>;
    userLanguageStrings: strings;
}) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
            {Platform.OS === 'ios' ? (
                <BlurView
                    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                    blurType="light"
                    blurAmount={10}>
                    <ModalContent
                        onClose={onClose}
                        content={content}
                        type={type}
                        otpColor={otpColor}
                        progress={progress}
                        userLanguageStrings={userLanguageStrings}
                    />
                </BlurView>
            ) : (
                <Animated.View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(198, 194, 194, 0.88)',
                    }}>
                    <ModalContent
                        onClose={onClose}
                        content={content}
                        type={type}
                        otpColor={otpColor}
                        progress={progress}
                        userLanguageStrings={userLanguageStrings}
                    />
                </Animated.View>
            )}
        </Modal>
    );
};
