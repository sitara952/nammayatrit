import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, FlatList } from 'react-native';
import Animated from 'react-native-reanimated';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Header } from '@/src-v2/primitives/Header';
import dayjs from 'dayjs';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { fileAttachment } from '@/readOnly/api/types/FileAttachment.gen';
import Video from 'react-native-video';
import { RecentChatDetailUIProps } from './Types';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectUserName } from '@/typescript/state/client/user';
import { safeOpenUrl } from '@/src-v2/utils/common';

const isImage = (mime: string) => mime.startsWith('image/');
const isVideo = (mime: string) => mime.startsWith('video/');
const isPdf = (mime: string) => mime === 'application/pdf';

enum ChatBotSender {
    ExternalBot = 'External Bot',
    NammaYatri = 'Namma Yatri',
    System = '',
}

const ChatBubble: React.FC<{ isAttachment: boolean; isSender: boolean; children: React.ReactNode }> = ({
    isAttachment,
    isSender,
    children,
}) => (
    <View style={[styles.bubble, isSender ? styles.bubbleSender : styles.bubbleBot, isAttachment && { padding: 6 }]}>
        {children}
    </View>
);

const FileAttachmentView: React.FC<{ file: fileAttachment }> = ({ file }) => {
    if (isImage(file.mime)) {
        return (
            <View style={{ alignItems: 'center' }} accessibilityLabel="Image Attachment">
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="image-attachment"
                    onPress={() => safeOpenUrl(file.url)}>
                    <Image
                        accessible={true}
                        accessibilityLabel="image attachment"
                        source={{ uri: file.url }}
                        style={styles.attachmentImage}
                        resizeMode="cover"
                    />
                </TouchableOpacity>
                {file.message ? <Text style={styles.attachmentMessage}>{file.message}</Text> : null}
            </View>
        );
    }
    if (isVideo(file.mime)) {
        // Show a video preview using react-native-video, muted, paused, controls hidden
        return (
            <View style={{ alignItems: 'center', borderRadius: 12 }} accessibilityLabel="Video Attachment">
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="video-attachment"
                    onPress={() => safeOpenUrl(file.url)}>
                    <Video
                        source={{ uri: file.url }}
                        style={[styles.attachmentImage]}
                        paused={true}
                        muted={true}
                        controls={false}
                        resizeMode="cover"
                        repeat={false}
                    />
                    <View style={styles.videoOverlayIcon}>
                        <Text style={styles.playIcon}>▶</Text>
                    </View>
                </TouchableOpacity>
                {file.message ? <Text style={styles.attachmentMessage}>{file.message}</Text> : null}
            </View>
        );
    }
    if (isPdf(file.mime)) {
        return (
            <View style={{ alignItems: 'center' }} accessibilityLabel="PDF Attachment">
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="pdf-attachment"
                    onPress={() => safeOpenUrl(file.url)}
                    style={styles.attachmentFile}>
                    <Text style={styles.attachmentFileText} accessibilityLabel="View PDF">
                        View PDF
                    </Text>
                </TouchableOpacity>
                {file.message ? <Text style={styles.attachmentMessage}>{file.message}</Text> : null}
            </View>
        );
    }
    return (
        <View style={{ alignItems: 'center' }}>
            <TouchableOpacity
                accessibilityRole="button"
                testID="file-attachment"
                onPress={() => safeOpenUrl(file.url)}
                style={styles.attachmentFile}>
                <Text style={styles.attachmentFileText} accessibilityLabel="Download file">
                    Download file
                </Text>
            </TouchableOpacity>
            {file.message ? <Text style={styles.attachmentMessage}>{file.message}</Text> : null}
        </View>
    );
};

// Helper to group bot/system senders
const getSenderGroup = (senderName: string) => {
    if (
        senderName === ChatBotSender.ExternalBot ||
        senderName === ChatBotSender.NammaYatri ||
        senderName === ChatBotSender.System
    ) {
        return 'bot';
    }
    return senderName;
};

