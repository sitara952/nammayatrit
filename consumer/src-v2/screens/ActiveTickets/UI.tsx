import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Header } from '@/src-v2/primitives/Header';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { ActiveTicketsUIProps } from './Types';
import { createAction } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { formatTimeOrRelative } from '@/typescript/utils/time';

export const ActiveTicketsUI: React.FC<ActiveTicketsUIProps> = ({ activeTicketsDispatch, activeTickets }) => {
    const config = useConfigContext();
    const userLanguageStrings = config.get('userLanguageStrings');

    return (
        <HardwareBackpressHandler>
            <Animated.View style={{ flex: 1, backgroundColor: colors.neutral200 }}>
                <Header
                    title={`${userLanguageStrings.Active}: ${activeTickets?.length}`}
                    onBackPress={() => {
                        activeTicketsDispatch(createAction('HANDLE_BACKPRESS', undefined));
                    }}
                />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {activeTickets?.map(ticket =>
                        ticket.issueType === 'kapture' ? (
                            <TicketListView
                                ticketId={ticket.data.ticketId}
                                onPress={() =>
                                    activeTicketsDispatch(
                                        createAction('ACTIVE_TICKETS_CLICKED', {
                                            rideId: ticket.data.rideId,
                                            ticketId: ticket.data.ticketId,
                                        }),
                                    )
                                }
                                issueText={
                                    ticket.data.rideId
                                        ? userLanguageStrings.RideRelatedIssue
                                        : userLanguageStrings.AppRelatedIssue
                                }
                                ticketIdText={userLanguageStrings.TicketID + ': ' + ticket.data.ticketId}
                                status={undefined}
                                createdAt={undefined}
                            />
                        ) : (
                            <TicketListView
                                ticketId={ticket.data.issueReportShortId ?? ticket.data.issueReportId}
                                onPress={() => {
                                    activeTicketsDispatch(
                                        createAction('NORMAL_CHAT_CLICKED', {
                                            categoryId: undefined,
                                            rideId: ticket.data.rideId,
                                            issueReportId: ticket.data.issueReportId,
                                        }),
                                    );
                                }}
                                issueText={ticket.data.category}
                                status={ticket.data.status}
                                ticketIdText={
                                    'Issue No.' + ': ' + (ticket.data.issueReportShortId ?? ticket.data.issueReportId)
                                }
                                createdAt={ticket.data.createdAt}
                            />
                        ),
                    )}
                </ScrollView>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const TicketListView: React.FC<{
    ticketId: string;
    onPress: () => void;
    issueText: string;
    ticketIdText: string;
    status: string | undefined;
    createdAt: string | undefined;
}> = ({ ticketId, onPress, issueText, ticketIdText, status, createdAt }) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    return (
        <Animated.View style={styles.allTopicsContent} key={ticketId}>
            <View style={styles.topicsContainer}>
                <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.topicsContainer}
                    testID={`active-ticket-${ticketId}`}
                    onPress={onPress}>
                    <View style={styles.topicItem}>
                        <View style={{ flexDirection: 'column', gap: 4, flex: 1 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Typography
                                    type="body"
                                    style={[styles.topicText, { fontWeight: '700', fontSize: 16 }]}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={issueText}
                                    accessibilityRole={undefined}>
                                    {issueText}
                                </Typography>
                                {createdAt && (
                                    <Typography
                                        type="body"
                                        style={[{ color: colors.neutral700 }]}
                                        numberOfLines={1}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={issueText}
                                        accessibilityRole={undefined}>
                                        {formatTimeOrRelative(createdAt)}
                                    </Typography>
                                )}
                            </View>
                            <View style={{ flexDirection: 'row' }}>
                                <Typography
                                    type="body"
                                    style={[styles.topicText, { color: '#5B6777' }]}
                                    numberOfLines={1}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={ticketIdText}
                                    accessibilityRole={undefined}>
                                    {ticketIdText}
                                </Typography>
                                {status === 'RESOLVED' && (
                                    <View style={styles.updatedBadge}>
                                        <Typography
                                            type="body"
                                            style={styles.updatedBadgeText}
                                            numberOfLines={1}
                                            isAnimate={false}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {userLanguageStrings.Updated}
                                        </Typography>
                                    </View>
                                )}
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 32,
        paddingHorizontal: 16,
        marginTop: 12,
        backgroundColor: colors.neutral200,
    },
    buttonContainer: {
        backgroundColor: '#F1F2F7',
        paddingVertical: 6,
        borderRadius: 30,
        paddingHorizontal: 12,
        marginTop: 2,
    },
    allTopicsContent: {
        backgroundColor: '#fff',
        borderRadius: 24,
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
        zIndex: 1,
        padding: 16,
        marginBottom: 16,
    },
    topicsContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingLeft: 6,
        width: '100%',
    },
    topicItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topicText: {
        flex: 1,
        marginBottom: 4,
    },
    buttonShadow: {
        shadowOffset: { width: 2, height: 2 },
        shadowColor: Platform.OS === 'android' ? '#BDBDBD' : undefined,
        shadowOpacity: 0.08,
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
    },
    updatedBadge: {
        backgroundColor: '#4C6FFF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    updatedBadgeText: {
        color: colors.white100,
        fontSize: 10,
        fontWeight: '700',
    },
});
