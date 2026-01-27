import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useScaleAnimation } from '../../../../src/typescript/utils/useScaleAnimation';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import CircularProgress from '../../../../src/typescript/designSystem/components/primitives/CircularProgress';
import LinearGradient from 'react-native-linear-gradient';
import { useAppDispatch, useAppSelector } from '@/typescript/state/hooks';
import {
    selectAutoCallDefaultContact,
    selectDefaultContact,
    selectSosStage,
    setsosStage,
} from '@/typescript/state/client/sos';
import { activateSafetyTool, resetActiveSafetyTool } from '../../../../src/typescript/state/client/sos';
import { useConfigContext } from '@/typescript/context/ConfigContext';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Linking, View } from 'react-native';
import { logEvent, EventName } from '@/typescript/utils/logger';

const SOS_ACTIVATION_TIME = 5; // in sec

export const SOSButtonView = () => {
    const sosStage = useAppSelector(selectSosStage);
    const configManager = useConfigContext();
    const userLanguageStrings = configManager.get('userLanguageStrings');

    const headingText =
        sosStage == 'DeActivated'
            ? userLanguageStrings.EmergencyHelpNeeded
            : userLanguageStrings.EmergencySOSActivatingIn;
    const subHeadText = sosStage == 'DeActivated' ? userLanguageStrings.PressTheButtonInCaseOfEmergency : '';

    const progress = useSharedValue<number>(0);
    const { animatedStyle, handlers } = useScaleAnimation();
    const [sosTimer, setSOSTimer] = useState(SOS_ACTIVATION_TIME);
    const timerRef = useRef<number>(sosTimer);
    const timerIdRef = useRef<NodeJS.Timeout | null>(null);
    const dispatch = useAppDispatch();
    const autoCallDefaultContact = useAppSelector(selectAutoCallDefaultContact);
    const defaultContact = useAppSelector(selectDefaultContact);

    const onSOSActivated = useCallback(() => {
        if (autoCallDefaultContact && defaultContact !== undefined) {
            const currentDate = new Date(Date.now());
            const cleverTapParams = { current_time: currentDate.toUTCString() };
            logEvent(EventName.NY_USER_SOS_ACTIVATED, cleverTapParams);
            Linking.openURL(`tel:${defaultContact.mobileNumber}`);
        }
    }, [autoCallDefaultContact, defaultContact]);

    const startSOSTimer = () => {
        setSOSTimer(SOS_ACTIVATION_TIME);
        timerRef.current = SOS_ACTIVATION_TIME;
        timerIdRef.current = setInterval(() => {
            timerRef.current -= 1;
            if (timerRef.current < 1) {
                if (timerIdRef.current) clearInterval(timerIdRef.current);
                progress.value = 0;
                dispatch(setsosStage('Activated'));
                onSOSActivated();
            } else {
                setSOSTimer(timerRef.current);
            }
        }, 1000);
    };

    useEffect(() => {
        if (sosStage === 'Activating') {
            startSOSTimer();
            progress.value = withTiming(100, { duration: SOS_ACTIVATION_TIME * 1000 });
        } else if (sosStage === 'DeActivated') {
            if (timerIdRef.current) clearInterval(timerIdRef.current);
            progress.value = 0;
            dispatch(resetActiveSafetyTool());
        }
    }, [sosStage]);

    useEffect(() => {
        return () => {
            if (timerIdRef.current) clearInterval(timerIdRef.current);
            progress.value = 0;
            dispatch(resetActiveSafetyTool());
        };
    }, []);

    return (
        <Animated.View style={tailwind.style('flex-col justify-center items-center')}>
            <Typography
                type="title-800"
                style={tailwind.style('text-[#1E1E1E]')}
                numberOfLines={undefined}
                isAnimate={undefined}
                accessible={undefined}
                accessibilityLabel={undefined}
                accessibilityRole={undefined}>
                {headingText}
            </Typography>
            {subHeadText !== '' ? (
                <Typography
                    type="subhead-700"
                    style={tailwind.style('pt-[10px] text-[#5B6777]')}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {subHeadText}
                </Typography>
            ) : (
                <></>
            )}
            <Pressable
                testID="safety_sos_button"
                accessibilityRole="button"
                accessibilityLabel="Activate SOS button"
                onPress={() => {
                    dispatch(setsosStage('Activating'));
                    dispatch(activateSafetyTool('PlaySiren'));
                }}
                disabled={sosStage === 'Activating'}
                {...handlers}>
                <Animated.View
                    style={[
                        tailwind.style('mt-[50px] mb-[30px] rounded-[85px]'),
                        animatedStyle,
                        {
                            shadowColor: '#959595',
                            shadowOffset: { width: -20, height: 17 },
                            shadowOpacity: 0.9,
                            shadowRadius: 20,
                            elevation: 10,
                        },
                    ]}>
                    <CircularProgress
                        value={0}
                        animatedProgressRef={progress}
                        style={tailwind.style(
                            `absolute z-1 overflow-hidden h-[212px] w-[212px] left-[-12px] top-[-11px]`,
                        )}
                        filledColor={'#FF4141'}
                        strokeWidth={2}
                        unFilledColor={'transparent'}></CircularProgress>
                    <View style={tailwind.style('h-[190px] w-[190px] rounded-[95px] justify-center items-center')}>
                        <LinearGradient
                            style={tailwind.style('absolute h-full w-full rounded-[95px]')}
                            colors={['#C1C1C1', '#EAEAEA', '#FFFFFF']}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            locations={[0, 0.4, 0.7]}
                        />
                        <View style={tailwind.style('h-[180px] w-[180px] rounded-[90px] justify-center items-center')}>
                            <LinearGradient
                                style={tailwind.style('absolute h-full w-full rounded-[90px]')}
                                colors={['#C1C1C1', '#FFF', '#FFFFFF']}
                                start={{ x: 0, y: 1 }}
                                end={{ x: 1, y: 0 }}
                                locations={[0, 0.6, 0.9]}
                            />
                            <View
                                style={tailwind.style(
                                    'h-[150px] w-[150px] rounded-[75px] justify-center items-center',
                                )}>
                                <LinearGradient
                                    style={tailwind.style('absolute h-full w-full rounded-[75px]')}
                                    colors={['#FF4141', '#FF4141']}
                                    start={{ x: 0, y: 1 }}
                                    end={{ x: 1, y: 0 }}
                                    locations={[0, 0.6, 0.9]}
                                />
                                <View
                                    style={tailwind.style(
                                        'h-[140px] w-[140px] rounded-[70px] justify-center items-center',
                                    )}>
                                    <LinearGradient
                                        style={tailwind.style('absolute h-full w-full rounded-[70px]')}
                                        colors={['#FFFFFF', '#FF8D8D', '#FE5859', '#FE5151', '#FF4141', '#E65959']}
                                        start={{ x: 0, y: 1 }}
                                        end={{ x: 1, y: 0 }}
                                        locations={[0.05, 0.1, 0.35, 0.5, 0.9, 0.96]}
                                    />
                                    <Animated.Text
                                        style={[
                                            tailwind.style('text-[47px] text-white font-bold'),
                                            { fontFamily: 'PlusJakartaSans-Bold' },
                                        ]}>
                                        {sosStage === 'DeActivated' ? 'SOS' : sosTimer.toString()}
                                    </Animated.Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
};