export const RecentChatDetailUI: React.FC<RecentChatDetailUIProps> = ({
    rideId,
    ticketId,
    chatMessages,
    navigation,
}) => {
    const { bottom } = useSafeAreaInsets();
    const config = useConfigContext();
    const userLanguageStrings = config.get('userLanguageStrings');
    const userName = useAppSelector(selectUserName);

    // Flatten chatMessages so each file in FileAttachments is its own message
    const flatMessages = chatMessages
        .filter(msg => {
            const { TAG, _0 } = msg.chatMessage;
            if (TAG === 'TextMessage') {
                const content = String(_0.contents).trim();
                return content !== '' && content !== 'null' && content !== 'INIT_CONVERSATION';
            }
            if (TAG === 'FileAttachments') {
                return Array.isArray(_0.contents) && _0.contents.length > 0;
            }
            return true;
        })
        .flatMap(msg => {
            const { TAG, _0 } = msg.chatMessage;
            if (TAG === 'FileAttachments' && Array.isArray(_0.contents ?? [])) {
                return (_0.contents ?? []).map(file => ({ ...msg, file }));
            }
            return [msg];
        });

    // Render item function for FlatList
    const renderItem = useCallback(
        ({ item: msg, index: idx }: { item: (typeof chatMessages)[number]; index: number }) => {
            // If current user is the sender, it's a user message (right side)
            // Check if all parts of the user's name are present in senderName (case-insensitive)
            const isSender = Boolean(
                userName &&
                    msg.senderName &&
                    userName.split(' ').some(namePart => msg.senderName.toLowerCase().includes(namePart.toLowerCase())),
            );
            const { TAG, _0 } = msg.chatMessage;
            const file = TAG === 'FileAttachments' ? _0?.contents?.[0] : null;
            // Show time if next message is from a different sender group or it's the last message
            const nextMsg = flatMessages[idx + 1];
            const showTime = !nextMsg || getSenderGroup(nextMsg.senderName) !== getSenderGroup(msg.senderName);

            if (TAG === 'TextMessage') {
                return (
                    <Animated.View
                        style={{
                            flexDirection: 'column',
                            alignItems: isSender ? 'flex-end' : 'flex-start',
                            marginBottom: 2,
                        }}>
                        <ChatBubble isAttachment={false} isSender={isSender}>
                            <Text style={styles.bubbleText}>{_0.contents ?? ''}</Text>
                        </ChatBubble>
                        {showTime && (
                            <Text style={[styles.timeText, { alignSelf: isSender ? 'flex-end' : 'flex-start' }]}>
                                {dayjs(msg.sentDate).format('h:mm A')}
                            </Text>
                        )}
                    </Animated.View>
                );
            }
            if (TAG === 'FileAttachments' && file) {
                return (
                    <Animated.View
                        style={{
                            flexDirection: 'column',
                            alignItems: isSender ? 'flex-end' : 'flex-start',
                            marginBottom: 2,
                        }}>
                        <ChatBubble isAttachment={true} isSender={isSender}>
                            <FileAttachmentView file={file} />
                        </ChatBubble>
                        {showTime && (
                            <Text style={[styles.timeText, { alignSelf: isSender ? 'flex-end' : 'flex-start' }]}>
                                {dayjs(msg.sentDate).format('h:mm A')}
                            </Text>
                        )}
                    </Animated.View>
                );
            }
            return null;
        },
        [userName, flatMessages],
    );

    return (
        <HardwareBackpressHandler>
            <Animated.View style={[{ flex: 1, backgroundColor: colors.neutral100 }]}>
                <Header
                    title={`${rideId ? userLanguageStrings.RideRelatedIssue : userLanguageStrings.AppRelatedIssue} `}
                    onBackPress={() => navigation.goBack()}
                    style={{ backgroundColor: colors.neutral200 }}
                />
                <Animated.View style={{ backgroundColor: colors.white350 }}>
                    {ticketId && (
                        <Typography
                            type="body"
                            style={{ paddingHorizontal: 16, paddingBottom: 8, color: colors.neutral700 }}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={`Ticket ID: ${ticketId}`}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.TicketID + ': ' + ticketId}
                        </Typography>
                    )}
                </Animated.View>
                <FlatList
                    data={flatMessages}
                    keyExtractor={(item, idx) => item.sentDate + '-' + idx}
                    contentContainerStyle={[styles.container, { paddingBottom: bottom }]}
                    initialNumToRender={10}
                    windowSize={10}
                    removeClippedSubviews={true}
                    maxToRenderPerBatch={5}
                    renderItem={renderItem}
                />
                <Animated.View style={{ backgroundColor: colors.neutral200 }}>
                    <Typography
                        type="body"
                        style={styles.topicText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={`This issue has been closed. If you have any other issues, please create a new ticket.`}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ThisIssueHasBeenClosedIfYouHaveAnyOtherIssues}
                    </Typography>
                </Animated.View>
            </Animated.View>
        </HardwareBackpressHandler>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    bubble: {
        borderRadius: 16,
        maxWidth: '80%',
        padding: 12,
        marginBottom: 4,
    },
    bubbleBot: {
        backgroundColor: colors.beige100,
        alignSelf: 'flex-start',
    },
    bubbleSender: {
        backgroundColor: colors.neutral450,
        alignSelf: 'flex-end',
    },
    bubbleText: {
        fontSize: 15,
        color: colors.neutral900,
    },
    timeText: {
        fontSize: 11,
        color: colors.neutral700,
        marginTop: 2,
        marginLeft: 8,
        marginRight: 8,
        alignSelf: 'flex-end',
    },
    attachmentImage: {
        width: 180,
        height: 120,
        borderRadius: 12,
    },
    attachmentFile: {
        marginTop: 4,
        padding: 8,
        backgroundColor: colors.neutral350,
        borderRadius: 12,
        alignItems: 'center',
    },
    attachmentFileText: {
        color: colors.blue200,
        textDecorationLine: 'underline',
    },
    attachmentMessage: {
        fontSize: 13,
        color: colors.gray200,
        marginTop: 8,
        textAlign: 'center',
    },
    videoOverlayIcon: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
    },
    playIcon: {
        fontSize: 40,
        color: 'white',
    },
    pdfPreviewBox: {
        width: 80,
        height: 100,
        borderRadius: 8,
        marginTop: 4,
        backgroundColor: colors.neutral350,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.neutral400,
    },
    pdfIcon: {
        fontSize: 40,
        marginBottom: 4,
    },
    pdfLabel: {
        fontSize: 14,
        color: colors.neutral900,
    },
    topicText: {
        fontSize: 14,
        padding: 16,
        color: colors.gray150,
        textAlign: 'center',
    },
});
