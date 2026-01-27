import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import Button from '@/src-v2/primitives/Button';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { createAction, Resolver } from '@/typescript/utils/common';
import { EventDetails, PaymentSummary, ReviewBookingAction, ReviewBookingScreenProps } from './Types';
import locationIcon from '@/typescript/assets/ticketing/ys_location_pin_icon.webp';
import boatingIcon from '../../../../../consumer/android/app/src/odishaYatri/res/drawable/ic_boating_icon.webp';
import greyUpChevron from '@/typescript/assets/ticketing/ys_grey_chevron_up.webp';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const DashedLine: React.FC = React.memo(() => {
    return (
        <View style={styles.dashedLineContainer}>
            {Array.from({ length: 20 }).map((_, index) => (
                <View key={index} style={[styles.dashDot, { backgroundColor: '#F5F5F5' }]} />
            ))}
        </View>
    );
});

const PlaceDetails: React.FC<{ eventDetails: EventDetails }> = React.memo(({ eventDetails }) => {
    return (
        <Animated.View style={styles.eventCard}>
            <View style={styles.eventHeader}>
                <Image
                    accessible={true}
                    accessibilityLabel="event image"
                    source={{ uri: eventDetails.image }}
                    style={styles.eventImage}
                />
                <View style={styles.eventInfo}>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        style={styles.eventName}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {eventDetails.name}
                    </Typography>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        style={styles.eventSubtitle}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {eventDetails.subtitle}
                    </Typography>
                </View>
            </View>
        </Animated.View>
    );
});

const PaymentSummaryView: React.FC<{
    paymentSummary: PaymentSummary;
    showPriceBreakdown: boolean;
    mpDispatch: Resolver<ReviewBookingAction>;
}> = React.memo(({ paymentSummary, showPriceBreakdown, mpDispatch }) => {
    const formatCurrency = (amount: number) => `₹${amount.toFixed(2).toLocaleString()}`;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={styles.paymentSection}>
            <Typography
                type="body-8"
                accessibilityRole={undefined}
                style={styles.sectionTitle}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}>
                {userLanguageStrings.PaymentSummary}
            </Typography>

            <Animated.View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        style={styles.totalLabel}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {userLanguageStrings.GrandTotal}
                    </Typography>
                    <Typography
                        type="title-800"
                        accessibilityRole={undefined}
                        style={styles.totalValue}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {formatCurrency(paymentSummary.grandTotal)}
                    </Typography>
                </View>

                {paymentSummary.otherCharges.length > 0 && (
                    <TouchableOpacity
                        onPress={() => mpDispatch(createAction('TOGGLE_PRICE_BREAKDOWN', undefined))}
                        style={styles.breakdownToggle}
                        testID="price-breakdown-toggle"
                        accessibilityRole="button"
                        accessibilityLabel="Toggle price breakdown">
                        <Typography
                            type="body"
                            accessibilityRole={undefined}
                            style={styles.breakdownText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}>
                            {userLanguageStrings.PriceBreakdown}
                        </Typography>
                        <Animated.Image
                            accessible={false}
                            source={greyUpChevron}
                            style={{
                                width: 12,
                                height: 6,
                                marginTop: 3,
                                transform: [{ rotate: showPriceBreakdown ? '0deg' : '180deg' }],
                            }}
                        />
                    </TouchableOpacity>
                )}

                {showPriceBreakdown && (
                    <Animated.View style={styles.breakdownDetails}>
                        {paymentSummary.otherCharges.map(charges => (
                            <View key={charges.name} style={styles.summaryRow}>
                                <Typography
                                    type="body"
                                    accessibilityRole={undefined}
                                    style={styles.breakdownText}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}>
                                    {charges.name}
                                </Typography>
                                <Typography
                                    type="body"
                                    accessibilityRole={undefined}
                                    style={styles.summaryValue}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}>
                                    {formatCurrency(charges.amount)}
                                </Typography>
                            </View>
                        ))}
                    </Animated.View>
                )}
            </Animated.View>
        </Animated.View>
    );
});

const EventTicketDetails: React.FC<{ eventDetails: EventDetails }> = React.memo(({ eventDetails }) => {
    const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={styles.eventDetailsInfo}>
            <Animated.View style={{ flexDirection: 'row' }}>
                <View style={[styles.detailItem, { flex: 1 }]}>
                    <Image
                        accessible={false}
                        source={
                            eventDetails.ticketItem.every(v => v.peopleCategory === 'Boat') ? boatingIcon : locationIcon
                        }
                        style={styles.detailIcon}
                    />
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        style={styles.detailText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {eventDetails.name}
                    </Typography>
                </View>
                <View style={styles.detailItem}>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        style={styles.detailTextDate}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {eventDetails.date}
                    </Typography>
                </View>
            </Animated.View>
            <DashedLine />
            <Animated.View style={styles.ticketSection}>
                <Animated.View style={{ rowGap: 12 }}>
                    {eventDetails.ticketItem.map((ticket, index) => (
                        <View key={index} style={styles.ticketItem}>
                            <Typography
                                type="body-1"
                                accessibilityRole={undefined}
                                style={styles.ticketTitle}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}>
                                {ticket.noOfTickets + ' x ' + ticket.peopleCategory + ' - ' + ticket.serviceName}
                            </Typography>
                            <Typography
                                type="title-800"
                                accessibilityRole={undefined}
                                style={styles.ticketPrice}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}>
                                {formatCurrency(ticket.totalPrice)}
                            </Typography>
                        </View>
                    ))}
                </Animated.View>
                <Animated.View style={{ marginTop: 6 }}>
                    <DashedLine />
                </Animated.View>

                <Animated.View style={styles.policyLink}>
                    <Typography
                        type="body"
                        accessibilityRole={undefined}
                        style={styles.policyText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {userLanguageStrings.ThisticketisNonRefundable}
                    </Typography>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
});

