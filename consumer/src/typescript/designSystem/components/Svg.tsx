import React, { isValidElement, useEffect } from 'react';
import Animated, { interpolate, useAnimatedProps, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { ClipPath, Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { IContentLoaderProps } from './ContentLoader';
import { useSharedValue } from 'react-native-reanimated';

const uid = (): string => Math.random().toString(36).substring(6);

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const NativeSvg = (props: IContentLoaderProps) => {
    const {
        animate = true,
        backgroundColor = '#f5f6f7',
        backgroundOpacity = 1,
        foregroundColor = '#eee',
        foregroundOpacity = 1,
        rtl = false,
        speed = 1.2,
        interval = 0.25,
        style = {},
        beforeMask = null,
    } = props;
    const animatedValue = useSharedValue(-1);

    const fixedId = props.uniqueKey || uid();

    const idClip = `${fixedId}-diff`;

    const idGradient = `${fixedId}-animated-diff`;

    const animatedProps = useAnimatedProps(() => {
        const x1 = interpolate(animatedValue.get(), [-1, 2], [-1, 1], 'clamp');
        const x2 = interpolate(animatedValue.get(), [-1, 2], [0, 2], 'clamp');
        return {
            x1: `${x1 * 100}%`,
            x2: `${x2 * 100}%`,
        };
    });

    useEffect(() => {
        if (animate) {
            // props.speed is in seconds as it is compatible with web
            // convert to milliseconds
            const durMs = speed * 1000;
            const delay = durMs * interval;
            animatedValue.value = withRepeat(
                withDelay(
                    delay,
                    withTiming(2, {
                        duration: durMs,
                    }),
                ),
                -1,
            );
        }
    }, [animate, interval, speed]);

    const rtlStyle: object = rtl ? { transform: [{ rotateY: '180deg' }] } : {};
    const svgStyle = Object.assign(Object.assign({}, style), rtlStyle);

    return (
        <Svg style={svgStyle} {...props}>
            {beforeMask && isValidElement(beforeMask) ? beforeMask : null}

            <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${idClip})`} clipPath={`url(#${idGradient})`} />

            <Defs>
                <ClipPath id={idGradient}>{props.children}</ClipPath>

                <AnimatedLinearGradient id={idClip} y1={0} y2={0} animatedProps={animatedProps}>
                    <Stop offset={0} stopColor={backgroundColor} stopOpacity={backgroundOpacity} />
                    <Stop offset={0.5} stopColor={foregroundColor} stopOpacity={foregroundOpacity} />
                    <Stop offset={1} stopColor={backgroundColor} stopOpacity={backgroundOpacity} />
                </AnimatedLinearGradient>
            </Defs>
        </Svg>
    );
};

export default NativeSvg;
