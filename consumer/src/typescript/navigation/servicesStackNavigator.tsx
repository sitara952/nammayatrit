import { ServicesTabParamList } from './globalParamList.tsx';
import { SingleModeBookingStackNavigator } from './singleModeBookingStackNavigator';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ExtendedBookingStackNavigator } from './extendedBookingStackNavigator.tsx';

const ServicesStack = createNativeStackNavigator<ServicesTabParamList>();

export const ServicesStackNavigator = () => {
    return (
        <ServicesStack.Navigator
            initialRouteName="singleModeBookingNavigator"
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'slide_from_left',
                statusBarAnimation: 'fade',
            }}>
            {/* Single Mode Booking Navigator */}
            <ServicesStack.Screen name="singleModeBookingNavigator" component={SingleModeBookingStackNavigator} />
            {/* TODO:: Need to fix this */}
            <ServicesStack.Screen
                name="extendedBookingNavigator"
                options={{ animation: 'none' }}
                component={ExtendedBookingStackNavigator}
            />
            {/* Journey Screens */}
        </ServicesStack.Navigator>
    );
};
