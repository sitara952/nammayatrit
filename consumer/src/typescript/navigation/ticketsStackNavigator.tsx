import { TicketsTabParamList } from './globalParamList.tsx';
import { TicketHistoryFlow } from '@/src-v2/multimodal/screens/TicketHistory/Flow.tsx';
import { ShowTicketScreen } from '@/src-v2/multimodal/screens/ShowTicketScreen/ShowTicketScreen.tsx';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const TicketsStack = createNativeStackNavigator<TicketsTabParamList>();

export const TicketsStackNavigator = () => {
    return (
        <TicketsStack.Navigator
            initialRouteName="ticketHistory"
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            {/* Entry Screen */}
            <TicketsStack.Screen name="ticketHistory" component={TicketHistoryFlow} />
            <TicketsStack.Screen name="showTicketScreen" component={ShowTicketScreen} />
        </TicketsStack.Navigator>
    );
};
