import React, { useRef } from 'react';
import Animated from 'react-native-reanimated';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { tailwind } from '../../tailwind-theme/tailwind';
import Typography from '../../../src/typescript/designSystem/components/primitives/Typography';
import { Icon } from '../../../src/typescript/components/Icon';
import CloseIcon from '../../../src/typescript/components/svg/CloseIcon';
import { PauseIcon } from '../../../src/typescript/components/svg/PauseIcon';
import { PlayIcon } from '../../../src/typescript/components/svg/PlayIcon';
import { MicrophoneUnfilled } from '../../../src/typescript/components/svg/MicrophoneUnfilled';
import { Pressable } from '../../primitives/Pressable';
import { TouchableOpacity } from '../../primitives/TouchableOpacity';
import { useConfigContext } from '../../../src/typescript/context/ConfigContext';
import { formatTime } from '../../utils/common';
import { useAudioRecorder } from './useAudioRecorder';
import { AudioRecorderProps } from './Types';

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
    fileName = 'pickup-instruction',
    onRecordingComplete,
    onRecordingStart,
    onRecordingStop,
    onPlaybackStart,
    onPlaybackStop,
    showTimer = true,
    showCloseButton = false,
    onClose,
    autoStart = false,
    headerText,
    compactMode = false,
}) => {
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const themeColors = configManager.get('themeColors');
    const animationRef = useRef<LottieView | null>(null);

    const { audioState, time, isRecording, hasRecording, filePath, startRecording, handleRecorder, resetRecording } =
        useAudioRecorder(fileName);

    // Handle auto start - moved to external control
    React.useEffect(() => {
        if (autoStart && !audioState && onRecordingStart) {
            onRecordingStart(); // Let parent handle the auto start logic
            startRecording();
        }
    }, [autoStart, audioState, startRecording, onRecordingStart]);

    // Handle callbacks
    React.useEffect(() => {
        if (audioState === 'Recording' && onRecordingStart) {
            onRecordingStart();
        } else if (audioState === 'Recorded' && onRecordingStop) {
            onRecordingStop();
            if (onRecordingComplete && filePath) {
                onRecordingComplete(filePath);
            }
        } else if (audioState === 'Playing' && onPlaybackStart) {
            onPlaybackStart();
        } else if ((audioState === 'Stopped' || audioState === 'Paused') && onPlaybackStop) {
            onPlaybackStop();
        }
    }, [audioState, filePath, onRecordingStart, onRecordingStop, onRecordingComplete, onPlaybackStart, onPlaybackStop]);

    const playIcon = <PlayIcon fill={undefined} />;
    const pauseIcon = <PauseIcon fill={undefined} />;

    const getControlIcon = () => {
        if (
            audioState === 'Paused' ||
            audioState === 'Stopped' ||
            audioState === 'Recorded' ||
            audioState === undefined
        ) {
            return playIcon;
        }
        return pauseIcon;
    };

    if (compactMode) {
        return (
            <Animated.View
                style={tailwind.style(
                    `flex-row items-center gap-[8px] p-[8px] bg-[${themeColors.AudioRecorder_bg_color}] rounded-[8px]`,
                )}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        audioState === 'Paused' ||
                        audioState === 'Stopped' ||
                        audioState === 'Recorded' ||
                        audioState === undefined
                            ? 'Play audio button'
                            : 'Pause audio button'
                    }
                    testID="audio-recorder-toggle"
                    onPress={handleRecorder}>
                    <Icon icon={getControlIcon()} size={16} />
                </Pressable>

                {isRecording && (
                    <LottieWithFallback
                        fallback={undefined}
                        style={tailwind.style('w-[20px] h-[16px]')}
                        lottieRef={animationRef}
                        source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                        autoPlay={isRecording}
                        loop={true}
                    />
                )}

                {showTimer && (
                    <Typography
                        type="body-subtext"
                        style={tailwind.style(`text-[${themeColors.AudioRecorder_timer_text_color}]`)}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {formatTime(time)}
                    </Typography>
                )}

                {hasRecording && !isRecording && (
                    <TouchableOpacity
                        accessibilityRole="button"
                        onPress={resetRecording}
                        testID="audio-recorder-reset-compact">
                        <Typography
                            type="body-subtext"
                            style={tailwind.style(`text-[${themeColors.AudioRecorder_compact_reset_text_color}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Reset}
                        </Typography>
                    </TouchableOpacity>
                )}
            </Animated.View>
        );
    }

    return (
        <Animated.View
            style={tailwind.style(
                `bg-[${themeColors.AudioRecorder_bg_color}] flex-col p-[16px] gap-[12px] rounded-[12px] items-center justify-center border-[1px] border-[${themeColors.AudioRecorder_border_color}]`,
            )}>
            {/* Header */}
            <Animated.View style={tailwind.style('flex-row justify-center items-center w-full')}>
                <Icon icon={<MicrophoneUnfilled color={undefined} />} size={20} />
                <Typography
                    type="body-subtext"
                    style={tailwind.style('ml-[8px]')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {headerText || userLanguageStrings.RecordingAudio || 'Recording Audio'}
                </Typography>
                {showCloseButton && (
                    <Animated.View style={tailwind.style('flex-1 flex-row-reverse')}>
                        <TouchableOpacity accessibilityRole="button" testID="audio-recorder-close" onPress={onClose}>
                            <Icon
                                icon={<CloseIcon color={undefined} height={undefined} width={undefined} />}
                                size={24}
                            />
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </Animated.View>

            {/* Controls */}
            <Animated.View
                style={tailwind.style(
                    `justify-between flex-row bg-[${themeColors.AudioRecorder_controls_bg_color}] p-[16px] rounded-[25px] items-center gap-[8px] border-[${themeColors.AudioRecorder_controls_border_color}] border-[1px]`,
                )}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                        audioState === 'Paused' ||
                        audioState === 'Stopped' ||
                        audioState === 'Recorded' ||
                        audioState === undefined
                            ? 'Play audio button'
                            : 'Pause audio button'
                    }
                    testID="audio-recorder-play-pause"
                    onPress={handleRecorder}>
                    <Icon icon={getControlIcon()} size={20} />
                </Pressable>

                <LottieWithFallback
                    fallback={undefined}
                    style={tailwind.style('flex-1 h-[20px]')}
                    lottieRef={animationRef}
                    source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                    autoPlay={false}
                    loop={true}
                />

                {showTimer && (
                    <Typography
                        type="body-subtext"
                        style={tailwind.style('text-center')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {formatTime(time)}
                    </Typography>
                )}
            </Animated.View>

            {/* Action Buttons */}
            {hasRecording && !isRecording && (
                <View style={tailwind.style('flex-row gap-[16px]')}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="audio-recorder-reset"
                        onPress={resetRecording}
                        style={tailwind.style('flex-row')}>
                        <Typography
                            type="body-1"
                            style={tailwind.style(`text-[${themeColors.AudioRecorder_reset_text_color}]`)}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {userLanguageStrings.Reset}
                        </Typography>
                    </TouchableOpacity>

                    {onRecordingComplete && filePath && (
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="audio-recorder-use"
                            onPress={() => onRecordingComplete(filePath)}
                            style={tailwind.style('flex-row')}>
                            <Typography
                                type="body-1"
                                style={tailwind.style(`text-[${themeColors.AudioRecorder_link_text_color}]`)}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {userLanguageStrings.UseRecording}
                            </Typography>
                        </TouchableOpacity>
                    )}
                </View>
            )}
        </Animated.View>
    );
};
