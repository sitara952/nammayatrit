import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Header } from '@/src-v2/primitives/Header';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { Platform, StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import { KaptureRecentChatsUIProps } from './Types';
import { createAction } from '@/typescript/utils/common';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { formatTimeOrRelative } from '@/typescript/utils/time';

export const KaptureRecentChatsUI: React.FC<KaptureRecentChatsUIProps> = ({
    kaptureRecentChats,
    kaptureRecentChatsDispatch,
}) => {
    const config = useConfigContext();
    const userLanguageStrings = config.get('userLanguageStrings');

    return (
        <HardwareBackpressHandler>
            <Animated.View style={{ flex: 1, backgroundColor: colors.neutral200 }}>
                <Header
                    title={`${userLanguageStrings.ClosedTickets}: ${kaptureRecentChats?.length}`}
                    onBackPress={() => {
                        kaptureRecentChatsDispatch(createAction('HANDLE_BACKPRESS', undefined));
                    }}
                />
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {kaptureRecentChats?.map(closedTicket =>
                        closedTicket.issueType === 'kapture' ? (
                            <ListViewItem
                                title={
                                    closedTicket.data.rideId
                                        ? userLanguageStrings.RideRelatedIssue
                                        : userLanguageStrings.AppRelatedIssue
                                }
                                issueText={userLanguageStrings.TicketID + ': ' + closedTicket.data.ticketId}
                                ticketId={closedTicket.data.ticketId}
                                onPress={() =>
                                    kaptureRecentChatsDispatch(
                                        createAction('CHAT_CLICKED', {
                                            rideId: closedTicket.data.rideId,
                                            ticketId: closedTicket.data.ticketId,
                                        }),
                                    )
                                }
                                createdAt={undefined}
                            />
                        ) : (
                            <ListViewItem
                                title={closedTicket.data.category}
                                issueText={
                                    'Issue No.: ' +
                                    (closedTicket.data.issueReportShortId ?? closedTicket.data.issueReportId)
                                }
                                ticketId={closedTicket.data.issueReportShortId ?? closedTicket.data.issueReportId}
                                onPress={() =>
                                    kaptureRecentChatsDispatch(
                                        createAction('NORMAL_CHAT_CLICKED', {
                                            rideId: closedTicket.data.rideId,
                                            issueReportId: closedTicket.data.issueReportId,
                                            categoryId: undefined,
                                        }),
                                    )
                                }
                                createdAt={closedTicket.data.createdAt}
                            />
                        ),
                    )}
                </ScrollView>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const ListViewItem: React.FC<{
    title: string;
    issueText: string;
    ticketId: string;
    onPress: () => void;
    createdAt: string | undefined;
}> = ({ title, issueText, ticketId, onPress, createdAt }) => {
    return (
        <Animated.View style={styles.allTopicsContent} key={ticketId}>
            <View style={styles.topicsContainer}>
                <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.topicsContainer}
                    testID={`active-tickets-${ticketId}`}
                    onPress={onPress}>
                    <View style={styles.topicItem}>
                        <View style={{ flexDirection: 'column', gap: 4 }}>
                            <Typography
                                type="body"
                                style={[styles.topicText, { fontWeight: '700', fontSize: 16 }]}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={title}
                                accessibilityRole={undefined}>
                                {title}
                            </Typography>
                            <Typography
                                type="body"
                                style={[styles.topicText, { color: colors.neutral700 }]}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={issueText}
                                accessibilityRole={undefined}>
                                {issueText}
                            </Typography>
                        </View>
                    </View>
                    {createdAt && (
                        <View>
                            <Typography
                                type="body"
                                style={{ color: colors.neutral700 }}
                                numberOfLines={1}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={issueText}
                                accessibilityRole={undefined}>
                                {formatTimeOrRelative(createdAt)}
                            </Typography>
                        </View>
                    )}
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
        shadowRadius: 5,
        elevation: 3,
        zIndex: 1,
        padding: 16,
        marginBottom: 16,
    },
    topicsContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingLeft: 6,
        width: '100%',
    },
    topicItem: {
        // width: '100%',
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
});
