import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ToastAndroid,
    TextInput,
    Platform,
    AccessibilityInfo,
    ActivityIndicator,
    NativeModules,
    Keyboard,
} from 'react-native';
import Header from '../../components/Header.tsx';
import CustomButton from '../../components/common/CustomButton.tsx';
import Dropdown from '@/src-v2/primitives/Dropdown';
import { SelectionList } from '../../components/SelectionList.tsx';
import sharedStyles from '../../constants/style.tsx';
import DisabilityScreen from '../../components/DisabilityScreen.tsx';
import { useRefsContext } from '../../context/RefsContext.tsx';
import {
    initialUpdateProfileReq,
    useLazyGetProfileQuery,
    useUpdateProfileMutation,
} from '@/typescript/state/server/userApi.ts';
import { validateInput } from '@/typescript/utils/common.ts';
import CleverTap from 'clevertap-react-native';

import { tailwind } from '@/typescript/tailwindTheme/tailwind.ts';
import Typography from '@/typescript/designSystem/components/primitives/Typography.tsx';
import Input from '../../designSystem/components/primitives/Input.tsx';
import CrossIcon from '@/typescript/assets/svg/symbols/Cross.tsx';
import { getBoolItem, MMKVKey, setBoolItem, setStringItem } from '../../utils/MMKV';
import { PopUpModal } from '@/typescript/components/PopUpModal.tsx';
import { EventName, logEvent } from '@/typescript/utils/logger';
import { englishStrings } from 'config-types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { OnboardingNavigationParamList } from '@/typescript/navigation/globalParamList.tsx';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable } from '@/src-v2/primitives/Pressable';
import Tick from '@/typescript/components/svg/Tick.tsx';
import CloseIconWhite from '@/typescript/components/svg/CloseIconWhite.tsx';
import { usePersonApplyReferralPostMutation } from '@/api/integrations/rtk/PersonApplyReferralPost.ts';

const { AppInfoModule } = NativeModules;
import { updateProfileReq } from '@/readOnly/api/types/UpdateProfileReq.gen';
import { colors } from 'config-types/src/domain/default/themes/colors.ts';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets.ts';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks.ts';
import { selectAppConfig, selectAppName, selectUtmParams, setUtmParams } from '@/typescript/state/client/session.ts';
import { useDisabilityListGetQuery } from '@/api/integrations/rtk/DisabilityListGet.ts';
import { disability } from '@/readOnly/api/types/Disability.gen.tsx';
import { decodeGender, toScreamingSnakeCase } from '@/src-v2/utils/common.ts';
import { recordCampaignMetric } from '@/typescript/utils/marketingTracking';

type verificationStageType = 'Default' | 'Verifying' | 'Success' | 'Failed';

export interface UpdateProfileNavProps {
    preFillEmail: string | undefined;
    preFillName: string | undefined;
    preFillGender: string | undefined;
}

