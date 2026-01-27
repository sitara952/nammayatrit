import React from 'react';
import MyRidesFlow from '@/src-v2/screens/MyRides/Flow.tsx';
import BookingDetailsFlow from '@/src-v2/screens/MyBookingDetails/Flow.tsx';
import InvoiceFlow from '@/src-v2/screens/Invoice/Flow.tsx';
import { MyRidesParamList } from './globalParamList';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const MyRidesStack = createNativeStackNavigator<MyRidesParamList>();

export type MyRidesStackNavigatorProps = {};

export const MyRidesStackNavigator: React.FC<MyRidesStackNavigatorProps> = () => {
    const initialRouteName = 'myRidesScreen';
    return (
        <MyRidesStack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            <MyRidesStack.Screen name="myRidesScreen" component={MyRidesFlow} />
            <MyRidesStack.Screen name="myRideDetails" component={BookingDetailsFlow} />
            <MyRidesStack.Screen name="invoiceScreen" component={InvoiceFlow} />
        </MyRidesStack.Navigator>
    );
};
