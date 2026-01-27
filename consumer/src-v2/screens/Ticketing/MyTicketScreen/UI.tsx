import React, { useCallback, useMemo, useState, useRef } from 'react';
import { View, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, FadeIn } from 'react-native-reanimated';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { MyTicketScreenProps, TicketMappedData, TopBarProps } from './Types';
import { TicketBookingStatus_ticketBookingStatus } from '@/readOnly/api/types/Enums.gen';
import { ticketBookingAPIEntityV2Array } from '@/readOnly/api/types/TicketBookingAPIEntityV2Array.gen';
import { transformTicketData } from './Flow';
import ChevronLeftIcon from '@/typescript/components/common/ChevronLeftIcon';
import { useTicketBookingsTicketBookingShortIdDetailsGetMutation } from '@/api/integrations/rtk/TicketBookingsTicketBookingShortIdDetailsGet';
import TicketContent from '../utils/TicketContent';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import collapseIcon from '@/typescript/assets/ticketing/ys_collapse_icon.webp';
import ticketImages from '@/typescript/assets/ticketing/ys_tickets_images.webp';
import { ticketBookingDetails } from '@/readOnly/api/types/TicketBookingDetails.gen';
import { useLazyTicketBookingsV2GetQuery } from '@/api/integrations/rtk/TicketBookingsV2Get';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { createAction } from '@/typescript/utils/common';
import { Svg, Rect, Text } from 'react-native-svg';
import { formatTicketDate, getMappedPlaceTypes } from '../utils/ticketingHelper';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { AnimatedPressable } from '@/typescript/components/FloatingMenu';
import { HapticFeedbackTypes } from 'react-native-haptic-feedback';
import { hapticEffect } from '@/typescript/utils/useHaptic';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { useTicketBookingsTicketBookingShortIdStatusGetMutation } from '@/api/integrations/rtk/TicketBookingsTicketBookingShortIdStatusGet';
import { usePolling } from '@/typescript/hooks/usePolling';
import { FETCH_TICKET_POLLING_INTERVAL } from '@/typescript/constants/common';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

const DashedLine: React.FC = () => {
    return (
        <View style={styles.dashedLineContainer}>
            {Array.from({ length: 20 }).map((_, index) => (
                <View key={index} style={[styles.dashDot, { backgroundColor: '#E0E3E8' }]} />
            ))}
        </View>
    );
};

const StatusBadge: React.FC<{ status: TicketBookingStatus_ticketBookingStatus; visitDate: string }> = ({
    status,
    visitDate,
}) => {
    const today = new Date().toISOString().split('T')[0];
    const getStatusBadgeStyle = useCallback((status: TicketBookingStatus_ticketBookingStatus) => {
        switch (status) {
            case 'Cancelled':
                return '#EA4848';
            case 'Pending':
                return '#F8BC17';
            case 'Booked':
                return (today ? visitDate >= today : true) ? '#2BAD49' : '#016ACD';
            case 'Failed':
                return '#EA4848';
            case 'RefundInitiated':
                return '#2BAD49';
            default:
                return '#016ACD';
        }
    }, []);
    const backgroundColor = getStatusBadgeStyle(status);
    const textWidth = status.length * 10 + 20;

    return (
        <Svg width={textWidth} height={24} viewBox={`0 0 ${textWidth} 28`} fill="none">
            <Rect width={textWidth} height={24} rx={14} fill={backgroundColor} />
            <Text
                x={textWidth / 2}
                y={17}
                fontSize={14}
                fontWeight="700"
                fill={status === 'Pending' ? '#262B30' : '#FFFFFF'}
                textAnchor="middle"
                fontFamily="DepartureMono-Regular">
                {status === 'Booked' && today && today > visitDate ? 'EXPIRED' : status.toUpperCase()}
            </Text>
        </Svg>
    );
};

