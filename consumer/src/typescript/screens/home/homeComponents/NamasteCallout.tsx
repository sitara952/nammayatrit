import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Typography from '@/typescript/designSystem/components/primitives/Typography';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

const NamasteCallout: React.FC = () => {
    const animationProgress = useSharedValue(0);

    useEffect(() => {
        animationProgress.value = withSequence(
            withTiming(1, { duration: 500 }), // Fade in
            withDelay(5000, withTiming(2, { duration: 500 })), // Stay for 5s then Fade out
        );
    }, []);

    const calloutStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animationProgress.value, [0, 1, 1.5, 2], [0, 1, 1, 0], Extrapolate.CLAMP);
        const scale = interpolate(animationProgress.value, [0, 1, 1.5, 2], [0.9, 1, 1, 0.9], Extrapolate.CLAMP);
        return {
            opacity,
            transform: [{ scale }],
        };
    });

    const handleStyle = useAnimatedStyle(() => {
        const opacity = interpolate(animationProgress.value, [0, 1.5, 2], [0, 0, 1], Extrapolate.CLAMP);
        const scale = interpolate(animationProgress.value, [0, 1.5, 2], [0.5, 0.5, 1], Extrapolate.CLAMP);
        return {
            opacity,
            transform: [{ scale }],
        };
    });

    const width = 120;
    const height = 28;
    const slant = 5;
    const strokeWidth = 24; // Increased from 8 for more corner radius

    // Trapezoid path: Move to (slant, 0) -> Line to (width-slant, 0) -> Line to (width, height) -> Line to (0, height) -> Close
    const d = `M${slant},0 L${width - slant},0 L${width},${height} L0,${height} Z`;

    return (
        <View style={styles.container} pointerEvents="box-none">
            <View style={styles.innerContainer}>
                <View style={StyleSheet.absoluteFill}>
                    <Svg
                        width={width + strokeWidth}
                        height={height + strokeWidth}
                        viewBox={`-${strokeWidth / 2} -${strokeWidth / 2} ${width + strokeWidth} ${height + strokeWidth}`}>
                        <Path d={d} fill="#F8F8F8" stroke="#F8F8F8" strokeWidth={strokeWidth} strokeLinejoin="round" />
                    </Svg>
                </View>
                <Animated.View style={[styles.textContainer, calloutStyle]}>
                    <Typography
                        type="body-8"
                        style={[tailwind.style('font-bold'), { color: '#4D4B51' }]}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        {'Namaste '}
                    </Typography>
                    <Typography
                        type="body-8"
                        style={[]}
                        numberOfLines={1}
                        isAnimate={undefined}
                        accessible={undefined}
                        accessibilityLabel={undefined}
                        accessibilityRole={undefined}>
                        🙏
                    </Typography>
                </Animated.View>
                <Animated.View style={[styles.handle, handleStyle]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: -40, // Adjusted for larger stroke height
        left: 0,
        right: 0,
        zIndex: 100,
    },
    innerContainer: {
        width: 120 + 24, // width + strokeWidth
        height: 28 + 12, // height + strokeWidth / 2
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    textContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    handle: {
        position: 'absolute',
        height: 4,
        width: 50,
        borderRadius: 2,
        backgroundColor: '#dedee0',
        top: 18, // Vertically centered within the 28+12 height
    },
});

export default NamasteCallout;
