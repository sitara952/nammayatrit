import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';
import { SCREEN_HEIGHT, SCREEN_WIDTH } from '@gorhom/bottom-sheet';
import { LottieWithFallback } from '@/typescript/components/common/LottieWithFallback';
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, useAnimatedStyle } from 'react-native-reanimated';

interface AnimatedNammaTransitLottieProps {
    sheetAnimatedPosition: Animated.SharedValue<number>;
    windowHeight: number;
}

export const AnimatedNammaTransitLottie: React.FC<AnimatedNammaTransitLottieProps> = ({ sheetAnimatedPosition }) => {
    const { top } = useSafeAreaInsets();

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: sheetAnimatedPosition.value - 780,
                },
            ],
        };
    });
    return (
        <Animated.View
            style={[styles.container, { top: top + 20 }, animatedStyle]}
            entering={SlideInDown.springify().damping(50).stiffness(400)}
            exiting={SlideOutDown.springify().damping(50).stiffness(400)}>
            <LottieWithFallback
                source={require('@/src-v2/assets/lottie/namma_transit.lottie')}
                autoPlay
                loop={false}
                style={styles.lottie}
                fallback={undefined}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
        zIndex: -100, // Below bottom sheet
        pointerEvents: 'none',
    },
    lottie: {
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 1.25,
    },
});
