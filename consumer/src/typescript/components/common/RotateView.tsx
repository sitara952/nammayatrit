import React from 'react';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

type RotateViewProps = { children: React.ReactElement };

const RotateView = ({ children }: RotateViewProps) => {
    const rotation = useSharedValue(0);

    // Start rotating on mount
    React.useEffect(() => {
        rotation.value = withRepeat(withTiming(360, { duration: 2000 }), -1); // Continuous rotation
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${rotation.value}deg` }],
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
};

export default RotateView;
