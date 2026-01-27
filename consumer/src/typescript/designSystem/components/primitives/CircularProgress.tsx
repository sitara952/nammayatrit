import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedProps,
    interpolate,
    FadeIn,
    LinearTransition,
    SharedValue,
} from 'react-native-reanimated';
import Svg, { Circle, G } from 'react-native-svg';
import { tailwind } from '@/typescript/tailwindTheme/tailwind';
import { ChildrenType } from '../../../types/CommonTypes';
import colors from '../../colorPalette';
import { useAppSelector } from '@/typescript/state/hooks';
import { selectCustomerTip, selectVehicleChanged } from '@/typescript/state/client/search';

import { useConfigContext } from '@/typescript/context/ConfigContext';

export interface CircularProgressProps {
    value?: number | null;
    min?: number;
    max?: number;
    style?: StyleProp<ViewStyle>;
    children?: ChildrenType;
    animatedProgressRef: SharedValue<number>;
    filledColor?: string;
    unFilledColor?: string;
    strokeWidth?: number;
}

const circularProgressBoxDimensions = {
    width: 100,
    height: 100,
};

const radius = 44;
const circleCircumference = 2 * Math.PI * radius;

// Create animated circle component
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CircularProgress = ({
    min = 0,
    max = 100,
    strokeWidth = 4,
    style,
    children,
    animatedProgressRef,
    filledColor,
    unFilledColor = colors?.primitive?.gray?.[3],
}: CircularProgressProps) => {
    const configManager = useConfigContext();
    const themeColors = configManager.get('themeColors');
    const customerTip = useAppSelector(state => selectCustomerTip(state, null));
    const vehicleChanged = useAppSelector(state => selectVehicleChanged(state, null));
    const progress = animatedProgressRef;

    const animatedCircleProps = useAnimatedProps(() => {
        const strokeDashoffset = interpolate(progress.value, [min, max], [circleCircumference, 0]);
        return {
            strokeDashoffset,
        };
    });

    return (
        <Animated.View
            entering={FadeIn}
            layout={LinearTransition.springify().damping(500).stiffness(1000)}
            style={[circularProgressBoxDimensions, style]}>
            <Animated.View style={tailwind.style('w-[130px] h-[130px]  absolute rounded-full')} />
            <Svg width="100%" height="100%" viewBox={'0 0 100 100'}>
                <G rotation={'-90'} origin="50, 50">
                    <Circle
                        stroke={unFilledColor}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={radius}
                        cx={50}
                        cy={50}
                    />
                    <AnimatedCircle
                        stroke={`${
                            filledColor
                                ? filledColor
                                : customerTip || vehicleChanged
                                  ? themeColors.Icon_positive
                                  : themeColors.APP_THEME_COLOR
                        }`}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        r={radius}
                        cx={50}
                        cy={50}
                        strokeDasharray={circleCircumference}
                        animatedProps={animatedCircleProps}
                    />
                    {children}
                </G>
            </Svg>
        </Animated.View>
    );
};

export default CircularProgress;
