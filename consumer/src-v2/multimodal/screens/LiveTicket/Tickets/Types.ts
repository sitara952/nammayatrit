import { ImageSourcePropType } from 'react-native';
import { MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';
import { LegTickets } from '@/typescript/state/client/journey';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';

export type TicketStatus = 'live' | 'expired' | 'cancelled' | 'failed';

export type TicketData = {
    id: string;
    from: string;
    to: string;
    fare: number;
    legIcons: React.ReactNode[];
    status: TicketStatus;
    route: string;
    serviceTier: string;
    legType: string;
    isSingleLeg: boolean;
    image: ImageSourcePropType;
    unifiedQR: string | undefined;
    legTickets: LegTickets;
    transitTypes:
        | Array<{
              title: MultimodalTravelMode_multimodalTravelMode;
              legInfo: legInfo;
              AltText: string | undefined;
          }>
        | undefined;
    paymentOrderId: string | undefined;
    createdAt: string | undefined;
    journeyInfoResp: journeyInfoResp;
};

export type TicketStatusConfig = {
    label: string;
    color: string;
    textClass: string;
};

export type TicketsViewState = {
    liveTickets: TicketData[];
    pastTickets: TicketData[];
    onLiveTicketPress: (ticket: journeyInfoResp, ticketId: string) => void;
    selectedTicketId: string | undefined;
    appName: string;
    onBackPress: () => void;
    isTicketHistory: boolean;
    isLoadingPastTickets: boolean;
    isHelpAndSupportScreen: boolean | undefined;
};

export type TicketsFlowProps = {
    onLiveTicketPress: (ticket: journeyInfoResp, ticketId: string) => void;
    selectedTicketId: string | undefined;
    liveTickets: TicketData[];
    pastTickets: TicketData[];
    isTicketHistory: boolean;
    isLoadingPastTickets: boolean;
    isHelpAndSupportScreen: boolean | undefined;
};
