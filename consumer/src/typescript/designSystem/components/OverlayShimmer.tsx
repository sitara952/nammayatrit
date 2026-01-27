import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    interpolate,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';

interface ShimmerData {
    start: number;
    end: number;
    lineHeight: number;
    delay: number;
    duration: number;
}
const OverlayShimmer = (props: ShimmerData) => {
    const { start = -60, end = 100, lineHeight = 50, delay = 300, duration = 2500 } = props;
    const animatedValue = useSharedValue(-1);
    const animatedLineStyle = useAnimatedStyle(() => {
        const translateX = interpolate(animatedValue.value, [-1, 1], [start, end], 'clamp');
        return {
            transform: [{ translateX }, { rotate: '24deg' }],
        };
    });

    useEffect(() => {
        animatedValue.value = withRepeat(
            withDelay(
                delay,
                withTiming(1, {
                    duration: duration,
                    easing: Easing.linear,
                }),
            ),
            -1,
            false,
        );
    }, []);

    return (
        <Animated.View style={tailwind.style('absolute flex flex-row')}>
            <Animated.View style={[styles.slantedLineLarge, animatedLineStyle, { height: lineHeight }]} />
            <Animated.View
                style={[styles.slantedLineSmall, animatedLineStyle, tailwind.style('ml-[4px]'), { height: lineHeight }]}
            />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    slantedLineLarge: {
        width: 9,
        alignContent: 'center',
        justifyContent: 'center',
        opacity: 0.6,
        backgroundColor: 'white',
    },
    slantedLineSmall: {
        width: 3,
        alignContent: 'center',
        justifyContent: 'center',
        opacity: 0.6,
        backgroundColor: 'white',
    },
});

export default OverlayShimmer;
