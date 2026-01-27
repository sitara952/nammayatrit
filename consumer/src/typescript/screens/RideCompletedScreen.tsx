import mtIcLogo from '../assets/ny-service/mt_ic_logo.webp';
import React from 'react';
import { useEffect, useState, useRef } from 'react';
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { tailwind } from '../tailwindTheme/tailwind';
import Typography from '../designSystem/components/primitives/Typography';
import Button from '@/src-v2/primitives/Button';
import token from '../designSystem/tokens';
import { setShowLogo } from '../state/client/ride';
import { useAppDispatch, useAppSelector } from '../state/hooks';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';

import { RideId } from '../state/client/booking';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { selectAppConfig } from '../state/client/session';

interface props {
    rideId: RideId | null;
    showLogo: boolean;
    mainText: string | undefined;
    subTitleText: string | undefined;
    logoCenter?: number;
    goBackHome?: (skipFeedback: boolean) => void;
    showButton: boolean;
    setShowLogoState?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RideCompletedView = ({
    rideId,
    showLogo,
    mainText,
    subTitleText,
    logoCenter = 50,
    goBackHome = () => {},
    showButton,
    setShowLogoState,
}: props) => {
    const progress = useSharedValue(1);
    const scale = useSharedValue(0);
    const scaleLogo = useSharedValue(1);
    const zoomToTick = useSharedValue(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const goBackHomeTimerRef = useRef<NodeJS.Timeout | null>(null);
    const continueTimerRef = useRef<boolean>(true);
    const dispatch = useAppDispatch();
    const appConfig = useAppSelector(selectAppConfig);
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const startScreenExitTimer = () => {
        // Clear any existing timer first
        if (goBackHomeTimerRef.current) {
            clearTimeout(goBackHomeTimerRef.current);
            goBackHomeTimerRef.current = null;
        }

        if (continueTimerRef.current) {
            const timer = setTimeout(() => {
                if (setShowLogoState !== undefined) {
                    setShowLogoState(false);
                } else {
                    dispatch(setShowLogo({ id: rideId, payload: false }));
                }
                setShowSuccess(false);
                goBackHomeWithoutTimer();
            }, 2000);
            goBackHomeTimerRef.current = timer;
        }
    };

    const animatedLogoStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { rotate: `${progress.value * 1.0 * Math.PI}rad` },
                { scale: withTiming(scaleLogo.value, { duration: 250 }) },
            ],
            opacity: showSuccess ? withTiming(0) : withTiming(1),
        };
    }, []);

    const animatedParentStyle = useAnimatedStyle(() => ({
        transform: [{ scale: zoomToTick.value }],
    }));

    useEffect(() => {
        if (showLogo && appConfig.screenConfig.reviewAndFeedbackScreenConfig.showLogoAtThankYouScreen) {
            progress.value = withTiming(1.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }, () => {
                // After rotation is complete, fade out the logo and fade in the auto image
                zoomToTick.value = withTiming(3, { duration: 250 });
                runOnJS(setShowSuccess)(true);
            });

            // scale.value = withRepeat(withSpring(1.2, {damping: 2}), 5, true);
            scale.value = withSpring(1.2, { damping: 2 });
            scaleLogo.value = withTiming(0, { duration: 1000 });
            // zoomToTick.value = withTiming(3, {duration: 250});
        }
        if (showSuccess) {
            zoomToTick.value = withTiming(1, { duration: 250 });
            startScreenExitTimer();
        }

        // Cleanup timer on unmount
        return () => {
            if (goBackHomeTimerRef.current) {
                clearTimeout(goBackHomeTimerRef.current);
                goBackHomeTimerRef.current = null;
            }
        };
    }, [showSuccess, showLogo]);

    const goBackHomeWithoutTimer = () => {
        continueTimerRef.current = false;
        if (goBackHomeTimerRef.current) {
            clearTimeout(goBackHomeTimerRef.current);
            goBackHomeTimerRef.current = null;
        }
        goBackHome(false);
    };

    return (
        <Animated.View
            style={[
                tailwind.style(`h-full justify-center items-center pt-4 bg-[${themeColors.RideCompleted_bg_color}]  `),
                animatedParentStyle,
            ]}>
            {showLogo ? (
                !showSuccess && appConfig.screenConfig.reviewAndFeedbackScreenConfig.showLogoAtThankYouScreen ? (
                    <Animated.View style={tailwind.style('h-full self-center')}>
                        <Animated.View
                            style={tailwind.style(` justify-center  items-center mt-${logoCenter} z-10 w-full`)}>
                            <Animated.Image
                                accessible={true}
                                accessibilityLabel="Odisha Yatri logo image"
                                source={mtIcLogo}
                                style={[
                                    tailwind.style('w-[100px] h-[100px] mt-40 mb-22 items-center'),
                                    animatedLogoStyle,
                                ]}
                                entering={FadeIn}
                                exiting={FadeOut}
                            />
                        </Animated.View>
                    </Animated.View>
                ) : (
                    <Animated.View style={tailwind.style(`h-full flex-col justify-center items-center z-10 `)}>
                        <LottieWithFallback
                            fallback={undefined}
                            style={tailwind.style('h-[200px] w-[200px] ')}
                            autoPlay={true}
                            loop={false}
                            onAnimationFinish={() => {
                                setShowSuccess(true);
                            }}
                            speed={1.5}
                            source={require('../assets/ny-service/success_lottie_v2.lottie')}
                        />
                        <Animated.View style={tailwind.style('flex-col items-center justify-center ')}>
                            {mainText && (
                                <Animated.View style={tailwind.style('w-full px-8 pt-8 items-center')}>
                                    <Typography
                                        type="subhead-4"
                                        style={tailwind.style(`text-[#000000] text-center mx-40px`, {
                                            fontFamily: 'AreaNormal-Black',
                                            fontSize: 18,
                                            lineHeight: 26,
                                        })}
                                        numberOfLines={undefined}
                                        isAnimate={undefined}
                                        accessible={undefined}
                                        accessibilityLabel={undefined}
                                        accessibilityRole={undefined}>
                                        {mainText}
                                    </Typography>
                                </Animated.View>
                            )}
                            {subTitleText && (
                                <Typography
                                    type="body-subtext"
                                    style={tailwind.style(
                                        `text-[${token?.text?.['text-highContrast']}] text-center px-8 py-4 `,
                                        {
                                            fontFamily: 'AreaNormal-Semibold',
                                            fontSize: 16,
                                            lineHeight: 22,
                                        },
                                    )}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {subTitleText}
                                </Typography>
                            )}
                        </Animated.View>
                        {showButton ? (
                            <Animated.View style={tailwind.style('absolute bottom-8 w-full py-8 px-8')}>
                                <Button
                                    testID="Ride-Completed-Go-Home-Button"
                                    type="primary"
                                    style={{
                                        justifyContent: 'center',
                                        width: '100%',
                                        marginHorizontal: 20,
                                        alignSelf: 'center',
                                    }}
                                    text={userLanguageStrings.GoHome}
                                    onPress={() => goBackHomeWithoutTimer()}
                                />
                            </Animated.View>
                        ) : (
                            <Animated.View style={tailwind.style('pt-10 my-10')} />
                        )}
                    </Animated.View>
                )
            ) : null}
        </Animated.View>
    );
};
