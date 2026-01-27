import React from 'react';
import { MainNavigationParamList, ProfileTabParamList } from './globalParamList.tsx';
import TransitPreferencesFlow from '@/src-v2/screens/TransitPreferences/Flow.tsx';
import AboutScreen from '../screens/AboutScreen.tsx';
import { MyProfileFlow } from '@/src-v2/screens/MyProfile/Flow.tsx';
import { AppLanguage } from '@/src-v2/screens/AppLanguage/Flow.tsx';
import ChooseTheme from '../screens/ChooseTheme.tsx';
import { UpdateMyProfileFlow } from '@/src-v2/screens/UpdateMyProfile/Flow.tsx';
import ManageFavourite from '@/src-v2/multimodal/screens/Favourites/Flow/ManageFavourite.tsx';
import MockCityFlow from '@/src-v2/screens/MockCity/UI';
import { PaymentManagement } from '../components/paymentManagement.tsx';
import { MyRidesStackNavigator } from './myRidesStackNavigator.tsx';
import { ReferralStackNavigator } from './referralStackNavigator.tsx';
import { JourneySimulation } from '@/src-v2/screens/JourneySimulation/index.tsx';
import { RouteProp, useRoute } from '@react-navigation/native';
import { HelpAndSupportStackNavigator } from './helpAndSupportStackNavigator.tsx';
import NearbyBusTrackingScreen from '@/src-v2/multimodal/screens/NearbyBusTracking/index.tsx';
import { BusinessProfileFlow } from '@/src-v2/screens/BusinessProfile/Flow.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafetyFlow } from '../screens/safety/Flow.tsx';

const ProfileStack = createNativeStackNavigator<ProfileTabParamList>();

export type ProfileTabRoute =
    | 'profileTab_homeScreen'
    | 'transitPreferencesScreen'
    | 'aboutScreen'
    | 'myProfile'
    | 'appLanguageNavigation'
    | 'chooseTheme'
    | 'updateMyProfile'
    | 'manageFavourites'
    | 'addFavourite'
    | 'mockCityScreen'
    | 'mockJourneyScreen'
    | 'myRidesScreen'
    | 'businessProfileScreen'
    | 'paymentManagement'
    | 'referralNavigator'
    | 'helpAndSupportScreen';

export const ProfileStackNavigator: React.FC = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'ProfileTab'>>();
    const { screen } = route.params ?? {};
    return (
        <ProfileStack.Navigator
            initialRouteName={screen}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            <ProfileStack.Screen name="transitPreferencesScreen" component={TransitPreferencesFlow} />

            <ProfileStack.Screen name="aboutScreen" component={AboutScreen} />

            <ProfileStack.Screen name="myProfile" component={MyProfileFlow} />

            <ProfileStack.Screen name="appLanguageNavigation" component={AppLanguage} />

            <ProfileStack.Screen name="chooseTheme" component={ChooseTheme} />

            <ProfileStack.Screen name="updateMyProfile" component={UpdateMyProfileFlow} />

            <ProfileStack.Screen name="manageFavourites" component={ManageFavourite} />

            <ProfileStack.Screen name="mockCityScreen" component={MockCityFlow} />

            <ProfileStack.Screen name="mockJourneyScreen" component={JourneySimulation} />

            <ProfileStack.Screen name="myRidesNavigator" component={MyRidesStackNavigator} />

            <ProfileStack.Screen name="businessProfileScreen" component={BusinessProfileFlow} />

            <ProfileStack.Screen name="helpAndSupportNavigator" component={HelpAndSupportStackNavigator} />
            <ProfileStack.Screen name={'nearbyBusTracking'} component={NearbyBusTrackingScreen} />
            <ProfileStack.Screen name={'paymentManagement'} component={PaymentManagement} />

            <ProfileStack.Screen name="referralNavigator" component={ReferralStackNavigator} />

            <ProfileStack.Screen name={'safetyScreen'}>
                {({ navigation }) => <SafetyFlow onBack={() => navigation.goBack()} />}
            </ProfileStack.Screen>
        </ProfileStack.Navigator>
    );
};
