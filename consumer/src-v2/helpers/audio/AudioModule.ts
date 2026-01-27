import { Linking, NativeModules } from 'react-native';
import { PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { Platform } from 'react-native';

const { AudioModule } = NativeModules;

export const playAudio = (
    fileName: string,
    loopAudio: boolean, // 1 for true , 0 for false
) => {
    AudioModule.playAudio(fileName, loopAudio)
        .then((message: string) => console.info('playback ::' + message))
        .catch((error: string) => console.error(error));
};

export const pauseAudio = () => {
    AudioModule.pauseAudio('')
        .then((message: string) => console.info(message))
        .catch((error: string) => console.error(error));
};

export const stopAudio = () => {
    AudioModule.stopAudio('')
        .then((message: string) => console.info(message))
        .catch((error: string) => console.error(error));
};

export const setupRecorder = async () => {
    try {
        const result = await AudioModule.setupRecorder();
        console.info(result);
    } catch (error) {
        console.error(error);
    }
};

export const startRecording = (fileName: string) => {
    AudioModule.startRecording(fileName)
        .then((message: string) => console.info(message))
        .catch((error: string) => console.error(error));
};

export const stopRecording = () => {
    AudioModule.stopRecording('')
        .then((message: string) => console.info(message))
        .catch((error: string) => console.error(error));
};

export const requestMicrophonePermission = async () => {
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
    try {
        const result = await request(permission);
        switch (result) {
            case RESULTS.UNAVAILABLE:
                console.error('This feature is not available on this device.');
                break;
            case RESULTS.DENIED:
                console.warn('The permission has been denied but can be requested again.');
                break;
            case RESULTS.LIMITED:
                console.info('The permission is granted with limitations.');
                break;
            case RESULTS.GRANTED:
                console.info('The permission is granted.');
                break;
            case RESULTS.BLOCKED:
                console.error('The permission is denied and cannot be requested again.');
                Linking.openSettings();
                break;
        }
        return result === RESULTS.GRANTED;
    } catch (error) {
        console.error('Error requesting microphone permission:', error);
        return false;
    }
};
