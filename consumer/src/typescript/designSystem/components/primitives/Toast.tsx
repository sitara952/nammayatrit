import React, { useEffect, useRef, useState } from 'react';
import { Modal, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import { Icon } from '../../../components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CloseIconWhite from '../../../components/svg/CloseIconWhite';
import { tailwind } from '../../../tailwindTheme/tailwind';
import Typography from './Typography';
import { useAppDispatch, useAppSelector } from '../../../state/hooks';
import colors from '../../../designSystem/colorPalette';
import { resetToastProps, selectToastProps, setToastVisible } from '../../../state/client/session';
import { Action } from '@reduxjs/toolkit';
import { TouchableOpacity } from '@/src-v2/primitives/TouchableOpacity';

// Define types for button props
const Toast = () => {
    const toastProps = useAppSelector(selectToastProps);
    const [localSpannertype, setLocalSpannertype] = useState('top');
    const dispatch = useAppDispatch();
    const [internalVisible, setInternalVisible] = useState(toastProps.visible);
    const translateY = useSharedValue(toastProps.visible ? 0 : 100); // Animation for sliding up/down
    const opacity = useSharedValue(toastProps.visible ? 1 : 0); // Animation for fade in/out
    const { bottom, top } = useSafeAreaInsets();
    const spannerOpenPosition = 0;
    const spannerClosePosition = localSpannertype == 'top' ? -100 + -1 * top : 100 + bottom;
    const translateYS = useSharedValue(toastProps.visible ? spannerOpenPosition : spannerClosePosition); // Animation for sliding up/down
    const paddingStyle = toastProps.spannerType == 'top' ? `pt-[${top + 10}px]` : `pb-[${bottom}px]`;
    const innerPadding = toastProps.spannerType == 'top' ? 'pb-5' : 'pt-7';
    const marginStyle = toastProps.margin ? toastProps.margin : '';
    console.info('rendered again');

    const dismissButtonInternal = () => {
        dispatch(setToastVisible(false));
        toastProps.dismissButton?.();
    };
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    // Allows both Redux actions and non-action functions to be passed to resetToast
    const resetToast = (resetFunction: () => void | Action) => {
        const action = resetFunction();
        if (action) {
            dispatch(action);
        }
    };
    useEffect(() => {
        if (toastProps.spannerType) {
            setLocalSpannertype(toastProps.spannerType);
        }
    }, [toastProps.spannerType]);

    useEffect(() => {
        toastProps.onSpannedToastLoad && toastProps.onSpannedToastLoad();

        if (toastProps.visible) {
            setInternalVisible(true);
            translateY.value = withSpring(0);
            translateYS.value = withTiming(spannerOpenPosition, { duration: 1300 });
            opacity.value = withTiming(1, {
                duration: toastProps.useSpannedToast ? 1000 : 300,
            });
            if (toastProps.autoDismissAfter) {
                timeoutId.current = setTimeout(() => {
                    dismissButtonInternal();
                }, toastProps.autoDismissAfter);
            }
        } else {
            translateY.value = withTiming(100, { duration: 300 });
            translateYS.value = withTiming(spannerClosePosition, { duration: 1500 }, isFinished => {
                if (isFinished && toastProps.useSpannedToast) {
                    runOnJS(setInternalVisible)(false); // Hide Modal after the animation finishes
                    runOnJS(resetToast)(resetToastProps);
                }
            });

            opacity.value = withTiming(0, { duration: toastProps.useSpannedToast ? 1000 : 300 }, isFinished => {
                if (isFinished && !toastProps.useSpannedToast) {
                    runOnJS(setInternalVisible)(false); // Hide Modal after the animation finishes
                    runOnJS(resetToast)(resetToastProps);
                }
            });
        }
        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, [
        toastProps.visible,
        toastProps.useSpannedToast,
        toastProps.autoDismissAfter,
        toastProps.dismissButton,
        toastProps.message,
    ]);

    const expanderAnimation = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateYS.value }],
        };
    });

    const backgroundBlurStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
            opacity: opacity.value,
        };
    });
    if (!internalVisible) {
        return undefined;
    }

    return (
        <Modal
            statusBarTranslucent={true}
            visible={internalVisible}
            animationType="none"
            transparent={true}
            onRequestClose={() => {
                dismissButtonInternal();
            }}>
            {toastProps.customToast ? (
                <Animated.View style={tailwind.style('bottom-20 absolute left-5 right-5')}>
                    <Animated.View style={animatedStyle}>{toastProps.customToast}</Animated.View>
                </Animated.View>
            ) : (
                <>
                    {toastProps.useSpannedToast ? (
                        <>
                            <Animated.View
                                style={[
                                    {
                                        flex: 1,
                                        position: 'absolute',
                                        backgroundColor: colors?.recovered?.blackOpacBg,
                                        width: '100%',
                                        height: '100%',
                                    },
                                    backgroundBlurStyle,
                                ]}></Animated.View>
                            <Animated.View
                                style={[
                                    tailwind.style(
                                        `absolute ${toastProps.spannerType}-0 ${paddingStyle} bg-[${toastProps.backgroundColor}] ${marginStyle}`,
                                    ),
                                    expanderAnimation,
                                ]}>
                                <View style={[tailwind.style(`min-h-[50px] w-full ${innerPadding} flex flex-row`)]}>
                                    {toastProps.logo ? (
                                        <Icon
                                            style={tailwind.style('ml-1 h-10 items-center justify-center flex-initial')}
                                            icon={toastProps.logo}
                                            size={40}
                                        />
                                    ) : null}
                                    <View style={tailwind.style(`ml-6 items-center justify-center flex-initial`)}>
                                        <View style={tailwind.style('items-left justify-content flex flex-column')}>
                                            <Typography
                                                type="body-2"
                                                style={tailwind.style(
                                                    'text-white text-[17px] pb-2 items-center justify-center',
                                                )}
                                                numberOfLines={undefined}
                                                isAnimate={undefined}
                                                accessible={undefined}
                                                accessibilityLabel={undefined}
                                                accessibilityRole={undefined}>
                                                {toastProps.message}
                                            </Typography>
                                            {toastProps.bottomSpanDescription ? (
                                                <Typography
                                                    type="body-subtext"
                                                    style={tailwind.style(
                                                        'text-white text-[14px] items-center justify-center',
                                                    )}
                                                    numberOfLines={undefined}
                                                    isAnimate={undefined}
                                                    accessible={undefined}
                                                    accessibilityLabel={undefined}
                                                    accessibilityRole={undefined}>
                                                    {toastProps.bottomSpanDescription}
                                                </Typography>
                                            ) : null}
                                        </View>
                                    </View>
                                    <View style={tailwind.style('ml-auto mr-auto flex-initial')}>
                                        {toastProps.buttons.map((button, index) => (
                                            <TouchableOpacity
                                                accessibilityRole="button"
                                                testID={`e457641d-7f06-405a-bfb2-10daed0f924a-${index}`}
                                                key={index}
                                                disabled={button.onPress ? false : true}
                                                onPress={button.onPress}>
                                                <View
                                                    style={tailwind.style(
                                                        `pt-1 pb-1 pl-2 pr-2 flex flex-row rounded-md bg-[${button.color}]`,
                                                    )}>
                                                    <View style={tailwind.style('items-center justify-center')}>
                                                        {button.logo ? (
                                                            <Icon
                                                                style={tailwind.style('h-4')}
                                                                icon={button.logo}
                                                                size={10}
                                                            />
                                                        ) : null}
                                                    </View>
                                                    {button.title != '' ? (
                                                        <Typography
                                                            type="body-1"
                                                            style={[
                                                                tailwind.style(
                                                                    `pl-1 text-white m-auto items-center justify-center`,
                                                                ),
                                                            ]}
                                                            numberOfLines={undefined}
                                                            isAnimate={undefined}
                                                            accessible={undefined}
                                                            accessibilityLabel={undefined}
                                                            accessibilityRole={undefined}>
                                                            {button.title}
                                                        </Typography>
                                                    ) : null}
                                                </View>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </Animated.View>
                        </>
                    ) : (
                        <TouchableOpacity
                            accessibilityRole="button"
                            testID="toast-background-dismiss"
                            activeOpacity={1}
                            onPress={dismissButtonInternal}
                            style={tailwind.style('absolute inset-0')}>
                            <View style={tailwind.style('bottom-20 absolute left-5 right-5')}>
                                <TouchableOpacity
                                    accessibilityRole="button"
                                    testID="toast-content-wrapper"
                                    activeOpacity={1}
                                    onPress={e => e.stopPropagation()}>
                                    <Animated.View
                                        style={[
                                            tailwind.style(
                                                `bg-[${toastProps.backgroundColor}] shadow-[${toastProps.backgroundColor}]`,
                                                'p-2 flex-row rounded-xl shadow-lg items-center justify-between',
                                                marginStyle,
                                            ),
                                            animatedStyle,
                                        ]}>
                                        {toastProps.logo ? (
                                            <Icon
                                                style={tailwind.style('m-2 items-center justify-center flex-initial')}
                                                icon={toastProps.logo}
                                                size={40}
                                            />
                                        ) : null}
                                        <Typography
                                            type="body"
                                            style={[
                                                tailwind.style(
                                                    `text-white p-1 ml-2 items-center justify-center flex-initial`,
                                                ),
                                            ]}
                                            numberOfLines={undefined}
                                            isAnimate={undefined}
                                            accessible={undefined}
                                            accessibilityLabel={undefined}
                                            accessibilityRole={undefined}>
                                            {toastProps.message}
                                        </Typography>
                                        <View style={tailwind.style('m-2 items-center justify-center flex')}>
                                            {toastProps.buttons.map((button, index) => (
                                                <TouchableOpacity
                                                    accessibilityRole="button"
                                                    testID={`2dcb40e6-3ec1-40b1-960d-e1c22d6469c1-${index}`}
                                                    key={index}
                                                    onPress={button.onPress}
                                                    style={tailwind.style('p-2 flex-initial')}>
                                                    <View
                                                        style={tailwind.style(
                                                            `pt-1 pb-1 pl-2 pr-2 rounded-md bg-[${button.color}]`,
                                                        )}>
                                                        <Typography
                                                            type="body-1"
                                                            style={[
                                                                tailwind.style(
                                                                    `text-white items-center justify-center flex-initial`,
                                                                ),
                                                            ]}
                                                            numberOfLines={undefined}
                                                            isAnimate={undefined}
                                                            accessible={undefined}
                                                            accessibilityLabel={undefined}
                                                            accessibilityRole={undefined}>
                                                            {button.title}
                                                        </Typography>
                                                    </View>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                        {toastProps.dismissButton ? (
                                            <TouchableOpacity
                                                accessibilityRole="button"
                                                testID="ae0b1dd0-2623-4a9f-9391-c7a424e40d23"
                                                onPress={dismissButtonInternal}>
                                                <Icon
                                                    style={tailwind.style(
                                                        'text-white m-2 flex-initial items-center justify-center',
                                                    )}
                                                    icon={<CloseIconWhite />}
                                                    size={10}
                                                />
                                            </TouchableOpacity>
                                        ) : null}
                                    </Animated.View>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </Modal>
    );
};

export default Toast;
