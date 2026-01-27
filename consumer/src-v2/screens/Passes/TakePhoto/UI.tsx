import { Pressable } from '@/src-v2/primitives/Pressable';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import { RefObject } from 'react';
import { Platform, Text, View, ActivityIndicator } from 'react-native';
import { Camera, CameraApi, CameraType } from 'react-native-camera-kit';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { CameraPermissionStatus } from '@/src-v2/utils/cameraPermissions';
import { useStatusBarColor } from '@/src-v2/hooks/useStatusbarcolor';
import { OfferCard } from '@/src-v2/multimodal/components/offers/OfferCard';
import { RetakeIconSvg } from '@/src-v2/assets/svg/RetakeIcon';
import { cumulativeOfferResp } from '@/readOnly/api/types/CumulativeOfferResp.gen';
import { formatDateToString, toOrdinalDate } from '../BusPass/utils/passUtils';

interface TakePhotoUIProps {
    capturedPhoto: string | null;
    onClose: () => void;
    onConfirmAndPay: () => void;
    onRetakePhoto: () => void;
    onCapturePhoto: () => Promise<void>;
    cameraRef: RefObject<CameraApi | null>;
    passAmount: number;
    permissionStatus: CameraPermissionStatus;
    isPermissionGranted: boolean;
    requestPermission: () => Promise<void>;
    openSettings: () => void;
    isLoading: boolean;
    isUpdatingProfile: boolean;
    hideLoader: boolean;
    offer: cumulativeOfferResp | undefined;
    uploadMode?: boolean;
    startDate: Date;
}

const CloseIcon = () => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <Path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

const PersonGuideIcon = () => (
    <Svg width={179} height={172} viewBox="0 0 179 172" fill="none">
        <Path
            d="M131.48 21.407c-10.142-11.888-25.233-19.43-42.084-19.43-16.851 0-31.942 7.542-42.078 19.43C28.62 40.837 27.663 72.6 30.566 91.282c3.547 22.818 21.645 69.111 58.83 69.111s55.288-46.293 58.83-69.111c2.904-18.682 1.946-50.444-16.751-69.875h.005z"
            stroke="#FBFBFB"
            strokeWidth={3.95293}
            strokeMiterlimit={10}
        />
        <Path
            d="M53.334 157.719c-15.12 1.137-41.739 7.203-52.494 12.257"
            stroke="url(#paint0_linear_5475_6047)"
            strokeWidth={3.95293}
            strokeMiterlimit={10}
        />
        <Path
            d="M125.465 157.719c15.12 1.137 41.739 7.203 52.495 12.257"
            stroke="url(#paint1_linear_5475_6047)"
            strokeWidth={3.95293}
            strokeMiterlimit={10}
        />
        <Defs>
            <LinearGradient
                id="paint0_linear_5475_6047"
                x1={34.8398}
                y1={163.977}
                x2={3.33984}
                y2={170.723}
                gradientUnits="userSpaceOnUse">
                <Stop stopColor="#FBFBFB" />
                <Stop offset={1} stopColor="#FBFBFB" stopOpacity={0} />
            </LinearGradient>
            <LinearGradient
                id="paint1_linear_5475_6047"
                x1={125.465}
                y1={163.847}
                x2={177.96}
                y2={163.847}
                gradientUnits="userSpaceOnUse">
                <Stop stopColor="#FBFBFB" />
                <Stop offset={1} stopColor="#FBFBFB" stopOpacity={0} />
            </LinearGradient>
        </Defs>
    </Svg>
);

