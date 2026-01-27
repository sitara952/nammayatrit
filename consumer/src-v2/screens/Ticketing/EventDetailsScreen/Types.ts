import { faq } from '@/readOnly/api/types/Faq.gen';
import { ticketPlace } from '@/readOnly/api/types/TicketPlace.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { businessHourResp } from '@/readOnly/api/types/BusinessHourResp.gen';
import { PlaceStatus_placeStatus } from '../../../../src/readOnly/api/types/Enums.gen';

export type EventDetailsAction =
    | Action<'PRESSED_BACK'>
    | Action<'GET_EVENT_DETAIL'>
    | Action<'GET_DIRECTION'>
    | Action<'BOOK_TICKET'>
    | Action<'GET_TICKETS_HISTORY'>;

export type EventDetailsScreenProps = {
    event: ticketPlace;
    businessHour: businessHourResp[];
    mpDispatch: Resolver<EventDetailsAction>;
    operationalDate: string;
    eventStatus: PlaceStatus_placeStatus | undefined;
};

export type EventInfoProps = {
    iconUrl: string | undefined;
    title: string;
    description: string;
};

export type TermsAndConditionProps = {
    terms: string[];
};

export type FrequentlyAskedQuestionsProps = {
    faqs: faq[];
};

export type ImageCarouselProps = {
    imageUrls: string[];
    height: number;
};
