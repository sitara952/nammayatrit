import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, TextInput, Modal, Text, Platform } from 'react-native';
import { TouchableOpacity } from '../../primitives/TouchableOpacity';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { PickupInstructionsModalUIProps, PickupInstructionsPillOption } from './Types';
import { ScrollView } from 'react-native-gesture-handler';
import { colors } from 'config-types/src/domain/default/themes/colors';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { AudioRecordingModal } from './AudioRecordingModal';
import { MicrophoneIcon } from './MicrophoneIcon';
import { VolumeOn } from '../../../src/typescript/components/svg/VolumeOn';
import { Icon } from '../../../src/typescript/components/Icon';
import { useBase64AudioPlayer } from './useBase64AudioPlayer';
import LottieView from 'lottie-react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { formatTime, truncatePillText } from '../../utils/common';
import { PlayIcon } from '../../../src/typescript/components/svg/PlayIcon';
import { PauseIcon } from '../../../src/typescript/components/svg/PauseIcon';
import { useConfigContext } from '../../../src/typescript/context/ConfigContext';
import { ThemeTokens } from 'config-types/src/domain/results/themeTokens';
import CloseIcon from '../../../src/typescript/components/svg/CloseIcon';
import { DeleteIcon } from './DeleteIcon';

// Custom InfoCircleIcon component with white 'i' on colored background
const InfoCircleIcon = ({ fill = colors.neutral700 }) => {
    return (
        <Svg width={16} height={16} viewBox="0 0 16 16">
            <Circle cx="8" cy="8" r="8" fill={fill} />
            <SvgText
                x="8"
                y="11"
                fontSize="12"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
                alignmentBaseline="middle">
                i
            </SvgText>
        </Svg>
    );
};

