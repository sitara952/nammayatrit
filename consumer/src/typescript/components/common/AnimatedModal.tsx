import React, { memo, useCallback, useMemo } from 'react';
import { StyleSheet, Platform, ViewStyle, View, Text, BackHandler, useWindowDimensions } from 'react-native';
import { BlurView } from '@sbaiahmed1/react-native-blur';
import Animated, {
    interpolate,
    useAnimatedStyle,
    withTiming,
    useSharedValue,
    runOnJS,
    useReducedMotion,
    cancelAnimation,
    Easing,
    Extrapolation,
    FadeIn,
    FadeOut,
} from 'react-native-reanimated';
import { Pressable } from '@/src-v2/primitives/Pressable';
import { Portal } from '@gorhom/portal';

const BASE_Z_INDEX = 9000;

interface AnimatedModalProps {
    visible: boolean;
    setVisible: React.Dispatch<React.SetStateAction<boolean>>;
    onClose?: () => void;
    children: React.ReactNode;
    containerStyle?: ViewStyle;
    contentStyle?: ViewStyle;
    animationDuration?: number;
    showCloseButton?: boolean;
    onHardwareBackPress?: () => boolean;
    allowCloseOnBackdropPress?: boolean;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = memo(
    ({
        visible,
        setVisible,
        onClose,
        children,
        containerStyle,
        contentStyle,
        animationDuration = 300,
        showCloseButton = false,
        onHardwareBackPress,
        allowCloseOnBackdropPress = true,
    }) => {
        const modalAnimation = useSharedValue(0);
        const [isVisible, setIsVisible] = React.useState(visible);
        const { height: screenHeight } = useWindowDimensions();
        const isClosing = React.useRef(false);
        const reducedMotion = useReducedMotion();
        const [modalZIndex, setModalZIndex] = React.useState(BASE_Z_INDEX);

        const handleAnimationComplete = useCallback(() => {
            setIsVisible(false);
            if (isClosing.current && onClose) {
                onClose();
                isClosing.current = false;
            }
            isClosing.current = false;
        }, [onClose]);

        React.useEffect(() => {
            if (visible) {
                cancelAnimation(modalAnimation);
                isClosing.current = true;
                setIsVisible(true);
                setModalZIndex(BASE_Z_INDEX + (Date.now() % 10000));
                modalAnimation.value = withTiming(1, {
                    easing: Easing.out(Easing.cubic),
                    duration: animationDuration,
                });
            } else if (isClosing.current) {
                cancelAnimation(modalAnimation);
                modalAnimation.value = withTiming(
                    0,
                    {
                        easing: Easing.linear,
                        duration: animationDuration,
                    },
                    finished => {
                        if (finished) {
                            runOnJS(handleAnimationComplete)();
                        }
                    },
                );
            }
        }, [visible, animationDuration, handleAnimationComplete, modalAnimation]);

        const handleClose = useCallback(() => {
            setVisible(false);
        }, []);

        const backdropStyle = useAnimatedStyle(
            () => ({
                opacity: interpolate(modalAnimation.value, [0, 1], [0, 0.65], Extrapolation.CLAMP),
            }),
            [],
        );

        const modalContentStyle = useAnimatedStyle(
            () => ({
                transform: [
                    {
                        translateY: interpolate(modalAnimation.value, [0, 1], [screenHeight, 0], Extrapolation.CLAMP),
                    },
                ],
            }),
            [screenHeight],
        );

        const modalContentStyleWithoutAnimation = useMemo(() => ({ transform: [{ translateY: 0 }] }), []);

        const hardwareBackPress = useCallback(() => {
            if (onHardwareBackPress) {
                onHardwareBackPress();
            } else {
                handleClose();
            }
        }, [onHardwareBackPress, handleClose]);

        React.useEffect(() => {
            if (Platform.OS === 'android' && isVisible) {
                const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
                    hardwareBackPress();
                    return true;
                });
                return () => backHandler.remove();
            }
            return undefined;
        }, [isVisible, hardwareBackPress]);

        // Dynamic container style with current modal's z-index
        const dynamicContainerStyle = useMemo(
            () => ({
                ...StyleSheet.absoluteFillObject,
                zIndex: modalZIndex,
                elevation: modalZIndex,
            }),
            [modalZIndex],
        );

        if (!isVisible) return null;

        return (
            <Portal>
                <Animated.View style={dynamicContainerStyle} pointerEvents="box-none">
                    <Animated.View
                        style={[styles.modalContainer, containerStyle]}
                        renderToHardwareTextureAndroid={true}>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Close modal"
                            testID="animated_modal_backdrop_clicked"
                            onPress={handleClose}
                            disabled={!allowCloseOnBackdropPress}
                            style={StyleSheet.absoluteFill}>
                            {Platform.OS === 'ios' ? (
                                <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
                                    <BlurView
                                        style={StyleSheet.absoluteFill}
                                        blurType="extraDark"
                                        blurAmount={5}
                                        ignoreSafeArea={true}
                                    />
                                </Animated.View>
                            ) : (
                                <Animated.View
                                    style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }, backdropStyle]}
                                    renderToHardwareTextureAndroid={true}
                                />
                            )}
                        </Pressable>
                        {showCloseButton && (
                            <Animated.View style={modalContentStyle}>
                                <Pressable
                                    onPress={handleClose}
                                    accessibilityLabel="Close modal"
                                    hitSlop={12}
                                    accessibilityRole="button"
                                    testID="close_modal_button">
                                    <View style={styles.closeButtonCircle}>
                                        <Text style={styles.closeButtonText}>×</Text>
                                    </View>
                                </Pressable>
                            </Animated.View>
                        )}
                        <Animated.View
                            style={[
                                styles.modalContent,
                                contentStyle,
                                reducedMotion ? modalContentStyleWithoutAnimation : modalContentStyle,
                            ]}
                            entering={Platform.OS == 'android' ? FadeIn.duration(animationDuration) : undefined}
                            exiting={Platform.OS == 'android' ? FadeOut.duration(animationDuration) : undefined}
                            renderToHardwareTextureAndroid={true}>
                            {children}
                        </Animated.View>
                    </Animated.View>
                </Animated.View>
            </Portal>
        );
    },
);

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    closeButtonCircle: {
        width: 54,
        height: 48,
        borderRadius: 32,
        marginBottom: 12,
        backgroundColor: '#202020',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 6,
    },
    closeButtonText: {
        color: 'white',
        fontSize: 32,
        fontWeight: '400',
        lineHeight: 36,
        textAlign: 'center',
    },
    modalContent: {
        width: '100%',
        backgroundColor: 'white',
        padding: 0,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
});
