import * as React from 'react';
import { useEffect } from 'react';
import { RootSiblingParent } from 'react-native-root-siblings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Appearance } from 'react-native';
import LoginScreen from '../screens/onboarding/LoginScreen.tsx';
import UpdateProfile from '../screens/onboarding/UpdateProfile.tsx';
import OTPVerification from '../screens/onboarding/OTPVerification.tsx';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { RefsProvider } from '../context/RefsContext.tsx';
import { AnimatedValuesProvider } from '../context/AnimatedValuesContext.tsx';
import { hideSplash } from '../utils/common.ts';
import { OnboardingNavigationParamList } from './globalParamList.tsx';
import { useAppSelector } from '../state/hooks.ts';
import { selectToken } from '../state/client/auth.ts';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboardingDeepLinkHandler } from '@/src-v2/utils/deepLinkHandler.ts';
import GettingStartedCarousel from '../screens/onboarding/GettingStartedCarousel.tsx';
import { useStatusBarColor } from '@/src-v2/hooks/useStatusbarcolor.ts';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { selectAppConfig } from '@/typescript/state/client/session';

const Stack = createNativeStackNavigator<OnboardingNavigationParamList>();

export const OnboardingNavigation: React.FC = () => {
    const accessToken = useAppSelector(selectToken);
    const navigation = useNavigation<NativeStackNavigationProp<OnboardingNavigationParamList>>();
    const appConfig = useAppSelector(selectAppConfig);

    useOnboardingDeepLinkHandler();
    useStatusBarColor(false);
    useEffect(() => {
        Appearance.setColorScheme('light');
        hideSplash();
    }, []);

    useEffect(() => {
        if (accessToken && !appConfig.flowConfig.skipProfileOnboarding) {
            navigation.navigate('UpdateProfile', {
                preFillEmail: undefined,
                preFillGender: undefined,
                preFillName: undefined,
            });
        }
    }, [accessToken, navigation]);

    return (
        <AnimatedValuesProvider>
            <RootSiblingParent>
                <RefsProvider>
                    <BottomSheetModalProvider>
                        <KeyboardProvider
                            preserveEdgeToEdge={true}
                            navigationBarTranslucent={true}
                            statusBarTranslucent={true}>
                            <Stack.Navigator initialRouteName="GettingStartedCarousel">
                                <Stack.Screen
                                    name="GettingStartedCarousel"
                                    component={GettingStartedCarousel}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="LoginScreen"
                                    component={LoginScreen}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="OTPVerification"
                                    component={OTPVerification}
                                    options={{ headerShown: false }}
                                />
                                <Stack.Screen
                                    name="UpdateProfile"
                                    component={UpdateProfile}
                                    options={{ headerShown: false }}
                                />
                            </Stack.Navigator>
                        </KeyboardProvider>
                    </BottomSheetModalProvider>
                </RefsProvider>
            </RootSiblingParent>
        </AnimatedValuesProvider>
    );
};
