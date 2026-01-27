import mtToSuccess from '@/../src/typescript/assets/ny-service/mt_to_success.lottie';
import mtToFailure from '@/../src/typescript/assets/ny-service/mt_to_failure.lottie';
import mtToPending from '@/../src/typescript/assets/ny-service/mt_to_pending.lottie';
import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Keyboard, StyleSheet } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler.tsx';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { interpolate } from 'react-native-reanimated';
import { MultimodalPaymentStatusProps } from './types';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { createAction } from '@/typescript/utils/common';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { getStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import HyperSdkReact from 'hyper-sdk-react';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { PaymentProcessing } from './components/PaymentProcessing';
import { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { PaymentCancelModal } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/PaymentCancelModal';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { TicketBookingFailedModal } from '../JourneyInfoScreen/components/TicketBookingFailedModal';
import { AnimatedModal } from '@/typescript/components/common/AnimatedModal';
import { logger } from '@/src-v2/systems/logger/index.ts';

// Background Colors for Different Statuses
const statusBackgrounds = {
    FulfillmentSucceeded: ['#035C23', '#035C23'],
    FulfillmentFailed: ['#313131', '#313131'],
    FulfillmentPending: ['#313131', '#313131'],
    FulfillmentRefundPending: ['#313131', '#313131'],
    FulfillmentRefundInitiated: ['#313131', '#313131'],
    FulfillmentRefundFailed: ['#313131', '#313131'],
    FulfillmentRefunded: ['#313131', '#313131'],
};

const PaymentStatus: React.FC<MultimodalPaymentStatusProps> = (props: MultimodalPaymentStatusProps) => {
    Keyboard.dismiss();
    const { fulfillmentStatus, domainType, amount, paymentRetryAfterFailureCounter } = props;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const storedPaymentPayload = getStringItem(MMKVKey.PAYMENT_PAGE_PAYLOAD);
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const statusMessages = {
        FulfillmentPending: userLanguageStrings.PaymentisPending,
        FulfillmentFailed: userLanguageStrings.PaymentFailed,
        FulfillmentRefundFailed: userLanguageStrings.PaymentFailed,
        FulfillmentRefundPending: userLanguageStrings.RefundisinProcess,
        FulfillmentRefundInitiated: userLanguageStrings.RefundisinProcess,
        FulfillmentSucceeded: userLanguageStrings.PaymentSuccessful,
        FulfillmentRefunded: userLanguageStrings.AmountRefunded,
    };

    const statusSubMessages = useMemo(() => {
        return {
            FulfillmentPending: userLanguageStrings.YourPaymentIsBeingProcessedPleaseWaitAMomentWhileWeConfirmTheStatus,
            FulfillmentSucceeded: userLanguageStrings.ThepaymentforTicketsisprocessed(
                domainType === 'FRFSPassPurchase' ? 'Bus Pass' : 'Ticket',
            ),
            FulfillmentFailed:
                userLanguageStrings.SorrythepaymenthasbeenfailedIfyourmoneyisdebitedtherefundwillbeproccessedwithinin24hourstoyourbank,
            FulfillmentRefundPending:
                userLanguageStrings.YourPaymentWasUnsuccessfulAndARefundIsCurrentlyBeingProcessedPleaseAllowSomeTimeForItToReflectInYourAccount,
            FulfillmentRefundInitiated:
                userLanguageStrings.YourPaymentWasUnsuccessfulAndARefundIsCurrentlyBeingProcessedPleaseAllowSomeTimeForItToReflectInYourAccount,
            FulfillmentRefunded:
                userLanguageStrings.TheAmountHasBeenRefundedToYourOriginalPaymentMethodThankYouForYourPatience,
            FulfillmentRefundFailed:
                userLanguageStrings.SorrythepaymenthasbeenfailedIfyourmoneyisdebitedtherefundwillbeproccessedwithinin24hourstoyourbank,
        };
    }, [userLanguageStrings]);

    const lottieMapper = {
        FulfillmentPending: mtToPending,
        FulfillmentFailed: mtToFailure,
        FulfillmentSucceeded: mtToSuccess,
        FulfillmentRefundPending: mtToPending,
        FulfillmentRefundInitiated: mtToPending,
        FulfillmentRefundFailed: mtToFailure,
        FulfillmentRefunded: mtToSuccess,
    };
    const { setEnabled } = useKeyboardController();

    const retryPayment = React.useCallback(() => {
        if (storedPaymentPayload) {
            logger.logDebug(`Payment process retry payload: ${storedPaymentPayload}`, 'PaymentSDKFlow');
            HyperSdkReact.process(storedPaymentPayload, 'paymentPage');
            return () => {
                setEnabled(true);
            };
        }
        return undefined;
    }, []);

    useEffect(() => {
        if (paymentRetryAfterFailureCounter > 0) {
            setEnabled(false);
            retryPayment();
        }
    }, [paymentRetryAfterFailureCounter]);

    const { cancelPaymentModalRef } = useRefsContext();

    const handleBackPressConfirmation = () => {
        cancelPaymentModalRef.current?.present();
    };

    const lottieTranslateY = useSharedValue(-150);
    const textTranslateY = useSharedValue(100);

    const textSlideUpStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: textTranslateY.value }],
            opacity: interpolate(textTranslateY.value, [100, 0], [0, 1]),
        };
    });

    const lottieAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: lottieTranslateY.value }],
        };
    });

    useEffect(() => {
        lottieTranslateY.value = withTiming(0, { duration: 600 });
        textTranslateY.value = withTiming(0, { duration: 600 });
        hapticEffect(HapticFeedbackTypes.selection, undefined);
    }, []);

    // UI Based on Payment Status
    const getStatusUI = useCallback(() => {
        if (['FulfillmentPending'].includes(fulfillmentStatus)) {
            return (
                <PaymentProcessing
                    cancelPaymentModalRef={cancelPaymentModalRef}
                    amount={amount}
                    domainType={domainType}
                />
            );
        }
        return (
            <LinearGradient
                accessible={true}
                accessibilityLabel={`Payment status: ${statusMessages[fulfillmentStatus]}`}
                colors={statusBackgrounds[fulfillmentStatus]}
                style={{ flex: 1 }}>
                <Animated.View style={styles.container}>
                    <Animated.View style={[lottieAnimatedStyle, { width: 150, height: 150 }]}>
                        <LottieWithFallback
                            fallback={undefined}
                            source={lottieMapper[fulfillmentStatus]}
                            autoPlay
                            loop={false}
                            style={{ width: 150, height: 150 }}
                        />
                    </Animated.View>
                    <Animated.View style={[textSlideUpStyle, tailwind.style('flex justify-center item-center')]}>
                        <Animated.Text
                            accessible={true}
                            accessibilityLabel={statusMessages[fulfillmentStatus]}
                            style={tailwind.style(
                                'text-[16px] text-center font-areaNormal-extrabold text-white pt-25',
                            )}>
                            {statusMessages[fulfillmentStatus]}
                        </Animated.Text>
                        <Animated.Text
                            accessible={true}
                            accessibilityLabel={statusMessages[fulfillmentStatus]}
                            style={tailwind.style(
                                'text-center text-[#E5E5E5] text-[14px] font-areaNormal-extrabold px-16 pt-4',
                            )}>
                            {statusSubMessages[fulfillmentStatus]}
                        </Animated.Text>
                    </Animated.View>
                </Animated.View>
            </LinearGradient>
        );
    }, [fulfillmentStatus, amount, statusSubMessages, domainType]);

    const handleGoToHomeOrStartJourney = useCallback(() => {
        if (fulfillmentStatus === 'FulfillmentSucceeded') {
            props.mpDispatch(createAction('PAYMENT_SUCCESSFUL', undefined));
        } else {
            handleBackPressConfirmation();
        }
    }, [props.handleGoToHome, fulfillmentStatus, props.mpDispatch]);

    const handleCancelDismiss = () => {
        cancelPaymentModalRef.current?.dismiss();
    };

    const onCancelPayment = () => {
        cancelPaymentModalRef.current?.dismiss();
        navigation.popTo('mainTabNavigation', {
            screen: 'homeTab_homeScreen',
        });
    };

    const onRetryPayment = () => {
        hapticEffect(HapticFeedbackTypes.selection, undefined);
        props.mpDispatch(createAction('RETRY_PAYMENT', undefined));
    };

    return (
        <HardwareBackpressHandler onHardwareBackPress={handleGoToHomeOrStartJourney}>
            <>
                <View style={tailwind.style('flex-1 bg-white')}>
                    <TouchableWithoutFeedback
                        accessibilityRole="button"
                        onPress={Keyboard.dismiss}
                        testID="33715ed0-1f7f-11f0-abf7-325096b39f47">
                        <View style={tailwind.style('flex-1 flex-col')}>
                            {getStatusUI()}
                            {['FulfillmentFailed'].includes(fulfillmentStatus) && (
                                <Animated.View
                                    style={[
                                        textSlideUpStyle,
                                        tailwind.style('absolute left-12 right-12 bg-[#313131] px-6'),
                                        { bottom: 96 },
                                    ]}>
                                    <Pressable
                                        testID="retry-payment"
                                        onPress={onRetryPayment}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Retry button`}
                                        style={tailwind.style(
                                            'bg-[#016ACD] rounded-2xl flex justify-center items-center mb-3 h-[52px] ',
                                        )}>
                                        <Animated.Text
                                            style={tailwind.style('text-white text-[14px] font-areaNormal-extrabold ')}>
                                            {userLanguageStrings.Retry}
                                        </Animated.Text>
                                    </Pressable>

                                    <Pressable
                                        testID="cancel-go-home"
                                        onPress={onCancelPayment}
                                        accessibilityRole="button"
                                        accessibilityLabel={`Cancel and go home button`}
                                        style={tailwind.style(
                                            'bg-[#2A2A2A] py-3 mt-2 rounded-2xl flex justify-center items-center h-[52px] ',
                                        )}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-white text-[14px] text-center font-areaNormal-extrabold',
                                            )}>
                                            {userLanguageStrings.CancelGoHome}
                                        </Animated.Text>
                                    </Pressable>
                                </Animated.View>
                            )}
                            {/* {transactionStatus && transactionStatus === 'CHARGED' && (
                                <Animated.View
                                    style={[
                                        textSlideUpStyle,
                                        tailwind.style('absolute left-12 right-12 bg-[#035C23] px-6'),
                                        { bottom: 96 },
                                    ]}>
                                    {appSystemConfig.enableLiveTracking ? (
                                        <Pressable
                                            testID="start-journey"
                                            onPress={onStartJourney}
                                            accessibilityRole="button"
                                            accessibilityLabel={`Start journey button`}
                                            style={tailwind.style(
                                                'bg-[#FFE688] rounded-2xl flex justify-center items-center mb-3 h-[52px] ',
                                            )}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-black text-[14px] font-areaNormal-extrabold ',
                                                )}>
                                                {userLanguageStrings.StartJourney}
                                            </Animated.Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            testID="view-ticket"
                                            onPress={onViewTicket}
                                            accessibilityRole="button"
                                            accessibilityLabel={`View ticket button`}
                                            style={tailwind.style(
                                                'bg-[#FFE688] rounded-2xl flex justify-center items-center mb-3 h-[52px] ',
                                            )}>
                                            <Animated.Text
                                                style={tailwind.style(
                                                    'text-black text-[14px] font-areaNormal-extrabold ',
                                                )}>
                                                {userLanguageStrings.ViewTicket}
                                            </Animated.Text>
                                        </Pressable>
                                    )}
                                </Animated.View>
                            )} */}
                            {['FulfillmentRefunded', 'FulfillmentRefundInitiated', 'FulfillmentRefundFailed'].includes(
                                fulfillmentStatus,
                            ) && (
                                <Animated.View
                                    style={[
                                        textSlideUpStyle,
                                        tailwind.style('absolute left-12 right-12 bg-[#313131] px-6'),
                                        { bottom: 96 },
                                    ]}>
                                    <Pressable
                                        testID="cancel-go-home-refund"
                                        onPress={props.handleGoToHome}
                                        accessibilityRole="button"
                                        accessibilityLabel="Cancel and go home button"
                                        style={tailwind.style(
                                            'bg-[#F8F9FB] py-3 mt-2 rounded-2xl flex justify-center items-center h-[52px] ',
                                        )}>
                                        <Animated.Text
                                            style={tailwind.style(
                                                'text-black text-[14px] text-center font-areaNormal-extrabold',
                                            )}>
                                            {userLanguageStrings.GoHome}
                                        </Animated.Text>
                                    </Pressable>
                                </Animated.View>
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                    <PopUpModal
                        sheetRef={cancelPaymentModalRef}
                        enableDynamicSizing={true}
                        onHardwareBackPress={handleCancelDismiss}
                        showBackdrop={undefined}
                        isScrollable={false}
                        borderRadius={36}>
                        <PaymentCancelModal
                            sheetRef={cancelPaymentModalRef}
                            onCancelPayment={onCancelPayment}
                            domainType={domainType}
                            amount={amount}
                        />
                    </PopUpModal>
                    <AnimatedModal
                        visible={props.isTicketBookingFailedModalVisible}
                        setVisible={props.setIsTicketBookingFailedModalVisible}
                        onClose={() => props.setIsTicketBookingFailedModalVisible(false)}
                        showCloseButton={false}
                        containerStyle={{}}
                        allowCloseOnBackdropPress={false}
                        contentStyle={{}}>
                        <TicketBookingFailedModal goToHome={() => props.setIsTicketBookingFailedModalVisible(false)} />
                    </AnimatedModal>
                </View>
            </>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        left: 20,
        width: 50,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        marginTop: 50,
    },
    refreshText: {
        fontSize: 12,
        color: '#0569C7',
        marginVertical: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },
    startButton: {
        position: 'absolute',
        bottom: 30,
        paddingVertical: 15,
        borderRadius: 25,
    },
    startButtonText: {
        color: '#000',
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 30,
        fontFamily: 'AreaNormal-Bold',
    },
});

export default PaymentStatus;
