import { Action, Resolver } from '@/typescript/utils/common';
import { PaymentFulfillmentStatus_paymentFulfillmentStatus } from '@/readOnly/api/types/Enums.gen.tsx';

export type MultimodalPaymentStatusAction = Action<'PAYMENT_SUCCESSFUL'> | Action<'RETRY_PAYMENT'>;

export type MultimodalPaymentStatusProps = {
    mpDispatch: Resolver<MultimodalPaymentStatusAction>;
    fulfillmentStatus: PaymentFulfillmentStatus_paymentFulfillmentStatus;
    paymentRetryAfterFailureCounter: number;
    amount: number | undefined;
    isTicketBookingFailedModalVisible: boolean;
    domainType: string | undefined;
    setIsTicketBookingFailedModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
    handleGoToHome: () => void;
};
