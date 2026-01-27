import { ServiceStatus_serviceStatus } from '@/readOnly/api/types/Enums.gen';
import { ticketBookingDetails } from '@/readOnly/api/types/TicketBookingDetails.gen';
import { Action, Resolver } from '@/typescript/utils/common';
import { appName } from 'config-types';

export type EventTicketUIProps = {
    ticketDetails: ticketBookingDetails | undefined;
    mpDispatch: Resolver<PaymentStatusAction>;
};

// Action types
export type EventTicketingAction =
    | { type: 'DISMISS_MODAL' }
    | { type: 'CLOSE_SCREEN' }
    | { type: 'SHOW_HELP' }
    | { type: 'SHARE_TICKET' }
    | { type: 'TICKET_ACTION' }
    | { type: 'BOOK_AUTO' }
    | { type: 'START_NAVIGATION' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_POPUP'; payload: boolean };

export type QRCarouselProps = {
    qrString: string;
    otp: string | undefined;
    size: number | undefined;
    preview: number | undefined;
    onQrPress: () => void;
    onOtpPress: () => void;
    showOtp: boolean;
    otpColor: string | undefined;
    appName: appName;
};

export type QrCodeViewProps = {
    jsonString: string | undefined;
    size: number | undefined;
    isTicketExpired: boolean;
    status: ServiceStatus_serviceStatus | undefined;
};

export type EventTicketingScreenProps = {
    orderId: string;
    sdkStatus: string;
};

export type peopleCategory = {
    name: string;
    count: number;
};

export type TicketContentProps = {
    ticketDetails: ticketBookingDetails | null;
};

export type TicketCardData = {
    id: string;
    venueName: string;
    venueType: string;
    passengerCount: string;
    date: string;
    time: string;
    totalPrice: number;
    status: 'CANCELED' | 'EXPIRED' | 'ACTIVE';
    refundAmount: number;
    refundStatus: string;
};

export type PaymentStatusAction = Action<'PRESSED_BACK'>;
