import Animated from 'react-native-reanimated';
import React, { useEffect, useRef, useState } from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import { Icon } from '../../../../src/typescript/components/Icon';
import CloseIcon from '../../../../src/typescript/components/svg/CloseIcon';
import { PauseIcon } from '../../../../src/typescript/components/svg/PauseIcon';
import { PlayIcon } from '../../../../src/typescript/components/svg/PlayIcon';
import LottieView from 'lottie-react-native';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { NativeModules, NativeEventEmitter } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../../../src/typescript/state/hooks';
import { playAudio, stopAudio, pauseAudio, requestMicrophonePermission } from '../../../helpers/audio/AudioModule';
import { formatTime } from '../../../utils/common';
import { activateSafetyTool, selectSosId } from '../../../../src/typescript/state/client/sos';
import { MicrophoneUnfilled } from '../../../../src/typescript/components/svg/MicrophoneUnfilled';
import RNFS from 'react-native-fs';
import { uploadFiles } from 'react-native-fs';
import { selectToken } from '../../../../src/typescript/state/client/auth';
import Config from 'react-native-config';
import { Platform } from 'react-native';
import { useSosCreatePostMutation } from '../../../../src/api/integrations/rtk/SosCreatePost';
import { selectRideIdWithBookingId } from '../../../../src/typescript/state/client/booking';
import { setSosId } from '../../../../src/typescript/state/client/sos';
import { BookingId } from '../../../../src/typescript/state/client/user';
import { setToastProps } from '../../../../src/typescript/state/client/session';
import colors from '@/typescript/designSystem/colorPalette/index.ts';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { getSafetyCreatePostBody } from '../Flow';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

type AudioState = 'Stopped' | 'Playing' | 'Paused' | 'Recording' | 'Recorded';
type UploadState = 'Uploading' | 'Uploaded' | 'Failed';

