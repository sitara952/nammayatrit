// import {Spinner} from '@adaptui/react-native-tailwind';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    FadeIn,
    interpolate,
    runOnJS,
    useAnimatedReaction,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import { Icon } from '../Icon';
import Danger from '../svg/Danger';
import { selectScreenReaderEnabled } from '@/typescript/state/client/session';
import MaskedView from '@react-native-masked-view/masked-view';
import LottieView from 'lottie-react-native';
import * as Haptics from 'react-native-haptic-feedback';
import Typography from '../../designSystem/components/primitives/Typography';
import { setRetrySearch, setToastProps, setToastVisible } from '../../state/client/session';

import { useAppDispatch, useAppSelector } from '../../state/hooks';
import Button from '../../../../src-v2/primitives/Button';
import { hapticEffect } from '@/typescript/utils/useHaptic';

import { useConfigContext } from '@/typescript/context/ConfigContext';
import { SHOW_PRIMARY_CTA } from '@/typescript/constants/common';
import { useRefsContext } from '@/typescript/context/RefsContext';
import CarSideWithArrow from '../svg/CarWithArrow';
const SWIPE_DISTANCE = Dimensions.get('screen').width - 32;

const INNER_CONTAINER_WIDTH = 76;

const MAX_TEXT_WIDTH = SWIPE_DISTANCE - INNER_CONTAINER_WIDTH;

type MovingButtonSlideProps = {
    buttonText: string;
    disabled: boolean;
    onSlideComplete: ((pullBackSlider: () => void) => void) | undefined;
    validateFinalizeEvent: () => boolean;
    failedCheckOverlap: () => boolean;
    testID: string;
};

