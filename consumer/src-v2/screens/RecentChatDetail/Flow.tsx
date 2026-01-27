import React from 'react';
import { RecentChatDetailUI } from './UI';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HelpAndSupportParamList, MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useGetClosedTicketDetailsGetQuery } from '@/api/integrations/rtk/GetClosedTicketDetailsGet';
import { mockChatData } from './chatDetailsMockData';

const useMockData = false;

export const RecentChatDetailFlow: React.FC = () => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const route = useRoute<RouteProp<HelpAndSupportParamList, 'recentChatDetailScreen'>>();
    const { rideId, ticketId } = route.params;
    const { data: closedTicketDetails } = useGetClosedTicketDetailsGetQuery({ ticketId: ticketId ?? '' });
    const chatMessages = useMockData ? mockChatData : closedTicketDetails?.chatMessages;
    return (
        <RecentChatDetailUI
            chatMessages={chatMessages ?? []}
            rideId={rideId}
            ticketId={ticketId}
            navigation={navigation}
        />
    );
};
