import { PlaceType_placeType, TicketBookingStatus_ticketBookingStatus } from '@/readOnly/api/types/Enums.gen';
import { Action, Resolver } from '@/typescript/utils/common';

export type MyTicketScreenProps = {
    mpDispatch: Resolver<MyTicketAction>;
};

export type TicketMappedData = {
    id: string;
    placeName: string;
    placeType: PlaceType_placeType | undefined;
    passengerCategory: string;
    date: string;
    time: string;
    totalPrice: number;
    status: TicketBookingStatus_ticketBookingStatus;
    iconUrl: undefined | string;
    ticketShortId: string;
};

export type MyTicketScreenAction = {};

export type TicketCardProps = {
    ticket: TicketMappedData;
};

export type TopBarProps = {
    icon: React.ReactNode;
    title: string;
    date: string;
    onIconPress: () => void;
};

export type MyTicketAction = Action<'PRESSED_BACK'>;
