import React, { useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    Platform,
    Keyboard,
    Image,
    NativeModules,
    NativeEventEmitter,
    Dimensions,
} from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import HardwareBackpressHandler from '@/src-v2/components/BackPressHandlerComponent/HardwareBackpressHandler';
import { Header } from '@/src-v2/primitives/Header';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { colors } from 'config-types/src/domain/default/themes/colors';
import { ReportIssueChatUIProps } from './Types';
import { AudioRecorder } from '@/src-v2/components/AudioRecorder';
import VoiceIcon from '@/typescript/components/svg/VoiceIcon';
import { DashCam } from '@/typescript/components/svg/DashCam';
import { SendMessageIcon } from '@/typescript/components/svg/SendMessageIcon';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { AttachmentIcon } from '@/typescript/components/svg/AttachmentIcon';
import { ScrollView } from 'react-native-gesture-handler';
import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectToken } from '@/typescript/state/client/auth';
import RNFS from 'react-native-fs';
import { playAudio, pauseAudio, stopAudio } from '@/src-v2/helpers/audio/AudioModule';
import RenderHtml from 'react-native-render-html';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { strings } from 'config-types';

const contentWidth = Dimensions.get('window').width;

const getMediaAsset = async (url: string, token: string) => {
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            token: token,
        },
    });

    const data = await res.text();
    return data;
};

const getFileNameFromUrl = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1] ?? '';
};

// Component to handle async image loading
const MediaImage = ({
    url,
    token,
    userLanguageStrings,
}: {
    url: string;
    token: string;
    userLanguageStrings: strings;
}) => {
    const [base64Data, setBase64Data] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const isMounted = useRef(false);

    const isRemote = url.startsWith('http://') || url.startsWith('https://');

    React.useEffect(() => {
        isMounted.current = true;

        const loadImage = async () => {
            if (!isRemote) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getMediaAsset(url, token);
                if (isMounted.current) {
                    setBase64Data(data);
                    setLoading(false);
                }
            } catch (error) {
                console.error('Error loading image:', error);
                if (isMounted.current) {
                    setLoading(false);
                }
            }
        };

        loadImage();

        return () => {
            isMounted.current = false;
        };
    }, [url, isRemote]);

    if (loading) {
        return (
            <View
                style={[
                    styles.mediaImage,
                    { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray100 },
                ]}>
                <ActivityIndicator size="small" color={colors.black900} />
            </View>
        );
    }

    if (isRemote && !base64Data) {
        return (
            <View
                style={[
                    styles.mediaImage,
                    { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray100 },
                ]}>
                <Typography
                    type="body"
                    style={{ color: colors.gray500, fontSize: 12 }}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Failed to load image"
                    accessibilityRole="text">
                    {userLanguageStrings.FailedToLoad}
                </Typography>
            </View>
        );
    }

    return (
        <Image
            source={{
                uri: isRemote ? `data:image/jpeg;base64,${base64Data}` : url,
            }}
            style={styles.mediaImage}
            resizeMode={'cover'}
        />
    );
};

