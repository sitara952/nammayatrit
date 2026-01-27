import React from 'react';
import { View, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Header } from '../../primitives/Header';
import Button from '../../primitives/Button';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { PayoutStatus_payoutStatus } from '@/readOnly/api/types/Enums.gen';

import { useRefsContext } from '@/typescript/context/RefsContext';
import Animated from 'react-native-reanimated';
import Divider from '@/typescript/designSystem/components/primitives/Divider';
import { colors as defaultColors } from 'config-types/src/domain/default/themes/colors';
import DotIcon from '@/typescript/components/svg/DotIcon';
import { Icon } from '@/typescript/components/Icon';
import { payoutItem } from '@/readOnly/api/types/PayoutItem.gen';
import CopyContent from '@/typescript/components/svg/CopyContent';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { ReferralEarningsScreenUIProps } from './Types';
import { createAction } from '@/typescript/utils/common';
import { convertUTCtoIST } from '@/src-v2/utils/common';
import { CURRENCY_SYMBOL } from '@/typescript/constants/common';

export const TransactionHistoryScreen: React.FC<ReferralEarningsScreenUIProps> = ({
    payoutHistory,
    isFetching,
    isLoading,
    isError,
    payoutVpa,
    referralAmountPaid,
    resDispatch,
}) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const { collectReferralEarningModalRef } = useRefsContext();

    const currencySymbol = CURRENCY_SYMBOL.value;

    const getStatusStyle = (status: PayoutStatus_payoutStatus) => {
        switch (status) {
            case 'Success':
                return {
                    backgroundColor: themeColors.Icon_positive,
                    color: themeColors.Fill_neutralMin,
                    borderRadius: 13,
                };
            case 'Processing':
                return {
                    backgroundColor: defaultColors.yellow400,
                    color: themeColors.Fill_neutralMin,
                    borderRadius: 13,
                };
            case 'Failed':
                return {
                    backgroundColor: themeColors.Text_negativeHigh,
                    color: themeColors.Fill_neutralMin,
                    borderRadius: 13,
                };
            default:
                return {
                    backgroundColor: themeColors.Text_neutralMax,
                    color: themeColors.Fill_neutralMin,
                    borderRadius: 13,
                };
        }
    };

    const renderTransaction = ({ item, index }: { item: payoutItem; index: number }) =>
        isLoading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.Fill_neutralUltraHigh} />
            </View>
        ) : isError ? (
            <View style={styles.errorContainer}>
                <Typography
                    type="body-2"
                    style={styles.errorText}
                    numberOfLines={2}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={userLanguageStrings.SomethingWentWrongPleaseTryAgain}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.SomethingWentWrongPleaseTryAgain}
                </Typography>
                <Button
                    testID="referral_earnings_retry"
                    onPress={() => {
                        resDispatch(createAction('RETRY_CLICKED', undefined));
                    }}
                    text={userLanguageStrings.Retry}
                    type="primary"
                />
            </View>
        ) : (
            <View
                style={[
                    styles.transactionItem,
                    { borderColor: themeColors.Fill_neutralLow },
                    index === (payoutHistory?.history?.length ?? 0) - 1 ? styles.roundedBottom : styles.noBorderBottom,
                ]}>
                <View style={styles.transactionHeader}>
                    <View style={styles.orderIdContainer}>
                        <Typography
                            type="body-7"
                            style={styles.orderIdText}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={item.orderId}
                            accessibilityRole={undefined}>
                            {item.orderId}
                        </Typography>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Copy Order ID button"
                            testID="referral_earnings_copy_order_id"
                            onPress={() => {
                                resDispatch(createAction('HANDLE_COPY_CLICKED', { orderId: item.orderId }));
                            }}>
                            <CopyContent />
                        </Pressable>
                    </View>

                    <Typography
                        type="title-800"
                        style={[styles.amountText, { color: getStatusStyle(item.payoutStatus).backgroundColor }]}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={`${currencySymbol}${item.amount}`}
                        accessibilityRole={undefined}>
                        {currencySymbol}
                        {item.amount}
                    </Typography>
                </View>
                <View style={styles.transactionDetails}>
                    <View style={styles.dateVpaContainer}>
                        <Typography
                            type="body-2"
                            style={styles.dateText}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={item.payoutAt}
                            accessibilityRole={undefined}>
                            {convertUTCtoIST(item.payoutAt, 'DD MMM YYYY')}
                        </Typography>
                        <Icon icon={<DotIcon />} size={18} />
                        <Typography
                            type="body-2"
                            style={styles.vpaText}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={item.payoutAt}
                            accessibilityRole={undefined}>
                            {item.vpa}
                        </Typography>
                    </View>

                    <View style={[styles.statusBadge, getStatusStyle(item.payoutStatus)]}>
                        <Typography
                            type="title"
                            style={{ color: 'white' }}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={item.payoutStatus}
                            accessibilityRole={undefined}>
                            {item.payoutStatus.toUpperCase()}
                        </Typography>
                    </View>
                </View>
                {(payoutHistory?.history?.length ?? 0) - 1 !== index && (
                    <Divider
                        type="dashed"
                        dividerColor={defaultColors.neutral450}
                        strokeDashArray="6 5"
                        direction={undefined}
                        style={{ marginTop: 10 }}
                        labelPosition={undefined}
                        offset={undefined}
                        offsetBackground={undefined}
                    />
                )}
            </View>
        );

    const ListHeader = () => (
        <>
            <View style={styles.headerContainer}>
                <View
                    style={[
                        styles.accountInfoContainer,
                        {
                            backgroundColor: themeColors.Fill_neutralMin,
                            borderColor: themeColors.Fill_neutralLow,
                        },
                    ]}>
                    <View style={styles.accountInfoHeader}>
                        <View style={styles.accountInfoTextContainer}>
                            <Typography
                                type="title-800"
                                style={styles.vpaTitle}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="9876543210@ptyes"
                                accessibilityRole={undefined}>
                                {payoutVpa}
                            </Typography>
                            <Typography
                                type="body-2"
                                style={[styles.accountInfoSubtitle, { color: defaultColors.gray300 }]}
                                numberOfLines={2}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel={userLanguageStrings.EarningsCreditedToAccount}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.EarningsCreditedToAccount}
                            </Typography>
                        </View>
                        <Button
                            testID="referral_earnings_edit_account"
                            type="secondary"
                            text={userLanguageStrings.Edit}
                            onPress={() => {
                                collectReferralEarningModalRef.current?.present();
                            }}
                            size="sm"
                            style={[
                                styles.editButton,
                                {
                                    backgroundColor: themeColors.Fill_neutralMin,
                                    borderColor: defaultColors.neutral450,
                                },
                            ]}
                            textColor={themeColors.Text_neutralMax}
                        />
                    </View>
                </View>

                <Typography
                    type="subhead-700"
                    style={styles.historyTitle}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel={userLanguageStrings.TransactionHistory}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.TransactionHistory}
                </Typography>
            </View>

            <View>
                <View style={[styles.totalEarnedHeader, { backgroundColor: themeColors.Fill_neutralLow }]}>
                    <Typography
                        type="body-2"
                        style={{ color: themeColors.Text_neutralHigh }}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={userLanguageStrings.TotalEarned}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.TotalEarned}
                    </Typography>
                    <Typography
                        type="title-800"
                        style={styles.totalAmountText}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={`${currencySymbol}${referralAmountPaid}`}
                        accessibilityRole={undefined}>
                        {currencySymbol}
                        {referralAmountPaid}
                    </Typography>
                </View>
            </View>
        </>
    );

    return (
        <HardwareBackpressHandler onHardwareBackPress={() => resDispatch(createAction('BACK_PRESS', undefined))}>
            <Animated.View style={[styles.container, { backgroundColor: defaultColors.white100 }]}>
                <Header
                    title={userLanguageStrings.Earnings}
                    onBackPress={() => {
                        resDispatch(createAction('BACK_PRESS', undefined));
                    }}
                />

                <FlatList
                    data={payoutHistory?.history || []}
                    renderItem={renderTransaction}
                    keyExtractor={item => item.orderId}
                    showsVerticalScrollIndicator={false}
                    onEndReachedThreshold={0.5}
                    ListHeaderComponent={ListHeader}
                    ListFooterComponent={
                        isFetching ? (
                            <View style={styles.loadingFooter}>
                                <ActivityIndicator size="small" color={themeColors.Fill_neutralUltraHigh} />
                            </View>
                        ) : null
                    }
                />
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
    },
    headerContainer: {
        paddingHorizontal: 16,
    },
    accountInfoContainer: {
        borderRadius: 24,
        padding: 16,
        marginTop: 16,
        borderWidth: 1,
    },
    accountInfoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accountInfoTextContainer: {
        flex: 1,
        marginRight: 16,
    },
    vpaTitle: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    accountInfoSubtitle: {
        fontSize: 12,
    },
    editButton: {
        borderRadius: 9999,
        borderWidth: 1,
        paddingTop: 10,
        paddingRight: 16,
        paddingBottom: 10,
        paddingLeft: 14,
    },
    historyTitle: {
        marginTop: 24,
        marginBottom: 16,
    },
    totalEarnedHeader: {
        marginHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
    totalAmountText: {
        fontWeight: 'bold',
    },
    transactionItem: {
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginHorizontal: 16,
        borderWidth: 1,
        borderTopWidth: 0,
    },
    roundedBottom: {
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
    },
    noBorderBottom: {
        borderBottomWidth: 0,
    },
    transactionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderIdContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    orderIdText: {
        fontSize: 12,
    },
    amountText: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    transactionDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    dateVpaContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    dateText: {
        color: 'rgb(107, 114, 128)',
        fontSize: 12,
    },
    vpaText: {
        color: 'rgb(107, 114, 128)',
        fontSize: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    errorContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    errorText: {
        textAlign: 'center',
        marginBottom: 16,
    },
    loadingFooter: {
        paddingVertical: 16,
    },
});
