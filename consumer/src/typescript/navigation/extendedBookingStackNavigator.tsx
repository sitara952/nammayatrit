import React from 'react';
import { PreBookRideSummary } from '../screens/PreBookRideSummary.tsx';
import { ScheduleRideSummary } from '../screens/ScheduleRideSummary.tsx';
import { RentalScreenFlow } from '@/src-v2/screens/Rentals/Flow.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type ExtendedBookingParamList = {
    preBookRideSummary: undefined;
    scheduleRideSummary: undefined;
    rentalsScreen: undefined;
};

const ExtendedBookingStack = createNativeStackNavigator<ExtendedBookingParamList>();

export type ExtendedBookingStackNavigatorProps = {};

export const ExtendedBookingStackNavigator: React.FC<ExtendedBookingStackNavigatorProps> = () => {
    const initialRouteName = 'preBookRideSummary';
    return (
        <ExtendedBookingStack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            <ExtendedBookingStack.Screen name="preBookRideSummary" component={PreBookRideSummary} />
            <ExtendedBookingStack.Screen name="scheduleRideSummary" component={ScheduleRideSummary} />
            <ExtendedBookingStack.Screen
                name="rentalsScreen"
                options={{ animation: 'none' }}
                component={RentalScreenFlow}
            />
        </ExtendedBookingStack.Navigator>
    );
};
