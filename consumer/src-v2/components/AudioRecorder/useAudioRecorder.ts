import { useEffect, useRef, useState, useCallback } from 'react';
import { NativeModules, NativeEventEmitter, Platform } from 'react-native';
import LottieView from 'lottie-react-native';
import { requestMicrophonePermission, playAudio, pauseAudio, stopAudio } from '../../helpers/audio/AudioModule';
import { AudioState, AudioRecorderHookReturn, PlaybackEvent } from './Types';
import RNFS from 'react-native-fs';

export const useAudioRecorder = (fileName: string = 'pickup-instruction'): AudioRecorderHookReturn => {
    const [audioState, setAudioState] = useState<AudioState | undefined>(undefined);
    const [time, setTime] = useState(0);
    const [filePath, setFilePath] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const animationRef = useRef<LottieView | null>(null);

    const { AudioModule } = NativeModules;
    // Use consistent extensions for both recording and playback
    const audioExtension: string = Platform.OS === 'ios' ? '.m4a' : '.mp3';
    const fullFileName = `${fileName}${audioExtension}`;

    // Timer functions
    const startTimer = useCallback(() => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
    }, []);

    const pauseTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTime(0);
    }, []);

    // Animation functions
    const playAnimation = useCallback(() => {
        animationRef.current?.play();
    }, []);

    const pauseAnimation = useCallback(() => {
        animationRef.current?.pause();
    }, []);

    // Core recording functions
    const startRecording = useCallback(async (): Promise<void> => {
        const granted = await requestMicrophonePermission();
        if (!granted) {
            console.error('🎤 AudioRecorder: Microphone permission not granted');
            return;
        }

        console.info('🎤 AudioRecorder: Starting recording with filename:', fullFileName);

        try {
            // Pass the full filename with extension to native module (like Safety Module does)
            const recordingPath = await AudioModule.startRecording(fullFileName);
            setAudioState('Recording');
            setFilePath(recordingPath);
            console.info('🎤 AudioRecorder: Recording started, path:', recordingPath);
        } catch (error) {
            console.error('🎤 AudioRecorder: Failed to start recording:', error);
        }
    }, [AudioModule, fullFileName]);

    const stopRecording = useCallback(() => {
        console.info('🎤 AudioRecorder: Stopping recording');
        AudioModule.stopRecording('')
            .then((message: string) => {
                console.info('🎤 AudioRecorder: Recording stopped:', message);
                setAudioState('Recorded');
                // Set the file path for the recorded file using consistent naming
                const recordedFilePath = RNFS.DocumentDirectoryPath + '/' + fullFileName;
                setFilePath(recordedFilePath);
                console.info('🎤 AudioRecorder: Recording file path set to:', recordedFilePath);
            })
            .catch((error: string) => {
                console.error('🎤 AudioRecorder: Error stopping recording:', error);
            });
    }, [AudioModule, fullFileName]);

    const playRecording = useCallback(() => {
        console.info('🎤 AudioRecorder: Playing recording:', fullFileName);
        console.info('🎤 AudioRecorder: File path for playback:', filePath);

        // Reset timer for playback
        stopTimer();
        setTime(0);

        // Use consistent filename for playback
        playAudio(fullFileName, false);
        setAudioState('Playing');
    }, [fullFileName, filePath, stopTimer]);

    const pausePlayback = useCallback(() => {
        console.info('🎤 AudioRecorder: Pausing playback');
        pauseAudio();
        setAudioState('Paused');
    }, []);

    const handleRecorder = useCallback(() => {
        console.info('🎤 AudioRecorder: Handle recorder, current state:', audioState);

        if (audioState === 'Recording') {
            stopRecording();
        } else if (audioState === 'Playing') {
            pausePlayback();
        } else if (audioState === 'Recorded') {
            playRecording();
        } else if (audioState === 'Paused' || audioState === 'Stopped') {
            playRecording();
        }
    }, [audioState, stopRecording, pausePlayback, playRecording]);

    const resetRecording = useCallback(() => {
        console.info('🎤 AudioRecorder: Resetting recording');
        stopAudio();
        stopTimer();
        setAudioState(undefined);
        setFilePath(null);
        setTime(0);
    }, [stopTimer]);

    // Handle audio state changes for timer and animation
    useEffect(() => {
        if (audioState === 'Paused') {
            pauseTimer();
            pauseAnimation();
        } else if (audioState === 'Stopped') {
            stopTimer();
            pauseAnimation();
        } else if (audioState === 'Recorded') {
            // Don't reset timer when just recorded - keep the recording duration
            pauseTimer();
            pauseAnimation();
        } else if (audioState === 'Playing' || audioState === 'Recording') {
            startTimer();
            playAnimation();
        }
    }, [audioState]);

    // Handle native audio events
    useEffect(() => {
        const nativeEmitter = new NativeEventEmitter(NativeModules['AudioModule']);

        const playbackCompleteListener = nativeEmitter.addListener('onPlaybackComplete', (event: PlaybackEvent) => {
            console.info('🎤 AudioRecorder: Playback complete', event);
            setAudioState('Stopped');
        });

        const playbackStopListener = nativeEmitter.addListener('onPlaybackStop', (event: PlaybackEvent) => {
            console.info('🎤 AudioRecorder: Playback stopped', event);
            setAudioState('Stopped');
        });

        const playbackPauseListener = nativeEmitter.addListener('onPlaybackPause', (event: PlaybackEvent) => {
            console.info('🎤 AudioRecorder: Playback paused', event);
            setAudioState('Paused');
        });

        return () => {
            // Cleanup
            stopTimer();
            stopAudio();
            playbackCompleteListener.remove();
            playbackStopListener.remove();
            playbackPauseListener.remove();
        };
    }, []);

    // Computed values
    const isRecording = audioState === 'Recording';
    const isPlaying = audioState === 'Playing';
    const hasRecording = Boolean(
        filePath &&
            (audioState === 'Recorded' ||
                audioState === 'Playing' ||
                audioState === 'Paused' ||
                audioState === 'Stopped'),
    );

    return {
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
        handleRecorder,
        resetRecording,
    };
};