export const PickupInstructionsModal: React.FC<PickupInstructionsModalUIProps> = ({
    isVisible,
    onClose,
    onAddNote,
    pillOptions,
    headerText = 'Add a note for smooth pickup',
    placeholder = 'Add your note...',
    buttonText = 'Add Note',
    maxLength = 60,
    inline = false,
    savedInstructions = null,
    onRemoveNote,
    showNewBadge = false,
    canEdit = true,
    onAudioRecordingComplete,
    closestInstructionData = null,
    fromConfirmPickup = false,
    currentLocation = null,
    onDeleteInstruction,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const [note, setNote] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [selectedPill, setSelectedPill] = useState<PickupInstructionsPillOption | null>(null);
    const [editingAudioPill, setEditingAudioPill] = useState<PickupInstructionsPillOption | null>(null);
    const [openedFromAudioPill, setOpenedFromAudioPill] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const isExceedingLimit = note.length > maxLength;

    console.info(
        'SAM_DEBUG: PickupInstructionsModal UI rendered with canEdit =',
        canEdit,
        'savedInstructions =',
        savedInstructions,
        'fromConfirmPickup =',
        fromConfirmPickup,
        'inline =',
        inline,
        'currentLocation =',
        currentLocation,
    );

    // Reset state when modal closes
    useEffect(() => {
        if (!isVisible && !inline) {
            setNote('');
            setSelectedPill(null);
        }
    }, [isVisible, inline]);

    // Pre-populate note field with saved instructions when modal opens for editing
    useEffect(() => {
        if (isVisible && !inline && savedInstructions) {
            console.info('SAM_DEBUG: Pre-populating note field with saved instruction:', savedInstructions);
            setNote(savedInstructions);
        }
    }, [isVisible, inline, savedInstructions]);

    useEffect(() => {
        // Focus input and set cursor at the end when a pill is selected
        if (selectedPill && inputRef.current) {
            const pillText = `${selectedPill.text} `;
            setNote(pillText);
            inputRef.current.focus();
        }
    }, [selectedPill]);

    const handleAddNote = () => {
        // Use the current note text which already includes the pill text if selected
        console.info('SAM_DEBUG: PickupInstructionsModal UI - Add Note button pressed:', {
            noteText: note.trim(),
            noteLength: note.trim().length,
            selectedPill: selectedPill?.text,
            isInlineMode: inline,
            canEdit,
        });

        if (note.trim().length > maxLength) {
            return; // Don't allow saving if exceeding character limit
        }

        onAddNote(note.trim());

        if (!inline) {
            onClose();
        } else {
            setNote('');
            setSelectedPill(null);
        }
    };

    const resetModal = () => {
        setNote('');
        setSelectedPill(null);
    };

    const handleClose = () => {
        console.info('SAM_DEBUG: PickupInstructionsModal UI - Modal closed without saving, canEdit =', canEdit);
        resetModal();
        onClose();
    };

    const handlePillPress = (pill: PickupInstructionsPillOption) => {
        console.info('SAM_DEBUG: Pill pressed:', {
            pillId: pill.id,
            pillText: pill.text,
            hasAudio: !!pill.audioBase64,
        });

        if (pill.audioBase64) {
            // Audio pill: Open AudioRecorder with existing audio
            console.info('SAM_DEBUG: Opening AudioRecorder for audio pill');
            setEditingAudioPill(pill);
            setOpenedFromAudioPill(true);
            setIsRecording(true);
        } else {
            // Text pill: Prefill text input (existing behavior)
            console.info('SAM_DEBUG: Prefilling text input for text pill');
            setSelectedPill(pill);
        }
    };

    const handleTextChange = (text: string) => {
        setNote(text);
    };

    const handleAudioRecord = () => {
        setOpenedFromAudioPill(false); // Opened from microphone button, not audio pill
        setEditingAudioPill(null); // Clear any existing audio pill
        setIsRecording(true);
    };

    const handleAudioRecordingCancel = () => {
        setIsRecording(false);
        setOpenedFromAudioPill(false);
        setEditingAudioPill(null);
    };

    const handleAudioRecordingDone = (filePath: string) => {
        setIsRecording(false);
        handleClose();
        if (onAudioRecordingComplete) {
            onAudioRecordingComplete(filePath);
        }
    };

    const handleDeleteInstruction = () => {
        if (onDeleteInstruction) {
            onDeleteInstruction();
            handleClose();
        }
    };

    const isButtonEnabled = note.trim().length > 0 && note.trim().length <= maxLength;
    const styles = createStyles(themeColors);

    const renderPills = () => {
        // console.info('SAM_DEBUG: PickupInstructionsModal UI - Pill:', pillOptions);
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20, marginTop: 10 }}
                contentContainerStyle={{ flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'flex-start' }}>
                {pillOptions.map(pill => (
                    <TouchableOpacity
                        accessibilityRole="button"
                        key={pill.id}
                        style={{
                            backgroundColor: themeColors.PickupInstructions_pill_bg_color,
                            borderColor: themeColors.PickupInstructions_pill_border_color,
                            borderWidth: 1,
                            borderRadius: 20,
                            paddingVertical: 4,
                            paddingHorizontal: 12,
                            marginRight: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            flexShrink: 0,
                            flexGrow: 0,
                            alignSelf: 'flex-start',
                            width: 'auto',
                            maxWidth: '90%',
                        }}
                        onPress={() => handlePillPress(pill)}
                        testID={`pickup-instructions-pill-${pill.id}`}>
                        {pill.audioBase64 && (
                            <View
                                style={{
                                    marginRight: 4,
                                    width: 16,
                                    height: 16,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}>
                                <VolumeOn width={14} height={14} />
                            </View>
                        )}
                        <Text
                            numberOfLines={1}
                            style={{
                                fontFamily: 'Body/800/Typeface',
                                fontWeight: Platform.OS === 'ios' ? '600' : '800', // Less bold on iOS
                                fontStyle: 'normal',
                                fontSize: 14,
                                lineHeight: 16,
                                letterSpacing: 0,
                                textAlign: 'center',
                                paddingVertical: 0,
                                color: themeColors.PickupInstructions_pill_text_color,
                                flexShrink: 1,
                                // maxWidth: '90%',
                            }}>
                            {truncatePillText(pill.text)}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    // Render character limit warning
    const renderCharacterLimitWarning = () => {
        if (isExceedingLimit) {
            return (
                <View style={styles.characterLimitWarning}>
                    <InfoCircleIcon fill={colors.red800} />
                    <Text style={styles.characterLimitWarningText}>
                        {userLanguageStrings.PleaseEnterCharactersOrLess(maxLength)}
                    </Text>
                </View>
            );
        }
        return null;
    };

    const renderInlineHeader = () => (
        <View style={styles.inlineHeaderContainer}>
            <Typography
                type="body-2"
                style={styles.inlineHeaderText}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {headerText}
            </Typography>
            {showNewBadge && (
                <View style={styles.newBadge}>
                    <Typography
                        type="callout"
                        style={styles.newBadgeText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.NEW}
                    </Typography>
                </View>
            )}
        </View>
    );

    const renderSavedInstructions = () => {
        console.info('SAM_DEBUG: PickupInstructionsModal - renderSavedInstructions called with canEdit =', canEdit);

        // Check if we have audio data
        const hasAudio = closestInstructionData?.audioBase64;

        if (hasAudio) {
            return <AudioSavedInstructions />;
        } else {
            return <TextSavedInstructions />;
        }
    };

    // Audio playback component for saved instructions
    const AudioSavedInstructions = () => {
        const animationRef = useRef<LottieView | null>(null);
        const audioBase64 = closestInstructionData?.audioBase64;
        const { isPlaying, time, playAudio, pauseAudio } = useBase64AudioPlayer(audioBase64);

        // Control animation based on playing state
        useEffect(() => {
            if (animationRef.current) {
                if (isPlaying) {
                    animationRef.current.play();
                } else {
                    animationRef.current.pause();
                }
            }
        }, [isPlaying]);

        const handlePlayPause = () => {
            if (isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        };

        return (
            <View style={styles.savedInstructionsPill}>
                <View style={styles.audioPlaybackContainer}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={handlePlayPause}
                        style={styles.playPauseButton}
                        testID="audio-playback-toggle-button">
                        <Icon
                            icon={
                                isPlaying ? (
                                    <PauseIcon fill={themeColors.Modal_title_text_color} />
                                ) : (
                                    <PlayIcon fill={themeColors.Modal_title_text_color} />
                                )
                            }
                            size={16}
                        />
                    </TouchableOpacity>
                    <View style={styles.waveformContainer}>
                        <LottieWithFallback
                            fallback={undefined}
                            style={styles.waveform}
                            lottieRef={animationRef}
                            source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                            autoPlay={false}
                            loop={true}
                        />
                    </View>
                    <Typography
                        type="body-2"
                        style={styles.timerText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {formatTime(time)}
                    </Typography>
                </View>
                {canEdit && onRemoveNote && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={() => {
                            console.info(
                                'SAM_DEBUG: PickupInstructionsModal - Edit button clicked (audio), canEdit =',
                                canEdit,
                            );
                            onRemoveNote();
                        }}
                        style={styles.removeButton}
                        testID="remove-pickup-instructions-audio-button">
                        <Typography
                            type="body-2"
                            style={styles.removeButtonText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Edit}
                        </Typography>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    // Text-only component for saved instructions
    const TextSavedInstructions = () => (
        <View style={styles.savedInstructionsPill}>
            <Typography
                type="body-2"
                style={styles.savedInstructionsText}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {savedInstructions}
            </Typography>
            {canEdit && onRemoveNote && (
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => {
                        console.info(
                            'SAM_DEBUG: PickupInstructionsModal - Edit button clicked (text), canEdit =',
                            canEdit,
                        );
                        onRemoveNote();
                    }}
                    style={styles.removeButton}
                    testID="remove-pickup-instructions-button">
                    <Typography
                        type="body-2"
                        style={styles.removeButtonText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.Edit}
                    </Typography>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderInlineInputWithButton = () => (
        <View style={styles.inlineInputContainer}>
            <TextInput
                accessibilityLabel="Text input field"
                ref={inputRef}
                style={[styles.inlineNoteInputWithButton, isExceedingLimit && styles.errorBorder]}
                placeholder={placeholder}
                placeholderTextColor={themeColors.PickupInstructions_input_placeholder_color}
                value={note}
                onChangeText={handleTextChange}
                multiline={false}
            />
            {renderCharacterLimitWarning()}
            {isButtonEnabled && (
                <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.inlineInputSaveButton}
                    onPress={handleAddNote}
                    testID="save-pickup-instructions-button">
                    <Typography
                        type="callout"
                        style={styles.inlineInputSaveButtonText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {buttonText}
                    </Typography>
                </TouchableOpacity>
            )}
        </View>
    );

    const renderContent = () => (
        <>
            {inline && renderInlineHeader()}

            {savedInstructions && inline ? (
                // Show saved instructions only in inline mode
                renderSavedInstructions()
            ) : (
                <>
                    {!inline && fromConfirmPickup && (
                        // New ConfirmPickup flow header layout
                        <>
                            {/* Elevated X button */}
                            <TouchableOpacity
                                accessibilityRole="button"
                                style={styles.elevatedCloseButton}
                                onPress={handleClose}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                testID="pickup-instructions-elevated-close-button">
                                <CloseIcon color="#FFFFFF" height={24} width={24} />
                            </TouchableOpacity>

                            {/* Header with Edit Note and Delete button */}
                            <View style={styles.confirmPickupHeader}>
                                <Typography
                                    type="body-2"
                                    style={styles.confirmPickupTitle}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    Edit Note
                                </Typography>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    style={styles.deleteButton}
                                    onPress={handleDeleteInstruction}
                                    testID="pickup-instructions-delete-button">
                                    <DeleteIcon width={20} height={20} color={themeColors.Modal_title_text_color} />
                                </TouchableOpacity>
                            </View>
                        </>
                    )}

                    {!inline && !fromConfirmPickup && (
                        // Original header layout for other flows
                        <View style={styles.modalHeader}>
                            <TouchableOpacity
                                accessibilityRole="button"
                                style={styles.closeButton}
                                onPress={handleClose}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                testID="pickup-instructions-close-button">
                                <Text style={styles.closeButtonText}>×</Text>
                            </TouchableOpacity>
                            <Typography
                                type="body-2"
                                style={styles.modalTitle}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {headerText}
                            </Typography>
                        </View>
                    )}

                    {inline ? (
                        renderInlineInputWithButton()
                    ) : (
                        <>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    accessibilityLabel="Text input field"
                                    ref={inputRef}
                                    style={[styles.noteInput, isExceedingLimit && styles.errorBorder]}
                                    placeholder={placeholder}
                                    placeholderTextColor={themeColors.PickupInstructions_input_placeholder_color}
                                    value={note}
                                    onChangeText={handleTextChange}
                                    multiline={true}
                                />
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    onPress={handleAudioRecord}
                                    style={styles.micButton}
                                    testID="pickup-instructions-mic-button">
                                    <MicrophoneIcon width={20} height={20} color={themeColors.Modal_title_text_color} />
                                </TouchableOpacity>
                            </View>
                            {renderCharacterLimitWarning()}
                        </>
                    )}

                    {renderPills()}

                    {!inline && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            style={[styles.addButton, !isButtonEnabled && styles.disabledButton]}
                            onPress={handleAddNote}
                            disabled={!isButtonEnabled}
                            testID="pickup-instructions-add-note-button">
                            <Typography
                                type="callout"
                                style={styles.addButtonText}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {buttonText}
                            </Typography>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </>
    );

    if (inline) {
        return <View style={styles.inlineCard}>{renderContent()}</View>;
    }

    return (
        <>
            <Modal
                animationType="none"
                transparent={true}
                visible={isVisible && !isRecording}
                onRequestClose={handleClose}>
                <View style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(100)}
                        exiting={FadeOut.duration(100)}
                        style={styles.modalContent}>
                        {renderContent()}
                    </Animated.View>
                </View>
            </Modal>

            {/* Audio Recording Modal */}
            <AudioRecordingModal
                isVisible={isRecording}
                onClose={handleAudioRecordingCancel}
                onRecordingComplete={handleAudioRecordingDone}
                headerText="Record pickup instructions"
                existingAudioBase64={editingAudioPill?.audioBase64}
                openedFromAudioPill={openedFromAudioPill}
                fromConfirmPickup={fromConfirmPickup}
                currentLocation={currentLocation}
            />
        </>
    );
};

const createStyles = (themeColors: ThemeTokens) =>
    StyleSheet.create({
        modalOverlay: {
            flex: 1,
            backgroundColor: themeColors.Modal_overlay_color,
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: themeColors.Modal_content_bg_color,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingTop: 24,
            paddingBottom: 20,
        },
        modalHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        closeButton: {
            marginRight: 12,
            width: 24,
            height: 24,
            alignItems: 'center',
            justifyContent: 'center',
        },
        closeButtonText: {
            fontSize: 28,
            lineHeight: 28,
            textAlign: 'center',
            color: themeColors.Modal_title_text_color,
        },
        modalTitle: {
            fontSize: 18,
            fontWeight: '700',
            flex: 1,
        },
        inputContainer: {
            position: 'relative',
            marginBottom: 12,
        },
        noteInput: {
            borderWidth: 1,
            borderColor: themeColors.PickupInstructions_pill_border_color,
            borderRadius: 12,
            paddingHorizontal: 12,
            paddingRight: 48,
            paddingVertical: 16,
            fontSize: 16,
            height: 56,
            textAlignVertical: 'center',
        },
        micButton: {
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: [{ translateY: -14 }],
            padding: 4,
            backgroundColor: 'transparent',
        },
        errorBorder: {
            borderColor: colors.red800,
        },
        editLimitContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 16,
        },
        editLimitText: {
            color: colors.neutral700,
            fontSize: 14,
            fontWeight: '400',
            marginLeft: 8,
        },
        characterLimitWarning: {
            marginTop: 4,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
        },
        characterLimitWarningText: {
            color: colors.red800,
            fontSize: 14,
            fontWeight: '400',
            marginLeft: 8,
        },
        horizontalPillContainer: {
            marginBottom: 16,
            flexGrow: 0,
        },
        horizontalPillContent: {
            paddingHorizontal: 0,
            paddingRight: 16,
            flexGrow: 0,
        },
        pill: {
            backgroundColor: themeColors.PickupInstructions_pill_bg_color,
            borderColor: themeColors.PickupInstructions_pill_border_color,
            borderWidth: 1,
            borderRadius: 20,
            paddingVertical: 6,
            paddingHorizontal: 12,
        },
        pillText: {
            color: themeColors.PickupInstructions_pill_text_color,
            fontWeight: '500',
            fontSize: 13,
        },
        addButton: {
            backgroundColor: themeColors.PickupInstructions_add_button_bg_color,
            borderRadius: 12,
            paddingVertical: 16,
            alignItems: 'center',
            justifyContent: 'center',
        },
        disabledButton: {
            opacity: 0.5,
        },
        addButtonText: {
            color: themeColors.PickupInstructions_add_button_text_color,
            fontWeight: '700',
            fontSize: 16,
        },
        inlineCard: {
            marginTop: 16,
            marginBottom: 16,
            borderRadius: 12,
            padding: 16,
            backgroundColor: themeColors.Modal_content_bg_color,
        },
        inlineHeaderContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
        },
        inlineHeaderText: {
            color: themeColors.PickupInstructions_header_text_color,
            fontSize: 14,
            fontWeight: '700',
            marginRight: 8,
        },
        newBadge: {
            backgroundColor: themeColors.PickupInstructions_badge_bg_color,
            borderRadius: 12,
            paddingHorizontal: 8,
            paddingVertical: 2,
        },
        newBadgeText: {
            color: 'white',
            fontSize: 10,
            fontWeight: '700',
        },
        inlineInputContainer: {
            position: 'relative',
            marginBottom: 16,
        },
        inlineNoteInputWithButton: {
            borderWidth: 1,
            borderColor: themeColors.PickupInstructions_pill_border_color,
            borderRadius: 12,
            padding: 12,
            paddingRight: 80,
            fontSize: 16,
            height: 48,
            color: themeColors.Modal_title_text_color,
            backgroundColor: themeColors.Modal_content_bg_color,
        },
        inlineInputSaveButton: {
            position: 'absolute',
            right: 8,
            top: 8,
            bottom: 8,
            backgroundColor: 'transparent',
            paddingHorizontal: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        inlineInputSaveButtonText: {
            color: themeColors.PickupInstructions_link_text_color,
            fontWeight: '600',
            fontSize: 14,
        },
        savedInstructionsPill: {
            backgroundColor: 'transparent',
            borderWidth: 0,
            paddingVertical: 0,
            paddingHorizontal: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexWrap: 'nowrap',
        },
        savedInstructionsText: {
            color: themeColors.Modal_title_text_color,
            fontSize: 14,
            fontWeight: '800',
            flexShrink: 1,
            lineHeight: 20,
            maxWidth: '85%',
        },
        removeButton: {
            marginLeft: 10,
            paddingHorizontal: 4,
            paddingVertical: 2,
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
        },
        removeButtonText: {
            color: themeColors.PickupInstructions_link_text_color,
            fontSize: 14,
            fontWeight: '800',
            textAlign: 'center',
        },
        pillsContainer: {
            marginBottom: 16,
            flexGrow: 0,
        },
        audioPlaybackContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
            maxWidth: '85%',
        },
        playPauseButton: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: themeColors.PickupInstructions_pill_bg_color,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
        },
        waveformContainer: {
            flex: 1,
            marginHorizontal: 8,
        },
        waveform: {
            height: 20,
            width: '100%',
        },
        timerText: {
            color: themeColors.Modal_title_text_color,
            fontSize: 14,
            fontWeight: '600',
            minWidth: 35,
            textAlign: 'right',
        },
        // New styles for ConfirmPickup flow
        elevatedCloseButton: {
            position: 'absolute',
            top: -60,
            left: '50%',
            marginLeft: -17, // Half of width (54/2) to center
            width: 54,
            height: 48,
            borderRadius: 32,
            backgroundColor: '#000000',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 12,
            paddingRight: 16,
            paddingBottom: 12,
            paddingLeft: 19,
            opacity: 0.97,
            zIndex: 10,
        },
        elevatedCloseButtonText: {
            fontSize: 24,
            lineHeight: 24,
            textAlign: 'center',
            color: '#FFFFFF',
        },
        confirmPickupHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 16,
            marginTop: 8,
        },
        confirmPickupTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: themeColors.Modal_title_text_color,
            lineHeight: 24,
        },
        deleteButton: {
            width: 32,
            height: 32,
            alignItems: 'center',
            justifyContent: 'center',
        },
        deleteButtonText: {
            fontSize: 18,
            color: themeColors.Modal_title_text_color,
        },
    });
