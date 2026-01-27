import React, { useCallback, useMemo } from 'react';
import { ActivityIndicator, FlatList, ListRenderItem, View } from 'react-native';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Icon } from '../../../../multimodal/components/common/Icon';
import { LeftArrowVersionTwo, RefundArrow } from '../../../../multimodal/components/svg/Arrows';
import { useScaleAnimation } from '../../../../../src/typescript/utils/useScaleAnimation';
import mtIcGoldenTicket from '../../../../assets/mt_ic_golden_pass.webp';
import mtIcSilverTicket from '../../../../assets/mt_ic_silver_pass.webp';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { purchasedPassTransactionAPIEntity } from '@/readOnly/api/types/PurchasedPassTransactionAPIEntity.gen';
import { useRefsContext } from '../../../../../src/typescript/context/RefsContext';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import ticketIcon from '@/src-v2/assets/tourist_bus.webp';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

const formatDateRange = (startDate: string, expiryDate: string): string => {
    const start = new Date(startDate);
    const expiry = new Date(expiryDate);

    const startDay = start.getDate();
    const startMonth = MONTH_NAMES[start.getMonth()];

    const expiryDay = expiry.getDate();
    const expiryMonth = MONTH_NAMES[expiry.getMonth()];
    const expiryYear = expiry.getFullYear().toString().slice(-2);

    return `${startDay}' ${startMonth} - ${expiryDay}' ${expiryMonth} ${expiryYear}`;
};

const formatDate = (date: string): string => {
    const dateObj = new Date(date);
    const day = dateObj.getDate();
    const month = MONTH_NAMES[dateObj.getMonth()];
    return `${day}' ${month}`;
};

