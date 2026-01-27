import React, { useRef } from 'react';
import { View, StyleSheet, TextInput, Text, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { TouchableOpacity } from '../../../primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { useBase64AudioPlayer } from '../../../components/PickupInstructionsModal/useBase64AudioPlayer';
import { PlayIcon } from '@/typescript/components/svg/PlayIcon';
import { PauseIcon } from '@/typescript/components/svg/PauseIcon';
import { MicrophoneIcon } from '../../../components/PickupInstructionsModal/MicrophoneIcon';
import { VolumeOn } from '@/typescript/components/svg/VolumeOn';
import LottieView from 'lottie-react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { formatTime, truncatePillText } from '../../../utils/common';
import { AudioRecordingModal } from '../../../components/PickupInstructionsModal/AudioRecordingModal';
import { strings } from 'config-types';
import { newFeatureFlags } from '../../../systems/configs/types';
import { ClosestPickupInstructionResp } from '@/typescript/state/server/pickupInstructionsApi';

interface RidePickupInstructionsUIProps {
    finalClosestInstructionData: ClosestPickupInstructionResp | null | undefined;
    hasSavedInstructions: boolean;
    hasAudio: boolean;
    showNewBadge: boolean;
    isInlineEditing: boolean;
    editingText: string;
    showInlineAudioRecording: boolean;
    audioRecordingProps: {
        existingAudioBase64: string | null | undefined;
        openedFromAudioPill: boolean | undefined;
    };
    newFeatureFlags: newFeatureFlags;
    currentLocationForModal: { lat: number; lon: number } | null;
    isSaveButtonEnabled: boolean;
    canEditPickupInstructions: boolean;
    currentEditCount: number;
    onEditPickupInstructions: () => void;
    onSaveInlineContent: () => void;
    onMicrophonePress: () => void;
    onAudioRecordingClose: () => void;
    onAudioRecordingComplete: (filePath: string) => void;
    onPillPress: (pill: { text: string; hasAudio: boolean | undefined; audioBase64: string | undefined }) => void;
    onEditingTextChange: (text: string) => void;
    onRecorderStateChange?: (state: { hasRecording: boolean; filePath: string | null }) => void;
}

// Standalone Audio Component to prevent recreation
const AudioInstructionsDisplay: React.FC<{
    audioBase64: string;
    onEditPress: () => void;
    userLanguageStrings: strings;
    canEditPickupInstructions: boolean;
    currentEditCount: number;
    newFeatureFlags: newFeatureFlags;
    instructionText: string;
}> = React.memo(({ audioBase64, onEditPress, userLanguageStrings, canEditPickupInstructions, instructionText }) => {
    const animationRef = React.useRef<LottieView | null>(null);

    console.info('🚗 SAM_DEBUG: AudioInstructionsDisplay rendering with audioBase64:', !!audioBase64);
    const { isPlaying, time, playAudio, pauseAudio } = useBase64AudioPlayer(audioBase64);

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    };

    // Control animation based on playing state
    React.useEffect(() => {
        if (animationRef.current) {
            if (isPlaying) {
                animationRef.current.play();
            } else {
                animationRef.current.pause();
            }
        }
    }, [isPlaying]);

    return (
        <View style={styles.savedInstructionsContainer}>
            <View style={styles.audioPlaybackContainer}>
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={handlePlayPause}
                    style={styles.playPauseButton}
                    testID="audio-playback-toggle-main">
                    {isPlaying ? <PauseIcon fill="#000000" /> : <PlayIcon fill="#000000" />}
                </TouchableOpacity>
                <View style={styles.waveformContainer}>
                    {isPlaying ? (
                        <LottieWithFallback
                            style={styles.waveform}
                            lottieRef={animationRef}
                            source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                            autoPlay={false}
                            loop={true}
                            fallback={undefined}
                        />
                    ) : (
                        <Typography
                            type="body-2"
                            style={styles.instructionText}
                            numberOfLines={2}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {instructionText}
                        </Typography>
                    )}
                </View>
                {isPlaying && (
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
                )}
            </View>
            <TouchableOpacity
                accessibilityRole="button"
                onPress={onEditPress}
                style={[styles.editButton, !canEditPickupInstructions && styles.editButtonDisabled]}
                disabled={!canEditPickupInstructions}
                testID="ride-pickup-instructions-edit-button-audio">
                <Typography
                    type="body-2"
                    style={[styles.editButtonText, !canEditPickupInstructions && styles.editButtonTextDisabled]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Edit}
                </Typography>
            </TouchableOpacity>
        </View>
    );
});

