import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { ImagePickerResponse, launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS, { uploadFiles } from 'react-native-fs';
import { Platform, Alert, Linking } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { issueOptionRes } from '../../../src/readOnly/api/types/IssueOptionRes.gen';
import { issueReportReq as ApiIssueReportReq } from '../../../src/readOnly/api/types/IssueReportReq.gen';

import { ReportIssueChatUI } from './UI';
import { MessageItem, ReportIssueChatAction, MediaFile } from './Types';
import { createDispatcher, Resolver, transformLanguage } from '@/typescript/utils/common';
import { HelpAndSupportParamList, MainNavigationParamList } from '@/typescript/navigation/globalParamList';
import { useLazyIssueOptionGetQuery } from '@/api/integrations/rtk/IssueOptionGet';
import { useIssuePostMutation } from '@/api/integrations/rtk/IssuePost';
import { useIssueIssueIdUpdateStatusPutMutation } from '@/api/integrations/rtk/IssueIssueIdUpdateStatusPut';
import { useDispatch } from 'react-redux';
import { selectUserLanguage, setToastProps } from '@/typescript/state/client/session';
import { genericErrorToastProps } from '@/typescript/state/middleware';
import { mandatoryUploads } from '@/readOnly/api/types/MandatoryUploads.gen';
import { useIssueIssueIdInfoGetQuery } from '@/api/integrations/rtk/IssueIssueIdInfoGet';
import { ToastProps } from '@/typescript/state/client/session';
import { ChatType_chatType, IssueStatus_issueStatus } from '@/readOnly/api/types/Enums.gen';
import Config from 'react-native-config';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectToken } from '@/typescript/state/client/auth';
import { safeJsonParse } from '@/src-v2/components/SafeJsonParser';
import { useRideRideIdCallDriverPostMutation } from '@/api/integrations/rtk/RideRideIdCallDriverPost';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { message } from '@/readOnly/api/types/Message.gen';

const infoToastProps = (message: string): ToastProps => ({
    visible: true,
    message,
    backgroundColor: '#5B6777', // Grey
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
});

