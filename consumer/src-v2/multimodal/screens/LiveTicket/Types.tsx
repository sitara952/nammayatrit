import { JourneyStatus_journeyStatus, MultimodalTravelMode_multimodalTravelMode } from '@/readOnly/api/types/Enums.gen';
import { journeyInfoResp } from '@/readOnly/api/types/JourneyInfoResp.gen';
import { legInfo } from '@/readOnly/api/types/LegInfo.gen';

import { JourneyId } from '@/typescript/state/client/user';
import { Action, Resolver } from '@/typescript/utils/common';
import { LegTickets } from '@/typescript/state/client/journey';
import { TicketUIProps } from '../Ticket/SingleTicket/types';
import { TicketData } from './Tickets/Types';

export type TransitType = {
    title: MultimodalTravelMode_multimodalTravelMode;
    legInfo: legInfo;
    AltText: undefined;
};

export type SelectedTicketProps = {
    legTickets: LegTickets;
    unifiedQR: string | undefined;
    transitTypes: Array<{
        title: MultimodalTravelMode_multimodalTravelMode;
        legInfo: legInfo;
        AltText: string | undefined;
    }>;
    journeyId: JourneyId | null;
    paymentOrderId: string | undefined;
    startTime: string | undefined;
};

export type MyRidesAction =
    | Action<'GET_FULL_JOURNEY_SUMMARY', { journey: journeyInfoResp }>
    | Action<'NAVIGATE_TO_HISTORY'>;

export type LiveTicketFlowReturnType = {
    isLoading: boolean;

    mpDispatch: Resolver<MyRidesAction>;
    onPress: () => void;
    onBack: () => void;
    isButtonLoading: boolean;
    onBookTicketPress: () => void;
    selectedTicket: journeyInfoResp | undefined;
    setSelectedTicket: React.Dispatch<React.SetStateAction<journeyInfoResp | undefined>>;
    selectedTicketProps: TicketUIProps;
    liveTickets: TicketData[];
    pastTickets: TicketData[];
    journeyStatus: JourneyStatus_journeyStatus | undefined;
};
