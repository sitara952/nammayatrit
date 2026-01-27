import { Image, StyleSheet, Dimensions, FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { ScrollView } from 'react-native-gesture-handler';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { CustomCategories, TicketingScreenProps } from './Type';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { createAction } from '@/typescript/utils/common';
import { useCallback, useEffect, useState, useMemo } from 'react';
import { ticketPlace } from '@/readOnly/api/types/TicketPlace.gen';
import { convertUTCToISTAnd12HourFormat } from '@/src-v2/screens/Ticketing/utils/ticketingHelper';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import mtIcMyTickets from '@/typescript/assets/ticketing/mt_ic_my_tickets.webp';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import React from 'react';
import { getTabIcon } from './Flow';
import { useConfigContext } from '@/typescript/context/ConfigContext';

const { width } = Dimensions.get('window');
const CardDetails: React.FC<{ item: ticketPlace }> = React.memo(({ item }) => {
    const price = item.pricingOnwards;
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const priceAndPlatformFee = useMemo(() => {
        if (price && !item.platformFee) {
            return '₹' + price + ' ' + userLanguageStrings.Onwards + '  |  ' + userLanguageStrings.ZeroPlatformfee;
        } else if (item.platformFee && item.platformFee._0?.contents && !price) {
            return `${item.platformFee._0.contents}${item.platformFee.TAG === 'Percentage' ? '%' : ''} ${userLanguageStrings.Platformfee}`;
        } else if (item.platformFee && item.platformFee._0?.contents && price) {
            return `₹${price} ${userLanguageStrings.Onwards}  |  ${item.platformFee._0.contents}${item.platformFee.TAG === 'Percentage' ? '%' : ''} ${userLanguageStrings.Platformfee}`;
        } else {
            return userLanguageStrings.ZeroPlatformfee;
        }
    }, [item.platformFee, price]);

    const dateAndTime = useMemo(() => {
        if (item.isRecurring) {
            const metaData = item.metadata?.find(item => item.key === 'ticketDay');
            return (
                (metaData ? metaData.value + '  ●  ' : '') +
                convertUTCToISTAnd12HourFormat(item.openTimings || '') +
                ' - ' +
                convertUTCToISTAnd12HourFormat(item.closeTimings || '')
            );
        } else {
            return (
                (item.startDate ? item.startDate : userLanguageStrings.StartingSoon) +
                '  ●  ' +
                convertUTCToISTAnd12HourFormat(item.openTimings || '')
            );
        }
    }, [item.startDate, item.openTimings]);

    return (
        <Animated.View style={styles.cardDetails}>
            <Typography
                type="title-800"
                numberOfLines={undefined}
                accessibilityRole={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                style={styles.title}>
                {item.name}
            </Typography>
            {item.status !== 'ComingSoon' ? (
                <>
                    <Typography
                        type="title-800"
                        numberOfLines={undefined}
                        accessibilityRole={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.time}>
                        {priceAndPlatformFee}
                    </Typography>
                    <Typography
                        type="title-800"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessibilityRole={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={[styles.time, { marginTop: -3 }]}>
                        {dateAndTime}
                    </Typography>
                </>
            ) : (
                <Typography
                    type="title-800"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessibilityRole={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.time}>
                    {userLanguageStrings.TicketswillgoliveSoon}
                </Typography>
            )}
        </Animated.View>
    );
});

const TicketCard: React.FC<{ item: ticketPlace; onPress: (id: string) => void }> = React.memo(({ item, onPress }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Pressable
            style={styles.card}
            testID="369cd923-5597-4045-9644-d43da17c7fa6"
            onPress={() => onPress(item.id)}
            accessibilityRole="button"
            accessibilityLabel={`Select ${item.name} ticket button`}>
            <Animated.View style={styles.imageContainer}>
                <Image
                    accessible={true}
                    accessibilityLabel="event image"
                    source={{ uri: item.iconUrl ?? '' }}
                    style={styles.image}
                />
                {item.status === 'ComingSoon' && (
                    <Animated.View style={styles.comingSoonOverlay}>
                        <Typography
                            type="title-800"
                            numberOfLines={undefined}
                            accessibilityRole={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={styles.comingSoonText}>
                            {userLanguageStrings.ComingSoons}
                        </Typography>
                    </Animated.View>
                )}
            </Animated.View>
            <CardDetails item={item} />
        </Pressable>
    );
});

const TicketingScreenUI: React.FC<TicketingScreenProps> = (props: TicketingScreenProps) => {
    const { ticketPlaces, mpDispatch, tabsOptions } = props;
    const [activeTab, setActiveTab] = useState<CustomCategories | undefined>();
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const handleTicketPress = useCallback(
        (id: string) => {
            mpDispatch(createAction('GET_EVENT_DETAIL', { placeId: id }));
        },
        [mpDispatch],
    );

    useEffect(() => {
        mpDispatch(createAction('FILTER_EVENTS', { tag: activeTab }));
    }, [activeTab]);

    return (
        <HardwareBackpressHandler onHardwareBackPress={() => mpDispatch(createAction('PRESSED_BACK', undefined))}>
            <Animated.View style={{ flex: 1 }}>
                <ScrollView
                    style={[styles.screen, { paddingTop: top }]}
                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
                    showsVerticalScrollIndicator={false}>
                    <Animated.View style={styles.header}>
                        <Animated.View style={styles.backButtonContainer}>
                            <TouchableOpacity
                                testID="a5d4c403-cfd5-484e-a2e7-917d40327025"
                                accessible={true}
                                accessibilityHint="Go Back button"
                                accessibilityRole="button"
                                onPress={() => {
                                    mpDispatch(createAction('PRESSED_BACK', undefined));
                                }}>
                                <ChevronLeftIcon />
                            </TouchableOpacity>
                        </Animated.View>
                        <Typography
                            type="title-800"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessibilityRole={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            style={styles.headerTitle}>
                            {userLanguageStrings.YatriTickets}
                        </Typography>
                        <Pressable
                            style={styles.myTicketsButton}
                            testID="bd026520-b26d-42de-bc25-b3beaa31d9f3"
                            onPress={() => {
                                mpDispatch(createAction('GET_TICKETS_HISTORY', undefined));
                            }}
                            accessibilityRole="button"
                            accessibilityLabel="View my tickets button">
                            <Animated.View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image accessible={false} source={mtIcMyTickets} style={{ width: 15, height: 15 }} />
                                <Typography
                                    type="title-800"
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessibilityRole={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    style={styles.myTicketsText}>
                                    {userLanguageStrings.MyTickets}
                                </Typography>
                            </Animated.View>
                        </Pressable>
                    </Animated.View>

                    <Animated.View style={styles.tabs}>
                        <FlatList
                            data={tabsOptions}
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={item => item}
                            renderItem={({ item }) => (
                                <Pressable
                                    onPress={() => (item === activeTab ? setActiveTab(undefined) : setActiveTab(item))}
                                    style={[styles.tab, activeTab === item && styles.activeTab]}
                                    testID="5bc42254-425b-47cb-a2ce-dbdc9ce54c2d"
                                    accessibilityRole="button"
                                    accessibilityLabel={`Filter by ${item} category`}>
                                    <Animated.View style={styles.tabContentRow}>
                                        {!(item === CustomCategories.Other) && (
                                            <Image
                                                accessible={false}
                                                source={getTabIcon(item, activeTab === item)}
                                                style={styles.tabImage}
                                            />
                                        )}
                                        <Typography
                                            type="title-800"
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessibilityRole={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            style={[styles.tabText, activeTab === item && styles.activeTabText]}>
                                            {item}
                                        </Typography>
                                    </Animated.View>
                                </Pressable>
                            )}
                        />
                    </Animated.View>

                    <Animated.View style={[styles.container]}>
                        <Typography
                            type="title-3"
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityRole={undefined}
                            accessibilityLabel={undefined}
                            style={styles.cardTitle}>
                            {(activeTab || '') + ' ' + userLanguageStrings.Events}
                        </Typography>
                        {ticketPlaces?.map(ticket => (
                            <TicketCard key={ticket.id} item={ticket} onPress={handleTicketPress} />
                        ))}
                    </Animated.View>
                </ScrollView>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

export const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#F8F9FB',
        paddingTop: 8,
        paddingHorizontal: 12,
    },
    scrollContent: {
        flexGrow: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    backButtonContainer: {
        marginRight: 12,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: '#14171F',
        flex: 1,
    },
    myTicketsButton: {
        padding: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginLeft: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        width: '35%',
        height: 40,
        borderWidth: 1,
        borderColor: '#E0E3E8',
    },
    myTicketsText: {
        fontWeight: '700',
        fontSize: 14,
        color: '#14171F',
        marginLeft: 8,
    },
    tabs: {
        marginVertical: 24,
    },
    tab: {
        paddingVertical: 8,
        paddingRight: 18,
        paddingLeft: 14,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        borderColor: '#F1F2F7',
        borderWidth: 1,
        marginRight: 10,
    },
    activeTab: {
        backgroundColor: '#2F2D32',
    },
    tabText: {
        fontSize: 16,
        color: '#14171F',
        fontWeight: '700',
    },
    activeTabText: {
        color: '#fff',
    },
    container: {},
    card: {
        marginBottom: 35,
    },
    cardTitle: {
        fontSize: 18,
        color: '#14171F',
        fontWeight: '800',
        marginBottom: 18,
    },
    imageContainer: {
        position: 'relative',
        width: '100%',
        height: 200,
        borderRadius: 16,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
        borderRadius: 16,
        overflow: 'hidden',
    },
    comingSoonOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    comingSoonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: '500',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    cardDetails: {
        paddingTop: 10,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#2F2D32',
    },
    date: {
        fontSize: width * 0.032,
        color: '#7B8997',
        marginBottom: 2,
    },
    time: {
        fontSize: 14,
        color: '#7B8997',
        fontWeight: '600',
    },
    price: {
        fontSize: width * 0.036,
        fontWeight: 'bold',
        alignSelf: 'flex-end',
        marginTop: 4,
    },
    tabContentRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabImage: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
});

export default React.memo(TicketingScreenUI);
