import React from 'react';
import Animated, { interpolate, interpolateColor, SharedValue, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import colors from '../../designSystem/colorPalette';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type NammaYatriIconTypes = {
    animatedSharedValue: SharedValue<number> | undefined;
    fillColorUp: string;
    fillColorDown: string;
};

export const NammaYatriLogo = ({
    fillColorUp = '#14171F',
    fillColorDown = '#14171F',
    animatedSharedValue,
}: NammaYatriIconTypes) => {
    const animateOpacity = interpolate(animatedSharedValue?.value ?? 0, [0, 0.9, 1], [1, 0.9, 1]);

    const topAnimatedProps = useAnimatedProps(() => {
        return {
            fill: interpolateColor(
                animatedSharedValue?.value ?? 0,
                [0, 0.9, 1],
                [`${fillColorUp}`, `${fillColorUp}`, `${colors.primitive.gray[13]}`],
            ),
            fillOpacity: animateOpacity,
        };
    });
    const bottomAnimatedProps = useAnimatedProps(() => {
        return {
            fill: interpolateColor(
                animatedSharedValue?.value ?? 0,
                [0, 0.9, 1],
                [`${fillColorDown}`, `${fillColorDown}`, `${colors.primitive.gray[13]}`],
            ),
            fillOpacity: animateOpacity,
        };
    });
    return (
        <Svg width={'100%'} height={'100%'} viewBox="0 0 20 20" fill="none">
            <AnimatedPath
                d="M3.12104 0.828125H0.644531V7.6021H3.12104V0.828125Z"
                fill={fillColorUp}
                animatedProps={topAnimatedProps}
            />
            <AnimatedPath
                d="M15.9246 17.1709L18.4011 17.1709L18.4011 10.3969L15.9246 10.3969L15.9246 17.1709Z"
                fill={fillColorDown}
                animatedProps={bottomAnimatedProps}
            />
            <AnimatedPath
                d="M4.89344 4.35412C6.13008 3.11749 7.77461 2.43604 9.52273 2.43604C11.2709 2.43604 12.9154 3.11749 14.152 4.35412C15.0568 5.25894 15.6638 6.38065 15.9244 7.60272H18.4009C18.1128 5.72834 17.242 3.99802 15.8742 2.6319C14.1795 0.933951 11.9232 0 9.52273 0C7.1223 0 4.86754 0.933951 3.17122 2.6319C1.80347 3.99802 0.932648 5.72834 0.644531 7.60272H3.12104C3.38164 6.38065 3.98863 5.25894 4.89344 4.35412Z"
                fill={fillColorUp}
                animatedProps={topAnimatedProps}
            />
            <AnimatedPath
                d="M14.1522 13.6459C12.9156 14.8825 11.271 15.564 9.52292 15.564C7.7748 15.564 6.13027 14.8825 4.89363 13.6459C3.98882 12.7411 3.38183 11.6193 3.12123 10.3973L0.644725 10.3973C0.932841 12.2717 1.80367 14.002 3.17141 15.3681C4.86612 17.066 7.12249 18 9.52292 18C11.9234 18 14.1781 17.066 15.8744 15.3681C17.2422 14.002 18.113 12.2717 18.4011 10.3973L15.9246 10.3973C15.664 11.6194 15.057 12.7411 14.1522 13.6459Z"
                fill={fillColorDown}
                animatedProps={bottomAnimatedProps}
            />
        </Svg>
    );
};