export const MovingButtonSlide = (props: MovingButtonSlideProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const userLanguageStrings = configManager.get('userLanguageStrings');
    const { buttonText, disabled, onSlideComplete, validateFinalizeEvent, failedCheckOverlap } = props;

    const [isLoading, setISLoading] = useState(false);
    const [finalizable, setFinalizable] = useState(true);
    const disabledInternal = !finalizable || disabled;
    const dispatch = useAppDispatch();
    const translateX = useSharedValue(0);
    const screenReaderEnabled = useAppSelector(selectScreenReaderEnabled);
    const { overlappingRideExistModalRef } = useRefsContext();
    useEffect(() => {
        if (!disabled) {
            translateX.value = withSpring(75, { damping: 28, stiffness: 200 }, finished => {
                if (finished) {
                    translateX.value = withSpring(0, { damping: 28, stiffness: 200 });
                }
            });
        }
    }, [disabled]);

    const rideActivated = useSharedValue(0);

    const pullBackSlider = () => {
        translateX.value = withSpring(0, { damping: 28, stiffness: 200 });
        rideActivated.value = withSpring(0, { damping: 28, stiffness: 200 });
        setISLoading(false);
    };

    const moveToFindRideContent = () => {
        // ! The spinner is show so calling this function with a setTimeout() (not recommended)
        // ! Should be replaced with API Logic
        // setTimeout(() => setCurrentBottomSheetState('find-ride'), 1000);
        setTimeout(() => onSlideComplete?.(pullBackSlider));
    };

    useAnimatedReaction(
        () => rideActivated.value,
        (next, prev) => {
            if (next === 1 && next !== prev) {
                runOnJS(moveToFindRideContent)();
            }
        },
    );

    const checkFinilizability = (translationX: number) => {
        const allowFinaize = validateFinalizeEvent();
        setFinalizable(allowFinaize);
        if (allowFinaize) {
            if (translationX <= SWIPE_DISTANCE / 3) {
                translateX.value = withSpring(0, { damping: 28, stiffness: 200 });
            } else {
                translateX.value = withSpring(SWIPE_DISTANCE - INNER_CONTAINER_WIDTH - 2, {
                    damping: 28,
                    stiffness: 200,
                });
                rideActivated.value = withSpring(1, { damping: 24, stiffness: 180 });
                setISLoading(true);
            }
        } else {
            rideActivated.value = withTiming(0, { duration: 250 });
            translateX.value = withTiming(0, { duration: 250 });
            dispatch(
                setToastProps({
                    message: userLanguageStrings.YourrideestimatesseemstohavetimedoutPleasetryagain,
                    backgroundColor: `${themeColors.Fill_negativeHigh}`,
                    visible: true,
                    dismissButton: () => {
                        setFinalizable(true);
                        dispatch(setToastVisible(false));
                    },
                    logo: <Danger />,
                    buttons: [
                        {
                            color: `${themeColors.Fill_negativeHigh}`,
                            title: 'Retry',
                            onPress: () => {
                                setFinalizable(true);
                                dispatch(setToastVisible(false));
                                dispatch(setRetrySearch(true));
                            },
                            logo: undefined,
                        },
                    ],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    onSpannedToastLoad: undefined,
                    autoDismissAfter: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
        }
    };

    const handleButtonPress = () => {
        if (isLoading) {
            return;
        }
        console.info('handleButtonPress');
        const allowFinalize = validateFinalizeEvent();
        const failedCheckOverlap_ = failedCheckOverlap();
        setFinalizable(allowFinalize);

        if (allowFinalize && !failedCheckOverlap_) {
            setISLoading(true);
            onSlideComplete?.(pullBackSlider);
        } else if (failedCheckOverlap_) {
            overlappingRideExistModalRef.current?.present();
            setFinalizable(true);
        } else {
            dispatch(
                setToastProps({
                    message: userLanguageStrings.YourrideestimatesseemstohavetimedoutPleasetryagain,
                    backgroundColor: `${themeColors.Fill_negativeHigh}`,
                    visible: true,
                    dismissButton: () => {
                        setFinalizable(true);
                        dispatch(setToastVisible(false));
                    },
                    logo: <Danger />,
                    buttons: [
                        {
                            color: `${themeColors.Fill_negativeHigh}`,
                            title: 'Retry',
                            onPress: () => {
                                setFinalizable(true);
                                dispatch(setToastVisible(false));
                                dispatch(setRetrySearch(true));
                            },
                            logo: undefined,
                        },
                    ],
                    useSpannedToast: undefined,
                    bottomSpanDescription: undefined,
                    spannerType: undefined,
                    onSpannedToastLoad: undefined,
                    autoDismissAfter: undefined,
                    margin: undefined,
                    customToast: undefined,
                }),
            );
        }
    };

    const panGesture = Gesture.Pan()
        .enabled(!disabledInternal)
        .onBegin(() => {
            runOnJS(hapticEffect)(Haptics.HapticFeedbackTypes.selection, undefined);
        })
        .onUpdate(event => {
            const interpolatedTranslate = interpolate(
                event.translationX,
                [0, SWIPE_DISTANCE],
                [0, SWIPE_DISTANCE - INNER_CONTAINER_WIDTH - 4],
                Extrapolation.CLAMP,
            );
            translateX.value = interpolatedTranslate;
        })
        .onEnd(event => {
            if (event.translationX <= SWIPE_DISTANCE / 2) {
                /* empty */
            } else {
                runOnJS(hapticEffect)(Haptics.HapticFeedbackTypes.selection, undefined);
            }
        })
        .onFinalize(event => {
            const evtTranslationX = event.translationX;
            runOnJS(checkFinilizability)(evtTranslationX);
        });

    const animatedTranslateStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: translateX.value }],
        };
    });

    const animatedTranslateTextStyle = useAnimatedStyle(() => {
        return {
            color: themeColors.SlideButton_Primary_Disabled_Text_Base,
            opacity: interpolate(translateX.value, [44, SWIPE_DISTANCE / 2], [1, 0], Extrapolation.CLAMP),
        };
    });

    const animatedButtonLoadingStyle = useAnimatedStyle(() => {
        return {
            width: interpolate(rideActivated?.value, [0, 1], [SWIPE_DISTANCE, 55]),
            borderRadius: interpolate(rideActivated?.value, [0, 1], [16, 9999]),
        };
    });

    const animatedSpinnerStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(rideActivated.value, [0.5, 1], [0, 1]),
        };
    });

    return !screenReaderEnabled && !SHOW_PRIMARY_CTA ? (
        <Animated.View style={tailwind.style('pt-5 px-4 items-center')}>
            <Animated.View
                style={[
                    tailwind.style(
                        'relative overflow-hidden h-14 justify-center items-center',
                        disabledInternal
                            ? `bg-[${themeColors.SlideButton_Primary_Disabled_Fill_Base}]`
                            : `bg-[${themeColors.SlideButton_Primary_Default_Fill_Base}]`,
                    ),
                    animatedButtonLoadingStyle,
                ]}>
                <Animated.View
                    style={tailwind.style(
                        `w-[${MAX_TEXT_WIDTH}px] flex-row justify-center items-center`,
                        `pl-[${INNER_CONTAINER_WIDTH}px]`,
                    )}>
                    {disabledInternal ? (
                        <Typography
                            type="callout"
                            style={[tailwind.style('bg-transparent', `text-[${themeColors.Text_neutralHigh}]`)]}
                            numberOfLines={undefined}
                            isAnimate={undefined}
                            accessible={undefined}
                            accessibilityLabel={undefined}
                            accessibilityRole={undefined}>
                            {buttonText}
                        </Typography>
                    ) : (
                        <MaskedView
                            maskElement={
                                <Typography
                                    type="callout"
                                    style={[tailwind.style(`bg-transparent`), animatedTranslateTextStyle]}
                                    numberOfLines={undefined}
                                    isAnimate={undefined}
                                    accessible={undefined}
                                    accessibilityLabel={undefined}
                                    accessibilityRole={undefined}>
                                    {buttonText}
                                </Typography>
                            }>
                            <Typography
                                type="callout"
                                style={{
                                    backgroundColor: 'transparent',
                                    color: themeColors.SlideButton_Primary_Disabled_Text_Base,
                                }}
                                numberOfLines={undefined}
                                isAnimate={undefined}
                                accessible={undefined}
                                accessibilityLabel={undefined}
                                accessibilityRole={undefined}>
                                {buttonText}
                            </Typography>
                        </MaskedView>
                    )}
                </Animated.View>
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            tailwind.style(
                                'absolute h-13 rounded-[14px] left-[2px] flex-row justify-start items-center overflow-visible pl-5',
                                `w-[${INNER_CONTAINER_WIDTH}px] `,
                                disabledInternal
                                    ? `bg-[${themeColors.Icon_neutralHigh}]`
                                    : `bg-[${themeColors.APP_THEME_COLOR}]`,
                            ),
                            animatedTranslateStyle,
                            !disabledInternal ? styles.dropShadow : {},
                        ]}>
                        <Icon
                            color="#FFF"
                            icon={
                                <CarSideWithArrow
                                    fillColor={
                                        disabledInternal
                                            ? themeColors.Fill_neutralMid
                                            : themeColors.SlideButton_primary_Default_Fill_Icon
                                    }
                                />
                            }
                            size={26}
                        />
                    </Animated.View>
                </GestureDetector>
                <Animated.View
                    style={[tailwind.style('absolute h-[55px] justify-center items-center'), animatedSpinnerStyle]}
                />
                {isLoading && finalizable ? (
                    <Animated.View entering={FadeIn}>
                        <LottieView
                            style={tailwind.style('w-[50px] h-[50px] ml-[-45px] absolute left-3 -top-9')}
                            source={require('../../assets/ny-service/mt_ic_loading_dots_white_lottie.lottie')}
                            autoPlay
                            loop
                        />
                    </Animated.View>
                ) : null}
            </Animated.View>
        </Animated.View>
    ) : SHOW_PRIMARY_CTA ? (
        <Button
            testID={props.testID + '_cta'}
            disabled={disabled || isLoading}
            text={buttonText}
            type="primary"
            isLoading={isLoading}
            onPress={handleButtonPress}
            style={{
                margin: 16,
                marginBottom: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: 60,
                borderRadius: 18,
            }}
        />
    ) : (
        <Button
            testID={props.testID + '_slide'}
            disabled={disabled}
            text={userLanguageStrings.BookRide}
            type="primary"
            onPress={() => onSlideComplete?.(pullBackSlider)}
            style={{
                margin: 16,
                marginBottom: 0,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
            }}
        />
    );
};

const styles = StyleSheet.create({
    // uncomment once shadow is fixed
    dropShadow: {
        // // box-shadow: [horizontal offset] [vertical offset] [blur radius] [optional spread radius] [color];
        // shadowColor: '' + `${colors?.recovered?.orangeMid}` + '63',
        // shadowOffset: {width: 9, height: 9},
        // shadowRadius: 10,
        // shadowOpacity: 1,
        // elevation: 2,
    },
    gradientText: { opacity: 0 },
});