// Inline Audio Player Component for audio pills - identical to ConfirmPickup functionality
// Currently unused in this component but keeping for potential future use
const _InlineAudioPlayer: React.FC<{
    audioBase64: string;
    onClose: () => void;
}> = React.memo(({ audioBase64, onClose }) => {
    const animationRef = React.useRef<LottieView | null>(null);
    const { isPlaying, time, playAudio, pauseAudio } = useBase64AudioPlayer(audioBase64);

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    };

    // Control animation based on playing state
    React.useEffect(() => {
        if (animationRef.current) {
            if (isPlaying) {
                animationRef.current.play();
            } else {
                animationRef.current.pause();
            }
        }
    }, [isPlaying]);

    return (
        <View style={styles.inlineAudioPlayerContainer}>
            <View style={styles.audioPlaybackContainer}>
                <TouchableOpacity
                    accessibilityRole="button"
                    onPress={handlePlayPause}
                    style={styles.playPauseButton}
                    testID="inline-audio-playback-toggle">
                    {isPlaying ? <PauseIcon fill="#000000" /> : <PlayIcon fill="#000000" />}
                </TouchableOpacity>
                <View style={styles.waveformContainer}>
                    <LottieWithFallback
                        style={styles.waveform}
                        lottieRef={animationRef}
                        source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                        autoPlay={false}
                        loop={true}
                        fallback={undefined}
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
            <TouchableOpacity
                accessibilityRole="button"
                onPress={onClose}
                style={styles.closeAudioButton}
                testID="close-inline-audio-player">
                <Text style={styles.closeAudioButtonText}>✕</Text>
            </TouchableOpacity>
        </View>
    );
});