// Component to handle async audio loading and playback
const MediaAudio = ({
    url,
    token,
    userLanguageStrings,
}: {
    url: string;
    token: string;
    userLanguageStrings: strings;
}) => {
    const [loading, setLoading] = React.useState(true);
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [error, setError] = React.useState(false);
    const [audioFileName, setAudioFileName] = React.useState<string | null>(null);
    const isMounted = useRef(false);

    const isRemote = url.startsWith('http://') || url.startsWith('https://');

    const name = isRemote
        ? `issue-audio-${Date.now()}${Platform.OS === 'ios' ? '.m4a' : '.mp3'}`
        : getFileNameFromUrl(url);
    const targetFile = `${RNFS.DocumentDirectoryPath}/${name}`;

    React.useEffect(() => {
        isMounted.current = true;

        const prepareAudio = async () => {
            try {
                setLoading(true);

                if (isRemote) {
                    if (await RNFS.exists(targetFile)) {
                        if (isMounted.current) {
                            setAudioFileName(name);
                            setLoading(false);
                        }
                    } else {
                        const data = await getMediaAsset(url, token);
                        if (isMounted.current) {
                            await RNFS.writeFile(targetFile, data, 'base64');
                            setAudioFileName(name);
                            setLoading(false);
                        }
                    }
                } else {
                    if (url.includes(RNFS.DocumentDirectoryPath)) {
                        if (isMounted.current) {
                            setAudioFileName(name);
                            setLoading(false);
                        }
                    } else if (await RNFS.exists(url)) {
                        if (isMounted.current) {
                            if (!(await RNFS.exists(targetFile))) {
                                await RNFS.copyFile(url, targetFile);
                            }
                            setAudioFileName(name);
                            setLoading(false);
                        }
                    } else {
                        console.info('Audio file not found at ' + url);
                        if (isMounted.current) {
                            setError(true);
                            setLoading(false);
                        }
                    }
                }
            } catch (err) {
                console.error('Error preparing audio:', err);
                if (isMounted.current) {
                    setError(true);
                    setLoading(false);
                }
            }
        };

        prepareAudio();

        return () => {
            isMounted.current = false;
            if (isPlaying) {
                stopAudio();
                RNFS.unlink(targetFile).catch(err => console.error('Error deleting audio file:', err));
            }
        };
    }, [url, isRemote]);

    React.useEffect(() => {
        const nativeEmitter = new NativeEventEmitter(NativeModules['AudioModule']);

        const playbackCompleteListener = nativeEmitter.addListener('onPlaybackComplete', () => {
            setIsPlaying(false);
        });

        const playbackStopListener = nativeEmitter.addListener('onPlaybackStop', () => {
            setIsPlaying(false);
        });

        const playbackPauseListener = nativeEmitter.addListener('onPlaybackPause', () => {
            setIsPlaying(false);
        });

        return () => {
            playbackCompleteListener.remove();
            playbackStopListener.remove();
            playbackPauseListener.remove();
        };
    }, []);

    const handlePlayPause = () => {
        if (!audioFileName) return;

        if (isPlaying) {
            pauseAudio();
            setIsPlaying(false);
        } else {
            const playName =
                Platform.OS === 'android' && audioFileName.endsWith('.mp3')
                    ? audioFileName.replace('.mp3', '')
                    : audioFileName;

            playAudio(playName, false);
            setIsPlaying(true);
        }
    };

    if (loading) {
        return (
            <View style={styles.audioPlaceholder}>
                <ActivityIndicator size="small" color={colors.black900} />
                <Typography
                    type="body"
                    style={{ color: colors.black900, fontSize: 10, marginTop: 4 }}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Loading audio"
                    accessibilityRole="text">
                    {userLanguageStrings.Loading}
                </Typography>
            </View>
        );
    }

    if (error || !audioFileName) {
        return (
            <View style={styles.audioPlaceholder}>
                <View style={{ width: 24, height: 24 }}>
                    <VoiceIcon fill={colors.gray500} />
                </View>
                <Typography
                    type="body"
                    style={{ color: colors.gray500, fontSize: 10, marginTop: 4 }}
                    numberOfLines={1}
                    isAnimate={false}
                    accessible={true}
                    accessibilityLabel="Failed to load"
                    accessibilityRole="text">
                    {userLanguageStrings.FailedToLoad}
                </Typography>
            </View>
        );
    }

    return (
        <TouchableOpacity
            testID="media-audio-player"
            style={styles.audioPlaceholder}
            onPress={handlePlayPause}
            accessible={true}
            accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
            accessibilityRole="button">
            <View style={{ width: 24, height: 24 }}>
                <VoiceIcon fill={isPlaying ? colors.blue500 : colors.black900} />
            </View>
            <Typography
                type="body"
                style={{
                    color: isPlaying ? colors.blue500 : colors.black900,
                    fontSize: 10,
                    marginTop: 4,
                }}
                numberOfLines={1}
                isAnimate={false}
                accessible={true}
                accessibilityLabel={isPlaying ? 'Playing' : 'Audio'}
                accessibilityRole="text">
                {isPlaying ? userLanguageStrings.Playing : userLanguageStrings.Audio}
            </Typography>
        </TouchableOpacity>
    );
};

