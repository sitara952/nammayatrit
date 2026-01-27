import React, { PropsWithChildren, useEffect } from 'react';
import { ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSpring } from 'react-native-reanimated';

export const TranslateXLoop = ({ children, ...props }: PropsWithChildren<ViewProps>) => {
    const { style, ...otherProps } = props;
    const arrowPosition = useSharedValue(0);

    useEffect(() => {
        arrowPosition.value = withRepeat(withSpring(10, { damping: 34, stiffness: 240 }), -1, true);
    }, []);

    const arrowAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: arrowPosition.value }],
        };
    });
    return (
        <Animated.View {...otherProps} style={[style, arrowAnimatedStyle]}>
            {children}
        </Animated.View>
    );
};
