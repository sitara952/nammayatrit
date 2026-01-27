import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import colors from '../designSystem/colorPalette';
import Typography from '../designSystem/components/primitives/Typography';
import { tailwind } from '../tailwindTheme/tailwind';

import { useAppSelector, useAppDispatch } from '../state/hooks';
import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { selectAppConfig, setToastProps } from '../state/client/session';
import { getEnvironmentName } from '@/src-v2/systems/logger';
import { ScrollView } from 'react-native-gesture-handler';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '../context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Header } from '@/src-v2/primitives/Header';

import { EventName, logEvent } from '../../../src/typescript/utils/logger';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '../../../src/typescript/navigation/globalParamList';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '../utils/useHaptic';
import { VERSION } from '@/version';
import { selectUserProfile } from '../state/client/user';
import { useAuthGeneratetempappcodePostMutation } from '@/api/integrations/rtk/AuthGenerate-temp-app-codePost';
import {
    enableDebugNotifications,
    disableDebugNotifications,
    isDebugNotificationsEnabled,
} from '../utils/debugNotificationManager';

const AboutScreen = () => {
    const [appVersion, setAppVersion] = useState('');
    const [buildNumber, setBuildNumber] = useState('');
    const [accessCode, setAccessCode] = useState<string>('');
    const appConfig = useAppSelector(selectAppConfig);
    const appNameString = appConfig.textConfig.appReadableName;
    const userProfile = useAppSelector(selectUserProfile);
    const currentLanguage = userProfile?.language;
    const [generateTempCode] = useAuthGeneratetempappcodePostMutation();
    const dispatch = useAppDispatch();

    useEffect(() => {
        setAppVersion(DeviceInfo.getVersion());
        setBuildNumber(DeviceInfo.getBuildNumber());
    }, []);

    useEffect(() => {
        const fetchAccessCode = async () => {
            try {
                const result = await generateTempCode({}).unwrap();
                setAccessCode(result.tempCode);
            } catch (error) {
                console.error('Error fetching access code:', error);
                setAccessCode('NO_TOKEN_AVAILABLE');
            }
        };

        fetchAccessCode();
    }, []);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleTermsClick = () => {
        try {
            Linking.openURL(appConfig.constants.termsAndConditionLink);
        } catch (error) {
            console.error('Error opening TERMS_AND_CONDITIONS', error);
        }
    };

    const handleCorporateAddressClick = () => {
        // Increment click counter for debug feature activation
        setTermsClickCount(prev => prev + 1);
    };

    const handlePrivacyPolicy = () => {
        try {
            Linking.openURL(appConfig.constants.privacyPolicyLink);
        } catch (error) {
            console.error('Error opening PRIVACY_POLICY', error);
        }
    };

    const refundPolicyLink = appConfig.constants.refundPolicyLink;
    const handleRefundPolicy = () => {
        if (refundPolicyLink) {
            Linking.openURL(refundPolicyLink);
        }
    };
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const onBackPress = () => {
        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
        navigation.goBack();
        return true;
    };

    const Stacknavigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const [clickCount, setClickCount] = useState(0);
    const [termsClickCount, setTermsClickCount] = useState(0);

    useEffect(() => {
        if (clickCount > 2) {
            handleiconclick();
            setClickCount(0);
        }
    }, [clickCount]);

    useEffect(() => {
        if (termsClickCount >= 10) {
            // Toggle debug notifications
            if (isDebugNotificationsEnabled()) {
                disableDebugNotifications();
                hapticEffect(HapticFeedbackTypes.notificationWarning, undefined);
                console.info('[AboutScreen] Debug notifications disabled');

                // Show toast for disabled state
                dispatch(
                    setToastProps({
                        visible: true,
                        message: 'Debug Event Notifications Disabled',
                        backgroundColor: '#EF4444',
                        autoDismissAfter: 3000,
                        logo: undefined,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: 'bottom',
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        customToast: undefined,
                        margin: undefined,
                    }),
                );
            } else {
                enableDebugNotifications();
                hapticEffect(HapticFeedbackTypes.notificationSuccess, undefined);
                console.info('[AboutScreen] Debug notifications enabled');

                // Show toast for enabled state
                dispatch(
                    setToastProps({
                        visible: true,
                        message: 'Debug Event Notifications Enabled',
                        backgroundColor: '#10B981',
                        autoDismissAfter: 3000,
                        logo: undefined,
                        buttons: [],
                        useSpannedToast: undefined,
                        bottomSpanDescription: undefined,
                        spannerType: 'bottom',
                        dismissButton: undefined,
                        onSpannedToastLoad: undefined,
                        customToast: undefined,
                        margin: undefined,
                    }),
                );
            }
            setTermsClickCount(0);
        }
    }, [termsClickCount, dispatch]);

    const handleProfilePress = () => {
        setClickCount(prev => prev + 1);
    };

    const handleiconclick = () => {
        logEvent(EventName.NY_USER_MOCK_LOCATION);
        Stacknavigation.navigate(
            'ProfileTab',
            {
                screen: 'mockCityScreen',
            },
            { pop: true },
        );
    };

    const handleLongPressIcon = () => {
        Stacknavigation.navigate(
            'ProfileTab',
            {
                screen: 'nearbyBusTracking',
            },
            { pop: true },
        );
    };

    return (
        <HardwareBackpressHandler>
            <Animated.View style={tailwind.style(`bg-[${colors.primitive.white[10]}]`)}>
                <Animated.View style={tailwind.style(`bg-[${colors.primitive.white[10]}] h-full `)}>
                    <Header title={userLanguageStrings.About} onBackPress={onBackPress} />
                    <ScrollView>
                        <Animated.View style={styles.body}>
                            <Pressable
                                accessibilityRole="button"
                                testID="app-logo-pressable"
                                accessibilityLabel={`App Logo button`}
                                onLongPress={handleLongPressIcon}
                                delayLongPress={5000}
                                onPress={handleProfilePress}>
                                <Animated.Image
                                    accessible={true}
                                    accessibilityLabel="about app logo image"
                                    source={{ uri: 'about_app_logo' }}
                                    style={[tailwind.style('h-14 w-48'), { resizeMode: 'contain' }]}
                                />
                            </Pressable>
                            {appNameString.includes('Bharat Taxi') ? (
                                <Typography
                                    type={'subhead-700'}
                                    style={tailwind.style('text-center')}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {userLanguageStrings.AnInitiativeOfSahakarTaxiCooperativeLimited}
                                </Typography>
                            ) : null}
                            <Animated.View style={tailwind.style('mt-[24px] flex-row')}>
                                <Typography
                                    type={'subhead-600'}
                                    style={tailwind.style('text-center text-justify')}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {currentLanguage === 'TAMIL' && appNameString === 'Chennai One'
                                        ? `${userLanguageStrings.appDescription(appNameString)}`
                                        : `${appNameString} ${userLanguageStrings.appDescription(appNameString)}`}
                                </Typography>
                            </Animated.View>
                            <Pressable
                                accessibilityRole="button"
                                testID="about_terms_conditions"
                                accessibilityLabel={`Terms and Conditions button`}
                                onPress={handleTermsClick}>
                                <Animated.View
                                    style={tailwind.style(
                                        `py-[10px] px-[16px] rounded-[50px] mt-[32px] bg-[${colors.primitive.gray[16]}]`,
                                    )}>
                                    <Typography
                                        type="body-1"
                                        style={undefined}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.TermsandConditions}
                                    </Typography>
                                </Animated.View>
                            </Pressable>
                            {appNameString.includes('Kerala Savaari') ? (
                                <></>
                            ) : (
                                <Pressable
                                    accessibilityRole="button"
                                    testID="about_privacy_policy"
                                    accessibilityLabel="Privacy Policy button"
                                    onPress={handlePrivacyPolicy}>
                                    <Animated.View
                                        style={tailwind.style(
                                            `py-[10px] px-[22px] rounded-[50px] mt-[10px] bg-[${colors.primitive.gray[16]}]`,
                                        )}>
                                        <Typography
                                            type="body-1"
                                            style={undefined}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {userLanguageStrings.PrivacyPolicy}
                                        </Typography>
                                    </Animated.View>
                                </Pressable>
                            )}
                            {refundPolicyLink ? (
                                <Pressable
                                    accessibilityRole="button"
                                    testID="ff46f237-fe75-429e-bc54-f310b3b2a8df"
                                    accessibilityLabel="Refund Policy button"
                                    onPress={handleRefundPolicy}>
                                    <Animated.View
                                        style={tailwind.style(
                                            `py-[10px] px-[16px] rounded-[50px] mt-[10px] bg-[${colors.primitive.gray[16]}]`,
                                        )}>
                                        <Typography
                                            type="body-1"
                                            style={undefined}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {userLanguageStrings.RefundPolicy}
                                        </Typography>
                                    </Animated.View>
                                </Pressable>
                            ) : (
                                <></>
                            )}
                        </Animated.View>
                        <Animated.View style={tailwind.style(` mt-4 flex-row justify-between items-start`)}>
                            {appNameString.includes('Odisha') ||
                            appNameString.includes('Yatri Sathi') ||
                            appNameString.includes('Bridge') ||
                            appNameString.includes('Kerala Savaari') ? (
                                <></>
                            ) : (
                                <Animated.View
                                    style={tailwind.style('border border-[#E0E3E8]  m-2 mr-0 rounded-xl p-2 flex-1')}>
                                    <Pressable
                                        accessibilityRole="button"
                                        testID="corporate_address_heading"
                                        accessibilityLabel="Corporate Address heading"
                                        onPress={handleCorporateAddressClick}>
                                        <Typography
                                            type="subhead-2"
                                            style={tailwind.style('text-gray-700 mb-2 ')}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {userLanguageStrings.CorporateAddress}
                                        </Typography>
                                    </Pressable>
                                    <Typography
                                        type="body-subtext"
                                        style={tailwind.style('text-gray-500 ')}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.CorporateAddressDescription(appNameString)}
                                    </Typography>
                                    <Typography
                                        type="body-subtext"
                                        style={tailwind.style('text-gray-500')}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.address_description_additional(appNameString)}
                                    </Typography>
                                </Animated.View>
                            )}
                            {appNameString.includes('Yatri Sathi') || appNameString.includes('Bridge') ? (
                                <></>
                            ) : (
                                <Animated.View
                                    style={tailwind.style('border border-[#E0E3E8] m-2 rounded-xl p-2 flex-1')}>
                                    <Typography
                                        type="subhead-2"
                                        style={tailwind.style('text-gray-700 mb-2 ')}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.registered_address}
                                    </Typography>
                                    <Typography
                                        type="body-subtext"
                                        style={tailwind.style('text-gray-500 ')}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.registered_address_description(appNameString)}
                                    </Typography>
                                    <Typography
                                        type="body-subtext"
                                        style={tailwind.style('text-gray-500')}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {userLanguageStrings.address_description_additional(appNameString)}
                                    </Typography>
                                </Animated.View>
                            )}
                        </Animated.View>
                        <Animated.View style={tailwind.style('w-full items-center justify-center py-4')}>
                            <Typography
                                type="micro"
                                style={tailwind.style('text-gray-500 text-sm')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {`v${appVersion}(${buildNumber}) (${VERSION})`}
                            </Typography>
                            <Typography
                                type="micro"
                                style={tailwind.style('text-gray-500 text-sm pb-1')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {getEnvironmentName()}
                            </Typography>
                            <Typography
                                type="micro"
                                style={tailwind.style('text-gray-500 text-sm pb-4')}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {`Access Code: ${accessCode || 'Loading...'}`}
                            </Typography>
                        </Animated.View>
                    </ScrollView>
                </Animated.View>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    body: {
        marginHorizontal: 24,
        alignItems: 'center',
        marginTop: 28,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginHorizontal: 16,
        width: 48,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
        borderColor: colors.primitive.gray?.[14],
        borderWidth: 1,
        borderRadius: 20,
    },
});

export default AboutScreen;
