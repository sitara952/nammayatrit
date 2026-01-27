import { ticketPlaceArray } from '@/readOnly/api/types/TicketPlaceArray.gen';
import { Action, Resolver } from '@/typescript/utils/common';

export type TicketingAction =
    | Action<'PRESSED_BACK'>
    | Action<'GET_TICKETS_HISTORY'>
    | Action<'FILTER_EVENTS', { tag: CustomCategories | undefined }>
    | Action<'GET_EVENT_DETAIL', { placeId: string }>;

export type TicketingScreenProps = {
    mpDispatch: Resolver<TicketingAction>;
    ticketPlaces: ticketPlaceArray | undefined;
    tabsOptions: CustomCategories[];
};

export type EventContainer = {
    id: string;
    image: string;
    title: string;
    date: string;
    openTime: string | undefined;
    closeTime: string | undefined;
};

export enum CustomCategories {
    Museum = 'Museum',
    ThemePark = 'Theme Park',
    Wildlife = 'Wildlife',
    Heritage = 'Heritage',
    Religious = 'Religious',
    Other = 'Other',
}
