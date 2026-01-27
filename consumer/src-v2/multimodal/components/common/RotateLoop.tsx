import React, { PropsWithChildren } from 'react';
import { ViewProps } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { withAnchorPoint } from '../../../utils/withAnchorPoint';

interface RotateLoopProps extends ViewProps {
    size: number;
}

export const RotateLoop = ({ children, ...props }: PropsWithChildren<RotateLoopProps>) => {
    const { style, size, ...otherProps } = props;
    const rotation = useSharedValue(0);

    React.useEffect(() => {
        rotation.value = withRepeat(
            withTiming(rotation.value + 1, {
                duration: 1350,
                easing: Easing.bezier(0, 0, 0.58, 1),
            }),
            -1,
            false,
        );
    }, []);

    const arrowAnimatedStyle = useAnimatedStyle(() => {
        const transforms = withAnchorPoint(
            {
                transform: [{ rotate: `${rotation.value * 360}deg` }],
            },
            { x: 1, y: 0.5 },
            { width: size, height: size },
        );
        return { ...transforms };
    });
    return (
        <Animated.View {...otherProps} style={[style, arrowAnimatedStyle]}>
            {children}
        </Animated.View>
    );
};
