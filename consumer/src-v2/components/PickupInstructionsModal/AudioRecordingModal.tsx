import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Modal, Text } from 'react-native';
import { TouchableOpacity } from '../../primitives/TouchableOpacity';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { AudioRecordingModalProps } from './Types';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { useAudioRecorder } from '../AudioRecorder/useAudioRecorder';
import { useBase64AudioPlayer } from './useBase64AudioPlayer';
import { formatTime } from '../../utils/common';
import { MicrophoneIcon } from './MicrophoneIcon';
import { DeleteIcon } from './DeleteIcon';
import PauseIcon from './PauseIcon';
import { RefreshIcon } from './RefreshIcon';

import { VolumeOn } from '../../../src/typescript/components/svg/VolumeOn';
import { PlayIcon } from '../../../src/typescript/components/svg/PlayIcon';
import { useConfigContext } from '../../../src/typescript/context/ConfigContext';
import CloseIcon from '../../../src/typescript/components/svg/CloseIcon';
import { usePickupInstructionsDeleteMutation } from '../../../src/typescript/state/server/pickupInstructionsApi';
import { useAppSelector } from '../../../src/typescript/state/hooks';
import { selectNewFeatureFlags } from '../../../src/typescript/state/client/session';

export const AudioRecordingModal: React.FC<AudioRecordingModalProps> = ({
    isVisible,
    onClose,
    onRecordingComplete,
    headerText = 'Add a note for smooth pickup',
    existingAudioBase64 = null,
    openedFromAudioPill = false,
    inline = false,
    fromRideConfirmed = false,
    fromConfirmPickup = false,
    currentLocation = null,
    onRecorderStateChange,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);
    const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
    const [isShowingExistingAudio, setIsShowingExistingAudio] = useState(false);
    const animationRef = useRef<LottieView | null>(null);
    const [deletePickupInstructions] = usePickupInstructionsDeleteMutation();

    // Memoize the time limit to avoid linter warnings
    const audioRecordingTimeLimit = React.useMemo(
        () => newFeatureFlags.audioRecordingTimeLimit || 15,
        [newFeatureFlags.audioRecordingTimeLimit],
    );

    const {
        audioState,
        time,
        isRecording,
        isPlaying,
        hasRecording,
        filePath,
        startRecording,
        stopRecording,
        playRecording,
        pausePlayback,
        resetRecording,
    } = useAudioRecorder('pickup-instruction');

    // Base64 audio player for existing audio
    const {
        isPlaying: isPlayingExisting,
        time: existingTime,
        playAudio: playExistingAudio,
        pauseAudio: pauseExistingAudio,
    } = useBase64AudioPlayer(existingAudioBase64);

    // Initialize showing existing audio if provided AND opened from audio pill
    useEffect(() => {
        if (isVisible && existingAudioBase64 && openedFromAudioPill) {
            console.info('🎵 AudioRecordingModal: Opening with existing audio from pill');
            setIsShowingExistingAudio(true);
        } else {
            console.info('🎵 AudioRecordingModal: Opening for new recording from microphone');
            setIsShowingExistingAudio(false);
        }
    }, [isVisible, existingAudioBase64, openedFromAudioPill]);

    // Determine which audio controls to show
    const showExistingAudio = isShowingExistingAudio && existingAudioBase64 && !hasRecording && openedFromAudioPill;
    const currentTime = showExistingAudio ? existingTime : time;
    const currentIsPlaying = showExistingAudio ? isPlayingExisting : isPlaying;

    // Button state logic
    const isReplayEnabled = hasRecording || showExistingAudio;
    // For audio pills (existing audio), always enable delete. For new recordings, enable only if has recording
    const isDeleteEnabled = showExistingAudio || hasRecording;
    const isUpdateNoteEnabled = hasRecording && filePath;

    // Control waveform animation based on audio state
    useEffect(() => {
        if (animationRef.current) {
            if (isRecording || currentIsPlaying) {
                animationRef.current.play();
            } else {
                animationRef.current.pause();
            }
        }
    }, [isRecording, currentIsPlaying]);

    // Update parent with recorder state changes for Save button access (RideConfirmed flow)
    useEffect(() => {
        if (onRecorderStateChange && fromRideConfirmed) {
            console.info('🎵 AudioRecordingModal: Updating parent with recorder state:', {
                hasRecording,
                filePath,
            });
            onRecorderStateChange({
                hasRecording,
                filePath,
            });
        }
    }, [hasRecording, filePath, onRecorderStateChange, fromRideConfirmed]);

    useEffect(() => {
        if (isRecording && time >= audioRecordingTimeLimit) {
            console.info('🎵 AudioRecordingModal: Recording time limit reached, auto-stopping:', {
                currentTime: time,
                limit: audioRecordingTimeLimit,
            });
            stopRecording();
        }
        // eslint-disable-next-line myCustomPlugin/no-hook-dep
    }, [isRecording, time, stopRecording, audioRecordingTimeLimit]);

    const handleRecordToggle = async () => {
        if (openedFromAudioPill && showExistingAudio) {
            // Audio pill mode: Handle existing audio playback
            if (isPlayingExisting) {
                pauseExistingAudio();
            } else {
                playExistingAudio();
            }
        } else if (isRecording) {
            // Recording mode: Stop recording
            stopRecording();
        } else {
            // Recording mode: Start recording
            await startRecording();
        }
    };

    const handleReplay = () => {
        console.info('🔄 AudioRecordingModal: Replay button clicked', {
            hasRecording,
            isPlaying,
            audioState,
            filePath,
            showExistingAudio,
            isPlayingExisting,
        });

        if (hasRecording) {
            // Handle new recording playback
            if (isPlaying) {
                console.info('🔄 AudioRecordingModal: Pausing new recording playback');
                pausePlayback();
            } else {
                console.info('🔄 AudioRecordingModal: Starting new recording playback');
                playRecording();
            }
        } else if (showExistingAudio) {
            // Handle existing audio playback
            if (isPlayingExisting) {
                console.info('🔄 AudioRecordingModal: Pausing existing audio playback');
                pauseExistingAudio();
            } else {
                console.info('🔄 AudioRecordingModal: Starting existing audio playback');
                playExistingAudio();
            }
        } else {
            console.warn('🔄 AudioRecordingModal: No audio available for replay');
        }
    };

    const handleDelete = () => {
        // For existing audio from pills, directly call API delete
        if (showExistingAudio && openedFromAudioPill) {
            handleDeleteAudio();
        } else {
            // For new recordings, show confirmation
            setShowDeleteConfirmation(true);
        }
    };

    const handleDeleteConfirm = () => {
        resetRecording();
        setShowDeleteConfirmation(false);

        // For RideConfirmed flow, also close the audio modal after deleting
        if (fromRideConfirmed) {
            onClose();
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirmation(false);
    };

    const handleUpdateNote = () => {
        if (filePath) {
            handleClose();
            onRecordingComplete(filePath);
        }
    };

    const handleDeleteAudio = async () => {
        try {
            if (!currentLocation) {
                console.error('🚗 No current location available for delete');
                return;
            }

            console.info('🚗 Deleting audio from pickup instruction:', {
                lat: currentLocation.lat,
                lon: currentLocation.lon,
                target: 'Audio',
            });

            await deletePickupInstructions({
                lat: currentLocation.lat,
                lon: currentLocation.lon,
                target: 'Audio',
            }).unwrap();

            console.info('🚗 Successfully deleted audio from pickup instruction');

            // Close the modal after successful deletion
            handleClose();
        } catch (error) {
            console.error('🚗 Error deleting audio from pickup instruction:', error);
        }
    };

    const handleClose = () => {
        // Reset state when closing
        if (audioState) {
            resetRecording();
        }
        onClose();
    };

    const getRecordButtonIcon = () => {
        if (isRecording) {
            // Recording in progress: show pause icon
            return <PauseIcon width={25} height={25} color="#000000" />;
        } else if (openedFromAudioPill && showExistingAudio) {
            // Audio pill mode: show play/pause for existing audio
            if (isPlayingExisting) {
                return <PauseIcon width={25} height={25} color="#000000" />;
            } else {
                return <PlayIcon fill="#000000" width={28} height={28} />;
            }
        } else {
            // Microphone button mode: show microphone icon for recording
            return <MicrophoneIcon width={24} height={24} color="#000000" />;
        }
    };

    // Shared content component that can be rendered inline or in modal
    const AudioRecordingContent = () => (
        <View
            style={
                inline
                    ? fromRideConfirmed
                        ? styles.inlineContentRideConfirmed
                        : styles.inlineContent
                    : styles.modalContent
            }>
            {/* Header - Only show in modal mode, not inline mode */}
            {!inline && fromConfirmPickup && (
                // New ConfirmPickup flow header layout
                <>
                    {/* Elevated X button */}
                    <TouchableOpacity
                        accessibilityRole="button"
                        style={styles.elevatedCloseButton}
                        onPress={handleClose}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        testID="audio-recording-elevated-close-button">
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
                            {userLanguageStrings.EditNote}
                        </Typography>
                        <TouchableOpacity
                            accessibilityRole="button"
                            style={styles.deleteButton}
                            onPress={handleDeleteAudio}
                            testID="audio-recording-delete-button-header">
                            <DeleteIcon width={20} height={20} color="#14171F" />
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {!inline && !fromConfirmPickup && (
                // Original header layout for other flows
                <View style={styles.header}>
                    <Typography
                        type="body-2"
                        style={styles.headerText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {headerText}
                    </Typography>
                    <TouchableOpacity
                        accessibilityRole="button"
                        style={styles.closeButton}
                        onPress={handleClose}
                        testID="audio-recording-close-button">
                        <Text style={styles.closeButtonText}>×</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Audio Waveform and Timer */}
            {fromConfirmPickup && !inline ? (
                // ConfirmPickup flow (only in modal mode)
                <View style={styles.confirmPickupAudioContainer}>
                    <View style={styles.confirmPickupAudioContent}>
                        <View style={styles.confirmPickupVolumeContainer}>
                            <VolumeOn width={24} height={24} />
                        </View>
                        <View style={styles.confirmPickupWaveformSection}>
                            <LottieWithFallback
                                fallback={undefined}
                                style={styles.confirmPickupWaveform}
                                lottieRef={animationRef}
                                source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                                autoPlay={false}
                                loop={true}
                            />
                        </View>
                        <Typography
                            type="body-1"
                            style={styles.confirmPickupTimer}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {formatTime(currentTime)}
                        </Typography>
                    </View>
                </View>
            ) : inline && fromRideConfirmed ? (
                // RideConfirmed flow with dedicated container style
                <View style={styles.rideConfirmedAudioContainer}>
                    <View style={styles.rideConfirmedAudioContent}>
                        <View style={styles.rideConfirmedVolumeContainer}>
                            <VolumeOn width={24} height={24} />
                        </View>
                        <View style={styles.rideConfirmedWaveformSection}>
                            <LottieWithFallback
                                fallback={undefined}
                                style={styles.rideConfirmedWaveform}
                                lottieRef={animationRef}
                                source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                                autoPlay={false}
                                loop={true}
                            />
                        </View>
                        <Typography
                            type="body-1"
                            style={styles.rideConfirmedTimer}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {formatTime(currentTime)}
                        </Typography>
                    </View>
                </View>
            ) : (
                // Original flow or other inline modes
                <View style={inline ? styles.inlineWaveformContainer : styles.waveformContainer}>
                    <VolumeOn />
                    <View style={styles.waveformSection}>
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
                        type="body-1"
                        style={styles.timer}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {formatTime(currentTime)}
                    </Typography>
                </View>
            )}

            {/* Control Buttons */}
            <View
                style={
                    inline
                        ? fromRideConfirmed
                            ? styles.inlineControlsContainerRideConfirmed
                            : styles.inlineControlsContainer
                        : fromConfirmPickup
                          ? styles.confirmPickupControlsContainer
                          : styles.controlsContainer
                }>
                {/* Replay Button */}
                <TouchableOpacity
                    accessibilityRole="button"
                    style={[styles.sideButton, !isReplayEnabled && styles.disabledButton]}
                    onPress={handleReplay}
                    disabled={!isReplayEnabled}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    testID="audio-recording-replay-button">
                    <RefreshIcon width={28} height={28} color={!isReplayEnabled ? '#C0C7D0' : '#454C55'} />
                </TouchableOpacity>

                {/* Record/Play/Pause Button */}
                <TouchableOpacity
                    accessibilityRole="button"
                    style={styles.recordButton}
                    onPress={handleRecordToggle}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    testID="audio-recording-toggle-button">
                    {getRecordButtonIcon()}
                </TouchableOpacity>

                {/* Delete Button */}
                <TouchableOpacity
                    accessibilityRole="button"
                    style={[styles.sideButton, !isDeleteEnabled && styles.disabledButton]}
                    onPress={handleDelete}
                    disabled={!isDeleteEnabled}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    testID="audio-recording-delete-button">
                    <DeleteIcon width={25} height={25} color={!isDeleteEnabled ? '#C0C7D0' : '#454C55'} />
                </TouchableOpacity>
            </View>

            {/* Update Note Button - Only show in modal mode, not inline mode */}
            {!inline && (
                <TouchableOpacity
                    accessibilityRole="button"
                    style={[
                        fromConfirmPickup ? styles.confirmPickupUpdateButton : styles.updateButton,
                        !isUpdateNoteEnabled && styles.disabledButton,
                    ]}
                    onPress={handleUpdateNote}
                    disabled={!isUpdateNoteEnabled}
                    testID="audio-recording-update-note-button">
                    <Typography
                        type="callout"
                        style={fromConfirmPickup ? styles.confirmPickupUpdateButtonText : styles.updateButtonText}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {fromConfirmPickup ? userLanguageStrings.AddNote : userLanguageStrings.UpdateNote}
                    </Typography>
                </TouchableOpacity>
            )}
        </View>
    );

    // Conditional rendering based on inline prop
    if (inline) {
        // Inline mode: render content directly when isVisible is true
        return isVisible ? (
            <>
                <AudioRecordingContent />
                {/* Delete Confirmation Modal still needs to be modal even in inline mode */}
                <DeleteConfirmationModal
                    isVisible={showDeleteConfirmation}
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                />
            </>
        ) : null;
    }

    // Modal mode: render in modal wrapper
    return (
        <>
            <Modal animationType="none" transparent={true} visible={isVisible} onRequestClose={handleClose}>
                <View style={styles.modalOverlay}>
                    <Animated.View
                        entering={FadeIn.duration(100)}
                        exiting={FadeOut.duration(100)}
                        style={styles.modalContent}>
                        <AudioRecordingContent />
                    </Animated.View>
                </View>
            </Modal>

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isVisible={showDeleteConfirmation}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
            />
        </>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 12,
        paddingBottom: 12,
    },
    inlineContent: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    inlineContentRideConfirmed: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 0,
        marginBottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        marginTop: 3,
    },
    headerText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#14171F',
        textAlign: 'left',
        flex: 1,
        marginBottom: 10,
    },
    closeButton: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        lineHeight: 24,
        color: '#14171F',
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E3E8',
        paddingVertical: 10,
        paddingHorizontal: 22,
        marginBottom: 16,
        marginHorizontal: 2,
    },
    inlineWaveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E3E8',
        padding: 4,
        marginBottom: 16,
        marginHorizontal: 8,
    },
    inlineWaveformContainerRideConfirmed: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E3E8',
        paddingVertical: 7, // Increased by 3px (4 + 3)
        paddingHorizontal: 16,
        marginBottom: 8,
        marginHorizontal: 5, // Decreased from 8 to 5
    },
    waveformSection: {
        flex: 1,
        marginHorizontal: 8,
    },
    waveform: {
        height: 30,
        width: '100%',
    },
    timer: {
        fontSize: 16,
        fontWeight: '600',
        color: '#14171F',
        minWidth: 45,
        textAlign: 'right',
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    inlineControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
        paddingHorizontal: 8,
    },
    inlineControlsContainerRideConfirmed: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 0,
        paddingHorizontal: 8,
    },
    controlButton: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F1F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    sideButton: {
        width: 56,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        padding: 8,
    },
    hiddenButton: {
        opacity: 0,
        pointerEvents: 'none',
    },
    recordButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    resetIcon: {
        fontSize: 24,
        color: '#5B6777',
    },
    replayIcon: {
        fontSize: 24,
        color: '#5B6777',
    },
    deleteIcon: {
        fontSize: 20,
        color: '#5B6777',
    },
    disabledIcon: {
        color: '#C0C7D0',
    },
    updateButton: {
        backgroundColor: '#212121',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.5,
    },
    updateButtonText: {
        color: '#E8B10B',
        fontWeight: '700',
        fontSize: 16,
    },
    // New styles for ConfirmPickup flow
    elevatedCloseButton: {
        position: 'absolute',
        top: -80,
        left: '50%',
        marginLeft: -27, // Half of width (54/2) to center
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
        color: '#14171F',
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
        color: '#14171F',
    },
    // New styles for ConfirmPickup audio display
    confirmPickupAudioContainer: {
        paddingVertical: 0,
        marginBottom: 16,
    },
    confirmPickupAudioContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start', // Start from the left
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E3E8',
        paddingVertical: 10,
        paddingHorizontal: 16,
        height: 40,
        overflow: 'hidden', // Prevent children from overflowing
        position: 'relative', // Create positioning context for children
    },
    confirmPickupVolumeContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    confirmPickupWaveformSection: {
        flex: 1,
        height: 24,
        justifyContent: 'center',
        alignSelf: 'center', // Keep vertically centered
        marginRight: 8,
    },
    confirmPickupWaveform: {
        height: 24,
        width: '100%',
    },
    confirmPickupTimer: {
        fontSize: 14,
        fontWeight: '600',
        color: '#14171F',
        minWidth: 45,
        textAlign: 'right',
        alignSelf: 'center', // Keep vertically centered
    },
    confirmPickupControlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    // ConfirmPickup update button styles
    confirmPickupUpdateButton: {
        backgroundColor: '#212121',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmPickupUpdateButtonText: {
        color: '#E8B10B',
        fontWeight: '700',
        fontSize: 16,
    },
    // RideConfirmed audio display styles
    rideConfirmedAudioContainer: {
        paddingVertical: 0,
        marginBottom: 16,
    },
    rideConfirmedAudioContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#F8F8F8',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E3E8',
        paddingVertical: 10,
        paddingHorizontal: 16,
        height: 40,
        overflow: 'hidden',
        position: 'relative',
    },
    rideConfirmedVolumeContainer: {
        width: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rideConfirmedWaveformSection: {
        flex: 1,
        height: 24,
        justifyContent: 'center',
        alignSelf: 'center',
        marginRight: 8,
    },
    rideConfirmedWaveform: {
        height: 24,
        width: '100%',
    },
    rideConfirmedTimer: {
        fontSize: 14,
        fontWeight: '600',
        color: '#14171F',
        minWidth: 45,
        textAlign: 'right',
        alignSelf: 'center',
    },
});