const useTicketBookingData = () => {
    const [ticketData, setTicketData] = React.useState<TicketMappedData[] | null>(null);
    const [offset, setOffset] = React.useState(0);
    const [hasMore, setHasMore] = React.useState(true);
    const [isLoadingMore, setIsLoadingMore] = React.useState(false);
    const limit = 10;
    const isLoadingRef = React.useRef(false);
    const isResettingRef = React.useRef(false);
    const today = new Date().toISOString().split('T')[0];
    const [triggerTicketBookingList, { data, isSuccess, isFetching }] = useLazyTicketBookingsV2GetQuery();

    const processBookingData = React.useCallback(
        (data: ticketBookingAPIEntityV2Array) => {
            const transformedData = transformTicketData(data);
            setTicketData(prev => {
                if (prev === null) prev = [];
                const combineByPriority = (prevTickets: TicketMappedData[], transformedData: TicketMappedData[]) => {
                    return [
                        ...prevTickets.filter(ticket => {
                            return (today ? today <= ticket.date : true) && ticket.status === 'Booked';
                        }),
                        ...transformedData.filter(ticket => {
                            return (today ? today <= ticket.date : true) && ticket.status === 'Booked';
                        }),
                        ...prevTickets.filter(ticket => {
                            return !((today ? today <= ticket.date : true) && ticket.status === 'Booked');
                        }),
                        ...transformedData.filter(ticket => {
                            return !((today ? today <= ticket.date : true) && ticket.status === 'Booked');
                        }),
                    ];
                };
                const hasMoreData = data.length >= limit;
                setHasMore(hasMoreData);
                return combineByPriority(prev, transformedData);
            });
            setIsLoadingMore(false);
        },
        [today],
    );

    const loadMore = React.useCallback(() => {
        if (!isFetching && hasMore && !isLoadingMore && !isLoadingRef.current) {
            isLoadingRef.current = true;
            setIsLoadingMore(true);
            const newOffset = offset + limit;
            setOffset(newOffset);

            triggerTicketBookingList({
                limit: 10,
                offset: newOffset,
                status: undefined,
            }).finally(() => {
                isLoadingRef.current = false;
            });
        }
    }, [triggerTicketBookingList, offset, isFetching, hasMore, isLoadingMore, isLoadingRef.current]);

    React.useEffect(() => {
        if (isResettingRef.current) {
            return;
        }
        if (isSuccess && data) {
            processBookingData(data);
        }
    }, [isSuccess, data]);

    React.useEffect(() => {
        if (ticketData === null && !isFetching && !isLoadingMore) {
            triggerTicketBookingList({
                limit: 10,
                offset: 0,
                status: undefined,
            });
        }
    }, [triggerTicketBookingList, ticketData, isFetching, isLoadingMore]);

    const reset = React.useCallback(async () => {
        isLoadingRef.current = false;
        setOffset(0);
        setHasMore(true);
        setIsLoadingMore(false);
        setTicketData(null);
        isResettingRef.current = true;
        try {
            const response = await triggerTicketBookingList({
                limit: 10,
                offset: 0,
                status: undefined,
            }).unwrap();
            processBookingData(response);
        } catch (e) {
            console.error('Reset fetch failed', e);
        } finally {
            isResettingRef.current = false;
        }
    }, [triggerTicketBookingList]);

    return {
        ticketData,
        setTicketData,
        hasMore,
        isLoadingMore,
        isFetching,
        loadMore,
        reset,
    };
};

