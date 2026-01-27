import React, { memo, useCallback } from 'react';
import { SingleModeSearch } from '@/src-v2/multimodal/screens/SingleModeSearch/Flow.tsx';
import { SingleModeTicketBooking } from '@/src-v2/multimodal/screens/SingleModeTicketBooking/Flow.tsx';
import { MetroSubwayBooking } from '@/src-v2/multimodal/screens/MetroSubwayBooking/Flow';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RouteProp, useRoute } from '@react-navigation/native';
import JourneyDetail, { emptyJourneyDetailsProps } from '@/src-v2/multimodal/screens/JourneyInfoScreen';
import { SingleModeBookingParamList } from './globalParamList';

const SingleModeBookingStack = createNativeStackNavigator<SingleModeBookingParamList>();

export type SingleModeBookingStackNavigatorProps = {};

const MemoizedJourneyDetail = memo(() => {
    const route = useRoute<RouteProp<SingleModeBookingParamList, 'journeyDetails'>>();
    const props = route.params ? route.params : emptyJourneyDetailsProps;
    return <JourneyDetail {...props} />;
});

export const SingleModeBookingStackNavigator: React.FC<SingleModeBookingStackNavigatorProps> = () => {
    const initialRouteName = 'singleModeSearch';

    const JourneyDetailComponent = useCallback(() => {
        return <MemoizedJourneyDetail />;
    }, []);

    return (
        <SingleModeBookingStack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            <SingleModeBookingStack.Screen name="journeyDetails" component={JourneyDetailComponent} />
            <SingleModeBookingStack.Screen name="singleModeSearch" component={SingleModeSearch} />
            <SingleModeBookingStack.Screen name="singleModeTicketBooking" component={SingleModeTicketBooking} />
            <SingleModeBookingStack.Screen name="metroSubwayBooking" component={MetroSubwayBooking} />
        </SingleModeBookingStack.Navigator>
    );
};