export const ReportIssueChatUI: React.FC<ReportIssueChatUIProps> = ({
    messages,
    options,
    showInput,
    inputText,
    dispatch,
    attachments,
    loading,
    isSubmitted,
    mandatoryUploads,
    attachmentPickerRef,
    audioRecorderRef,
    showStillHaveIssue,
    status,
}) => {
    const { bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const scrollRef = React.useRef<ScrollView>(null);

    const isResolved = status === 'CLOSED' || status === 'NOT_APPLICABLE';

    const token = useAppSelector(selectToken);

    const scrollToBottom = (animated = true) => {
        if (scrollRef.current) {
            scrollRef.current.scrollToEnd({ animated });
        }
    };

    const [showKeyboard, setShowKeyboard] = useState(false);
    const [recordingSessionId, setRecordingSessionId] = useState(`issue-report-${Date.now()}`);

    React.useEffect(() => {
        const keyboardShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setShowKeyboard(true);
                scrollToBottom(true);
            },
        );
        const keyboardHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setShowKeyboard(false);
            },
        );

        const timer = setTimeout(() => scrollToBottom(), 150);

        return () => {
            keyboardShowListener.remove();
            keyboardHideListener.remove();
            clearTimeout(timer);
        };
    }, [messages, options, showInput]);

    const onBackPress = () => dispatch({ type: 'HANDLE_BACKPRESS', payload: undefined });

    return (
        <BottomSheetModalProvider>
            <HardwareBackpressHandler onHardwareBackPress={onBackPress}>
                <View style={styles.container}>
                    <Header title="Report an Issue" onBackPress={onBackPress} />
                    <KeyboardAvoidingView
                        style={{ flex: 1 }}
                        behavior="padding"
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}>
                        <View style={{ flex: 1 }}>
                            {loading && messages.length === 0 ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color={colors.black900} />
                                </View>
                            ) : (
                                <ScrollView
                                    ref={scrollRef}
                                    style={{ flex: 1 }}
                                    contentContainerStyle={[styles.scrollContent, { paddingBottom: bottom }]}
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    keyboardDismissMode="none"
                                    onContentSizeChange={() => scrollToBottom(true)}>
                                    {/* Chat Messages */}
                                    <View style={styles.chatContainer}>
                                        {messages.map(msg => (
                                            <View
                                                key={msg.id}
                                                style={[
                                                    styles.messageWrapper,
                                                    msg.type !== 'IssueMessage'
                                                        ? styles.userMessage
                                                        : styles.systemMessage,
                                                ]}>
                                                <View
                                                    style={[
                                                        styles.messageBubble,
                                                        msg.type !== 'IssueMessage'
                                                            ? styles.userBubble
                                                            : styles.systemBubble,
                                                    ]}>
                                                    {msg.type !== 'IssueMessage' ? ( //Fix this
                                                        <Typography
                                                            style={styles.userMessageText}
                                                            type="body"
                                                            numberOfLines={undefined}
                                                            isAnimate={false}
                                                            accessible={true}
                                                            accessibilityLabel={msg.text}
                                                            accessibilityRole="text">
                                                            {msg.text}
                                                        </Typography>
                                                    ) : (
                                                        <BotMessage text={msg.text} />
                                                    )}
                                                    {msg.mediaFiles && msg.mediaFiles.length > 0 && (
                                                        <View style={styles.mediaContainer}>
                                                            {msg.mediaFiles.map(media => (
                                                                <View key={media.id} style={styles.mediaItem}>
                                                                    {media._type === 'Image' ? (
                                                                        <MediaImage
                                                                            url={media.url}
                                                                            token={token ?? ''}
                                                                            userLanguageStrings={userLanguageStrings}
                                                                        />
                                                                    ) : media._type === 'Audio' ? (
                                                                        <MediaAudio
                                                                            url={media.url}
                                                                            token={token ?? ''}
                                                                            userLanguageStrings={userLanguageStrings}
                                                                        />
                                                                    ) : null}
                                                                </View>
                                                            ))}
                                                        </View>
                                                    )}
                                                </View>
                                                <Typography
                                                    type="body"
                                                    style={styles.timestamp}
                                                    numberOfLines={1}
                                                    isAnimate={false}
                                                    accessible={true}
                                                    accessibilityLabel="Timestamp"
                                                    accessibilityRole="text">
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </Typography>
                                            </View>
                                        ))}
                                        {loading && (
                                            <View style={styles.typingIndicator}>
                                                <View style={styles.typingBubble}>
                                                    <ActivityIndicator size="small" color={colors.gray500} />
                                                    <Typography
                                                        type="body"
                                                        style={styles.typingText}
                                                        numberOfLines={1}
                                                        isAnimate={false}
                                                        accessible={true}
                                                        accessibilityLabel="System typing"
                                                        accessibilityRole="text">
                                                        {userLanguageStrings.Loading}
                                                    </Typography>
                                                </View>
                                            </View>
                                        )}
                                    </View>

                                    {/* Options List - Hide if input is shown or if resolved */}
                                    {options.length > 0 && !showInput && !isResolved && (
                                        <View style={styles.optionsWrapper}>
                                            <View style={styles.optionsContainer}>
                                                {options.map((opt, index) => (
                                                    <View key={opt.issueOptionId}>
                                                        <TouchableOpacity
                                                            testID={`option-item-${opt.issueOptionId}`}
                                                            style={styles.optionItem}
                                                            onPress={() =>
                                                                dispatch({ type: 'OPTION_SELECTED', payload: opt })
                                                            }
                                                            activeOpacity={0.7}
                                                            accessible={true}
                                                            accessibilityLabel={opt.label || opt.option}
                                                            accessibilityRole="button">
                                                            <Typography
                                                                type="body"
                                                                style={styles.optionText}
                                                                numberOfLines={undefined}
                                                                isAnimate={false}
                                                                accessible={true}
                                                                accessibilityLabel={opt.label || opt.option}
                                                                accessibilityRole="button">
                                                                {opt.option || opt.label}
                                                            </Typography>
                                                        </TouchableOpacity>
                                                        {index < options.length - 1 && <View style={styles.divider} />}
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>
                            )}

                            {showInput && !isSubmitted && !isResolved && (
                                <View style={styles.inputSection}>
                                    {/* Attachments Preview Area ... */}
                                    {attachments.length > 0 && (
                                        <View style={styles.attachmentPreviewContainer}>
                                            {attachments.map(attachment => (
                                                <View key={attachment.id} style={styles.attachmentItem}>
                                                    {attachment._type === 'Image' ? (
                                                        <Image
                                                            source={{ uri: attachment.url }}
                                                            style={styles.attachmentImage}
                                                            resizeMode={'cover'}
                                                        />
                                                    ) : (
                                                        <View style={styles.audioPlaceholder}>
                                                            <View style={{ width: 24, height: 24 }}>
                                                                <VoiceIcon fill={colors.black900} />
                                                            </View>
                                                            <Typography
                                                                type="body"
                                                                style={{ fontSize: 10, marginTop: 4 }}
                                                                numberOfLines={1}
                                                                isAnimate={false}
                                                                accessible={true}
                                                                accessibilityLabel="Audio"
                                                                accessibilityRole="text">
                                                                {userLanguageStrings.Audio}
                                                            </Typography>
                                                        </View>
                                                    )}
                                                    <TouchableOpacity
                                                        testID={`remove-attachment-${attachment.id}`}
                                                        onPress={() =>
                                                            dispatch({
                                                                type: 'REMOVE_ATTACHMENT',
                                                                payload: attachment.id,
                                                            })
                                                        }
                                                        style={styles.removeButton}
                                                        accessible={true}
                                                        accessibilityLabel="Remove attachment"
                                                        accessibilityRole="button">
                                                        <Typography
                                                            type="body"
                                                            style={styles.removeButtonText}
                                                            numberOfLines={1}
                                                            isAnimate={false}
                                                            accessible={true}
                                                            accessibilityLabel="Remove"
                                                            accessibilityRole="text">
                                                            ×
                                                        </Typography>
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {/* Text Input Container */}
                                    <View
                                        style={[styles.inputContainer, { paddingBottom: showKeyboard ? 15 : bottom }]}>
                                        <View style={styles.inputWrapper}>
                                            <TextInput
                                                style={styles.textInput}
                                                placeholder="Type a message..."
                                                placeholderTextColor={colors.gray500}
                                                value={inputText}
                                                onChangeText={text => dispatch({ type: 'INPUT_CHANGE', payload: text })}
                                                multiline
                                                accessible={true}
                                                accessibilityLabel="Message input"
                                            />
                                            <TouchableOpacity
                                                testID="attachment-button"
                                                onPress={() => {
                                                    Keyboard.dismiss();
                                                    dispatch({ type: 'ATTACHMENT_PRESS', payload: undefined });
                                                }}
                                                style={styles.iconButton}
                                                accessible={true}
                                                accessibilityLabel="Add attachment"
                                                accessibilityRole="button">
                                                <View style={{ width: 24, height: 24 }}>
                                                    <AttachmentIcon width={24} height={24} color={colors.black900} />
                                                    {mandatoryUploads.length > 0 && (
                                                        <Typography
                                                            type="body"
                                                            style={styles.mandatoryBadge}
                                                            numberOfLines={1}
                                                            isAnimate={false}
                                                            accessible={false}
                                                            accessibilityLabel="*"
                                                            accessibilityRole="text">
                                                            *
                                                        </Typography>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                        {(() => {
                                            const isSendDisabled = mandatoryUploads.some(req => {
                                                const count = attachments.filter(a => a._type === req.fileType).length;
                                                return count === 0;
                                            });

                                            return (
                                                <TouchableOpacity
                                                    testID="send-button"
                                                    onPress={() =>
                                                        !isSendDisabled &&
                                                        dispatch({ type: 'SUBMIT_ISSUE', payload: undefined })
                                                    }
                                                    style={[styles.sendButton, isSendDisabled && { opacity: 0.4 }]}
                                                    disabled={isSendDisabled}
                                                    accessible={true}
                                                    accessibilityLabel="Send message"
                                                    accessibilityRole="button">
                                                    <SendMessageIcon fill={colors.white100} />
                                                </TouchableOpacity>
                                            );
                                        })()}
                                    </View>
                                </View>
                            )}

                            {(isSubmitted || isResolved) && (
                                <View style={[styles.submittedContainer, { paddingBottom: bottom }]}>
                                    <Typography
                                        type="body"
                                        style={styles.submittedText}
                                        numberOfLines={undefined}
                                        isAnimate={false}
                                        accessible={true}
                                        accessibilityLabel="Your issue has been received. Our team is working on it."
                                        accessibilityRole="text">
                                        {isResolved
                                            ? showStillHaveIssue
                                                ? userLanguageStrings.IssueMarkedAsResolved
                                                : userLanguageStrings.IssueResolved
                                            : userLanguageStrings.HoldOnWeAreWorkingOnSolvingYourIssue}
                                    </Typography>
                                    {showStillHaveIssue && (
                                        <TouchableOpacity
                                            testID="still-have-issue-button"
                                            onPress={() =>
                                                dispatch({ type: 'STILL_HAVE_ISSUE_CLICKED', payload: undefined })
                                            }
                                            accessible={true}
                                            accessibilityLabel="Still having issue?"
                                            accessibilityRole="button">
                                            <Typography
                                                type="body"
                                                style={[styles.submittedText, { color: '#0066FF' }]}
                                                numberOfLines={1}
                                                isAnimate={false}
                                                accessible={true}
                                                accessibilityLabel="Still having issue?"
                                                accessibilityRole="text">
                                                {userLanguageStrings.StillHavingIssue}
                                            </Typography>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}

                            {/* Attachment Picker Modal */}
                            <PopUpModal
                                sheetRef={attachmentPickerRef}
                                isScrollable={false}
                                onHardwareBackPress={() =>
                                    dispatch({ type: 'CLOSE_ATTACHMENT_PICKER', payload: undefined })
                                }
                                showBackdrop={true}
                                showHandle={true}
                                backgroundStyle={{ backgroundColor: '#2C2F33' }}>
                                <View style={[styles.attachmentPickerContent, { paddingBottom: bottom }]}>
                                    <Typography
                                        type="body"
                                        style={styles.attachmentPickerTitle}
                                        numberOfLines={1}
                                        isAnimate={false}
                                        accessible={true}
                                        accessibilityLabel="Choose an action"
                                        accessibilityRole="header">
                                        {userLanguageStrings.ChooseAnAction}
                                    </Typography>

                                    <View style={styles.attachmentOptionsRow}>
                                        <TouchableOpacity
                                            testID="photo-button"
                                            style={styles.attachmentOptionItem}
                                            onPress={() => {
                                                dispatch({ type: 'CLOSE_ATTACHMENT_PICKER', payload: undefined });
                                                dispatch({ type: 'PHOTO_OPTIONS_PRESS', payload: undefined });
                                            }}
                                            accessible={true}
                                            accessibilityLabel="Photo"
                                            accessibilityRole="button">
                                            <View style={styles.attachmentIconWrapper}>
                                                <DashCam width={32} height={32} stroke={colors.white100} />
                                                {mandatoryUploads.some(u => u.fileType === 'Image') && (
                                                    <Typography
                                                        type="body"
                                                        style={styles.mandatoryBadge}
                                                        numberOfLines={1}
                                                        isAnimate={false}
                                                        accessible={true}
                                                        accessibilityLabel="Mandatory"
                                                        accessibilityRole="text">
                                                        *
                                                    </Typography>
                                                )}
                                            </View>
                                            <Typography
                                                type="body"
                                                style={styles.attachmentLabel}
                                                numberOfLines={1}
                                                isAnimate={false}
                                                accessible={true}
                                                accessibilityLabel="Photo"
                                                accessibilityRole="text">
                                                {userLanguageStrings.Photo}
                                            </Typography>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            testID="audio-button"
                                            style={styles.attachmentOptionItem}
                                            onPress={() => {
                                                dispatch({ type: 'CLOSE_ATTACHMENT_PICKER', payload: undefined });
                                                dispatch({ type: 'VOICE_PRESS', payload: undefined });
                                            }}
                                            accessible={true}
                                            accessibilityLabel="Audio"
                                            accessibilityRole="button">
                                            <View
                                                style={[
                                                    styles.attachmentIconWrapper,
                                                    { backgroundColor: colors.gray100 },
                                                ]}>
                                                <View style={{ width: 32, height: 32 }}>
                                                    <VoiceIcon fill={colors.black900} />
                                                </View>
                                                {mandatoryUploads.some(u => u.fileType === 'Audio') && (
                                                    <Typography
                                                        type="body"
                                                        style={styles.mandatoryBadge}
                                                        numberOfLines={1}
                                                        isAnimate={false}
                                                        accessible={true}
                                                        accessibilityLabel="Mandatory"
                                                        accessibilityRole="text">
                                                        *
                                                    </Typography>
                                                )}
                                            </View>
                                            <Typography
                                                type="body"
                                                style={styles.attachmentLabel}
                                                numberOfLines={1}
                                                isAnimate={false}
                                                accessible={true}
                                                accessibilityLabel="Audio"
                                                accessibilityRole="text">
                                                {userLanguageStrings.Audio}
                                            </Typography>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </PopUpModal>

                            {/* Audio Recorder Modal */}
                            <PopUpModal
                                sheetRef={audioRecorderRef}
                                isScrollable={false}
                                onHardwareBackPress={() => dispatch({ type: 'CLOSE_RECORDER', payload: undefined })}
                                showBackdrop={true}
                                showHandle={true}>
                                <View style={[styles.audioRecorderContainer, { paddingBottom: bottom }]}>
                                    <AudioRecorder
                                        onRecordingComplete={path => {
                                            dispatch({ type: 'RECORDING_COMPLETE', payload: path });
                                            setRecordingSessionId(`issue-report-${Date.now()}`);
                                        }}
                                        onRecordingStart={() => {}}
                                        onClose={() => dispatch({ type: 'CLOSE_RECORDER', payload: undefined })}
                                        showCloseButton
                                        autoStart
                                        fileName={recordingSessionId}
                                    />
                                </View>
                            </PopUpModal>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            </HardwareBackpressHandler>
        </BottomSheetModalProvider>
    );
};

const BotMessage = ({ text }: { text: string }) => {
    const htmlString = text.replace('{#FARE_ARROW#}', '').replace('{#DISTANCE_ARROW#}', '');

    return <RenderHtml contentWidth={contentWidth} enableCSSInlineProcessing={true} source={{ html: htmlString }} />;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 16,
    },
    chatContainer: {
        marginBottom: 16,
    },
    messageWrapper: {
        marginBottom: 16,
        maxWidth: '80%',
    },
    systemMessage: {
        alignSelf: 'flex-start',
    },
    userMessage: {
        alignSelf: 'flex-end',
    },
    messageBubble: {
        padding: 12,
        borderRadius: 12,
    },
    systemBubble: {
        backgroundColor: colors.gray100,
        borderTopLeftRadius: 0,
    },
    userBubble: {
        backgroundColor: colors.black900,
        borderBottomRightRadius: 0,
    },
    messageText: {
        color: colors.black900,
        lineHeight: 20,
    },
    userMessageText: {
        color: colors.white100,
        lineHeight: 20,
    },
    timestamp: {
        color: colors.gray500,
        fontSize: 10,
        marginTop: 4,
    },
    typingIndicator: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },
    typingBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.gray100,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderTopLeftRadius: 0,
    },
    typingText: {
        marginLeft: 8,
        color: colors.gray500,
        fontSize: 12,
    },
    optionsWrapper: {
        alignItems: 'flex-end',
        width: '100%',
        marginBottom: 16,
    },
    optionsContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.gray200,
        overflow: 'hidden',
        maxWidth: '85%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    optionItem: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        backgroundColor: colors.white,
    },
    optionText: {
        color: colors.black900,
        textAlign: 'right',
    },
    divider: {
        height: 1,
        backgroundColor: colors.gray200,
    },
    inputContainer: {
        paddingHorizontal: 16,
        paddingTop: 12,
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: colors.white,
    },
    inputWrapper: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 12,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 48,
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    textInput: {
        flex: 1,
        fontSize: 16,
        color: colors.black900,
        maxHeight: 100,
        paddingTop: 0,
        paddingBottom: 0,
    },
    inputActions: {
        flexDirection: 'row',
        marginLeft: 8,
    },
    iconButton: {
        padding: 4,
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.black900,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    audioRecorderContainer: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        paddingBottom: 20,
    },
    mediaContainer: {
        marginTop: 8,
    },
    mediaItem: {
        marginBottom: 8,
    },
    mediaImage: {
        width: 200,
        height: 150,
        borderRadius: 8,
        backgroundColor: colors.gray100,
    },
    inputSection: {
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray100,
    },
    attachmentPreviewContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 8,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderColor: colors.gray200,
    },
    attachmentItem: {
        width: 80,
        height: 80,
        borderRadius: 12,
        margin: 4,
        position: 'relative',
        backgroundColor: colors.gray100,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.gray200,
    },
    attachmentImage: {
        width: '100%',
        height: '100%',
    },
    audioPlaceholder: {
        width: 80,
        height: 80,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.gray100,
        borderRadius: 8,
    },
    removeButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    removeButtonText: {
        color: colors.white100,
        fontSize: 16,
        fontWeight: 'bold',
        lineHeight: 18,
    },
    resolvedFooter: {
        paddingHorizontal: 16,
        paddingTop: 12,
        backgroundColor: colors.white,
        alignItems: 'center',
    },
    resolvedBadge: {
        backgroundColor: colors.gray100,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        width: '100%',
        alignItems: 'center',
    },
    resolvedBadgeText: {
        color: colors.gray500,
        fontSize: 14,
        fontWeight: '600',
    },
    attachmentPickerContent: {
        backgroundColor: '#2C2F33',
        paddingTop: 12,
        paddingBottom: 40,
        paddingHorizontal: 24,
    },
    bottomSheetHandle: {
        width: 40,
        height: 4,
        backgroundColor: colors.gray500,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    attachmentPickerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white100,
        marginBottom: 32,
    },
    attachmentOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
    },
    attachmentOptionItem: {
        alignItems: 'center',
        marginRight: 32,
    },
    attachmentIconWrapper: {
        width: 72,
        height: 72,
        borderRadius: 24,
        backgroundColor: '#D11C4D',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        position: 'relative',
    },
    attachmentLabel: {
        color: colors.white100,
        fontSize: 14,
        textAlign: 'center',
    },
    submittedContainer: {
        backgroundColor: colors.gray100,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    submittedText: {
        color: colors.black900,
        textAlign: 'center',
        fontWeight: '500',
    },
    mandatoryBadge: {
        position: 'absolute',
        top: -8,
        right: -8,
        color: 'red',
        fontSize: 18,
        fontWeight: 'bold',
    },
    reopenButton: {
        backgroundColor: colors.yellow100,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 12,
        borderWidth: 1,
        borderColor: colors.yellow500,
    },
    reopenButtonText: {
        color: colors.black900,
        fontWeight: '600',
    },
});