const TicketCard: React.FC<{ ticket: TicketMappedData }> = React.memo(({ ticket }) => {
    return (
        <Animated.View style={styles.ticketCard}>
            <Animated.View style={styles.cardTopSection}>
                <Image
                    accessible={true}
                    accessibilityLabel="ticket image"
                    source={{
                        uri: ticket.iconUrl,
                    }}
                    style={styles.cardImagePlaceholder}
                />
                <Animated.View style={styles.cardVenueInfo}>
                    <Animated.View style={styles.cardVenueTypeBadge}>
                        <Typography
                            type="body-1"
                            accessibilityRole={undefined}
                            style={styles.cardVenueTypeText}
                            numberOfLines={undefined}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel={undefined}>
                            {getMappedPlaceTypes(ticket.placeType || 'Other')}
                        </Typography>
                    </Animated.View>

                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        style={styles.cardVenueName}
                        numberOfLines={2}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={undefined}>
                        {ticket.placeName}
                    </Typography>

                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        style={styles.cardPassengerCount}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={undefined}>
                        {ticket.passengerCategory}
                    </Typography>
                </Animated.View>
                <StatusBadge status={ticket.status} visitDate={ticket.date} />
            </Animated.View>

            <DashedLine />

            <Animated.View style={styles.cardMiddleSection}>
                <Animated.View style={styles.cardDateTimeInfo}>
                    <Typography
                        type="title-800"
                        style={styles.cardDateTimeText}
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={undefined}>
                        {formatTicketDate(ticket.date)}
                    </Typography>
                </Animated.View>

                <Animated.View style={styles.cardPriceInfo}>
                    <Typography
                        type="title-800"
                        accessibilityRole={undefined}
                        style={styles.cardPriceText}
                        numberOfLines={undefined}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel={undefined}>
                        ₹ {ticket.totalPrice}
                    </Typography>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
});

const TicketCardWithDetails: React.FC<{
    item: TicketMappedData;
    onPress: (ticketId: string) => void;
    getCachedTicketDetails: (ticketId: string) => Promise<ticketBookingDetails | null | undefined>;
}> = React.memo(({ item, onPress, getCachedTicketDetails }) => {
    const [ticketDetails, setTicketDetails] = React.useState<ticketBookingDetails | null>(null);
    const [showTicket, setShowTicket] = React.useState(true);
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const translateY = useSharedValue(50);
    const today = new Date().toISOString().split('T')[0];
    const ticketViewCustomAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }, { translateY: translateY.value }],
            opacity: opacity.value,
        };
    });

    const { handlers, animatedStyle } = useScaleAnimation();

    const animateIn = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(1, { duration: 300 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    };

    const animateOut = () => {
        scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
        opacity.value = withTiming(0, { duration: 200 });
        translateY.value = withSpring(50, { damping: 15, stiffness: 150 });
    };

    React.useEffect(() => {
        if ((today ? today <= item.date : true) && item.status === 'Booked') {
            getCachedTicketDetails(item.id).then(response => {
                if (response) {
                    setTicketDetails(response);
                    setShowTicket(true);
                }
            });
        }
    }, [item.id, item.status, getCachedTicketDetails]);

    if (ticketDetails && showTicket) {
        animateIn();
        return (
            <Animated.View style={[{ alignItems: 'center' }, ticketViewCustomAnimatedStyle]}>
                <TouchableOpacity
                    testID="Ticket_View"
                    accessibilityRole="button"
                    accessibilityLabel="View ticket details"
                    onPress={() => {
                        animateOut();
                        setTimeout(() => {
                            setShowTicket(false);
                        }, 200);
                    }}>
                    <Image
                        accessible={false}
                        source={collapseIcon}
                        style={{
                            width: 18,
                            height: 18,
                            marginBottom: 20,
                            marginTop: 10,
                        }}
                    />
                </TouchableOpacity>
                <TicketContent ticketDetails={ticketDetails} />
            </Animated.View>
        );
    }

    return (
        <AnimatedPressable
            style={[animatedStyle]}
            testID="Card_View"
            onPress={() => {
                hapticEffect(HapticFeedbackTypes.selection, undefined);
                if ((today ? today <= item.date : true) && item.status === 'Booked') {
                    setShowTicket(true);
                } else {
                    onPress(item.id);
                }
            }}
            {...handlers}>
            <TicketCard ticket={item} />
        </AnimatedPressable>
    );
});

