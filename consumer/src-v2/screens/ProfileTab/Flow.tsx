import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { AppState, AppStateStatus, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectUserProfile } from '@/typescript/state/client/user';
import { useAppSelector } from '@/typescript/state/hooks';
import { logEvent, EventName } from '../../../src/typescript/utils/logger';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import FavouritesHeartIcon from '@/typescript/assets/svg/symbols/FavouritesHeartIcon';
import TransitPreferencesIcon from '@/typescript/assets/svg/symbols/TransitPreferencesIcon';
import JourneyHistoryIcon from '@/typescript/assets/svg/symbols/JourneyHistoryIcon';
import HelpAndSupportIcon from '@/typescript/assets/svg/symbols/HelpAndSupportIcon';
import PaymentManagementIcon from '@/typescript/assets/svg/symbols/PaymentManagementIcon';
import ReferAndInviteIcon from '@/typescript/assets/svg/symbols/ReferAndInviteIcon';
import AboutIcon from '@/typescript/assets/svg/symbols/AboutIcon';
import AppLanguage from '@/typescript/assets/svg/symbols/AppLanguage';
import Logout from '@/typescript/assets/svg/symbols/Logout';
import ProfileTab from './UI';
import { selectAppConfig, selectAppReadableName, selectOperatingCity } from '@/typescript/state/client/session';
import SafetyIcon from '@/typescript/assets/svg/symbols/SafetyIcon';
import { getStringItem, getNumberItem, deleteItem, MMKVKey } from '@/typescript/utils/MMKV';
import businessVerifiedIcon from '@/src-v2/assets/ny_ic_business_verified.webp';
import businessPendingIcon from '@/src-v2/assets/ny_ic_business_pending.webp';
import { shareApp } from '@/src-v2/utils/common';
import WorkBagIcon from '@/typescript/assets/svg/symbols/WorkBag';
import { profileTabOption } from '@/src-v2/systems/configs/types';
import { isUndefined } from 'lodash';
import { useLazyGetProfileQuery } from '@/typescript/state/server/userApi';

