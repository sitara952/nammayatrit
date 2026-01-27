import React from 'react';
import { Platform, View } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';
import MapMarkerDot from '../components/svg/MapMarkerDot';
import { tailwind } from '../tailwindTheme/tailwind';
import CurrentLocationMarkerSvg from './CurrentLocationMarkerSvg';
import { useAppSelector } from '../state/hooks';
import { selectAppConfig } from '../state/client/session';

// Spring animation config to prevent bouncing
const springConfig = {
    damping: 30,
    stiffness: 200,
    mass: 1,
    overshootClamping: true,
    restDisplacementThreshold: 0.01,
    restSpeedThreshold: 0.01,
};

type AnimatedPickupMarkerProps = {
    isMoved: boolean | undefined;
    markerRingColor: string | undefined;
};

const AnimatedPickupMarker = ({ isMoved }: AnimatedPickupMarkerProps): React.JSX.Element => {
    const appConfig = useAppSelector(selectAppConfig);
    const markerColor = appConfig.uiConfig.currentLocationMarkerColor;

    const mapPinIconValue = useDerivedValue(() => {
        return isMoved ? withSpring(-10, springConfig) : withSpring(0, springConfig);
    });

    const pinAnimatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: mapPinIconValue.value }],
        };
    });

    return (
        <View style={tailwind.style('items-center relative')}>
            <Animated.View
                style={[
                    tailwind.style(`absolute ${Platform.OS === 'ios' ? 'top-3' : ''} `, {
                        opacity: isMoved ? 1 : 0,
                    }),
                ]}>
                <MapMarkerDot color="#BFBFBF" />
            </Animated.View>

            <Animated.View
                style={[
                    pinAnimatedStyle,
                    tailwind.style(`absolute ${Platform.OS === 'ios' ? 'top-[-14]' : 'top-[-18]'}`),
                ]}>
                <CurrentLocationMarkerSvg width={100} height={90} fill={markerColor} />
            </Animated.View>
        </View>
    );
};

export default AnimatedPickupMarker;