const TopBar: React.FC<TopBarProps> = ({ icon, title, date, onIconPress }) => {
    return (
        <Animated.View style={styles.topBar}>
            <TouchableOpacity
                testID="901ead7d-af8c-4a17-8e6a-0b0d2c328317"
                accessible={true}
                accessibilityHint="Go Back"
                accessibilityRole="button"
                onPress={onIconPress}
                style={{ marginRight: 16 }}>
                {icon}
            </TouchableOpacity>
            <Animated.View style={styles.eventInfo}>
                <Typography
                    type="body-1"
                    accessibilityRole={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    style={styles.eventTitle}>
                    {title}
                </Typography>
                {date && (
                    <Typography
                        type="title-800"
                        accessibilityRole={undefined}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={styles.eventDate}>
                        {date}
                    </Typography>
                )}
            </Animated.View>
        </Animated.View>
    );
};

const EmptyTicketsView: React.FC = () => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <View style={styles.emptyStateContainer}>
            <Image
                accessible={true}
                accessibilityLabel="ticket images image"
                source={ticketImages}
                style={styles.ticketImage}
                resizeMode="contain"
            />

            <Typography
                type="title-800"
                accessibilityRole={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                style={styles.emptyStateTitle}>
                {userLanguageStrings.NoTicketsYet}
            </Typography>

            <Typography
                type="title-800"
                accessibilityRole={undefined}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                style={styles.emptyStateSubtitle}>
                {userLanguageStrings.OnceYouMakeABookingYourTicketsWillAppearHere}
            </Typography>
        </View>
    );
};

