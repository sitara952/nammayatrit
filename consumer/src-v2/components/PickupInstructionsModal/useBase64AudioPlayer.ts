import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Platform, NativeModules, NativeEventEmitter } from 'react-native';
import RNFS from 'react-native-fs';
import { playAudio, pauseAudio, stopAudio } from '../../helpers/audio/AudioModule';

interface PlaybackEvent {
    status: string;
    message: string | undefined;
}

interface Base64AudioPlayerHook {
    isPlaying: boolean;
    time: number;
    playAudio: () => Promise<void>;
    pauseAudio: () => void;
    stopAudio: () => void;
    isLoading: boolean;
    error: string | null;
}

export const useBase64AudioPlayer = (audioBase64: string | null | undefined): Base64AudioPlayerHook => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [time, setTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tempFilePath, setTempFilePath] = useState<string | null>(null);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioExtension = Platform.OS === 'ios' ? '.m4a' : '.mp3';

    // Generate unique filename based on audioBase64 content to ensure fresh audio loading
    // NOTE: Native module adds .mp3 extension automatically, so we need base name without extension
    const tempFileName = React.useMemo(() => {
        // Create unique filename when audioBase64 changes to avoid caching issues
        const timestamp = Date.now();
        const contentHash = audioBase64 ? audioBase64.substring(0, 8) : 'empty';
        return `base64_playback_${timestamp}_${contentHash}`;
    }, [audioBase64]);

    const tempFileNameWithExt = `${tempFileName}${audioExtension}`;

    // Convert base64 to temporary file in the same directory as AudioRecorder
    const convertBase64ToFile = useCallback(async (): Promise<string | null> => {
        if (!audioBase64) {
            console.error('🎵 useBase64AudioPlayer: No audio base64 data provided');
            return null;
        }

        try {
            setIsLoading(true);
            setError(null);

            // Use the same path structure as AudioRecorder (DocumentDirectoryPath)
            // Create file with proper extension, but pass base name to native module
            const tempPath = `${RNFS.DocumentDirectoryPath}/${tempFileNameWithExt}`;

            // Write base64 data to file
            await RNFS.writeFile(tempPath, audioBase64, 'base64');
            console.info('🎵 useBase64AudioPlayer: Converted base64 to file:', tempPath);

            // Verify file was created successfully
            const fileExists = await RNFS.exists(tempPath);
            const fileStats = await RNFS.stat(tempPath);
            console.info('🎵 useBase64AudioPlayer: File verification:', {
                exists: fileExists,
                size: fileStats.size,
                path: tempPath,
            });

            setTempFilePath(tempPath);
            setIsLoading(false);
            return tempPath;
        } catch (err) {
            console.error('🎵 useBase64AudioPlayer: Error converting base64 to file:', err);
            setError(err instanceof Error ? err.message : 'Failed to convert audio');
            setIsLoading(false);
            return null;
        }
    }, [audioBase64, tempFileNameWithExt]);

    // Start timer
    const startTimer = useCallback(() => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000);
        }
    }, []);

    // Stop timer
    const stopTimer = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    // Play audio
    const handlePlayAudio = useCallback(async (): Promise<void> => {
        try {
            // Stop any currently playing audio first
            if (isPlaying) {
                console.info('🎵 useBase64AudioPlayer: Stopping current audio before playing new one');
                stopAudio();
                setIsPlaying(false);
                stopTimer();
            }

            const filePath = tempFilePath || (await convertBase64ToFile());

            if (!filePath) {
                throw new Error('Failed to create audio file');
            }

            // Check if file exists before playing
            const fileExists = await RNFS.exists(filePath);
            if (!fileExists) {
                throw new Error('Audio file does not exist');
            }

            console.info('🎵 useBase64AudioPlayer: Playing audio file:', tempFileName);
            console.info('🎵 useBase64AudioPlayer: File exists at path:', filePath);

            // Reset timer and start playback
            setTime(0);
            setError(null);

            console.info('🎵 useBase64AudioPlayer: Attempting to play audio with filename:', tempFileName);

            // Use the same approach as AudioRecorder - filename only
            playAudio(tempFileName, false);
            setIsPlaying(true);
            startTimer();
        } catch (err) {
            console.error('🎵 useBase64AudioPlayer: Error playing audio:', err);
            setError(err instanceof Error ? err.message : 'Failed to play audio');
            setIsPlaying(false);
            stopTimer();
        }
    }, [tempFilePath, convertBase64ToFile, tempFileName, startTimer, isPlaying, stopTimer]);

    // Pause audio
    const handlePauseAudio = useCallback(() => {
        if (!isPlaying) {
            console.warn('🎵 useBase64AudioPlayer: Cannot pause - audio is not playing');
            return;
        }

        try {
            console.info('🎵 useBase64AudioPlayer: Pausing audio');
            pauseAudio();
            setIsPlaying(false);
            stopTimer();
        } catch (err) {
            console.error('🎵 useBase64AudioPlayer: Error pausing audio:', err);
            setIsPlaying(false);
            stopTimer();
        }
    }, [isPlaying, stopTimer]);

    // Stop audio
    const handleStopAudio = useCallback(() => {
        try {
            console.info('🎵 useBase64AudioPlayer: Stopping audio');
            stopAudio();
            setIsPlaying(false);
            stopTimer();
            setTime(0);
        } catch (err) {
            console.error('🎵 useBase64AudioPlayer: Error stopping audio:', err);
            setIsPlaying(false);
            stopTimer();
            setTime(0);
        }
    }, [stopTimer]);

    // Handle native audio events (same as AudioRecorder)
    useEffect(() => {
        const nativeEmitter = new NativeEventEmitter(NativeModules['AudioModule']);

        const playbackCompleteListener = nativeEmitter.addListener('onPlaybackComplete', (event: PlaybackEvent) => {
            console.info('🎵 useBase64AudioPlayer: Playback complete', event);
            setIsPlaying(false);
            stopTimer();
        });

        const playbackStopListener = nativeEmitter.addListener('onPlaybackStop', (event: PlaybackEvent) => {
            console.info('🎵 useBase64AudioPlayer: Playback stopped', event);
            setIsPlaying(false);
            stopTimer();
        });

        const playbackPauseListener = nativeEmitter.addListener('onPlaybackPause', (event: PlaybackEvent) => {
            console.info('🎵 useBase64AudioPlayer: Playback paused', event);
            setIsPlaying(false);
            stopTimer();
        });

        return () => {
            // Cleanup listeners and audio
            stopTimer();
            try {
                stopAudio();
            } catch (err) {
                console.warn('🎵 useBase64AudioPlayer: Error stopping audio during cleanup:', err);
            }

            playbackCompleteListener.remove();
            playbackStopListener.remove();
            playbackPauseListener.remove();

            // Clean up temp file
            if (tempFilePath) {
                RNFS.unlink(tempFilePath).catch(err => {
                    console.warn('🎵 useBase64AudioPlayer: Failed to cleanup temp file:', err);
                });
            }
        };
    }, [tempFilePath]); // stopTimer is stable due to useCallback

    // Reset tempFilePath and initialize new temp file when audioBase64 changes
    useEffect(() => {
        // Reset tempFilePath when audioBase64 changes to force new file creation
        setTempFilePath(null);

        if (audioBase64) {
            convertBase64ToFile();
        }
    }, [audioBase64]); // convertBase64ToFile is stable and depends on audioBase64 already

    return {
        isPlaying,
        time,
        playAudio: handlePlayAudio,
        pauseAudio: handlePauseAudio,
        stopAudio: handleStopAudio,
        isLoading,
        error,
    };
};
