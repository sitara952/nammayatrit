import React, { useEffect } from 'react';
import { AnimatedCircle } from './AnimatedCircle';
import {
    Easing,
    interpolate,
    useAnimatedProps,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { latLng } from '../../helpers/externalModules/GMap/ReactMap.gen';

interface Props {
    initialRadius: number;
    radiusIncreament: number;
    initialStrokeWidth: number;
    strokeWidthIncreament: number;
    startingDelay: number;
    strokeColor: string;
    endingDelay: number;
    animationDuration: number;
    location: latLng | null;
}

export const RippleCircle: React.FC<Props> = (props): React.ReactElement => {
    const radius = useSharedValue(props.initialRadius);
    const strokeWidth = useSharedValue(props.initialStrokeWidth);

    const animatedProps = useAnimatedProps(() => {
        const newRadius = interpolate(radius.value, [0, 1], [0, 1]);
        const newStrokeWidth = interpolate(strokeWidth.value, [0, 1], [0, 1]);
        return {
            radius: newRadius,
            strokeWidth: newStrokeWidth,
        };
    });

    useEffect(() => {
        radius.value = withDelay(
            props.startingDelay,
            withRepeat(
                withSequence(
                    withTiming(props.initialRadius + props.radiusIncreament, {
                        duration: props.animationDuration,
                        easing: Easing.inOut(Easing.circle),
                    }),
                    withTiming(props.initialRadius, {
                        duration: props.animationDuration,
                        easing: Easing.inOut(Easing.circle),
                    }),
                    withTiming(props.initialRadius, {
                        duration: props.endingDelay,
                    }),
                ),
                -1,
            ),
        );
        strokeWidth.value = withDelay(
            props.startingDelay,
            withRepeat(
                withSequence(
                    withTiming(props.initialStrokeWidth + props.strokeWidthIncreament, {
                        duration: props.animationDuration,
                        easing: Easing.inOut(Easing.circle),
                    }),
                    withTiming(props.initialStrokeWidth, {
                        duration: props.animationDuration,
                        easing: Easing.inOut(Easing.circle),
                    }),
                    withTiming(props.initialStrokeWidth, {
                        duration: props.endingDelay,
                    }),
                ),
                -1,
            ),
        );
    }, []);

    return (
        <AnimatedCircle
            animatedProps={animatedProps}
            /* eslint-disable-next-line myCustomPlugin/no-as-in-modified-files */
            center={props.location ?? ({ latitude: 12.94216, longitude: 77.62207 } as latLng)}
            radius={props.initialRadius}
            strokeWidth={props.initialStrokeWidth}
            strokeColor={props.strokeColor}
            zIndex={-99}
        />
    );
};
