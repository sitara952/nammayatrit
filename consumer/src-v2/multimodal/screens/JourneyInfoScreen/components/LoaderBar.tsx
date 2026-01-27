import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BAR_WIDTH = 70; // Width of the moving bar

export default function LoaderBar() {
    const translateX = useSharedValue(0);

    useEffect(() => {
        translateX.value = withRepeat(
            withTiming(SCREEN_WIDTH - BAR_WIDTH, {
                duration: 500,
                easing: Easing.inOut(Easing.ease),
            }),
            -1,
            true, // Reverse on repeat
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.bar, animatedStyle]} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F7F7F7',
        overflow: 'hidden',
    },
    bar: {
        width: BAR_WIDTH,
        height: 4,
        backgroundColor: 'green',
        borderRadius: 2,
    },
});
