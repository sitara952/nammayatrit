import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TakePhotoUI } from './UI';
import { CameraApi } from 'react-native-camera-kit';
import { MainNavigationParamList, PassesTabParamList } from '@/typescript/navigation/globalParamList';
import { useMultimodalPassPassIdSelectPostMutation } from '@/api/integrations/rtk/MultimodalPassPassIdSelectPost.ts';
import { useMultimodalPassUploadProfilePicturePostMutation } from '@/api/integrations/rtk/MultimodalPassUploadProfilePicturePost';
import HyperSdkReact from 'hyper-sdk-react';
import RNFS from 'react-native-fs';
import { Image as CompressorImage } from 'react-native-compressor';
import { useAppSelector, useAppDispatch } from '@/typescript/state/hooks';
import { selectUserId } from '@/typescript/state/client/user';
import {
    selectAppReadableName,
    selectHideLoader,
    selectNewFeatureFlags,
    setHideLoader,
} from '@/typescript/state/client/session';
import { MMKVKey, setStringItem } from '@/typescript/utils/MMKV';
import { createOrderResp } from '@/readOnly/api/types/CreateOrderResp.gen';
import { useCameraPermission } from '@/src-v2/hooks/useCameraPermission';
import { NativeModules } from 'react-native';
import { checkAndInitiatePayment } from '@/src-v2/utils/Payment';
import { useKeyboardController } from 'react-native-keyboard-controller';
import { EventName, EventPrefix, logEvent, logPrefixEvent } from '@/typescript/utils/logger';
import { getPassProfilePicture } from '../BusPass/utils/passCache';
import { generatePassProductSummary } from '@/src-v2/multimodal/screens/JourneyInfoScreen/components/PassProductSummary';

const { AppInfoModule } = NativeModules;

