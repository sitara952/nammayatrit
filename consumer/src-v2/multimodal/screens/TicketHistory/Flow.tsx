import React, { useCallback, useMemo } from 'react';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainNavigationParamList, TicketsTabParamList } from '@/typescript/navigation/globalParamList';
import { TicketHistoryUI } from './UI';
import { useTicketData } from '../../hooks/useTicketData';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { TicketData } from '../LiveTicket/Tickets/Types';
import { isTicketOlderThanXSeconds } from '@/src-v2/utils/common';

export const TicketHistoryFlow: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<TicketsTabParamList, 'ticketHistory'>>();
    const isHelpAndSupportScreen = route.params?.isHelpAndSupportScreen;
    const issueCategory = route.params?.issueCategory;

    // Extract liveTickets and pastTickets from useTicketData hook
    const { liveTickets, pastTickets, isLoading } = useTicketData();

    // Filter tickets to show only those within 72 hours when in help & support mode
    const filteredTickets = useMemo(() => {
        if (!isHelpAndSupportScreen) {
            return { filteredLiveTickets: liveTickets, filteredPastTickets: pastTickets };
        }

        const filterRecent = (tickets: TicketData[]) =>
            tickets.filter(
                ticket =>
                    !isTicketOlderThanXSeconds(ticket.createdAt, issueCategory?.maxAllowedRideAge ?? 24 * 60 * 60),
            );

        return {
            filteredLiveTickets: [],
            filteredPastTickets: [...filterRecent(liveTickets), ...filterRecent(pastTickets)],
        };
    }, [isHelpAndSupportScreen, liveTickets, pastTickets]);

    const onBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onLiveTicketPress = useCallback(
        (journey: journeyInfoResp, ticketId: string) => {
            if (isHelpAndSupportScreen && issueCategory) {
                // Navigate to ReportIssueChatScreen with ticketId
                navigation.navigate('ProfileTab', {
                    screen: 'helpAndSupportNavigator',
                    params: {
                        screen: 'reportIssueChatScreen',
                        params: {
                            category: {
                                issueCategoryId: issueCategory.issueCategoryId ?? '',
                                label: issueCategory.label,
                                category: issueCategory.category,
                            },
                            rideId: undefined,
                            issueReportId: undefined,
                            ticketId: ticketId,
                            driverNumber: undefined,
                        },
                    },
                });
            } else {
                navigation.navigate('TicketsTab', {
                    screen: 'showTicketScreen',
                    params: { journey, fromCancelledJourney: false },
                });
            }
        },
        [navigation, isHelpAndSupportScreen, issueCategory],
    );

    const viewState = {
        liveTickets: filteredTickets.filteredLiveTickets,
        pastTickets: filteredTickets.filteredPastTickets,
        onBackPress,
        onLiveTicketPress,
        isLoadingPastTickets: isLoading,
        isHelpAndSupportScreen,
    };

    return <TicketHistoryUI {...viewState} />;
};
