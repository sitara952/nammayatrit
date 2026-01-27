import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { TicketData } from '../LiveTicket/Tickets/Types';

export type TicketHistoryFlowReturnType = {
    liveTickets: TicketData[];
    pastTickets: TicketData[];
    onBackPress: () => void;
    onLiveTicketPress: (journey: journeyInfoResp, ticketId: string) => void;
    isLoadingPastTickets: boolean;
    isHelpAndSupportScreen: boolean | undefined;
};
