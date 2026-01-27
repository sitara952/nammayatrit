import colors from '../../designSystem/colorPalette';
import { StyleSheet, Text, View, Keyboard, NativeModules, Platform, AccessibilityInfo } from 'react-native';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Header from '../../components/Header';
import Animated from 'react-native-reanimated';
import CustomButton from './../../components/common/CustomButton';
import TermsAndConditions from './../../components/common/TermsAndConditions';
import { triggerEmailOTP } from '../../../../utils/api';
import Toast from 'react-native-root-toast';
import sharedStyles from '../../constants/style';
import { tailwind } from '../../tailwindTheme/tailwind';
import { useAppDispatch, useAppSelector } from '../../state/hooks';
import { useAuthMutation, useAuthResendOtpMutation, useAuthVerifyMutation } from '../../state/server/authApi';
import OTPComponentNew from '@/typescript/components/common/OTPComponentNew';
import { selectNewFeatureFlags, setToastProps } from '@/typescript/state/client/session';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import 'react-native-get-random-values';
import uuid from 'react-native-uuid';
import '../../utils/MMKV';
import { MMKVKey, setStringItem } from '../../utils/MMKV';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useAuthValidation } from '@/typescript/hooks/useAuthValidation';
import { logger } from '@/src-v2/systems/logger';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import icWhatsappLogo from '../../assets/ic_whatsapp_logo.webp';
import { getErrorMessageByCode } from '@/src-v2/utils/common';
import Danger from '@/typescript/components/svg/Danger';

type WhatsAppViewState = 'DEFAULT' | 'SUCCESS' | 'ERROR';
import { VerificationChannel } from '@/typescript/hooks/useAuthValidation';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { MERCHANT_CLIENT_CONFIG } from '@/typescript/constants/common';

type OTPVerificationProps = {
    navigation: NativeStackNavigationProp<OnboardingNavigationParamList>;
    route: RouteProp<OnboardingNavigationParamList, 'OTPVerification'>;
};

const RESEND_DISABLE_TIME = 10;

