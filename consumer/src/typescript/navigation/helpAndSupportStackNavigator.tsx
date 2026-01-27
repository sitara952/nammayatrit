import React from 'react';
import { HelpAndSupportParamList } from './globalParamList';
import { HelpAndSupportFlow } from '@/src-v2/screens/HelpAndSupport/Flow';
import KaptureWebViewScreen from '../screens/KaptureWebViewScreen';
import { ActiveTicketsFlow } from '@/src-v2/screens/ActiveTickets/Flow';
import { RecentChatDetailFlow } from '@/src-v2/screens/RecentChatDetail/Flow';
import { KaptureRecentChatsFlow } from '@/src-v2/screens/KaptureRecentChats/Flow';
import { MetroIssueFaqFlow } from '@/src-v2/screens/MetroIssueFaq/Flow';
import { BusinessIssueFaqFlow } from '@/src-v2/screens/BusinesIssueFaq/Flow';
import { ReportIssueChatScreen } from '@/src-v2/screens/ReportIssueChatScreen/Flow';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const HelpAndSupportStack = createNativeStackNavigator<HelpAndSupportParamList>();

export type HelpAndSupportStackNavigatorProps = {};

export const HelpAndSupportStackNavigator: React.FC<HelpAndSupportStackNavigatorProps> = () => {
    const initialRouteName = 'helpAndSupportScreen';
    return (
        <HelpAndSupportStack.Navigator
            initialRouteName={initialRouteName}
            screenOptions={{
                headerShown: false,
                presentation: 'card',
                animation: 'default',
                statusBarAnimation: 'fade',
            }}>
            <HelpAndSupportStack.Screen name="helpAndSupportScreen" component={HelpAndSupportFlow} />
            <HelpAndSupportStack.Screen name="metroIssueFaqScreen" component={MetroIssueFaqFlow} />
            <HelpAndSupportStack.Screen name="businessIssueFaqScreen" component={BusinessIssueFaqFlow} />
            <HelpAndSupportStack.Screen name={'kaptureWebViewScreen'} component={KaptureWebViewScreen} />
            <HelpAndSupportStack.Screen name={'activeTicketsScreen'} component={ActiveTicketsFlow} />
            <HelpAndSupportStack.Screen name={'recentChatsScreen'} component={KaptureRecentChatsFlow} />
            <HelpAndSupportStack.Screen name={'recentChatDetailScreen'} component={RecentChatDetailFlow} />
            <HelpAndSupportStack.Screen name={'reportIssueChatScreen'} component={ReportIssueChatScreen} />
        </HelpAndSupportStack.Navigator>
    );
};
