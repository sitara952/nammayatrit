import { Action } from '@/typescript/utils/common';
import { Resolver } from '@/typescript/utils/common';
import { payoutHistory } from '@/readOnly/api/types/PayoutHistory.gen';

export type ReferralEarningsScreenAction =
    | Action<'BACK_PRESS'>
    | Action<'RETRY_CLICKED'>
    | Action<'HANDLE_COPY_CLICKED', { orderId: string }>;

export type ReferralEarningsScreenUIProps = {
    payoutHistory: payoutHistory | undefined;
    isFetching: boolean;
    isLoading: boolean;
    isError: boolean;
    payoutVpa: string | undefined;
    referralAmountPaid: number;
    resDispatch: Resolver<ReferralEarningsScreenAction>;
};
