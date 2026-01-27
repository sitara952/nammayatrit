import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useCallback, useState, useEffect } from 'react';
import { MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { PassHistoryUI } from './UI';
import { useMultimodalPassTransactionsGetQuery } from '@/api/integrations/rtk/MultimodalPassTransactionsGet';
import { purchasedPassTransactionAPIEntity } from '@/readOnly/api/types/PurchasedPassTransactionAPIEntity.gen';

const LIMIT = 10;

export const PassHistoryFlow = () => {
    const navigation = useNavigation<NavigationProp<MainNavigationParamList>>();
    const [offset, setOffset] = useState(0);
    const [allTransactions, setAllTransactions] = useState<purchasedPassTransactionAPIEntity[]>([]);
    const [hasMore, setHasMore] = useState(true);

    const {
        data: apiData,
        isLoading: apiLoading,
        isFetching,
    } = useMultimodalPassTransactionsGetQuery({
        limit: LIMIT,
        offset,
    });

    useEffect(() => {
        if (apiData) {
            if (offset === 0) {
                setAllTransactions(apiData);
            } else {
                setAllTransactions(prev => {
                    const existingCreatedAts = new Set(prev.map(t => t.createdAt));
                    const newTransactions = apiData.filter(t => !existingCreatedAts.has(t.createdAt));
                    return [...prev, ...newTransactions];
                });
            }
            setHasMore(apiData.length === LIMIT);
        }
    }, [apiData, offset]);

    const onBackPress = useCallback(() => {
        navigation.goBack();
    }, [navigation]);

    const onLoadMore = useCallback(() => {
        if (!isFetching && hasMore) {
            setOffset(prev => prev + LIMIT);
        }
    }, [isFetching, hasMore]);

    const isLoadingMore = isFetching && offset > 0;

    return (
        <PassHistoryUI
            onBackPress={onBackPress}
            passTransactions={allTransactions}
            isLoading={apiLoading && offset === 0}
            onLoadMore={onLoadMore}
            isLoadingMore={isLoadingMore}
            hasMore={hasMore}
        />
    );
};
