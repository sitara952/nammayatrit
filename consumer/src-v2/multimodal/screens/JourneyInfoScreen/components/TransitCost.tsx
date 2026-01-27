import ContentLoader from '@/typescript/designSystem/components/ContentLoader';
import React from 'react';
import AnimateableText from 'react-native-animateable-text';
import Animated, { LinearTransition, useAnimatedProps, useDerivedValue } from 'react-native-reanimated';
import { Rect } from 'react-native-svg';
import { tailwind } from '../../../../tailwind-theme/tailwind';

interface TransitCostProps {
    cost?: number | null;
    numberColor?: string;
    rupeeColor?: string;
    textSize?: string;
}

export const TransitCost = (props: TransitCostProps) => {
    const { cost, numberColor = '#7B8997', rupeeColor = '#7B8997', textSize } = props;
    const costValue = useDerivedValue(() => (cost ? `${cost}` : `0`), [cost]);

    const animatedProps = useAnimatedProps(() => {
        return {
            text: costValue.value,
        };
    });

    return (
        <Animated.View
            layout={LinearTransition.springify().damping(30).stiffness(200)}
            style={tailwind.style('flex-row items-end justify-end')}
            accessible={false}
            accessibilityElementsHidden={true}
            importantForAccessibility="no-hide-descendants">
            {typeof cost === 'number' ? (
                <>
                    <Animated.Text
                        accessible={false}
                        style={tailwind.style(
                            `text-[15px] leading-[15px] max-h-[14px] font-inter-regular text-[${rupeeColor}]`,
                        )}>
                        ₹{' '}
                    </Animated.Text>
                    <AnimateableText
                        animatedProps={animatedProps}
                        style={[
                            tailwind.style(
                                'text-[24px] max-h-[25px] leading-[28px] font-areaNormal-bold',
                                `text-[${numberColor}]`,
                                textSize,
                            ),
                        ]}
                    />
                </>
            ) : (
                <Animated.View style={tailwind.style('flex-1 justify-end items-end')}>
                    <ContentLoader style={tailwind.style('flex-1 justify-end items-end')} height={40} width={40}>
                        <Rect x="0" y="0" rx="6" ry="6" width="40" height="40" />
                    </ContentLoader>
                </Animated.View>
            )}
        </Animated.View>
    );
};
