import React, { FC, useState } from 'react';
import { AnimatedStyle, useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';
import { StyleProp, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from '@/typescript/hooks/safeAreaInsets';

// Spring animation config to prevent bouncing
const springConfig = {
    damping: 30,
    stiffness: 200,
    mass: 1,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
};

const PickLocationIcon = (): React.JSX.Element => {
    const { top } = useSafeAreaInsets();
    const [isMapDragged] = useState(false);
    type AnimatedMapPinIconProps = {
        animatedStyle: StyleProp<AnimatedStyle<StyleProp<ViewStyle>>>;
    };

    const AnimatedMapPinIcon: FC<AnimatedMapPinIconProps> = () => (
        <View
            style={{
                borderWidth: 2,
                borderRadius: 50,
            }}></View>
    );
    const mapPinIconValue = useDerivedValue(
        () => (isMapDragged ? withSpring(-10, springConfig) : withSpring(0, springConfig)),
        [isMapDragged],
    );

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: mapPinIconValue.value }],
        };
    });
    return (
        <View
            style={{
                paddingTop: top,
                width: '100%',
                height: '100%',
                position: 'absolute',
                alignItems: 'center',
                justifyContent: 'center',
            }}
            pointerEvents="none">
            <AnimatedMapPinIcon {...{ animatedStyle }} />
        </View>
    );
};

export default PickLocationIcon;
