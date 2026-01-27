import { pointersViewProps } from '../Types';
import React from 'react';
import { tailwind } from '@/src-v2/tailwind-theme/tailwind';
import Typography from '../../../../src/typescript/designSystem/components/primitives/Typography';
import Animated from 'react-native-reanimated';
export const PointersView = ({ pointerColor = '#5B6777', pointerIcon, description }: pointersViewProps) => {
    return (
        <Animated.View style={tailwind.style('py-[6px]')}>
            <Animated.View style={tailwind.style('flex flex-row ')}>
                <Animated.View style={tailwind.style('mx-[6px] mt-[8px]')}>{pointerIcon}</Animated.View>
                <Typography
                    type="body"
                    style={tailwind.style(`text-[${pointerColor}]`)}
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {description}
                </Typography>
            </Animated.View>
        </Animated.View>
    );
};