export const TakePhotoUI: React.FC<TakePhotoUIProps> = ({
    capturedPhoto,
    onClose,
    onConfirmAndPay,
    onRetakePhoto,
    onCapturePhoto,
    cameraRef,
    passAmount,
    permissionStatus,
    isPermissionGranted,
    requestPermission,
    openSettings,
    isLoading,
    isUpdatingProfile,
    hideLoader,
    offer,
    uploadMode,
    startDate,
}) => {
    const { top, bottom } = useSafeAreaInsets();
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    useStatusBarColor(true);
    return (
        <Animated.View layout={LinearTransition} style={tailwind.style(`flex-1 bg-[#323232] pt-[${top}px]`)}>
            {/* Header */}
            <View style={tailwind.style('flex-row justify-between items-center px-6 pt-4 pb-2')}>
                <Pressable
                    accessibilityRole="button"
                    testID="close-button"
                    onPress={onClose}
                    accessibilityLabel="Close button"
                    style={tailwind.style('w-8 h-8 items-center justify-center')}>
                    <CloseIcon />
                </Pressable>

                <Text style={tailwind.style('text-[#C9C9C9] text-[18px] font-areaNormal-extrabold')}>
                    {userLanguageStrings.CapturePhoto}
                </Text>

                <View style={tailwind.style('w-8')} />
            </View>

            {/* Main Content Area */}
            <View style={tailwind.style(`flex-1 items-center justify-start px-6 pt-${offer ? '2' : '16'}`)}>
                {/* Circular Photo Frame */}
                <View style={tailwind.style('relative')}>
                    <View
                        style={tailwind.style(
                            `w-64 h-64 rounded-full overflow-hidden border-[10px] border-[${capturedPhoto ? '#09941E' : '#4b4a4c'}] items-center justify-center bg-gray-100`,
                        )}>
                        {capturedPhoto ? (
                            /* Display captured photo */
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="captured photo image"
                                entering={FadeIn.duration(700)}
                                exiting={FadeOut.duration(700)}
                                source={{ uri: capturedPhoto }}
                                style={tailwind.style('w-84 h-84 rounded-full transform rotate-y-[180deg]')}
                                resizeMode="contain"
                            />
                        ) : (
                            /* Camera view or permission fallback */
                            <View
                                style={tailwind.style(
                                    `w-84 h-84 rounded-full ${isPermissionGranted ? 'overflow-hidden' : 'overflow-visible'}`,
                                )}>
                                {isPermissionGranted ? (
                                    <Camera
                                        ref={cameraRef}
                                        cameraType={CameraType.Front}
                                        flashMode="off"
                                        zoom={Platform.OS === 'ios' ? 1.2 : 1.0}
                                        style={tailwind.style('w-full h-full')}
                                        onOrientationChange={() => {}}
                                        resetFocusTimeout={0}
                                        resetFocusWhenMotionDetected={false}
                                    />
                                ) : (
                                    <View
                                        style={tailwind.style(
                                            'w-full h-full bg-gray-800 rounded-full items-center justify-center',
                                        )}>
                                        {isLoading ? (
                                            <ActivityIndicator size="small" color="white" />
                                        ) : permissionStatus === 'denied' ? (
                                            <View style={tailwind.style('items-center px-4')}>
                                                <Text style={tailwind.style('text-white text-sm text-center mb-4')}>
                                                    {userLanguageStrings.CameraPermissionRequired}
                                                </Text>
                                                <Pressable
                                                    onPress={requestPermission}
                                                    style={tailwind.style(
                                                        'bg-blue-600 px-6 py-3 rounded-lg min-h-[44px] min-w-[120px] items-center justify-center',
                                                    )}
                                                    accessibilityRole="button"
                                                    accessibilityLabel="Grant camera permission"
                                                    testID="grant-camera-permission-button">
                                                    <Text style={tailwind.style('text-white text-sm font-medium')}>
                                                        {userLanguageStrings.GrantPermission}
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        ) : permissionStatus === 'blocked' ? (
                                            <View style={tailwind.style('items-center px-4')}>
                                                <Text style={tailwind.style('text-white text-sm text-center mb-2')}>
                                                    {userLanguageStrings.PermissionBlocked}
                                                </Text>
                                                <Text
                                                    style={tailwind.style(
                                                        'text-white text-xs text-center mb-4 opacity-80',
                                                    )}>
                                                    {userLanguageStrings.PleaseEnableCameraAccessInSettings}
                                                </Text>
                                                <Pressable
                                                    onPress={async () => {
                                                        try {
                                                            await openSettings();
                                                        } catch (error) {
                                                            console.error('Failed to open settings:', error);
                                                        }
                                                    }}
                                                    style={tailwind.style(
                                                        'bg-blue-600 px-6 py-3 rounded-lg min-h-[44px] min-w-[120px] items-center justify-center',
                                                    )}
                                                    accessibilityRole="button"
                                                    accessibilityLabel="Open app settings"
                                                    testID="open-settings-button">
                                                    <Text style={tailwind.style('text-white text-sm font-medium')}>
                                                        {userLanguageStrings.OpenSettings}
                                                    </Text>
                                                </Pressable>
                                            </View>
                                        ) : (
                                            <Text style={tailwind.style('text-white text-sm text-center')}>
                                                {permissionStatus === 'unavailable'
                                                    ? userLanguageStrings.CameraUnavailable
                                                    : userLanguageStrings.LoadingCamera}
                                            </Text>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>

                    {/* Person Guide Overlay - Only show when no photo is captured and permission is granted */}
                    {!capturedPhoto && isPermissionGranted && (
                        <Animated.View
                            entering={FadeIn.duration(400)}
                            exiting={FadeOut.duration(400)}
                            style={tailwind.style('absolute inset-0 items-center justify-center pointer-events-none')}>
                            <PersonGuideIcon />
                        </Animated.View>
                    )}
                </View>

                {/* Instructions */}
                <View style={tailwind.style('mt-8 items-center')}>
                    <Text style={tailwind.style('text-white text-[16px] font-areaNormal-medium text-center mb-2')}>
                        {userLanguageStrings.YourFaceShouldBeClearlyVisible}
                    </Text>
                    <Text style={tailwind.style('text-white text-[16px] font-areaNormal-medium text-center')}>
                        {userLanguageStrings.CantChangeAfterPayment}
                    </Text>
                </View>
                {/* Retake Photo Button */}
                {capturedPhoto && (
                    <Animated.View
                        style={tailwind.style('w-full justify-end pt-4')}
                        entering={FadeIn.delay(200).duration(400)}
                        exiting={FadeOut.duration(300)}>
                        <Pressable
                            accessibilityRole="button"
                            testID="retake-photo-button"
                            accessibilityLabel="Retake Photo button"
                            onPress={onRetakePhoto}
                            style={tailwind.style(
                                'bg-[#3B3A3C] rounded-[16px] py-5 flex-row items-center justify-center',
                            )}>
                            <RetakeIconSvg />
                            <Text style={tailwind.style('text-[#FFFFFF] text-[15px] font-areaNormal-extrabold ml-2')}>
                                {userLanguageStrings.RetakePhoto}
                            </Text>
                        </Pressable>
                    </Animated.View>
                )}
            </View>

            {/* Bottom Sheet - Only show when photo is captured */}

            <Animated.View
                layout={LinearTransition}
                style={tailwind.style(
                    `relative bg-white rounded-t-3xl px-6 pt-[25px] pb-[${bottom}px] absolute bottom-0 w-full `,
                )}>
                <Text style={tailwind.style('text-[#656565] text-[18px] font-areaNormal-extrabold text-center mb-4')}>
                    {userLanguageStrings.BuyBusPass}
                </Text>

                {offer ? (
                    <Animated.View style={tailwind.style('w-full')}>
                        <OfferCard offer={offer} onPress={() => {}} variant="ghost" />
                    </Animated.View>
                ) : null}

                {/* Confirm & Pay Button */}
                <View
                    style={tailwind.style(
                        'w-full bg-gray-100 rounded-xl py-3 px-4 flex-row items-center justify-center mb-3',
                    )}>
                    <Text style={tailwind.style('text-gray-600 text-[13px] font-areaNormal-extrabold mr-1')}>
                        Pass Valid from
                    </Text>
                    <Text style={tailwind.style('text-gray-600 text-[13px] font-areaNormal-extrabold')}>
                        {toOrdinalDate(formatDateToString(startDate))}
                    </Text>
                </View>

                <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(200)} key="capture-button">
                    <Pressable
                        accessibilityRole="button"
                        testID="capture-confirm-button"
                        accessibilityLabel="Capture Photo button"
                        onPress={!capturedPhoto ? onCapturePhoto : onConfirmAndPay}
                        style={tailwind.style('bg-[#047AEA] rounded-[16px] py-5')}>
                        {isUpdatingProfile || hideLoader ? (
                            <LottieWithFallback
                                fallback={undefined}
                                style={tailwind.style('w-[40px] h-[30px] m-auto')}
                                source={require('@/typescript/assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                                autoPlay
                                loop
                            />
                        ) : (
                            <Text
                                style={tailwind.style('text-white text-[15px] font-areaNormal-extrabold text-center')}>
                                {!capturedPhoto
                                    ? userLanguageStrings.CapturePhoto
                                    : uploadMode
                                      ? userLanguageStrings.ConfirmPhoto
                                      : `${userLanguageStrings.ConfirmAndPay} ₹${passAmount}`}
                            </Text>
                        )}
                    </Pressable>
                </Animated.View>
            </Animated.View>
        </Animated.View>
    );
};
