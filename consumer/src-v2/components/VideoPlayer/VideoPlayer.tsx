import React, { useRef, useState, useCallback, useMemo, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import Video, { VideoRef, OnBufferData, OnLoadData, OnVideoErrorData } from 'react-native-video';
import Animated from 'react-native-reanimated';
import { styles } from './styles';
import { VideoPlayerProps } from './Types';
import { logger } from '@/src-v2/systems/logger';
import { VolumeOn } from '@/typescript/components/svg/VolumeOn';
import { VolumeOff } from '@/typescript/components/svg/VolumeOff';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import { TouchableWithoutFeedback } from '@/src-v2/primitives/TouchableWithoutFeedback';

const enableVideoPlayerLogs = true;
const VIDEO_PLAYER_LOG_PREFIX = '[VideoPlayer]';

const VideoPlayerView: React.FC<VideoPlayerProps> = ({
    source,
    style,
    fallbackElement,
    bufferingElement = null,
    onVideoEnd = () => {},
    autoPlay = true,
    shouldLoop = false,
    resizeMode = 'cover',
    bufferConfig,
    videoRef: externalVideoRef,
    pauseVideo,
    muted = false,
    onStateChange,
    onError = () => {},
    videoControls = false,
    bufferingDelay = 1,
    enableNetworkOptimizations = false,
    networkOptimizationConfig = {
        minBufferMs: 3000,
        maxBufferMs: 15000,
        bufferForPlaybackMs: 1000,
        bufferForPlaybackAfterRebufferMs: 2000,
    },
    bufferingElementStyle,
    enablePauseOnGesture = false,
    showMuteControl = false,
    muteControlStyle,
    onGesturePress = () => {},
    handleMuteToggle = () => {},
    disableFocus = true,
    ignoreSilentSwitch = 'obey',
    preventsDisplaySleepDuringVideoPlayback = false,
}) => {
    const internalVideoRef = useRef<VideoRef>(null);
    const [isBuffering, setIsBuffering] = useState(true);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isMuted, setIsMuted] = useState(muted);

    useEffect(() => {
        setIsMuted(muted);
    }, [muted]);

    // Normalize the ref to always have a .current property
    const videoRef = useRef<VideoRef>(
        externalVideoRef && 'current' in externalVideoRef
            ? externalVideoRef.current
            : externalVideoRef || internalVideoRef.current,
    );

    // Determine paused state
    const isPaused = pauseVideo !== undefined ? pauseVideo : !autoPlay;

    // State change logging and callback
    const logStateChange = useCallback(
        (newState: string) => {
            onStateChange?.(newState);
            if (enableVideoPlayerLogs) {
                console.info(`${VIDEO_PLAYER_LOG_PREFIX} VideoPlayer State: ${newState}`);
            }
        },
        [onStateChange],
    );

    const handleBuffer = useCallback(
        (data: OnBufferData) => {
            setIsBuffering(data.isBuffering);
            logStateChange(data.isBuffering ? 'buffering' : 'playing');
        },
        [logStateChange],
    );

    const handleLoad = useCallback(
        (data: OnLoadData) => {
            // Add a slight delay to ensure smooth loading
            setTimeout(() => {
                setIsLoaded(true);
                setIsBuffering(false);
                setHasError(false);
                logStateChange('loaded');
                if (enableVideoPlayerLogs) {
                    console.info(`${VIDEO_PLAYER_LOG_PREFIX} Video loaded`, data);
                }
            }, bufferingDelay);
        },
        [logStateChange, bufferingDelay],
    );

    const handleError = useCallback(
        (error: OnVideoErrorData) => {
            if (enableVideoPlayerLogs) {
                console.error(`${VIDEO_PLAYER_LOG_PREFIX} Video Error:`, error);
            }

            logger.logError(`Video Error: ${error}`, 'VideoPlayer');

            setHasError(true);
            setIsLoaded(false);
            setIsBuffering(false);
            logStateChange('error');
            onError(error);
        },
        [logStateChange, onError],
    );

    const fallbackElementView = <ActivityIndicator size="large" />;

    const handleVideoPress = useCallback(() => {
        if (enablePauseOnGesture) {
            if (enableVideoPlayerLogs) {
                console.info(`${VIDEO_PLAYER_LOG_PREFIX} Video tap detected`);
            }
            onGesturePress();
        }
    }, [enablePauseOnGesture, onGesturePress]);

    const renderContent = useMemo(() => {
        // Only render fallback when there's a specific error
        if (hasError && fallbackElement) {
            return fallbackElement;
        } else if (hasError && !fallbackElement) {
            return fallbackElementView;
        }

        // Determine buffer configuration
        const isUriSource = typeof source === 'object' && 'uri' in source;
        const finalBufferConfig =
            isUriSource && (enableNetworkOptimizations || bufferConfig)
                ? {
                      ...(enableNetworkOptimizations ? networkOptimizationConfig : {}),
                      ...(bufferConfig || {}),
                  }
                : undefined;

        const modifiedSourceWithAdditions = finalBufferConfig ? { ...source, bufferConfig: finalBufferConfig } : source;

        // If no error, render video
        const videoElement = (
            <Video
                ref={videoRef}
                source={modifiedSourceWithAdditions}
                style={enablePauseOnGesture ? [{ flex: 1 }] : [style]}
                resizeMode={resizeMode}
                paused={isPaused}
                repeat={shouldLoop}
                muted={isMuted}
                onBuffer={handleBuffer}
                controls={videoControls}
                onLoad={handleLoad}
                onError={handleError}
                onEnd={onVideoEnd}
                disableFocus={disableFocus}
                ignoreSilentSwitch={ignoreSilentSwitch}
                preventsDisplaySleepDuringVideoPlayback={preventsDisplaySleepDuringVideoPlayback}
            />
        );

        return (
            <>
                {enablePauseOnGesture ? (
                    <TouchableWithoutFeedback
                        onPress={handleVideoPress}
                        testID="video-gesture-handler"
                        accessibilityRole="button">
                        <View style={style}>{videoElement}</View>
                    </TouchableWithoutFeedback>
                ) : (
                    videoElement
                )}
                {isBuffering && (
                    <Animated.View style={bufferingElementStyle || styles.loadingOverlay}>
                        {bufferingElement || <ActivityIndicator size="large" />}
                    </Animated.View>
                )}
                {showMuteControl && (
                    <TouchableOpacity
                        style={[styles.muteControlContainer, muteControlStyle]}
                        onPress={handleMuteToggle}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        testID="video-mute-control">
                        {isMuted ? (
                            <VolumeOff fill={'white'} width={20} height={20} />
                        ) : (
                            <VolumeOn fill={'white'} height={20} width={20} />
                        )}
                    </TouchableOpacity>
                )}
            </>
        );
    }, [
        source,
        style,
        resizeMode,
        isPaused,
        shouldLoop,
        handleBuffer,
        videoControls,
        handleLoad,
        handleError,
        onVideoEnd,
        isLoaded,
        hasError,
        fallbackElement,
        bufferingElement,
        isBuffering,
        enableNetworkOptimizations,
        networkOptimizationConfig,
        bufferConfig,
        isMuted,
        enablePauseOnGesture,
        showMuteControl,
        muteControlStyle,
        bufferingElementStyle,
        handleMuteToggle,
        handleVideoPress,
        onGesturePress,
        disableFocus,
        ignoreSilentSwitch,
        preventsDisplaySleepDuringVideoPlayback,
    ]);

    return renderContent;
};

export const VideoPlayer = React.memo(VideoPlayerView);