export const RidePickupInstructionsUI: React.FC<RidePickupInstructionsUIProps> = ({
    finalClosestInstructionData,
    hasSavedInstructions,
    hasAudio,
    showNewBadge,
    isInlineEditing,
    editingText,
    showInlineAudioRecording,
    audioRecordingProps,
    newFeatureFlags,
    currentLocationForModal,
    isSaveButtonEnabled,
    canEditPickupInstructions,
    currentEditCount,
    onEditPickupInstructions,
    onSaveInlineContent,
    onMicrophonePress,
    onAudioRecordingClose,
    onAudioRecordingComplete,
    onPillPress,
    onEditingTextChange,
    onRecorderStateChange,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const inputRef = useRef<TextInput>(null);

    // Pill options for suggestions - same logic as ConfirmPickup
    const pillOptions = React.useMemo(() => {
        const defaultPills = [
            {
                text: userLanguageStrings.BacksideOf || 'Backside of',
                isFromBackend: false,
                hasAudio: false,
                audioBase64: undefined,
            },
            {
                text: userLanguageStrings.ComeTo || 'Come to',
                isFromBackend: false,
                hasAudio: false,
                audioBase64: undefined,
            },
            {
                text: userLanguageStrings.InfrontOf || 'In front of',
                isFromBackend: false,
                hasAudio: false,
                audioBase64: undefined,
            },
            {
                text: userLanguageStrings.IAmAt || 'I am at',
                isFromBackend: false,
                hasAudio: false,
                audioBase64: undefined,
            },
        ];

        // If we have backend data, show it as first pill
        if (finalClosestInstructionData?.instruction) {
            const backendPill = {
                text: finalClosestInstructionData.instruction,
                isFromBackend: true,
                hasAudio: !!finalClosestInstructionData.audioBase64,
                audioBase64: finalClosestInstructionData.audioBase64 || undefined,
            };

            // Remove one default pill to make room for backend pill
            return [backendPill, ...defaultPills.slice(0, 3)];
        }

        return defaultPills;
    }, [finalClosestInstructionData, userLanguageStrings]);

    // Text-only component for saved instructions - memoized to prevent unnecessary re-renders
    const TextSavedInstructions = React.memo(() => (
        <View style={styles.savedInstructionsContainer}>
            <Typography
                type="body-2"
                style={styles.savedInstructionsText}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {finalClosestInstructionData?.instruction}
            </Typography>
            <TouchableOpacity
                accessibilityRole="button"
                onPress={onEditPickupInstructions}
                style={[styles.editButton, !canEditPickupInstructions && styles.editButtonDisabled]}
                disabled={!canEditPickupInstructions}
                testID="ride-pickup-instructions-edit-text-button">
                <Typography
                    type="body-2"
                    style={[styles.editButtonText, !canEditPickupInstructions && styles.editButtonTextDisabled]}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {userLanguageStrings.Edit}
                </Typography>
            </TouchableOpacity>
        </View>
    ));

    const handlePillPressWithFocus = (pill: {
        text: string;
        hasAudio: boolean | undefined;
        audioBase64: string | undefined;
    }) => {
        onPillPress(pill);
        if (!pill.hasAudio) {
            // Focus input for text pills
            inputRef.current?.focus();
        }
    };

    return (
        <View style={styles.container}>
            {hasSavedInstructions && !isInlineEditing ? (
                <>
                    {/* Header for saved instructions */}
                    <View style={styles.headerContainer}>
                        <Typography
                            type="body-2"
                            style={styles.headerText}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.PickupInstruction}
                        </Typography>
                    </View>

                    {/* Saved instructions display */}
                    {hasAudio ? (
                        <AudioInstructionsDisplay
                            audioBase64={finalClosestInstructionData?.audioBase64 || ''}
                            onEditPress={onEditPickupInstructions}
                            userLanguageStrings={userLanguageStrings}
                            canEditPickupInstructions={canEditPickupInstructions}
                            currentEditCount={currentEditCount}
                            newFeatureFlags={newFeatureFlags}
                            instructionText={finalClosestInstructionData?.instruction || 'Audio Note'}
                        />
                    ) : (
                        <TextSavedInstructions />
                    )}
                </>
            ) : (
                <>
                    {/* Inline Editing Interface - Show directly when no saved instructions */}
                    <View style={styles.inlineEditHeader}>
                        <View style={styles.headerWithBadge}>
                            <Typography
                                type="subhead-1"
                                style={styles.inlineEditHeaderText}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.AddPickupInstructions}
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
                        <TouchableOpacity
                            accessibilityRole="button"
                            onPress={onSaveInlineContent}
                            style={[styles.saveButton, !isSaveButtonEnabled && styles.saveButtonDisabled]}
                            disabled={!isSaveButtonEnabled}
                            testID="inline-save-button">
                            <Typography
                                type="body-2"
                                style={[styles.saveButtonText, !isSaveButtonEnabled && styles.saveButtonTextDisabled]}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.Save}
                            </Typography>
                        </TouchableOpacity>
                    </View>

                    {showInlineAudioRecording ? (
                        <>
                            {/* Inline Audio Recording - identical to ConfirmPickup functionality but inline */}
                            <AudioRecordingModal
                                isVisible={true}
                                onClose={onAudioRecordingClose}
                                onRecordingComplete={onAudioRecordingComplete}
                                headerText={userLanguageStrings.RecordPickupInstructions}
                                existingAudioBase64={audioRecordingProps.existingAudioBase64}
                                openedFromAudioPill={audioRecordingProps.openedFromAudioPill}
                                inline={true}
                                fromRideConfirmed={true}
                                currentLocation={currentLocationForModal}
                                onRecorderStateChange={onRecorderStateChange}
                            />
                        </>
                    ) : (
                        <>
                            {/* Inline Text Input */}
                            <View style={styles.inlineInputContainer}>
                                <TextInput
                                    accessibilityLabel="Text input field"
                                    ref={inputRef}
                                    style={styles.inlineTextInput}
                                    placeholder={`${userLanguageStrings.AddYourNote} (${userLanguageStrings.PleaseEnterCharactersOrLess(newFeatureFlags.pickupInstructionsCharLimit || 60)})`}
                                    placeholderTextColor="#999999"
                                    value={editingText}
                                    onChangeText={onEditingTextChange}
                                    maxLength={newFeatureFlags.pickupInstructionsCharLimit || 60}
                                />
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    onPress={onMicrophonePress}
                                    style={styles.inlineMicButton}
                                    testID="inline-mic-button">
                                    <MicrophoneIcon width={20} height={20} color="#000000" />
                                </TouchableOpacity>
                            </View>

                            {/* Suggestion Pills */}
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                style={styles.pillsScrollView}
                                contentContainerStyle={styles.pillsContent}>
                                {pillOptions.map((pill, index) => (
                                    <TouchableOpacity
                                        accessibilityRole="button"
                                        key={index}
                                        style={styles.suggestionPill}
                                        onPress={() => handlePillPressWithFocus(pill)}
                                        testID={`suggestion-pill-${index}`}>
                                        {pill.hasAudio === true && (
                                            <View
                                                style={{
                                                    width: 16,
                                                    height: 16,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    marginRight: 4,
                                                }}>
                                                <VolumeOn width={14} height={14} />
                                            </View>
                                        )}
                                        <Text style={styles.suggestionPillText}>{truncatePillText(pill.text)}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        marginBottom: 8,
    },
    headerText: {
        color: '#5B6777',
        fontSize: 14,
        fontWeight: '700',
    },
    savedInstructionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    savedInstructionsText: {
        color: '#14171F',
        fontSize: 14,
        fontWeight: '800',
        flex: 1,
        lineHeight: 20,
        marginRight: 8,
    },
    editButton: {
        paddingHorizontal: 4,
        paddingVertical: 2,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 36,
        minWidth: 60,
    },
    editButtonText: {
        color: '#004FB6',
        fontSize: 16,
        fontWeight: '800',
    },
    editButtonDisabled: {
        opacity: 0.5,
    },
    editButtonTextDisabled: {
        color: '#999999',
    },
    addButton: {
        paddingVertical: 0,
        alignItems: 'flex-start',
    },
    addButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#5B6777',
        fontSize: 14,
        fontWeight: '700',
        marginRight: 8,
    },
    newBadge: {
        backgroundColor: '#004FB6',
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    newBadgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
    },
    // Audio playback styles
    audioPlaybackContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    playPauseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F2F7',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 0,
    },
    waveformContainer: {
        flex: 1,
        marginHorizontal: 8,
    },
    waveform: {
        height: 20,
        width: '100%',
    },
    instructionText: {
        color: '#14171F',
        fontSize: 14,
        fontWeight: '600',
        lineHeight: 20,
        flex: 1,
        marginLeft: 5,
        marginTop: 6,
    },
    timerText: {
        color: '#14171F',
        fontSize: 14,
        fontWeight: '600',
        minWidth: 35,
        textAlign: 'right',
    },
    audioAnimation: {
        width: 24,
        height: 24,
        marginRight: 8,
    },
    audioTextContainer: {
        flex: 1,
    },
    audioTimeText: {
        color: '#5B6777',
        fontSize: 12,
        marginTop: 2,
    },
    // Inline editing styles
    inlineEditHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    inlineEditHeaderText: {
        color: '#5B6777',
        fontWeight: '800', // Extrabold
        fontSize: 16, // Increased font size for RideConfirmed
        marginRight: 8, // Small margin between text and badge
    },
    saveButton: {
        marginLeft: 8,
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    saveButtonText: {
        color: '#004FB6',
        fontSize: 14,
        fontWeight: '600',
    },
    saveButtonDisabled: {
        opacity: 0.5,
    },
    saveButtonTextDisabled: {
        color: '#999999',
    },
    // Inline text input styles
    inlineInputContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    inlineTextInput: {
        borderWidth: 1,
        borderColor: '#E0E3E8',
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingRight: 48,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'white',
        color: '#2E2E2E',
    },
    inlineMicButton: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: [{ translateY: -10 }],
        padding: 4,
    },
    // Suggestion pills styles
    pillsScrollView: {
        marginBottom: 16,
    },
    pillsContent: {
        paddingHorizontal: 0,
        flexDirection: 'row',
        flexWrap: 'nowrap',
    },
    suggestionPill: {
        backgroundColor: '#F1F2F7',
        borderColor: '#E0E3E8',
        borderWidth: 1,
        borderRadius: 20,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        flexDirection: 'row',
        alignItems: 'center',
        flexShrink: 0,
        flexGrow: 0,
        alignSelf: 'flex-start',
        width: 'auto',
    },
    suggestionPillText: {
        color: '#454C55',
        fontWeight: Platform.OS === 'ios' ? '400' : '500', // Less bold on iOS
        fontSize: 13,
    },
    // Cancel button
    cancelButton: {
        alignSelf: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    cancelButtonText: {
        color: '#999999',
        fontSize: 14,
        fontWeight: '600',
    },
    // Inline audio player styles
    inlineAudioPlayerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FB',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
    },
    closeAudioButton: {
        marginLeft: 8,
        padding: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeAudioButtonText: {
        fontSize: 16,
        color: '#999999',
        fontWeight: 'bold',
    },
});