export const ReportIssueChatScreen = () => {
    const navigation: NativeStackNavigationProp<MainNavigationParamList> = useNavigation();
    const route = useRoute<RouteProp<HelpAndSupportParamList, 'reportIssueChatScreen'>>();
    const { category, rideId, issueReportId, driverNumber } = route.params;
    const paramCategoryId = category?.issueCategoryId;
    const categoryId = paramCategoryId || '';
    const token = useAppSelector(selectToken);
    const language = useAppSelector(selectUserLanguage);
    const languageStr = transformLanguage(language ?? 'ENGLISH');

    const dispatchRedux = useDispatch();

    const { data: issueInfo, isLoading: issueInfoLoading } = useIssueIssueIdInfoGetQuery(
        {
            issueId: issueReportId || '',
            language: languageStr,
        },
        {
            skip: !!paramCategoryId,
        },
    );

    const sendFile = async (fileName: string, filePath: string, fileType: string) => {
        setIsUploading(true);
        const files = [
            {
                name: 'file',
                filename: fileName,
                filepath: filePath.replace('file://', ''),
                filetype: fileType,
            },
        ];
        const fileExists = await RNFS.exists(filePath.replace('file://', '') || '');

        if (fileExists) {
            const res = await uploadFiles({
                toUrl: `${Config['BASE_URL']}/issue/upload`,
                files: files,
                method: 'POST',
                headers: {
                    token: token || '',
                },
                fields: {
                    fileType: fileType.includes('image') ? 'Image' : 'Audio',
                },
                begin: () => {
                    console.info('Upload began');
                },
            }).promise;

            setIsUploading(false);
            return res;
        } else {
            setIsUploading(false);
            throw Error('File Not Found');
        }
    };

    const [submitIssue, { isLoading: isSubmitting }] = useIssuePostMutation();

    const [isUploading, setIsUploading] = useState(false);

    const [messages, setMessages] = useState<MessageItem[]>([]);
    const [options, setOptions] = useState<issueOptionRes[]>([]);
    const [showInput, setShowInput] = useState(false);
    const [inputText, setInputText] = useState('');
    const [attachments, setAttachments] = useState<MediaFile[]>([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [selectedOptionId, setSelectedOptionId] = useState<string | undefined>(undefined);
    const [mandatoryUploads, setMandatoryUploads] = useState<mandatoryUploads[]>([]);

    const attachmentPickerRef = useRef<BottomSheetModal>(null);
    const audioRecorderRef = useRef<BottomSheetModal>(null);
    const [showStillHaveIssue, setShowStillHaveIssue] = useState(false);
    const [updateIssueStatus] = useIssueIssueIdUpdateStatusPutMutation();
    const [status, setStatus] = useState<IssueStatus_issueStatus>('OPEN');

    const [callDriver] = useRideRideIdCallDriverPostMutation();

    const [getOptionApi, { data: optionData, isLoading: optionLoading }] = useLazyIssueOptionGetQuery();

    useEffect(() => {
        if (paramCategoryId) {
            getOptionApi({
                categoryId: categoryId,
                optionId: selectedOptionId,
                issueReportId: issueReportId,
                rideId: rideId,
                language: languageStr,
            });
        }
    }, [categoryId, selectedOptionId, issueReportId, rideId, languageStr]);

    useEffect(() => {
        if (issueInfo?.chats) {
            const finalMessages = issueInfo.chats.map((chat): MessageItem => {
                const isMedia = chat.chatType === 'Audio' || chat.chatType === 'Image';
                const getChatType = ((): ChatType_chatType => {
                    if (chat.chatType === 'Audio' || chat.chatType === 'Image') return 'MediaFile';
                    else if (chat.sender === 'USER') return 'IssueOption';
                    else return 'IssueMessage';
                })();

                return {
                    id: chat.id,
                    type: getChatType,
                    text: isMedia ? 'Media attachment' : chat.content || '',
                    timestamp: chat.timestamp,
                    mediaFiles: isMedia
                        ? [
                              {
                                  _type: chat.chatType === 'Audio' ? 'Audio' : 'Image',
                                  id: chat.id,
                                  url: chat.content || '',
                                  fileId: chat.content || '',
                              },
                          ]
                        : [],
                };
            });
            setMessages(finalMessages);

            setStatus(issueInfo.status);

            const lastMessage = issueInfo.chats[issueInfo.chats.length - 1];
            setShowStillHaveIssue(lastMessage?.label === 'AUTO_MARKED_RESOLVED');

            if (issueInfo.status !== 'RESOLVED') setIsSubmitted(true);
        }

        if (issueInfo?.options) {
            setOptions(issueInfo.options);
            if (issueInfo.options[issueInfo.options.length - 1]?.mandatoryUploads) {
                setMandatoryUploads(issueInfo.options[issueInfo.options.length - 1]?.mandatoryUploads ?? []);
            }
        }
        /* eslint-disable-next-line myCustomPlugin/no-hook-dep */
    }, [issueInfo]);

    const updateBotMessage = (messageList: message[]) => {
        const botMessages = messageList.map(
            (msg): MessageItem => ({
                id: msg.id,
                type: 'IssueMessage',
                text: msg.message,
                timestamp: new Date().toISOString(),
            }),
        );

        setMessages(prev => {
            const existingIds = new Set(prev.map(m => m.id));
            const uniqueNewMessages = botMessages.filter(m => !existingIds.has(m.id));
            return [...prev, ...uniqueNewMessages];
        });
    };

    useEffect(() => {
        if (optionData?.options) {
            setOptions(optionData.options);
            if (optionData.options[optionData.options.length - 1]?.mandatoryUploads) {
                setMandatoryUploads(optionData.options[optionData.options.length - 1]?.mandatoryUploads ?? []);
            }
        }
        if (optionData?.messages) {
            updateBotMessage(optionData.messages);

            const hasCreateTicket = optionData.messages.some(msg => msg.label === 'CREATE_TICKET');
            setShowInput(hasCreateTicket);

            const hasEndFlow = optionData.messages.some(msg => msg.label === 'END_FLOW');
            if (hasEndFlow) {
                // Auto-submit without creating ticket
                (async () => {
                    try {
                        const issueRequest: ApiIssueReportReq = {
                            categoryId: categoryId,
                            chats: [...messages].map(m => ({
                                chatId: m.id,
                                timestamp: m.timestamp,
                                chatType: m.type,
                            })),
                            createTicket: false,
                            description: 'Auto-saved flow',
                            mediaFiles: [],
                            optionId: selectedOptionId || undefined,
                            rideId: rideId || undefined,
                            ticketBookingId: undefined,
                        };
                        await submitIssue({ language: 'en', body: issueRequest }).unwrap();
                    } catch (e) {
                        console.error('Auto-submit failed', e);
                    }
                })();
            }

            const lastMessage = optionData.messages[optionData.messages.length - 1];
            if (lastMessage?.label === 'AUTO_MARKED_RESOLVED') {
                setShowStillHaveIssue(true);
            }
        }
        /* eslint-disable-next-line myCustomPlugin/no-hook-dep */
    }, [optionData]);

    const handleOptionSelect = async (selectedOption: issueOptionRes) => {
        // Add user message
        const userMsg: MessageItem = {
            id: selectedOption.issueOptionId,
            type: 'IssueOption',
            text: selectedOption.option || selectedOption.label,
            timestamp: new Date().toISOString(),
        };
        setOptions([]);
        setSelectedOptionId(selectedOption.issueOptionId);
        setMessages(prev => [...prev, userMsg]);

        if (selectedOption.label === 'CALL_DRIVER' || selectedOption.label === 'CALL_SUPPORT') {
            if (driverNumber && driverNumber !== '') {
                Linking.openURL(`tel:${driverNumber}`);
            } else if (rideId) {
                dispatchRedux(setToastProps(infoToastProps('Initiating call...')));
                callDriver({ rideId });
            }
        } else if (selectedOption.label === 'REOPEN_TICKET') {
            try {
                const res = await updateIssueStatus({
                    issueId: issueReportId || '',
                    language: languageStr,
                    body: { status: 'REOPENED', customerRating: undefined, customerResponse: undefined },
                }).unwrap();
                updateBotMessage(res.messages);
                setShowStillHaveIssue(false);
                setStatus('REOPENED');
            } catch {
                dispatchRedux(setToastProps(genericErrorToastProps('Failed to reopen issue')));
            }
        } else if (selectedOption.label === 'SELECT_RIDE') {
            navigation.navigate('ProfileTab', {
                screen: 'myRidesNavigator',
                params: {
                    screen: 'myRidesScreen',
                    params: { isHelpAndSupportScreen: true, issueCategory: undefined },
                },
            });
            return;
        } else if (selectedOption.label === 'MARK_RESOLVED') {
            try {
                const res = await updateIssueStatus({
                    issueId: issueReportId || '',
                    language: languageStr,
                    body: { status: 'CLOSED', customerRating: undefined, customerResponse: undefined },
                }).unwrap();
                updateBotMessage(res.messages);
                setStatus('CLOSED');
                setIsSubmitted(true);
            } catch {
                dispatchRedux(setToastProps(genericErrorToastProps('Failed to update status')));
            }
        } else if (selectedOption.label === 'DOWNLOAD_INVOICE') {
            dispatchRedux(setToastProps(infoToastProps('Downloading invoice...')));
        } else if (selectedOption.label === 'FAQ_WEBSITE') {
            dispatchRedux(setToastProps(infoToastProps('Opening FAQ...')));
        }

        if (categoryId === '') {
            getOptionApi({
                categoryId: issueInfo?.categoryId || '',
                optionId: selectedOption.issueOptionId,
                issueReportId: issueReportId,
                rideId: rideId,
                language: undefined,
            });
        }
    };

    const uploadPhoto = async (result: ImagePickerResponse) => {
        if (!result.didCancel && result.assets && result.assets.length > 0) {
            const asset = result.assets[0];
            const assetUri = asset?.uri;
            if (!assetUri) {
                return;
            }
            const filename = asset.fileName || 'upload.jpg';
            const fileType = asset.type || 'image/jpeg';
            try {
                const imageUploadLimit = mandatoryUploads.find(u => u.fileType === 'Image')?.limit || 5;
                const currentImageCount = attachments.filter(a => a._type === 'Image').length;
                if (currentImageCount < imageUploadLimit) {
                    const uploadRes = await sendFile(filename, assetUri, fileType);
                    const data = safeJsonParse(uploadRes.body, { fileId: '' });

                    const newAttachment: MediaFile = {
                        id: data.fileId,
                        _type: 'Image',
                        url: assetUri,
                        fileId: data.fileId,
                    };
                    setAttachments(prev => [...prev, newAttachment]);
                } else {
                    dispatchRedux(setToastProps(genericErrorToastProps(`Limit of ${imageUploadLimit} images reached`)));
                }
            } catch (err) {
                console.error('Upload failed', err);
                dispatchRedux(setToastProps(genericErrorToastProps('Failed to upload image')));
            }
        }
    };

    const resolver: Resolver<ReportIssueChatAction> = useCallback(
        async action => {
            switch (action.type) {
                case 'OPTION_SELECTED':
                    if (action.payload) {
                        handleOptionSelect(action.payload);
                    }
                    break;
                case 'INPUT_CHANGE':
                    setInputText(action.payload);
                    break;
                case 'ATTACHMENT_PRESS':
                case 'OPEN_ATTACHMENT_PICKER':
                    attachmentPickerRef.current?.present();
                    break;
                case 'CLOSE_ATTACHMENT_PICKER':
                    attachmentPickerRef.current?.dismiss();
                    break;
                case 'VOICE_PRESS':
                    audioRecorderRef.current?.present();
                    break;
                case 'REMOVE_ATTACHMENT':
                    setAttachments(prev => prev.filter(a => a.id !== action.payload));
                    break;
                case 'PHOTO_PRESS':
                    (async () => {
                        try {
                            const result = await launchImageLibrary({
                                mediaType: 'photo',
                                selectionLimit: 1,
                                quality: 0.8,
                            });

                            uploadPhoto(result);
                        } catch (error) {
                            console.error('Error picking image:', error);
                            dispatchRedux(setToastProps(genericErrorToastProps('Failed to pick image')));
                        }
                    })();
                    break;
                case 'PHOTO_OPTIONS_PRESS':
                    // On Android, show an alert to choose between Camera and Gallery
                    // On iOS, launchImageLibrary automatically shows both options
                    Alert.alert(
                        'Choose Photo',
                        'Select a photo from:',
                        [
                            {
                                text: 'Camera',
                                onPress: () => {
                                    // Trigger camera
                                    resolver({ type: 'TAKE_PHOTO_PRESS', payload: undefined });
                                },
                            },
                            {
                                text: 'Gallery',
                                onPress: () => {
                                    // Trigger gallery
                                    resolver({ type: 'PHOTO_PRESS', payload: undefined });
                                },
                            },
                            {
                                text: 'Cancel',
                                style: 'cancel',
                            },
                        ],
                        { cancelable: true },
                    );
                    break;
                case 'TAKE_PHOTO_PRESS':
                    (async () => {
                        try {
                            const cameraPermission =
                                Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;
                            const permissionStatus = await check(cameraPermission);

                            if (permissionStatus !== RESULTS.GRANTED) {
                                const requestStatus = await request(cameraPermission);
                                if (requestStatus !== RESULTS.GRANTED) {
                                    dispatchRedux(
                                        setToastProps(
                                            genericErrorToastProps('Permission to access camera is required'),
                                        ),
                                    );
                                    return;
                                }
                            }

                            const result = await launchCamera({
                                mediaType: 'photo',
                                saveToPhotos: true,
                                quality: 0.8,
                            });
                            uploadPhoto(result);
                        } catch {
                            dispatchRedux(setToastProps(genericErrorToastProps('Failed to launch camera')));
                        }
                    })();
                    break;
                case 'CLOSE_RECORDER': {
                    audioRecorderRef.current?.dismiss();
                    break;
                }
                case 'SUBMIT_ISSUE': {
                    if (!inputText.trim() && attachments.length === 0) {
                        return;
                    }

                    const currentTime = new Date().toISOString();
                    const textContent = inputText.trim();
                    const textMessageArr: MessageItem[] = textContent
                        ? [
                              {
                                  id: ``,
                                  type: 'IssueDescription',
                                  text: textContent,
                                  timestamp: currentTime,
                              },
                          ]
                        : [];

                    const mediaMessageArr: MessageItem[] = attachments.map(a => ({
                        id: a.fileId,
                        type: 'MediaFile',
                        text: 'Media attachment',
                        timestamp: new Date(Date.now() + 1).toISOString(),
                        mediaFiles: [a],
                    }));

                    const messagesToAdd = [...textMessageArr, ...mediaMessageArr];

                    // Collect IDs for API
                    const uploadedFileIds = attachments.filter(a => !!a.fileId).map(a => a.fileId);

                    setMessages(prev => [...prev, ...messagesToAdd]);
                    setInputText('');
                    setAttachments([]);
                    setIsSubmitted(true);

                    try {
                        const issueRequest: ApiIssueReportReq = {
                            categoryId: categoryId,
                            chats: [...messages]
                                .filter(m => m.type !== 'MediaFile' && m.type !== 'IssueDescription')
                                .map(m => ({
                                    chatId: m.id,
                                    timestamp: m.timestamp,
                                    chatType: m.type,
                                })),
                            createTicket: true,
                            description: textContent || 'Issue report',
                            mediaFiles: uploadedFileIds,
                            optionId: selectedOptionId || undefined,
                            rideId: rideId || undefined,
                            ticketBookingId: undefined,
                        };

                        await submitIssue({
                            language: 'en',
                            body: issueRequest,
                        })
                            .unwrap()
                            .then(res => {
                                if (res.messages && res.messages[0]) {
                                    const newMessage: MessageItem = {
                                        id: res.messages[0].id,
                                        type: 'IssueMessage',
                                        text: res.messages[0].message,
                                        timestamp: new Date().toISOString(),
                                    };

                                    setMessages(prev => [...prev, newMessage]);
                                }
                            });
                    } catch {
                        dispatchRedux(setToastProps(genericErrorToastProps('Failed to submit issue')));
                        setIsSubmitted(false);
                    }
                    break;
                }
                case 'HANDLE_BACKPRESS':
                    navigation.goBack();
                    break;
                case 'RECORDING_COMPLETE':
                    if (action.payload) {
                        const audioUploadLimit = mandatoryUploads.find(u => u.fileType === 'Audio')?.limit || 5;
                        const currentAudioCount = attachments.filter(a => a._type === 'Audio').length;

                        if (currentAudioCount < audioUploadLimit) {
                            const url = action.payload + `${Platform.OS == 'ios' ? '' : '.mp3'}`;

                            try {
                                const uploadRes = await sendFile(
                                    `audio_recording.${Platform.OS == 'ios' ? '' : 'mp3'}`,
                                    url,
                                    `audio/mpeg`,
                                );

                                const data = safeJsonParse(uploadRes.body, { fileId: '' });

                                const newAttachment: MediaFile = {
                                    _type: 'Audio',
                                    id: data.fileId,
                                    url: url,
                                    fileId: data.fileId,
                                };
                                setAttachments(prev => [...prev, newAttachment]);
                            } catch {
                                dispatchRedux(setToastProps(genericErrorToastProps('Failed to upload audio')));
                            }
                        } else {
                            dispatchRedux(
                                setToastProps(
                                    genericErrorToastProps(`Limit of ${audioUploadLimit} audio files reached`),
                                ),
                            );
                        }
                    }
                    audioRecorderRef.current?.dismiss();
                    break;
                case 'CLOSE_INPUT':
                    setShowInput(false);
                    break;
                case 'STILL_HAVE_ISSUE_CLICKED':
                    try {
                        const res = await updateIssueStatus({
                            issueId: issueReportId || '',
                            language: languageStr,
                            body: { status: 'REOPENED', customerRating: undefined, customerResponse: undefined },
                        }).unwrap();
                        updateBotMessage(res.messages);
                        setShowStillHaveIssue(false);
                        setStatus('REOPENED');
                    } catch {
                        dispatchRedux(setToastProps(genericErrorToastProps('Failed to reopen')));
                    }
                    break;
            }
        },
        [
            navigation,
            inputText,
            categoryId,
            messages,
            selectedOptionId,
            attachments,
            submitIssue,
            dispatchRedux,
            rideId,
            mandatoryUploads,
            attachmentPickerRef,
            audioRecorderRef,
            issueReportId,
            updateIssueStatus,
        ],
    );

    const dispatch = useMemo(() => createDispatcher(resolver), [resolver]);

    return (
        <ReportIssueChatUI
            messages={messages}
            options={options}
            showInput={showInput}
            inputText={inputText}
            dispatch={dispatch}
            attachments={attachments}
            loading={isUploading || isSubmitting || optionLoading || issueInfoLoading}
            isSubmitted={isSubmitted}
            mandatoryUploads={mandatoryUploads}
            attachmentPickerRef={attachmentPickerRef}
            audioRecorderRef={audioRecorderRef}
            showStillHaveIssue={showStillHaveIssue}
            status={status}
        />
    );
};
