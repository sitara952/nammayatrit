import { useConfigContext } from '@/typescript/context/ConfigContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { useState } from 'react';
import { Alert, View, ActivityIndicator, InteractionManager } from 'react-native';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import Animated, {
    interpolate,
    runOnJS,
    SharedValue,
    useAnimatedReaction,
    useAnimatedStyle,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Camera, CameraType } from 'react-native-camera-kit';
import { QRScannerFrame } from './QRScannerFrame';
import { useHaptic } from '@/src-v2/utils/useHaptic';
import * as Haptics from 'react-native-haptic-feedback';
import { useCameraPermission } from '@/src-v2/hooks/useCameraPermission';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useIsFocused } from '@react-navigation/native';
import { logEvent, EventName } from '@/typescript/utils/logger';

const extractFValue = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('f');
    } catch {
        return null;
    }
};

export const CameraView = ({
    setOtp,
    onCompleteOtp,
    beforeOtpComplete,
    scanOtpRef,
    sheetAnimatedIndex,
}: {
    setOtp: (otp: string) => void;
    onCompleteOtp: (otp: string) => void;
    beforeOtpComplete: () => void;
    scanOtpRef: React.MutableRefObject<boolean>;
    sheetAnimatedIndex: SharedValue<number>;
}) => {
    const [isCameraVisible, setIsCameraVisible] = useState(false);
    const { permissionStatus, isPermissionGranted, requestPermission, openSettings, isLoading } =
        useCameraPermission(200);
    const haptics = useHaptic(Haptics.HapticFeedbackTypes.selection, {
        enableVibrateFallback: true,
        ignoreAndroidSystemSettings: false,
    });
    const isFocus = useIsFocused();
    const [interactionsCompleted, setInteractionsCompleted] = useState(false);

    InteractionManager.runAfterInteractions(() => {
        setInteractionsCompleted(true);
    });

    useAnimatedReaction(
        () => sheetAnimatedIndex.value,
        (newValue, oldValue) => {
            if (oldValue !== null && Math.round(newValue) !== Math.round(oldValue)) {
                if (Math.round(newValue) >= 1) {
                    runOnJS(setIsCameraVisible)(false);
                } else {
                    runOnJS(setIsCameraVisible)(true);
                }
            }
        },
    );

    const { top } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const animatedBackdropStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(sheetAnimatedIndex.value, [0, 1], [0, 0.7]),
        };
    });

    const renderFallbackContent = () => {
        if (isLoading) {
            return (
                <View style={tailwind.style('absolute inset-0 bg-black')}>
                    <View style={tailwind.style('absolute top-0 left-0 right-0 h-1/3 justify-center items-center')}>
                        <ActivityIndicator size="small" color="white" />
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-white text-center mt-4 text-sm')}
                            numberOfLines={1}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Checking camera permission"
                            accessibilityRole="text">
                            {userLanguageStrings.CheckingCameraPermission}
                        </Typography>
                    </View>
                </View>
            );
        }

        if (permissionStatus === 'denied') {
            return (
                <View style={tailwind.style('absolute inset-0 bg-black')}>
                    <View
                        style={tailwind.style('absolute top-0 left-0 right-0 h-1/3 justify-center items-center px-4')}>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-white text-center mb-2 text-base font-semibold')}
                            numberOfLines={2}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Camera permission required"
                            accessibilityRole="text">
                            {userLanguageStrings.CameraPermissionRequired}
                        </Typography>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-gray-300 text-center mb-3 text-sm')}
                            numberOfLines={2}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="We need camera access to scan QR codes"
                            accessibilityRole="text">
                            {userLanguageStrings.WeNeedCameraAccessToScanQRCodes}
                        </Typography>
                        <TouchableOpacity
                            onPress={requestPermission}
                            style={tailwind.style('bg-blue-600 px-4 py-2 rounded-lg')}
                            accessibilityRole="button"
                            accessibilityLabel="Grant camera permission"
                            accessibilityHint={userLanguageStrings.TapToGrantCameraPermissionForQrCodeScanning}
                            testID="grant-camera-permission-button">
                            <Typography
                                type="body-7"
                                style={tailwind.style('text-white font-medium text-sm')}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Grant permission"
                                accessibilityRole="text">
                                {userLanguageStrings.GrantPermission}
                            </Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        if (permissionStatus === 'blocked') {
            return (
                <View style={tailwind.style('absolute inset-0 bg-black')}>
                    <View
                        style={tailwind.style('absolute top-0 left-0 right-0 h-1/3 justify-center items-center px-4')}>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-white text-center mb-2 text-base font-semibold')}
                            numberOfLines={2}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Camera permission blocked"
                            accessibilityRole="text">
                            {userLanguageStrings.CameraPermissionBlocked}
                        </Typography>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-gray-300 text-center mb-3 text-sm')}
                            numberOfLines={2}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Please enable camera in settings"
                            accessibilityRole="text">
                            {userLanguageStrings.PleaseEnableCameraInSettings}
                        </Typography>
                        <Pressable
                            onPress={() => {
                                console.info('Open Settings button pressed');
                                openSettings();
                            }}
                            style={tailwind.style('bg-blue-600 px-4 py-2 rounded-lg')}
                            accessibilityRole="button"
                            accessibilityLabel="Open app settings button"
                            accessibilityHint={userLanguageStrings.TapToOpenAppSettingsToEnableCameraPermission}
                            testID="open-settings-button">
                            <Typography
                                type="body-7"
                                style={tailwind.style('text-white font-medium text-sm')}
                                numberOfLines={1}
                                isAnimate={false}
                                accessible={true}
                                accessibilityLabel="Open settings"
                                accessibilityRole="text">
                                {userLanguageStrings.OpenSettings}
                            </Typography>
                        </Pressable>
                    </View>
                </View>
            );
        }

        if (permissionStatus === 'unavailable') {
            return (
                <View style={tailwind.style('absolute inset-0 bg-black')}>
                    <View
                        style={tailwind.style('absolute top-0 left-0 right-0 h-1/3 justify-center items-center px-4')}>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-white text-center mb-2 text-base font-semibold')}
                            numberOfLines={2}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Camera not available"
                            accessibilityRole="text">
                            {userLanguageStrings.CameraNotAvailable}
                        </Typography>
                        <Typography
                            type="body-7"
                            style={tailwind.style('text-gray-300 text-center text-sm')}
                            numberOfLines={2}
                            isAnimate={false}
                            accessible={true}
                            accessibilityLabel="Camera is not available on this device"
                            accessibilityRole="text">
                            {userLanguageStrings.CameraIsNotAvailableOnThisDevice}
                        </Typography>
                    </View>
                </View>
            );
        }

        return (
            <View style={tailwind.style('absolute inset-0 bg-black')}>
                <View style={tailwind.style('absolute top-0 left-0 right-0 h-1/3 justify-center items-center')}>
                    <Typography
                        type="body-7"
                        style={tailwind.style('text-white text-center text-sm')}
                        numberOfLines={1}
                        isAnimate={false}
                        accessible={true}
                        accessibilityLabel="Loading camera"
                        accessibilityRole="text">
                        {userLanguageStrings.LoadingCamera}
                    </Typography>
                </View>
            </View>
        );
    };

    // eslint-disable-next-line myCustomPlugin/no-any-in-modified-files
    const onReadCode = (data: any) => {
        if (scanOtpRef.current && data.nativeEvent.codeStringValue.length > 0) {
            const busFleetCode = extractFValue(data.nativeEvent.codeStringValue || '');
            if (busFleetCode) {
                scanOtpRef.current = false;
                beforeOtpComplete();
                setOtp(busFleetCode);
                setTimeout(() => {
                    onCompleteOtp(busFleetCode);
                    logEvent(EventName.NY_BUS_OTP_SCANNED);
                }, 200);
                haptics?.();
            } else {
                Alert.alert(userLanguageStrings.UnableToReadOtpTryEntering);
            }
        }
    };

    return (
        <>
            {isFocus && isPermissionGranted && interactionsCompleted && isCameraVisible ? (
                <Camera
                    style={tailwind.style('absolute inset-0 bg-black')}
                    cameraType={CameraType.Back}
                    scanBarcode={true}
                    resizeMode="cover"
                    onReadCode={onReadCode}
                    zoom={1.5}
                />
            ) : (
                renderFallbackContent()
            )}
            {isPermissionGranted && <QRScannerFrame translateY={top + 100} />}
            {isPermissionGranted && (
                <Animated.View
                    style={[tailwind.style('absolute inset-0 bg-black z-0'), animatedBackdropStyle]}></Animated.View>
            )}
        </>
    );
};
