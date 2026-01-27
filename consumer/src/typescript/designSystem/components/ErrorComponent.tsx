import React from 'react';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { tailwind } from '../../tailwindTheme/tailwind';
import token from '../tokens';
import Typography from './primitives/Typography';
import CustomReanimatedImage from '@/typescript/components/common/CustomAnimatedImage';

export interface ErrorComponentProps {
    asset: string | undefined;
    title: string;
    description: string;
    height: string;
    width: string;
    accessible: boolean;
}

export const ErrorComponent = (props: ErrorComponentProps) => {
    const { asset, title, description, height, width, accessible } = props;
    return (
        <Animated.View
            layout={LinearTransition.springify().damping(28).stiffness(240)}
            entering={FadeIn.springify().damping(28).stiffness(240)}
            exiting={FadeOut.springify().damping(28).stiffness(240)}
            style={tailwind.style('sticky top-40 flex justify-center items-center')}
            accessibilityElementsHidden={accessible}
            importantForAccessibility={accessible ? 'no-hide-descendants' : 'yes'}>
            {asset && (
                <Animated.View style={tailwind.style(`h-[${height}px] w-[${width}px]`)}>
                    <CustomReanimatedImage
                        cacheKey={title}
                        source={{ uri: asset }}
                        resizeMode={'contain'}
                        style={tailwind.style('h-full w-full')}
                    />
                </Animated.View>
            )}
            <Animated.View style={tailwind.style('flex justify-center items-center pt-2.5')}>
                <Typography
                    style={tailwind.style(`text-[${token?.text['text-highContrast']}]`)}
                    type="subhead-1"
                    numberOfLines={undefined}
                    isAnimate={undefined}
                    accessible={undefined}
                    accessibilityLabel={undefined}
                    accessibilityRole={undefined}>
                    {title}
                </Typography>
                <Typography
                    type="body-1"
                    style={tailwind.style(`text-[${token?.text['text-weak']}] pt-2 text-center`)}
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