const formatTime = (date: string): string => {
    const dateObj = new Date(date);
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes}${period}`;
};

const PassCard = React.memo(
    ({
        passCode,
        passName,
        startDate,
        expiryDate,
        amount,
        status,
        createdAt,
    }: {
        passCode: string;
        passName: string | undefined;
        startDate: string;
        expiryDate: string;
        amount: string;
        status: string;
        createdAt: string;
    }) => {
        const formattedDateRange = useMemo(() => formatDateRange(startDate, expiryDate), [startDate, expiryDate]);
        const formattedPurchaseDate = useMemo(() => formatDate(createdAt), [createdAt]);
        const formattedPurchaseTime = useMemo(() => formatTime(createdAt), [createdAt]);
        const configManager = useConfigContext();
        const userLanguageStrings = configManager.get('userLanguageStrings');

        const getStatusColor = useCallback(() => {
            switch (status) {
                case 'Active':
                    return '#09941E';
                case 'Refunded':
                    return '#3B3A3C';
                case 'Expired':
                    return '#969696';
                case 'Failed':
                    return '#DD5353';
                case 'Processing':
                    return '#969696';
                default:
                    return '#969696';
            }
        }, [status]);

        const isGoldPass = passCode === 'GOLD1000';
        const isUlaa = passCode === 'ULLA1DAY';

        return (
            <Animated.View style={tailwind.style('bg-white rounded-[20px] border border-[#F1F2F2] p-[16px]')}>
                <Animated.View style={tailwind.style('flex-row items-end justify-between')}>
                    <Animated.View style={tailwind.style('flex-row gap-x-[8px]')}>
                        <Animated.Image
                            style={tailwind.style('w-[38px] h-[57px] overflow-hidden rounded-[8px]')}
                            source={isGoldPass ? mtIcGoldenTicket : isUlaa ? ticketIcon : mtIcSilverTicket}
                            accessibilityLabel="Golden Ticket Image"
                        />
                        <Animated.View>
                            <Animated.Text
                                numberOfLines={1}
                                accessibilityLabel={`Bus Pass ${passName || (isGoldPass ? 'Gold' : 'Diamond')}`}
                                style={tailwind.style(
                                    'text-[14px] font-areaNormal-extrabold  leading-[25px]',
                                    status === 'Expired' ? 'text-[#969696]' : 'text-[#3B3A3C]',
                                )}>
                                {passName ||
                                    userLanguageStrings.BusPassCode(
                                        isGoldPass ? userLanguageStrings.Gold : userLanguageStrings.Diamond,
                                    )}
                            </Animated.Text>
                            <Animated.Text
                                style={tailwind.style(
                                    'text-[12px] font-areaNormal-extrabold  mt-[6px] leading-[13px]',
                                    status === 'Expired' ? 'text-[#969696]' : 'text-[#7E7E7E]',
                                )}>
                                {formattedDateRange}
                            </Animated.Text>
                        </Animated.View>
                    </Animated.View>
                    <Animated.View style={tailwind.style('flex-row items-center gap-x-[2px]')}>
                        <Animated.Text
                            style={tailwind.style(
                                'text-[20px] font-areaNormal-extrabold text-center ',
                                status === 'Expired' || status === 'Processing' ? 'text-[#969696]' : 'text-[#313131]',
                            )}>
                            <Animated.Text style={tailwind.style('text-[14px] ')}>₹</Animated.Text>
                            {amount || ''}
                        </Animated.Text>
                        {status === 'Refunded' && (
                            <Icon icon={<RefundArrow fill="#3B3A3C" />} size={14} color="#3B3A3C" />
                        )}
                    </Animated.View>
                </Animated.View>
                <Divider
                    dividerColor="#F5F5F5"
                    strokeDashArray="4 3"
                    labelPosition="center"
                    offset={0}
                    offsetBackground="#F5F5F5"
                    type="dashed"
                    direction="horizontal"
                    style={tailwind.style('mt-[15px]')}
                />
                <Animated.View style={tailwind.style('flex-row items-center justify-between pt-[14px]')}>
                    <Animated.Text
                        style={tailwind.style('text-[14px] font-areaNormal-extrabold', `text-[${getStatusColor()}]`)}>
                        {status === 'PreBooked' ? userLanguageStrings.Upcoming : status}
                    </Animated.Text>
                    <Animated.Text style={tailwind.style('text-[14px] font-areaNormal-extrabold text-[#B8B8B8]')}>
                        {formattedPurchaseDate} • {formattedPurchaseTime}
                    </Animated.Text>
                </Animated.View>
            </Animated.View>
        );
    },
);

const TransactionHistory = ({
    onBackPress,
    passTransactions,
    isLoading: _isLoading,
    onLoadMore,
    isLoadingMore,
    hasMore,
}: {
    onBackPress: () => void;
    passTransactions: purchasedPassTransactionAPIEntity[] | undefined;
    isLoading: boolean | undefined;
    onLoadMore: () => void;
    isLoadingMore: boolean;
    hasMore: boolean;
}) => {
    const { top } = useSafeAreaInsets();
    const { handlers, animatedStyle } = useScaleAnimation();
    const { buyBussPassOptionsSheetRef } = useRefsContext();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const handleRenew = useCallback(() => {
        buyBussPassOptionsSheetRef.current?.present();
    }, [buyBussPassOptionsSheetRef]);

    const renderItem: ListRenderItem<purchasedPassTransactionAPIEntity> = useCallback(({ item }) => {
        return (
            <PassCard
                passCode={item.passCode}
                passName={item.passName}
                startDate={item.startDate}
                expiryDate={item.endDate}
                amount={item.amount?.toString() || ''}
                status={item.status}
                createdAt={item.createdAt}
            />
        );
    }, []);

    const keyExtractor = useCallback((_item: purchasedPassTransactionAPIEntity, index: number) => `${index}`, []);

    const ItemSeparator = useCallback(() => <Animated.View style={tailwind.style('h-[12px]')} />, []);

    const handleEndReached = useCallback(() => {
        if (hasMore && !isLoadingMore) {
            onLoadMore();
        }
    }, [hasMore, isLoadingMore, onLoadMore]);

    const ListFooterComponent = useCallback(() => {
        if (!isLoadingMore) return null;
        return (
            <View style={tailwind.style('py-4 items-center')}>
                <ActivityIndicator size="small" color="#016ACD" />
            </View>
        );
    }, [isLoadingMore]);

    return (
        <Animated.View style={tailwind.style(`flex-1 pt-[${top || 16}px]`)}>
            <Animated.View style={tailwind.style('flex-row items-center justify-between px-4')}>
                <Pressable
                    onPress={onBackPress}
                    testID="back-button"
                    accessibilityRole="button"
                    accessibilityLabel="Back button"
                    {...handlers}
                    style={tailwind.style('flex-row items-center justify-center')}
                    accessibilityHint="Go back to the previous screen">
                    <Animated.View
                        style={[
                            tailwind.style('p-[10px] bg-white rounded-full border border-[#F1F2F2]'),
                            animatedStyle,
                        ]}>
                        <Icon icon={<LeftArrowVersionTwo fill="#3D3C3E" />} size={16} color="#3D3C3E" />
                    </Animated.View>
                </Pressable>
                <Animated.Text
                    style={tailwind.style('text-[15px] font-areaNormal-extrabold text-center text-[#656565]')}>
                    {userLanguageStrings.TransactionHistory}
                </Animated.Text>
                <Pressable
                    onPress={handleRenew}
                    testID="BuyHistory-button"
                    accessibilityRole="button"
                    accessibilityLabel="BuyHistory button"
                    {...handlers}
                    style={tailwind.style('flex-row items-center justify-center rounded-2xl bg-[#016ACD]')}
                    accessibilityHint="This is a button to buy from history pass">
                    <Animated.Text style={tailwind.style('p-[10px] py-[8px] text-white font-areaNormal-bold')}>
                        {userLanguageStrings.BuyNew}
                    </Animated.Text>
                </Pressable>
            </Animated.View>

            {!passTransactions || passTransactions.length === 0 ? (
                <View style={tailwind.style('flex-1 justify-center items-center px-8')}>
                    <Animated.Text style={tailwind.style('text-[#7E7E7E] text-[16px] text-center')}>
                        {userLanguageStrings.NoPassHistoryAvailable}
                    </Animated.Text>
                    <Animated.Text style={tailwind.style('text-[#969696] text-[13px] text-center mt-2')}>
                        {userLanguageStrings.YourExpiredAndPastPassesWillAppearHere}
                    </Animated.Text>
                </View>
            ) : (
                <FlatList
                    data={passTransactions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ItemSeparatorComponent={ItemSeparator}
                    contentContainerStyle={tailwind.style('pt-[24px] px-4 pb-[24px]')}
                    showsVerticalScrollIndicator={false}
                    onEndReached={handleEndReached}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={ListFooterComponent}
                />
            )}
        </Animated.View>
    );
};

export default TransactionHistory;