const RenderTicketCard: React.FC<{
    item: TicketMappedData;
    liveTicket: TicketMappedData | null | undefined;
    pastTicket: TicketMappedData | null | undefined;
}> = props => {
    const [fetchTicketDetails] = useTicketBookingsTicketBookingShortIdDetailsGetMutation();
    const [popUpTicketDetails, setPopUpTicketDetails] = React.useState<ticketBookingDetails | null>(null);
    const [ticketCache, setTicketCache] = useState<ticketBookingDetails | null>(null);
    const [enablePolling, setEnablePolling] = useState(false);
    const currentTicketShortIdRef = useRef<string | null>(null);
    const { ticketBookingSheetRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();

    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const getCachedTicketDetails = useCallback(
        async (ticketId: string): Promise<ticketBookingDetails | null | undefined> => {
            if (ticketCache) {
                return ticketCache;
            }
            try {
                const response = await fetchTicketDetails({ ticketBookingShortId: ticketId }).unwrap();
                if (response) {
                    setPopUpTicketDetails(response);
                    setTicketCache(response);
                }
                return response;
            } catch (error) {
                console.error('Error fetching ticket:', error);
                return null;
            }
        },
        [fetchTicketDetails, ticketCache],
    );

    const startTicketPolling = useCallback((ticketShortId: string) => {
        currentTicketShortIdRef.current = ticketShortId;
        setEnablePolling(true);
    }, []);

    usePolling({
        callApiFn: fetchTicketDetails,
        params: { ticketBookingShortId: currentTicketShortIdRef.current || '' },
        pollingInterval: FETCH_TICKET_POLLING_INTERVAL,
        conditionToCall: () => {
            if (!enablePolling || !popUpTicketDetails) {
                return false;
            }
            return popUpTicketDetails.status === 'Pending';
        },
        postApiCall: async (response: ticketBookingDetails) => {
            setPopUpTicketDetails(response);
            setTicketCache(response);
            if (response.status !== 'Pending') {
                setEnablePolling(false);
            }
        },
        postApiCallError: async (error: unknown) => {
            console.error('Error polling ticket details:', error);
        },
        forceRefetchDeps: [popUpTicketDetails?.status, enablePolling],
        cause: 'Ticket Status Polling',
        enable: enablePolling,
    });

    const handleTicketPress = useCallback(
        (ticketId: string) => {
            getCachedTicketDetails(ticketId).then(response => {
                if (response) {
                    ticketBookingSheetRef.current?.present();
                    if (response.status === 'Pending' && response.ticketShortId) {
                        startTicketPolling(response.ticketShortId);
                    }
                }
            });
        },
        [getCachedTicketDetails, startTicketPolling],
    );

    return (
        <>
            {(props.liveTicket?.id === props.item.id || props.pastTicket?.id === props.item.id) && (
                <View style={{ alignItems: 'center', marginTop: 15, marginBottom: 4, width: '100%', flexShrink: 0 }}>
                    <Typography
                        type="body-1"
                        accessibilityRole={undefined}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        style={[
                            { fontSize: 15, color: '#7B8997', fontWeight: '800', flexShrink: 0, textAlign: 'center' },
                        ]}>
                        {props.item.id === props.liveTicket?.id
                            ? userLanguageStrings.CurrentTicket
                            : userLanguageStrings.TicketHistory}
                    </Typography>
                </View>
            )}
            <TicketCardWithDetails
                item={props.item}
                onPress={handleTicketPress}
                getCachedTicketDetails={getCachedTicketDetails}
            />
            <PopUpModal
                sheetRef={ticketBookingSheetRef}
                enableDynamicSizing={false}
                onHardwareBackPress={undefined}
                showBackdrop={undefined}
                snapPoints={['80%']}
                isScrollable={true}
                style={{ marginBottom: bottom }}
                onDismiss={() => {
                    setEnablePolling(false);
                }}>
                <Animated.View style={{ marginHorizontal: 16, marginTop: 8 }}>
                    <TopBar
                        icon={<ChevronLeftIcon />}
                        title={userLanguageStrings.TicketGenerated}
                        date={popUpTicketDetails?.visitDate.replace(/-/g, '/') || ''}
                        onIconPress={() => {
                            setEnablePolling(false);
                            ticketBookingSheetRef.current?.dismiss();
                        }}
                    />
                    <Animated.View style={{ height: 10 }}></Animated.View>
                    <TicketContent ticketDetails={popUpTicketDetails} />
                </Animated.View>
            </PopUpModal>
        </>
    );
};

const MyTicketScreen: React.FC<MyTicketScreenProps> = props => {
    const { ticketData, isFetching, loadMore, isLoadingMore, reset } = useTicketBookingData();
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const today = new Date().toISOString().split('T')[0];
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [fetchTicketStatus] = useTicketBookingsTicketBookingShortIdStatusGetMutation();

    const liveTicket = useMemo(() => {
        return (
            ticketData &&
            ticketData.find(ticket => {
                return (today ? today <= ticket.date : true) && ticket.status === 'Booked';
            })
        );
    }, [ticketData]);
    const pastTicket = useMemo(() => {
        return (
            ticketData &&
            ticketData.find(ticket => {
                return !((today ? today <= ticket.date : true) && ticket.status === 'Booked');
            })
        );
    }, [ticketData]);

    const onRefresh = useCallback(async () => {
        if (!ticketData || ticketData.length === 0) {
            return;
        }
        setIsRefreshing(true);
        try {
            const pendingTickets = ticketData.filter(t => t.status === 'Pending');
            if (pendingTickets.length > 0) {
                await Promise.allSettled(
                    pendingTickets.map(ticket => fetchTicketStatus({ ticketBookingShortId: ticket.ticketShortId })),
                );
            }
            await reset();
        } catch (error) {
            console.error('Error refreshing ticket:', error);
        } finally {
            setIsRefreshing(false);
        }
    }, [ticketData, fetchTicketStatus, reset]);

    const renderContent = () => {
        if (!ticketData) {
            return (
                <Animated.View style={styles.container} entering={FadeIn}>
                    <ActivityIndicator size="large" color={themeColors.Icon_neutralMidHigh} />
                </Animated.View>
            );
        }
        if (ticketData.length === 0) {
            return <EmptyTicketsView />;
        }
        return (
            <FlatList
                data={ticketData}
                style={{ flex: 1 }}
                renderItem={({ item }) => (
                    <RenderTicketCard item={item} liveTicket={liveTicket} pastTicket={pastTicket} />
                )}
                keyExtractor={item => `${item.id}`}
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={true}
                ListFooterComponent={
                    isFetching || isLoadingMore ? (
                        <ActivityIndicator size="large" color={themeColors.Icon_neutralMidHigh} />
                    ) : null
                }
                onRefresh={onRefresh}
                refreshing={isFetching || isRefreshing}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
        );
    };

    return (
        <HardwareBackpressHandler
            onHardwareBackPress={() => {
                props.mpDispatch(createAction('PRESSED_BACK', undefined));
            }}>
            <>
                <Animated.View
                    style={{
                        flex: 1,
                        backgroundColor: '#F8F8F8',
                        paddingTop: top,
                        paddingBottom: bottom,
                        paddingHorizontal: 16,
                        borderWidth: 1,
                        borderColor: 'red',
                    }}>
                    <TopBar
                        icon={<ChevronLeftIcon />}
                        title="My Tickets"
                        date={''}
                        onIconPress={() => {
                            props.mpDispatch(createAction('PRESSED_BACK', undefined));
                        }}
                    />
                    {renderContent()}
                </Animated.View>
            </>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    loadingFooter: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    ticketCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    cardTopSection: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    cardImagePlaceholder: {
        width: 80,
        height: 80,
        marginRight: 12,
        borderRadius: 10,
    },
    cardVenueInfo: {
        flex: 1,
        justifyContent: 'flex-start',
        rowGap: -2,
    },
    cardVenueTypeBadge: {
        backgroundColor: '#A4DBFF80',
        paddingHorizontal: 8,
        paddingBottom: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 3,
    },
    cardVenueTypeText: {
        color: '#14171F',
        fontSize: 11,
    },
    cardVenueName: {
        color: '#14171F',
        fontSize: 15,
        marginTop: 2,
    },
    cardPassengerCount: {
        color: '#5B6777',
        fontSize: 14,
        marginTop: 2,
    },

    cardMiddleSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardDateTimeInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardDateTimeText: {
        color: '#5B6777',
        fontSize: 13,
    },
    cardPriceInfo: {
        alignItems: 'flex-end',
    },
    cardPriceText: {
        color: '#14171F',
        fontSize: 17,
        fontWeight: '600',
    },
    cardBottomSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardRefundIcon: {
        marginRight: 8,
    },
    cardClockIcon: {
        width: 16,
        height: 16,
        backgroundColor: '#FFC107',
        borderRadius: 8,
    },
    cardRefundText: {
        color: '#737373',
        fontSize: 12,
        flex: 1,
    },
    dashedLineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 10,
        paddingTop: 7,
    },
    dashDot: {
        width: 12,
        height: 1,
        backgroundColor: '#E0E3E8',
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    eventInfo: {
        flex: 1,
        alignItems: 'center',
        marginRight: 60,
    },
    eventTitle: {
        fontSize: 16,
        color: '#14171F',
    },
    eventDate: {
        fontSize: 14,
        fontWeight: '600',
        color: '#7B8997',
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
        paddingVertical: 40,
        marginBottom: 50,
    },
    ticketImage: {
        width: 120,
        height: 100,
        marginBottom: 32,
    },
    emptyStateTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#2F2D32',
        marginBottom: 12,
        textAlign: 'center',
    },
    emptyStateSubtitle: {
        fontSize: 16,
        fontWeight: '400',
        color: '#7B8997',
        textAlign: 'center',
        lineHeight: 22,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        marginBottom: 50,
    },
});

export default React.memo(MyTicketScreen);
