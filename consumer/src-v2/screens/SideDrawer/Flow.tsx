import AboutIcon from '@/typescript/assets/svg/symbols/AboutIcon';
import AppLanguage from '@/typescript/assets/svg/symbols/AppLanguage';
import { Headphone } from '@/typescript/components/svg/HeadPhone';
import Logout from '@/typescript/assets/svg/symbols/Logout';
import Support from '@/typescript/assets/svg/symbols/Support';
import {
    BottomSheetStage,
    selectContactSupport,
    selectFeatureFlags,
    selectSafetyHelplineNo,
    setBottomSheetStage,
} from '@/typescript/state/client/session';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import { SideBarCellProps } from './Types';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import SafetyIcon from '@/typescript/assets/svg/symbols/SafetyIcon';
import MyRides from '@/typescript/assets/svg/symbols/MyRides';
import InviteFriends from '@/typescript/assets/svg/symbols/InviteFriends';
import { useState } from 'react';
import { BookingId, selectMobileNumber, selectUserProfile } from '@/typescript/state/client/user';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { useSelector } from 'react-redux';
import { selectScreenReaderEnabled } from '../../../src/typescript/state/client/session';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { logEvent, EventName } from '@/typescript/utils/logger';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import { FavoriteHeart } from '@/typescript/components/svg/FavoriteHeart';
import { MyTickets } from '@/src-v2/multimodal/components/svg/MyTickets';

export const SideDrawerFlow = () => {
    const dispatch = useAppDispatch();
    const navigation: DrawerNavigationProp<MainNavigationParamList> = useNavigation();
    const stackNavigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const featureFlags = useAppSelector(selectFeatureFlags);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { logoutModalRef } = useRefsContext();
    const showContactSupport = useAppSelector(selectContactSupport);
    const supportNumber = useAppSelector(selectSafetyHelplineNo);
    const sideDrawerPrimaryOptionsBase: SideBarCellProps[] = [
        {
            text: userLanguageStrings.AppLanguage,
            icon: <AppLanguage />,
            onPress: () => {
                logEvent(EventName.NY_USER_LANGUAGE);
                navigation.navigate('ProfileTab', {
                    screen: 'appLanguageNavigation',
                });
            },
        },
        {
            text: userLanguageStrings.HelpandSupport,
            icon: <Support />,
            onPress: () => {
                navigation.navigate('ProfileTab', {
                    screen: 'helpAndSupportNavigator',
                    params: { screen: 'helpAndSupportScreen' },
                });
            },
        },
        {
            text: 'My Tickets',
            icon: <MyTickets />,
            onPress: () => navigation.navigate('mainTabNavigation', { screen: 'ticketsTab_homeScreen' }),
        },
    ].concat(
        showContactSupport
            ? [
                  {
                      text: userLanguageStrings.ContactSupport,
                      icon: <Headphone />,
                      onPress: () => Linking.openURL(`tel:${supportNumber.supportNumber}`),
                  },
              ]
            : [],
    );

    const sideDrawerPrimaryOptions: SideBarCellProps[] = featureFlags.favouriteDriver
        ? [
              ...sideDrawerPrimaryOptionsBase,
              {
                  text: userLanguageStrings.Favourites,
                  icon: <FavoriteHeart />,
                  onPress: () =>
                      navigation.navigate('ProfileTab', {
                          screen: 'manageFavourites',
                      }),
              },
          ]
        : sideDrawerPrimaryOptionsBase;

    const sideDrawerSecondaryOptions: SideBarCellProps[] = [
        {
            text: userLanguageStrings.About,
            icon: <AboutIcon />,
            onPress: () => {
                logEvent(EventName.NY_USER_ABOUT);
                navigation.navigate('ProfileTab', {
                    screen: 'aboutScreen',
                });
            },
        },
        {
            text: userLanguageStrings.Logout,
            icon: <Logout />,
            onPress: () => {
                logoutModalRef?.current?.present();
            },
        },
    ];

    const onBackToHomePress = () => {
        dispatch(setBottomSheetStage({ stage: BottomSheetStage.Home, src: 'sideDrawer_onBackToHomePress' }));
        stackNavigation.popTo('mainTabNavigation', { screen: 'homeTab_homeScreen' });
    };

    return {
        sideDrawerPrimaryOptions,
        sideDrawerSecondaryOptions,
        onBackToHomePress,
    };
};

export const HeaderFlow = (bookingId: BookingId | null) => {
    const profile = useAppSelector(selectUserProfile);
    const [count, setCount] = useState(0);
    const navigation: DrawerNavigationProp<MainNavigationParamList> = useNavigation();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const screenReaderEnabled = useSelector(selectScreenReaderEnabled);

    const headerCards = [
        {
            icon: <SafetyIcon />,
            onPress: () =>
                navigation.navigate('ProfileTab', {
                    screen: 'safetyScreen',
                }),
            text: userLanguageStrings.Safety,
        },
        {
            icon: <MyRides />,
            onPress: () => {
                logEvent(EventName.NY_USER_MYRIDES_CLICK);
                navigation.navigate('ProfileTab', {
                    screen: 'myRidesNavigator',
                    params: {
                        screen: 'myRidesScreen',
                        params: { isHelpAndSupportScreen: false, issueCategory: undefined },
                    },
                });
            },
            text: userLanguageStrings.Bookings,
        },
        {
            icon: <InviteFriends />,
            onPress: () =>
                navigation.navigate('ProfileTab', {
                    screen: 'referralNavigator',
                    params: {
                        screen: 'referralScreen',
                    },
                }),
            text: userLanguageStrings.Refer,
        },
    ];

    const onProfilePress = () => {
        logEvent(EventName.NY_USER_PROFILE_CLICK);
        navigation.navigate('ProfileTab', {
            screen: 'myProfile',
            params: { refetchProfile: false, showPopup: undefined, bookingId: bookingId },
        });
    };

    const onThemeChangePress = () => {
        if (count > 3) {
            setCount(0);
            navigation.navigate('ProfileTab', { screen: 'chooseTheme' });
            setTimeout(() => {
                setCount(_ => 0);
            }, 10000);
        } else {
            setCount(s => s + 1);
        }
    };

    const onCrossClick = () => {
        navigation.dispatch(DrawerActions.closeDrawer());
    };

    const fullName = (profile?.firstName ?? '') + ' ' + (profile?.lastName ?? '');
    const mobileNumber = useAppSelector(selectMobileNumber) ?? profile?.maskedMobileNumber ?? '';

    return {
        onThemeChangePress,
        onProfilePress,
        fullName,
        mobileNumber,
        headerCards,
        onCrossClick,
        screenReaderEnabled,
    };
};
