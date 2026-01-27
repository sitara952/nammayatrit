import React, { PropsWithChildren, useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

export const FadeLoop = ({ children, ...props }: PropsWithChildren<ViewProps>) => {
    const { style, ...otherProps } = props;
    const opacity = useSharedValue(1);

    useEffect(() => {
        opacity.value = withRepeat(withTiming(0.3, { duration: 1000 }), -1, true);
    }, []);

    const fadeAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
        };
    });

    return (
        <Animated.View {...otherProps} style={[style, fadeAnimatedStyle]}>
            {children}
        </Animated.View>
    );
};
