import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, Modal, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Path, G, Defs, ClipPath, Rect } from 'react-native-svg';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView, BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { useScaleAnimation } from '@/typescript/utils/useScaleAnimation';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface DeviceSwitchFlowProps {
    isVisible: boolean;
    onClose: () => void;
    onSwitchComplete?: () => void;
    onBuyNewPass?: () => void;
    onSwitchConfirm?: () => void | Promise<void>;
    deviceSwitchAllowed: boolean;
    isPolling?: boolean;
    showTerms: (x: boolean) => void;
}

type FlowStep = 'initial' | 'confirm' | 'completed';

export const DeviceSwitchFlow: React.FC<DeviceSwitchFlowProps> = ({
    isVisible,
    onClose,
    onSwitchComplete,
    onBuyNewPass,
    onSwitchConfirm,
    deviceSwitchAllowed,
    isPolling = false,
    showTerms,
}) => {
    const [currentStep, setCurrentStep] = useState<FlowStep>('initial');
    const bottomSheetRef = useRef<BottomSheet>(null);
    const snapPoints = useMemo(() => ['50%'], []);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');
    // Scale animations for all buttons
    const { handlers: switchNowHandlers, animatedStyle: switchNowAnimatedStyle } = useScaleAnimation();
    const { handlers: confirmHandlers, animatedStyle: confirmAnimatedStyle } = useScaleAnimation();
    const { handlers: skipHandlers, animatedStyle: skipAnimatedStyle } = useScaleAnimation();
    const { handlers: termsHandlers, animatedStyle: termsAnimatedStyle } = useScaleAnimation();
    const { handlers: buyPassHandlers, animatedStyle: buyPassAnimatedStyle } = useScaleAnimation();

    useEffect(() => {
        if (!deviceSwitchAllowed) {
            setCurrentStep('completed');
        }
    }, [deviceSwitchAllowed]);

    const _handleClose = () => {
        if (currentStep === 'confirm') {
            bottomSheetRef.current?.close();
        }
        setCurrentStep('initial');
        onClose();
    };

    const handleSwitchNow = () => {
        setCurrentStep('confirm');
        // Small delay to ensure modal closes before bottom sheet opens
        setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(0);
        }, 100);
    };

    const handleConfirm = async () => {
        // Call the switch confirm callback from parent
        if (onSwitchConfirm) {
            await onSwitchConfirm();
        }

        bottomSheetRef.current?.close();
        // Small delay to ensure bottom sheet closes before modal opens
        setTimeout(() => {
            setCurrentStep('completed');
            onSwitchComplete?.();
        }, 100);
    };

    const handleSkip = () => {
        bottomSheetRef.current?.close();
        setTimeout(() => {
            setCurrentStep('initial');
        }, 300);
    };

    const handleBuyNewPass = () => {
        onBuyNewPass?.();
    };

    const renderIcon = () => {
        if (currentStep === 'completed') {
            return (
                <View style={tailwind.style('mb-5 items-center justify-center')}>
                    <Svg width="39" height="58" viewBox="0 0 39 58" fill="none">
                        <Rect width="38.7776" height="57.4184" rx="6" fill="#E97F06" />
                        <Path d="M29.6607 36.2859H11.0078" stroke="white" strokeWidth="2.54821" strokeMiterlimit="10" />
                        <Path
                            d="M16.6605 29.6479C15.1188 32.0687 12.3413 34.7571 11.1946 35.8274C10.9143 36.0822 10.9143 36.5026 11.1946 36.7575C12.3286 37.815 15.1188 40.5161 16.6605 42.9369"
                            stroke="white"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                        />
                        <Path d="M9.78125 20.3596H28.4469" stroke="white" strokeWidth="2.54821" strokeMiterlimit="10" />
                        <Path
                            d="M22.7734 26.9979C24.3151 24.5771 27.0927 21.8887 28.2393 20.8185C28.5196 20.5637 28.5196 20.1432 28.2393 19.8884C27.1054 18.8309 24.3151 16.1298 22.7734 13.709"
                            stroke="white"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                        />
                    </Svg>
                </View>
            );
        }

        return (
            <View style={tailwind.style('mb-5 items-center justify-center')}>
                <Svg width="85" height="34" viewBox="0 0 85 34" fill="none">
                    <G clipPath="url(#clip0_6703_23638)">
                        <Path
                            d="M1.27344 5.09649V28.0304C1.27344 30.1454 2.98074 31.8527 5.09575 31.8527H16.5627C18.6777 31.8527 20.385 30.1454 20.385 28.0304V5.09649C20.385 2.98147 18.6777 1.27417 16.5627 1.27417H5.09575C2.98074 1.27417 1.27344 2.98147 1.27344 5.09649Z"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                            strokeLinecap="square"
                        />
                        <Path
                            d="M12.6638 6.5235H8.99442C8.99442 6.5235 8.91797 6.48527 8.91797 6.44705C8.91797 6.40883 8.95619 6.37061 8.99442 6.37061H12.6638C12.6638 6.37061 12.7403 6.40883 12.7403 6.44705C12.7403 6.48527 12.7021 6.5235 12.6638 6.5235Z"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                            strokeLinecap="square"
                        />
                        <Path
                            d="M63.6562 5.09649V28.0304C63.6562 30.1454 65.3636 31.8527 67.4786 31.8527H78.9455C81.0605 31.8527 82.7678 30.1454 82.7678 28.0304V5.09649C82.7678 2.98147 81.0605 1.27417 78.9455 1.27417H67.4786C65.3636 1.27417 63.6562 2.98147 63.6562 5.09649Z"
                            fill="#F5D329"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                            strokeLinecap="square"
                        />
                        <Path
                            d="M75.0467 6.5235H71.3772C71.3772 6.5235 71.3008 6.48527 71.3008 6.44705C71.3008 6.40883 71.339 6.37061 71.3772 6.37061H75.0467C75.0467 6.37061 75.1231 6.40883 75.1231 6.44705C75.1231 6.48527 75.0849 6.5235 75.0467 6.5235Z"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                            strokeLinecap="square"
                        />
                        <Path
                            d="M51.9576 23.2524H33.3047"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                        />
                        <Path
                            d="M38.9613 16.6145C37.4196 19.0353 34.6421 21.7237 33.4954 22.7939C33.2151 23.0487 33.2151 23.4692 33.4954 23.724C34.6293 24.7815 37.4196 27.4826 38.9613 29.9034"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                        />
                        <Path
                            d="M32.082 7.32617H50.7477"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                        />
                        <Path
                            d="M45.0742 13.9645C46.6159 11.5437 49.3934 8.85529 50.5401 7.78505C50.8204 7.53022 50.8204 7.10977 50.5401 6.85495C49.4062 5.79744 46.6159 3.09634 45.0742 0.675537"
                            stroke="#656565"
                            strokeWidth="2.54821"
                            strokeMiterlimit="10"
                        />
                    </G>
                    <Path
                        d="M73.4312 12.8511L74.6891 16.374C74.7284 16.4976 74.8463 16.58 74.9642 16.58L78.5413 16.7448C78.8362 16.7448 78.9738 17.1569 78.7379 17.3629L75.9273 19.6909C75.829 19.7733 75.7897 19.9175 75.829 20.0411L76.7921 23.667C76.8707 23.976 76.5562 24.2233 76.3007 24.0378L73.3132 21.9571C73.215 21.8747 73.0774 21.8747 72.9595 21.9571L69.972 24.0378C69.7165 24.2233 69.402 23.976 69.4806 23.667L70.4437 20.0411C70.483 19.9175 70.4437 19.7733 70.3454 19.6909L67.5151 17.3423C67.2793 17.1363 67.3972 16.7448 67.7117 16.7242L71.2888 16.5594C71.4067 16.5594 71.5247 16.477 71.564 16.3534L72.8219 12.8511C72.9201 12.5627 73.3329 12.5627 73.4312 12.8511Z"
                        fill="white"
                    />
                    <Defs>
                        <ClipPath id="clip0_6703_23638">
                            <Rect width="84.04" height="33.1267" fill="white" />
                        </ClipPath>
                    </Defs>
                </Svg>
            </View>
        );
    };

    const renderBottomSheetBackdrop = (props: BottomSheetBackdropProps) => {
        if (Platform.OS === 'ios') {
            return <BlurView style={StyleSheet.absoluteFill} blurType="dark" blurAmount={15.6} />;
        }
        return <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.6} />;
    };

    const renderConfirmContent = () => {
        return (
            <>
                {renderIcon()}
                <Text
                    style={tailwind.style(
                        'mt-[2px] text-[18px] font-areaNormal-extrabold text-[#3B3A3C] text-start mb-3',
                    )}>
                    {userLanguageStrings.ConfirmSwitch}
                </Text>
                <Text
                    style={tailwind.style(
                        'text-[14px] text-[#7E7E7E] font-areaNormal-extrabold text-start leading-[23px] mb-6',
                    )}>
                    {
                        userLanguageStrings.YouCanSwitchOnlyOnceFromTheOldDeviceOnceSwitchedWeCanNotRevertItBackToOldDevice
                    }
                </Text>
                <Pressable
                    accessibilityRole="button"
                    style={tailwind.style('bg-[#3B3A3C] rounded-[18px] py-[23px] px-8 w-full items-center mb-3')}
                    onPress={handleConfirm}
                    testID="device-switch-confirm-button"
                    {...confirmHandlers}>
                    <Animated.Text
                        style={[
                            tailwind.style('text-white font-areaNormal-extrabold text-[16px]'),
                            confirmAnimatedStyle,
                        ]}>
                        {userLanguageStrings.Confirm}
                    </Animated.Text>
                </Pressable>
                <Pressable
                    accessibilityRole="button"
                    style={tailwind.style('py-3 px-8 items-center mx-auto')}
                    onPress={handleSkip}
                    testID="device-switch-skip-button"
                    {...skipHandlers}>
                    <Animated.Text
                        style={[
                            tailwind.style(
                                'text-[#656565] text-center underline font-areaNormal-extrabold text-[16px]',
                            ),
                            skipAnimatedStyle,
                        ]}>
                        {userLanguageStrings.Skip}
                    </Animated.Text>
                </Pressable>
            </>
        );
    };

    const renderContent = () => {
        switch (currentStep) {
            case 'initial':
                return (
                    <>
                        {renderIcon()}
                        <Text
                            style={tailwind.style(
                                'text-[15px] leading-[20px] font-areaNormal-extrabold text-[#3B3A3C] text-center px-2',
                            )}>
                            {userLanguageStrings.SwitchPassFromOldDeviceOneTime}
                        </Text>
                        <Text
                            style={tailwind.style(
                                'text-[12px] text-[#7E7E7E] text-center leading-5 mt-[15px] font-areaNormal-extrabold mx-1',
                            )}>
                            {userLanguageStrings.YourPassIsLinkedToAnotherDeviceYouCanSwitchToThisDeviceAllowedOnlyOnce}
                        </Text>
                        <Pressable
                            accessibilityLabel="Switch now"
                            accessibilityRole="button"
                            style={tailwind.style(
                                'bg-[#047AEA] rounded-[14px] py-[18px] px-8 w-full items-center mb-3 mt-[21px] w-full',
                            )}
                            onPress={handleSwitchNow}
                            testID="device-switch-now-button"
                            {...switchNowHandlers}>
                            <Animated.Text
                                style={[
                                    tailwind.style('text-white font-bold text-[13px] font-areaNormal-extrabold'),
                                    switchNowAnimatedStyle,
                                ]}>
                                {userLanguageStrings.SwitchNow}
                            </Animated.Text>
                        </Pressable>
                    </>
                );

            case 'completed':
                return (
                    <Animated.View style={tailwind.style('w-full')}>
                        {renderIcon()}
                        <Text
                            style={tailwind.style(
                                'text-[15px] font-bold text-[#3B3A3C] text-center mb-3 leading-[20px]',
                            )}>
                            {userLanguageStrings.PassSwitched}
                        </Text>
                        <Text
                            style={tailwind.style(
                                'text-[12px] text-[#7E7E7E] text-center leading-5 mb-2 font-areaNormal-extrabold px-6',
                            )}>
                            {isPolling
                                ? userLanguageStrings.PleaseWaitWhileWeUpdateYourPassStatus
                                : userLanguageStrings.YourPassIsSwitchedToAnotherDeviceYouCanNotSwitchItBackPleaseContactSupportForAssistance}
                        </Text>
                        <Pressable
                            accessibilityRole="button"
                            style={tailwind.style('py-3 px-8 items-center mb-2')}
                            onPress={() => {
                                showTerms(true);
                            }}
                            testID="device-switch-terms-button"
                            {...termsHandlers}>
                            <Animated.Text
                                style={[
                                    tailwind.style('text-[#969696] font-semibold text-[12px] underline'),
                                    termsAnimatedStyle,
                                ]}>
                                {userLanguageStrings.ReadTermsAndConditions}
                            </Animated.Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole="button"
                            style={tailwind.style(
                                'bg-[#047AEA] rounded-[14px] py-[18px] px-8 w-full items-center mb-3 w-full',
                            )}
                            onPress={isPolling ? undefined : handleBuyNewPass}
                            disabled={isPolling}
                            testID="device-switch-buy-pass-button"
                            {...buyPassHandlers}>
                            {isPolling ? (
                                <ActivityIndicator size="small" color="#FFFFFF" />
                            ) : (
                                <Animated.Text
                                    style={[
                                        tailwind.style('text-white font-bold text-[13px] text-center w-full'),
                                        buyPassAnimatedStyle,
                                    ]}>
                                    {userLanguageStrings.BuyANewPass}
                                </Animated.Text>
                            )}
                        </Pressable>
                    </Animated.View>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {/* Absolute positioned overlay for initial and completed steps */}
            {isVisible && currentStep !== 'confirm' && (
                <Animated.View
                    style={tailwind.style('absolute inset-0 justify-center items-center px-[50px] z-0')}
                    pointerEvents="box-none">
                    {Platform.OS === 'ios' ? (
                        <BlurView
                            blurType="light"
                            blurAmount={13}
                            style={tailwind.style(
                                `absolute bg-[#000]/30 inset-0 h-[540px] mx-auto top-0 rounded-[32px]`,
                            )}
                        />
                    ) : (
                        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.6)' }]} />
                    )}
                    <Animated.View
                        entering={FadeIn.duration(500)}
                        exiting={FadeOut.duration(500)}
                        style={tailwind.style(
                            `bg-white rounded-[26px] ${currentStep === 'initial' ? 'p-[35px]' : 'p-[28px]'} w-full items-center`,
                        )}>
                        {renderContent()}
                    </Animated.View>
                </Animated.View>
            )}

            {/* BottomSheet for confirm step - renders above tabs using Modal */}
            <Modal animationType="fade" transparent={true} visible={currentStep === 'confirm'} statusBarTranslucent>
                <BottomSheet
                    ref={bottomSheetRef}
                    index={0}
                    snapPoints={snapPoints}
                    enablePanDownToClose={false}
                    backdropComponent={renderBottomSheetBackdrop}
                    backgroundStyle={{
                        backgroundColor: '#FFFFFF',
                        borderTopLeftRadius: 20,
                        borderTopRightRadius: 20,
                    }}
                    handleIndicatorStyle={{
                        backgroundColor: '#CCCCCC',
                        width: 40,
                    }}>
                    <BottomSheetView style={tailwind.style('p-6 items-start pb-10')}>
                        {renderConfirmContent()}
                    </BottomSheetView>
                </BottomSheet>
            </Modal>
        </>
    );
};
