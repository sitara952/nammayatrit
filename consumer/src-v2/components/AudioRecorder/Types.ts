export type AudioState = 'Stopped' | 'Playing' | 'Paused' | 'Recording' | 'Recorded';

export interface AudioRecorderProps {
    fileName?: string; // Custom file name (without extension)
    onRecordingComplete?: (filePath: string) => void;
    onRecordingStart?: () => void;
    onRecordingStop?: () => void;
    onPlaybackStart?: () => void;
    onPlaybackStop?: () => void;
    showTimer?: boolean;
    showCloseButton?: boolean;
    onClose?: () => void;
    autoStart?: boolean; // Auto start recording when component mounts
    headerText?: string;
    compactMode?: boolean; // Show a more compact version
}

export interface AudioRecorderHookReturn {
    audioState: AudioState | undefined;
    time: number;
    isRecording: boolean;
    isPlaying: boolean;
    hasRecording: boolean;
    filePath: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => void;
    playRecording: () => void;
    pausePlayback: () => void;
    handleRecorder: () => void;
    resetRecording: () => void;
}

export interface PlaybackEvent {
    status: string;
    message: string | undefined;
}