const UpdateProfile: React.FC<{}> = () => {
    const navigation = useNavigation<NativeStackNavigationProp<OnboardingNavigationParamList>>();
    const { preFillEmail, preFillGender, preFillName } =
        useRoute<RouteProp<OnboardingNavigationParamList, 'UpdateProfile'>>().params;
    const userNameTextInputRef = useRef<TextInput>(null);
    const emailTextInputRef = useRef<TextInput>(null);
    const { bottom } = useSafeAreaInsets();
    const { data, error } = useDisabilityListGetQuery({});
    const [fullName, setFullName] = useState<string>('');
    const [fullNameError, setFullNameError] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<string>('');
    const [gender, setGender] = useState<string>('');
    const { disabilityScreenBottomSheetModalRef } = useRefsContext();
    const [genderError, setGenderError] = useState<string>('');
    const [disabilityError, setDisabilityError] = useState<string>('');
    const [selectedDisability, setSelectedDisability] = useState<number>(-1);
    const [hideAssesibility, setHideAssesibility] = useState(false);

    useEffect(() => {
        preFillName && setFullName(preFillName);
        preFillEmail && setEmail(preFillEmail);
        preFillGender && setGender(preFillGender === 'male' ? 'MALE' : 'FEMALE');
    }, [preFillEmail, preFillGender, preFillName]);

    const [showNameCrossIcon, setShowNameCrossIcon] = useState(false);
    const [showEmailCrossIcon, setShowEmailCrossIcon] = useState(false);
    const selectedDisabilityStr = useRef<disability>({
        description: '',
        id: '',
        tag: '',
    });
    const [disabilityData, setDisabilityData] = useState<disability[]>([]);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const [referralCode, setReferralCode] = useState('');
    const [referralError, setReferralError] = useState(false);
    const [verificationStage, setVerificationStage] = useState<verificationStageType>('Default');
    const utmParams = useAppSelector(selectUtmParams);
    const appName = useAppSelector(selectAppName);
    const appConfig = useAppSelector(selectAppConfig);
    const useNameOnlyOnboarding = appConfig.uiConfig.useNameOnlyOnboarding;
    const isUtmDataSend = getBoolItem(MMKVKey.UTM_DATA_SEND);
    const dispatch = useAppDispatch();

    const [applyReferral, { isLoading }] = usePersonApplyReferralPostMutation();

    useEffect(() => {
        if (data) {
            setDisabilityData(data);
        } else if (error) {
            ToastAndroid.show('Error fetching disability data', ToastAndroid.SHORT);
        }
    }, [data, error]);

    const handleOnFullnameChange = (val: string) => {
        setFullName(val);
        setFullNameError('');
        setShowNameCrossIcon(val !== '');
    };

    const handleOnEmailChange = (val: string) => {
        setEmail(val);
        setEmailError('');
        setShowEmailCrossIcon(val !== '');
    };

    const handleOnGenderSelect = (val: string) => {
        setGender(val);
        setGenderError('');
    };

    useEffect(() => {
        if (isLoading) {
            setVerificationStage('Verifying');
        }
    }, [isLoading]);

    const onSubmit = async () => {
        // Validate all fields using early returns
        const fullNameValid = fullName.length >= 3;
        const emailValid = validateInput('email', email, undefined);
        const genderValid = gender !== '';
        const disabilityValid = true;

        if (!fullNameValid) {
            setFullNameError(
                fullName.length === 0
                    ? userLanguageStrings.Nameisrequired
                    : userLanguageStrings.Enteratleast_characters(3),
            );
            AccessibilityInfo.announceForAccessibilityWithOptions(
                fullName.length === 0 ? englishStrings.Nameisrequired : englishStrings.Enteratleast_characters(3),
                { queue: true },
            );
        }
        if (!useNameOnlyOnboarding) {
            if (!emailValid) {
                setEmailError(userLanguageStrings.Entervalidemail);
                AccessibilityInfo.announceForAccessibilityWithOptions(englishStrings.Entervalidemail, {
                    queue: true,
                });
            }
            if (!genderValid) {
                setGenderError(userLanguageStrings.Genderisrequired);
                AccessibilityInfo.announceForAccessibilityWithOptions(englishStrings.Genderisrequired, {
                    queue: true,
                });
            }
            if (!disabilityValid) {
                setDisabilityError(userLanguageStrings.Pleasechooseoneoption);
                AccessibilityInfo.announceForAccessibilityWithOptions(englishStrings.Pleasechooseoneoption, {
                    queue: true,
                });
            }
        }

        if (!useNameOnlyOnboarding) {
            if (!fullNameValid || !emailValid || !genderValid || !disabilityValid) {
                return;
            }
        } else {
            if (!fullNameValid) {
                return;
            }
        }

        if (selectedDisability === 1 && selectedDisabilityStr.current.description === '') {
            setHideAssesibility(true);
            disabilityScreenBottomSheetModalRef.current?.present();
            return;
        }
        const nameParts = fullName.trim().split(/\s+/);
        const hasMiddleName = nameParts.length > 2;
        const updatedGender = toScreamingSnakeCase(gender);
        const deviceId = await AppInfoModule.getDeviceId();
        const resolveDeviceId = !deviceId || deviceId === 'NO_DEVICE_ID' ? undefined : deviceId;
        const updateProfileReq: updateProfileReq = {
            ...initialUpdateProfileReq,
            disability: useNameOnlyOnboarding ? undefined : selectedDisabilityStr.current,
            email: email !== '' ? email : undefined,
            firstName: nameParts[0],
            gender: useNameOnlyOnboarding ? undefined : decodeGender(updatedGender),
            hasDisability: useNameOnlyOnboarding ? undefined : selectedDisability === 1,
            lastName: hasMiddleName ? nameParts[2] : nameParts[1],
            middleName: hasMiddleName ? nameParts[1] : undefined,
            deviceId: resolveDeviceId,
            referralCode: undefined,
            marketingParams:
                utmParams &&
                (utmParams.gclid || (utmParams.utm_medium !== 'organic' && utmParams.utm_source !== 'google-play'))
                    ? {
                          gclId: utmParams.gclid,
                          utmCampaign: utmParams.utm_campaign,
                          utmContent: utmParams.utm_content,
                          utmCreativeFormat: utmParams.utm_creative_format,
                          utmMedium: utmParams.utm_medium,
                          utmSource: utmParams.utm_source,
                          utmTerm: utmParams.utm_term,
                          userType: isUtmDataSend ? 'OLD' : 'NEW',
                          appName: appName,
                      }
                    : undefined,
        };

        updateProfile(updateProfileReq)
            .unwrap()
            .then(() => {
                if (fullName) setStringItem(MMKVKey.USER_NAME, fullName);

                // Record signup in Firestore if campaignId is present
                if (utmParams?.campaignId) {
                    recordCampaignMetric(utmParams.campaignId, 'signups');
                }

                dispatch(setUtmParams(null));
                setBoolItem(MMKVKey.UTM_DATA_SEND, true);
                const profile = {
                    gender: updatedGender,
                    email: email !== '' ? email : undefined,
                    Name: nameParts[0],
                };
                CleverTap.profileSet(profile);
                logEvent(EventName.NY_USER_ONBOARDED);
                getProfile();
            });
    };
    const [updateProfile] = useUpdateProfileMutation();
    const [getProfile] = useLazyGetProfileQuery();

    const [focuses, setFocuses] = useState([0, 0, 0]);

    useEffect(() => {
        setTimeout(() => {
            userNameTextInputRef?.current?.focus();
            setFocuses(_prev => [1, 0, 0]);
        }, 100);
    }, []);

    const verifyButtonContent = useMemo(() => {
        switch (verificationStage) {
            case 'Verifying':
                return {
                    icon: <ActivityIndicator color={'#FFFFFF'} size="small" />,
                    text: 'Verifying',
                    backgroundColor: '#5c6777',
                    textColor: '#FFFFFF',
                    borderColor: '#E1E3E7',
                };
            case 'Success':
                return {
                    icon: <Tick fill="white" size={10} />,
                    text: 'Verified',
                    backgroundColor: '#14A255',
                    textColor: '#FFFFFF',
                    borderColor: '#14A255',
                };
            case 'Failed':
                return {
                    icon: <CloseIconWhite />,
                    text: 'Failed',
                    backgroundColor: '#FF3B30',
                    textColor: '#FFFFFF',
                    borderColor: '#FF3B30',
                };
            default:
                return {
                    icon: null,
                    text: 'Verify',
                    backgroundColor: referralCode.length === 0 ? '#bbd5fc' : '#1D74F6',
                    textColor: '#FFFFFF',
                    borderColor: '#E0E3E8',
                };
        }
    }, [verificationStage, referralCode.length]);

    const handleVerifyReferral = async () => {
        if (!referralCode || referralCode.length < 6) {
            setReferralError(true);
            setVerificationStage('Failed');
            return;
        }
        applyReferral({
            body: {
                code: referralCode,
                androidId: undefined,
                deviceId: undefined,
                gps: undefined,
            },
        })
            .unwrap()
            .then(() => {
                setVerificationStage('Success');
                setReferralError(false);
                logEvent(EventName.NY_USER_REFERRAL_CODE_APPLIED);
                logEvent(EventName.NY_USER_SIGNED_UP_WITH_REFERRAL);
            })
            .catch(() => {
                setVerificationStage('Failed');
                setReferralError(true);
            });
    };

    const handleReferralCodeChange = (text: string) => {
        setReferralCode(text);
        setReferralError(false);
        if (verificationStage !== 'Default') {
            setVerificationStage('Default');
        }
    };

    return (
        <View style={styles.container}>
            <Header
                title={useNameOnlyOnboarding ? "What's your name?" : userLanguageStrings.Letsgetyoutripready}
                navigation={navigation}
                stepIndicator={useNameOnlyOnboarding ? undefined : { currentStep: 3, totalSteps: 3 }}
                accessibilityElementsHidden={hideAssesibility}
                importantForAccessibility={hideAssesibility ? 'no-hide-descendants' : 'yes'}
                testID="onboarding_profile_header_back"
            />

            <KeyboardAwareScrollView
                bottomOffset={Platform.OS === 'android' ? 40 + bottom : 0}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                accessibilityElementsHidden={hideAssesibility}
                importantForAccessibility={hideAssesibility ? 'no-hide-descendants' : 'yes'}
                showsVerticalScrollIndicator={false}>
                <View style={styles.formContainer}>
                    <View style={tailwind.style('bg-[#ffffff] rounded-3xl pt-5')}>
                        <Typography
                            type="body-7"
                            style={tailwind.style('mb-2')}
                            accessible={false}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.FullName_Helpsdriverconfirmitisyou + '*'}
                        </Typography>
                        <Input
                            value={fullName}
                            ref={userNameTextInputRef}
                            type="secondary"
                            placeholder=""
                            inputMode="text"
                            autoFocus
                            onFocus={() => setFocuses(_prev => [1, 0, 0])}
                            onBlur={() => setFocuses(_prev => [0, 0, 0])}
                            onChangeText={handleOnFullnameChange}
                            placeholderTextColor="#E0E3E8"
                            style={tailwind.style(' text-[16px] mt-[2.5px] py-2')}
                            accessibleLabel="Enter your name"
                            containerStyle={tailwind.style(
                                `rounded-md border-[1px] flex-4 ${
                                    fullNameError === ''
                                        ? focuses[0]
                                            ? 'border-[#A3A3A3]'
                                            : 'border-[#E0E3E8]'
                                        : `border-[${sharedStyles.errorColor.color}]`
                                }`,
                            )}
                            suffix={
                                <View style={tailwind.style(` ${showNameCrossIcon ? 'visible' : 'hidden'}`)}>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Clear name button"
                                        testID="onboarding_profile_clear_name"
                                        onPress={() => {
                                            userNameTextInputRef?.current?.clear();
                                            setFullName('');
                                            setFullNameError('');
                                            setShowNameCrossIcon(false);
                                        }}
                                        style={{ padding: 12 }}>
                                        <CrossIcon fill={colors.neutral900} />
                                    </Pressable>
                                </View>
                            }
                            prefix={undefined}
                        />
                        {fullNameError ? (
                            <Typography
                                style={tailwind.style(`text-[${sharedStyles.errorColor.color}] py-1`)}
                                type="body-subtext"
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {fullNameError}
                            </Typography>
                        ) : undefined}
                    </View>
                    {!useNameOnlyOnboarding && (
                        <>
                            {/* ----Email TextInput----- */}
                            <View style={tailwind.style('bg-[#ffffff] rounded-3xl pt-3')}>
                                <Typography
                                    type="body-7"
                                    style={tailwind.style('mb-2')}
                                    accessible={false}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.Email}
                                </Typography>
                                <Input
                                    ref={emailTextInputRef}
                                    type="secondary"
                                    placeholder=""
                                    inputMode="email"
                                    value={email}
                                    accessibleLabel="Enter your email, Optional"
                                    onFocus={() => setFocuses(_prev => [0, 1, 0])}
                                    onBlur={() => setFocuses(_prev => [0, 0, 0])}
                                    onChangeText={handleOnEmailChange}
                                    placeholderTextColor="#E0E3E8"
                                    style={tailwind.style(' text-[16px] mt-[2.5px] py-2')}
                                    containerStyle={tailwind.style(
                                        `rounded-md border-[1px]  flex-4 ${
                                            emailError === ''
                                                ? emailTextInputRef?.current?.isFocused()
                                                    ? 'border-[#A3A3A3]'
                                                    : 'border-[#E0E3E8]'
                                                : `border-[${sharedStyles.errorColor.color}]`
                                        }`,
                                    )}
                                    suffix={
                                        <View style={tailwind.style(` ${showEmailCrossIcon ? 'visible' : 'hidden'}`)}>
                                            <Pressable
                                                testID="onboarding_profile_clear_email"
                                                onPress={() => {
                                                    emailTextInputRef?.current?.clear();
                                                    setEmail('');
                                                    setEmailError('');
                                                    setShowEmailCrossIcon(false);
                                                }}
                                                style={{ padding: 12 }}
                                                accessibilityLabel="Clear email button"
                                                accessibilityRole="imagebutton">
                                                <CrossIcon fill={colors.neutral900} />
                                            </Pressable>
                                        </View>
                                    }
                                    prefix={undefined}
                                />
                                {emailError ? (
                                    <Typography
                                        style={tailwind.style(`text-[${sharedStyles.errorColor.color}] mb-1`)}
                                        type="body-subtext"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {emailError}
                                    </Typography>
                                ) : undefined}
                            </View>
                            <Dropdown
                                label={userLanguageStrings.Gender + '*'}
                                placeHolder={userLanguageStrings.SelectYourGender}
                                errorText={genderError}
                                preSelectedValue={
                                    preFillGender
                                        ? {
                                              text:
                                                  preFillGender === 'male'
                                                      ? userLanguageStrings.Male
                                                      : userLanguageStrings.Female,
                                              icon: undefined,
                                          }
                                        : undefined
                                }
                                dropDownItems={[
                                    {
                                        text: userLanguageStrings.Male,
                                        icon: undefined,
                                    },
                                    {
                                        text: userLanguageStrings.Female,
                                        icon: undefined,
                                    },
                                    {
                                        text: userLanguageStrings.Other,
                                        icon: undefined,
                                    },
                                    {
                                        text: userLanguageStrings.Prefernottosay,
                                        icon: undefined,
                                    },
                                ]}
                                onSelect={handleOnGenderSelect}
                                maxTextLen={undefined}
                                style={undefined}
                                showSelectedItem={undefined}
                                touchableContainerStyle={undefined}
                                dropdownContainerStyle={undefined}
                                itemTextStyle={undefined}
                                onPress={undefined}
                                labelTextStyle={undefined}
                            />
                            <View style={tailwind.style('bg-[#ffffff] rounded-3xl pt-3')}>
                                <Typography
                                    type="body-7"
                                    style={tailwind.style('mb-1')}
                                    accessible={false}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {'Referral Code'}
                                </Typography>
                                <View
                                    style={[
                                        styles.referralInputContainer,
                                        {
                                            borderColor:
                                                focuses[2] && verificationStage === 'Default'
                                                    ? '#A3A3A3'
                                                    : verificationStage !== 'Default' && focuses[2]
                                                      ? verifyButtonContent.borderColor
                                                      : '#E0E3E8',
                                        },
                                    ]}>
                                    <TextInput
                                        accessibilityLabel="Text input field"
                                        style={styles.referralInput}
                                        placeholder={userLanguageStrings.EnterReferralCode}
                                        value={referralCode}
                                        onChangeText={handleReferralCodeChange}
                                        onFocus={() => {
                                            setFocuses(_prev => [0, 0, 1]);
                                        }}
                                        onBlur={() => setFocuses(_prev => [0, 0, 0])}
                                        editable={verificationStage !== 'Success'}
                                    />
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Verify Referral button"
                                        testID="onboarding_profile_verify_referral"
                                        style={[
                                            styles.verifyButton,
                                            {
                                                backgroundColor: verifyButtonContent.backgroundColor,
                                                opacity: referralCode.length === 0 ? 0.5 : 1,
                                            },
                                        ]}
                                        onPress={handleVerifyReferral}
                                        disabled={
                                            referralCode.length === 0 ||
                                            verificationStage === 'Verifying' ||
                                            verificationStage === 'Success'
                                        }>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                            {verifyButtonContent.icon}
                                            <Text
                                                style={[
                                                    styles.verifyButtonText,
                                                    { color: verifyButtonContent.textColor },
                                                ]}>
                                                {verifyButtonContent.text}
                                            </Text>
                                        </View>
                                    </Pressable>
                                </View>
                                {referralError && (
                                    <Typography
                                        style={tailwind.style(
                                            `text-[${sharedStyles.errorColor.color}] text-[13px] mb-1 mt-1`,
                                        )}
                                        type="body-subtext"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.pleaseEnterValidReferralCode}
                                    </Typography>
                                )}
                                {verificationStage === 'Success' && (
                                    <Typography
                                        style={tailwind.style('text-[#14A255] ml-2 text-[13px]')}
                                        type="body-subtext"
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.ReferralApplied}
                                    </Typography>
                                )}
                            </View>

                            <View>
                                <SelectionList
                                    label={userLanguageStrings.AreyouaPersonwithDisability}
                                    optionArray={[userLanguageStrings.No, userLanguageStrings.Yes]}
                                    onSelect={idx => {
                                        Keyboard.dismiss();
                                        setSelectedDisability(idx);

                                        setDisabilityError('');

                                        if (idx === 1) {
                                            setHideAssesibility(true);
                                            disabilityScreenBottomSheetModalRef.current?.present();
                                        }
                                    }}
                                    style={tailwind.style('pt-5')}
                                    selectedIndex={undefined}
                                    isSelected={false}
                                    labelStyle={undefined}
                                    disabled={undefined}
                                />
                                {disabilityError && (
                                    <View>
                                        <Text style={{ color: 'red' }}>{disabilityError}</Text>
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </View>
            </KeyboardAwareScrollView>

            <PopUpModal
                onDismiss={() => setHideAssesibility(false)}
                sheetRef={disabilityScreenBottomSheetModalRef}
                enableDynamicSizing={true}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                isScrollable={false}>
                <DisabilityScreen
                    selectedDisabilityStr={selectedDisabilityStr}
                    disabilityData={disabilityData}
                    editSubmit={false}
                    stage={undefined}
                    onSubmitFromProps={undefined}
                />
            </PopUpModal>

            <KeyboardStickyView offset={{ closed: 0, opened: 0 }}>
                <View
                    style={[styles.footer, { paddingBottom: bottom }]}
                    accessibilityElementsHidden={hideAssesibility}
                    importantForAccessibility={hideAssesibility ? 'no-hide-descendants' : 'yes'}>
                    <CustomButton
                        buttonText={userLanguageStrings.Continue}
                        onClick={onSubmit}
                        bgColor={themeColors.Button_primary_default_fill_base}
                        textColor={themeColors.Button_Primary_Default_Text_Base}
                        textStyle={{ fontSize: 16, lineHeight: 24 }}
                        accessibilityLabel="Click to complete profile"
                        leftIcon={undefined}
                        testID="onboarding_profile_continue_button"
                    />
                </View>
            </KeyboardStickyView>
        </View>
    );
};