const getAppSignatures = async () => {
    try {
        const { AppInfoModule } = NativeModules;
        if (AppInfoModule && AppInfoModule.getAppSignatures) {
            const signatures = await AppInfoModule.getAppSignatures();
            return signatures?.length > 0 ? signatures[0] : undefined;
        }
    } catch {
        return undefined;
    }
};
const OTPVerification: React.FC<OTPVerificationProps> = ({ navigation, route }) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { email, phoneNumber, authId: initialAuthId } = route.params;
    const [authId, setAuthId] = useState(initialAuthId);
    const [errorText, setErrorText] = useState('');
    const [_, setLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [resendOTPTimer, setResendOTPTimer] = useState(RESEND_DISABLE_TIME);
    const [resendOTPEnabled, setResendOTPEnabled] = useState(false);
    const fcmToken = useRef<string>('');
    const timerRef = useRef<number>(resendOTPTimer);
    const authValidation = useAuthValidation();
    const dispatch = useAppDispatch();
    const [resendOtp] = useAuthResendOtpMutation();
    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('enter OTP screen', {
            queue: true,
        });
        startOTPTimer();
    }, []);

    useEffect(() => {
        async function retrieveAndStoreToken() {
            try {
                const messagingInstance = getMessaging();
                const fcm_token = await getToken(messagingInstance);
                if (fcm_token) {
                    setStringItem(MMKVKey.FCM_TOKEN, fcm_token);
                    fcmToken.current = fcm_token;
                }
            } catch (error) {
                console.error('Error retrieving or storing FCM token', error);
            }
        }

        retrieveAndStoreToken();
    }, []);

    const startOTPTimer = () => {
        setResendOTPTimer(RESEND_DISABLE_TIME);
        timerRef.current = RESEND_DISABLE_TIME;
        setResendOTPEnabled(false);

        const timerId = setInterval(() => {
            timerRef.current -= 1;
            if (timerRef.current < 0) {
                clearInterval(timerId);
                setResendOTPEnabled(true);
            } else {
                setResendOTPTimer(timerRef.current);
            }
        }, 1000);
    };

    const validateOTP = async (pin: string) => {
        setLoading(true);
        Keyboard.dismiss();
        logger.logInfo(`[Onboarding] Entered 4 digit OTP`, 'Onboarding');
        console.info('Validate OTP ', fcmToken);
        if (!fcmToken || fcmToken.current === '' || fcmToken.current === 'undefined' || fcmToken.current === null) {
            console.info('Validate OTP dummy', fcmToken.current);
            fcmToken.current = uuid.v4();
        }
        const postData = {
            authId: authId,
            data: {
                otp: pin,
                deviceToken: fcmToken.current,
            },
        };
        authVerify(postData)
            .unwrap()
            .then(payload => {
                setLoading(false);
                authValidation(
                    payload,
                    phoneNumber,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    VerificationChannel.OTP,
                );
            })
            .catch(() => {
                setOtp('');
                setErrorText(userLanguageStrings.PINseemstobeincorrect);
                setLoading(false);
            })
            .finally(() => setTimeout(() => setLoading(false), 3000));
    };

    const handleOTPChange = (value: string) => {
        setOtp(value);
        if (value.length == 4) {
            validateOTP(value);
        } else {
            setErrorText('');
        }
    };

    const handleOTPVerification = async (pin: string) => {
        setOtp(pin);
        await validateOTP(pin);
    };

    const handleOTPSubmit = async () => {
        handleOTPVerification(otp);
        setLoading(true);
        await validateOTP(otp);
    };

    const handleResentOTP = async () => {
        if (!resendOTPEnabled) return;
        startOTPTimer();
        logger.logDebug(`[Onboarding] Resend OTP clicked`, 'Onboarding');
        if (phoneNumber) {
            const senderHash = await getAppSignatures();
            resendOtp({ authId, senderHash })
                .then(() => {
                    setLoading(false);
                    Toast.show(userLanguageStrings.ResentOTP);
                })
                .catch(error => {
                    setLoading(false);
                    console.error(error); // Handle the error appropriately
                    Toast.show(
                        userLanguageStrings.Somethingwentwrong +
                            ' - ' +
                            (error?.status || userLanguageStrings.Unknownerror),
                    );
                });
        } else if (email) {
            triggerEmailOTP(
                email,
                k => {
                    setLoading(false);
                    setAuthId(k.authId);
                    Toast.show(userLanguageStrings.ResentOTP);
                },
                error => {
                    setLoading(false);
                    console.error(error); // Handle the error appropriately
                    Toast.show(
                        userLanguageStrings.Somethingwentwrong +
                            ' - ' +
                            (error?.status || userLanguageStrings.Unknownerror),
                    );
                },
            );
        }
    };

    const [authVerify, { isLoading }] = useAuthVerifyMutation();
    const [whatsappViewState, setWhatsappViewState] = useState<WhatsAppViewState>('DEFAULT');
    const configs = MERCHANT_CLIENT_CONFIG.value;
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const authReq = useMemo(
        () => ({
            merchantId: configs.mobilityMid,
            mobileNumber: phoneNumber,
            mobileCountryCode: '+91',
            allowBlockedUserLogin: true,
            otpChannel: 'WHATSAPP',
        }),
        [phoneNumber, configs.mobilityMid],
    );
    const [auth] = useAuthMutation();
    const sendOtpOnWhatsapp = useCallback(() => {
        switch (whatsappViewState) {
            case 'ERROR':
            case 'DEFAULT':
                auth(authReq)
                    .unwrap()
                    .then(payload => {
                        setAuthId(payload?.authId);
                        setWhatsappViewState('SUCCESS');
                    })
                    .catch(error => {
                        const errorMessage = getErrorMessageByCode(error?.data?.errorCode, error?.data?.errorMessage);
                        showErrorToast(errorMessage);
                        setWhatsappViewState('ERROR');
                    });
                break;
            case 'SUCCESS':
                dispatch(
                    setToastProps({
                        message: userLanguageStrings.OTPAlreadySentOnWhatsApp,
                        backgroundColor: colors?.recovered?.blue,
                        visible: true,
                        logo: undefined,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: undefined,
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        autoDismissAfter: 3000,
                        margin: undefined,
                        customToast: undefined,
                    }),
                );
                break;
        }
    }, [whatsappViewState]);
    const fetchWhatsappButtonText = useCallback(() => {
        switch (whatsappViewState) {
            case 'DEFAULT':
                return userLanguageStrings.ReceiveOTPOnWhatsApp;
            case 'SUCCESS':
                return userLanguageStrings.OTPAlreadySentOnWhatsApp;
            case 'ERROR':
                return userLanguageStrings.ErrorSendingOTP;
        }
    }, [whatsappViewState]);

    const showErrorToast = useCallback((message: string) => {
        dispatch(
            setToastProps({
                message: message,
                backgroundColor: themeColors.Fill_negativeHigh,
                visible: true,
                logo: <Danger />,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                autoDismissAfter: 3000,
                margin: undefined,
                customToast: undefined,
            }),
        );
    }, []);

    return (
        <TouchableWithoutFeedback
            testID="otp_backdrop"
            onPress={Keyboard.dismiss}
            accessible={false}
            accessibilityRole="button">
            <KeyboardAvoidingView
                style={tailwind.style(`h-[100%] bg-[${colors.primitive.gray[11]}]`)}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={styles.container}>
                    <Header
                        title={userLanguageStrings.Letsgetyoutripready}
                        navigation={navigation}
                        stepIndicator={{ currentStep: 2, totalSteps: 3 }}
                        testID="otp_header_back"
                    />
                    <View style={styles.pageContainer}>
                        <Text style={tailwind.style(' font-regular text-base ')}>
                            {userLanguageStrings.PINsentto +
                                ' ' +
                                (phoneNumber ? phoneNumber : userLanguageStrings.phonenumber)}
                        </Text>
                        {/* <OTPComponent
                  onComplete={handleOTPVerification}
                  errorText={errorText}
                  setErrorText={setErrorText}
                  setOtpValue={handleOTPChange}
                /> */}
                        <OTPComponentNew
                            value={otp}
                            error={errorText.length > 0}
                            onChange={handleOTPChange}
                            cellStyle={undefined}
                            textStyle={undefined}
                        />
                        <View style={{ marginVertical: 10, flexDirection: 'row' }}>
                            {errorText ? (
                                <Text style={styles.errorText}>{errorText}</Text>
                            ) : resendOTPEnabled ? (
                                <Text
                                    style={{
                                        ...sharedStyles.bodyText3,
                                        marginRight: 5,
                                        color: '#5B6777',
                                    }}>
                                    {userLanguageStrings.DidntreceiveanOTP_QuestionMark}
                                </Text>
                            ) : null}

                            <View style={styles.resendContainer}>
                                <View style={styles.resendRow}>
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        testID="otp_resend"
                                        onPress={handleResentOTP}>
                                        <Text
                                            style={{
                                                ...sharedStyles.bodyText3,
                                                color: resendOTPEnabled ? colors?.recovered?.blueHigh : '#B2B9C7',
                                            }}>
                                            {userLanguageStrings.ResendOTP}
                                        </Text>
                                    </TouchableOpacity>
                                    <Text
                                        style={{
                                            ...sharedStyles.bodyText3,
                                            display: resendOTPEnabled ? 'none' : 'flex',
                                            color: '#B2B9C7',
                                        }}>
                                        ({resendOTPTimer})
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Footer */}

                    <TermsAndConditions hideTnc={true}>
                        <CustomButton
                            textColor={
                                isLoading || otp.length < 4 ? '#B2B9C7' : themeColors.Button_Primary_Default_Text_Base
                            }
                            bgColor={
                                isLoading || otp.length < 4 ? '#F1F2F7' : themeColors.Button_primary_default_fill_base
                            }
                            buttonText={userLanguageStrings.Continue}
                            onClick={handleOTPSubmit}
                            loading={isLoading}
                            disabled={isLoading || otp.length < 4}
                            textStyle={{ fontSize: 16, fontWeight: '600' }}
                            accessible={true}
                            accessibilityLabel="Continue with Current OTP"
                            leftIcon={undefined}
                            testID="otp_continue_button"
                        />
                    </TermsAndConditions>
                    {resendOTPEnabled && newFeatureFlags.enableWhatsappOTPLogin && (
                        <Animated.View>
                            <CustomButton
                                textColor={colors.primitive.white[10]}
                                bgColor={colors.recovered.greenLow}
                                buttonText={fetchWhatsappButtonText()}
                                onClick={sendOtpOnWhatsapp}
                                loading={false}
                                disabled={false}
                                textStyle={{ fontSize: 16, fontWeight: '600' }}
                                accessible={true}
                                accessibilityLabel={fetchWhatsappButtonText()}
                                leftIcon={icWhatsappLogo}
                                testID="otp_whatsapp_button"
                            />
                        </Animated.View>
                    )}
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

export default OTPVerification;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primitive.gray[11],
    },
    pageContainer: {
        margin: 16,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: colors.primitive.white[10],
    },
    emailText: {
        ...sharedStyles.subHeading2,
    },
    errorText: {
        ...sharedStyles.bodyText3,
        color: sharedStyles.errorColor.color,
        marginRight: 5,
    },
    resendContainer: {
        flexDirection: 'column',
        marginTop: 0,
    },
    resendRow: {
        flexDirection: 'row',
        marginTop: 0,
    },
});
