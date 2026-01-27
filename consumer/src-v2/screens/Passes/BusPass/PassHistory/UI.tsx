import React from 'react';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import TransactionHistory from '../components/TransactionHistory';
import { purchasedPassTransactionAPIEntity } from '@/readOnly/api/types/PurchasedPassTransactionAPIEntity.gen';

interface PassHistoryUIProps {
    onBackPress: () => void;
    passTransactions: purchasedPassTransactionAPIEntity[] | undefined;
    isLoading: boolean;
    onLoadMore: () => void;
    isLoadingMore: boolean;
    hasMore: boolean;
}

export const PassHistoryUI: React.FC<PassHistoryUIProps> = ({
    onBackPress,
    passTransactions,
    isLoading,
    onLoadMore,
    isLoadingMore,
    hasMore,
}) => {
    return (
        <HardwareBackpressHandler onHardwareBackPress={onBackPress}>
            <TransactionHistory
                onBackPress={onBackPress}
                passTransactions={passTransactions}
                isLoading={isLoading}
                onLoadMore={onLoadMore}
                isLoadingMore={isLoadingMore}
                hasMore={hasMore}
            />
        </HardwareBackpressHandler>
    );
};