export const ProfileTabFlow: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const { logoutModalRef } = useRefsContext();
    const [isBusinessProfileModalVisible, setIsBusinessProfileModalVisible] = useState(false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const profile = useAppSelector(selectUserProfile);
    const appReadableName = useAppSelector(selectAppReadableName);
    const appConfig = useAppSelector(selectAppConfig);
    const city = useAppSelector(selectOperatingCity);
    const businessProfileConfig = appConfig.flowConfig.businessProfileConfig;
    const [fetchProfile] = useLazyGetProfileQuery();

    useFocusEffect(
        useCallback(() => {
            const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
            if (verificationStartTime) {
                fetchProfile()
                    .unwrap()
                    .then(profileData => {
                        // If business email is verified, delete the key as it's no longer needed
                        if (profileData?.businessEmail && profileData?.businessProfileVerified === true) {
                            deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                        }
                    })
                    .catch(() => {
                        // Silently handle errors, don't break the flow
                    });
            }
        }, [fetchProfile]),
    );

    useEffect(() => {
        const handleAppStateChange = (nextAppState: AppStateStatus) => {
            if (nextAppState === 'active') {
                const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                if (verificationStartTime) {
                    fetchProfile()
                        .unwrap()
                        .then(profileData => {
                            // If business email is verified, delete the key as it's no longer needed
                            if (profileData?.businessEmail && profileData?.businessProfileVerified === true) {
                                deleteItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                            }
                        })
                        .catch(() => {
                            // Silently handle errors, don't break the flow
                        });
                }
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
        };
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [fetchProfile]);

    const handlePaymentManagementPress = useCallback(() => {
        navigation.navigate(
            'ProfileTab',
            {
                screen: 'paymentManagement',
            },
            { pop: true },
        );
    }, [navigation]);

    const getProfileOption = (type: profileTabOption) => {
        switch (type) {
            case 'businessProfile':
                // Only show business profile option if enableBusinessProfile is true
                if (!businessProfileConfig.enableBusinessProfile) {
                    return undefined;
                }
                if (!profile?.businessEmail) {
                    return {
                        icon: <WorkBagIcon color="#3B3A3C" />,
                        text: userLanguageStrings.SetUpBusinessProfile,
                        onPress: () => {
                            hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                            setIsBusinessProfileModalVisible(true);
                        },
                        tagText: userLanguageStrings.NEW,
                        showTag: businessProfileConfig.showNewTag,
                    };
                } else {
                    const isVerified = profile?.businessProfileVerified === true;
                    const hasBusinessEmail = !!profile?.businessEmail;
                    const displayText = isVerified
                        ? userLanguageStrings.BusinessProfile
                        : userLanguageStrings.VerifyBusinessProfile;

                    const verificationIcon: React.ReactNode | undefined = hasBusinessEmail ? (
                        isVerified ? (
                            <Image
                                source={businessVerifiedIcon}
                                style={{ width: 20, height: 20 }}
                                resizeMode="contain"
                            />
                        ) : (
                            <Image
                                source={businessPendingIcon}
                                style={{ width: 20, height: 20 }}
                                resizeMode="contain"
                            />
                        )
                    ) : undefined;

                    return {
                        icon: <WorkBagIcon color="#3B3A3C" />,
                        text: displayText,
                        onPress: () => {
                            hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                            // Check verification start timestamp to determine if we should go to EMAIL_VERIFICATION or VERIFICATION_TIMEOUT
                            const verificationStartTime = getNumberItem(MMKVKey.BUSINESS_EMAIL_VERIFICATION_START_TIME);
                            const initialStage: boolean | undefined =
                                !isVerified && verificationStartTime
                                    ? false
                                    : (profile?.businessProfileVerified ?? false);

                            navigation.navigate(
                                'ProfileTab',
                                {
                                    screen: 'businessProfileScreen',
                                    params: {
                                        isBusinessProfileVerified: initialStage,
                                    },
                                },
                                { pop: true },
                            );
                        },
                        verificationIcon,
                    };
                }
            case 'favourites':
                return {
                    icon: <FavouritesHeartIcon color="#3B3A3C" />,
                    text: userLanguageStrings.Favourites,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.effectTick, undefined);
                        navigation.navigate('ProfileTab', { screen: 'manageFavourites' }, { pop: true });
                    },
                };
            case 'transitPreference':
                return {
                    icon: <TransitPreferencesIcon color="#3B3A3C" size={26} />,
                    text: userLanguageStrings.TransitPreferences,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        navigation.navigate('ProfileTab', { screen: 'transitPreferencesScreen' }, { pop: true });
                    },
                };
            case 'paymentManagement':
                return {
                    icon: <PaymentManagementIcon color="#3B3A3C" size={18} />,
                    text: userLanguageStrings.PaymentManagement,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        handlePaymentManagementPress();
                    },
                };
            case 'share':
                return {
                    icon: <ReferAndInviteIcon color="#3B3A3C" />,
                    text: userLanguageStrings.ShareWithFriends,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        logEvent(EventName.NY_USER_LANGUAGE);
                        shareApp(
                            city,
                            '',
                            appReadableName,
                            userLanguageStrings,
                            appConfig.flowConfig.shareReferralLink,
                        );
                    },
                };
            case 'myRides':
                return {
                    icon: <JourneyHistoryIcon color="#3B3A3C" size={26} />,
                    text: userLanguageStrings.MyRides,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        navigation.navigate(
                            'ProfileTab',
                            {
                                screen: 'myRidesNavigator',
                                params: {
                                    screen: 'myRidesScreen',
                                    params: { isHelpAndSupportScreen: false, issueCategory: undefined },
                                },
                            },
                            { pop: true },
                        );
                    },
                };
            case 'helpAndSupport':
                return {
                    icon: <HelpAndSupportIcon color="#3B3A3C" size={26} />,
                    text: userLanguageStrings.HelpandSupport,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        navigation.navigate('ProfileTab', {
                            screen: 'helpAndSupportNavigator',
                            params: { screen: 'helpAndSupportScreen' },
                        });
                    },
                };
            case 'safety':
                return {
                    icon: <SafetyIcon />,
                    text: userLanguageStrings.Safety,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        navigation.navigate('ProfileTab', { screen: 'safetyScreen' }, { pop: true });
                    },
                };
            case 'referAndInvite':
                return {
                    icon: <ReferAndInviteIcon color="#3B3A3C" />,
                    text: userLanguageStrings.ReferAndInvite,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        navigation.navigate(
                            'ProfileTab',
                            { screen: 'referralNavigator', params: { screen: 'referralScreen' } },
                            { pop: true },
                        );
                    },
                };
            case 'about':
                return {
                    icon: <AboutIcon color="#3B3A3C" />,
                    text: userLanguageStrings.AboutUs,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        logEvent(EventName.NY_USER_ABOUT);
                        navigation.navigate('ProfileTab', { screen: 'aboutScreen' }, { pop: true });
                    },
                };
            case 'language':
                return {
                    icon: <AppLanguage language={appConfig.screenConfig.profileTab.languageIconType} />,
                    text: userLanguageStrings.AppLanguage,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        logEvent(EventName.NY_USER_LANGUAGE);
                        navigation.navigate('ProfileTab', { screen: 'appLanguageNavigation' }, { pop: true });
                    },
                };
            case 'logout':
                return {
                    icon: <Logout color="#3B3A3C" />,
                    text: userLanguageStrings.Logout,
                    onPress: () => {
                        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
                        logoutModalRef?.current?.present();
                    },
                };
            default:
                return undefined;
        }
    };

    const primaryOptions = appConfig.screenConfig.profileTab.primaryOptions
        .map(v => getProfileOption(v))
        .filter(v => !isUndefined(v));
    const secondaryOptions = appConfig.screenConfig.profileTab.secondaryOptions
        .map(v => getProfileOption(v))
        .filter(v => !isUndefined(v));
    const tertiaryOptions = appConfig.screenConfig.profileTab.tertiaryOptions
        .map(v => getProfileOption(v))
        .filter(v => !isUndefined(v));

    const onViewProfilePress = () => {
        hapticEffect(HapticFeedbackTypes.impactHeavy, undefined);
        navigation.navigate(
            'ProfileTab',
            {
                screen: 'myProfile',
                params: {
                    refetchProfile: false,
                    showPopup: undefined,
                    bookingId: null,
                },
            },
            { pop: true },
        );
    };

    const fullName = (profile?.firstName ?? '') + ' ' + (profile?.lastName ?? '');
    const mobileNumber = getStringItem(MMKVKey.MOBILE_NUMBER);
    const email = profile?.email ?? mobileNumber;

    return (
        <ProfileTab
            primaryOptions={primaryOptions}
            secondaryOptions={secondaryOptions}
            tertiaryOptions={tertiaryOptions}
            fullName={fullName}
            email={email}
            profilePicture={profile?.profilePicture}
            onViewProfilePress={onViewProfilePress}
            isBusinessProfileModalVisible={isBusinessProfileModalVisible}
            setIsBusinessProfileModalVisible={setIsBusinessProfileModalVisible}
        />
    );
};

export default ProfileTabFlow;
