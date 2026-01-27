import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Platform, Keyboard, AccessibilityInfo, NativeModules } from 'react-native';
import colors from '../../designSystem/colorPalette';
import { tailwind } from '../../tailwindTheme/tailwind';
import Header from './../../components/Header';
import CustomButton from './../../components/common/CustomButton';
import TermsAndConditions from './../../components/common/TermsAndConditions';
import { useAuthMutation } from '../../state/server/authApi';
import Animated from 'react-native-reanimated';
import { useAppSelector } from '@/typescript/state/hooks';

import { validateInput } from './../../utils/common.ts';
import sharedStyles from '../../constants/style';
import Input from '../../designSystem/components/primitives/Input.tsx';
import Typography from '../../designSystem/components/primitives/Typography.tsx';
import CrossIcon from '@/typescript/assets/svg/symbols/Cross.tsx';
import { TextInput } from 'react-native-gesture-handler';
import { MMKVKey, setStringItem } from '../../utils/MMKV';
import { setToastProps, selectNewFeatureFlags } from '@/typescript/state/client/session.ts';
import { getErrorMessageByCode } from '@/src-v2/utils/common.ts';
import { EventName, logEvent } from '@/typescript/utils/logger';
import Danger from '@/typescript/components/svg/Danger';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { OnboardingNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';
import { useAuthValidation, VerificationChannel } from '@/typescript/hooks/useAuthValidation.ts';
import { useAuthSignaturePostMutation } from '@/api/integrations/rtk/AuthSignaturePost.ts';
import {
    transformTrueCallerRespToAuthReq,
    TrueCallerModule,
    TrueCallerProfileResp,
} from '@/typescript/nativeModules/TrueCallerModule.ts';
import { requestHint } from 'react-native-otp-verify';
import { useDispatch } from 'react-redux';
import { colors as configColors } from 'config-types/src/domain/default/themes/colors.ts';
import { VERSION } from '@/version.ts';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import { MERCHANT_CLIENT_CONFIG } from '@/typescript/constants/common.ts';

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

type LoginScreenProps = {
    navigation: NativeStackNavigationProp<OnboardingNavigationParamList, 'LoginScreen'>;
};

const extractPhoneNumber = (input: string): string => {
    const sanitizedInput = input.replace(/\D/g, '');
    if (sanitizedInput.startsWith('91') && sanitizedInput.length > 10) {
        return sanitizedInput.slice(sanitizedInput.length - 10);
    }
    if (sanitizedInput.length > 10) {
        return sanitizedInput.slice(sanitizedInput.length - 10);
    }
    return sanitizedInput;
};

const LoginScreen = ({ navigation }: LoginScreenProps): React.JSX.Element => {
    const dispatch = useDispatch();
    const [phoneNumber, setPhoneNumberInput] = useState('');
    const [phoneNumberError, setPhoneNumberError] = useState('');
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [showCrossIcon, setShowCrossIcon] = useState(false);
    const [hasUserInteracted, setHasUserInteracted] = useState(false);
    const phoneNumberTextInputRef = useRef<TextInput>(null);
    const authValidation = useAuthValidation();
    const [triggerAuthSignature] = useAuthSignaturePostMutation();
    const featureFlags = useAppSelector(selectNewFeatureFlags);
    const configs = MERCHANT_CLIENT_CONFIG.value;

    const [auth, { isLoading }] = useAuthMutation();

    const authReq = {
        merchantId: configs.mobilityMid,
        mobileNumber: phoneNumber,
        mobileCountryCode: '+91',
        allowBlockedUserLogin: true,
    };

    useEffect(() => {
        logEvent(EventName.NY_USER_ENTER_MOB_NUM_SCN_VIEW);
    }, []);

    useEffect(() => {
        if (phoneNumber.length == 0) {
            setPhoneNumberError('');
            phoneNumberTextInputRef?.current?.focus();
        } else if (!validateInput('phoneNumber', phoneNumber, 'india')) {
            setPhoneNumberError(userLanguageStrings.Pleaseenteravalid_Ten_digitnumber);
        } else {
            setPhoneNumberError('');
        }

        if (phoneNumber.length === 10) {
            Keyboard.dismiss();
            AccessibilityInfo.announceForAccessibilityWithOptions('Phone number entered successfully!', {
                queue: false,
            });
        }

        if (phoneNumber.length !== 0) {
            setShowCrossIcon(true);
        } else {
            setShowCrossIcon(false);
        }
    }, [phoneNumber]);

    const handleLogin = async () => {
        if (phoneNumber.length < 10 || !/^\d+$/.test(phoneNumber)) {
            setPhoneNumberError(userLanguageStrings.Pleaseenteravalid_Ten_digitnumber);
            return;
        }
        logEvent(EventName.NY_USER_OTP_TRIGGERED);
        if (phoneNumber) setStringItem(MMKVKey.MOBILE_NUMBER, phoneNumber);
        const senderHash = await getAppSignatures();
        auth({ ...authReq, senderHash })
            .unwrap()
            .then(payload => {
                navigation.navigate(
                    'OTPVerification',
                    {
                        email: '',
                        authId: payload?.authId,
                        phoneNumber: phoneNumber,
                    },
                    { pop: true },
                );
            })
            .catch(error => {
                const errorMessage = getErrorMessageByCode(error?.data?.errorCode, error?.data?.errorMessage);
                showErrorToast(errorMessage);
            });
    };

    const showErrorToast = (message: string) => {
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
    };

    const requestPhoneNumberFromGoogle = async () => {
        try {
            const pNumber = await requestHint();
            console.info('Hash fetched:', pNumber);
            const numVal = extractPhoneNumber(pNumber);
            console.info('Extracted Phone Number:', numVal);
            setPhoneNumberFromAutoSource(numVal);
        } catch (error) {
            console.error('Error fetching pNumber:', error);
        }
    };

    const handlePhoneNumberInput = (text: string) => {
        setPhoneNumberInput(text);
        setHasUserInteracted(true);
        if (text.length == 10) {
            logEvent(EventName.NY_USER_MOBNUM_ENTRY);
            Keyboard.dismiss();
        }
    };

    const setPhoneNumberFromAutoSource = (text: string) => {
        setPhoneNumberInput(text);
        setPhoneNumberError('');
        // Don't set hasUserInteracted to true for auto-filled numbers
    };
    const [focused, setFocus] = useState(true);
    useEffect(() => {
        AccessibilityInfo.announceForAccessibilityWithOptions('Enter mobile number screen', { queue: true });
    }, []);

    const onTrueCallerSDKSuccess = async (tcResp: TrueCallerProfileResp) => {
        Keyboard.dismiss();
        console.info('[TrueCaller] Resp', tcResp);
        logEvent(EventName.TRUECALLER_PROFILE_FETCH_SUCCESS);
        const authPayload = transformTrueCallerRespToAuthReq(tcResp, configs.mobilityMid);
        try {
            const ePayload = await TrueCallerModule.getSignature(JSON.stringify(authPayload));
            logEvent(EventName.TRUECALLER_SIGNATURE_GET_SUCCESS);
            setStringItem(MMKVKey.SIGN_AUTH_REQ, ePayload.signature ?? '');

            if (ePayload != null) {
                console.info('[TrueCaller] Auth Payload', authPayload);
                triggerAuthSignature(JSON.stringify(authPayload))
                    .then(resp => {
                        console.info('[TrueCaller] Auth Resp', resp);
                        logEvent(EventName.TRUECALLER_AUTH_SIGNATURE_SUCCESS);
                        if (resp.data && resp.data.token && resp.data.person) {
                            authValidation(
                                resp.data,
                                tcResp.phone_number,
                                tcResp.email,
                                tcResp.gender,
                                tcResp.given_name,
                                tcResp.birthdate,
                                tcResp.picture,
                                VerificationChannel.TrueCaller,
                            );
                        }
                    })
                    .catch(err => {
                        console.error('[SignAuth] Err', err);
                        const errorCode = err?.data?.errorCode || 'UNKNOWN_AUTH_ERR';
                        showErrorToast(`Auth Failed (${errorCode}): ${err?.data?.errorMessage || 'Please try again'}`);
                        logEvent(EventName.TRUECALLER_AUTH_SIGNATURE_FAILURE, { error: JSON.stringify(err) });
                    });
            }
        } catch (error) {
            console.error('[TrueCaller] Signature Err', error);
            const errorMsg = JSON.stringify(error);
            showErrorToast(`TrueCaller Signature Error: ${errorMsg}`);
            logEvent(EventName.TRUECALLER_SIGNATURE_GET_FAILURE, { error: errorMsg });
        }
    };

    useFocusEffect(
        React.useCallback(() => {
            if (!hasUserInteracted) {
                if (
                    Platform.OS === 'android' &&
                    TrueCallerModule &&
                    TrueCallerModule.initTrueCallerSDK &&
                    featureFlags.enableTrueCaller
                ) {
                    TrueCallerModule.initTrueCallerSDK()
                        .then(tcResp => {
                            logEvent(EventName.TRUECALLER_INIT_SUCCESS);
                            onTrueCallerSDKSuccess(tcResp);
                        })
                        .catch(err => {
                            console.error('[TrueCaller] Err', err);
                            logEvent(EventName.TRUECALLER_INIT_FAILURE, { error: JSON.stringify(err) });
                            if (Platform.OS == 'android') {
                                requestPhoneNumberFromGoogle();
                            }
                        });
                } else {
                    if (Platform.OS == 'android') {
                        requestPhoneNumberFromGoogle();
                    }
                }
            }
        }, [hasUserInteracted]),
    );

    const handleHeaderLongPress = () => {
        dispatch(
            setToastProps({
                visible: true,
                message: 'Bundle Version - ' + (VERSION || '--'),
                backgroundColor: '#374151',
                autoDismissAfter: undefined,
                logo: undefined,
                buttons: [],
                useSpannedToast: undefined,
                bottomSpanDescription: undefined,
                spannerType: undefined,
                dismissButton: undefined,
                onSpannedToastLoad: undefined,
                customToast: undefined,
                margin: undefined,
            }),
        );
    };

    const { bottom } = useSafeAreaInsets();

    return (
        <TouchableWithoutFeedback
            testID="login_backdrop"
            onPress={Keyboard.dismiss}
            accessible={false}
            accessibilityRole="button">
            <KeyboardAvoidingView
                style={styles.container}
                behavior={'padding'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? -10 : -(bottom - 28)}>
                <View style={styles.innerContainer}>
                    <View style={tailwind.style('bg-[#ffffff00] rounded-lg ')}>
                        <Pressable
                            onLongPress={handleHeaderLongPress}
                            testID="login_header_back_pressable"
                            accessibilityRole="button"
                            accessibilityLabel="Let's get you trip-ready! button"
                            accessible={false}>
                            <Header
                                title="Let's get you trip-ready!"
                                navigation={navigation}
                                stepIndicator={{ currentStep: 1, totalSteps: 3 }}
                                testID="login_header_back"
                            />
                        </Pressable>
                    </View>
                    <View style={tailwind.style('bg-[#ffffff] mx-4 rounded-3xl my-3 py-5 px-4')}>
                        <Text style={tailwind.style('font-regular text-base ')} accessible={false}>
                            {userLanguageStrings.EnteryourMobileNumber}
                        </Text>
                        <View style={tailwind.style(`flex-row my-1`)}>
                            <View
                                style={tailwind.style(
                                    ' border-[1px] py-3 border-[#E0E3E8] flex-1 rounded-md mr-2 justify-center items-center',
                                )}>
                                <Typography
                                    accessible={false}
                                    style={tailwind.style(` text-black justify-center items-center`)}
                                    type="body-subtext"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {' 🇮🇳 ' + '+91'}
                                </Typography>
                            </View>
                            <Input
                                ref={phoneNumberTextInputRef}
                                type="secondary"
                                placeholder={userLanguageStrings.digitmobilenumber(10)}
                                inputMode="numeric"
                                value={phoneNumber}
                                autoFocus={true}
                                onFocus={() => setFocus(true)}
                                onBlur={() => setFocus(false)}
                                onChangeText={handlePhoneNumberInput}
                                placeholderTextColor={themeColors.Fill_neutralLow}
                                maxLength={10}
                                style={tailwind.style(`body-1 text-[14px] mb-[0px]`)}
                                containerStyle={tailwind.style(`rounded-md border-[1px] flex-4
                                        ${
                                            phoneNumberError === ''
                                                ? focused
                                                    ? `border-[#A3A3A3]`
                                                    : 'border-[#E0E3E8]'
                                                : `border-[${sharedStyles.errorColor.color}]`
                                        }`)}
                                suffix={
                                    <Pressable
                                        testID="onboarding_login_clear_phone"
                                        accessible={true}
                                        accessibilityRole="imagebutton"
                                        accessibilityLabel="Clear phone number button"
                                        onPress={() => {
                                            setPhoneNumberInput('');
                                            setHasUserInteracted(true);
                                            phoneNumberTextInputRef?.current?.clear();
                                        }}>
                                        <View
                                            style={tailwind.style(
                                                ` ${showCrossIcon ? 'visible' : 'hidden'} -mr-4 p-3`,
                                            )}>
                                            <CrossIcon fill={configColors.neutral900} />
                                        </View>
                                    </Pressable>
                                }
                                prefix={undefined}
                                accessibleLabel={undefined}
                            />
                        </View>
                        {phoneNumberError ? (
                            <Typography
                                style={tailwind.style(` text-[${sharedStyles.errorColor.color}]`)}
                                type="body-subtext"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {phoneNumberError}
                            </Typography>
                        ) : undefined}
                    </View>
                    <Animated.View style={[styles.termsAndConditions]} accessible={false}>
                        <TermsAndConditions />
                        <CustomButton
                            style={tailwind.style(` mb-${bottom}px `)}
                            textColor={
                                !isLoading &&
                                validateInput('phoneNumber', phoneNumber, 'india') &&
                                phoneNumber.length == 10
                                    ? themeColors.Button_Primary_Default_Text_Base
                                    : '#B2B9C7'
                            }
                            bgColor={
                                !isLoading &&
                                validateInput('phoneNumber', phoneNumber, 'india') &&
                                phoneNumber.length == 10
                                    ? themeColors.Button_primary_default_fill_base
                                    : '#F1F2F7'
                            }
                            loading={isLoading}
                            buttonText={userLanguageStrings.Continue}
                            onClick={handleLogin}
                            textStyle={{ fontSize: 18, fontWeight: '600' }}
                            disabled={isLoading || !validateInput('phoneNumber', phoneNumber, 'india')} // Disable button if validation fails
                            leftIcon={undefined}
                            testID="login_continue_button"
                        />
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    termsAndConditions: {
        width: '100%',
        position: 'absolute',
        bottom: 0,
    },
    container: {
        flex: 1,
        backgroundColor: colors.primitive.gray[11],
    },
    innerContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingBottom: 20,
        backgroundColor: colors.primitive.gray[11],
    },
    touchableWrapper: {
        alignItems: 'center',
        padding: 5,
    },
});

export default LoginScreen;
