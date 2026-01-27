import React from 'react';
import { MainNavigationParamList, HomeTabParamList } from './globalParamList.tsx';
import { HyperView, HyperViewStackNavigator } from '../components/hyperView.tsx';
import { JourneyOptions } from '@/src-v2/multimodal/screens/PublicTransitList/Flow.tsx';
import { ReviewAndFeedBack } from '@/src-v2/screens/reviewAndFeedback/Flow.tsx';
import { RouteProp, useRoute } from '@react-navigation/native';
import { BusOtpFlow } from '@/src-v2/multimodal/screens/BusOtpFlow/Flow.tsx';
import { PickSourceDestinationFlow } from '@/src-v2/multimodal/screens/BusOtpFlow/PickSourceDestination/Flow.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const HomeStack = createNativeStackNavigator<HomeTabParamList>();

export type HomeTabRoute =
    | 'favouritesScreen'
    | 'journeyDetails'
    | 'journeyOptions'
    | 'multimodalTransitCheckout'
    | 'baseHybridFlow';

export const HomeStackNavigator: React.FC = () => {
    const route = useRoute<RouteProp<MainNavigationParamList, 'HomeTab'>>();
    const { screen } = route.params ?? {};

    return (
        <HomeStack.Navigator
            initialRouteName={screen ?? 'journeyOptions'}
            screenOptions={{
                headerShown: false,
                animation: 'default',
                presentation: 'card',
                statusBarAnimation: 'fade',
            }}>
            {/* Nested Screens */}
            <HomeStack.Screen name="favouritesScreen">{() => <HyperView viewParam="favourites" />}</HomeStack.Screen>

            <HomeStack.Screen name="journeyOptions" component={JourneyOptions} />

            <HomeStack.Screen
                name="baseHybridFlow"
                component={HyperViewStackNavigator}
                options={{ headerShown: false }}
            />

            <HomeStack.Screen
                name={'reviewAndFeedback'}
                options={{ gestureEnabled: false }}
                component={ReviewAndFeedBack}
            />
            <HomeStack.Screen name={'busOtpFlow'} component={BusOtpFlow} />
            <HomeStack.Screen name={'busOTPViaTicketBookingFlow'} component={PickSourceDestinationFlow} />
        </HomeStack.Navigator>
    );
};