export const TakePhotoFlow: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<MainNavigationParamList>>();
    const route = useRoute<RouteProp<PassesTabParamList, 'takePhoto'>>();
    const { selectedPass, date, offer, uploadMode, purchasedPassId } = route.params;
    const cameraRef = useRef<CameraApi>(null);
    const appReadableName = useAppSelector(selectAppReadableName);
    const personId = useAppSelector(selectUserId);
    const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
    const [imeiNumber, setImeiNumber] = useState<string | undefined>(undefined);

    const dispatch = useAppDispatch();

    const hideLoader = useAppSelector(selectHideLoader);

    const [selectPassMutation] = useMultimodalPassPassIdSelectPostMutation();
    const [uploadProfilePictureMutation] = useMultimodalPassUploadProfilePicturePostMutation();
    const isUpdatingProfile = false;
    const { setEnabled } = useKeyboardController();
    // Convert UTC to IST Start Date (UTC+5:30)
    const utcStartDate = date?.startDate;
    const istStartDate = utcStartDate
        ? new Date(utcStartDate.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000)
        : new Date();

    // Convert UTC to IST Enf Date (UTC+5:30)
    const utcEndDate = date?.endDate;
    const istEndDate = utcEndDate ? new Date(utcEndDate.getTime() + 5 * 60 * 60 * 1000 + 30 * 60 * 1000) : new Date();

    const formatDateDDMMYYYY = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    const { permissionStatus, isPermissionGranted, requestPermission, openSettings, isLoading } =
        useCameraPermission(200);
    const newFeatureFlags = useAppSelector(selectNewFeatureFlags);

    useEffect(() => {
        const fetchDeviceId = async () => {
            try {
                const id = await AppInfoModule.getUTSId();
                setImeiNumber(id);
                console.info('Device ID fetched:', id);
            } catch (error) {
                console.error('Error fetching device ID:', error);
                setImeiNumber(undefined);
            }
        };

        fetchDeviceId();
    }, []);

    useEffect(() => {
        const passProfilePicture = getPassProfilePicture();
        if (passProfilePicture) {
            setCapturedPhoto(passProfilePicture);
        }
    }, []);

    const checkAndInitiate = async () => {
        await checkAndInitiatePayment(appReadableName, personId || '');
    };

    const processPayment = async (paymentOrder: createOrderResp, _purchasedPassId: string) => {
        console.error('paymentOrder: ', paymentOrder);
        console.info('istStartDate: ', istStartDate.toISOString().split('T')[0]);
        console.info('istEndDate: ', istEndDate.toISOString().split('T')[0]);

        const sdkPayload = paymentOrder.sdk_payload;
        const existingInner = sdkPayload.payload ?? {};
        const productSummary = generatePassProductSummary({
            validFrom: 'Valid from ' + formatDateDDMMYYYY(istStartDate),
            validTill: 'Valid till ' + formatDateDDMMYYYY(istEndDate),
        });
        const payload = {
            ...sdkPayload,
            payload: {
                ...existingInner,
                lastName: 'test' + Date.now(),
                features: { paymentWidget: { enable: true } },
                productSummary: productSummary,
                action: 'paymentPage',
                udf1: newFeatureFlags.enableHyperUPI ? 'hyperupi' : '',
            },
        };
        console.info('Payment payload prepared:', payload);

        try {
            setEnabled(false);
            await checkAndInitiate();
            HyperSdkReact.process(JSON.stringify(payload), 'paymentPage');
            setStringItem(MMKVKey.PAYMENT_PAGE_PAYLOAD, JSON.stringify(payload));
        } catch (err) {
            console.warn('Failed to process HyperSDK payload:', err);
            dispatch(setHideLoader(false));
        }
    };

    const handleClose = () => {
        navigation.goBack();
    };

    const handleConfirmAndPay = useCallback(async () => {
        if (uploadMode) {
            if (!purchasedPassId) {
                console.error('No purchased pass ID');
                return;
            }
            try {
                dispatch(setHideLoader(true));
                logPrefixEvent(EventPrefix.USER_CAPTURE_PHOTO, 'upload_start');

                if (!imeiNumber) {
                    console.error('IMEI Number is null');
                    dispatch(setHideLoader(false));
                    return;
                }

                const result = await uploadProfilePictureMutation({
                    body: {
                        purchasedPassId: purchasedPassId,
                        imeiNumber: imeiNumber,
                        profilePicture: capturedPhoto ?? '',
                    },
                }).unwrap();

                console.info('Upload Result:', result);
                logPrefixEvent(EventPrefix.USER_CAPTURE_PHOTO, 'upload_success');
                dispatch(setHideLoader(false));
                navigation.goBack();
            } catch (error) {
                console.error('Error uploading photo:', error);
                logPrefixEvent(EventPrefix.USER_CAPTURE_PHOTO, 'upload_failure');
                dispatch(setHideLoader(false));
            }
            return;
        }

        if (!selectedPass?.id) {
            console.error('No pass selected');
            return;
        }
        try {
            dispatch(setHideLoader(true));
            logPrefixEvent(EventPrefix.USER_BP_CONFIRM_AND_PAY, selectedPass.id.toString());
            // Call selectPass API to initiate purchase
            if (!imeiNumber) {
                console.error('IMEI Number is null');
                dispatch(setHideLoader(false));
                return;
            }
            const result = await selectPassMutation({
                passId: selectedPass.id,
                body: {
                    startDate: istStartDate.toISOString().split('T')[0],
                    imeiNumber: imeiNumber,
                    profilePicture: capturedPhoto ?? undefined,
                },
            })
                .unwrap()
                .then(result => {
                    console.info('Result:', result);
                    logPrefixEvent(EventPrefix.USER_CAPTURE_PHOTO, 'success');
                    return result;
                })
                .catch(error => {
                    logPrefixEvent(EventPrefix.USER_CAPTURE_PHOTO, 'failure');
                    console.error('Error:', error);
                    return undefined;
                });

            if (result) {
                const { paymentOrder: order, purchasedPassId: passId } = result;
                if (order && passId) {
                    console.info('Decoded payment order:', order);
                    await processPayment(order, passId);
                }
            }
        } catch (error) {
            console.error('Error initiating pass purchase:', error);
            dispatch(setHideLoader(false));
        }

        return () => {
            setEnabled(true);
        };
    }, [
        selectedPass?.id,
        imeiNumber,
        istStartDate,
        processPayment,
        setEnabled,
        uploadMode,
        purchasedPassId,
        capturedPhoto,
        uploadProfilePictureMutation,
        dispatch,
        navigation,
    ]);

    const handleRetakePhoto = () => {
        logEvent(EventName.USER_RETAKE_PHOTO);
        setCapturedPhoto(null);
    };

    const handleCapturePhoto = async () => {
        if (cameraRef.current) {
            try {
                const photo = await cameraRef.current.capture();

                if (photo?.uri) {
                    const compressAndReadBase64 = async (uri: string) => {
                        try {
                            if (CompressorImage && typeof CompressorImage.compress === 'function') {
                                const compressedUri = await CompressorImage.compress(uri, {
                                    compressionMethod: 'auto',
                                    quality: 0.7,
                                });
                                const cleaned = compressedUri.startsWith('file://')
                                    ? compressedUri.replace('file://', '')
                                    : compressedUri;
                                const base64 = await RNFS.readFile(cleaned, 'base64');
                                return `data:image/jpeg;base64,${base64}`;
                            }
                            // Fallback: simply read original file as base64
                            const cleanedFallback = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
                            const base64Fallback = await RNFS.readFile(cleanedFallback, 'base64');
                            return `data:image/jpeg;base64,${base64Fallback}`;
                        } catch (err) {
                            console.error('Error compressing image (fallback to original):', err);
                            const cleaned = uri.startsWith('file://') ? uri.replace('file://', '') : uri;
                            const base64 = await RNFS.readFile(cleaned, 'base64');
                            return `data:image/jpeg;base64,${base64}`;
                        }
                    };

                    const base64DataUri = await compressAndReadBase64(photo.uri);
                    setCapturedPhoto(base64DataUri);
                }
            } catch (error) {
                logPrefixEvent(EventPrefix.USER_CAPTURE_PHOTO, 'failure');
                console.error('Error capturing photo:', error);
                setCapturedPhoto(null);
            }
        }
    };

    return (
        <TakePhotoUI
            capturedPhoto={capturedPhoto}
            onClose={handleClose}
            isUpdatingProfile={isUpdatingProfile}
            onConfirmAndPay={handleConfirmAndPay}
            onRetakePhoto={handleRetakePhoto}
            onCapturePhoto={handleCapturePhoto}
            cameraRef={cameraRef}
            passAmount={selectedPass?.amount ?? 0}
            hideLoader={hideLoader}
            permissionStatus={permissionStatus}
            isPermissionGranted={isPermissionGranted}
            requestPermission={requestPermission}
            openSettings={openSettings}
            isLoading={isLoading}
            offer={offer}
            uploadMode={uploadMode}
            startDate={istStartDate}
        />
    );
};
