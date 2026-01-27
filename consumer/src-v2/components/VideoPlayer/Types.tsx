import React, { RefObject } from 'react';
import { ViewStyle } from 'react-native';
import { OnBufferData, ReactVideoSourceProperties, VideoRef } from 'react-native-video';
export interface VideoPlayerProps {
    /** Source of the video */
    source: ReactVideoSourceProperties;
    /** Optional custom style for the video container */
    containerStyle: ViewStyle | undefined;
    /** Optional style for the video */
    style: ViewStyle | undefined;
    /** Optional fallback/loading element */
    fallbackElement: React.ReactNode | undefined;
    /** Optional buffering element */
    bufferingElement: React.ReactNode | undefined;
    /** Optional callback for when video reaches the end */
    onVideoEnd: (() => void) | undefined;
    /** Optional prop to control whether video should auto-play */
    autoPlay: boolean | undefined;
    /** Optional prop to control whether video should loop */
    shouldLoop: boolean | undefined;
    /** Resize mode for the video */
    resizeMode: ('cover' | 'contain' | 'stretch') | undefined;
    /** Buffer configuration (potentially deprecated) */
    bufferConfig:
        | {
              minBufferMs: number | undefined;
              maxBufferMs: number | undefined;
              bufferForPlaybackMs: number | undefined;
              bufferForPlaybackAfterRebufferMs: number | undefined;
          }
        | undefined;
    /** External video ref */
    videoRef: (VideoRef | RefObject<VideoRef | null> | null) | undefined;
    /** Optional prop to pause video */
    pauseVideo: boolean | undefined;
    /** Optional prop to control whether video controls should be shown */
    videoControls: boolean | undefined;
    /** Callback for debugging video states */
    onStateChange: ((state: string) => void) | undefined;
    /** Callback for error handling */
    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    onError: ((error: any) => void) | undefined;
    /** Callback for buffering */
    onBuffer: ((data: OnBufferData) => void) | undefined;
    /** Mute video */
    muted: boolean | undefined;
    /** Optional props for NETWORK OPTIMIZATIONS */
    /** Buffering delay configuration */
    bufferingDelay: number | undefined;
    /** Flag to enable network optimizations */
    enableNetworkOptimizations: boolean | undefined;
    /** Custom network optimization configuration  */
    networkOptimizationConfig:
        | {
              /** Minimum buffer time in milliseconds */
              minBufferMs: number | undefined;
              maxBufferMs: number | undefined;
              bufferForPlaybackMs: number | undefined;
              bufferForPlaybackAfterRebufferMs: number | undefined;
          }
        | undefined;
    /** Custom buffering element style */
    bufferingElementStyle: ViewStyle | undefined;
    /** Optional prop to enable pause on double tap or long press */
    enablePauseOnGesture: boolean | undefined;
    /** Optional prop to show mute control button */
    showMuteControl: boolean | undefined;
    /** Custom style for the mute control button */
    muteControlStyle: ViewStyle | undefined;
    /** Callback for gesture events (double tap or long press) */
    onGesturePress: (() => void) | undefined;
    /** Callback for mute control button press */
    handleMuteToggle: (() => void) | undefined;
    /** Disable audio focus to prevent interrupting background audio (Android) - defaults to true */
    disableFocus: boolean;
    /** Control silent switch behavior (iOS) - 'obey' allows background audio to continue - defaults to 'obey' */
    ignoreSilentSwitch: 'ignore' | 'obey' | 'inherit';
    /** Prevent display sleep during video playback - defaults to true, set to false to allow screen auto-lock */
    preventsDisplaySleepDuringVideoPlayback: boolean;
}
