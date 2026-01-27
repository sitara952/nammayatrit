import React, { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import { TransactionHistoryScreen } from './UI';
import { selectPayoutVpa } from '@/typescript/state/client/user';
import { useAppSelector } from '@/typescript/state/hooks';
import { useReferralPayoutHistoryGetQuery } from '@/api/integrations/rtk/ReferralPayoutHistoryGet';
import { createDispatcher, Resolver } from '@/typescript/utils/common';
import { ReferralEarningsScreenAction } from './Types';
import { handleCopyToClipBoard } from '@/src-v2/utils/common';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const EarningsFlow: React.FC = () => {
    const navigation = useNavigation<NativeStackNavigationProp<MainNavigationParamList>>();
    const payoutVpa = useAppSelector(selectPayoutVpa);
    const { data: payoutHistory, isLoading, isFetching, isError, refetch } = useReferralPayoutHistoryGetQuery({});

    const referralAmountPaid = payoutHistory?.history?.reduce((acc, item) => {
        if (item.payoutStatus === 'Success') {
            return acc + item.amount;
        }
        return acc;
    }, 0);

    const resolver: Resolver<ReferralEarningsScreenAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'BACK_PRESS':
                    navigation.goBack();
                    break;
                case 'RETRY_CLICKED':
                    refetch();
                    break;
                case 'HANDLE_COPY_CLICKED':
                    handleCopyToClipBoard(action.payload?.orderId || '');
                    break;
                default:
                    throw new Error(`Unhandled action type: ${action}`);
            }
        },
        [navigation],
    );

    const resDispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <TransactionHistoryScreen
            payoutHistory={payoutHistory}
            isFetching={isFetching}
            isError={isError}
            isLoading={isLoading}
            payoutVpa={payoutVpa}
            referralAmountPaid={referralAmountPaid || 0}
            resDispatch={resDispatch}
        />
    );
};
