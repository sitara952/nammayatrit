import { tailwind } from '../../../tailwind-theme/tailwind';
import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../../primitives/Header';
import { TicketsFlow } from '../LiveTicket/Tickets/Flow';
import { TicketHistoryFlowReturnType } from './Types';
import Animated from 'react-native-reanimated';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export const TicketHistoryUI: React.FC<TicketHistoryFlowReturnType> = React.memo(
    ({ liveTickets, pastTickets, onBackPress, onLiveTicketPress, isLoadingPastTickets, isHelpAndSupportScreen }) => {
        const { top } = useSafeAreaInsets();
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');

        const getHeaderTitle = () => {
            if (isHelpAndSupportScreen) {
                return userLanguageStrings.SelectTickets ?? 'Select Ticket';
            }
            return liveTickets.length > 0 ? userLanguageStrings.Ticket : userLanguageStrings.PastTickets;
        };

        return (
            <HardwareBackpressHandler onHardwareBackPress={onBackPress}>
                <>
                    <View style={tailwind.style(`flex-1 bg-[#F7F7F7]`)}>
                        <Header
                            title={getHeaderTitle()}
                            onBackPress={onBackPress}
                            style={tailwind.style(` text-white pt-[${top + 12}px]`)}
                        />
                        <Animated.ScrollView showsVerticalScrollIndicator={false} style={tailwind.style('flex-1')}>
                            <TicketsFlow
                                onLiveTicketPress={onLiveTicketPress}
                                liveTickets={liveTickets}
                                pastTickets={pastTickets}
                                selectedTicketId={undefined}
                                isTicketHistory={true}
                                isLoadingPastTickets={isLoadingPastTickets}
                                isHelpAndSupportScreen={isHelpAndSupportScreen}
                            />
                        </Animated.ScrollView>
                    </View>
                </>
            </HardwareBackpressHandler>
        );
    },
);
