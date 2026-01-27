export interface PaymentDetailsData {
    transactionId: string;
    totalAmount: number;
    dateAndTime: string;
}

export type TransportType = 'bus' | 'metro';
