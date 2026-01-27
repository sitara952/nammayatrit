import React, { useEffect } from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

function LoadingSpinner() {
    const rotation = useSharedValue(0);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 2000,
                easing: Easing.linear,
            }),
            -1,
            false,
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotate: `${rotation.value}deg`,
                },
            ],
        };
    });

    return (
        <Animated.View>
            <Svg width="100%" height="100%" viewBox="0 0 44 44" fill="none">
                <Path
                    d="M44 22c0 12.15-9.85 22-22 22S0 34.15 0 22 9.85 0 22 0s22 9.85 22 22zM6.6 22c0 8.49 6.91 15.4 15.4 15.4 8.49 0 15.4-6.91 15.4-15.4 0-8.49-6.91-15.4-15.4-15.4-8.49 0-15.4 6.91-15.4 15.4z"
                    fill="#E7E7E7"
                />
                <Animated.View style={[{ position: 'absolute' }, animatedStyle]}>
                    <Svg width={22} height={22} viewBox="0 0 44 44" fill="none">
                        <Path
                            d="M22 4.4c0-1.215.987-2.211 2.196-2.09A19.8 19.8 0 0141.69 19.804C41.811 21.013 40.815 22 39.6 22c-1.215 0-2.186-.989-2.337-2.194A15.402 15.402 0 0026.394 6.737C25.19 6.586 22 5.615 22 4.4z"
                            fill="#656565"
                        />
                    </Svg>
                </Animated.View>
            </Svg>
        </Animated.View>
    );
}

export default LoadingSpinner;