export default UpdateProfile;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: sharedStyles.fillNeutralLow.color,
    },
    formContainer: {
        backgroundColor: '#ffffff',
        borderColor: sharedStyles.borderNeutralLow.color,
        borderWidth: 1,
        borderRadius: 24,
        marginHorizontal: 16,
        paddingBottom: 10,
        paddingHorizontal: 16,
        fontSize: 14,
        gap: 10,
        marginBottom: 16,
    },
    footer: {
        paddingTop: 16,
        paddingBottom: 16,
        alignItems: 'center',
        backgroundColor: sharedStyles.fillNeutralLow.color,
    },
    referralContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FB',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 12,
        width: '100%',
    },
    text: {
        flex: 1,
        marginTop: 1,
        marginLeft: 8,
        color: 'black',
        fontSize: 14,
    },
    inContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    enter: {
        color: '#1D74F6',
        fontSize: 14,
    },
    imageStyle: {
        width: 20,
        height: 20,
        marginLeft: 8,
    },
    iconStyle: {
        width: 20,
        height: 20,
    },
    referralInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E3E8',
        borderRadius: 8,
        marginTop: 5,
        backgroundColor: '#FFFFFF',
    },
    referralInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000000',
    },
    verifyButton: {
        backgroundColor: '#1D74F6',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 6,
    },
    verifyButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
});
