import { PopUpModal } from '@/typescript/components/PopUpModal';
import { useRefsContext } from '@/typescript/context/RefsContext';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import Animated, { FadeIn } from 'react-native-reanimated';
import { View, Text, Platform, Keyboard } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import React, { useState, useEffect, useCallback } from 'react';
import { getStringItem, MMKVKey } from '@/typescript/utils/MMKV';
import OTPComponentNew from '@/typescript/components/common/OTPComponentNew';
import { Pressable } from '@/src-v2/primitives/Pressable';
import {
    useCrisChangeDevicePostMutation,
    useLazyCrisTriggerOtpGenerationQuery,
} from '@/typescript/state/server/crisApi';
import { crisChangeDeviceRequest } from '@/readOnly/api/types/CrisChangeDeviceRequest.gen';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { BodyView, PrimaryButton } from './Common';
import {
    DeviceChangePopUpProps,
    DeviceChangeStage,
    SubwayPopUpProps,
    GetOTPViewProps,
    VerifyOTPViewProps,
    SubwayPopUpButtonProps,
} from './types';

export const DeviceChangePopUp: React.FC<DeviceChangePopUpProps> = ({ onConfirm }) => {
    const { deviceChangeModalRef } = useRefsContext();
    const { bottom } = useSafeAreaInsets();
    const [currentStage, setCurrentStage] = useState<DeviceChangeStage>(DeviceChangeStage.GET_OTP);
    const [cooldownTime, setCooldownTime] = useState(30);
    const [isCooldown, setIsCooldown] = useState(true);
    const configManager = useConfigContext();
    const colors = configManager.get('themeColors');

    const startCooldown = useCallback(() => {
        setIsCooldown(true);
        setCooldownTime(30);

        const timer = setInterval(() => {
            setCooldownTime(prevTime => {
                const newTime = prevTime - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                    setIsCooldown(false);
                    return 0;
                }
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (currentStage === DeviceChangeStage.VERIFY_OTP) {
            startCooldown();
        }
    }, [currentStage]);

    return (
        <PopUpModal
            sheetRef={deviceChangeModalRef}
            isScrollable={false}
            onHardwareBackPress={() => {
                deviceChangeModalRef.current?.dismiss();
            }}
            showBackdrop={undefined}
            enableDynamicSizing={true}>
            <Animated.View
                style={tailwind.style(
                    `px-[20px] pt-[14px] pb-[${bottom + 20}px] bg-[#ffffff] rounded-tl-[32px] rounded-tr-[32px]`,
                )}>
                <View
                    style={tailwind.style(
                        `bg-[${colors.CrossButton_bg}] w-[46px] h-[4px] rounded-[16px] self-center`,
                    )}></View>
                {currentStage === DeviceChangeStage.VERIFY_OTP ? (
                    <Animated.View entering={FadeIn.duration(300)}>
                        <VerifyOTPView
                            cooldownTime={cooldownTime}
                            isCooldown={isCooldown}
                            startCooldown={startCooldown}
                            onConfirm={onConfirm}
                        />
                    </Animated.View>
                ) : currentStage === DeviceChangeStage.GET_OTP ? (
                    <Animated.View entering={FadeIn.duration(300)}>
                        <GetOTPView setCurrentStage={setCurrentStage} />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </PopUpModal>
    );
};

const GetOTPView: React.FC<GetOTPViewProps> = ({ setCurrentStage }) => {
    const [triggerOtp] = useLazyCrisTriggerOtpGenerationQuery();
    const [isLoading, setIsLoading] = useState(false);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const sendOTP = async () => {
        setIsLoading(true);
        await triggerOtp({})
            .unwrap()
            .then(data => {
                if (data?.result === 'Success') setCurrentStage(DeviceChangeStage.VERIFY_OTP);
            })
            .catch(e => {
                console.error('Error in UTS Device Change', e);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const state: SubwayPopUpProps = {
        title: userLanguageStrings.InitiateHandsetChange,
        body: userLanguageStrings.ThisNumberHasActiveTickets,
    };

    const buttonProps: SubwayPopUpButtonProps = {
        title: userLanguageStrings.GetOTP,
        testId: 'device-change-get-otp',
        onPress: sendOTP,
    };

    return (
        <Animated.View>
            <BodyView title={state.title} body={state.body} />
            <PrimaryButton
                title={buttonProps.title}
                testId={buttonProps.testId}
                onPress={buttonProps.onPress}
                isLoading={isLoading}
                disabled={isLoading}
            />
        </Animated.View>
    );
};

const VerifyOTPView: React.FC<VerifyOTPViewProps> = ({ cooldownTime, isCooldown, startCooldown, onConfirm }) => {
    const number = getStringItem(MMKVKey.MOBILE_NUMBER);
    const [otp, setOtp] = useState('');
    const [errorText, setErrorText] = useState('');
    const { deviceChangeModalRef } = useRefsContext();
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS == 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            event => {
                setKeyboardHeight(event.endCoordinates.height);
            },
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS == 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            },
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
            setKeyboardHeight(0);
        };
    }, []);

    const [verifyOtp] = useCrisChangeDevicePostMutation();
    const [triggerOtp] = useLazyCrisTriggerOtpGenerationQuery();

    const handleOTPChange = (value: string) => {
        setOtp(value);
        if (value.length === 4) {
            validateOTP(value);
        } else {
            setErrorText('');
        }
    };

    const resendOTP = async () => {
        if (isCooldown) return;

        setIsLoading(true);
        await triggerOtp({})
            .unwrap()
            .catch(e => {
                console.error('Error in UTS Device Change Resend OTP', e);
            })
            .finally(() => {
                setOtp('');
                setErrorText('');
                startCooldown();
                setIsLoading(false);
            });
    };

    const validateOTP = async (value: string) => {
        if (value.length === 4) {
            const request: crisChangeDeviceRequest = {
                otp: value,
            };
            setIsLoading(true);
            await verifyOtp(request)
                .unwrap()
                .then(data => {
                    if (data?.result === 'Success') {
                        deviceChangeModalRef.current?.dismiss();
                        onConfirm();
                    }
                })
                .catch(e => {
                    setErrorText(userLanguageStrings.OTPVerificationFailed);
                    console.error('Error in UTS Device Change Validate OTP', e);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setErrorText(userLanguageStrings.InvalidOTP);
        }
    };

    const resendDisabled = isCooldown || isLoading;

    const state: SubwayPopUpProps = {
        title: userLanguageStrings.EnterOTP,
        body: userLanguageStrings.WeHaveSentYouADigitCode(number ?? ''),
    };

    const buttonProps: SubwayPopUpButtonProps = {
        title: userLanguageStrings.Continue,
        testId: 'device-change-submit-otp',
        onPress: () => validateOTP(otp),
    };

    return (
        <Animated.View>
            <BodyView title={state.title} body={state.body} />
            <View style={tailwind.style(`self-center`)}>
                <View style={tailwind.style(`my-[12px]`)}>
                    <OTPComponentNew
                        value={otp}
                        error={errorText.length > 0}
                        onChange={handleOTPChange}
                        cellStyle={tailwind.style(`w-[40px] h-[48px]`)}
                        textStyle={tailwind.style(`text-[20px]`)}
                    />
                    {errorText.length > 0 ? (
                        <Text style={tailwind.style(`text-[#EA4848] self-center`)}>{errorText}</Text>
                    ) : null}
                </View>
                <Pressable
                    accessibilityRole="button"
                    testID={'device-change-resend-otp'}
                    accessibilityLabel="Resend OTP button"
                    onPress={resendOTP}
                    disabled={resendDisabled}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    style={tailwind.style(`mb-[8px] justify-center`)}>
                    <Typography
                        type="body-1"
                        numberOfLines={undefined}
                        isAnimate={undefined}
                        accessible={undefined}
                        style={tailwind.style(
                            `${resendDisabled ? 'text-[#A0A0A0]' : 'text-[#005FCB]'} self-center text-center`,
                        )}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {userLanguageStrings.ResendCode}{' '}
                        {isCooldown ? userLanguageStrings.CooldownTimer(cooldownTime) : ''}
                    </Typography>
                </Pressable>
            </View>
            <PrimaryButton
                title={buttonProps.title}
                testId={buttonProps.testId}
                onPress={buttonProps.onPress}
                isLoading={isLoading}
                disabled={otp.length !== 4 || isLoading}
            />
            {/* Spacer to push content up when keyboard is visible */}
            {keyboardHeight > 0 && <View style={tailwind.style(`h-[${keyboardHeight}px]`)} />}
        </Animated.View>
    );
};