export const AudioRecorderView = (props: { bookingId: BookingId | null }) => {
    const [audioState, setAudioState] = useState<AudioState | undefined>(undefined);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const audioExtension: string = Platform.OS == 'ios' ? '.m4a' : '.mp3';
    const [time, setTime] = useState(1); // Tracks time in seconds
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const playIcon = <PlayIcon fill={undefined} />;
    const pauseIcon = <PauseIcon fill={undefined} />;
    const dispatch = useAppDispatch();
    const token = useAppSelector(selectToken);
    const sosId = useAppSelector(selectSosId);
    const [dataUploadStage, setDataUploadStage] = useState<UploadState | undefined>(undefined);

    const { AudioModule } = NativeModules;

    const uploadRecordedAudio = (sosIdNew: string | undefined) => {
        const finalSosId = sosId || sosIdNew;
        console.info('sosId :', finalSosId);
        setDataUploadStage('Uploading');
        const filePath = RNFS.DocumentDirectoryPath + '/safety-recording' + audioExtension;
        if (token != undefined && filePath != undefined && finalSosId != undefined) {
            const files = [
                {
                    name: 'payload',
                    filename: 'safety-recording' + audioExtension,
                    filepath: filePath,
                    filetype: 'audio/mpeg',
                },
            ];
            uploadFiles({
                toUrl: `${Config['BASE_URL']}/sos/${finalSosId}/upload`,
                files: files,
                method: 'POST',
                headers: {
                    token: token,
                },
                fields: {
                    fileType: 'Audio',
                },
                begin: () => {
                    console.info('Upload began');
                },
                progress: ({ totalBytesSent, totalBytesExpectedToSend }) => {
                    console.info('Upload in progress,', totalBytesSent, ' of ', totalBytesExpectedToSend, ' sent.');
                    if (totalBytesSent === totalBytesExpectedToSend) {
                        console.info('Data uploaded successfully!');
                    }
                },
            })
                .promise.then(response => {
                    if (response.statusCode == 200) {
                        dispatch(
                            setToastProps({
                                visible: true,
                                message: userLanguageStrings.FileUploadedSuccessfully,
                                backgroundColor: `${colors?.primitive?.green?.[1]}`,
                                autoDismissAfter: 2000,
                                buttons: [],
                                useSpannedToast: undefined,
                                bottomSpanDescription: undefined,
                                spannerType: undefined,
                                logo: undefined,
                                dismissButton: undefined,
                                onSpannedToastLoad: undefined,
                                margin: undefined,
                                customToast: undefined,
                            }),
                        );
                        setDataUploadStage('Uploaded');
                        dispatch(activateSafetyTool(undefined));
                    } else {
                        dispatch(
                            setToastProps({
                                visible: true,
                                message: userLanguageStrings.UploadFailed,
                                backgroundColor: `${colors?.primitive?.red?.danger}`,
                                autoDismissAfter: 2000,
                                buttons: [],
                                useSpannedToast: undefined,
                                bottomSpanDescription: undefined,
                                spannerType: undefined,
                                logo: undefined,
                                dismissButton: undefined,
                                onSpannedToastLoad: undefined,
                                margin: undefined,
                                customToast: undefined,
                            }),
                        );
                        setDataUploadStage('Failed');
                    }
                })
                .catch(err => {
                    dispatch(
                        setToastProps({
                            visible: true,
                            message: userLanguageStrings.UploadFailed,
                            backgroundColor: `${colors?.primitive?.red?.danger}`,
                            autoDismissAfter: 2000,
                            buttons: [],
                            useSpannedToast: undefined,
                            bottomSpanDescription: undefined,
                            spannerType: undefined,
                            logo: undefined,
                            dismissButton: undefined,
                            onSpannedToastLoad: undefined,
                            margin: undefined,
                            customToast: undefined,
                        }),
                    );
                    setDataUploadStage('Failed');
                    dispatch(activateSafetyTool(undefined));
                    console.error('Upload Failed', err);
                });
        } else {
            console.error('Error happened while uploading audio, sosId :', finalSosId);
        }
    };

    const rideId: string | null = useAppSelector(state => selectRideIdWithBookingId(state, props.bookingId));

    const [sosCreatePost] = useSosCreatePostMutation();
    const shareRecordedAudio = async () => {
        if (sosId === undefined) {
            const sosReqBody = await getSafetyCreatePostBody(rideId, 'SafetyFlow');
            sosCreatePost({ body: sosReqBody })
                .then(data => {
                    if (data.data?.sosId !== undefined) {
                        dispatch(setSosId(data?.data?.sosId));
                        uploadRecordedAudio(data.data.sosId);
                    }
                })
                .catch(err => console.error('Error in create sos api', err));
        } else uploadRecordedAudio(undefined);
    };

    // Timer functions ------------

    const startTimer = () => {
        if (!intervalRef.current) {
            intervalRef.current = setInterval(() => {
                setTime(prevTime => prevTime + 1);
            }, 1000); // Timer increments every second
        }
    };

    const pauseTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const stopTimer = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        setTime(0); // Reset timer to 0
    };

    // Animation Functions ------------------

    const animationRef = useRef<LottieView | null>(null);

    const playAnimation = () => {
        animationRef.current?.play();
    };

    const pauseAnimation = () => {
        animationRef.current?.pause();
    };

    // Recording Functions --------------------

    const startRecording = () => {
        AudioModule.startRecording('safety-recording.m4a')
            .then((filePath: string) => {
                setAudioState('Recording');
                console.info('recordingPath', filePath);
                playAnimation();
            })
            .catch((error: string) => console.error(error));
    };

    const stopRecording = () => {
        AudioModule.stopRecording('')
            .then((message: string) => console.error(message))
            .catch((error: string) => console.error(error));
        setAudioState('Recorded');
    };

    const playRecording = () => {
        playAudio('safety-recording.m4a', false);
        setAudioState('Playing');
    };

    const handleRecorder = () => {
        if (audioState === 'Recording') {
            stopRecording();
        } else if (audioState === 'Playing') {
            pauseAudio();
            setAudioState('Paused');
        } else if (audioState === 'Recorded') {
            playRecording();
        } else if (audioState === 'Paused' || audioState === 'Stopped') {
            playRecording();
        }
    };

    useEffect(() => {
        if (audioState === 'Paused') {
            pauseTimer();
            pauseAnimation();
        } else if (audioState === 'Stopped' || audioState === 'Recorded') {
            stopTimer();
            pauseAnimation();
        } else if (audioState === 'Playing' || audioState == 'Recording') {
            startTimer();
            playAnimation();
        }
    }, [audioState]);

    const handleRecordAudio = async () => {
        const granted = await requestMicrophonePermission();
        if (granted) {
            console.info('Microphone Permission is granted');
            startRecording();
        } else {
            console.error('Microphone permission is not granted');
        }
    };

    interface PlaybackEvent {
        status: string;
        message: string | undefined;
    }

    useEffect(() => {
        const nativeEmitter = new NativeEventEmitter(NativeModules['AudioModule']);
        const playbackCompleteListener = nativeEmitter.addListener('onPlaybackComplete', (event: PlaybackEvent) => {
            console.info('Event Data onPlaybackComplete', event);
            setAudioState('Stopped');
            stopTimer();
        });

        const playbackStopListener = nativeEmitter.addListener('onPlaybackStop', (event: PlaybackEvent) => {
            setAudioState('Stopped');
            stopTimer();
            console.info('Event Data onPlaybackStop', event);
        });

        const playbackPauseListener = nativeEmitter.addListener('onPlaybackPause', (event: PlaybackEvent) => {
            pauseTimer();
            setAudioState('Paused');
            console.info('Event Data playback Paused', event);
        });
        setAudioState(undefined);
        handleRecordAudio();

        return () => {
            stopTimer();
            stopRecording();
            stopAudio();
            playbackCompleteListener.remove();
            playbackStopListener.remove();
            playbackPauseListener.remove();
        };
    }, []);

    return (
        <Animated.View
            style={tailwind.style(
                'bg-[#F8F9FB] flex-col p-[16px] gap-[12px] rounded-[12px] items-center justify-center border-[1px] border-[#F1F2F7]',
            )}>
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
                    {userLanguageStrings.RecordingAudio}
                </Typography>
                <Animated.View style={tailwind.style('flex-1 flex-row-reverse')}>
                    <TouchableOpacity
                        accessibilityRole="button"
                        testID="safety_audio_close"
                        onPress={() => dispatch(activateSafetyTool(undefined))}>
                        <Icon icon={<CloseIcon color={undefined} height={undefined} width={undefined} />} size={24} />
                    </TouchableOpacity>
                </Animated.View>
            </Animated.View>
            <Animated.View
                style={tailwind.style(
                    'justify-between flex-row bg-[#FFFFFF] p-[16px] rounded-[25px] items-center gap-[8px] border-[#E0E3E8] border-[1px]',
                )}>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Play/Pause button"
                    testID="safety_audio_play_pause"
                    onPress={handleRecorder}>
                    <Icon
                        icon={
                            audioState === 'Paused' ||
                            audioState === 'Stopped' ||
                            audioState === 'Recorded' ||
                            audioState === undefined
                                ? playIcon
                                : pauseIcon
                        }
                        size={20}
                    />
                </Pressable>
                <LottieWithFallback
                    fallback={undefined}
                    style={tailwind.style('flex-1 h-[20px]')}
                    lottieRef={animationRef}
                    source={require('@/typescript/assets/ny-service/mt_ic_record_audio.lottie')}
                    autoPlay={false}
                    loop={true}
                />
                <Typography
                    type="body-subtext"
                    style={undefined}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {formatTime(time)}
                </Typography>
            </Animated.View>
            {audioState !== 'Recording' && audioState !== undefined ? (
                <TouchableOpacity
                    accessibilityRole="button"
                    testID="safety_audio_share"
                    onPress={() => shareRecordedAudio()}
                    style={tailwind.style('flex-row')}>
                    <Typography
                        type="body-1"
                        style={tailwind.style('text-[#B2B9C7]')}
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {dataUploadStage === 'Uploading'
                            ? userLanguageStrings.UploadInProgress
                            : dataUploadStage === 'Uploaded'
                              ? userLanguageStrings.Uploaded
                              : userLanguageStrings.ShareWithSafetyTeam}
                    </Typography>
                    {dataUploadStage === 'Uploading' ? (
                        <LottieWithFallback
                            fallback={undefined}
                            style={tailwind.style('w-[30px] h-[30px] top-[-2px] left-[-10px]')}
                            source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_grey.lottie')}
                            autoPlay
                            loop
                        />
                    ) : (
                        <></>
                    )}
                </TouchableOpacity>
            ) : (
                <></>
            )}
        </Animated.View>
    );
};