const ReviewBookingUI: React.FC<ReviewBookingScreenProps> = props => {
    const { mpDispatch, eventDetails, paymentSummary, showPriceBreakdown } = props;
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    return (
        <HardwareBackpressHandler onHardwareBackPress={() => mpDispatch(createAction('PRESSED_BACK', undefined))}>
            <Animated.View style={[styles.container, { paddingTop: top }]}>
                <Animated.View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => mpDispatch(createAction('PRESSED_BACK', undefined))}
                        style={styles.backButton}
                        testID="review-booking-back-button"
                        accessibilityRole="button"
                        accessibilityLabel="Go back">
                        <ChevronLeftIcon />
                    </TouchableOpacity>
                    <Typography
                        type="subhead-900"
                        accessibilityRole={undefined}
                        style={styles.headerTitle}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}>
                        {userLanguageStrings.ReviewyourBooking}
                    </Typography>
                </Animated.View>

                <ScrollView
                    style={[styles.scrollContainer, { paddingBottom: bottom }]}
                    showsVerticalScrollIndicator={false}>
                    <PlaceDetails eventDetails={eventDetails} />
                    <EventTicketDetails eventDetails={eventDetails} />
                    <PaymentSummaryView
                        paymentSummary={paymentSummary}
                        showPriceBreakdown={showPriceBreakdown}
                        mpDispatch={mpDispatch}
                    />
                    <View style={styles.bottomSpacer} />
                </ScrollView>

                <Animated.View style={[styles.bottomButtonContainer, { paddingBottom: bottom }]}>
                    <Button
                        type="primary"
                        onPress={() => {
                            mpDispatch(createAction('CHOOSE_PAYMENT_METHOD', undefined));
                        }}
                        style={styles.paymentButton}
                        text={userLanguageStrings.ChoosePaymentMethod}
                        testID="choose-payment-method-button"
                    />
                </Animated.View>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

export default React.memo(ReviewBookingUI);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FB',
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        color: '#000000',
        flex: 1,
        marginHorizontal: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    eventCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 6,
        marginTop: 12,
    },
    eventHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    eventImage: {
        width: 72,
        height: 78,
        borderRadius: 8,
        marginRight: 12,
    },
    eventInfo: {
        flex: 1,
    },
    eventName: {
        fontSize: 16,
        color: '#000000',
        marginBottom: 3,
    },
    eventSubtitle: {
        fontSize: 13,
        color: '#666666',
        lineHeight: 20,
    },
    eventDetailsInfo: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 14,
        marginTop: 24,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailIcon: {
        width: 32,
        height: 32,
        marginRight: 10,
    },
    detailText: {
        fontSize: 14,
        color: '#5B6777',
    },
    detailTextDate: {
        fontSize: 13,
        color: '#5B6777',
    },
    ticketSection: {},
    ticketItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    ticketTitle: {
        fontSize: 16,
        color: '#14171F',
        marginRight: 12,
        width: '60%',
    },
    ticketPrice: {
        color: '#14171F',
    },
    policyLink: { flexDirection: 'row' },
    policyText: {
        fontSize: 13,
        color: '#5B6777',
    },
    offerText: {
        fontSize: 15,
        color: '#7B8997',
        fontWeight: '800',
    },
    offersSection: {
        marginTop: 24,
    },
    sectionTitle: {
        color: '#7B8997',
    },
    offerCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingTop: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    summaryCard: {
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    offerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    offerIcon: {
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    offerContent: {
        width: '50%',
    },
    offerTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#14171F',
        lineHeight: 20,
    },
    applyButton: {
        backgroundColor: '#F7F7F7',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        alignSelf: 'flex-start',
        height: 40,
        width: 'auto',
    },
    appliedButton: {
        backgroundColor: '#E5E7EB',
    },
    applyButtonText: {
        color: '#14171F',
        fontSize: 15,
        fontWeight: '800',
    },
    appliedButtonText: {
        color: '#666666',
    },
    viewAllOffersLink: {
        flexDirection: 'row',
        paddingLeft: 35,
        marginTop: -5,
    },
    paymentSection: {
        marginTop: 24,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000000',
    },
    summaryValue: {
        fontSize: 14,
        color: '#7B8997',
    },
    breakdownToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    breakdownText: {
        fontSize: 14,
        color: '#666666',
        marginRight: 10,
    },
    chevronDown: {
        transform: [{ rotate: '0deg' }],
        color: '#5B6777',
    },
    chevronUp: {
        transform: [{ rotate: '180deg' }],
    },
    breakdownDetails: {
        marginTop: 4,
        rowGap: 3,
    },
    totalLabel: {
        fontSize: 16,
        color: '#000000',
    },
    totalValue: {
        fontSize: 18,
        color: '#000000',
    },
    invoiceSection: {
        marginTop: 24,
    },
    invoiceRow: {
        flexDirection: 'row',
        padding: 16,
        marginTop: 12,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
    },
    userIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userIconText: {
        fontSize: 18,
    },
    invoiceInfo: {
        flex: 1,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '800',
        color: '#14171F',
    },
    phoneNumber: {
        fontSize: 14,
        color: '#7B8997',
    },
    editButton: {
        flexDirection: 'row',
    },
    editButtonText: {
        color: '#004FB6',
        fontSize: 14,
        fontWeight: '700',
    },
    bottomSpacer: {
        height: 80,
    },
    bottomButtonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    paymentButton: {
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dashedLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 12,
    },
    dashDot: {
        width: 12,
        height: 1,
        backgroundColor: '#F5F5F5',
    },
});
