import React from 'react';
import { TicketsFlowProps, TicketsViewState } from './Types';
import { TicketsListView } from './UI';
import { selectAppName } from '@/typescript/state/client/session';
import { useAppSelector } from '@/typescript/state/hooks';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';

export const TicketsFlow: React.FC<TicketsFlowProps> = ({
    onLiveTicketPress,
    selectedTicketId,
    liveTickets,
    pastTickets,
    isTicketHistory,
    isLoadingPastTickets,
    isHelpAndSupportScreen,
}) => {
    const appName = useAppSelector(selectAppName);

    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();

    const ticketsViewState: TicketsViewState = {
        liveTickets,
        pastTickets,
        onLiveTicketPress,
        selectedTicketId,
        appName,
        onBackPress: () => {
            navigation.goBack();
        },
        isTicketHistory,
        isLoadingPastTickets,
        isHelpAndSupportScreen,
    };

    return <TicketsListView {...ticketsViewState} />;
};
