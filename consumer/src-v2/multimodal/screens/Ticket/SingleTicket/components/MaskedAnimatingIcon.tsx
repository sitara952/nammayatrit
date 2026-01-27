import MaskedView from '@react-native-masked-view/masked-view';
import { useEffect } from 'react';
import Animated, {
    Easing,
    FadeIn,
    SensorType,
    useAnimatedSensor,
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';
import mtIcMaskTicket from '../../../../../assets/mt_ic_mask_ticket.png';
import { tailwind } from '../../../../../tailwind-theme/tailwind';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectAppConfig } from '@/typescript/state/client/session';

const AnimatedMaskedView = Animated.createAnimatedComponent(MaskedView);

export const MaskedAnimatingIcon = () => {
    const rotate = useSharedValue(0);
    // Use gyroscope sensor
    const { sensor, isAvailable } = useAnimatedSensor(SensorType.ROTATION, {
        interval: 'auto',
    });

    const reduceMotion = useReducedMotion();

    // Now inside useAnimatedStyle (or rendering logic):
    const useSensor = isAvailable && !reduceMotion;

    useEffect(() => {
        if (!useSensor) {
            rotate.value = withRepeat(withTiming(360, { duration: 7500, easing: Easing.inOut(Easing.ease) }), -1, true);
        }
    }, [useSensor]);

    const sensorAnimatedStyle = useAnimatedStyle(() => {
        if (!useSensor) {
            return {
                transform: [{ rotate: `${rotate.value}deg` }],
            };
        }
        const { qw, qx, qy, qz } = sensor.value;

        // Roll (left/right tilt)
        const sinr_cosp = 2 * (qw * qy + qz * qx);
        const cosr_cosp = 1 - 2 * (qx * qx + qy * qy);
        const roll = Math.atan2(sinr_cosp, cosr_cosp);

        // Pitch (up/down tilt)
        const sinp = 2 * (qw * qx - qy * qz);
        const pitch = Math.abs(sinp) >= 1 ? (Math.sign(sinp) * Math.PI) / 2 : Math.asin(sinp);

        // Combine both into a single Z rotation
        const combined = (roll - pitch) * (180 / Math.PI); // scale down if needed

        return {
            transform: [{ rotateZ: `${combined + 35}deg` }],
        };
    });

    const appConfig = useAppSelector(selectAppConfig);

    return (
        <AnimatedMaskedView
            entering={FadeIn.duration(350)}
            style={[
                tailwind.style('h-[118px] w-[118px] z-0 absolute opacity-60 overflow-hidden -top-[32px] right-0.5'),
            ]}
            maskElement={
                <Animated.Image
                    accessible={true}
                    accessibilityLabel="mask ticket image"
                    source={{ uri: appConfig.assets.maskedIconUri }}
                    entering={FadeIn.duration(350)}
                    style={[
                        tailwind.style(`h-[120px] w-[120px] ${appConfig.appType === 'multimodal' ? '-rotate-3' : ''}`),
                    ]}
                    resizeMode="contain"
                />
            }>
            <Animated.View
                entering={FadeIn.duration(350)}
                style={[tailwind.style('h-[400px] w-[400px] overflow-hidden')]}>
                <Animated.Image
                    entering={FadeIn.duration(350)}
                    accessible={false}
                    source={mtIcMaskTicket}
                    style={[
                        tailwind.style('h-[400px] w-[400px]'),
                        {
                            marginLeft: -400 / 2,
                            marginTop: -400 / 2,
                        },
                        sensorAnimatedStyle,
                    ]}
                    resizeMode="cover"
                />
            </Animated.View>
        </AnimatedMaskedView>
    );
};
