import { Action, Resolver } from '@/typescript/utils/common';
import { TicketServiceData } from '../ChooseCategories/Types';

export type ReviewBookingAction =
    | Action<'PRESSED_BACK'>
    | Action<'TOGGLE_PRICE_BREAKDOWN'>
    | Action<'CHOOSE_PAYMENT_METHOD'>;

export type ServiceSlot = {
    serviceName: string;
    peopleCategory: string;
    noOfTickets: number;
    totalPrice: number;
};

export type ReviewBookingProps = {
    placeId: string | undefined;
    placeName: string | undefined;
    shortDesc: string | undefined;
    placeIconUrl: string | undefined;
    selectedDate: string | undefined;
    selectedBusinessHours: Record<string, string>;
    selectedCategories: Record<string, string>;
    passengerCategoryQuantities: Record<string, number>;
    servicesInfo: TicketServiceData[];
};

export type EventDetails = {
    name: string;
    subtitle: string;
    image: string;
    date: string;
    ticketItem: ServiceSlot[];
};

export type OtherCharges = {
    name: string;
    amount: number;
};

export type PaymentSummary = {
    grandTotal: number;
    otherCharges: OtherCharges[];
};

export type ReviewBookingScreenProps = {
    mpDispatch: Resolver<ReviewBookingAction>;
    eventDetails: EventDetails;
    paymentSummary: PaymentSummary;
    showPriceBreakdown: boolean;
};
